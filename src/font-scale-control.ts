import { MarkdownView, setIcon } from 'obsidian';
import { computePanelPosition } from './positioning';
import {
  ReadingAnnotationController,
  type ReadingAnnotationState,
} from './reading-annotation';
import { ScaleController } from './scale-controller';
import { ScaleStore } from './scale-store';
import {
  CONTROL_SCALE_FACTORS,
  CONTROL_SCALES,
  CONTROL_SIDES,
  CONTROL_VERTICAL_POSITIONS,
  scaleLimits,
} from './settings-model';
import { ZenModeController } from './zen-mode-controller';

const PANEL_ID = 'oa-font-scale-panel';
const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';
const BASE_RANGE_THUMB_SIZE = 22;
const BASE_RANGE_TOUCH_RADIUS = 20;
const MINIMUM_RANGE_TOUCH_RADIUS = 12;
const TRIGGER_IDLE_DELAY_MS = 2_000;

interface RangeDragState {
  pointerId: number;
  grabOffset: number;
}

/*! Material Design icon "accessibility_new" Copyright Google LLC, Apache-2.0. */
const ACCESSIBILITY_LAUNCHER_PATH =
  'M20.75 6.99c-.14-.55-.69-.87-1.24-.75C17.13 6.77 14.48 7 12 7s-5.13-.23-7.51-.76c-.55-.12-1.1.2-1.24.75-.14.56.2 1.13.75 1.26 1.61.36 3.35.61 5 .75v12c0 .55.45 1 1 1s1-.45 1-1v-5h2v5c0 .55.45 1 1 1s1-.45 1-1V9c1.65-.14 3.39-.39 4.99-.75.56-.13.9-.7.76-1.26zM12 6c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z';

function appendAccessibilityLauncherIcon(container: HTMLElement): void {
  const svg = container.ownerDocument.createElementNS(SVG_NAMESPACE, 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  svg.dataset.oaIcon = 'accessibility-new-filled';

  const path = container.ownerDocument.createElementNS(SVG_NAMESPACE, 'path');
  path.setAttribute('d', ACCESSIBILITY_LAUNCHER_PATH);
  path.setAttribute('fill', 'currentColor');
  svg.append(path);
  container.append(svg);
}

export class FontScaleControl {
  private readonly root: HTMLDivElement;
  private readonly trigger: HTMLButtonElement;
  private readonly panel: HTMLElement;
  private readonly modeLabel: HTMLDivElement;
  private readonly zenModeButton: HTMLButtonElement;
  private readonly annotationButton: HTMLButtonElement;
  private readonly markButton: HTMLButtonElement;
  private readonly eraseButton: HTMLButtonElement;
  private readonly increaseButton: HTMLButtonElement;
  private readonly decreaseButton: HTMLButtonElement;
  private readonly resetButton: HTMLButtonElement;
  private readonly statusLive: HTMLDivElement;
  private readonly rangeFrame: HTMLDivElement;
  private readonly range: HTMLInputElement;
  private readonly abortController = new AbortController();
  private readonly unsubscribe: () => void;
  private readonly unsubscribeZenMode: () => void;
  private readonly unsubscribeAnnotation: () => void;
  private rangeDrag: RangeDragState | null = null;
  private idleTimer: number | null = null;
  private lastAnnotationMessage = '';
  private opened = false;

  constructor(
    private readonly view: MarkdownView,
    private readonly store: ScaleStore,
    private readonly controller: ScaleController,
    private readonly zenMode: ZenModeController,
    private readonly annotation: ReadingAnnotationController,
  ) {
    const doc = view.containerEl.ownerDocument;
    this.root = view.containerEl.createDiv({ cls: 'oa-font-scale-root' });

    this.trigger = this.root.createEl('button', {
      cls: 'oa-font-scale-trigger',
      attr: {
        type: 'button',
        'aria-expanded': 'false',
        'aria-controls': PANEL_ID,
        'aria-label': 'Abrir controles de acessibilidade',
        title: 'Abrir controles de acessibilidade',
      },
    });
    const triggerIcon = this.trigger.createSpan({ cls: 'oa-font-scale-trigger__icon' });
    triggerIcon.setAttribute('aria-hidden', 'true');
    appendAccessibilityLauncherIcon(triggerIcon);

    this.panel = this.root.createEl('section', {
      cls: 'oa-font-scale-panel',
      attr: {
        id: PANEL_ID,
        role: 'group',
        'aria-label': 'Controles de acessibilidade. Toque fora ou pressione escape para fechar',
      },
    });
    this.panel.hidden = true;

    this.modeLabel = this.panel.createDiv({
      cls: 'oa-font-scale-panel__mode oa-font-scale-panel__text',
    });
    this.modeLabel.setAttribute('aria-live', 'polite');
    this.zenModeButton = this.panel.createEl('button', {
      cls: 'oa-font-scale-panel__button oa-font-scale-panel__zen-mode',
      attr: {
        type: 'button',
        'aria-label': 'Ativar modo zen',
        'aria-pressed': 'false',
        title: 'Ativar modo zen',
      },
    });
    this.annotationButton = this.panel.createEl('button', {
      cls: 'oa-font-scale-panel__button oa-font-scale-panel__annotation',
      attr: {
        type: 'button',
        'aria-label': 'Ativar anotação rápida',
        'aria-pressed': 'false',
        title: 'Ativar anotação rápida',
      },
    });
    setIcon(this.annotationButton, 'pencil-line');
    this.increaseButton = this.textButton(this.panel, '+', 'Aumentar um pixel');

    this.rangeFrame = this.panel.createDiv({ cls: 'oa-font-scale-panel__range-frame' });
    const rangeVisual = this.rangeFrame.createDiv({
      cls: 'oa-font-scale-panel__range-visual',
      attr: { 'aria-hidden': 'true' },
    });
    const rangeRail = rangeVisual.createDiv({ cls: 'oa-font-scale-panel__range-rail' });
    rangeRail.createDiv({ cls: 'oa-font-scale-panel__range-track' });
    rangeRail.createDiv({ cls: 'oa-font-scale-panel__range-thumb' });
    this.range = this.rangeFrame.createEl('input', {
      cls: 'oa-font-scale-panel__range',
      attr: {
        type: 'range',
        step: '1',
        orient: 'vertical',
        'aria-label': 'Tamanho do texto',
        'aria-orientation': 'vertical',
      },
    });

    this.decreaseButton = this.textButton(this.panel, '−', 'Diminuir um pixel');
    this.resetButton = this.panel.createEl('button', {
      cls: 'oa-font-scale-panel__button oa-font-scale-panel__reset',
      attr: {
        type: 'button',
        'aria-label': 'Restaurar tamanho do perfil',
        title: 'Restaurar tamanho do perfil',
      },
    });
    setIcon(this.resetButton, 'rotate-ccw');
    this.markButton = this.panel.createEl('button', {
      cls: 'oa-font-scale-panel__button oa-font-scale-panel__mark',
      attr: {
        type: 'button',
        'aria-label': 'Marcar seleção',
        title: 'Marcar seleção',
      },
    });
    setIcon(this.markButton, 'highlighter');
    this.eraseButton = this.panel.createEl('button', {
      cls: 'oa-font-scale-panel__button oa-font-scale-panel__erase',
      attr: {
        type: 'button',
        'aria-label': 'Apagar marcação',
        title: 'Apagar marcação',
      },
    });
    setIcon(this.eraseButton, 'eraser');
    this.statusLive = this.root.createDiv({
      cls: 'oa-visually-hidden',
      attr: { 'aria-live': 'polite', 'aria-atomic': 'true' },
    });

    const signal = this.abortController.signal;
    this.trigger.addEventListener('click', (event) => this.toggle(event.detail === 0), { signal });
    this.root.addEventListener('pointerdown', () => this.wakeTrigger(), { signal });
    this.root.addEventListener('pointerenter', () => this.wakeTrigger(), { signal });
    this.root.addEventListener('pointerleave', () => this.scheduleTriggerIdle(), { signal });
    this.root.addEventListener('focusin', () => this.wakeTrigger(), { signal });
    this.root.addEventListener('focusout', () => this.scheduleTriggerIdle(), { signal });
    this.zenModeButton.addEventListener('click', () => this.toggleZenMode(), { signal });
    this.annotationButton.addEventListener('click', () => this.annotation.toggle(), { signal });
    this.markButton.addEventListener('click', () => void this.annotation.mark(), { signal });
    this.eraseButton.addEventListener('click', () => void this.annotation.erase(), { signal });
    this.increaseButton.addEventListener('click', () => this.step(1), { signal });
    this.decreaseButton.addEventListener('click', () => this.step(-1), { signal });
    this.resetButton.addEventListener('click', () => this.reset(), { signal });
    this.range.addEventListener('input', () => this.setScale(Number(this.range.value)), { signal });
    this.rangeFrame.addEventListener('pointerdown', (event) => this.startRangeDrag(event), {
      signal,
    });
    this.rangeFrame.addEventListener('pointermove', (event) => this.moveRangeDrag(event), {
      signal,
    });
    this.rangeFrame.addEventListener('pointerup', (event) => this.stopRangeDrag(event), {
      signal,
    });
    this.rangeFrame.addEventListener('pointercancel', (event) => this.stopRangeDrag(event), {
      signal,
    });
    doc.addEventListener('pointerdown', (event) => this.onOutsidePointer(event), {
      capture: true,
      signal,
    });
    doc.addEventListener('keydown', (event) => this.onKeyDown(event), { signal });
    view.containerEl.ownerDocument.defaultView?.addEventListener(
      'resize',
      () => this.positionPanel(),
      { signal },
    );

    this.unsubscribe = store.subscribe(() => this.render());
    this.unsubscribeZenMode = zenMode.subscribe((active) => {
      this.renderZenMode(active);
      this.statusLive.setText(active ? 'Modo zen ativado' : 'Modo zen desativado');
    });
    this.unsubscribeAnnotation = annotation.subscribe((state) => this.renderAnnotation(state));
    this.render();
    this.renderZenMode(zenMode.active);
  }

  refreshContext(): void {
    this.annotation.refreshContext();
    this.render();
    this.controller.refresh();
    if (this.opened) this.positionPanel();
  }

  toggle(focusRange = false): void {
    this.wakeTrigger();
    if (this.opened) {
      this.close(false);
      return;
    }
    this.opened = true;
    this.panel.hidden = false;
    this.trigger.setAttribute('aria-expanded', 'true');
    this.updateTriggerLabel();
    window.requestAnimationFrame(() => {
      if (!this.opened) return;
      this.positionPanel();
      if (focusRange) this.range.focus();
    });
  }

  destroy(): void {
    this.abortController.abort();
    this.unsubscribe();
    this.unsubscribeZenMode();
    this.unsubscribeAnnotation();
    this.close(false);
    this.clearIdleTimer();
    this.root.remove();
  }

  private render(): void {
    const settings = this.store.snapshot;
    const mode = this.controller.mode();
    const profile = settings.profiles[settings.activeProfile];
    const value = mode === 'reading' ? profile.readingSize : profile.editingSize;
    const limits = scaleLimits(mode);

    for (const side of CONTROL_SIDES) {
      this.root.classList.toggle(`is-${side}`, settings.side === side);
    }
    for (const verticalPosition of CONTROL_VERTICAL_POSITIONS) {
      this.root.classList.toggle(
        `is-${verticalPosition}`,
        settings.verticalPosition === verticalPosition,
      );
    }
    for (const controlScale of CONTROL_SCALES) {
      this.root.classList.toggle(
        `is-scale-${controlScale}`,
        settings.controlScale === controlScale,
      );
    }
    this.root.hidden = !settings.enabled;
    this.range.min = `${limits.minimum}`;
    this.range.max = `${limits.maximum}`;
    this.range.value = `${value}`;
    this.range.setAttribute('aria-valuetext', `${value} pixels`);
    const position = (limits.maximum - value) / (limits.maximum - limits.minimum);
    this.rangeFrame.style.setProperty('--oa-font-scale-range-position', `${position * 100}%`);
    if (!this.annotation.active) {
      this.modeLabel.setText(`${value} px`);
      this.modeLabel.setAttribute('title', `${value} pixels`);
    }
    if (!settings.enabled) {
      if (this.opened) this.close(false);
      this.clearIdleTimer();
      this.root.classList.remove('is-idle');
    } else if (!this.opened && this.idleTimer === null && !this.root.classList.contains('is-idle')) {
      this.scheduleTriggerIdle();
    }
  }

  private positionPanel(): void {
    if (!this.opened) return;
    const win = this.view.containerEl.ownerDocument.defaultView;
    if (!win) return;

    const buttonRect = this.trigger.getBoundingClientRect();
    const panelRect = this.panel.getBoundingClientRect();
    const containerRect = this.view.containerEl.getBoundingClientRect();
    const position = computePanelPosition(
      buttonRect,
      panelRect,
      containerRect,
      { width: win.innerWidth, height: win.innerHeight },
      this.store.snapshot.side,
      this.store.snapshot.verticalPosition,
    );
    this.panel.style.left = `${position.left}px`;
    this.panel.style.top = `${position.top}px`;
  }

  private close(returnFocus: boolean): void {
    if (!this.opened) return;
    if (this.annotation.active) this.annotation.exit();
    this.opened = false;
    this.panel.hidden = true;
    this.trigger.setAttribute('aria-expanded', 'false');
    this.updateTriggerLabel();
    if (returnFocus) this.trigger.focus();
    this.scheduleTriggerIdle();
  }

  private setTriggerLabel(label: string): void {
    this.trigger.setAttribute('aria-label', label);
    this.trigger.setAttribute('title', label);
  }

  private step(delta: number): void {
    this.setScale(Number(this.range.value) + delta);
  }

  private setScale(value: number): void {
    const mode = this.controller.mode();
    this.store.setScale(mode, value);
    this.controller.applyScaleWithAnchor();
  }

  private startRangeDrag(event: PointerEvent): void {
    if (this.rangeDrag || event.button !== 0) return;
    const bounds = this.rangeFrame.getBoundingClientRect();
    const thumbSize = this.rangeThumbSize();
    const travel = bounds.height - thumbSize;
    if (travel <= 0) return;

    const minimum = Number(this.range.min);
    const maximum = Number(this.range.max);
    const value = Number(this.range.value);
    const position = (maximum - value) / (maximum - minimum);
    const thumbCenter = bounds.top + thumbSize / 2 + position * travel;
    if (Math.abs(event.clientY - thumbCenter) > this.rangeTouchRadius()) return;

    event.preventDefault();
    this.range.focus({ preventScroll: true });
    this.rangeDrag = {
      pointerId: event.pointerId,
      grabOffset: event.clientY - thumbCenter,
    };
    this.rangeFrame.classList.add('is-dragging');
    try {
      this.rangeFrame.setPointerCapture(event.pointerId);
    } catch {
      // Pointer capture is an enhancement; document-level movement is not required here.
    }
  }

  private moveRangeDrag(event: PointerEvent): void {
    if (!this.rangeDrag || event.pointerId !== this.rangeDrag.pointerId) return;
    event.preventDefault();

    const bounds = this.rangeFrame.getBoundingClientRect();
    const thumbSize = this.rangeThumbSize();
    const travel = bounds.height - thumbSize;
    if (travel <= 0) return;
    const minimum = Number(this.range.min);
    const maximum = Number(this.range.max);
    const thumbCenter = event.clientY - this.rangeDrag.grabOffset;
    const position = Math.min(
      1,
      Math.max(0, (thumbCenter - bounds.top - thumbSize / 2) / travel),
    );
    const nextValue = Math.round(maximum - position * (maximum - minimum));
    if (nextValue !== Number(this.range.value)) this.setScale(nextValue);
  }

  private stopRangeDrag(event: PointerEvent): void {
    if (!this.rangeDrag || event.pointerId !== this.rangeDrag.pointerId) return;
    this.rangeDrag = null;
    this.rangeFrame.classList.remove('is-dragging');
    try {
      this.rangeFrame.releasePointerCapture(event.pointerId);
    } catch {
      // The pointer may already have been released by the browser.
    }
  }

  private rangeThumbSize(): number {
    return BASE_RANGE_THUMB_SIZE * CONTROL_SCALE_FACTORS[this.store.snapshot.controlScale];
  }

  private rangeTouchRadius(): number {
    return Math.max(
      MINIMUM_RANGE_TOUCH_RADIUS,
      BASE_RANGE_TOUCH_RADIUS * CONTROL_SCALE_FACTORS[this.store.snapshot.controlScale],
    );
  }

  private wakeTrigger(): void {
    this.clearIdleTimer();
    this.root.classList.remove('is-idle');
  }

  private scheduleTriggerIdle(): void {
    this.clearIdleTimer();
    if (this.opened || !this.store.snapshot.enabled) return;
    const win = this.view.containerEl.ownerDocument.defaultView;
    if (!win) return;
    this.idleTimer = win.setTimeout(() => {
      this.idleTimer = null;
      if (!this.opened && this.store.snapshot.enabled) this.root.classList.add('is-idle');
    }, TRIGGER_IDLE_DELAY_MS);
  }

  private clearIdleTimer(): void {
    if (this.idleTimer === null) return;
    this.view.containerEl.ownerDocument.defaultView?.clearTimeout(this.idleTimer);
    this.idleTimer = null;
  }

  private reset(): void {
    this.store.resetScale(this.controller.mode());
    this.controller.applyScaleWithAnchor();
  }

  private toggleZenMode(): void {
    this.zenMode.toggle();
    this.close(false);
  }

  private renderZenMode(active: boolean): void {
    const label = active ? 'Sair do modo zen' : 'Ativar modo zen';
    this.zenModeButton.setAttribute('aria-label', label);
    this.zenModeButton.setAttribute('title', label);
    this.zenModeButton.setAttribute('aria-pressed', `${active}`);
    this.zenModeButton.classList.toggle('is-active', active);
    setIcon(this.zenModeButton, active ? 'minimize-2' : 'focus');
    this.updateTriggerLabel();
  }

  private updateTriggerLabel(): void {
    const action = this.opened ? 'Fechar' : 'Abrir';
    const state = this.zenMode.active ? 'Modo zen ativo. ' : '';
    const annotationState = this.annotation.active ? 'Anotação rápida ativa. ' : '';
    this.setTriggerLabel(`${state}${annotationState}${action} controles de acessibilidade`);
  }

  private onOutsidePointer(event: PointerEvent): void {
    if (!this.opened || this.root.contains(event.target as Node)) return;
    if (this.annotation.active) return;
    this.close(false);
  }

  private onKeyDown(event: KeyboardEvent): void {
    if (event.key !== 'Escape') return;
    if (this.annotation.active) {
      event.preventDefault();
      this.annotation.exit();
      this.annotationButton.focus();
      return;
    }
    if (this.opened) {
      event.preventDefault();
      this.close(true);
      return;
    }
    if (this.zenMode.active) {
      event.preventDefault();
      this.zenMode.exit();
    }
  }

  private textButton(parent: HTMLElement, text: string, label: string): HTMLButtonElement {
    return parent.createEl('button', {
      cls: 'oa-font-scale-panel__button oa-font-scale-panel__step',
      text,
      attr: { type: 'button', 'aria-label': label, title: label },
    });
  }

  private renderAnnotation(state: ReadingAnnotationState): void {
    this.panel.classList.toggle('is-annotation-mode', state.active);
    this.modeLabel.classList.toggle('is-annotation-mode', state.active);
    this.zenModeButton.hidden = state.active;
    this.increaseButton.hidden = state.active;
    this.rangeFrame.hidden = state.active;
    this.decreaseButton.hidden = state.active;
    this.resetButton.hidden = state.active;
    this.markButton.hidden = !state.active;
    this.eraseButton.hidden = !state.active;

    const annotationLabel = state.active
      ? 'Sair da anotação rápida'
      : state.available
        ? 'Ativar anotação rápida'
        : 'Anotação rápida disponível apenas no modo leitura';
    this.annotationButton.setAttribute('aria-label', annotationLabel);
    this.annotationButton.setAttribute('title', annotationLabel);
    this.annotationButton.setAttribute('aria-pressed', `${state.active}`);
    this.annotationButton.classList.toggle('is-active', state.active);
    this.annotationButton.disabled = !state.available && !state.active;
    this.markButton.disabled = state.busy || !state.hasSelection;
    this.eraseButton.disabled = state.busy || !state.hasSelection;

    if (state.active) {
      this.modeLabel.setText('Anotar');
      this.modeLabel.setAttribute('title', 'Cor de marcação definida pelo tema');
      this.panel.setAttribute(
        'aria-label',
        'Anotação rápida. Selecione texto e escolha marcar ou apagar',
      );
    } else {
      this.renderScaleLabel();
      this.panel.setAttribute(
        'aria-label',
        'Controles de acessibilidade. Toque fora ou pressione escape para fechar',
      );
    }

    if (state.message && state.message !== this.lastAnnotationMessage) {
      this.lastAnnotationMessage = state.message;
      this.statusLive.setText(state.message);
    }
    this.updateTriggerLabel();
    if (this.opened) {
      window.requestAnimationFrame(() => this.positionPanel());
    }
  }

  private renderScaleLabel(): void {
    const mode = this.controller.mode();
    const profile = this.store.activeProfile;
    const value = mode === 'reading' ? profile.readingSize : profile.editingSize;
    this.modeLabel.setText(`${value} px`);
    this.modeLabel.setAttribute('title', `${value} pixels`);
  }
}

import { MarkdownView, setIcon } from 'obsidian';
import { computePanelPosition } from './positioning';
import { ScaleController } from './scale-controller';
import { ScaleStore } from './scale-store';
import { scaleLimits } from './settings-model';
import { ZenModeController } from './zen-mode-controller';

const PANEL_ID = 'oa-font-scale-panel';
const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';

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
  private readonly statusLive: HTMLDivElement;
  private readonly range: HTMLInputElement;
  private readonly abortController = new AbortController();
  private readonly unsubscribe: () => void;
  private readonly unsubscribeZenMode: () => void;
  private opened = false;

  constructor(
    private readonly view: MarkdownView,
    private readonly store: ScaleStore,
    private readonly controller: ScaleController,
    private readonly zenMode: ZenModeController,
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
    const increase = this.textButton(this.panel, '+', 'Aumentar um pixel');

    const rangeFrame = this.panel.createDiv({ cls: 'oa-font-scale-panel__range-frame' });
    this.range = rangeFrame.createEl('input', {
      cls: 'oa-font-scale-panel__range',
      attr: {
        type: 'range',
        step: '1',
        'aria-label': 'Tamanho do texto',
        'aria-orientation': 'vertical',
      },
    });

    const decrease = this.textButton(this.panel, '−', 'Diminuir um pixel');
    const reset = this.panel.createEl('button', {
      cls: 'oa-font-scale-panel__button oa-font-scale-panel__reset',
      attr: {
        type: 'button',
        'aria-label': 'Restaurar tamanho do perfil',
        title: 'Restaurar tamanho do perfil',
      },
    });
    setIcon(reset, 'rotate-ccw');
    this.statusLive = this.root.createDiv({
      cls: 'oa-visually-hidden',
      attr: { 'aria-live': 'polite', 'aria-atomic': 'true' },
    });

    const signal = this.abortController.signal;
    this.trigger.addEventListener('click', (event) => this.toggle(event.detail === 0), { signal });
    this.zenModeButton.addEventListener('click', () => this.toggleZenMode(), { signal });
    increase.addEventListener('click', () => this.step(1), { signal });
    decrease.addEventListener('click', () => this.step(-1), { signal });
    reset.addEventListener('click', () => this.reset(), { signal });
    this.range.addEventListener('input', () => this.setScale(Number(this.range.value)), { signal });
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
    this.render();
    this.renderZenMode(zenMode.active);
  }

  refreshContext(): void {
    this.render();
    this.controller.refresh();
    if (this.opened) this.positionPanel();
  }

  toggle(focusRange = false): void {
    if (this.opened) {
      this.close(false);
      return;
    }
    this.opened = true;
    this.panel.hidden = false;
    this.trigger.setAttribute('aria-expanded', 'true');
    this.updateTriggerLabel();
    window.requestAnimationFrame(() => {
      this.positionPanel();
      if (focusRange) this.range.focus();
    });
  }

  destroy(): void {
    this.abortController.abort();
    this.unsubscribe();
    this.unsubscribeZenMode();
    this.close(false);
    this.root.remove();
  }

  private render(): void {
    const settings = this.store.snapshot;
    const mode = this.controller.mode();
    const profile = settings.profiles[settings.activeProfile];
    const value = mode === 'reading' ? profile.readingSize : profile.editingSize;
    const limits = scaleLimits(mode);

    this.root.classList.toggle('is-left', settings.side === 'left');
    this.root.classList.toggle('is-right', settings.side === 'right');
    this.root.hidden = !settings.enabled;
    this.range.min = `${limits.minimum}`;
    this.range.max = `${limits.maximum}`;
    this.range.value = `${value}`;
    this.range.setAttribute('aria-valuetext', `${value} pixels`);
    this.modeLabel.setText(`${value} px`);
    this.modeLabel.setAttribute('title', `${value} pixels`);
    if (!settings.enabled && this.opened) this.close(false);
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
    );
    this.panel.style.left = `${position.left}px`;
    this.panel.style.top = `${position.top}px`;
  }

  private close(returnFocus: boolean): void {
    if (!this.opened) return;
    this.opened = false;
    this.panel.hidden = true;
    this.trigger.setAttribute('aria-expanded', 'false');
    this.updateTriggerLabel();
    if (returnFocus) this.trigger.focus();
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
    this.setTriggerLabel(`${state}${action} controles de acessibilidade`);
  }

  private onOutsidePointer(event: PointerEvent): void {
    if (!this.opened || this.root.contains(event.target as Node)) return;
    this.close(false);
  }

  private onKeyDown(event: KeyboardEvent): void {
    if (event.key !== 'Escape') return;
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
}

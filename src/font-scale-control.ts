import { MarkdownView, setIcon } from 'obsidian';
import { computePanelPosition } from './positioning';
import { ScaleController } from './scale-controller';
import { ScaleStore } from './scale-store';
import { scaleLimits } from './settings-model';

const PANEL_ID = 'oa-font-scale-panel';

export class FontScaleControl {
  private readonly root: HTMLDivElement;
  private readonly trigger: HTMLButtonElement;
  private readonly panel: HTMLElement;
  private readonly modeLabel: HTMLDivElement;
  private readonly tabBarButton: HTMLButtonElement;
  private readonly resetLabel: HTMLSpanElement;
  private readonly range: HTMLInputElement;
  private readonly abortController = new AbortController();
  private readonly unsubscribe: () => void;
  private opened = false;

  constructor(
    private readonly view: MarkdownView,
    private readonly store: ScaleStore,
    private readonly controller: ScaleController,
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
    setIcon(triggerIcon, 'accessibility');

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
    this.tabBarButton = this.panel.createEl('button', {
      cls: 'oa-font-scale-panel__button oa-font-scale-panel__tab-bar',
      attr: {
        type: 'button',
        'aria-label': 'Ocultar barra de abas',
        'aria-pressed': 'false',
        title: 'Ocultar barra de abas',
      },
    });
    setIcon(this.tabBarButton, 'panel-top');
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
    const separator = this.panel.createDiv({ cls: 'oa-font-scale-panel__separator' });
    separator.setAttribute('aria-hidden', 'true');
    const reset = this.panel.createEl('button', {
      cls: 'oa-font-scale-panel__reset',
      attr: {
        type: 'button',
        'aria-label': 'Restaurar tamanho do perfil',
        title: 'Restaurar tamanho do perfil',
      },
    });
    this.resetLabel = reset.createSpan({
      cls: 'oa-font-scale-panel__reset-label oa-font-scale-panel__text',
      text: 'Reset',
    });

    const signal = this.abortController.signal;
    this.trigger.addEventListener('click', (event) => this.toggle(event.detail === 0), { signal });
    this.tabBarButton.addEventListener('click', () => this.toggleTabBar(), { signal });
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
    this.render();
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
    this.setTriggerLabel('Fechar controles de acessibilidade');
    window.requestAnimationFrame(() => {
      this.alignResetLabel();
      this.positionPanel();
      if (focusRange) this.range.focus();
    });
  }

  destroy(): void {
    this.abortController.abort();
    this.unsubscribe();
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
    this.tabBarButton.setAttribute('aria-pressed', `${settings.tabBarHidden}`);
    this.tabBarButton.classList.toggle('is-active', settings.tabBarHidden);

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
    this.setTriggerLabel('Abrir controles de acessibilidade');
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

  private toggleTabBar(): void {
    this.store.setTabBarHidden(!this.store.snapshot.tabBarHidden);
  }

  private alignResetLabel(): void {
    const valueNode = this.modeLabel.firstChild;
    const resetNode = this.resetLabel.firstChild;
    if (!valueNode || !resetNode) return;

    this.resetLabel.setCssProps({ '--oa-reset-scale-x': '1' });
    const doc = this.view.containerEl.ownerDocument;
    const valueRange = doc.createRange();
    const resetRange = doc.createRange();
    valueRange.selectNodeContents(valueNode);
    resetRange.selectNodeContents(resetNode);
    const valueWidth = valueRange.getBoundingClientRect().width;
    const resetWidth = resetRange.getBoundingClientRect().width;
    if (valueWidth <= 0 || resetWidth <= 0) return;

    const scale = Math.min(1.25, Math.max(0.75, valueWidth / resetWidth));
    this.resetLabel.setCssProps({ '--oa-reset-scale-x': `${scale}` });
  }

  private onOutsidePointer(event: PointerEvent): void {
    if (!this.opened || this.root.contains(event.target as Node)) return;
    this.close(false);
  }

  private onKeyDown(event: KeyboardEvent): void {
    if (!this.opened || event.key !== 'Escape') return;
    event.preventDefault();
    this.close(true);
  }

  private textButton(parent: HTMLElement, text: string, label: string): HTMLButtonElement {
    return parent.createEl('button', {
      cls: 'oa-font-scale-panel__button oa-font-scale-panel__step',
      text,
      attr: { type: 'button', 'aria-label': label, title: label },
    });
  }
}

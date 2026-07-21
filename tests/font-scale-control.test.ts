// @vitest-environment happy-dom

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { FontScaleControl } from '../src/font-scale-control';
import type { ScaleController } from '../src/scale-controller';
import { ScaleStore } from '../src/scale-store';
import { DEFAULT_SETTINGS } from '../src/settings-model';

interface CreateOptions {
  cls?: string;
  text?: string;
  attr?: Record<string, string>;
}

function decorate(element: HTMLElement, options?: string | CreateOptions): HTMLElement {
  if (typeof options === 'string') element.className = options;
  if (options && typeof options !== 'string') {
    if (options.cls) element.className = options.cls;
    if (options.text) element.textContent = options.text;
    for (const [name, value] of Object.entries(options.attr ?? {})) {
      element.setAttribute(name, value);
    }
  }
  return element;
}

beforeEach(() => {
  Object.assign(HTMLElement.prototype, {
    createDiv(this: HTMLElement, options?: string | CreateOptions) {
      return this.appendChild(decorate(document.createElement('div'), options));
    },
    createSpan(this: HTMLElement, options?: string | CreateOptions) {
      return this.appendChild(decorate(document.createElement('span'), options));
    },
    createEl(this: HTMLElement, tag: string, options?: string | CreateOptions) {
      return this.appendChild(decorate(document.createElement(tag), options));
    },
    setCssProps(this: HTMLElement, properties: Record<string, string>) {
      for (const [property, value] of Object.entries(properties)) {
        this.style.setProperty(property, value);
      }
    },
    setText(this: HTMLElement, text: string) {
      this.textContent = text;
    },
  });
  document.body.empty?.();
  document.body.innerHTML = '';
});

function setup(): {
  control: FontScaleControl;
  store: ScaleStore;
  controller: ScaleController;
  container: HTMLElement;
} {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const store = new ScaleStore(DEFAULT_SETTINGS, async () => undefined);
  const controller = {
    mode: vi.fn(() => 'reading'),
    refresh: vi.fn(),
    applyScaleWithAnchor: vi.fn(),
  } as unknown as ScaleController;
  const view = {
    containerEl: container,
    getMode: () => 'preview',
  };
  const control = new FontScaleControl(view as never, store, controller);
  return { control, store, controller, container };
}

describe('FontScaleControl', () => {
  it('abre e fecha pelo mesmo botão sem reservar layout', () => {
    const { control, container } = setup();
    const trigger = container.querySelector<HTMLButtonElement>('.oa-font-scale-trigger');
    const triggerIcon = container.querySelector<HTMLElement>('.oa-font-scale-trigger__icon');
    const panel = container.querySelector<HTMLElement>('.oa-font-scale-panel');

    expect(trigger).not.toBeNull();
    expect(trigger?.getAttribute('aria-label')).toBe('Abrir controles de acessibilidade');
    expect(triggerIcon?.dataset.icon).toBe('accessibility');
    expect(triggerIcon?.getAttribute('aria-hidden')).toBe('true');
    expect(trigger?.textContent).toBe('');
    expect(panel?.hidden).toBe(true);
    trigger?.click();
    expect(trigger?.getAttribute('aria-expanded')).toBe('true');
    expect(trigger?.getAttribute('aria-label')).toBe('Fechar controles de acessibilidade');
    expect(panel?.hidden).toBe(false);
    trigger?.click();
    expect(trigger?.getAttribute('aria-expanded')).toBe('false');
    expect(trigger?.getAttribute('aria-label')).toBe('Abrir controles de acessibilidade');
    expect(panel?.hidden).toBe(true);
    control.destroy();
  });

  it('fecha por Escape e devolve o foco ao botão', () => {
    const { control, container } = setup();
    const trigger = container.querySelector<HTMLButtonElement>('.oa-font-scale-trigger');
    const panel = container.querySelector<HTMLElement>('.oa-font-scale-panel');
    trigger?.click();

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(panel?.hidden).toBe(true);
    expect(document.activeElement).toBe(trigger);
    control.destroy();
  });

  it('fecha por toque externo e remove toda a raiz ao destruir', () => {
    const { control, container } = setup();
    const trigger = container.querySelector<HTMLButtonElement>('.oa-font-scale-trigger');
    const panel = container.querySelector<HTMLElement>('.oa-font-scale-panel');
    trigger?.click();

    document.body.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
    expect(panel?.hidden).toBe(true);
    control.destroy();
    expect(container.querySelector('.oa-font-scale-root')).toBeNull();
  });

  it('converge slider e botões para o mesmo estado', () => {
    const { control, store, controller, container } = setup();
    const trigger = container.querySelector<HTMLButtonElement>('.oa-font-scale-trigger');
    const range = container.querySelector<HTMLInputElement>('.oa-font-scale-panel__range');
    trigger?.click();
    if (!range) throw new Error('Range não foi criado');

    range.value = '66';
    range.dispatchEvent(new Event('input', { bubbles: true }));
    expect(store.activeProfile.readingSize).toBe(66);
    expect(controller.applyScaleWithAnchor).toHaveBeenCalled();
    control.destroy();
  });

  it('organiza o painel em uma única coluna com slider vertical', () => {
    const { control, container } = setup();
    const panel = container.querySelector<HTMLElement>('.oa-font-scale-panel');
    const range = container.querySelector<HTMLInputElement>('.oa-font-scale-panel__range');
    const frame = container.querySelector<HTMLElement>('.oa-font-scale-panel__range-frame');

    expect(panel).not.toBeNull();
    expect(range?.parentElement).toBe(frame);
    expect(range?.getAttribute('aria-orientation')).toBe('vertical');
    expect(panel?.querySelector('.oa-font-scale-panel__actions')).toBeNull();
    expect(panel?.querySelectorAll(':scope > button')).toHaveLength(4);
    expect(panel?.querySelector('.oa-font-scale-panel__mode')?.textContent).toBe(
      '55 px',
    );
    expect(panel?.children[1]?.classList.contains('oa-font-scale-panel__tab-bar')).toBe(true);
    expect(panel?.children[2]?.textContent).toBe('+');
    expect(panel?.querySelector('.oa-font-scale-panel__separator')?.getAttribute('aria-hidden')).toBe(
      'true',
    );
    expect(panel?.querySelector('.oa-font-scale-panel__reset-label')?.textContent).toBe('Reset');
    control.destroy();
  });

  it('alterna e expõe o estado persistente da barra de abas', () => {
    const { control, store, container } = setup();
    const button = container.querySelector<HTMLButtonElement>(
      '.oa-font-scale-panel__tab-bar',
    );

    expect(button?.getAttribute('aria-pressed')).toBe('false');
    expect(button?.dataset.icon).toBe('panel-top');
    button?.click();

    expect(store.snapshot.tabBarHidden).toBe(true);
    expect(button?.getAttribute('aria-pressed')).toBe('true');
    expect(button?.classList.contains('is-active')).toBe(true);
    control.destroy();
  });

  it('restaura o tamanho do perfil pela ação textual inferior', () => {
    const { control, store, controller, container } = setup();
    store.setScale('reading', 66);

    container.querySelector<HTMLButtonElement>('.oa-font-scale-panel__reset')?.click();

    expect(store.activeProfile.readingSize).toBe(55);
    expect(controller.applyScaleWithAnchor).toHaveBeenCalled();
    control.destroy();
  });
});

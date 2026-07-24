// @vitest-environment happy-dom

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { FontScaleControl } from '../src/font-scale-control';
import {
  ReadingAnnotationController,
  ReadingSectionRegistry,
} from '../src/reading-annotation';
import type { ScaleController } from '../src/scale-controller';
import { ScaleStore } from '../src/scale-store';
import { DEFAULT_SETTINGS } from '../src/settings-model';
import { ZenModeController } from '../src/zen-mode-controller';

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
  vi.useRealTimers();
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

function setup(mode: 'reading' | 'editing' = 'reading'): {
  control: FontScaleControl;
  store: ScaleStore;
  controller: ScaleController;
  zenMode: ZenModeController;
  annotation: ReadingAnnotationController;
  container: HTMLElement;
  paragraphText: Text;
  getContent: () => string;
} {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const section = container.appendChild(document.createElement('div'));
  const paragraph = section.appendChild(document.createElement('p'));
  const paragraphText = paragraph.appendChild(
    document.createTextNode('Um trecho simples para marcar.'),
  );
  const store = new ScaleStore(DEFAULT_SETTINGS, async () => undefined);
  const controller = {
    mode: vi.fn(() => mode),
    refresh: vi.fn(),
    applyScaleWithAnchor: vi.fn(),
  } as unknown as ScaleController;
  const view = {
    containerEl: container,
    contentEl: section,
    file: { path: 'Notas/Teste.md' },
    getMode: () => (mode === 'reading' ? 'preview' : 'source'),
  };
  const registry = new ReadingSectionRegistry();
  registry.register(section, {
    sourcePath: 'Notas/Teste.md',
    getSectionInfo: () => ({
      text: 'Um trecho simples para marcar.',
      lineStart: 0,
      lineEnd: 0,
    }),
  } as never);
  let content = 'Um trecho simples para marcar.';
  const vault = {
    getFileByPath: () => view.file,
    cachedRead: async () => content,
    process: async (_file: unknown, operation: (data: string) => string) => {
      content = operation(content);
      return content;
    },
  };
  const annotation = new ReadingAnnotationController(view as never, vault as never, registry);
  const zenMode = new ZenModeController(document.body, {
    leftSplit: { collapsed: false, collapse() { this.collapsed = true; }, expand() { this.collapsed = false; } },
    rightSplit: { collapsed: false, collapse() { this.collapsed = true; }, expand() { this.collapsed = false; } },
  });
  const control = new FontScaleControl(
    view as never,
    store,
    controller,
    zenMode,
    annotation,
  );
  return {
    control,
    store,
    controller,
    zenMode,
    annotation,
    container,
    paragraphText,
    getContent: () => content,
  };
}

describe('FontScaleControl', () => {
  it.each([
    ['reading', '75'],
    ['editing', '60'],
  ] as const)('expõe mínimo de 32 px no modo %s', (mode, maximum) => {
    const { control, container } = setup(mode);
    const range = container.querySelector<HTMLInputElement>('.oa-font-scale-panel__range');

    expect(range?.min).toBe('32');
    expect(range?.max).toBe(maximum);
    control.destroy();
  });

  it('abre e fecha pelo mesmo botão sem reservar layout', () => {
    const { control, container } = setup();
    const trigger = container.querySelector<HTMLButtonElement>('.oa-font-scale-trigger');
    const triggerIcon = container.querySelector<HTMLElement>('.oa-font-scale-trigger__icon');
    const panel = container.querySelector<HTMLElement>('.oa-font-scale-panel');

    expect(trigger).not.toBeNull();
    expect(trigger?.getAttribute('aria-label')).toBe('Abrir controles de acessibilidade');
    expect(triggerIcon?.getAttribute('aria-hidden')).toBe('true');
    const launcherSvg = triggerIcon?.querySelector<SVGElement>('svg');
    const launcherPath = launcherSvg?.querySelector('path');
    expect(launcherSvg?.dataset.oaIcon).toBe('accessibility-new-filled');
    expect(launcherSvg?.getAttribute('viewBox')).toBe('0 0 24 24');
    expect(launcherSvg?.getAttribute('aria-hidden')).toBe('true');
    expect(launcherSvg?.getAttribute('focusable')).toBe('false');
    expect(launcherPath?.getAttribute('fill')).toBe('currentColor');
    expect(launcherPath?.getAttribute('d')).toContain('M20.75 6.99');
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

  it('combina lado, altura e escala sem criar uma posição horizontal central', () => {
    const { control, store, container } = setup();
    const root = container.querySelector<HTMLElement>('.oa-font-scale-root');

    store.setSide('left');
    store.setVerticalPosition('bottom');
    store.setControlScale('small');

    expect(root?.classList.contains('is-left')).toBe(true);
    expect(root?.classList.contains('is-right')).toBe(false);
    expect(root?.classList.contains('is-bottom')).toBe(true);
    expect(root?.classList.contains('is-center')).toBe(false);
    expect(root?.classList.contains('is-scale-small')).toBe(true);
    control.destroy();
  });

  it('deixa o acionador semitransparente após dois segundos de repouso', () => {
    vi.useFakeTimers();
    const { control, container } = setup();
    const root = container.querySelector<HTMLElement>('.oa-font-scale-root');
    const trigger = container.querySelector<HTMLButtonElement>('.oa-font-scale-trigger');

    vi.advanceTimersByTime(1_999);
    expect(root?.classList.contains('is-idle')).toBe(false);
    vi.advanceTimersByTime(1);
    expect(root?.classList.contains('is-idle')).toBe(true);

    trigger?.click();
    expect(root?.classList.contains('is-idle')).toBe(false);
    document.body.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
    vi.advanceTimersByTime(2_000);
    expect(root?.classList.contains('is-idle')).toBe(true);

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

  it('aceita uma redução direta a partir de um valor intermediário', () => {
    const { control, store, controller, container } = setup();
    const range = container.querySelector<HTMLInputElement>('.oa-font-scale-panel__range');
    if (!range) throw new Error('Range não foi criado');

    expect(range.value).toBe('55');
    range.value = '54';
    range.dispatchEvent(new Event('input', { bubbles: true }));

    expect(store.activeProfile.readingSize).toBe(54);
    expect(controller.applyScaleWithAnchor).toHaveBeenCalledOnce();
    control.destroy();
  });

  it.each([55, 65])(
    'reduz no primeiro arrasto para baixo a partir de %i px sem movimento preparatório',
    (initialValue) => {
      const { control, store, controller, container } = setup();
      const frame = container.querySelector<HTMLElement>('.oa-font-scale-panel__range-frame');
      if (!frame) throw new Error('Moldura do range não foi criada');
      store.setScale('reading', initialValue);
      vi.spyOn(frame, 'getBoundingClientRect').mockReturnValue({
        top: 100,
        bottom: 355,
        left: 0,
        right: 66,
        width: 66,
        height: 255,
        x: 0,
        y: 100,
        toJSON: () => ({}),
      });
      const thumbCenter = 100 + 33 / 2 + ((75 - initialValue) / (75 - 32)) * (255 - 33);

      frame.dispatchEvent(
        new PointerEvent('pointerdown', {
          bubbles: true,
          button: 0,
          clientY: thumbCenter,
          pointerId: 7,
        }),
      );
      frame.dispatchEvent(
        new PointerEvent('pointermove', {
          bubbles: true,
          button: 0,
          clientY: thumbCenter + 12,
          pointerId: 7,
        }),
      );
      frame.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerId: 7 }));

      expect(store.activeProfile.readingSize).toBeLessThan(initialValue);
      expect(controller.applyScaleWithAnchor).toHaveBeenCalledOnce();
      control.destroy();
    },
  );

  it('preserva ao menos 24 px de diâmetro para capturar o polegar na escala mínima', () => {
    const { control, store, controller, container } = setup();
    const frame = container.querySelector<HTMLElement>('.oa-font-scale-panel__range-frame');
    if (!frame) throw new Error('Moldura do range não foi criada');
    store.setControlScale('small');
    vi.spyOn(frame, 'getBoundingClientRect').mockReturnValue({
      top: 100,
      bottom: 185,
      left: 0,
      right: 22,
      width: 22,
      height: 85,
      x: 0,
      y: 100,
      toJSON: () => ({}),
    });
    const thumbCenter = 100 + 11 / 2 + ((75 - 55) / (75 - 32)) * (85 - 11);

    frame.dispatchEvent(
      new PointerEvent('pointerdown', {
        bubbles: true,
        button: 0,
        clientY: thumbCenter + 11,
        pointerId: 8,
      }),
    );
    frame.dispatchEvent(
      new PointerEvent('pointermove', {
        bubbles: true,
        button: 0,
        clientY: thumbCenter + 20,
        pointerId: 8,
      }),
    );
    frame.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerId: 8 }));

    expect(store.activeProfile.readingSize).toBeLessThan(55);
    expect(controller.applyScaleWithAnchor).toHaveBeenCalledOnce();
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
    expect(range?.getAttribute('orient')).toBe('vertical');
    expect(frame?.querySelector('.oa-font-scale-panel__range-track')).not.toBeNull();
    expect(frame?.querySelector('.oa-font-scale-panel__range-thumb')).not.toBeNull();
    expect(frame?.style.getPropertyValue('--oa-font-scale-range-position')).toMatch(/%$/);
    expect(panel?.querySelector('.oa-font-scale-panel__actions')).toBeNull();
    expect(panel?.querySelectorAll(':scope > button:not([hidden])')).toHaveLength(5);
    expect(panel?.querySelector('.oa-font-scale-panel__mode')?.textContent).toBe(
      '55 px',
    );
    expect(panel?.children[1]?.classList.contains('oa-font-scale-panel__zen-mode')).toBe(true);
    expect(panel?.children[2]?.classList.contains('oa-font-scale-panel__annotation')).toBe(true);
    expect(panel?.children[3]?.textContent).toBe('+');
    expect(panel?.querySelector('.oa-font-scale-panel__separator')).toBeNull();
    const reset = panel?.querySelector<HTMLButtonElement>('.oa-font-scale-panel__reset');
    const visibleChildren = panel?.querySelectorAll<HTMLElement>(':scope > :not([hidden])');
    expect(reset).toBe(visibleChildren?.[visibleChildren.length - 1]);
    expect(reset?.classList.contains('oa-font-scale-panel__button')).toBe(true);
    expect(reset?.dataset.icon).toBe('rotate-ccw');
    expect(reset?.getAttribute('aria-label')).toBe('Restaurar tamanho do perfil');
    expect(reset?.textContent).toBe('');
    control.destroy();
  });

  it('troca o slider pela paleta compacta e volta ao estado anterior', () => {
    const { control, container } = setup();
    const trigger = container.querySelector<HTMLButtonElement>('.oa-font-scale-trigger');
    const panel = container.querySelector<HTMLElement>('.oa-font-scale-panel');
    const annotation = container.querySelector<HTMLButtonElement>(
      '.oa-font-scale-panel__annotation',
    );
    const mark = container.querySelector<HTMLButtonElement>('.oa-font-scale-panel__mark');
    const erase = container.querySelector<HTMLButtonElement>('.oa-font-scale-panel__erase');
    const range = container.querySelector<HTMLElement>('.oa-font-scale-panel__range-frame');

    trigger?.click();
    annotation?.click();

    expect(panel?.classList.contains('is-annotation-mode')).toBe(true);
    expect(annotation?.getAttribute('aria-pressed')).toBe('true');
    expect(panel?.querySelector('.oa-font-scale-panel__mode')?.textContent).toBe('Marcar');
    expect(range?.hidden).toBe(true);
    expect(mark?.hidden).toBe(false);
    expect(erase?.hidden).toBe(false);
    expect(mark?.disabled).toBe(false);
    expect(erase?.disabled).toBe(false);
    expect(mark?.getAttribute('aria-pressed')).toBe('true');
    expect(erase?.getAttribute('aria-pressed')).toBe('false');

    annotation?.click();
    expect(panel?.classList.contains('is-annotation-mode')).toBe(false);
    expect(panel?.querySelector('.oa-font-scale-panel__mode')?.textContent).toBe('55 px');
    expect(range?.hidden).toBe(false);
    control.destroy();
  });

  it('mantém a paleta aberta e marca pelo arrasto do Apple Pencil', async () => {
    const { control, container, paragraphText, getContent } = setup();
    const trigger = container.querySelector<HTMLButtonElement>('.oa-font-scale-trigger');
    const annotation = container.querySelector<HTMLButtonElement>(
      '.oa-font-scale-panel__annotation',
    );
    const panel = container.querySelector<HTMLElement>('.oa-font-scale-panel');
    trigger?.click();

    annotation?.dispatchEvent(
      new PointerEvent('pointerdown', { bubbles: true, pointerType: 'pen' }),
    );
    annotation?.click();
    paragraphText.parentElement?.dispatchEvent(
      new PointerEvent('pointerdown', {
        bubbles: true,
        isPrimary: true,
        pointerId: 9,
        pointerType: 'pen',
      }),
    );
    expect(panel?.hidden).toBe(false);

    const range = document.createRange();
    range.setStart(paragraphText, 3);
    range.setEnd(paragraphText, 17);
    document.getSelection()?.addRange(range);
    document.dispatchEvent(new Event('selectionchange'));

    paragraphText.parentElement?.dispatchEvent(
      new PointerEvent('pointerup', {
        bubbles: true,
        isPrimary: true,
        pointerId: 9,
        pointerType: 'pen',
      }),
    );
    await vi.waitFor(() => {
      expect(getContent()).toBe('Um ==trecho simples== para marcar.');
    });
    expect(panel?.hidden).toBe(false);
    expect(panel?.classList.contains('is-annotation-mode')).toBe(true);
    control.destroy();
  });

  it('alterna entre marcador e borracha sem sair do modo de anotação', () => {
    const { control, container } = setup();
    const trigger = container.querySelector<HTMLButtonElement>('.oa-font-scale-trigger');
    const annotation = container.querySelector<HTMLButtonElement>(
      '.oa-font-scale-panel__annotation',
    );
    const mark = container.querySelector<HTMLButtonElement>('.oa-font-scale-panel__mark');
    const erase = container.querySelector<HTMLButtonElement>('.oa-font-scale-panel__erase');
    const mode = container.querySelector<HTMLElement>('.oa-font-scale-panel__mode');

    trigger?.click();
    annotation?.click();
    erase?.click();

    expect(mark?.getAttribute('aria-pressed')).toBe('false');
    expect(erase?.getAttribute('aria-pressed')).toBe('true');
    expect(erase?.classList.contains('is-active')).toBe(true);
    expect(mode?.textContent).toBe('Apagar');

    mark?.click();
    expect(mark?.getAttribute('aria-pressed')).toBe('true');
    expect(erase?.getAttribute('aria-pressed')).toBe('false');
    expect(mode?.textContent).toBe('Marcar');
    control.destroy();
  });

  it('preserva uma seleção feita antes de abrir o controle e ativar o lápis', async () => {
    const { control, container, paragraphText, getContent } = setup();
    const trigger = container.querySelector<HTMLButtonElement>('.oa-font-scale-trigger');
    const annotation = container.querySelector<HTMLButtonElement>(
      '.oa-font-scale-panel__annotation',
    );
    const range = document.createRange();
    range.setStart(paragraphText, 3);
    range.setEnd(paragraphText, 17);
    document.getSelection()?.addRange(range);

    trigger?.dispatchEvent(
      new PointerEvent('pointerdown', {
        bubbles: true,
        isPrimary: true,
        pointerId: 11,
        pointerType: 'touch',
      }),
    );
    trigger?.click();
    document.getSelection()?.removeAllRanges();
    document.dispatchEvent(new Event('selectionchange'));
    annotation?.dispatchEvent(
      new PointerEvent('pointerdown', {
        bubbles: true,
        isPrimary: true,
        pointerId: 12,
        pointerType: 'touch',
      }),
    );
    annotation?.click();

    await vi.waitFor(() => {
      expect(getContent()).toBe('Um ==trecho simples== para marcar.');
    });
    control.destroy();
  });

  it('desabilita a anotação fora do modo leitura', () => {
    const { control, container } = setup('editing');
    const button = container.querySelector<HTMLButtonElement>(
      '.oa-font-scale-panel__annotation',
    );

    expect(button?.disabled).toBe(true);
    expect(button?.getAttribute('aria-label')).toContain('apenas no modo leitura');
    control.destroy();
  });

  it('alterna o modo Zen, fecha o painel e expõe estado e ícone acessíveis', () => {
    const { control, zenMode, container } = setup();
    const trigger = container.querySelector<HTMLButtonElement>('.oa-font-scale-trigger');
    const panel = container.querySelector<HTMLElement>('.oa-font-scale-panel');
    const status = container.querySelector<HTMLElement>('.oa-visually-hidden');
    const button = container.querySelector<HTMLButtonElement>(
      '.oa-font-scale-panel__zen-mode',
    );

    expect(button?.getAttribute('aria-pressed')).toBe('false');
    expect(button?.dataset.icon).toBe('focus');
    trigger?.click();
    button?.click();

    expect(zenMode.active).toBe(true);
    expect(button?.getAttribute('aria-pressed')).toBe('true');
    expect(button?.getAttribute('aria-label')).toBe('Sair do modo zen');
    expect(button?.dataset.icon).toBe('minimize-2');
    expect(button?.classList.contains('is-active')).toBe(true);
    expect(panel?.hidden).toBe(true);
    expect(status?.textContent).toBe('Modo zen ativado');
    expect(trigger?.getAttribute('aria-label')).toBe(
      'Modo zen ativo. Abrir controles de acessibilidade',
    );

    trigger?.click();
    button?.click();
    expect(zenMode.active).toBe(false);
    expect(button?.getAttribute('aria-pressed')).toBe('false');
    expect(button?.dataset.icon).toBe('focus');
    expect(status?.textContent).toBe('Modo zen desativado');
    control.destroy();
    zenMode.destroy();
  });

  it('fecha primeiro o painel e depois sai do modo Zen por Escape', () => {
    const { control, zenMode, container } = setup();
    const trigger = container.querySelector<HTMLButtonElement>('.oa-font-scale-trigger');
    const panel = container.querySelector<HTMLElement>('.oa-font-scale-panel');
    const button = container.querySelector<HTMLButtonElement>(
      '.oa-font-scale-panel__zen-mode',
    );
    trigger?.click();
    button?.click();
    trigger?.click();

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(panel?.hidden).toBe(true);
    expect(zenMode.active).toBe(true);

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(zenMode.active).toBe(false);
    control.destroy();
    zenMode.destroy();
  });

  it('restaura o tamanho pelo botão inferior padronizado', () => {
    const { control, store, controller, container } = setup();
    store.setScale('reading', 66);

    container.querySelector<HTMLButtonElement>('.oa-font-scale-panel__reset')?.click();

    expect(store.activeProfile.readingSize).toBe(55);
    expect(controller.applyScaleWithAnchor).toHaveBeenCalled();
    control.destroy();
  });
});

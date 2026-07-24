// @vitest-environment happy-dom

import { describe, expect, it } from 'vitest';

import {
  HighlightColorController,
  highlightForeground,
} from '../src/highlight-color-controller';
import { ScaleStore } from '../src/scale-store';
import { DEFAULT_SETTINGS } from '../src/settings-model';

function luminance(color: string): number {
  const channels = [1, 3, 5].map((offset) => Number.parseInt(color.slice(offset, offset + 2), 16));
  const linear = channels.map((channel) => {
    const normalized = channel / 255;
    return normalized <= 0.04045
      ? normalized / 12.92
      : ((normalized + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * (linear[0] ?? 0) + 0.7152 * (linear[1] ?? 0) + 0.0722 * (linear[2] ?? 0);
}

function contrast(first: string, second: string): number {
  const lighter = Math.max(luminance(first), luminance(second));
  const darker = Math.min(luminance(first), luminance(second));
  return (lighter + 0.05) / (darker + 0.05);
}

describe('cor personalizada do destaque', () => {
  it.each(['#ffd000', '#1d4ed8', '#5b21b6', '#777777', '#ffffff', '#000000'])(
    'escolhe preto ou branco com contraste mínimo para %s',
    (background) => {
      const foreground = highlightForeground(background);
      expect(contrast(background, foreground)).toBeGreaterThanOrEqual(4.5);
    },
  );

  it('aplica e remove a preferência somente no contêiner montado', () => {
    const container = document.createElement('div');
    const store = new ScaleStore(DEFAULT_SETTINGS, async () => undefined);
    const controller = new HighlightColorController(store);
    const view = { containerEl: container };

    controller.mount(view as never);
    expect(container.classList.contains('oa-highlight-color-active')).toBe(false);

    store.setHighlightColor('#1D4ED8');
    controller.refresh();
    expect(container.classList.contains('oa-highlight-color-active')).toBe(true);
    expect(container.style.getPropertyValue('--oa-highlight-background')).toBe('#1d4ed8');
    expect(container.style.getPropertyValue('--oa-highlight-foreground')).toBe('#ffffff');

    store.setHighlightColor(null);
    controller.refresh();
    expect(container.classList.contains('oa-highlight-color-active')).toBe(false);
    expect(container.style.getPropertyValue('--oa-highlight-background')).toBe('');
    expect(container.style.getPropertyValue('--oa-highlight-foreground')).toBe('');
  });

  it('limpa classe e variáveis ao mudar de folha ou desmontar', () => {
    const first = document.createElement('div');
    const second = document.createElement('div');
    const store = new ScaleStore(
      { ...DEFAULT_SETTINGS, highlightColor: '#ffd000' },
      async () => undefined,
    );
    const controller = new HighlightColorController(store);

    controller.mount({ containerEl: first } as never);
    controller.mount({ containerEl: second } as never);
    expect(first.classList.contains('oa-highlight-color-active')).toBe(false);
    expect(second.classList.contains('oa-highlight-color-active')).toBe(true);

    controller.unmount();
    expect(second.classList.contains('oa-highlight-color-active')).toBe(false);
    expect(second.style.getPropertyValue('--oa-highlight-background')).toBe('');
  });

  it('persiste a cor normalizada e o retorno ao tema', async () => {
    const persisted: Array<string | null> = [];
    const store = new ScaleStore(DEFAULT_SETTINGS, async (settings) => {
      persisted.push(settings.highlightColor);
    });

    store.setHighlightColor('#1D4ED8');
    await store.flush();
    store.setHighlightColor(null);
    await store.flush();

    expect(persisted).toEqual(['#1d4ed8', null]);
  });
});

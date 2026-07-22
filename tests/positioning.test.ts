import { describe, expect, it } from 'vitest';
import { computePanelPosition } from '../src/positioning';

const container = {
  top: 0,
  right: 1024,
  bottom: 768,
  left: 0,
  width: 1024,
  height: 768,
};

describe('computePanelPosition', () => {
  it('sobrepõe o botão e centraliza verticalmente no lado direito', () => {
    const position = computePanelPosition(
      { top: 348, right: 1006, bottom: 420, left: 934, width: 72, height: 72 },
      { width: 75, height: 450 },
      container,
      { width: 1024, height: 768 },
      'right',
      'center',
    );

    expect(position).toEqual({ left: 931, top: 159 });
  });

  it('sobrepõe o botão e mantém a borda externa no lado esquerdo', () => {
    const position = computePanelPosition(
      { top: 348, right: 90, bottom: 420, left: 18, width: 72, height: 72 },
      { width: 75, height: 420 },
      container,
      { width: 1024, height: 768 },
      'left',
      'center',
    );

    expect(position.top).toBe(174);
    expect(position.left).toBe(18);
  });

  it('contém verticalmente quando o painel excede o espaço central', () => {
    const position = computePanelPosition(
      { top: 18, right: 90, bottom: 90, left: 18, width: 72, height: 72 },
      { width: 75, height: 600 },
      container,
      { width: 1024, height: 768 },
      'left',
      'center',
    );

    expect(position.top).toBe(12);
  });

  it('contém o painel em viewport estreito', () => {
    const narrow = { ...container, right: 320, width: 320 };
    const position = computePanelPosition(
      { top: 348, right: 302, bottom: 420, left: 230, width: 72, height: 72 },
      { width: 75, height: 450 },
      narrow,
      { width: 320, height: 640 },
      'right',
      'center',
    );

    expect(position.left).toBeLessThanOrEqual(233);
    expect(position.left).toBeGreaterThanOrEqual(12);
  });

  it('sobrepõe o botão à direita a partir do topo', () => {
    const position = computePanelPosition(
      { top: 18, right: 1006, bottom: 90, left: 934, width: 72, height: 72 },
      { width: 75, height: 450 },
      container,
      { width: 1024, height: 768 },
      'right',
      'top',
    );

    expect(position).toEqual({ left: 931, top: 18 });
  });

  it('sobrepõe o botão à esquerda a partir da base', () => {
    const position = computePanelPosition(
      { top: 678, right: 90, bottom: 750, left: 18, width: 72, height: 72 },
      { width: 75, height: 450 },
      container,
      { width: 1024, height: 768 },
      'left',
      'bottom',
    );

    expect(position).toEqual({ left: 18, top: 300 });
  });

  it.each([
    ['left', 'top'],
    ['left', 'center'],
    ['left', 'bottom'],
    ['right', 'top'],
    ['right', 'center'],
    ['right', 'bottom'],
  ] as const)('aceita a combinação %s/%s', (side, verticalPosition) => {
    expect(() =>
      computePanelPosition(
        { top: 348, right: 1006, bottom: 420, left: 934, width: 72, height: 72 },
        { width: 75, height: 450 },
        container,
        { width: 1024, height: 768 },
        side,
        verticalPosition,
      ),
    ).not.toThrow();
  });
});

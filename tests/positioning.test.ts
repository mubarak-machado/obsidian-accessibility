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
    );

    expect(position.left).toBeLessThanOrEqual(233);
    expect(position.left).toBeGreaterThanOrEqual(12);
  });
});

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
      { top: 360, right: 1000, bottom: 408, left: 952, width: 48, height: 48 },
      { width: 104, height: 310 },
      container,
      { width: 1024, height: 768 },
      'right',
    );

    expect(position).toEqual({ left: 896, top: 229 });
  });

  it('sobrepõe o botão e mantém a borda externa no lado esquerdo', () => {
    const position = computePanelPosition(
      { top: 360, right: 60, bottom: 408, left: 12, width: 48, height: 48 },
      { width: 88, height: 280 },
      container,
      { width: 1024, height: 768 },
      'left',
    );

    expect(position.top).toBe(244);
    expect(position.left).toBe(12);
  });

  it('contém verticalmente quando o painel excede o espaço central', () => {
    const position = computePanelPosition(
      { top: 16, right: 60, bottom: 64, left: 12, width: 48, height: 48 },
      { width: 88, height: 400 },
      container,
      { width: 1024, height: 768 },
      'left',
    );

    expect(position.top).toBe(8);
  });

  it('contém o painel em viewport estreito', () => {
    const narrow = { ...container, right: 320, width: 320 };
    const position = computePanelPosition(
      { top: 400, right: 316, bottom: 448, left: 268, width: 48, height: 48 },
      { width: 104, height: 300 },
      narrow,
      { width: 320, height: 640 },
      'right',
    );

    expect(position.left).toBeLessThanOrEqual(208);
    expect(position.left).toBeGreaterThanOrEqual(8);
  });
});

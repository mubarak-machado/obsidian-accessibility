// @vitest-environment happy-dom

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ZEN_MODE_CLASS, ZenModeController } from '../src/zen-mode-controller';

class Sidebar {
  readonly collapse = vi.fn(() => {
    this.collapsed = true;
  });
  readonly expand = vi.fn(() => {
    this.collapsed = false;
  });

  constructor(public collapsed: boolean) {}
}

beforeEach(() => {
  document.body.className = '';
});

describe('ZenModeController', () => {
  it.each([
    [false, false],
    [false, true],
    [true, false],
    [true, true],
  ])('recolhe e restaura exatamente as sidebars (%s, %s)', (leftState, rightState) => {
    const leftSplit = new Sidebar(leftState);
    const rightSplit = new Sidebar(rightState);
    const zenMode = new ZenModeController(document.body, { leftSplit, rightSplit });

    zenMode.enter();
    expect(zenMode.active).toBe(true);
    expect(document.body.classList.contains(ZEN_MODE_CLASS)).toBe(true);
    expect(leftSplit.collapsed).toBe(true);
    expect(rightSplit.collapsed).toBe(true);

    zenMode.exit();
    expect(zenMode.active).toBe(false);
    expect(document.body.classList.contains(ZEN_MODE_CLASS)).toBe(false);
    expect(leftSplit.collapsed).toBe(leftState);
    expect(rightSplit.collapsed).toBe(rightState);
  });

  it('mantém o drawer direito disponível durante o modo e restaura seu estado anterior', () => {
    const leftSplit = new Sidebar(true);
    const rightSplit = new Sidebar(true);
    const zenMode = new ZenModeController(document.body, { leftSplit, rightSplit });

    zenMode.enter();
    rightSplit.expand();
    expect(rightSplit.collapsed).toBe(false);

    zenMode.exit();
    expect(rightSplit.collapsed).toBe(true);
    expect(rightSplit.collapse).toHaveBeenCalled();
  });

  it('remove sempre a classe própria mesmo quando a API de sidebar falha', () => {
    const leftSplit = new Sidebar(false);
    const rightSplit = new Sidebar(false);
    leftSplit.collapse.mockImplementation(() => {
      throw new Error('falha simulada');
    });
    rightSplit.expand.mockImplementation(() => {
      throw new Error('falha simulada');
    });
    const zenMode = new ZenModeController(document.body, { leftSplit, rightSplit });

    expect(() => zenMode.enter()).not.toThrow();
    expect(() => zenMode.destroy()).not.toThrow();
    expect(zenMode.active).toBe(false);
    expect(document.body.classList.contains(ZEN_MODE_CLASS)).toBe(false);
  });

  it('notifica mudanças reais e não repete entrada ou saída', () => {
    const zenMode = new ZenModeController(document.body, {
      leftSplit: new Sidebar(false),
      rightSplit: new Sidebar(false),
    });
    const listener = vi.fn();
    zenMode.subscribe(listener);

    zenMode.enter();
    zenMode.enter();
    zenMode.exit();
    zenMode.exit();

    expect(listener.mock.calls).toEqual([[true], [false]]);
  });
});

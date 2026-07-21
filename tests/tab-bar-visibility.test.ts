// @vitest-environment happy-dom

import { beforeEach, describe, expect, it } from 'vitest';

import { TAB_BAR_HIDDEN_CLASS, TabBarVisibility } from '../src/tab-bar-visibility';

beforeEach(() => {
  document.body.className = '';
});

describe('TabBarVisibility', () => {
  it('aplica o estado ao body e sempre restaura a interface ao destruir', () => {
    const visibility = new TabBarVisibility(document.body);

    visibility.sync(true);
    expect(document.body.classList.contains(TAB_BAR_HIDDEN_CLASS)).toBe(true);

    visibility.sync(false);
    expect(document.body.classList.contains(TAB_BAR_HIDDEN_CLASS)).toBe(false);

    visibility.sync(true);
    visibility.destroy();
    expect(document.body.classList.contains(TAB_BAR_HIDDEN_CLASS)).toBe(false);
  });
});

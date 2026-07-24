import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

const styles = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');
const settingsSource = readFileSync(
  new URL('../src/settings-tab.ts', import.meta.url),
  'utf8',
);

describe('escopo visual da cor do destaque', () => {
  it('cobre leitura e editor sem alterar resultados de busca', () => {
    expect(styles).toContain('.oa-highlight-color-active');
    expect(styles).toContain('.markdown-rendered\n  mark');
    expect(styles).toContain('span.cm-formatting-highlight');
    expect(styles).toContain('span.cm-highlight:not(.obsidian-search-match-highlight)');
    expect(styles).toContain('--text-highlight-bg: var(--oa-highlight-background);');
    expect(styles).toContain('color: var(--oa-highlight-foreground);');
    expect(styles).toContain('mix-blend-mode: normal;');
  });

  it('não cria regra global nem grava a cor diretamente no CSS', () => {
    expect(styles).not.toMatch(/^:root\s*\{[^}]*--text-highlight-bg/ms);
    expect(styles).not.toContain('background-color: #ffd000');
  });

  it('usa controles públicos com nome e descrição acessíveis', () => {
    expect(settingsSource).toContain('.addColorPicker(');
    expect(settingsSource).toContain("'aria-label', 'Escolher cor do destaque'");
    expect(settingsSource).toContain("'aria-describedby', 'oa-highlight-color-description'");
    expect(settingsSource).toContain("'Usar cor do tema'");
    expect(settingsSource).toContain("'Usar esta cor'");
  });
});

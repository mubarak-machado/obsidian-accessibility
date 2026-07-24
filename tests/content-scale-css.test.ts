import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

const styles = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');
const harness = readFileSync(
  new URL('./visual/content-scale-harness.html', import.meta.url),
  'utf8',
);

function ruleFor(selector: string): string {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const rule = styles.match(new RegExp(`${escaped} \\{(?<rule>[\\s\\S]*?)\\n\\}`))
    ?.groups?.rule;
  if (!rule) throw new Error(`Regra CSS ausente: ${selector}`);
  return rule;
}

describe('escala tipográfica do conteúdo', () => {
  it('define o token oficial do Obsidian separadamente em Leitura e Edição', () => {
    const reading = ruleFor(
      "body .workspace-leaf-content[data-type='markdown'].oa-scale-active .markdown-preview-view",
    );
    const editing = ruleFor(
      "body .workspace-leaf-content[data-type='markdown'].oa-scale-active .markdown-source-view",
    );

    expect(reading).toContain('--font-text-size: var(--oa-scale-reading-size);');
    expect(reading).toContain('font-size: var(--font-text-size);');
    expect(editing).toContain('--font-text-size: var(--oa-scale-editing-size);');
  });

  it('faz a linha-base do CodeMirror consumir o mesmo token sem escalar a interface', () => {
    const content = ruleFor(
      "body .workspace-leaf-content[data-type='markdown'].oa-scale-active .markdown-source-view .cm-content",
    );

    expect(content).toContain('font-size: var(--font-text-size);');
    expect(styles).not.toMatch(
      /\.oa-font-scale-root\s*\{[\s\S]*?--font-text-size:/,
    );
    expect(styles).not.toContain('zoom:');
  });

  it('reancora tokens que o Obsidian resolve no escopo global', () => {
    expect(styles).toContain(
      ':is(.markdown-preview-view, .markdown-source-view) {',
    );
    expect(styles).toContain(
      '--metadata-input-height: calc(var(--font-text-size) * 1.75);',
    );
    expect(styles).toContain('--table-text-size: var(--font-text-size);');
    expect(styles).toContain('--table-header-size: var(--table-text-size);');
  });

  it('limita título interno e H1 a 120%, e H2–H6 a 110%', () => {
    const typography = ruleFor(
      "body\n  .workspace-leaf-content[data-type='markdown'].oa-scale-active\n  :is(.markdown-preview-view, .markdown-source-view)",
    );

    expect(typography).toContain('--h1-size: 1.2em;');
    for (const level of [2, 3, 4, 5, 6]) {
      expect(typography).toContain(`--h${level}-size: 1.1em;`);
    }
    expect(typography).toContain('--inline-title-size: var(--h1-size);');
    expect(typography).not.toMatch(
      /--(?:inline-title|h[1-6])-(?:color|font|weight|line-height):/,
    );
    for (const level of [1, 2, 3, 4, 5, 6]) {
      expect(harness).toContain(`color: var(--h${level}-color);`);
    }
  });

  it('mantém transclusões da Visualização ao vivo na escala de Edição', () => {
    const embeddedEditing = ruleFor(
      "body\n  .workspace-leaf-content[data-type='markdown'].oa-scale-active\n  .markdown-source-view\n  .markdown-preview-view",
    );

    expect(embeddedEditing).toContain(
      '--font-text-size: var(--oa-scale-editing-size);',
    );
  });

  it('mantém uma amostra visual de todos os grupos semânticos auditados', () => {
    for (const sample of [
      'inline-title',
      'heading-1',
      'heading-2',
      'heading-3',
      'heading-4',
      'heading-5',
      'heading-6',
      'paragraph',
      'list',
      'blockquote',
      'callout',
      'table-cell',
      'inline-code',
      'code-block',
      'math',
      'tag',
      'footnote',
      'metadata',
      'embed',
      'embed-content',
    ]) {
      expect(harness).toContain(`data-audit="${sample}"`);
    }
  });
});

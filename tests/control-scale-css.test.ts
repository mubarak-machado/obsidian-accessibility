import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

const styles = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');

describe('escala visual do controle', () => {
  it('oferece 150%, 100% e 50% com layout intrínseco', () => {
    expect(styles).toContain('--oa-launcher-size: 72px;');
    expect(styles).toContain('--oa-panel-width: 75px;');
    expect(styles).toContain('--oa-control-size: 66px;');
    expect(styles).toContain('.oa-font-scale-root.is-scale-medium');
    expect(styles).toContain('--oa-launcher-size: 48px;');
    expect(styles).toContain('--oa-panel-width: 50px;');
    expect(styles).toContain('--oa-control-size: 44px;');
    expect(styles).toContain('.oa-font-scale-root.is-scale-small');
    expect(styles).toContain('--oa-launcher-size: 24px;');
    expect(styles).toContain('--oa-panel-width: 25px;');
    expect(styles).toContain('--oa-control-size: 22px;');
    expect(styles).toContain('.oa-font-scale-trigger__icon svg');
    expect(styles).toContain('border-radius: 50%;');
    expect(styles).toContain('font-size: var(--oa-step-font-size);');
    expect(styles).toContain('font-size: var(--oa-label-font-size);');
    expect(styles).toContain('height: clamp(var(--oa-range-min), 27vh, var(--oa-range-max));');
    expect(styles).toContain('--oa-thumb-size: 33px;');
    expect(styles).toContain('@media (max-height: 840px)');
    expect(styles).toContain('height: var(--oa-range-compact);');
    expect(styles).not.toContain('zoom:');
    expect(styles).not.toContain('scale(1.5)');
  });

  it('alinha trilho e puxador pela mesma linha central', () => {
    const trackRule = styles.match(
      /\.oa-font-scale-panel__range-track \{(?<rule>[\s\S]*?)\n\}/,
    )?.groups?.rule;
    const thumbRule = styles.match(
      /\.oa-font-scale-panel__range-thumb \{(?<rule>[\s\S]*?)\n\}/,
    )?.groups?.rule;

    expect(trackRule).toContain('left: 50%;');
    expect(trackRule).toContain('transform: translateX(-50%);');
    expect(thumbRule).toContain('left: 50%;');
    expect(thumbRule).toContain('transform: translate(-50%, -50%);');
    expect(thumbRule).toContain('top: var(--oa-font-scale-range-position, 50%);');
  });

  it('mantém o range nativo acessível sem delegar a ele a pintura ou o toque', () => {
    const rangeRule = styles.match(
      /\.oa-font-scale-panel input\[type='range'\]\.oa-font-scale-panel__range \{(?<rule>[\s\S]*?)\n\}/,
    )?.groups?.rule;

    expect(rangeRule).toContain('writing-mode: vertical-lr;');
    expect(rangeRule).toContain('direction: rtl;');
    expect(rangeRule).toContain('opacity: 0;');
    expect(rangeRule).toContain('pointer-events: none;');
    expect(styles).not.toContain('::-webkit-slider-thumb');
  });

  it('combina dois lados com três alturas e preserva áreas seguras', () => {
    expect(styles).toContain('.oa-font-scale-root.is-center .oa-font-scale-trigger');
    expect(styles).toContain('.oa-font-scale-root.is-right .oa-font-scale-trigger');
    expect(styles).toContain('.oa-font-scale-root.is-left .oa-font-scale-trigger');
    expect(styles).toContain('.oa-font-scale-root.is-top .oa-font-scale-trigger');
    expect(styles).toContain('.oa-font-scale-root.is-bottom .oa-font-scale-trigger');
    expect(styles).toContain('env(safe-area-inset-top, 0px)');
    expect(styles).toContain('env(safe-area-inset-right, 0px)');
    expect(styles).toContain('env(safe-area-inset-bottom, 0px)');
    expect(styles).toContain('env(safe-area-inset-left, 0px)');
  });

  it('reduz somente a opacidade do acionador em repouso', () => {
    expect(styles).toContain(
      ".oa-font-scale-root.is-idle .oa-font-scale-trigger:not([aria-expanded='true'])",
    );
    expect(styles).toContain('opacity: 0.5;');
    expect(styles).toContain('opacity 180ms ease');
    expect(styles).toContain('@media (prefers-reduced-transparency: reduce)');
  });

  it('representa a anotação ativa sem nova paleta de cores ou redimensionamento', () => {
    expect(styles).toContain('.oa-font-scale-panel__annotation.is-active');
    expect(styles).toContain('.oa-font-scale-panel__mode.is-annotation-mode::after');
    expect(styles).toContain('background: var(--text-highlight-bg);');
    expect(styles).toContain('.oa-font-scale-panel__button:disabled');
    expect(styles).not.toContain('--oa-annotation-color');
  });
});

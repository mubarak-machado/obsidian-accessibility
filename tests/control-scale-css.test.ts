import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

const styles = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');

describe('escala visual do controle', () => {
  it('mantém os principais componentes em 150% da dimensão original', () => {
    expect(styles).toContain('width: 72px;');
    expect(styles).toContain('width: 75px;');
    expect(styles).toContain('width: 66px;');
    expect(styles).toContain('.oa-font-scale-trigger__icon svg');
    expect(styles).toContain('border-radius: 50%;');
    expect(styles).toContain('font-size: 45px;');
    expect(styles).toContain('font-size: 16.5px;');
    expect(styles).toContain('height: clamp(222px, 27vh, 255px);');
    expect(styles).toContain('--oa-font-scale-thumb-size: 33px;');
    expect(styles).toContain('@media (max-height: 840px)');
    expect(styles).toContain('height: 180px;');
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
});

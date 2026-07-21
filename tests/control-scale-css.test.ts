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
    expect(styles).toContain('width: clamp(222px, 27vh, 255px);');
    expect(styles).toContain('width: 33px;');
    expect(styles).toContain('@media (max-height: 840px)');
    expect(styles).toContain('height: 180px;');
  });
});

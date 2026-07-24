import { describe, expect, it } from 'vitest';

interface ContrastTheme {
  background: string;
  backgroundAlt: string;
  hover: string;
  name: string;
  text: string;
}

const REPRESENTATIVE_THEMES: ContrastTheme[] = [
  {
    name: 'claro',
    background: '#ffffff',
    backgroundAlt: '#f3f3f5',
    hover: '#e7e7eb',
    text: '#2e3338',
  },
  {
    name: 'escuro',
    background: '#201e27',
    backgroundAlt: '#292633',
    hover: '#35313f',
    text: '#f5f2fa',
  },
];

describe('contraste dos controles', () => {
  it.each(REPRESENTATIVE_THEMES)(
    'mantém texto e rótulos acima de 4,5:1 no tema $name',
    (theme) => {
      expect(contrast(theme.text, theme.background)).toBeGreaterThanOrEqual(4.5);
      expect(contrast(theme.text, theme.backgroundAlt)).toBeGreaterThanOrEqual(4.5);
    },
  );

  it.each(REPRESENTATIVE_THEMES)(
    'mantém ícones, anel ativo e foco acima de 3:1 no tema $name',
    (theme) => {
      expect(contrast(theme.text, theme.background)).toBeGreaterThanOrEqual(3);
      expect(contrast(theme.text, theme.hover)).toBeGreaterThanOrEqual(3);
    },
  );
});

function contrast(foreground: string, background: string): number {
  const foregroundLuminance = relativeLuminance(foreground);
  const backgroundLuminance = relativeLuminance(background);
  const lighter = Math.max(foregroundLuminance, backgroundLuminance);
  const darker = Math.min(foregroundLuminance, backgroundLuminance);
  return (lighter + 0.05) / (darker + 0.05);
}

function relativeLuminance(color: string): number {
  const channels = color
    .slice(1)
    .match(/.{2}/g)
    ?.map((channel) => Number.parseInt(channel, 16) / 255);
  if (!channels || channels.length !== 3) throw new Error(`Cor hexadecimal inválida: ${color}`);
  const [red = 0, green = 0, blue = 0] = channels.map((channel) =>
    channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4,
  );
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

import { describe, expect, it } from 'vitest';
import {
  DEFAULT_SETTINGS,
  clampScale,
  detectProfile,
  hasCurrentSettingsSchema,
  migrateFromStyleSettings,
  normalizeSettings,
} from '../src/settings-model';

function classList(...classes: string[]): DOMTokenList {
  return {
    contains: (value: string) => classes.includes(value),
  } as DOMTokenList;
}

describe('normalizeSettings', () => {
  it('retorna defaults seguros para dados inválidos', () => {
    expect(normalizeSettings(null)).toEqual(DEFAULT_SETTINGS);
    expect(normalizeSettings([])).toEqual(DEFAULT_SETTINGS);
  });

  it('limita escalas e preserva escolhas válidas', () => {
    const settings = normalizeSettings({
      enabled: false,
      tabBarHidden: true,
      side: 'left',
      activeProfile: 'presentation',
      profiles: {
        presentation: { readingSize: 999, editingSize: 1, lineHeight: 9 },
      },
    });

    expect(settings.enabled).toBe(false);
    expect(settings.tabBarHidden).toBe(true);
    expect(settings.side).toBe('left');
    expect(settings.activeProfile).toBe('presentation');
    expect(settings.profiles.presentation).toEqual({
      readingSize: 75,
      editingSize: 40,
      lineHeight: 1.6,
    });
  });

  it('normaliza visibilidade inválida da barra de abas para visível', () => {
    expect(normalizeSettings({ tabBarHidden: 'sim' }).tabBarHidden).toBe(false);
  });

  it('distingue migração inicial de dados já versionados', () => {
    expect(hasCurrentSettingsSchema(DEFAULT_SETTINGS)).toBe(true);
    expect(hasCurrentSettingsSchema({ activeProfile: 'research' })).toBe(false);
  });
});

describe('migração do Style Settings', () => {
  it('detecta o perfil e importa os tokens atuais', () => {
    const body = {
      classList: classList('oa-f1-profile-pesquisa'),
    } as HTMLElement;
    const values: Record<string, string> = {
      '--oa-f1-reading-size': '62px',
      '--oa-f1-editing-size': '48px',
      '--oa-f1-line-height': '1.35',
    };
    const style = {
      getPropertyValue: (property: string) => values[property] ?? '',
    } as CSSStyleDeclaration;

    const migrated = migrateFromStyleSettings(DEFAULT_SETTINGS, body, style);
    expect(detectProfile(body)).toBe('research');
    expect(migrated.activeProfile).toBe('research');
    expect(migrated.profiles.research).toEqual({
      readingSize: 62,
      editingSize: 48,
      lineHeight: 1.35,
    });
  });
});

describe('clampScale', () => {
  it('mantém as faixas aprovadas de leitura e edição', () => {
    expect(clampScale('reading', 10)).toBe(32);
    expect(clampScale('reading', 90)).toBe(75);
    expect(clampScale('editing', 10)).toBe(40);
    expect(clampScale('editing', 90)).toBe(60);
  });
});

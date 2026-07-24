import { describe, expect, it } from 'vitest';
import {
  DEFAULT_SETTINGS,
  clampScale,
  detectProfile,
  hasCurrentSettingsSchema,
  migrateFromStyleSettings,
  normalizeHighlightColor,
  normalizeSettings,
  shouldMigrateFromStyleSettings,
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
      side: 'left',
      verticalPosition: 'top',
      controlScale: 'medium',
      activeProfile: 'presentation',
      profiles: {
        presentation: { readingSize: 999, editingSize: 1, lineHeight: 9 },
      },
    });

    expect(settings.enabled).toBe(false);
    expect(settings.side).toBe('left');
    expect(settings.verticalPosition).toBe('top');
    expect(settings.controlScale).toBe('medium');
    expect(settings.highlightColor).toBeNull();
    expect(settings.activeProfile).toBe('presentation');
    expect(settings.profiles.presentation).toEqual({
      readingSize: 75,
      editingSize: 32,
      lineHeight: 1.6,
    });
  });

  it.each(['presentation', 'preparation', 'research'] as const)(
    'normaliza leitura e edição de %s para o mínimo comum de 32 px',
    (profileId) => {
      const settings = normalizeSettings({
        profiles: {
          [profileId]: { readingSize: 1, editingSize: 1, lineHeight: 1.2 },
        },
      });

      expect(settings.profiles[profileId].readingSize).toBe(32);
      expect(settings.profiles[profileId].editingSize).toBe(32);
    },
  );

  it('descarta o estado persistente legado da barra de abas', () => {
    const migrated = normalizeSettings({
      ...DEFAULT_SETTINGS,
      schemaVersion: 1,
      tabBarHidden: true,
    });

    expect(migrated).not.toHaveProperty('tabBarHidden');
    expect(migrated.schemaVersion).toBe(4);
    expect(hasCurrentSettingsSchema({ ...DEFAULT_SETTINGS, schemaVersion: 1 })).toBe(false);
  });

  it.each(['right', 'left'] as const)(
    'migra a posição lateral %s do esquema anterior',
    (side) => {
      const migrated = normalizeSettings({
        ...DEFAULT_SETTINGS,
        schemaVersion: 2,
        side,
      });

      expect(migrated.side).toBe(side);
      expect(migrated.verticalPosition).toBe('center');
      expect(migrated.controlScale).toBe('large');
      expect(migrated.schemaVersion).toBe(4);
    },
  );

  it.each(['bottom', 'center', 'top'] as const)(
    'preserva a posição vertical válida %s',
    (verticalPosition) => {
      expect(normalizeSettings({ verticalPosition }).verticalPosition).toBe(verticalPosition);
    },
  );

  it.each(['large', 'medium', 'small'] as const)(
    'preserva a escala válida %s',
    (controlScale) => {
      expect(normalizeSettings({ controlScale }).controlScale).toBe(controlScale);
    },
  );

  it('normaliza posicionamento e escala inválidos para os padrões seguros', () => {
    const settings = normalizeSettings({
      side: 'center',
      verticalPosition: 'middle',
      controlScale: 'tiny',
    });

    expect(settings.side).toBe('right');
    expect(settings.verticalPosition).toBe('center');
    expect(settings.controlScale).toBe('large');
  });

  it('distingue migração inicial de dados já versionados', () => {
    expect(hasCurrentSettingsSchema(DEFAULT_SETTINGS)).toBe(true);
    expect(hasCurrentSettingsSchema({ activeProfile: 'research' })).toBe(false);
  });

  it('preserva somente cores hexadecimais completas e normalizadas', () => {
    expect(normalizeHighlightColor('#1D4ED8')).toBe('#1d4ed8');
    expect(normalizeSettings({ highlightColor: '#5B21B6' }).highlightColor).toBe(
      '#5b21b6',
    );
    expect(normalizeHighlightColor('#fff')).toBeNull();
    expect(normalizeHighlightColor('red')).toBeNull();
    expect(normalizeHighlightColor(null)).toBeNull();
  });

  it('não repete a importação do Style Settings ao migrar do esquema 3', () => {
    expect(shouldMigrateFromStyleSettings(null)).toBe(true);
    expect(shouldMigrateFromStyleSettings({ schemaVersion: 2 })).toBe(true);
    expect(shouldMigrateFromStyleSettings({ schemaVersion: 3 })).toBe(false);
    expect(shouldMigrateFromStyleSettings(DEFAULT_SETTINGS)).toBe(false);
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
  it('mantém mínimo comum e máximos próprios de leitura e edição', () => {
    expect(clampScale('reading', 10)).toBe(32);
    expect(clampScale('reading', 90)).toBe(75);
    expect(clampScale('editing', 10)).toBe(32);
    expect(clampScale('editing', 90)).toBe(60);
  });
});

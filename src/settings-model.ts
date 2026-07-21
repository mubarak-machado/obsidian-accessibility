export const SETTINGS_SCHEMA_VERSION = 2;

export type ProfileId = 'presentation' | 'preparation' | 'research';
export type ControlSide = 'left' | 'right';
export type ScaleMode = 'reading' | 'editing';

export interface ProfileScaleSettings {
  readingSize: number;
  editingSize: number;
  lineHeight: number;
}

export interface AccessibilitySettings {
  schemaVersion: number;
  enabled: boolean;
  side: ControlSide;
  activeProfile: ProfileId;
  profiles: Record<ProfileId, ProfileScaleSettings>;
}

export const PROFILE_IDS: readonly ProfileId[] = [
  'presentation',
  'preparation',
  'research',
];

export const PROFILE_LABELS: Record<ProfileId, string> = {
  presentation: 'Apresentação',
  preparation: 'Preparação',
  research: 'Pesquisa',
};

export const PROFILE_CLASSES: Record<ProfileId, string> = {
  presentation: 'oa-f1-profile-apresentacao',
  preparation: 'oa-f1-profile-preparacao',
  research: 'oa-f1-profile-pesquisa',
};

export const DEFAULT_SETTINGS: AccessibilitySettings = {
  schemaVersion: SETTINGS_SCHEMA_VERSION,
  enabled: true,
  side: 'right',
  activeProfile: 'preparation',
  profiles: {
    presentation: { readingSize: 65, editingSize: 50, lineHeight: 1.2 },
    preparation: { readingSize: 55, editingSize: 50, lineHeight: 1.2 },
    research: { readingSize: 55, editingSize: 50, lineHeight: 1.2 },
  },
};

const READING_MIN = 32;
const READING_MAX = 75;
const EDITING_MIN = 40;
const EDITING_MAX = 60;
const LINE_HEIGHT_MIN = 1.1;
const LINE_HEIGHT_MAX = 1.6;

function clamp(value: unknown, minimum: number, maximum: number, fallback: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback;
  return Math.min(maximum, Math.max(minimum, value));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function profileId(value: unknown): ProfileId {
  return PROFILE_IDS.includes(value as ProfileId)
    ? (value as ProfileId)
    : DEFAULT_SETTINGS.activeProfile;
}

function side(value: unknown): ControlSide {
  return value === 'left' || value === 'right' ? value : DEFAULT_SETTINGS.side;
}

function normalizedProfile(
  value: unknown,
  fallback: ProfileScaleSettings,
): ProfileScaleSettings {
  const source = isRecord(value) ? value : {};
  return {
    readingSize: clamp(source.readingSize, READING_MIN, READING_MAX, fallback.readingSize),
    editingSize: clamp(source.editingSize, EDITING_MIN, EDITING_MAX, fallback.editingSize),
    lineHeight: clamp(
      source.lineHeight,
      LINE_HEIGHT_MIN,
      LINE_HEIGHT_MAX,
      fallback.lineHeight,
    ),
  };
}

export function normalizeSettings(value: unknown): AccessibilitySettings {
  const source = isRecord(value) ? value : {};
  const profiles = isRecord(source.profiles) ? source.profiles : {};

  return {
    schemaVersion: SETTINGS_SCHEMA_VERSION,
    enabled: typeof source.enabled === 'boolean' ? source.enabled : DEFAULT_SETTINGS.enabled,
    side: side(source.side),
    activeProfile: profileId(source.activeProfile),
    profiles: {
      presentation: normalizedProfile(
        profiles.presentation,
        DEFAULT_SETTINGS.profiles.presentation,
      ),
      preparation: normalizedProfile(
        profiles.preparation,
        DEFAULT_SETTINGS.profiles.preparation,
      ),
      research: normalizedProfile(profiles.research, DEFAULT_SETTINGS.profiles.research),
    },
  };
}

export function hasCurrentSettingsSchema(value: unknown): boolean {
  return isRecord(value) && value.schemaVersion === SETTINGS_SCHEMA_VERSION;
}

export function detectProfile(body: HTMLElement): ProfileId | null {
  for (const id of PROFILE_IDS) {
    if (body.classList.contains(PROFILE_CLASSES[id])) return id;
  }
  return null;
}

function parseCssNumber(style: CSSStyleDeclaration, property: string): number | null {
  const parsed = Number.parseFloat(style.getPropertyValue(property));
  return Number.isFinite(parsed) ? parsed : null;
}

export function migrateFromStyleSettings(
  settings: AccessibilitySettings,
  body: HTMLElement,
  style: CSSStyleDeclaration,
): AccessibilitySettings {
  const activeProfile = detectProfile(body) ?? settings.activeProfile;
  const current = settings.profiles[activeProfile];
  const readingSize = parseCssNumber(style, '--oa-f1-reading-size') ?? current.readingSize;
  const editingSize = parseCssNumber(style, '--oa-f1-editing-size') ?? current.editingSize;
  const lineHeight = parseCssNumber(style, '--oa-f1-line-height') ?? current.lineHeight;

  return normalizeSettings({
    ...settings,
    activeProfile,
    profiles: {
      ...settings.profiles,
      [activeProfile]: { readingSize, editingSize, lineHeight },
    },
  });
}

export function scaleLimits(mode: ScaleMode): { minimum: number; maximum: number } {
  return mode === 'reading'
    ? { minimum: READING_MIN, maximum: READING_MAX }
    : { minimum: EDITING_MIN, maximum: EDITING_MAX };
}

export function clampScale(mode: ScaleMode, value: number): number {
  const limits = scaleLimits(mode);
  return Math.round(Math.min(limits.maximum, Math.max(limits.minimum, value)));
}

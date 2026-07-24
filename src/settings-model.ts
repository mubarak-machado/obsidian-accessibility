export const SETTINGS_SCHEMA_VERSION = 4;
export const DEFAULT_CUSTOM_HIGHLIGHT_COLOR = '#ffd000';

export type ProfileId = 'presentation' | 'preparation' | 'research';
export type ControlSide = 'left' | 'right';
export type ControlVerticalPosition = 'top' | 'center' | 'bottom';
export type ControlScale = 'small' | 'medium' | 'large';
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
  verticalPosition: ControlVerticalPosition;
  controlScale: ControlScale;
  highlightColor: string | null;
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

export const CONTROL_SIDES: readonly ControlSide[] = ['right', 'left'];
export const CONTROL_VERTICAL_POSITIONS: readonly ControlVerticalPosition[] = [
  'bottom',
  'center',
  'top',
];
export const CONTROL_SCALES: readonly ControlScale[] = ['large', 'medium', 'small'];

export const CONTROL_SCALE_FACTORS: Record<ControlScale, number> = {
  large: 1.5,
  medium: 1,
  small: 0.5,
};

export const DEFAULT_SETTINGS: AccessibilitySettings = {
  schemaVersion: SETTINGS_SCHEMA_VERSION,
  enabled: true,
  side: 'right',
  verticalPosition: 'center',
  controlScale: 'large',
  highlightColor: null,
  activeProfile: 'preparation',
  profiles: {
    presentation: { readingSize: 65, editingSize: 50, lineHeight: 1.2 },
    preparation: { readingSize: 55, editingSize: 50, lineHeight: 1.2 },
    research: { readingSize: 55, editingSize: 50, lineHeight: 1.2 },
  },
};

const READING_MIN = 32;
const READING_MAX = 75;
const EDITING_MIN = 32;
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

function controlSide(value: unknown): ControlSide {
  return CONTROL_SIDES.includes(value as ControlSide)
    ? (value as ControlSide)
    : DEFAULT_SETTINGS.side;
}

function controlVerticalPosition(value: unknown): ControlVerticalPosition {
  return CONTROL_VERTICAL_POSITIONS.includes(value as ControlVerticalPosition)
    ? (value as ControlVerticalPosition)
    : DEFAULT_SETTINGS.verticalPosition;
}

function controlScale(value: unknown): ControlScale {
  return CONTROL_SCALES.includes(value as ControlScale)
    ? (value as ControlScale)
    : DEFAULT_SETTINGS.controlScale;
}

export function normalizeHighlightColor(value: unknown): string | null {
  if (typeof value !== 'string' || !/^#[\da-f]{6}$/i.test(value)) return null;
  return value.toLowerCase();
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
    side: controlSide(source.side),
    verticalPosition: controlVerticalPosition(source.verticalPosition),
    controlScale: controlScale(source.controlScale),
    highlightColor: normalizeHighlightColor(source.highlightColor),
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

export function shouldMigrateFromStyleSettings(value: unknown): boolean {
  if (!isRecord(value)) return true;
  return typeof value.schemaVersion !== 'number' || value.schemaVersion < 3;
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

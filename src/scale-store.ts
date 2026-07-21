import {
  AccessibilitySettings,
  ControlSide,
  DEFAULT_SETTINGS,
  ProfileId,
  ProfileScaleSettings,
  ScaleMode,
  clampScale,
  normalizeSettings,
} from './settings-model';

type ChangeListener = (settings: Readonly<AccessibilitySettings>) => void;
type PersistSettings = (settings: AccessibilitySettings) => Promise<void>;

export class ScaleStore {
  private settings: AccessibilitySettings;
  private readonly listeners = new Set<ChangeListener>();
  private saveTimer: number | null = null;

  constructor(initial: unknown, private readonly persist: PersistSettings) {
    this.settings = normalizeSettings(initial);
  }

  get snapshot(): Readonly<AccessibilitySettings> {
    return this.settings;
  }

  get activeProfile(): Readonly<ProfileScaleSettings> {
    return this.settings.profiles[this.settings.activeProfile];
  }

  subscribe(listener: ChangeListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  replace(settings: AccessibilitySettings, persistImmediately = false): void {
    this.settings = normalizeSettings(settings);
    this.notify();
    if (persistImmediately) void this.flush();
    else this.scheduleSave();
  }

  setEnabled(enabled: boolean): void {
    this.update({ ...this.settings, enabled });
  }

  setTabBarHidden(tabBarHidden: boolean): void {
    this.update({ ...this.settings, tabBarHidden });
  }

  setSide(side: ControlSide): void {
    this.update({ ...this.settings, side });
  }

  setActiveProfile(activeProfile: ProfileId): void {
    if (activeProfile === this.settings.activeProfile) return;
    this.update({ ...this.settings, activeProfile });
  }

  setScale(mode: ScaleMode, value: number): void {
    const id = this.settings.activeProfile;
    const profile = this.settings.profiles[id];
    const nextProfile = {
      ...profile,
      [mode === 'reading' ? 'readingSize' : 'editingSize']: clampScale(mode, value),
    };
    this.updateProfile(id, nextProfile);
  }

  setLineHeight(profileId: ProfileId, lineHeight: number): void {
    this.updateProfile(profileId, {
      ...this.settings.profiles[profileId],
      lineHeight,
    });
  }

  setProfileScale(
    profileId: ProfileId,
    mode: ScaleMode,
    value: number,
  ): void {
    const profile = this.settings.profiles[profileId];
    this.updateProfile(profileId, {
      ...profile,
      [mode === 'reading' ? 'readingSize' : 'editingSize']: clampScale(mode, value),
    });
  }

  resetScale(mode: ScaleMode): void {
    const id = this.settings.activeProfile;
    const fallback = DEFAULT_SETTINGS.profiles[id];
    this.setScale(mode, mode === 'reading' ? fallback.readingSize : fallback.editingSize);
  }

  async flush(): Promise<void> {
    if (this.saveTimer !== null) {
      window.clearTimeout(this.saveTimer);
      this.saveTimer = null;
    }
    await this.persist(normalizeSettings(this.settings));
  }

  async dispose(): Promise<void> {
    await this.flush();
    this.listeners.clear();
  }

  private updateProfile(profileId: ProfileId, profile: ProfileScaleSettings): void {
    this.update({
      ...this.settings,
      profiles: { ...this.settings.profiles, [profileId]: profile },
    });
  }

  private update(settings: AccessibilitySettings): void {
    this.settings = normalizeSettings(settings);
    this.notify();
    this.scheduleSave();
  }

  private notify(): void {
    for (const listener of this.listeners) listener(this.settings);
  }

  private scheduleSave(): void {
    if (this.saveTimer !== null) window.clearTimeout(this.saveTimer);
    this.saveTimer = window.setTimeout(() => {
      this.saveTimer = null;
      void this.persist(normalizeSettings(this.settings));
    }, 180);
  }
}

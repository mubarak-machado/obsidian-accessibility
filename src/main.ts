import { MarkdownView, Notice, Plugin } from 'obsidian';
import { FontScaleControl } from './font-scale-control';
import { ScaleController } from './scale-controller';
import { ScaleStore } from './scale-store';
import { AccessibilitySettingTab } from './settings-tab';
import { ZenModeController } from './zen-mode-controller';
import {
  PROFILE_CLASSES,
  PROFILE_IDS,
  ProfileId,
  detectProfile,
  hasCurrentSettingsSchema,
  migrateFromStyleSettings,
  normalizeSettings,
} from './settings-model';

export default class ObsidianAccessibilityPlugin extends Plugin {
  private store!: ScaleStore;
  private controller!: ScaleController;
  private control: FontScaleControl | null = null;
  private mountedView: MarkdownView | null = null;
  private profileObserver: MutationObserver | null = null;
  private zenMode: ZenModeController | null = null;
  private unsubscribeStore: (() => void) | null = null;
  private applyingProfileClass = false;
  private originalProfileClass: string | null = null;

  async onload(): Promise<void> {
    const doc = this.app.workspace.containerEl.ownerDocument;
    const originalProfile = detectProfile(doc.body);
    this.originalProfileClass = originalProfile ? PROFILE_CLASSES[originalProfile] : null;
    const persisted: unknown = await this.loadData();
    const normalized = normalizeSettings(persisted);
    const migrated = hasCurrentSettingsSchema(persisted)
      ? normalized
      : migrateFromStyleSettings(
          normalized,
          doc.body,
          doc.defaultView?.getComputedStyle(doc.body) ?? getComputedStyle(doc.body),
        );

    this.store = new ScaleStore(migrated, async (settings) => this.saveData(settings));
    this.controller = new ScaleController(this.store);
    this.zenMode = new ZenModeController(doc.body, this.app.workspace);
    await this.store.flush();

    this.addSettingTab(new AccessibilitySettingTab(this.app, this, this.store));
    this.registerCommands();
    this.registerWorkspaceEvents();
    this.observeExternalProfileChanges(doc);
    this.unsubscribeStore = this.store.subscribe(() => {
      this.applyProfileClass(doc.body);
      this.control?.refreshContext();
    });

    this.applyProfileClass(doc.body);
    this.app.workspace.onLayoutReady(() => this.syncActiveView());
  }

  onunload(): void {
    this.profileObserver?.disconnect();
    this.profileObserver = null;
    this.unsubscribeStore?.();
    this.unsubscribeStore = null;
    this.destroyControl();
    this.zenMode?.destroy();
    this.zenMode = null;
    const body = this.app.workspace.containerEl.ownerDocument.body;
    this.removeProfileClasses(body);
    if (this.originalProfileClass) body.classList.add(this.originalProfileClass);
    void this.store.dispose();
  }

  private registerWorkspaceEvents(): void {
    this.registerEvent(this.app.workspace.on('active-leaf-change', () => this.syncActiveView()));
    this.registerEvent(this.app.workspace.on('layout-change', () => this.syncActiveView()));
    this.registerDomEvent(window, 'resize', () => this.control?.refreshContext());
  }

  private registerCommands(): void {
    this.addCommand({
      id: 'toggle-font-scale-panel',
      name: 'Abrir ou fechar ajuste do tamanho do texto',
      checkCallback: (checking) => {
        if (!this.app.workspace.getActiveViewOfType(MarkdownView)) return false;
        if (!checking) this.control?.toggle(true);
        return true;
      },
    });

    this.addCommand({
      id: 'increase-font-scale',
      name: 'Aumentar tamanho do texto',
      checkCallback: (checking) => this.scaleCommand(checking, 1),
    });
    this.addCommand({
      id: 'decrease-font-scale',
      name: 'Diminuir tamanho do texto',
      checkCallback: (checking) => this.scaleCommand(checking, -1),
    });
    this.addCommand({
      id: 'reset-font-scale',
      name: 'Restaurar tamanho do perfil',
      checkCallback: (checking) => {
        if (!this.app.workspace.getActiveViewOfType(MarkdownView)) return false;
        if (!checking) {
          this.store.resetScale(this.controller.mode());
          this.controller.applyScaleWithAnchor();
        }
        return true;
      },
    });
    this.addCommand({
      id: 'toggle-zen-mode',
      name: 'Ativar ou desativar modo zen',
      checkCallback: (checking) => {
        if (!this.app.workspace.getActiveViewOfType(MarkdownView) || !this.zenMode) return false;
        if (!checking) this.zenMode.toggle();
        return true;
      },
    });
    this.addCommand({
      id: 'cycle-accessibility-profile',
      name: 'Alternar perfil de acessibilidade',
      callback: () => {
        const current = PROFILE_IDS.indexOf(this.store.snapshot.activeProfile);
        const next = PROFILE_IDS[(current + 1) % PROFILE_IDS.length];
        if (!next) return;
        this.store.setActiveProfile(next);
        new Notice(`Perfil: ${this.profileLabel(next)}`);
      },
    });
  }

  private scaleCommand(checking: boolean, delta: number): boolean {
    if (!this.app.workspace.getActiveViewOfType(MarkdownView)) return false;
    if (!checking) {
      const mode = this.controller.mode();
      const profile = this.store.activeProfile;
      const current = mode === 'reading' ? profile.readingSize : profile.editingSize;
      this.store.setScale(mode, current + delta);
      this.controller.applyScaleWithAnchor();
    }
    return true;
  }

  private syncActiveView(): void {
    const view = this.app.workspace.getActiveViewOfType(MarkdownView);
    if (!view) {
      this.zenMode?.exit();
      this.destroyControl();
      return;
    }

    if (view === this.mountedView && this.control) {
      this.control.refreshContext();
      return;
    }

    this.destroyControl();
    if (!this.zenMode) return;
    this.mountedView = view;
    this.controller.mount(view);
    this.control = new FontScaleControl(view, this.store, this.controller, this.zenMode);
  }

  private destroyControl(): void {
    this.control?.destroy();
    this.control = null;
    this.controller?.unmount();
    this.mountedView = null;
  }

  private observeExternalProfileChanges(doc: Document): void {
    this.profileObserver = new MutationObserver(() => {
      if (this.applyingProfileClass) return;
      const detected = detectProfile(doc.body);
      if (detected && detected !== this.store.snapshot.activeProfile) {
        this.store.setActiveProfile(detected);
      }
    });
    this.profileObserver.observe(doc.body, { attributes: true, attributeFilter: ['class'] });
  }

  private applyProfileClass(body: HTMLElement): void {
    this.applyingProfileClass = true;
    this.removeProfileClasses(body);
    body.classList.add(PROFILE_CLASSES[this.store.snapshot.activeProfile]);
    queueMicrotask(() => {
      this.applyingProfileClass = false;
    });
  }

  private removeProfileClasses(body: HTMLElement): void {
    body.classList.remove(...Object.values(PROFILE_CLASSES));
  }

  private profileLabel(profile: ProfileId): string {
    if (profile === 'presentation') return 'Apresentação';
    if (profile === 'preparation') return 'Preparação';
    return 'Pesquisa';
  }
}

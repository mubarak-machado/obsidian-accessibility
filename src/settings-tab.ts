import { App, PluginSettingTab, Setting } from 'obsidian';
import type ObsidianAccessibilityPlugin from './main';
import { ScaleStore } from './scale-store';
import {
  PROFILE_IDS,
  PROFILE_LABELS,
  ProfileId,
  ScaleMode,
  scaleLimits,
} from './settings-model';

export class AccessibilitySettingTab extends PluginSettingTab {
  constructor(
    app: App,
    plugin: ObsidianAccessibilityPlugin,
    private readonly store: ScaleStore,
  ) {
    super(app, plugin);
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();
    new Setting(containerEl).setName('Acessibilidade de leitura').setHeading();
    containerEl.createEl('p', {
      text: 'Ajustes de leitura e edição aplicados somente à nota Markdown ativa.',
      cls: 'setting-item-description',
    });

    const settings = this.store.snapshot;
    new Setting(containerEl)
      .setName('Controle flutuante')
      .setDesc('Mostra o controle de escala na nota Markdown ativa.')
      .addToggle((toggle) =>
        toggle.setValue(settings.enabled).onChange((enabled) => this.store.setEnabled(enabled)),
      );

    new Setting(containerEl)
      .setName('Lado do controle')
      .setDesc('O painel sobrepõe o botão junto à borda e não reserva largura.')
      .addDropdown((dropdown) =>
        dropdown
          .addOption('right', 'Direita')
          .addOption('left', 'Esquerda')
          .setValue(settings.side)
          .onChange((side) => this.store.setSide(side === 'left' ? 'left' : 'right')),
      );

    new Setting(containerEl)
      .setName('Perfil ativo')
      .setDesc('Mantém compatibilidade com os três perfis aprovados na primeira fase.')
      .addDropdown((dropdown) => {
        for (const id of PROFILE_IDS) dropdown.addOption(id, PROFILE_LABELS[id]);
        dropdown.setValue(settings.activeProfile).onChange((profile) => {
          if (PROFILE_IDS.includes(profile as ProfileId)) {
            this.store.setActiveProfile(profile as ProfileId);
          }
        });
      });

    for (const id of PROFILE_IDS) this.addProfileSettings(containerEl, id);
  }

  private addProfileSettings(container: HTMLElement, profileId: ProfileId): void {
    new Setting(container).setName(PROFILE_LABELS[profileId]).setHeading();
    const profile = this.store.snapshot.profiles[profileId];

    this.addScaleSetting(container, profileId, 'reading', profile.readingSize);
    this.addScaleSetting(container, profileId, 'editing', profile.editingSize);

    new Setting(container)
      .setName('Altura da linha')
      .setDesc(`${profile.lineHeight.toFixed(2).replace(/0$/, '')}`)
      .addSlider((slider) =>
        slider
          .setLimits(1.1, 1.6, 0.05)
          .setValue(profile.lineHeight)
          .onChange((value) => this.store.setLineHeight(profileId, value)),
      );
  }

  private addScaleSetting(
    container: HTMLElement,
    profileId: ProfileId,
    mode: ScaleMode,
    value: number,
  ): void {
    const limits = scaleLimits(mode);
    new Setting(container)
      .setName(mode === 'reading' ? 'Tamanho de leitura' : 'Tamanho de edição')
      .setDesc(`${value} px`)
      .addSlider((slider) =>
        slider
          .setLimits(limits.minimum, limits.maximum, 1)
          .setValue(value)
          .onChange((next) => this.store.setProfileScale(profileId, mode, next)),
      );
  }
}

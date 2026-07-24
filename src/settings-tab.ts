import { App, PluginSettingTab, Setting } from 'obsidian';
import type { ButtonComponent, ColorComponent } from 'obsidian';
import type ObsidianAccessibilityPlugin from './main';
import { ScaleStore } from './scale-store';
import {
  CONTROL_SCALES,
  CONTROL_SIDES,
  CONTROL_VERTICAL_POSITIONS,
  DEFAULT_CUSTOM_HIGHLIGHT_COLOR,
  PROFILE_IDS,
  PROFILE_LABELS,
  ControlScale,
  ControlSide,
  ControlVerticalPosition,
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
    new Setting(containerEl).setName('Controle flutuante').setHeading();
    containerEl.createEl('p', {
      text: 'Defina visibilidade, posição e tamanho do botão e do slider.',
      cls: 'setting-item-description',
    });

    new Setting(containerEl)
      .setName('Controle flutuante')
      .setDesc('Mostra o controle de escala na nota Markdown ativa.')
      .addToggle((toggle) =>
        toggle.setValue(settings.enabled).onChange((enabled) => this.store.setEnabled(enabled)),
      );

    new Setting(containerEl)
      .setName('Posição horizontal')
      .setDesc('Coloca o controle à direita ou à esquerda, nunca no centro.')
      .addDropdown((dropdown) =>
        dropdown
          .addOption('right', 'Direita')
          .addOption('left', 'Esquerda')
          .setValue(settings.side)
          .onChange((side) => {
            if (CONTROL_SIDES.includes(side as ControlSide)) {
              this.store.setSide(side as ControlSide);
            }
          }),
      );

    new Setting(containerEl)
      .setName('Posição vertical')
      .setDesc('Coloca o controle na parte inferior, no meio ou na parte superior.')
      .addDropdown((dropdown) =>
        dropdown
          .addOption('bottom', 'Inferior')
          .addOption('center', 'Meio')
          .addOption('top', 'Superior')
          .setValue(settings.verticalPosition)
          .onChange((verticalPosition) => {
            if (
              CONTROL_VERTICAL_POSITIONS.includes(
                verticalPosition as ControlVerticalPosition,
              )
            ) {
              this.store.setVerticalPosition(
                verticalPosition as ControlVerticalPosition,
              );
            }
          }),
      );

    new Setting(containerEl)
      .setName('Escala do controle')
      .setDesc('Redimensiona o botão de abertura e todo o slider.')
      .addDropdown((dropdown) =>
        dropdown
          .addOption('large', 'Grande — 150%')
          .addOption('medium', 'Média — 100%')
          .addOption('small', 'Mínima — 50%')
          .setValue(settings.controlScale)
          .onChange((controlScale) => {
            if (CONTROL_SCALES.includes(controlScale as ControlScale)) {
              this.store.setControlScale(controlScale as ControlScale);
            }
          }),
      );

    new Setting(containerEl).setName('Destaque').setHeading();
    containerEl.createEl('p', {
      text: 'Escolha uma única cor para todo ==texto== da nota ativa, sem gravar a preferência no Markdown.',
      cls: 'setting-item-description',
    });

    const highlightSetting = new Setting(containerEl)
      .setName('Cor do destaque')
      .setDesc(this.highlightDescription(settings.highlightColor));
    highlightSetting.descEl.id = 'oa-highlight-color-description';
    let colorPicker: ColorComponent | null = null;
    let colorActionButton: ButtonComponent | null = null;

    highlightSetting
      .addColorPicker((picker) => {
        colorPicker = picker;
        picker
          .setValue(settings.highlightColor ?? DEFAULT_CUSTOM_HIGHLIGHT_COLOR)
          .onChange((color) => {
            this.store.setHighlightColor(color);
            highlightSetting.descEl.textContent = this.highlightDescription(color);
            colorActionButton?.setButtonText('Usar cor do tema');
          });
      })
      .addButton((button) => {
        colorActionButton = button;
        button
          .setButtonText(
            settings.highlightColor === null ? 'Usar esta cor' : 'Usar cor do tema',
          )
          .onClick(() => {
            if (this.store.snapshot.highlightColor) {
              this.store.setHighlightColor(null);
              highlightSetting.descEl.textContent = this.highlightDescription(null);
              button.setButtonText('Usar esta cor');
              return;
            }

            const color = colorPicker?.getValue() ?? DEFAULT_CUSTOM_HIGHLIGHT_COLOR;
            this.store.setHighlightColor(color);
            highlightSetting.descEl.textContent = this.highlightDescription(color);
            button.setButtonText('Usar cor do tema');
          });
      });

    const colorInput =
      highlightSetting.controlEl.querySelector<HTMLInputElement>("input[type='color']");
    colorInput?.setAttribute('aria-label', 'Escolher cor do destaque');
    colorInput?.setAttribute('aria-describedby', 'oa-highlight-color-description');

    new Setting(containerEl).setName('Tamanhos por perfil').setHeading();
    containerEl.createEl('p', {
      text: 'Leitura e edição têm mínimo comum de 32 px; os valores permanecem independentes em cada perfil.',
      cls: 'setting-item-description',
    });

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

  private highlightDescription(color: string | null): string {
    return color
      ? `Cor personalizada ${color.toUpperCase()}; o texto usa automaticamente preto ou branco para manter o contraste.`
      : 'Usando a cor do tema. Escolha uma cor ou aplique a amostra exibida.';
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

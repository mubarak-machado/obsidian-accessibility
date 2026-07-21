import { MarkdownView } from 'obsidian';
import { ReadingAnchor } from './reading-anchor';
import { ScaleStore } from './scale-store';
import { ScaleMode } from './settings-model';

const ACTIVE_CLASS = 'oa-scale-active';

export class ScaleController {
  private view: MarkdownView | null = null;
  private animationFrame: number | null = null;

  constructor(private readonly store: ScaleStore) {}

  mount(view: MarkdownView): void {
    if (this.view !== view) this.unmount();
    this.view = view;
    this.scheduleApply(false);
  }

  mode(): ScaleMode {
    return this.view?.getMode() === 'preview' ? 'reading' : 'editing';
  }

  refresh(): void {
    this.scheduleApply(false);
  }

  applyScaleWithAnchor(): void {
    this.scheduleApply(true);
  }

  unmount(): void {
    if (this.animationFrame !== null) {
      window.cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
    if (this.view) this.cleanContainer(this.view.containerEl);
    this.view = null;
  }

  private scheduleApply(preserveAnchor: boolean): void {
    if (!this.view) return;
    if (this.animationFrame !== null) window.cancelAnimationFrame(this.animationFrame);
    const view = this.view;
    const anchor = preserveAnchor ? ReadingAnchor.capture(view.containerEl) : null;

    this.animationFrame = window.requestAnimationFrame(() => {
      this.animationFrame = null;
      if (this.view !== view) return;
      this.applyToContainer(view.containerEl);
      if (anchor) {
        window.requestAnimationFrame(() => {
          if (this.view === view) anchor.restore();
        });
      }
    });
  }

  private applyToContainer(container: HTMLElement): void {
    const settings = this.store.snapshot;
    if (!settings.enabled) {
      this.cleanContainer(container);
      return;
    }

    const profile = settings.profiles[settings.activeProfile];
    container.classList.add(ACTIVE_CLASS);
    container.style.setProperty('--oa-scale-reading-size', `${profile.readingSize}px`);
    container.style.setProperty('--oa-scale-editing-size', `${profile.editingSize}px`);
    container.style.setProperty('--oa-scale-line-height', `${profile.lineHeight}`);

    // Compatibility bridge while the F1 snippet and Style Settings remain installed.
    container.style.setProperty('--oa-f1-effective-reading-size', `${profile.readingSize}px`);
    container.style.setProperty('--oa-f1-effective-editing-size', `${profile.editingSize}px`);
    container.style.setProperty('--oa-f1-line-height', `${profile.lineHeight}`);
  }

  private cleanContainer(container: HTMLElement): void {
    container.classList.remove(ACTIVE_CLASS);
    for (const property of [
      '--oa-scale-reading-size',
      '--oa-scale-editing-size',
      '--oa-scale-line-height',
      '--oa-f1-effective-reading-size',
      '--oa-f1-effective-editing-size',
      '--oa-f1-line-height',
    ]) {
      container.style.removeProperty(property);
    }
  }
}

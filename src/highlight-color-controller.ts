import type { MarkdownView } from 'obsidian';

import { ScaleStore } from './scale-store';
import { normalizeHighlightColor } from './settings-model';

const ACTIVE_CLASS = 'oa-highlight-color-active';
const BACKGROUND_PROPERTY = '--oa-highlight-background';
const FOREGROUND_PROPERTY = '--oa-highlight-foreground';

function linearChannel(channel: number): number {
  const normalized = channel / 255;
  return normalized <= 0.04045
    ? normalized / 12.92
    : ((normalized + 0.055) / 1.055) ** 2.4;
}

function relativeLuminance(color: string): number {
  const red = Number.parseInt(color.slice(1, 3), 16);
  const green = Number.parseInt(color.slice(3, 5), 16);
  const blue = Number.parseInt(color.slice(5, 7), 16);
  return (
    0.2126 * linearChannel(red) +
    0.7152 * linearChannel(green) +
    0.0722 * linearChannel(blue)
  );
}

export function highlightForeground(color: string): '#000000' | '#ffffff' {
  const normalized = normalizeHighlightColor(color);
  if (!normalized) return '#000000';

  const luminance = relativeLuminance(normalized);
  const blackContrast = (luminance + 0.05) / 0.05;
  const whiteContrast = 1.05 / (luminance + 0.05);
  return blackContrast >= whiteContrast ? '#000000' : '#ffffff';
}

export class HighlightColorController {
  private view: MarkdownView | null = null;

  constructor(private readonly store: ScaleStore) {}

  mount(view: MarkdownView): void {
    if (this.view !== view) this.unmount();
    this.view = view;
    this.applyToContainer(view.containerEl);
  }

  refresh(): void {
    if (this.view) this.applyToContainer(this.view.containerEl);
  }

  unmount(): void {
    if (this.view) this.cleanContainer(this.view.containerEl);
    this.view = null;
  }

  private applyToContainer(container: HTMLElement): void {
    const color = this.store.snapshot.highlightColor;
    if (!color) {
      if (
        container.classList.contains(ACTIVE_CLASS) ||
        container.style.getPropertyValue(BACKGROUND_PROPERTY) ||
        container.style.getPropertyValue(FOREGROUND_PROPERTY)
      ) {
        this.cleanContainer(container);
      }
      return;
    }

    const foreground = highlightForeground(color);
    if (
      container.classList.contains(ACTIVE_CLASS) &&
      container.style.getPropertyValue(BACKGROUND_PROPERTY) === color &&
      container.style.getPropertyValue(FOREGROUND_PROPERTY) === foreground
    ) {
      return;
    }

    container.classList.add(ACTIVE_CLASS);
    container.style.setProperty(BACKGROUND_PROPERTY, color);
    container.style.setProperty(FOREGROUND_PROPERTY, foreground);
  }

  private cleanContainer(container: HTMLElement): void {
    container.classList.remove(ACTIVE_CLASS);
    container.style.removeProperty(BACKGROUND_PROPERTY);
    container.style.removeProperty(FOREGROUND_PROPERTY);
  }
}

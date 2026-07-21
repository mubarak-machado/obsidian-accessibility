export const TAB_BAR_HIDDEN_CLASS = 'oa-tab-bar-hidden';

export class TabBarVisibility {
  constructor(private readonly body: HTMLElement) {}

  sync(hidden: boolean): void {
    this.body.classList.toggle(TAB_BAR_HIDDEN_CLASS, hidden);
  }

  destroy(): void {
    this.body.classList.remove(TAB_BAR_HIDDEN_CLASS);
  }
}

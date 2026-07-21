export class ReadingAnchor {
  private readonly scrollElement: HTMLElement | null;
  private readonly anchorElement: HTMLElement | null;
  private readonly previousTop: number | null;

  private constructor(
    scrollElement: HTMLElement | null,
    anchorElement: HTMLElement | null,
    previousTop: number | null,
  ) {
    this.scrollElement = scrollElement;
    this.anchorElement = anchorElement;
    this.previousTop = previousTop;
  }

  static capture(container: HTMLElement): ReadingAnchor {
    const scrollElement = container.querySelector<HTMLElement>(
      '.markdown-preview-view, .cm-scroller',
    );
    if (!scrollElement) return new ReadingAnchor(null, null, null);

    const activeLine = container.querySelector<HTMLElement>('.cm-activeLine');
    if (activeLine) {
      return new ReadingAnchor(scrollElement, activeLine, activeLine.getBoundingClientRect().top);
    }

    const rect = scrollElement.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height * 0.35;
    const hit = scrollElement.ownerDocument.elementFromPoint(x, y) as HTMLElement | null;
    const anchor = hit?.closest<HTMLElement>(
      'p, li, blockquote, h1, h2, h3, h4, h5, h6, pre, table, .cm-line',
    );

    if (!anchor || !scrollElement.contains(anchor)) {
      return new ReadingAnchor(scrollElement, null, null);
    }
    return new ReadingAnchor(scrollElement, anchor, anchor.getBoundingClientRect().top);
  }

  restore(): void {
    if (!this.scrollElement || !this.anchorElement || this.previousTop === null) return;
    if (!this.anchorElement.isConnected) return;

    const currentTop = this.anchorElement.getBoundingClientRect().top;
    const offset = currentTop - this.previousTop;
    if (Number.isFinite(offset)) this.scrollElement.scrollTop += offset;
  }
}

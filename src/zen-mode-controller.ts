export const ZEN_MODE_CLASS = 'oa-zen-mode';

interface CollapsibleSidebar {
  collapsed: boolean;
  collapse(): void;
  expand(): void;
}

export interface ZenModeWorkspace {
  leftSplit: CollapsibleSidebar;
  rightSplit: CollapsibleSidebar;
}

interface SidebarSnapshot {
  leftCollapsed: boolean | null;
  rightCollapsed: boolean | null;
}

type ZenModeListener = (active: boolean) => void;

export class ZenModeController {
  private enabled = false;
  private snapshot: SidebarSnapshot | null = null;
  private readonly listeners = new Set<ZenModeListener>();

  constructor(
    private readonly body: HTMLElement,
    private readonly workspace: ZenModeWorkspace,
  ) {}

  get active(): boolean {
    return this.enabled;
  }

  subscribe(listener: ZenModeListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  toggle(): void {
    if (this.enabled) this.exit();
    else this.enter();
  }

  enter(): void {
    if (this.enabled) return;

    this.snapshot = {
      leftCollapsed: this.readCollapsed(this.workspace.leftSplit),
      rightCollapsed: this.readCollapsed(this.workspace.rightSplit),
    };
    this.enabled = true;
    this.body.classList.add(ZEN_MODE_CLASS);
    this.collapse(this.workspace.leftSplit);
    this.collapse(this.workspace.rightSplit);
    this.notify();
  }

  exit(): void {
    if (!this.enabled) return;

    const snapshot = this.snapshot;
    this.enabled = false;
    this.snapshot = null;
    this.body.classList.remove(ZEN_MODE_CLASS);
    if (snapshot) {
      this.restore(this.workspace.leftSplit, snapshot.leftCollapsed);
      this.restore(this.workspace.rightSplit, snapshot.rightCollapsed);
    }
    this.notify();
  }

  destroy(): void {
    this.exit();
    this.body.classList.remove(ZEN_MODE_CLASS);
    this.listeners.clear();
  }

  private readCollapsed(sidebar: CollapsibleSidebar): boolean | null {
    try {
      return sidebar.collapsed;
    } catch {
      return null;
    }
  }

  private collapse(sidebar: CollapsibleSidebar): void {
    try {
      if (!sidebar.collapsed) sidebar.collapse();
    } catch {
      // A sidebar failure must not prevent the remaining Zen UI from being recoverable.
    }
  }

  private restore(sidebar: CollapsibleSidebar, collapsed: boolean | null): void {
    if (collapsed === null) return;
    try {
      if (collapsed && !sidebar.collapsed) sidebar.collapse();
      if (!collapsed && sidebar.collapsed) sidebar.expand();
    } catch {
      // Plugin-owned CSS is still removed even when Obsidian cannot restore a drawer.
    }
  }

  private notify(): void {
    for (const listener of this.listeners) {
      try {
        listener(this.enabled);
      } catch {
        // One consumer must not block cleanup or recovery for the others.
      }
    }
  }
}

import type {
  MarkdownPostProcessorContext,
  MarkdownView,
  Vault,
} from 'obsidian';

export type ReadingAnnotationAction = 'mark' | 'erase';

export interface ReadingSectionAnchor {
  sourcePath: string;
  lineStart: number;
  lineEnd: number;
  text: string;
}

interface RegisteredSection {
  element: HTMLElement;
  anchor: ReadingSectionAnchor;
}

export interface ReadingSelectionSnapshot extends ReadingSectionAnchor {
  selectedText: string;
}

export interface ReadingAnnotationState {
  active: boolean;
  available: boolean;
  busy: boolean;
  hasSelection: boolean;
  message: string;
}

export type AnnotationEditResult =
  | { ok: true; content: string; message: string }
  | { ok: false; message: string };

type AnnotationListener = (state: ReadingAnnotationState) => void;
type AnnotationNotifier = (message: string) => void;
type AnnotationVault = Pick<Vault, 'cachedRead' | 'getFileByPath' | 'process'>;

const ALLOWED_BLOCK_SELECTOR = 'p, li, blockquote, h1, h2, h3, h4, h5, h6';
const UNSAFE_SELECTED_TEXT = /[\r\n`*_~[\]<>]/;
const PROTECTED_INLINE_PATTERNS = [
  /`[^`\n]+`/g,
  /!?\[\[[^\]\n]+\]\]/g,
  /!?\[[^\]\n]*\]\([^)\n]*\)/g,
  /<[^>\n]+>/g,
  /\*\*[^*\n]+\*\*/g,
  /__[^_\n]+__/g,
  /~~[^~\n]+~~/g,
  /==[^=\n]+==/g,
  /\*[^*\n]+\*/g,
  /_[^_\n]+_/g,
] as const;

interface SourceRange {
  start: number;
  end: number;
}

export class ReadingSectionRegistry {
  private anchors = new WeakMap<HTMLElement, () => ReadingSectionAnchor | null>();

  register(element: HTMLElement, context: MarkdownPostProcessorContext): void {
    this.anchors.set(element, () => {
      const section = context.getSectionInfo(element);
      if (!section) return null;
      return {
        sourcePath: context.sourcePath,
        lineStart: section.lineStart,
        lineEnd: section.lineEnd,
        text: section.text,
      };
    });
  }

  find(node: Node, boundary: HTMLElement): RegisteredSection | null {
    let element = node.nodeType === Node.ELEMENT_NODE ? (node as HTMLElement) : node.parentElement;
    while (element && boundary.contains(element)) {
      const anchor = this.anchors.get(element)?.() ?? null;
      if (anchor) return { element, anchor };
      if (element === boundary) break;
      element = element.parentElement;
    }
    return null;
  }

  clear(): void {
    this.anchors = new WeakMap<HTMLElement, () => ReadingSectionAnchor | null>();
  }
}

export class ReadingAnnotationController {
  private readonly abortController = new AbortController();
  private readonly listeners = new Set<AnnotationListener>();
  private selection: ReadingSelectionSnapshot | null = null;
  private activeState = false;
  private busyState = false;
  private message = '';

  constructor(
    private readonly view: MarkdownView,
    private readonly vault: AnnotationVault,
    private readonly registry: ReadingSectionRegistry,
    private readonly notify: AnnotationNotifier = () => undefined,
  ) {
    this.view.containerEl.ownerDocument.addEventListener(
      'selectionchange',
      () => this.captureSelection(),
      { signal: this.abortController.signal },
    );
  }

  get active(): boolean {
    return this.activeState;
  }

  get state(): ReadingAnnotationState {
    return {
      active: this.activeState,
      available: this.isAvailable(),
      busy: this.busyState,
      hasSelection: this.selection !== null,
      message: this.message,
    };
  }

  subscribe(listener: AnnotationListener): () => void {
    this.listeners.add(listener);
    listener(this.state);
    return () => this.listeners.delete(listener);
  }

  toggle(): void {
    if (this.activeState) {
      this.exit();
      return;
    }
    if (!this.isAvailable()) {
      this.announce('A anotação rápida está disponível apenas no modo leitura', true);
      return;
    }
    this.activeState = true;
    this.selection = null;
    this.announce('Anotação rápida ativada');
  }

  exit(message = 'Anotação rápida desativada'): void {
    if (!this.activeState) return;
    this.activeState = false;
    this.busyState = false;
    this.selection = null;
    this.announce(message);
  }

  refreshContext(): void {
    if (this.activeState && !this.isAvailable()) {
      this.exit('Anotação rápida encerrada ao sair do modo leitura');
      return;
    }
    this.emit();
  }

  async mark(): Promise<boolean> {
    return this.apply('mark');
  }

  async erase(): Promise<boolean> {
    return this.apply('erase');
  }

  destroy(): void {
    this.abortController.abort();
    this.listeners.clear();
    this.selection = null;
    this.activeState = false;
    this.busyState = false;
  }

  private captureSelection(): void {
    if (!this.activeState || !this.isAvailable() || this.busyState) return;
    const documentSelection = this.view.containerEl.ownerDocument.getSelection();
    if (!documentSelection || documentSelection.rangeCount !== 1 || documentSelection.isCollapsed) {
      // Tocar em um botão pode recolher as alças no iPad. A última seleção válida
      // permanece disponível até a ação, saída do modo ou mudança de contexto.
      return;
    }

    const range = documentSelection.getRangeAt(0);
    const startSection = this.registry.find(range.startContainer, this.view.containerEl);
    const endSection = this.registry.find(range.endContainer, this.view.containerEl);
    if (
      !startSection ||
      !endSection ||
      startSection.element !== endSection.element ||
      startSection.anchor.sourcePath !== endSection.anchor.sourcePath
    ) {
      this.clearSelection();
      return;
    }

    const startBlock = closestAllowedBlock(range.startContainer, startSection.element);
    const endBlock = closestAllowedBlock(range.endContainer, startSection.element);
    const selectedText = documentSelection.toString();
    const activePath = this.view.file?.path;
    if (
      !startBlock ||
      startBlock !== endBlock ||
      !selectedText ||
      selectedText !== selectedText.trim() ||
      UNSAFE_SELECTED_TEXT.test(selectedText) ||
      activePath !== startSection.anchor.sourcePath
    ) {
      this.clearSelection();
      return;
    }

    this.selection = {
      ...startSection.anchor,
      selectedText,
    };
    this.emit();
  }

  private async apply(action: ReadingAnnotationAction): Promise<boolean> {
    const snapshot = this.selection;
    if (!this.activeState || !snapshot || this.busyState) {
      this.announce('Selecione um trecho simples dentro de um único bloco', true);
      return false;
    }
    const file = this.vault.getFileByPath(snapshot.sourcePath);
    if (!file) {
      this.clearSelection('A nota selecionada não está mais disponível', true);
      return false;
    }

    this.busyState = true;
    this.emit();
    try {
      const current = await this.vault.cachedRead(file);
      const preflight = applyReadingAnnotation(current, snapshot, action);
      if (!preflight.ok) {
        this.announce(preflight.message, true);
        return false;
      }

      let transaction: AnnotationEditResult = failure('A anotação não pôde ser aplicada');
      await this.vault.process(file, (latest) => {
        transaction = applyReadingAnnotation(latest, snapshot, action);
        return transaction.ok ? transaction.content : latest;
      });
      if (!transaction.ok) {
        this.announce(transaction.message, true);
        return false;
      }

      this.selection = null;
      this.view.containerEl.ownerDocument.getSelection()?.removeAllRanges();
      this.announce(transaction.message, true);
      return true;
    } catch {
      this.announce('A anotação não pôde ser aplicada', true);
      return false;
    } finally {
      this.busyState = false;
      this.emit();
    }
  }

  private isAvailable(): boolean {
    return this.view.getMode() === 'preview' && this.view.file !== null;
  }

  private clearSelection(message?: string, showNotice = false): void {
    if (!this.selection && !message) return;
    this.selection = null;
    if (message) this.message = message;
    if (message && showNotice) this.notify(message);
    this.emit();
  }

  private announce(message: string, showNotice = false): void {
    this.message = message;
    if (showNotice) this.notify(message);
    this.emit();
  }

  private emit(): void {
    const state = this.state;
    for (const listener of this.listeners) listener(state);
  }
}

export function applyReadingAnnotation(
  content: string,
  snapshot: ReadingSelectionSnapshot,
  action: ReadingAnnotationAction,
): AnnotationEditResult {
  if (
    snapshot.lineStart < 0 ||
    snapshot.lineEnd < snapshot.lineStart ||
    !snapshot.selectedText ||
    snapshot.selectedText !== snapshot.selectedText.trim() ||
    UNSAFE_SELECTED_TEXT.test(snapshot.selectedText)
  ) {
    return failure('Selecione um trecho simples dentro de um único bloco');
  }

  const section = sectionRange(content, snapshot.lineStart, snapshot.lineEnd);
  if (!section || section.text !== snapshot.text) {
    return failure('A nota mudou depois da seleção; selecione o trecho novamente');
  }

  if (action === 'erase') {
    const wrapper = `==${snapshot.selectedText}==`;
    const wrappers = occurrences(section.text, wrapper);
    if (wrappers.length !== 1) {
      return failure(
        wrappers.length === 0
          ? 'A seleção não corresponde a uma marcação'
          : 'Há mais de uma marcação igual neste bloco; selecione um trecho inequívoco',
      );
    }
    const wrapperStart = wrappers[0];
    if (wrapperStart === undefined) return failure('A marcação não pôde ser localizada');
    const replacement =
      section.text.slice(0, wrapperStart) +
      snapshot.selectedText +
      section.text.slice(wrapperStart + wrapper.length);
    return success(
      content.slice(0, section.start) + replacement + content.slice(section.end),
      'Marcação removida',
    );
  }

  const matches = occurrences(section.text, snapshot.selectedText);
  if (matches.length !== 1) {
    return failure(
      matches.length === 0
        ? 'O texto selecionado não pôde ser localizado no Markdown'
        : 'Há mais de uma ocorrência igual neste bloco; selecione um trecho inequívoco',
    );
  }
  const matchStart = matches[0];
  if (matchStart === undefined) return failure('O trecho não pôde ser localizado');
  const matchEnd = matchStart + snapshot.selectedText.length;
  if (
    section.text.slice(Math.max(0, matchStart - 2), matchStart) === '==' &&
    section.text.slice(matchEnd, matchEnd + 2) === '=='
  ) {
    return failure('O trecho selecionado já está marcado');
  }
  if (protectedRanges(section.text).some((range) => overlaps(range, matchStart, matchEnd))) {
    return failure('Selecione texto simples que não esteja dentro de outra formatação');
  }

  const replacement =
    section.text.slice(0, matchStart) +
    `==${snapshot.selectedText}==` +
    section.text.slice(matchEnd);
  return success(
    content.slice(0, section.start) + replacement + content.slice(section.end),
    'Trecho marcado',
  );
}

function closestAllowedBlock(node: Node, boundary: HTMLElement): HTMLElement | null {
  const element =
    node.nodeType === Node.ELEMENT_NODE ? (node as HTMLElement) : node.parentElement;
  const block = element?.closest<HTMLElement>(ALLOWED_BLOCK_SELECTOR) ?? null;
  return block && boundary.contains(block) ? block : null;
}

function sectionRange(
  content: string,
  lineStart: number,
  lineEnd: number,
): { start: number; end: number; text: string } | null {
  const starts = [0];
  for (let index = 0; index < content.length; index += 1) {
    if (content[index] === '\n') starts.push(index + 1);
  }
  const start = starts[lineStart];
  if (start === undefined) return null;
  const nextLine = starts[lineEnd + 1];
  const end = nextLine === undefined ? content.length : nextLine - 1;
  if (end < start) return null;
  return { start, end, text: content.slice(start, end) };
}

function occurrences(source: string, needle: string): number[] {
  const positions: number[] = [];
  let position = source.indexOf(needle);
  while (position !== -1) {
    positions.push(position);
    position = source.indexOf(needle, position + Math.max(1, needle.length));
  }
  return positions;
}

function protectedRanges(source: string): SourceRange[] {
  const ranges: SourceRange[] = [];
  for (const pattern of PROTECTED_INLINE_PATTERNS) {
    pattern.lastIndex = 0;
    let match = pattern.exec(source);
    while (match) {
      ranges.push({ start: match.index, end: match.index + match[0].length });
      match = pattern.exec(source);
    }
  }
  return ranges;
}

function overlaps(range: SourceRange, start: number, end: number): boolean {
  return start < range.end && end > range.start;
}

function success(content: string, message: string): AnnotationEditResult {
  return { ok: true, content, message };
}

function failure(message: string): AnnotationEditResult {
  return { ok: false, message };
}

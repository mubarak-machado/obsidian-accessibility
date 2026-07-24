// @vitest-environment happy-dom

import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  applyReadingAnnotation,
  ReadingAnnotationController,
  ReadingSectionRegistry,
  type ReadingSelectionSnapshot,
} from '../src/reading-annotation';

function snapshot(
  selectedText: string,
  lineStart = 0,
  lineEnd = lineStart,
): ReadingSelectionSnapshot {
  return {
    sourcePath: 'Notas/Teste.md',
    lineStart,
    lineEnd,
    selectedText,
  };
}

beforeEach(() => {
  vi.useRealTimers();
  document.getSelection()?.removeAllRanges();
  document.body.innerHTML = '';
});

describe('applyReadingAnnotation', () => {
  it('aplica o formato nativo somente à ocorrência selecionada', () => {
    const content = '# Título\n\nUm trecho simples para marcar.\n\nFinal.';
    const result = applyReadingAnnotation(
      content,
      snapshot('trecho simples', 2),
      'mark',
    );

    expect(result).toEqual({
      ok: true,
      content: '# Título\n\nUm ==trecho simples== para marcar.\n\nFinal.',
      message: 'Trecho marcado',
    });
  });

  it('remove apenas o par externo da marcação', () => {
    const content = 'Um ==trecho simples== para manter.';
    const result = applyReadingAnnotation(
      content,
      snapshot('trecho simples'),
      'erase',
    );

    expect(result).toEqual({
      ok: true,
      content: 'Um trecho simples para manter.',
      message: 'Marcação removida',
    });
  });

  it('recusa ocorrências repetidas no mesmo bloco', () => {
    const content = 'repetido e repetido';
    const result = applyReadingAnnotation(content, snapshot('repetido'), 'mark');

    expect(result.ok).toBe(false);
    expect(result.message).toContain('mais de uma ocorrência');
  });

  it('aceita alteração alheia quando o trecho continua único no intervalo atual', () => {
    const result = applyReadingAnnotation(
      'Texto atualizado.',
      snapshot('Texto'),
      'mark',
    );

    expect(result).toEqual({
      ok: true,
      content: '==Texto== atualizado.',
      message: 'Trecho marcado',
    });
  });

  it('recusa âncora de linhas que não existe mais', () => {
    const result = applyReadingAnnotation('Texto atual.', snapshot('Texto', 2), 'mark');

    expect(result).toEqual({
      ok: false,
      message: 'O trecho não pôde ser relacionado ao Markdown atual; selecione novamente',
    });
  });

  it.each([
    ['Um **trecho forte**.', 'trecho forte'],
    ['Um [trecho ligado](https://example.com).', 'trecho ligado'],
    ['Um `trecho de código`.', 'trecho de código'],
    ['Um ==trecho marcado==.', 'trecho marcado'],
  ])('recusa marcação dentro de outra formatação: %s', (content, selectedText) => {
    const result = applyReadingAnnotation(content, snapshot(selectedText), 'mark');

    expect(result.ok).toBe(false);
  });

  it('recusa apagar texto que não esteja marcado', () => {
    const content = 'Texto sem marcação.';
    const result = applyReadingAnnotation(content, snapshot('sem marcação'), 'erase');

    expect(result).toEqual({
      ok: false,
      message: 'A seleção não corresponde a uma marcação',
    });
  });

  it('recusa seleção com quebra de linha', () => {
    const content = 'Primeira linha\nsegunda linha';
    const result = applyReadingAnnotation(
      content,
      snapshot('linha\nsegunda', 0, 1),
      'mark',
    );

    expect(result.ok).toBe(false);
    expect(result.message).toContain('único bloco');
  });
});

describe('ReadingSectionRegistry', () => {
  it('usa somente a âncora pública de seção e respeita o limite da folha', () => {
    const registry = new ReadingSectionRegistry();
    const boundary = document.createElement('div');
    const section = boundary.appendChild(document.createElement('div'));
    const paragraph = section.appendChild(document.createElement('p'));
    const text = paragraph.appendChild(document.createTextNode('Texto'));
    document.body.appendChild(boundary);

    registry.register(section, {
      sourcePath: 'Notas/Teste.md',
      getSectionInfo: () => ({ text: 'Texto', lineStart: 4, lineEnd: 4 }),
    } as never);

    expect(registry.find(text, boundary)?.anchor).toEqual({
      sourcePath: 'Notas/Teste.md',
      lineStart: 4,
      lineEnd: 4,
    });
    expect(registry.find(text, document.createElement('div'))).toBeNull();
  });
});

describe('ReadingAnnotationController', () => {
  function setupController(
    initialContent = 'Um trecho simples para marcar.',
    renderedText = 'Um trecho simples para marcar.',
    beforeRead: () => Promise<void> = async () => undefined,
  ): {
    container: HTMLDivElement;
    controller: ReadingAnnotationController;
    paragraphText: Text;
    getContent: () => string;
    notices: string[];
    setMode: (mode: 'preview' | 'source') => void;
    setFilePath: (path: string) => void;
  } {
    const container = document.createElement('div');
    const section = container.appendChild(document.createElement('div'));
    const paragraph = section.appendChild(document.createElement('p'));
    const paragraphText = paragraph.appendChild(
      document.createTextNode(renderedText),
    );
    document.body.appendChild(container);

    const registry = new ReadingSectionRegistry();
    registry.register(section, {
      sourcePath: 'Notas/Teste.md',
      getSectionInfo: () => ({
        text: 'Representação do renderizador deliberadamente diferente.',
        lineStart: 0,
        lineEnd: 0,
      }),
    } as never);

    let mode: 'preview' | 'source' = 'preview';
    let content = initialContent;
    const file = { path: 'Notas/Teste.md' };
    const vault = {
      getFileByPath: vi.fn(() => file),
      cachedRead: vi.fn(async () => {
        await beforeRead();
        return content;
      }),
      process: vi.fn(async (_file, operation: (data: string) => string) => {
        content = operation(content);
        return content;
      }),
    };
    const view = {
      containerEl: container,
      contentEl: section,
      file,
      getMode: () => mode,
    };
    const notices: string[] = [];
    return {
      container,
      controller: new ReadingAnnotationController(
        view as never,
        vault as never,
        registry,
        (message) => notices.push(message),
      ),
      paragraphText,
      getContent: () => content,
      notices,
      setMode: (nextMode) => {
        mode = nextMode;
      },
      setFilePath: (path) => {
        file.path = path;
      },
    };
  }

  it('preserva a última seleção quando o toque no controle recolhe as alças', async () => {
    const { controller, paragraphText, getContent, notices } = setupController();
    controller.toggle();

    const range = document.createRange();
    range.setStart(paragraphText, 3);
    range.setEnd(paragraphText, 17);
    document.getSelection()?.addRange(range);
    document.dispatchEvent(new Event('selectionchange'));
    expect(controller.state.hasSelection).toBe(true);

    controller.rememberCurrentSelection();
    document.getSelection()?.removeAllRanges();
    document.dispatchEvent(new Event('selectionchange'));
    expect(controller.state.hasSelection).toBe(true);

    await expect(controller.mark()).resolves.toBe(true);
    expect(getContent()).toBe('Um ==trecho simples== para marcar.');
    expect(controller.state.hasSelection).toBe(false);
    expect(notices).toEqual(['Trecho marcado']);
    controller.destroy();
  });

  it('não reaproveita a preservação do painel depois de uma nova seleção cancelada', async () => {
    vi.useFakeTimers();
    const { controller, paragraphText, getContent } = setupController();
    controller.toggle();
    const initialRange = document.createRange();
    initialRange.setStart(paragraphText, 3);
    initialRange.setEnd(paragraphText, 17);
    document.getSelection()?.addRange(initialRange);
    document.dispatchEvent(new Event('selectionchange'));
    controller.rememberCurrentSelection();

    const secondParagraph = paragraphText.parentElement?.parentElement?.appendChild(
      document.createElement('p'),
    );
    const secondText = secondParagraph?.appendChild(document.createTextNode('Outro bloco.'));
    document.getSelection()?.removeAllRanges();
    if (secondText) {
      const invalidRange = document.createRange();
      invalidRange.setStart(paragraphText, 3);
      invalidRange.setEnd(secondText, 5);
      document.getSelection()?.addRange(invalidRange);
      document.dispatchEvent(new Event('selectionchange'));
    }
    expect(controller.state.hasSelection).toBe(false);

    document.getSelection()?.removeAllRanges();
    const newRange = document.createRange();
    newRange.setStart(paragraphText, 3);
    newRange.setEnd(paragraphText, 17);
    document.getSelection()?.addRange(newRange);
    document.dispatchEvent(new Event('selectionchange'));
    expect(controller.state.hasSelection).toBe(true);
    document.getSelection()?.removeAllRanges();
    document.dispatchEvent(new Event('selectionchange'));

    expect(controller.state.hasSelection).toBe(false);
    await vi.advanceTimersByTimeAsync(400);
    expect(getContent()).toBe('Um trecho simples para marcar.');
    controller.destroy();
  });

  it('aguarda estabilização da seleção quando o iPadOS cancela o ponteiro', async () => {
    vi.useFakeTimers();
    const { controller, paragraphText, getContent } = setupController();
    controller.toggle();

    paragraphText.parentElement?.dispatchEvent(
      new PointerEvent('pointerdown', {
        bubbles: true,
        isPrimary: true,
        pointerId: 8,
        pointerType: 'touch',
      }),
    );
    const range = document.createRange();
    range.setStart(paragraphText, 3);
    range.setEnd(paragraphText, 17);
    document.getSelection()?.addRange(range);
    document.dispatchEvent(new Event('selectionchange'));
    paragraphText.parentElement?.dispatchEvent(
      new PointerEvent('pointercancel', {
        bubbles: true,
        isPrimary: true,
        pointerId: 8,
        pointerType: 'touch',
      }),
    );

    await vi.advanceTimersByTimeAsync(POINTER_APPLY_WAIT_MS);
    expect(getContent()).toBe('Um trecho simples para marcar.');
    await vi.advanceTimersByTimeAsync(400);
    expect(getContent()).toBe('Um ==trecho simples== para marcar.');
    controller.destroy();
  });

  it.each([
    ['Apple Pencil', 'pen'],
    ['dedo', 'touch'],
  ] as const)('marca automaticamente quando a seleção termina com %s', async (_name, pointerType) => {
    vi.useFakeTimers();
    const { controller, paragraphText, getContent, notices } = setupController();
    controller.toggle();

    paragraphText.parentElement?.dispatchEvent(
      new PointerEvent('pointerdown', {
        bubbles: true,
        isPrimary: true,
        pointerId: 7,
        pointerType,
      }),
    );
    const range = document.createRange();
    range.setStart(paragraphText, 3);
    range.setEnd(paragraphText, 17);
    document.getSelection()?.addRange(range);
    document.dispatchEvent(new Event('selectionchange'));

    await vi.advanceTimersByTimeAsync(400);
    expect(getContent()).toBe('Um trecho simples para marcar.');

    paragraphText.parentElement?.dispatchEvent(
      new PointerEvent('pointerup', {
        bubbles: true,
        isPrimary: true,
        pointerId: 7,
        pointerType,
      }),
    );
    await vi.advanceTimersByTimeAsync(POINTER_APPLY_WAIT_MS);

    expect(getContent()).toBe('Um ==trecho simples== para marcar.');
    expect(notices).toEqual(['Trecho marcado']);
    controller.destroy();
  });

  it('apaga automaticamente com a borracha ativa', async () => {
    vi.useFakeTimers();
    const { controller, paragraphText, getContent, notices } = setupController(
      'Um ==trecho simples== para marcar.',
    );
    controller.toggle();
    controller.selectTool('erase');

    const range = document.createRange();
    range.setStart(paragraphText, 3);
    range.setEnd(paragraphText, 17);
    document.getSelection()?.addRange(range);
    document.dispatchEvent(new Event('selectionchange'));
    await vi.advanceTimersByTimeAsync(400);

    expect(getContent()).toBe('Um trecho simples para marcar.');
    expect(notices).toEqual(['Marcação removida']);
    expect(controller.state.tool).toBe('erase');
    controller.destroy();
  });

  it('marca uma seleção existente ao ativar o lápis', async () => {
    vi.useFakeTimers();
    const { controller, paragraphText, getContent } = setupController();
    const range = document.createRange();
    range.setStart(paragraphText, 3);
    range.setEnd(paragraphText, 17);
    document.getSelection()?.addRange(range);

    controller.toggle();
    await vi.advanceTimersByTimeAsync(1);

    expect(getContent()).toBe('Um ==trecho simples== para marcar.');
    controller.destroy();
  });

  it('mantém a ferramenta escolhida ativa entre seleções', () => {
    const { controller } = setupController();
    controller.toggle();
    expect(controller.state.tool).toBe('mark');
    expect(controller.state.active).toBe(true);

    controller.selectTool('erase');

    expect(controller.state.tool).toBe('erase');
    expect(controller.state.active).toBe(true);
    controller.destroy();
  });

  it('distingue classes de marcador, borracha e saída sem depender somente da cor', () => {
    const { container, controller } = setupController();
    controller.toggle();
    expect(container.classList.contains('oa-reading-annotation-active')).toBe(true);
    expect(container.classList.contains('oa-reading-annotation-mark')).toBe(true);
    expect(container.classList.contains('oa-reading-annotation-erase')).toBe(false);

    controller.selectTool('erase');
    expect(container.classList.contains('oa-reading-annotation-mark')).toBe(false);
    expect(container.classList.contains('oa-reading-annotation-erase')).toBe(true);

    controller.exit();
    expect(container.classList.contains('oa-reading-annotation-active')).toBe(false);
    expect(container.classList.contains('oa-reading-annotation-erase')).toBe(false);
    controller.destroy();
  });

  it('versiona anúncios iguais para que o VoiceOver possa repeti-los', () => {
    const { controller } = setupController();
    controller.toggle();
    const firstAnnouncement = controller.state.announcementId;

    controller.selectTool('mark');

    expect(controller.state.message).toContain('Marcador ativo');
    expect(controller.state.announcementId).toBeGreaterThan(firstAnnouncement);
    controller.destroy();
  });

  it('encerra o modo ao sair da leitura', () => {
    const { controller, setMode } = setupController();
    controller.toggle();
    expect(controller.active).toBe(true);

    setMode('source');
    controller.refreshContext();

    expect(controller.active).toBe(false);
    expect(controller.state.message).toContain('sair do modo leitura');
    controller.destroy();
  });

  it('cancela uma escrita em andamento quando a folha muda de nota', async () => {
    let releaseRead = (): void => undefined;
    const readGate = new Promise<void>((resolve) => {
      releaseRead = resolve;
    });
    const { controller, paragraphText, getContent, setFilePath } = setupController(
      'Um trecho simples para marcar.',
      'Um trecho simples para marcar.',
      () => readGate,
    );
    controller.toggle();
    const range = document.createRange();
    range.setStart(paragraphText, 3);
    range.setEnd(paragraphText, 17);
    document.getSelection()?.addRange(range);
    document.dispatchEvent(new Event('selectionchange'));

    const pendingWrite = controller.mark();
    setFilePath('Notas/Outra.md');
    controller.refreshContext();
    releaseRead();

    await expect(pendingWrite).resolves.toBe(false);
    expect(controller.active).toBe(false);
    expect(getContent()).toBe('Um trecho simples para marcar.');
    controller.destroy();
  });

  it('isola uma nova escrita ao sair e reabrir na mesma nota', async () => {
    let releaseOldRead = (): void => undefined;
    let releaseNewRead = (): void => undefined;
    const oldReadGate = new Promise<void>((resolve) => {
      releaseOldRead = resolve;
    });
    const newReadGate = new Promise<void>((resolve) => {
      releaseNewRead = resolve;
    });
    let readCount = 0;
    const { controller, paragraphText, getContent } = setupController(
      'Um trecho simples para marcar.',
      'Um trecho simples para marcar.',
      () => {
        readCount += 1;
        return readCount === 1 ? oldReadGate : newReadGate;
      },
    );
    controller.toggle();
    const oldRange = document.createRange();
    oldRange.setStart(paragraphText, 3);
    oldRange.setEnd(paragraphText, 17);
    document.getSelection()?.addRange(oldRange);
    document.dispatchEvent(new Event('selectionchange'));

    const oldWrite = controller.mark();
    controller.exit();
    document.getSelection()?.removeAllRanges();
    controller.toggle();
    const newRange = document.createRange();
    newRange.setStart(paragraphText, 3);
    newRange.setEnd(paragraphText, 17);
    document.getSelection()?.addRange(newRange);
    document.dispatchEvent(new Event('selectionchange'));
    const newWrite = controller.mark();

    releaseOldRead();
    await expect(oldWrite).resolves.toBe(false);
    expect(controller.state.busy).toBe(true);
    expect(controller.state.message).toContain('Marcador ativo');
    expect(getContent()).toBe('Um trecho simples para marcar.');

    releaseNewRead();
    await expect(newWrite).resolves.toBe(true);
    expect(controller.active).toBe(true);
    expect(controller.state.busy).toBe(false);
    expect(getContent()).toBe('Um ==trecho simples== para marcar.');
    controller.destroy();
  });
});

const POINTER_APPLY_WAIT_MS = 100;

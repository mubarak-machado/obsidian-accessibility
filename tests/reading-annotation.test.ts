// @vitest-environment happy-dom

import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  applyReadingAnnotation,
  ReadingAnnotationController,
  ReadingSectionRegistry,
  type ReadingSelectionSnapshot,
} from '../src/reading-annotation';

function snapshot(
  text: string,
  selectedText: string,
  lineStart = 0,
  lineEnd = lineStart,
): ReadingSelectionSnapshot {
  return {
    sourcePath: 'Notas/Teste.md',
    lineStart,
    lineEnd,
    text,
    selectedText,
  };
}

beforeEach(() => {
  document.body.innerHTML = '';
});

describe('applyReadingAnnotation', () => {
  it('aplica o formato nativo somente à ocorrência selecionada', () => {
    const content = '# Título\n\nUm trecho simples para marcar.\n\nFinal.';
    const result = applyReadingAnnotation(
      content,
      snapshot('Um trecho simples para marcar.', 'trecho simples', 2),
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
      snapshot(content, 'trecho simples'),
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
    const result = applyReadingAnnotation(content, snapshot(content, 'repetido'), 'mark');

    expect(result.ok).toBe(false);
    expect(result.message).toContain('mais de uma ocorrência');
  });

  it('recusa uma seção alterada depois da seleção', () => {
    const result = applyReadingAnnotation(
      'Texto atualizado.',
      snapshot('Texto original.', 'Texto'),
      'mark',
    );

    expect(result).toEqual({
      ok: false,
      message: 'A nota mudou depois da seleção; selecione o trecho novamente',
    });
  });

  it.each([
    ['Um **trecho forte**.', 'trecho forte'],
    ['Um [trecho ligado](https://example.com).', 'trecho ligado'],
    ['Um `trecho de código`.', 'trecho de código'],
    ['Um ==trecho marcado==.', 'trecho marcado'],
  ])('recusa marcação dentro de outra formatação: %s', (content, selectedText) => {
    const result = applyReadingAnnotation(content, snapshot(content, selectedText), 'mark');

    expect(result.ok).toBe(false);
  });

  it('recusa apagar texto que não esteja marcado', () => {
    const content = 'Texto sem marcação.';
    const result = applyReadingAnnotation(content, snapshot(content, 'sem marcação'), 'erase');

    expect(result).toEqual({
      ok: false,
      message: 'A seleção não corresponde a uma marcação',
    });
  });

  it('recusa seleção com quebra de linha', () => {
    const content = 'Primeira linha\nsegunda linha';
    const result = applyReadingAnnotation(
      content,
      snapshot(content, 'linha\nsegunda', 0, 1),
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
      text: 'Texto',
    });
    expect(registry.find(text, document.createElement('div'))).toBeNull();
  });
});

describe('ReadingAnnotationController', () => {
  function setupController(): {
    controller: ReadingAnnotationController;
    paragraphText: Text;
    getContent: () => string;
    notices: string[];
    setMode: (mode: 'preview' | 'source') => void;
  } {
    const container = document.createElement('div');
    const section = container.appendChild(document.createElement('div'));
    const paragraph = section.appendChild(document.createElement('p'));
    const paragraphText = paragraph.appendChild(
      document.createTextNode('Um trecho simples para marcar.'),
    );
    document.body.appendChild(container);

    const registry = new ReadingSectionRegistry();
    registry.register(section, {
      sourcePath: 'Notas/Teste.md',
      getSectionInfo: () => ({
        text: 'Um trecho simples para marcar.',
        lineStart: 0,
        lineEnd: 0,
      }),
    } as never);

    let mode: 'preview' | 'source' = 'preview';
    let content = 'Um trecho simples para marcar.';
    const file = { path: 'Notas/Teste.md' };
    const vault = {
      getFileByPath: vi.fn(() => file),
      cachedRead: vi.fn(async () => content),
      process: vi.fn(async (_file, operation: (data: string) => string) => {
        content = operation(content);
        return content;
      }),
    };
    const view = {
      containerEl: container,
      file,
      getMode: () => mode,
    };
    const notices: string[] = [];
    return {
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

    document.getSelection()?.removeAllRanges();
    document.dispatchEvent(new Event('selectionchange'));
    expect(controller.state.hasSelection).toBe(true);

    await expect(controller.mark()).resolves.toBe(true);
    expect(getContent()).toBe('Um ==trecho simples== para marcar.');
    expect(controller.state.hasSelection).toBe(false);
    expect(notices).toEqual(['Trecho marcado']);
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
});

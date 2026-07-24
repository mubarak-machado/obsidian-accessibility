# Revisão — anotação rápida no modo leitura

Data: 2026-07-23

Escopo: implementação do MVP aprovado com uma cor nativa, borracha e suporte
comum a dedo e Apple Pencil.

## Resultado

Nenhum bloqueio de código permaneceu após a revisão. A funcionalidade está
apta para teste físico, mas não para lançamento antes desse gate.

## Correções feitas durante a revisão

1. A última seleção válida passou a sobreviver ao recolhimento das alças quando
   o usuário toca na paleta.
2. Erros e sucessos passaram a aparecer em `Notice`, além do live region, para
   não deixar a recusa invisível a usuários sem leitor de tela.
3. A consulta pública `getSectionInfo()` passou a ocorrer no momento da seleção,
   conforme a orientação da API, e não apenas no pós-processamento inicial.
4. A inspeção móvel passou a aceitar exclusivamente `Vault.process()` e a
   rejeitar outras rotas de escrita.
5. O harness trocou glifos aproximados pelos SVGs usados pelo controle; isso
   eliminou um falso overflow na escala Mínima.

## Segurança da escrita

- A escrita exige modo de Leitura, seleção não vazia e um único bloco aceito.
- O caminho, as linhas e o texto integral da seção precisam continuar iguais.
- O trecho precisa ter uma única ocorrência na seção.
- Links, código, HTML, ênfase, destaque existente e outros wrappers reconhecidos
  são recusados para a ação de marcar.
- A borracha remove apenas o wrapper exato `==texto==`.
- Uma pré-validação evita transação desnecessária; a mesma validação é repetida
  dentro de `Vault.process()` para detectar concorrência.

## Evidência automatizada

- `npm ci`: concluído com npm `11.11.0`.
- `npm run check`: ESLint, 75 testes, TypeScript, build e inspeção móvel
  concluídos.
- Bundle: `36.115` bytes, sem Node/Electron e com escrita restrita a
  `Vault.process()`.
- Instalação em cofre temporário isolado: os hashes de `main.js`,
  `manifest.json` e `styles.css` coincidiram com os arquivos da raiz.
- `git diff --check`: concluído.

## Evidência visual

O harness foi renderizado no Chromium nas escalas Grande, Média e Mínima. Os
painéis normal e ativo ficaram sem overflow nas três escalas. O painel ativo
mediu aproximadamente:

| Escala | Largura | Altura |
| --- | ---: | ---: |
| Grande | 75 px | 255 px |
| Média | 50 px | 178 px |
| Mínima | 25 px | 92 px |

Não houve erro de console ou de página.

## Gate humano pendente

Validar em Obsidian no iPad físico:

- seleção por palavra e ajuste pelas alças com dedo;
- as mesmas operações com Apple Pencil;
- toque com dedo e caneta nos botões marcar e apagar;
- persistência da paleta entre seleções;
- VoiceOver, teclado externo e `Escape`;
- retrato, paisagem e Split View;
- recusa de seleção em link, múltiplos blocos e texto repetido;
- saída por mudança de nota, modo e descarregamento.

O duplo toque no corpo do Apple Pencil não faz parte deste gate. Ele permanece
no backlog porque depende de `UIPencilInteraction`, sem evento web documentado
equivalente.

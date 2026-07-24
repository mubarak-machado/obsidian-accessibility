# Revisão — escala tipográfica completa

Data: 2026-07-24

Escopo: fazer a escala de Leitura e Edição alcançar todos os elementos
tipográficos da nota ativa, sem ampliar a interface do plugin e sem alterar
versão ou dependências.

## Resultado

A revisão não deixou bloqueios de código. A correção substitui o ajuste isolado
de `font-size` por uma base `--font-text-size` própria em cada modo e reancora
os tokens de tabela e altura de propriedades que o Obsidian calcula contra a
base global. Transclusões dentro da Visualização ao vivo usam a escala de
Edição.

O escopo continua limitado à folha Markdown ativa. Títulos preservam as razões
do tema, conteúdo menor continua proporcional e o controle flutuante conserva
suas dimensões de interface.

## Evidência da causa

No primeiro render do harness, Leitura em `55 px` produziu:

| Elemento | Antes da reancoragem |
| --- | ---: |
| parágrafo | `55 px` |
| H1 | `89,0 px` |
| célula da tabela | `16 px` |
| código | `48,1 px` |

A tabela permanecia no valor global porque `--table-text-size` já havia sido
resolvido no `body`.

## Evidência automatizada

- `npm ci`: concluído com npm `11.11.0`;
- `npm run check`: ESLint, 99 testes, TypeScript, build e inspeção móvel
  concluídos;
- bundle: `41.446` bytes, sem Node/Electron e com escrita restrita a
  `Vault.process()`;
- `git diff --check`: concluído.

Os testes verificam bases distintas para Leitura e Edição, reancoragem dos
tokens globais, transclusão na escala de Edição, ausência de `zoom` e presença
de toda a amostra semântica no harness.

## Evidência visual no navegador

O próprio `styles.css` foi renderizado em viewport de iPad `1024 × 1366`, nos
temas claro e escuro:

| Modo | Base | H1 | Tabela | Código |
| --- | ---: | ---: | ---: | ---: |
| Leitura | `32 px` | `51,8 px` | `32 px` | `28,0 px` |
| Leitura | `55 px` | `89,0 px` | `55 px` | `48,1 px` |
| Leitura | `75 px` | `121,3 px` | `75 px` | `65,6 px` |
| Edição | `32 px` | `51,8 px` | `32 px` | `28,0 px` |
| Edição | `50 px` | `80,9 px` | `50 px` | `43,8 px` |
| Edição | `60 px` | `97,1 px` | `60 px` | `52,5 px` |

Título interno, H1–H6, parágrafo, lista, citação, callout, tabela, código,
fórmula, tag, nota de rodapé, propriedades e nota incorporada acompanharam a
base. A transclusão em Edição calculou `60 px`, não o valor de Leitura.

Não houve overflow horizontal global ou do conteúdo nos estados inspecionados.
O acionador usado como sentinela permaneceu em `48 × 48 px` em toda a matriz.

## Compatibilidade e gate humano

Temas e snippets que usam os tokens documentados e unidades relativas
preservam suas proporções. Uma regra externa que force tamanho absoluto com
`!important` continua tendo precedência deliberada; o plugin não tenta dominar
toda a cascata.

Antes de lançar esta correção, validar no iPad físico:

- Leitura em `32`, `55` e `75 px`;
- Visualização ao vivo em `32`, `50` e `60 px`;
- título interno, H1–H6, tabela, callout, código, propriedades, tarefa e
  transclusão;
- retrato, paisagem e Split View;
- preservação da posição de leitura ao mover o slider;
- VoiceOver e seleção de texto com dedo e Apple Pencil;
- temas claro e escuro e os snippets pessoais atualmente ativos.

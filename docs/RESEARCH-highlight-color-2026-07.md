# Pesquisa — cor única do destaque nativo

Data: 2026-07-24

Status: abordagem implementada como funcionalidade isolada, sem incremento de
versão ou atualização de dependências. Requer validação física antes de
lançamento.

## Objetivo

Permitir que a pessoa escolha uma única cor para os destaques Markdown
`==texto==`. A escolha deve:

- sobrepor a apresentação definida pelo tema;
- funcionar em Leitura e Visualização ao vivo;
- acompanhar a assinatura visual do marcador no painel;
- ficar somente nos dados do plugin;
- não introduzir sintaxe, HTML ou cor inline na nota;
- restaurar explicitamente a cor do tema;
- manter o texto legível para qualquer cor aceita pelo seletor.

Todos os `==texto==` da nota ativa recebem a mesma cor. O Markdown nativo não
registra qual plugin criou uma marcação, portanto não existe uma procedência
segura que permita colorir somente as anotações novas.

## Evidência do Obsidian atual

Na instalação local do Obsidian `1.12.7`, o pacote
`obsidian-1.12.7.asar` tem SHA-256
`2b2483b2e1246772e0d25367ec055cbc5047ea2f0091b667c35656678f86d712`.
A inspeção somente para interoperabilidade encontrou:

- `--text-highlight-bg-rgb: 255, 208, 0`;
- `--text-highlight-bg: rgba(var(--text-highlight-bg-rgb), 0.4)`;
- `.markdown-rendered mark` em Leitura;
- `.cm-s-obsidian span.cm-formatting-highlight` e
  `.cm-s-obsidian span.cm-highlight` no editor.

Isso coincide com a documentação pública, que define
`--text-highlight-bg` como o fundo de texto destacado.

## Referências avaliadas

| Referência | Revisão | Licença | Compatibilidade móvel | Classificação |
| --- | --- | --- | --- | --- |
| [Obsidian Developer Docs — Colors](https://github.com/obsidianmd/obsidian-developer-docs/blob/2d0e942f03b23ed94ebda3c610ed074662ed63db/en/Reference/CSS%20variables/Foundations/Colors.md) | commit `2d0e942f03b23ed94ebda3c610ed074662ed63db`, consultado em 2026-07-24 | documentação oficial sob os termos do Obsidian; nenhum código copiado | o token pertence ao CSS compartilhado do aplicativo | **adotar** `--text-highlight-bg` como contrato semântico do destaque |
| [Ajuda do Obsidian — sintaxe básica](https://obsidian.md/help/syntax) | página vigente, consultada em 2026-07-24 | termos da documentação do Obsidian | `==texto==` é formato nativo em desktop e mobile | **adotar** a sintaxe existente; **rejeitar** novo formato persistente |
| [API do Obsidian](https://github.com/obsidianmd/obsidian-api/blob/cc1744324150c632416857c98964f87b1574a5fc/obsidian.d.ts) | commit `cc1744324150c632416857c98964f87b1574a5fc`; tipos npm `1.13.1` já fixados no projeto | MIT | `ColorComponent` e `Setting.addColorPicker()` são APIs públicas sem Node/Electron; o seletor existe desde versões anteriores ao mínimo do plugin | **adotar** o componente de cor nativo e um botão nativo de restauração |
| [Style Settings](https://github.com/obsidian-community/obsidian-style-settings/tree/4ebec6ae0131a9d5e8307bb5e26d59db5ba2e81c) | `1.0.9`, commit `4ebec6ae0131a9d5e8307bb5e26d59db5ba2e81c` | GPL-3.0 | `isDesktopOnly: false`; oferece variáveis de cor em mobile | **adaptar** o padrão de preferência persistente; **rejeitar** dependência externa e escrita global no `body` |
| [Reading Highlighter](https://github.com/keithwithAI/reading-highlighter/tree/d8d078d0b41d7c3b40ac28e9ad182775d2527e39) | `1.6.1`, commit `d8d078d0b41d7c3b40ac28e9ad182775d2527e39` | MIT | desktop e mobile; grava `==texto==` | **adotar** a interoperabilidade com a sintaxe nativa; não acrescenta uma cor própria ao Markdown |
| [Reader Highlighter Tags](https://github.com/DuckTapeKiller/obsidian-reader-highlighter-tags/tree/eb3d55f28ff9a6e47330cbb0edc5ae2e24d9f858) | `1.0.5`, commit `eb3d55f28ff9a6e47330cbb0edc5ae2e24d9f858` | MIT | desktop e mobile; oferece paleta e `<mark>` persistente | **rejeitar** paleta, HTML e cor inline para esta etapa; violariam a escolha única e gravariam preferência visual no conteúdo |
| [WCAG 2.2 — contraste mínimo](https://www.w3.org/TR/WCAG22/#contrast-minimum) | W3C Recommendation vigente, consultada em 2026-07-24 | W3C Document License | aplica-se à WebView do iPadOS | **adotar** `4,5:1` como mínimo para texto normal sobre a cor escolhida |

Nenhum código externo foi copiado.

## Decisão de implementação

A configuração ganhou `highlightColor: string | null`:

- `null` conserva a cor do tema;
- uma cor válida usa o formato sRGB `#rrggbb`;
- valores inválidos são normalizados para `null`;
- o esquema persistente passa de `3` para `4`;
- migrar do esquema `3` não repete a importação antiga do Style Settings e,
  assim, não sobrescreve tamanhos já configurados.

Um controlador independente monta a classe e duas propriedades CSS somente no
`containerEl` da folha Markdown ativa:

- `--oa-highlight-background`;
- `--oa-highlight-foreground`.

Ao trocar de folha, desativar o valor personalizado ou descarregar o plugin, a
classe e as propriedades são removidas. A preferência global continua
disponível para ser aplicada à próxima nota ativa.

No alvo real de `==texto==`, o CSS reancora localmente
`--text-highlight-bg` à propriedade escolhida. Essa delimitação é importante:
alterar o token na folha inteira também recoloriria resultados de busca e
outros indicadores que reutilizam o mesmo token. O seletor do editor exclui
explicitamente `.obsidian-search-match-highlight`.

O fundo personalizado é sólido e usa `mix-blend-mode: normal`, para que a cor
vista seja a cor escolhida e o contraste calculado não dependa da superfície
do tema. Links e código dentro de `<mark>` herdam a cor de texto acessível.

## Contraste

Para cada cor, o controlador calcula a luminância relativa sRGB conforme a
fórmula usada pela WCAG e compara os contrastes com preto e branco. A opção de
maior razão é aplicada ao texto. Na matriz visual:

| Fundo escolhido | Texto | Contraste |
| --- | --- | ---: |
| `#FFD000` | preto | `14,27:1` |
| `#1D4ED8` | branco | `6,70:1` |
| `#5B21B6` | branco | `8,98:1` |
| `#777777` | preto | `4,69:1` |

Os valores foram iguais nos temas claro e escuro porque o modo de mistura é
normal. Testes automatizados cobrem também preto e branco puros.

## Alternativas rejeitadas

- guardar `<mark style="background: ...">` na nota: cria HTML, vincula
  apresentação ao conteúdo e impede uma troca global limpa;
- introduzir várias classes ou cores semânticas: excede a decisão por uma cor
  única;
- alterar `--text-highlight-bg` no `body`: afeta todas as folhas e partes da
  interface;
- alterar o token no contêiner inteiro da folha: alcança busca e indicadores
  que não são marcações Markdown;
- usar somente a cor do tema para o texto: pode produzir contraste insuficiente
  quando a pessoa escolhe uma cor muito clara ou escura;
- adicionar `!important`: contraria as orientações de tema do Obsidian e torna
  a cascata mais difícil de recuperar.

## Riscos e gate físico

Os seletores de Leitura e Visualização ao vivo reproduzem os seletores usados
pelo Obsidian atual, mas as classes internas do CodeMirror não fazem parte de
uma API pública estável. A dependência fica isolada em CSS; se o editor mudar,
a Leitura continua usando `<mark>` e o recurso pode falhar no editor sem
quebrar o plugin. Uma atualização relevante do Obsidian exige revalidar esse
seletor.

Temas que forçam cores com `!important`, contrariando a orientação oficial,
podem continuar vencendo a regra do plugin. Não foi adicionado outro
`!important` para iniciar uma disputa global de precedência.

Antes de lançar, validar em iPad físico:

- abrir o seletor nativo de cor e salvar uma escolha;
- fechar e reabrir o Obsidian e trocar entre notas;
- Leitura e Visualização ao vivo nos temas claro e escuro;
- texto comum, link, título, lista, tabela, callout e transclusão marcados;
- assinatura de cor no painel de anotação;
- **Usar cor do tema**;
- VoiceOver no seletor, no botão de restauração e nos trechos;
- retrato, paisagem e Split View;
- anotação por dedo e Apple Pencil após trocar a cor.

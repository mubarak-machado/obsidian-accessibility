# Pesquisa e proposta inicial — anotação rápida no modo leitura

Data: 2026-07-23

Status: proposta aprovada e MVP implementado em 2026-07-23; validação
automatizada e visual concluída, com ensaio físico no iPad ainda obrigatório
antes do lançamento.

## Objetivo autorizado

Permitir que uma pessoa selecione texto no modo leitura e aplique, sem abrir o
teclado:

- uma marcação com a cor padrão de destaque do tema;
- remoção dessa marcação.

O modo permanece ativo durante várias anotações e só termina quando o botão de
anotação for desmarcado, `Escape` for pressionado, a nota ativa mudar ou o
plugin for descarregado. A primeira versão não inclui paleta de cores, tags,
comentários, PDF, Canvas, exportação nem pesquisa global.

## Interpretação da interação

O acionador universal de acessibilidade permanece inalterado. O painel normal
ganha um botão `Ativar anotação rápida`, logo abaixo do Modo Zen.

```text
Painel normal  ── transforma ──▶  Anotação rápida ativa
┌─────────┐                    ┌─────────┐
│  55 px  │                    │ Anotar  │
│  foco   │ Modo Zen           │ lápis ● │ desativar o modo
│  lápis  │ Anotação           │ marca   │ ==texto==
│    +    │                    │ borracha│ remover formato
│ slider  │                    └─────────┘
│    −    │
│ restaur.│
└─────────┘
```

No estado ativo:

1. a paleta compacta permanece aberta enquanto a pessoa toca e seleciona a
   nota;
2. selecionar texto não altera o arquivo automaticamente;
3. cada ação exige um toque explícito;
4. depois da ação, a seleção é descartada e a paleta aguarda o próximo trecho;
5. tocar novamente no botão de anotação retorna ao painel normal;
6. `Escape` sai do modo e devolve o foco ao acionador;
7. mudança de folha, arquivo ou modo invalida a seleção e encerra a sessão.

Tocar fora não fecha a paleta enquanto a anotação estiver ativa. Essa exceção
ao comportamento atual é necessária porque a seleção acontece fora do painel.

## Direção visual

O controle continua herdando integralmente o tema do Obsidian e a escala
configurada. A proposta não introduz uma nova paleta de produto.

| Papel | Token do produto | Valor usado somente no protótipo escuro |
| --- | --- | --- |
| superfície | `--background-primary` | `#201e27` |
| superfície elevada | `--background-primary-alt` | `#292633` |
| borda | `--background-modifier-border` | `#4b4657` |
| ação e foco | `--interactive-accent` | `#8b6df4` |
| texto | `--text-normal` | `#f5f2fa` |
| marcação | `--text-highlight-bg` | `rgb(255 208 0 / 45%)` |

A tipografia continua sendo `--font-interface`; o rótulo curto `Anotar` ocupa o
mesmo papel hoje usado por `55 px`. A assinatura visual é uma amostra fina da
cor real de marcação logo abaixo desse rótulo. Ela comunica qual cor será
aplicada sem oferecer uma paleta e sem depender somente da cor: o botão ativo,
o ícone e o nome acessível também identificam o modo.

O protótipo está em
[`tests/visual/annotation-mode-proposal.html`](../tests/visual/annotation-mode-proposal.html).

## Referências técnicas avaliadas

| Referência | Versão ou revisão | Licença | Relevância móvel | Classificação |
| --- | --- | --- | --- | --- |
| [Reading Highlighter](https://github.com/keithwithAI/reading-highlighter/tree/d8d078d0b41d7c3b40ac28e9ad182775d2527e39) | `1.6.1`, commit `d8d078d0b41d7c3b40ac28e9ad182775d2527e39`, 2026-05-21 | MIT | `isDesktopOnly: false`; oferece botão flutuante e ribbon móvel | **adaptar** captura explícita, limitação por bloco e `Vault.process()`; **rejeitar** depender silenciosamente de busca no documento inteiro e não adicionar histórico próprio no MVP |
| [Reader Highlighter Tags](https://github.com/DuckTapeKiller/obsidian-reader-highlighter-tags/tree/eb3d55f28ff9a6e47330cbb0edc5ae2e24d9f858) | `1.0.5`, commit `eb3d55f28ff9a6e47330cbb0edc5ae2e24d9f858`, 2026-06-30 | MIT | `isDesktopOnly: false`; inclui tratamento móvel e transclusões | **adaptar** a matriz de testes e a separação entre seleção e escrita; **rejeitar** a amplitude funcional e correspondência aproximada na primeira versão |
| [Underline](https://community.obsidian.md/plugins/obsidian-underline) | versão comunitária vigente, avaliada em 2026-07-23 | MIT no repositório publicado | disponível em desktop e mobile; usa `<u>conteúdo</u>` | **rejeitar na primeira versão**; adicionaria um segundo formato persistente e mais conflitos com Markdown aninhado |
| [Ajuda do Obsidian — conteúdo HTML](https://obsidian.md/help/html) | página vigente, avaliada em 2026-07-23 | termos da documentação do Obsidian | documenta `<u>Example</u>`, mas alerta para limitações de Markdown dentro de HTML | **rejeitar na primeira versão**; conservar como referência caso sublinhado seja reconsiderado |
| [Ajuda do Obsidian — sintaxe básica](https://obsidian.md/help/syntax) | página vigente, avaliada em 2026-07-23 | termos da documentação do Obsidian | `==texto==` é formato nativo em todas as plataformas | **adotar** uma única marcação nativa e deixar a cor a cargo do tema |
| [API do Obsidian](https://github.com/obsidianmd/obsidian-api/blob/cc1744324150c632416857c98964f87b1574a5fc/obsidian.d.ts) | API correspondente ao Obsidian `1.13.2`, commit `cc1744324150c632416857c98964f87b1574a5fc` | MIT | `MarkdownView`, pós-processamento e `Vault` não dependem de Node/Electron no runtime | **adotar** APIs públicas; isolar e evitar dependência obrigatória de atributos DOM não documentados |
| [Selection API](https://developer.mozilla.org/en-US/docs/Web/API/Selection_API) | documentação vigente, avaliada em 2026-07-23 | conteúdo MDN | `selectionchange`, `Selection` e `Range` são amplamente disponíveis em WebViews móveis | **adotar** captura da última seleção válida; não conservar um `Range` como única fonte após rerenderização |
| [WAI-ARIA APG — Button](https://www.w3.org/WAI/ARIA/apg/patterns/button/) | orientação vigente, avaliada em 2026-07-23 | W3C Software and Document License | define botão de alternância com estado perceptível | **adotar** botão nativo, `aria-pressed`, nome dinâmico e anúncio de estado |

Nenhum código externo foi copiado nesta etapa.

## Dedo e Apple Pencil

O fluxo básico não diferencia dedo e caneta. Ele usa a seleção de texto nativa,
observa `selectionchange` e ativa botões HTML por `click`, sem cancelar
`pointerdown` sobre o conteúdo. Essa escolha acompanha:

- a [documentação da Apple sobre entrada do Apple Pencil](https://developer.apple.com/documentation/uikit/handling-input-from-apple-pencil),
  segundo a qual UIKit entrega o toque da caneta pelo mesmo modelo básico usado
  para o toque dos dedos;
- a [documentação do Scribble](https://support.apple.com/guide/ipad/enter-text-with-scribble-ipad355ab2a7/ipados),
  que oferece seleção por círculo, sublinhado, duplo toque e ajuste das alças;
- o [Pointer Events](https://www.w3.org/TR/pointerevents3/), que unifica mouse,
  toque e caneta e recomenda `click` como ativação independente do dispositivo;
- o [WebKit do Safari 18.2](https://webkit.org/blog/16301/webkit-features-in-safari-18-2/),
  que expõe `pointerType` também nos eventos de ativação.

Não há impedimento conhecido para selecionar com Apple Pencil e tocar nos
botões com a caneta. Ainda assim, o comportamento exato da seleção em texto não
editável pertence ao iPadOS e à WebView do Obsidian; por isso, dedo e Apple
Pencil fazem parte da validação física obrigatória.

O duplo toque no corpo do Apple Pencil é diferente de um duplo toque da ponta
na tela. A Apple o entrega a aplicativos nativos por
[`UIPencilInteraction`](https://developer.apple.com/documentation/uikit/uipencilinteraction).
Não há evento web documentado equivalente. Alternar marca-texto e borracha por
esse gesto fica no backlog e dependerá de uma futura ponte nativa do Obsidian ou
do WebKit. Os dois botões visíveis continuam sendo a rota garantida.

## Formato persistente

| Ação | Formato | Decisão |
| --- | --- | --- |
| Marcar | `==texto==` | **adotar**; formato nativo, pesquisável e controlado pelo tema |
| Apagar | remover o par externo reconhecido | **adotar**; nunca executar substituição global |
| Sublinhado | `<u>texto</u>` | **rejeitar na primeira versão**; exige um segundo localizador e regras adicionais para HTML e formatação aninhada |
| Cores em `<mark style>` | HTML com cor embutida | **rejeitar**; mistura preferência visual com conteúdo e amplia a interface |
| Classes CSS no Markdown | `<span class="...">` | **rejeitar**; cria dependência do plugin para renderização |
| Banco lateral de anotações | seletores e offsets em `data.json` | **rejeitar nesta versão**; perde portabilidade e exige reconciliação após edição |

Manter apenas `==texto==` dá à primeira versão um único formato para aplicar,
reconhecer e remover. Sublinhado permanece como possibilidade futura, sem
compromisso de compatibilidade nesta etapa.

## Limite seguro da primeira versão

### Suportar

- uma seleção não vazia;
- contida em um único parágrafo, título, item de lista ou citação simples;
- proveniente do modo leitura da folha Markdown ativa;
- texto simples com ocorrência resolvida de forma inequívoca;
- marcação e remoção do formato externo selecionado.

### Recusar com orientação

- seleção atravessando blocos ou arquivos;
- transclusão ou embed na primeira versão;
- tabela, bloco de código, código inline, matemática ou HTML preexistente;
- seleção parcial dentro de link, destaque ou outra formatação;
- duas ou mais correspondências indistinguíveis;
- arquivo modificado entre a seleção e a ação.

Recusar é preferível a escrever no lugar errado. A mensagem deve explicar qual
limite foi encontrado, por exemplo: `Selecione texto simples dentro de um único
parágrafo`.

## Estratégia de localização

O principal risco é converter uma seleção do HTML renderizado em posições do
Markdown. A proposta usa camadas explícitas:

1. Registrar um `MarkdownPostProcessor`.
2. Durante a renderização, chamar
   `MarkdownPostProcessorContext.getSectionInfo(el)` e anexar ao elemento apenas
   âncoras DOM pertencentes ao plugin: caminho de origem, linha inicial e linha
   final.
3. No `selectionchange`, aceitar somente uma seleção contida na folha ativa e
   capturar texto, seção, contexto anterior/posterior e identidade do arquivo.
4. Converter as linhas da seção em offsets do arquivo.
5. Construir um mapa conservador entre texto visível e fonte, reconhecendo
   somente os formatos liberados para a versão.
6. Exigir uma correspondência única dentro da seção. Não usar busca aproximada.
7. Executar a alteração em `Vault.process()`, recalcular o intervalo dentro do
   conteúdo atual e confirmar que o texto esperado continua presente.

`getSectionInfo()` é público, mas pode retornar `null`. Nessa situação a ação
fica indisponível; um possível uso de `data-sourcepos` deve existir somente
atrás de uma camada de compatibilidade e depender de validação real antes de ser
autorizado.

## Componentes propostos

| Componente | Responsabilidade |
| --- | --- |
| `ReadingSectionRegistry` | registrar e remover as âncoras DOM de seção |
| `ReadingSelectionTracker` | manter a última seleção válida da folha ativa |
| `ReadingSelectionLocator` | converter a seleção em intervalo físico sem escrever |
| `ReadingAnnotationWriter` | aplicar/remover wrappers via `Vault.process()` |
| `AnnotationModeController` | estado somente de sessão, comandos, contexto e anúncios |
| `FontScaleControl` | apenas apresentar e alternar entre painel normal e paleta compacta |

Não renomear ou refatorar `FontScaleControl` junto com a funcionalidade. A
separação acima deve ser introduzida incrementalmente e continuar montando uma
única raiz na folha Markdown ativa.

## Estado e acessibilidade

- O modo não é persistido em `data.json`.
- O botão usa `aria-pressed=true` quando ativo.
- O rótulo muda entre `Ativar anotação rápida` e `Sair da anotação rápida`.
- As ações sem seleção válida ficam desabilitadas.
- O live region anuncia `Anotação rápida ativada`, `Trecho marcado`,
  `Formatação removida` ou a causa da recusa.
- O estado ativo não depende somente da amostra de cor.
- O painel mantém os alvos de toque da escala selecionada.
- `Escape`, mudança de contexto e descarregamento sempre oferecem saída.

## Plano inicial

### Etapa 1 — spike técnico isolado

- Provar em um vault de teste como `getSectionInfo()` se comporta em parágrafo,
  título, lista, citação e transclusão.
- Verificar se tocar no painel do plugin colapsa a seleção no iPad e confirmar
  que o snapshot anterior permanece válido.
- Renderizar e remover `==texto==` junto de links e formatação.
- Não integrar ainda a escrita ao controle publicado.

### Etapa 2 — núcleo puro e testes

- Implementar localizador estrito com casos positivos e recusas.
- Implementar escritor atômico para aplicar e remover o wrapper.
- Cobrir repetição de palavras, Unicode, aspas tipográficas, espaços,
  quebras de linha, concorrência e wrappers existentes.
- Inspecionar o bundle móvel para ausência de Node/Electron.

### Etapa 3 — estado e interface

- Integrar o botão ao painel normal.
- Trocar para a paleta compacta sem criar uma segunda raiz.
- Preservar escala, posição, área segura, foco e posição de leitura.
- Adicionar comandos para ativar/sair, marcar e apagar.

### Etapa 4 — validação

- Executar `npm ci`, `npm run check` e `git diff --check`.
- Renderizar painel normal e anotação ativa nas três escalas, temas claro e
  escuro e alturas compactas.
- Validar fisicamente no iPad: seleção por alças, toque nas ações, VoiceOver,
  teclado, retrato, paisagem, Split View, links próximos e mudança de nota.

### Etapa 5 — distribuição

- Depois da aprovação humana, registrar a conclusão no roteiro.
- Fazer o incremento `MINOR` em commit separado.
- Publicar apenas após o ensaio físico obrigatório.

## Resultado da implementação

- `ReadingSectionRegistry` consulta `getSectionInfo()` no momento da seleção e
  mantém as âncoras somente em memória.
- `ReadingAnnotationController` preserva a última seleção válida quando tocar
  no painel recolhe as alças, inclusive para eventos com `pointerType: pen`.
- `applyReadingAnnotation()` exige uma ocorrência única na seção atual e recusa
  conteúdo alterado, quebra de bloco e formatação aninhada.
- A única escrita autorizada usa `Vault.process()` e aplica ou remove apenas
  `==texto==`.
- O painel existente alterna entre o slider e a paleta compacta sem criar outra
  raiz nem persistir estado de sessão.
- Sublinhado, cores adicionais, histórico próprio e gestos nativos do corpo do
  Apple Pencil permanecem fora do MVP.

## Decisões e gate restante

1. A transformação visual foi aprovada sem ajustes.
2. A recusa conservadora de seleção com formatação ou mais de um bloco foi
   adotada.
3. A liberação continua condicionada ao ensaio físico em Obsidian no iPad, com
   dedo e Apple Pencil, para confirmar seleção, alças, botões e âncoras públicas
   de seção.

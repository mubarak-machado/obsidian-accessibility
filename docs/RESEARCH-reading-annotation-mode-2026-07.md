# Pesquisa e proposta inicial — anotação rápida no modo leitura

Data: 2026-07-23

Status: proposta aprovada e MVP implementado em 2026-07-23. O primeiro ensaio
físico da candidata `1.0.0` revelou um falso conflito de conteúdo e uma
interação inadequada em duas etapas. A correção foi implementada para uma nova
candidata, ainda dependente de revalidação física no iPad.

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

O acionador universal de acessibilidade conserva forma, posição e função. O
painel normal ganha um botão `Ativar anotação rápida`, logo abaixo do Modo Zen.

```text
Painel normal  ── transforma ──▶  Anotação rápida ativa
┌─────────┐                    ┌─────────┐
│  55 px  │                    │ Marcar  │
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
2. o marcador é a ferramenta inicial;
3. ao terminar uma seleção por arrasto, o trecho é marcado automaticamente;
4. os botões de marcador e borracha alternam a ferramenta persistente;
5. uma seleção feita antes de abrir o controle também é aplicada ao ativar o
   lápis;
6. depois da ação, a seleção é descartada e a paleta aguarda o próximo trecho;
7. tocar novamente no botão de anotação retorna ao painel normal;
8. `Escape` sai do modo e devolve o foco ao acionador;
9. mudança de folha, arquivo ou modo invalida a seleção e encerra a sessão.

Tocar fora não fecha a paleta enquanto a anotação estiver ativa. Essa exceção
ao comportamento atual é necessária porque a seleção acontece fora do painel.

## Direção visual

O controle continua herdando o tema do Obsidian e a escala configurada. A
proposta não introduz uma nova paleta, mas deixa de confiar no acento do tema
para contraste essencial.

| Papel | Token do produto | Valor usado somente no protótipo escuro |
| --- | --- | --- |
| superfície | `--background-primary` | `#201e27` |
| superfície elevada | `--background-primary-alt` | `#292633` |
| estado ativo e hover | `--background-modifier-hover` | `#35313f` |
| texto, ícones, bordas e foco | `--text-normal` | `#f5f2fa` |
| marcação persistente | `--text-highlight-bg` | `rgb(255 208 0 / 45%)` |
| seleção em andamento | cores de sistema `Highlight` e `HighlightText` | resolvidas pelo navegador |

A tipografia continua sendo `--font-interface`; o rótulo curto `Marcar` ou
`Apagar` ocupa o mesmo papel hoje usado por `55 px`. A assinatura visual é uma
amostra fina da cor real de marcação. O estado ativo combina fundo, anel interno
e um ponto sólido no canto; o foco usa outro anel. Portanto, ativo, inativo e
foco continuam distinguíveis sem depender somente da cor.

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
| [Obsidian Web Clipper](https://github.com/obsidianmd/obsidian-clipper/tree/c2fbae9645332ecf8d05dcf281483693b5054213) | `1.7.1`, commit `c2fbae9645332ecf8d05dcf281483693b5054213`, 2026-07-22 | MIT | o marcador oficial converte seleção já existente ao ser ativado e usa `mouseup`/`touchend`; no mobile observa também `selectionchange` | **adaptar** ativação sobre seleção existente, finalização automática e seleção nativa; **rejeitar** o modelo de armazenamento lateral do Clipper, pois aqui o destino é Markdown |
| [Obsidian 1.13.3 Mobile](https://obsidian.md/changelog/2026-07-21-mobile-v1.13.3/) | candidata móvel de 2026-07-21 | licença do Obsidian | versão móvel mais recente examinada; inclui correções recentes de rolagem no modo leitura do iOS | **adotar como alvo de ensaio**, preservando compatibilidade declarada com Obsidian 1.12.0 |
| [API do Obsidian no npm](https://www.npmjs.com/package/obsidian) | `1.13.1`, publicada em 2026-06 | MIT | tipos públicos mais recentes disponíveis no npm durante a correção | **adotar sem atualizar dependências nesta correção**; a atualização deve permanecer separada |
| [Safari 26.5](https://developer.apple.com/documentation/safari-release-notes/safari-26_5-release-notes) | versão estável atual para iPadOS 26.5; avaliada em 2026-07-23 | termos da Apple | corrige interação entre `pointerdown` e rolagem; o WebView do Obsidian usa o WebKit do sistema | **adotar como alvo atual de teste**, sem depender exclusivamente dessa correção |
| [WebKit para Safari 26.2](https://webkit.org/blog/17640/webkit-features-for-safari-26-2/) | Safari/iPadOS 26.2 | licença WebKit | introduziu `document.caretPositionFromPoint()` para editores e ferramentas de anotação | **rejeitar nesta correção**; uma seleção por coordenadas bloquearia ou redefiniria a rolagem e é desnecessária enquanto a seleção nativa atende ao gesto |
| [Selection API](https://www.w3.org/TR/selection-api/) | Working Draft de 2026-06-05 | W3C Document License | `selectionchange` é agendado sempre que limites da seleção mudam | **adotar** captura imediata e espera curta de estabilização; não escrever em cada evento intermediário |
| [Pointer Events Level 3](https://www.w3.org/TR/pointerevents3/) | Candidate Recommendation Draft de 2026 | W3C Document License | unifica `pen` e `touch`; `pointerup`/`pointercancel` delimitam o gesto e `touch-action` controla rolagem | **adotar** o fim do ponteiro como sinal preferencial; **rejeitar** `touch-action: none`, pois a correção não precisa sequestrar a rolagem |
| [WCAG 2.2 — contraste mínimo](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html) e [contraste não textual](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html) | recomendação e material explicativo vigentes, avaliados em 2026-07-23 | W3C Document License | exige `4,5:1` para texto normal e `3:1` para componentes, ícones e indicadores de estado | **adotar como gate mensurável** para rótulos, ícones, bordas, foco, seleção e estados |
| [Apple HIG — Accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility) | orientação vigente, avaliada em 2026-07-23 | termos da Apple | recomenda alvo de `44 × 44 pt` no iOS/iPadOS | **adotar para Grande e Média**; registrar a escala Mínima preexistente como exceção opcional não recomendada para toque |

Nenhum código externo foi copiado nesta etapa.

## Investigação após o teste físico da candidata 1.0.0

### Sintomas confirmados

1. depois de selecionar texto, a ação exibia
   `A nota mudou depois da seleção; selecione o trecho novamente`;
2. nenhum Markdown era alterado;
3. a interação exigia selecionar e depois tocar em outro botão, enquanto o
   comportamento esperado era manter uma ferramenta ativa e aplicar ao fim do
   arrasto.

### Causa do falso conflito

O snapshot guardava simultaneamente:

- `lineStart` e `lineEnd`, retornados por `getSectionInfo()`;
- `text`, retornado pelo mesmo método;
- um segundo texto reconstruído dessas linhas a partir do arquivo.

A implementação exigia igualdade byte a byte entre os dois textos. Essa
suposição não faz parte do contrato da API e é falsa em estruturas reais. Há
relatos reproduzíveis no fórum de desenvolvedores do Obsidian em que
[`getSectionInfo()` retorna limites de um bloco e `text` de um escopo maior](https://forum.obsidian.md/t/using-getsectioninfo-looking-for-the-line-number-of-a-list-item/79299),
além de limites externos em
[callouts aninhados](https://forum.obsidian.md/t/bug-getsectioninfo-is-inaccurate-inside-callouts/104289).

Os testes anteriores mascaravam o defeito porque o mock fornecia
deliberadamente o mesmo texto nos dois lados. A notificação descrevia uma
alteração concorrente que nunca havia sido comprovada.

### Correção do localizador

- `getSectionInfo()` continua fornecendo somente caminho e intervalo de linhas;
- o campo `text` do renderizador deixa de participar da transação;
- o trecho precisa continuar único dentro do intervalo atual;
- pré-validação e transação repetem a localização sobre o conteúdo real;
- caminho ativo e geração da sessão são conferidos antes e dentro de
  `Vault.process()`, impedindo que uma operação antiga alcance outra nota ou
  uma sessão reaberta;
- uma âncora de linhas inválida produz uma mensagem sobre a impossibilidade de
  relacionar o trecho ao Markdown, sem acusar alteração da nota.

Essa mudança conserva a recusa ambígua e `Vault.process()`, mas elimina a
comparação entre representações que não possuem equivalência garantida.

### Correção da interação

O padrão foi adaptado do Web Clipper oficial:

1. ativar a anotação escolhe o marcador;
2. uma seleção já existente é preservada ao abrir o controle e convertida ao
   ativar o lápis;
3. durante uma nova seleção, `selectionchange` atualiza o snapshot sem escrever;
4. `pointerup` é o gatilho preferencial para dedo e Apple Pencil;
5. `pointercancel`, comum quando o iPadOS assume um gesto nativo, nunca dispara
   a escrita rápida de `pointerup`;
6. quando a seleção nativa não expõe o ciclo completo do ponteiro, um atraso
   curto após o último `selectionchange` funciona como fallback;
7. marcador e borracha permanecem ativos entre seleções;
8. a seleção em andamento usa `Highlight` e `HighlightText` do sistema, enquanto
   a marcação persistente continua usando a cor nativa do tema.

Não foi adotado um arrasto próprio por coordenadas. Embora Safari 26.2 tenha
adicionado `caretPositionFromPoint()` exatamente para interfaces de anotação,
essa alternativa exigiria controlar `touch-action`, competir com a rolagem e
reimplementar seleção bidirecional, acessibilidade e autoscroll. Ela permanece
como alternativa somente se o novo ensaio físico demonstrar que a seleção
nativa do Obsidian não entrega eventos suficientes.

## Auditoria de contraste e estados

A auditoria renderizou o próprio `styles.css` em viewport de iPad
(`1024 × 1366`) no protótipo claro e escuro, nas escalas Grande, Média e Mínima.
Os testes automatizados reproduzem a fórmula de luminância relativa da WCAG.

O primeiro passe encontrou três regressões possíveis:

- o rótulo com `--text-muted` ficava em `3,67:1` no protótipo claro, abaixo de
  `4,5:1`;
- a borda baseada no token discreto do tema ficava entre `1,32:1` e `1,81:1`,
  abaixo de `3:1`;
- aplicar `opacity: 0.5` ao acionador interativo em repouso podia reduzi-lo a
  `2,76:1` no tema claro.

A correção usa `--text-normal` como referência também para ícones, bordas,
trilho, foco e indicadores; mantém o acionador com opacidade integral e reduz
somente a sombra; e usa cores de seleção do sistema. O estado ativo ganhou anel
interno e ponto sólido, enquanto `aria-pressed` e o nome dinâmico preservam a
equivalência não visual.

| Elemento medido | Tema claro | Tema escuro | Limite | Resultado |
| --- | ---: | ---: | ---: | --- |
| rótulo e texto do painel | `12,75:1` | `14,86:1` | `4,5:1` | passa |
| ícone inativo | `12,75:1` | `14,86:1` | `3:1` | passa |
| ícone e anel ativos | `10,34:1` | `11,41:1` | `3:1` | passa |
| anel de foco | `10,34:1` | `11,41:1` | `3:1` | passa |
| acionador em repouso | `11,51:1` | `13,36:1` | `3:1` | passa |
| borda do painel | `11,93:1` | `14,70:1` | `3:1` | passa |
| seleção em andamento | `13,62:1` | `9,63:1` | `4,5:1` | passa |
| trilho do slider | `12,75:1` | `14,86:1` | `3:1` | passa |

Os contrastes são idênticos nas três escalas. A inspeção visual confirmou
ícones sem corte, anéis distintos e foco com espessura de `4 px`, `3 px` e
`2 px`, respectivamente.

Há uma ressalva fora do contraste: Grande mede `66 px` por botão e Média mede
`44 px`, mas Mínima mede `22 px` por botão e `24 px` no acionador. A escala
Mínima preexistente não atende a recomendação Apple de `44 × 44 pt`. Seus
botões ficam abaixo do tamanho direto de `24 × 24 px` da WCAG 2.2, embora o
espaçamento de `2 px` possa enquadrá-los na exceção de espaçamento. Grande
continua sendo o padrão; Média também atende ao alvo Apple. Contraste não
compensa o texto e os alvos muito pequenos. Corrigir Mínima exigiria redesenhar
sua geometria e fica registrado fora desta correção de marcação.

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
   capturar texto, seção, identidade do arquivo e geração da sessão.
4. Converter as linhas da seção em offsets do arquivo.
5. Reconhecer somente texto simples e proteger intervalos de Markdown aninhado.
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
- Marcador e borracha ficam disponíveis como ferramentas persistentes; uma
  seleção válida dispara a ferramenta ativa.
- O live region anuncia `Marcador ativo`, `Borracha ativa`, `Trecho marcado`,
  `Marcação removida` ou a causa da recusa.
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

- Publicar a correção como nova candidata `PATCH`, sem alterar a tag reprovada.
- Depois da aprovação humana no iPad, registrar a conclusão no roteiro.
- Promover somente a candidata efetivamente ensaiada.

## Resultado da implementação

- `ReadingSectionRegistry` consulta `getSectionInfo()` no momento da seleção e
  mantém as âncoras somente em memória.
- `ReadingAnnotationController` preserva a última seleção válida quando tocar
  no painel recolhe as alças, inclusive para eventos com `pointerType: pen`.
- Cada sessão invalida timers e escritas assíncronas da sessão anterior; mudança
  de nota, modo ou folha cancela a transação antes de escrever.
- `applyReadingAnnotation()` exige uma ocorrência única na seção atual, tolera
  mudanças alheias que não tornem o trecho ambíguo e recusa quebra de bloco e
  formatação aninhada.
- A única escrita autorizada usa `Vault.process()` e aplica ou remove apenas
  `==texto==`.
- O painel existente alterna entre o slider e a paleta compacta sem criar outra
  raiz nem persistir estado de sessão.
- Sublinhado, cores adicionais, histórico próprio e gestos nativos do corpo do
  Apple Pencil permanecem fora do MVP.

## Decisões e gate restante

1. A direção visual foi aprovada; a auditoria posterior reforçou contraste,
   foco e diferenciação de estado sem mudar a geometria.
2. A recusa conservadora de seleção com formatação ou mais de um bloco foi
   adotada.
3. A liberação continua condicionada ao ensaio físico em Obsidian no iPad, com
   dedo e Apple Pencil, para confirmar seleção, alças, botões e âncoras públicas
   de seção.

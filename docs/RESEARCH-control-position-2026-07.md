# Pesquisa — posicionamento do acionador em dois eixos

Data: 2026-07-22

## Requisito

Permitir que o botão flutuante combine dois grupos independentes: horizontal
com Direita ou Esquerda, nunca no centro; vertical com Inferior, Meio ou
Superior. As seis combinações preservam Direita/Meio como padrão e como posição
dos dados existentes, mantêm áreas seguras e garantem que o painel temporário
continue visível dentro da nota ativa.

## Referências avaliadas

| Candidato | Versão avaliada | Licença | Relevância móvel | Classificação e conclusão |
| --- | --- | --- | --- | --- |
| [AssistiveTouch no iPad](https://support.apple.com/pt-br/guide/ipad/ipad9a2466d3/ipados) | guia do iPadOS vigente, avaliado em 2026-07-22 | termos da documentação da Apple | oferece um acionador persistente que pode ser movido para outra região da tela | **adaptar** a liberdade de posicionamento; **rejeitar** arraste livre nesta etapa, porque posições persistentes são mais previsíveis para toque e VoiceOver |
| [AssistiveTouch no iPhone e iPad](https://support.apple.com/pt-br/111794) | artigo vigente, avaliado em 2026-07-22 | termos da documentação da Apple | documenta permanência do acionador em uma borda e fechamento por toque externo | **adaptar** a âncora estável em uma lateral, combinada com três alturas explícitas |
| [Apple HIG — Layout](https://developer.apple.com/design/human-interface-guidelines/layout) | orientação vigente, avaliada em 2026-07-22 | termos da documentação da Apple | exige adaptação a orientação, janelas redimensionáveis e áreas seguras do iPad | **adotar** `safe-area-inset-*`, contenção no retângulo da nota e recálculo após redimensionamento |
| [CSS Positioned Layout Module Level 3](https://www.w3.org/TR/css-position-3/) | Working Draft de 11 de março de 2025 | Licença de Documentos do W3C | posicionamento absoluto e offsets funcionam na WebView móvel sem Node.js | **adotar** offsets CSS para o botão; manter o cálculo do painel em TypeScript porque ele depende dos retângulos renderizados e do viewport |

Nenhum código-fonte externo é copiado.

## Direção visual

Preservar integralmente o acionador circular, cores e tipografia do tema. A
âncora resulta da combinação das duas escolhas:

| Eixo | Opções | Efeito |
| --- | --- | --- |
| Horizontal | Direita ou Esquerda | ancora sempre em uma lateral; centro horizontal não existe |
| Vertical | Inferior, Meio ou Superior | ancora na base, centraliza verticalmente ou ancora no topo |

O painel vertical sobrepõe o botão e cresce para dentro da área disponível. A
escolha horizontal alinha sua borda ao botão. Na posição Superior, começa no
topo do botão; no Meio, centraliza-se verticalmente; na Inferior, termina na
base. Todas as combinações passam pela mesma contenção de 12 px.

## Dados e compatibilidade

O esquema persistido passa da versão 2 para a versão 3, preserva `side` e
acrescenta `verticalPosition`. Dados antigos `side: right` e `side: left`
continuam válidos; a altura ausente normaliza para Meio. Valores inválidos
normalizam para Direita/Meio. Nenhuma preferência é escrita na nota.

## Risco e validação

Os principais riscos são o botão invadir uma área segura, o painel sair do
viewport e a animação alterar a âncora visual. Cobrir as seis combinações na
normalização, no CSS e no cálculo geométrico; testar a migração do esquema 2;
renderizar todas as combinações em navegador; executar `npm ci`, `npm run check`
e `git diff --check`.

O ensaio físico no iPad continua obrigatório antes do lançamento para retrato,
paisagem, Split View, teclado, toque, foco e VoiceOver.

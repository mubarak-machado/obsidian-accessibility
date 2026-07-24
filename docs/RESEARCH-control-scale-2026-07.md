# Pesquisa — escalas do controle e repouso do acionador

Data: 2026-07-21; atualizada em 2026-07-23

Nota de 2026-07-23: a redução do acionador inteiro para 50% de opacidade foi
substituída após auditoria WCAG. No protótipo claro, o contraste podia cair a
`2,76:1`. O estado de repouso agora conserva opacidade integral e reduz somente
a sombra. A forma, as dimensões e o atraso de dois segundos permanecem iguais.

## Requisito

Tratar a aparência atual como Grande (150%) e oferecer também Média (100%) e
Mínima (50%). A escala abrange o acionador fechado, painel, rótulos, ícones,
botões, controle vertical, trilho, polegar, separadores, espaçamentos, bordas,
anéis de foco, afastamento da borda e sombras. O requisito original reduzia o
acionador fechado a 50% de opacidade depois de dois segundos; a auditoria
posterior substituiu esse efeito por sombra reduzida para preservar contraste
integral.

## Referências avaliadas

| Candidato | Versão avaliada | Licença | Relevância móvel | Classificação e conclusão |
| --- | --- | --- | --- | --- |
| [Módulo CSS Transforms Nível 1](https://www.w3.org/TR/css-transforms-1/) | Recomendação W3C de 14 de fevereiro de 2019 | Licença de Documentos do W3C | o comportamento normativo do CSS se aplica à WebView do iPad | **rejeitar** `transform: scale(1.5)` porque transformações mudam os retângulos do cliente, mas não o fluxo do layout, dificultando o contrato existente de ajuste à tela e transbordamento |
| [Orientação da WCAG 2.2 sobre tamanho do alvo](https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced) | Recomendação WCAG 2.2 com errata de 12 de dezembro de 2024 | Licença de Documentos do W3C | trata explicitamente de alvos de toque e destreza limitada | **adotar** o princípio de tamanho do alvo; ampliar controles de 44 para 66 px os mantém confortavelmente acima do alvo aprimorado de 44 × 44 px |
| [WCAG 2.2 — tamanho mínimo do alvo](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html) | Critério 2.5.8 vigente, avaliado em 2026-07-22 | Licença de Documentos do W3C | estabelece 24 × 24 CSS px ou separação equivalente para alvos menores | **adaptar** a escala mínima: acionador de 24 px, separação de 2 px entre botões visuais de 22 px e captura invisível do polegar com pelo menos 24 px de diâmetro |
| [Apple HIG — Buttons](https://developer.apple.com/design/human-interface-guidelines/buttons) | orientação vigente, avaliada em 2026-07-22 | termos da documentação da Apple | recomenda região de toque de ao menos 44 × 44 pt | **adotar** Grande como padrão e Média como opção ainda confortável; **aceitar com risco documentado** a Mínima solicitada, que exige validação física e pode não ser adequada a pessoas com baixa precisão motora |
| [Media Queries Level 5](https://www.w3.org/TR/mediaqueries-5/) | Working Draft vigente, avaliado em 2026-07-22 | Licença de Documentos do W3C | define preferências de redução de movimento e transparência | **adotar** transição somente sem preferência por redução de movimento e remover sombras translúcidas quando o sistema pedir redução de transparência |
| [Plugin de exemplo do Obsidian](https://github.com/obsidianmd/obsidian-sample-plugin) | versão `1.0.0` | 0BSD | o manifesto oficial declara `isDesktopOnly: false` | **rejeitar** como fonte de implementação porque não oferece padrão uniforme para ampliar controles; manter a estrutura móvel segura existente |

Nenhum código-fonte é copiado dessas referências.

## Decisão

Usar três conjuntos de dimensões explícitas de layout, não `transform`, `zoom`
nem novo mecanismo de execução. Assim, layout intrínseco,
`getBoundingClientRect()`, posicionamento do painel, áreas de toque, contornos
de foco e transbordamento concordam sobre o mesmo tamanho. O esquema persistido
usa `large`, `medium` e `small`, normalizando dados ausentes ou inválidos para
`large`.

O mapeamento é mecânico e usa a dimensão Média como base de 100%:

| Componente | Mínima 50% | Média 100% | Grande 150% |
| --- | ---: | ---: | ---: |
| Acionador | 24 px | 48 px | 72 px |
| Largura do painel | 25 px | 50 px | 75 px |
| Botões e eixo transversal | 22 px | 44 px | 66 px |
| Comprimento padrão do controle | 74–85 px | 148–170 px | 222–255 px |
| Comprimento compacto | 60 px | 120 px | 180 px |
| Ícone interno | 11 px | 22 px | 33 px |
| Texto de incremento | 15 px | 30 px | 45 px |
| Texto auxiliar | 5,5 px | 11 px | 16,5 px |
| Distância da área segura | 6 px | 12 px | 18 px |

Espaçamentos, raios, bordas, anéis de foco, sombras e afastamentos das áreas
seguras seguem os mesmos fatores. Percentuais e variáveis de cor permanecem
inalterados. O polegar mínimo continua com 11 px visuais, mas aceita o início do
arrasto em um círculo invisível de 24 px.

O repouso é estado apenas de interface, não uma preferência persistida. Um
temporizador descartável começa quando o controle está fechado; após 2.000 ms,
reduz somente a sombra do acionador, mantendo ícone, borda e superfície com
opacidade integral. Toque, foco, passagem do ponteiro ou abertura removem o
estado imediatamente. Fechamento por toque externo, Escape, ativação repetida
ou Modo Zen reinicia a contagem. Desmontagem e desativação cancelam o
temporizador.

## Risco e validação

O painel Grande pode precisar de rolagem em Split View estreito ou quando o
teclado virtual reduz a área visível. Preservar `max-height`, `overflow-y: auto`
e uma consulta de mídia para baixa altura nas três escalas. A escala Mínima é
deliberadamente mais difícil de tocar que os 44 pt recomendados pela Apple e
deve ser tratada como opção de alta densidade, não como padrão acessível.

As verificações automatizadas conferem dimensões, normalização, captura mínima,
temporizador e limpeza. A inspeção renderizada deve cobrir as três escalas e o
acionador ativo/em repouso. Um iPad físico continua obrigatório antes do
lançamento estável para validar orientação, Split View, teclado virtual, toque,
VoiceOver, áreas seguras e alcance de todos os controles.

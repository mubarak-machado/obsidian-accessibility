# Pesquisa — controle ampliado para 150%

Data: 2026-07-21

## Requisito

Ampliar o controle flutuante completo para 150% do tamanho original aprovado:
acionador fechado, painel, rótulos, ícone, botões, controle vertical, trilho,
polegar, separadores, espaçamento, bordas, anel de foco, afastamento da borda e
sombras. Preservar comportamento, ordem, posicionamento, áreas seguras e
isolamento da nota.

## Referências avaliadas

| Candidato | Versão avaliada | Licença | Relevância móvel | Classificação e conclusão |
| --- | --- | --- | --- | --- |
| [Módulo CSS Transforms Nível 1](https://www.w3.org/TR/css-transforms-1/) | Recomendação W3C de 14 de fevereiro de 2019 | Licença de Documentos do W3C | o comportamento normativo do CSS se aplica à WebView do iPad | **rejeitar** `transform: scale(1.5)` porque transformações mudam os retângulos do cliente, mas não o fluxo do layout, dificultando o contrato existente de ajuste à tela e transbordamento |
| [Orientação da WCAG 2.2 sobre tamanho do alvo](https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced) | Recomendação WCAG 2.2 com errata de 12 de dezembro de 2024 | Licença de Documentos do W3C | trata explicitamente de alvos de toque e destreza limitada | **adotar** o princípio de tamanho do alvo; ampliar controles de 44 para 66 px os mantém confortavelmente acima do alvo aprimorado de 44 × 44 px |
| [Plugin de exemplo do Obsidian](https://github.com/obsidianmd/obsidian-sample-plugin) | versão `1.0.0` | 0BSD | o manifesto oficial declara `isDesktopOnly: false` | **rejeitar** como fonte de implementação porque não oferece padrão uniforme para ampliar controles; manter a estrutura móvel segura existente |

Nenhum código-fonte é copiado dessas referências.

## Decisão

Usar dimensões explícitas de layout, não `transform`, `zoom` nem novo mecanismo
de execução. Assim, layout intrínseco, `getBoundingClientRect()`, posicionamento
do painel, áreas de toque, contornos de foco e transbordamento concordam sobre o
mesmo tamanho.

O mapeamento de 150% é mecânico:

| Componente | Original | Novo |
| --- | ---: | ---: |
| Acionador | 48 px | 72 px |
| Largura do painel | 50 px | 75 px |
| Botões e eixo transversal do controle | 44 px | 66 px |
| Comprimento padrão do controle | 148–170 px | 222–255 px |
| Comprimento compacto do controle | 120 px | 180 px |
| Ícone | 22 px | 33 px |
| Texto de incremento | 30 px | 45 px |
| Texto auxiliar | 11 px | 16,5 px |
| Distância da borda da tela | 8 px | 12 px |

Espaçamentos, raios, bordas, anéis de foco, sombras e afastamentos das áreas
seguras também são multiplicados por 1,5. Percentuais, variáveis relativas de
cor e animação de pressionamento permanecem inalterados porque já se ajustam
proporcionalmente.

## Risco e validação

O painel mais alto pode precisar de rolagem em um Split View estreito ou quando
o teclado virtual reduz a área visível. Preservar `max-height`,
`overflow-y: auto` e uma consulta de mídia para baixa altura, cujo controle
também tenha 150% do tamanho original. As verificações automatizadas conferem
as dimensões mecânicas, mas um iPad físico continua obrigatório antes do
lançamento estável para validar orientação vertical e horizontal, Split View,
teclado virtual, toque, ordem de foco do VoiceOver, áreas seguras e alcance de
todos os controles.

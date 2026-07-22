# Pesquisa — mínimo unificado de 32 px

Data: 2026-07-22

## Requisito

Permitir que os perfis Apresentação, Preparação e Pesquisa cheguem a 32 px tanto
no modo de Leitura quanto na edição em Live Preview. Preservar os máximos de
75 px e 60 px, os valores padrão atuais, o isolamento à nota Markdown ativa e a
proibição de escrever preferências no conteúdo da nota.

## Referências avaliadas

| Candidato | Versão avaliada | Licença | Relevância móvel | Classificação e conclusão |
| --- | --- | --- | --- | --- |
| [WCAG 2.2 — 1.4.4 Resize Text](https://www.w3.org/TR/WCAG22/#resize-text) | Recomendação W3C de 5 de outubro de 2023, com errata de 12 de dezembro de 2024 | Licença de Documentos do W3C | aplica-se ao conteúdo renderizado na WebView do iPad | **adaptar** o princípio de permitir redimensionamento sem perda de conteúdo; a WCAG não exige mínimos diferentes para Leitura e edição |
| [Técnica G179 da WCAG](https://www.w3.org/WAI/WCAG22/Techniques/general/G179.html) | revisão de 15 de julho de 2025 | Licença de Documentos do W3C | descreve reflow e disponibilidade do conteúdo ao redimensionar texto | **adotar** a verificação de que 32 px não introduz recorte nem transbordamento horizontal; não copiar implementação |
| [Obsidian API](https://github.com/obsidianmd/obsidian-api) | pacote `obsidian` 1.13.1 usado pelo projeto | MIT | a API de configurações é compartilhada pelas versões desktop e móvel; o manifesto continua com `isDesktopOnly: false` | **adotar** o slider nativo de `Setting` já existente, alimentado pelos limites centralizados; nenhuma API nova é necessária |
| [Obsidian sample plugin](https://github.com/obsidianmd/obsidian-sample-plugin) | commit `23c165f`, revisado em 2026-07-22 | 0BSD | modelo oficial móvel seguro, sem dependência de Node.js no runtime | **rejeitar** como fonte de mecanismo novo porque o exemplo não define faixas tipográficas; manter a arquitetura local já testada |

Nenhum código-fonte externo é copiado.

## Decisão

Alterar somente o limite inferior de edição de 40 px para 32 px. O limite de
Leitura já é 32 px. Manter limites por modo para preservar os máximos próprios:

| Modo | Mínimo | Máximo |
| --- | ---: | ---: |
| Leitura | 32 px | 75 px |
| Edição | 32 px | 60 px |

O mesmo modelo abastece normalização, controle flutuante e sliders da tela de
configurações. Por isso, uma única correção no limite centralizado converge as
três superfícies sem duplicar regras.

Não incrementar o esquema persistido: valores anteriores continuam válidos e
o novo intervalo apenas passa a aceitar valores menores. Os valores padrão
continuam 65/50 px em Apresentação e 55/50 px nos demais perfis.

## Risco e validação

O risco principal é uma superfície continuar presa ao antigo mínimo de 40 px.
Cobrir normalização dos três perfis, clamp por modo e atributos `min`/`max` do
controle. Renderizar Leitura e edição em 32 px no navegador e verificar estado
do slider, alinhamento e ausência de transbordamento. Executar `npm ci`,
`npm run check` e `git diff --check`.

Como a faixa muda em interface móvel, o ensaio físico no iPad continua sendo o
portão final antes de considerar a alteração validada para toque e VoiceOver.

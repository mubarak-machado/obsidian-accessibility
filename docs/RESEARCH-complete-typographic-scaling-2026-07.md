# Pesquisa — escala tipográfica completa

Data: 2026-07-24

Status: abordagem aprovada pela evidência técnica e implementada como correção
isolada, sem incremento de versão.

## Problema reproduzido

O plugin aplicava `font-size` diretamente em `.markdown-preview-view` e
`.markdown-source-view .cm-content`. Isso ampliava texto que herdava a
propriedade, mas não alterava `--font-text-size`, o token tipográfico central do
Obsidian.

Na instalação local do Obsidian `1.12.7`, os seguintes elementos usam tokens
que partem de `--font-text-size`:

| Conteúdo | Token ou relação observada |
| --- | --- |
| texto em Leitura e Edição | `--font-text-size` |
| títulos H1–H6 | `--h1-size` a `--h6-size`, em `em` |
| título interno | `--inline-title-size: var(--h1-size)` |
| células e cabeçalho de tabela | `--table-text-size: var(--font-text-size)` |
| código | `--code-size: var(--font-smaller)` |
| notas de rodapé | `--footnote-size: var(--font-smaller)` |
| tags | `--tag-size: var(--font-smaller)` |
| propriedades | tamanhos relativos e altura derivada de `--font-text-size` |
| callouts, listas e citações | herança do conteúdo da nota |

O corpo ampliado podia, portanto, coexistir com uma tabela ainda presa ao
valor global do tema. Temas que expressam algum título em `rem` ou `px` também
não recebem uma nova base apenas pela herança de `font-size`.

## Decisão

Aplicar `--font-text-size` separadamente na raiz de cada modo da nota ativa:

- `.markdown-preview-view` recebe o tamanho de Leitura;
- `.markdown-source-view` recebe o tamanho de Edição;
- `--table-text-size`, `--table-header-size` e `--metadata-input-height`, que o
  CSS do aplicativo resolve contra a base
  global antes de herdar, são reancorados à base local;
- uma `.markdown-preview-view` incorporada na Visualização ao vivo recebe a
  base de Edição, não a base de Leitura;
- o texto-base continua declarando `font-size: var(--font-text-size)` como
  fallback explícito;
- a interface flutuante permanece fora dessas raízes e não é ampliada.

Essa solução permite que os tokens semânticos documentados pelo Obsidian
continuem definindo as proporções do tema. O plugin fornece a base; não substitui
H1–H6, tabelas, código e demais elementos por uma lista própria de seletores e
valores.

O primeiro passe do harness tornou a diferença mensurável: com Leitura em
`55 px`, o parágrafo e o H1 calculavam `55 px` e `89 px`, mas uma célula de
tabela continuava em `16 px`. Depois da reancoragem, a célula passa a `55 px`
e o cabeçalho acompanha o mesmo token.

## Referências avaliadas

| Referência | Revisão | Licença | Compatibilidade móvel | Classificação |
| --- | --- | --- | --- | --- |
| [Obsidian Developer Docs — tipografia](https://github.com/obsidianmd/obsidian-developer-docs/blob/2d0e942f03b23ed94ebda3c610ed074662ed63db/en/Reference/CSS%20variables/Foundations/Typography.md), [títulos](https://github.com/obsidianmd/obsidian-developer-docs/blob/2d0e942f03b23ed94ebda3c610ed074662ed63db/en/Reference/CSS%20variables/Editor/Headings.md), [tabelas](https://github.com/obsidianmd/obsidian-developer-docs/blob/2d0e942f03b23ed94ebda3c610ed074662ed63db/en/Reference/CSS%20variables/Editor/Table.md), [código](https://github.com/obsidianmd/obsidian-developer-docs/blob/2d0e942f03b23ed94ebda3c610ed074662ed63db/en/Reference/CSS%20variables/Editor/Code.md), [notas de rodapé](https://github.com/obsidianmd/obsidian-developer-docs/blob/2d0e942f03b23ed94ebda3c610ed074662ed63db/en/Reference/CSS%20variables/Editor/Footnote.md), [propriedades](https://github.com/obsidianmd/obsidian-developer-docs/blob/2d0e942f03b23ed94ebda3c610ed074662ed63db/en/Reference/CSS%20variables/Editor/Properties.md) e [tags](https://github.com/obsidianmd/obsidian-developer-docs/blob/2d0e942f03b23ed94ebda3c610ed074662ed63db/en/Reference/CSS%20variables/Editor/Tag.md) | commit `2d0e942f03b23ed94ebda3c610ed074662ed63db`, consultado em 2026-07-24 | documentação oficial sob os termos do Obsidian; nenhum código copiado | os tokens pertencem ao editor compartilhado; não exigem Node ou Electron | **adotar** `--font-text-size` e os tokens semânticos como contrato de integração |
| Obsidian instalado | `1.12.7`; `obsidian-1.12.7.asar` com SHA-256 `2b2483b2e1246772e0d25367ec055cbc5047ea2f0091b667c35656678f86d712` | licença proprietária do Obsidian; inspecionado somente para interoperabilidade | é a mesma família de CSS usada pelo aplicativo móvel; o plugin continua com `isDesktopOnly: false` | **adotar** como reprodução local; comparar os valores observados com a documentação pública |
| [CSS Values and Units Level 4](https://www.w3.org/TR/css-values-4/#font-relative-lengths) e [CSS Fonts Level 4](https://www.w3.org/TR/css-fonts-4/#font-size-prop) | versões vigentes consultadas em 2026-07-24 | W3C Document License | unidades relativas e propriedades customizadas são suportadas pelo WebKit do iPadOS | **adotar** unidades relativas e herança para preservar proporções |
| [Style Settings](https://github.com/obsidian-community/obsidian-style-settings/tree/4ebec6ae0131a9d5e8307bb5e26d59db5ba2e81c) | `1.0.9`, tag `4ebec6ae0131a9d5e8307bb5e26d59db5ba2e81c` | GPL-3.0 | `isDesktopOnly: false`; altera variáveis CSS e classes | **adaptar** o uso de variáveis; **rejeitar** nova dependência e escrita global no `body` |

## Alternativas rejeitadas

- aplicar `zoom`, `transform: scale()` ou ampliar o WebView inteiro: também
  redimensionaria imagens, geometria, hit targets e o controle flutuante;
- enumerar todos os elementos com seletores DOM: é frágil diante de mudanças no
  renderizador, plugins e conteúdo incorporado;
- substituir os seis tamanhos de título por razões próprias sem uma decisão de
  produto: apagaria decisões legítimas do tema. A revisão posterior aprovada
  para telas de 11" limita somente os tamanhos a 120%/110% e está documentada
  em [`RESEARCH-compact-heading-scale-2026-07.md`](RESEARCH-compact-heading-scale-2026-07.md);
- alterar `--font-text-size` globalmente no `body`: afetaria outras folhas,
  popovers e partes da interface, contrariando o escopo da nota ativa;
- vencer regras `!important` de temas ou snippets: uma folha que deliberadamente
  fixa tamanhos absolutos continua sendo uma incompatibilidade externa, não uma
  autorização para o plugin dominar toda a cascata.

## Matriz de verificação

Os modos Leitura e Visualização ao vivo devem ser inspecionados em `32 px`,
`55 px` e nos máximos próprios (`75 px` e `60 px`), nos temas claro e escuro.
A amostra contém:

- título interno e H1–H6;
- parágrafo, links, ênfase, listas e citação;
- callout;
- tabela;
- código inline e em bloco;
- fórmula;
- tag, destaque e nota de rodapé;
- propriedades e nota Markdown incorporada.

O tamanho calculado de cada elemento textual precisa crescer quando a base
cresce; relações como H1 maior que o corpo e código menor que o corpo devem
permanecer. A interface do plugin não pode herdar a escala do documento.

Nenhum código externo foi copiado.

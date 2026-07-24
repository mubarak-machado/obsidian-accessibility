# Pesquisa — escala compacta dos títulos

Data: 2026-07-24

Status: abordagem aprovada e implementada como correção isolada, sem incremento
de versão ou mudança de dependências.

## Problema

Depois que o slider passou a controlar toda a tipografia, as proporções padrão
do Obsidian continuaram corretas matematicamente, mas ficaram excessivas no uso
real de uma tela de 11". Na instalação `1.12.7`, H1 usa `1.618em`: com Leitura
em `75 px`, isso produz aproximadamente `121,3 px`. H2 ainda chega a
aproximadamente `109,7 px`.

O requisito aprovado é:

- título interno da nota e H1: 120% da base do slider;
- H2, H3, H4, H5 e H6: 110% da base;
- cor, peso, família tipográfica, altura de linha e espaçamento não pertencem a
  esta correção e continuam disponíveis ao tema e ao Theme Engine.

## Decisão técnica

Sobrescrever apenas os tokens oficiais de tamanho no mesmo escopo já limitado à
folha Markdown ativa:

```css
--h1-size: 1.2em;
--h2-size: 1.1em;
--h3-size: 1.1em;
--h4-size: 1.1em;
--h5-size: 1.1em;
--h6-size: 1.1em;
--inline-title-size: var(--h1-size);
```

As unidades `em` mantêm as proporções relativas à base de Leitura ou Edição. A
mesma declaração alcança o modo de Leitura, a Visualização ao vivo e conteúdo
renderizado dentro do editor, sem tocar na interface do plugin.

Não são declarados tokens de cor, peso, fonte ou espaçamento. O Theme Engine
pode, portanto, continuar controlando as cores dos títulos por meio das
variáveis do Obsidian ou de variáveis personalizadas. Uma regra externa que
force o próprio tamanho no mesmo elemento com maior precedência pode
deliberadamente substituir esta escala; o plugin não tenta vencer toda a
cascata com `!important`.

## Acessibilidade

A hierarquia programática não depende da diferença visual de tamanho. H1–H6
continuam sendo elementos e linhas semânticas distintos, preservando navegação
por títulos no Outline e em tecnologias assistivas.

A cor pode ser a maior diferenciação visual escolhida pelo usuário, mas não é a
única informação disponível: o título principal conserva 120% contra 110% dos
demais níveis, e o tema continua livre para diferenciar peso e espaçamento.
Mesmo quando H2–H6 têm o mesmo tamanho, sua ordem semântica continua
programaticamente determinável.

## Referências avaliadas

| Referência | Revisão | Licença | Compatibilidade móvel | Classificação |
| --- | --- | --- | --- | --- |
| [Obsidian Developer Docs — Headings](https://github.com/obsidianmd/obsidian-developer-docs/blob/2d0e942f03b23ed94ebda3c610ed074662ed63db/en/Reference/CSS%20variables/Editor/Headings.md) | commit `2d0e942f03b23ed94ebda3c610ed074662ed63db`, consultado em 2026-07-24 | documentação oficial sob os termos do Obsidian; nenhum código copiado | os tokens pertencem ao CSS compartilhado do editor e não exigem Node ou Electron | **adotar** `--h1-size` a `--h6-size` e `--inline-title-size` como contrato |
| Obsidian instalado | `1.12.7`; `obsidian-1.12.7.asar` com SHA-256 `2b2483b2e1246772e0d25367ec055cbc5047ea2f0091b667c35656678f86d712` | licença proprietária; inspecionado somente para interoperabilidade | a correção usa apenas CSS compatível com o aplicativo móvel | **adaptar** os tamanhos padrão à faixa alta aprovada para o iPad |
| [Theme Engine](https://github.com/YazanAmmar/obsidian-theme-engine), incluindo sua [lista de variáveis](https://github.com/YazanAmmar/obsidian-theme-engine/blob/main/docs/variables.md#supported-variables) | release `2.1.0`, consultada em 2026-07-24 | MIT | catálogo comunitário declara suporte a desktop e móvel; requer Obsidian `1.11.0+` | **adaptar** a convivência com `--h1-color` a `--h6-color`; **rejeitar** dependência direta e qualquer sobrescrita de suas cores |
| [CSS Values and Units Level 4](https://www.w3.org/TR/css-values-4/#font-relative-lengths) | recomendação vigente consultada em 2026-07-24 | W3C Document License | comprimentos relativos são suportados pelo WebKit do iPadOS | **adotar** `em` para razões exatas em torno da base local |
| [WCAG 2.2 — Use of Color](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color) e [G141 — Organizing a page using headings](https://www.w3.org/WAI/WCAG22/Techniques/general/G141.html) | documentos vigentes consultados em 2026-07-24 | W3C Document License | aplicáveis ao conteúdo web renderizado no iPad | **adotar** estrutura semântica e conservar pistas além da cor |

## Alternativas rejeitadas

- tamanhos absolutos em `px`: perderiam a relação com o slider;
- `clamp()`: criaria proporções variáveis, quando o requisito pede 120% e 110%
  em toda a faixa;
- seletores diretos para cada H1–H6: duplicariam o contrato já oferecido pelos
  tokens oficiais e seriam mais frágeis no editor;
- controlar também cores, pesos ou espaçamentos: conflitaria com a escolha
  explícita de deixar a diferenciação visual sob o Theme Engine;
- `!important`: dominaria temas e snippets deliberadamente mais específicos.

## Matriz esperada

| Modo | Base | título interno/H1 | H2–H6 |
| --- | ---: | ---: | ---: |
| Leitura | `32 px` | `38,4 px` | `35,2 px` |
| Leitura | `55 px` | `66 px` | `60,5 px` |
| Leitura | `75 px` | `90 px` | `82,5 px` |
| Edição | `32 px` | `38,4 px` | `35,2 px` |
| Edição | `50 px` | `60 px` | `55 px` |
| Edição | `60 px` | `72 px` | `66 px` |

O harness deve confirmar esses tamanhos nos temas claro e escuro, sem overflow
horizontal global, sem alteração do tamanho do controle e sem diferenças entre
Leitura e Visualização ao vivo na mesma base.

Nenhum código externo foi copiado.

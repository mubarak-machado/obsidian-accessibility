# Revisão — escala compacta dos títulos

Data: 2026-07-24

Escopo: limitar o título interno e H1 a 120% da base do slider, e H2–H6
a 110%, sem alterar cores, pesos, fontes, espaçamentos, dependências ou versão.

## Resultado

A revisão não encontrou bloqueios de código. A correção acrescenta somente os
tokens oficiais de tamanho ao escopo tipográfico já limitado à folha Markdown
ativa. Leitura, Visualização ao vivo e transclusões dentro do editor recebem as
mesmas razões em torno de suas respectivas bases.

Os tokens `--h1-color` a `--h6-color` não são declarados pelo plugin. O harness
aplica seis cores independentes, equivalentes às variáveis expostas pelo Theme
Engine, e confirmou que todas atravessam a nova escala sem ser substituídas.

## Evidência automatizada

- `npm ci`: concluído com npm `11.11.0`;
- `npm run check`: lint, 10 arquivos/114 testes, TypeScript, build e inspeção
  móvel concluídos;
- bundle: `44.533` bytes, sem Node/Electron e com escrita restrita a
  `Vault.process()`;
- teste focal de escala: 6 testes concluídos;
- título interno e H1 exigem `1.2em`;
- H2–H6 exigem `1.1em`;
- o teste recusa declarações de cor, fonte, peso ou altura de linha no novo
  escopo;
- a amostra visual agora identifica e mede os seis níveis em Leitura e Edição;
- `git diff --check`: concluído antes e depois da revisão visual.

## Evidência visual no navegador

O `styles.css` real foi renderizado em viewport de iPad `1024 × 1366`.

| Modo | Base | título interno/H1 | H2–H6 | Resultado |
| --- | ---: | ---: | ---: | --- |
| Leitura | `32 px` | `38,4 px` | `35,2 px` | passa |
| Leitura | `55 px` | `66 px` | `60,5 px` | passa |
| Leitura | `75 px` | `90 px` | `82,5 px` | passa |
| Edição | `32 px` | `38,4 px` | `35,2 px` | passa |
| Edição | `50 px` | `60 px` | `55 px` | passa |
| Edição | `60 px` | `72 px` | `66 px` | passa |

Os máximos foram repetidos nos temas claro e escuro. Em todos os estados:

- H1–H6 calcularam exatamente as razões aprovadas;
- tabela e corpo continuaram na base do slider;
- as seis cores representativas permaneceram distintas;
- o documento não produziu overflow horizontal global;
- o acionador sentinela permaneceu em `48 × 48 px`;
- o console do navegador permaneceu sem erros.

Uma inspeção adicional em `744 × 1133` preservou tamanhos, cores, controle e
ausência de overflow global. Em Leitura a `75 px`, tabela e bloco de código
podem manter sua própria rolagem horizontal por causa do conteúdo ampliado;
isso já decorre da escala integral do corpo e não é causado pelos títulos.

As cores representativas do harness atingiram contraste mínimo de `7,42:1` no
tema claro e `9,57:1` no escuro. Esses valores validam o harness, não todas as
cores que o usuário possa escolher no Theme Engine.

## Revisão de acessibilidade

- A estrutura H1–H6 e a ordem do documento não mudam.
- Outline, navegação por títulos e tecnologias assistivas continuam recebendo
  os níveis semânticos verdadeiros.
- H1 mantém uma pista de tamanho além da cor.
- H2–H6 usam o mesmo tamanho por decisão explícita; peso e espaçamento
  permanecem disponíveis ao tema. Se uma configuração externa também os
  igualar, a cor poderá se tornar a principal pista visual, por isso as cores
  escolhidas devem manter contraste suficiente e separação perceptível.
- Não há novos controles, gestos, foco, movimento, persistência ou escrita na
  nota.

## Revisão de código

- **Segurança:** nenhuma nova rota de entrada, rede, persistência ou escrita.
- **Escopo:** as variáveis existem apenas sob
  `.workspace-leaf-content[data-type='markdown'].oa-scale-active`.
- **Compatibilidade:** CSS padrão, sem Node/Electron e sem API interna nova.
- **Desempenho:** somente sete propriedades customizadas estáticas; sem
  observadores, eventos ou recálculo JavaScript adicional.
- **Manutenção:** usa o contrato documentado de tokens do Obsidian, em vez de
  seletores separados para cada renderizador.

## Gate humano

Antes de lançar, ainda é necessário confirmar no iPad físico:

- tela de 11" em retrato, paisagem e Split View;
- Leitura em `55`, `60`, `65` e `75 px`;
- Visualização ao vivo em `50` e `60 px`;
- tema e perfil reais do Theme Engine;
- Outline e navegação por títulos com VoiceOver;
- preservação da posição ao mover o slider.

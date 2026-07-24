# Revisão — anotação rápida no modo leitura

Data: 2026-07-23

Escopo: implementação do MVP aprovado com uma cor nativa, borracha e suporte
comum a dedo e Apple Pencil.

## Resultado

A candidata `1.0.0` foi reprovada no primeiro teste físico: a comparação entre
o texto do renderizador e o recorte do Markdown produzia um falso conflito, e a
interação exigia um segundo toque depois da seleção. A revisão da correção não
deixou bloqueios de código. A nova candidata pode ser distribuída como
pré-lançamento para teste físico, mas não promovida a estável antes desse gate.

## Correções feitas durante a revisão

1. A igualdade inválida com `getSectionInfo().text` foi removida; caminho e
   linhas localizam uma ocorrência única no conteúdo real.
2. Marcador e borracha viraram ferramentas persistentes; a ação ocorre
   automaticamente ao terminar uma seleção.
3. Uma seleção existente antes de abrir o controle é preservada e marcada ao
   ativar o lápis.
4. `pointerup` atende dedo e Apple Pencil; `pointercancel` aguarda a seleção
   nativa estabilizar antes do fallback por `selectionchange`.
5. Geração de sessão e caminho ativo cancelam timers e escritas antigas ao
   mudar de nota, modo ou sessão.
6. Anúncios repetidos recebem identidade própria para continuarem disponíveis
   ao VoiceOver.
7. Ativo, inativo e foco ganharam contraste mensurado, anel e indicador
   geométrico sem depender somente de cor.

## Segurança da escrita

- A escrita exige modo de Leitura, seleção não vazia e um único bloco aceito.
- Caminho, linhas, nota ativa e geração da sessão precisam continuar válidos.
- O trecho precisa ter uma única ocorrência na seção.
- Links, código, HTML, ênfase, destaque existente e outros wrappers reconhecidos
  são recusados para a ação de marcar.
- A borracha remove apenas o wrapper exato `==texto==`.
- Uma pré-validação evita transação desnecessária; a mesma validação é repetida
  dentro de `Vault.process()` para detectar concorrência.

## Evidência automatizada

- `npm ci`: concluído com npm `11.11.0`.
- `npm run check`: ESLint, 94 testes, TypeScript, build e inspeção móvel
  concluídos.
- Bundle: `41.446` bytes, sem Node/Electron e com escrita restrita a
  `Vault.process()`.
- Instalação em cofre temporário isolado: os hashes de `main.js`,
  `manifest.json` e `styles.css` coincidiram com os arquivos da raiz.
- `git diff --check`: concluído.

## Evidência visual

O harness foi renderizado em viewport de iPad (`1024 × 1366`) nos temas claro
e escuro, nas escalas Grande, Média e Mínima. Painel normal, marcador ativo,
borracha inativa, foco, seleção, slider, acionador ativo e repouso ficaram sem
corte. Os menores contrastes medidos foram:

| Estado | Tema claro | Tema escuro | Limite |
| --- | ---: | ---: | ---: |
| texto e ícone inativo | `12,75:1` | `14,86:1` | `4,5:1` / `3:1` |
| ícone, anel ativo e foco | `10,34:1` | `11,41:1` | `3:1` |
| seleção em andamento | `13,62:1` | `9,63:1` | `4,5:1` |

Grande mantém botões de `66 px`; Média, `44 px`; Mínima, `22 px`. A última
conserva contraste, mas não atende à recomendação Apple de `44 × 44 pt` e não é
indicada para toque. Grande continua sendo o padrão.

## Gate humano pendente

Validar em Obsidian no iPad físico:

- ativar o marcador e selecionar por palavra ou arrasto com dedo;
- as mesmas operações com Apple Pencil;
- aplicação automática ao terminar a seleção, sem segundo toque;
- troca persistente entre marcador e borracha;
- seleção feita antes de abrir o controle;
- persistência da paleta entre seleções;
- VoiceOver, teclado externo e `Escape`;
- retrato, paisagem e Split View;
- recusa de seleção em link, múltiplos blocos e texto repetido;
- saída por mudança de nota, modo e descarregamento.

O duplo toque no corpo do Apple Pencil não faz parte deste gate. Ele permanece
no backlog porque depende de `UIPencilInteraction`, sem evento web documentado
equivalente.

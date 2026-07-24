# Backlog do produto

Este é o backlog durável e canônico do **Obsidian Accessibility**. Ele registra
as melhorias aprovadas em 24 de julho de 2026 e deve ser atualizado quando um
item mudar de ordem, escopo, estado ou for concluído. O
[`ROADMAP.md`](ROADMAP.md) mantém os marcos mais amplos do projeto.

## Regras do backlog

- A ordem abaixo é a ordem aprovada de implementação.
- Cada item começa com pesquisa externa própria e termina com testes
  automatizados, inspeção visual no navegador e validação física pertinente no
  iPad.
- Preferências visuais e posições de leitura ficam nos dados do plugin; nunca
  no Markdown, no frontmatter ou no conteúdo da nota.
- Um recurso novo não deve compartilhar commit com refatoração, atualização de
  dependências ou incremento de versão.
- `A fazer` significa aprovado, mas ainda não autorizado como parte de uma
  entrega diferente daquela em que o item for iniciado.

## Pré-requisitos ativos

### P0 — Escala tipográfica completa

**Estado:** concluído em 2026-07-24; aguarda ensaio físico antes de lançamento.

Fazer o slider redimensionar proporcionalmente todo o conteúdo semântico da
nota ativa em Leitura e Visualização ao vivo: título interno, títulos H1–H6,
texto, listas, citações, callouts, tabelas, código, fórmulas, notas de rodapé,
metadados renderizados e conteúdo incorporado que herde a tipografia da nota.
Preservar a hierarquia entre os elementos, a posição de leitura e o tamanho
independente da interface do plugin.

### P1 — Cor única do destaque nativo

**Estado:** concluído em 2026-07-24; aguarda ensaio físico antes de lançamento.

Permitir escolher uma única cor para todos os destaques Markdown
`==texto==` na nota ativa. A preferência deve ficar nos dados do plugin e
sobrepor somente o token de destaque do tema nesse escopo. Oferecer retorno
explícito à cor do tema e assegurar contraste legível em temas claro e escuro.

A implementação usa o seletor nativo de cor das configurações, aplica a
preferência somente à folha Markdown ativa e escolhe automaticamente texto
preto ou branco. Resultados de busca e outros realces da interface não recebem
a sobreposição.

## Fila aprovada

### 1 — Desfazer a última anotação

**Estado:** a fazer.

Adicionar uma ação de desfazer limitada à última marcação ou remoção feita pelo
modo de anotação na sessão corrente. Recusar a operação se o arquivo tiver sido
alterado de forma concorrente; não criar histórico paralelo persistente.

**Valor:** recuperação imediata do erro mais provável durante marcação por dedo
ou Apple Pencil.

### 2 — Foco guiado de leitura

**Estado:** a fazer.

Oferecer uma régua ou foco de parágrafo opcional, acionado no mesmo painel
compacto. O foco deve acompanhar toque, teclado e rolagem, não escrever na nota,
não depender apenas de cor e falhar isoladamente.

**Valor:** reduz perda de linha e carga visual em textos longos.

### 3 — Sessão assistida de apresentação

**Estado:** a fazer.

Entregar em três incrementos independentes:

1. cronômetro discreto, opcional e recuperável;
2. prevenção de bloqueio da tela por Screen Wake Lock, com fallback explícito;
3. comandos configuráveis para teclado externo ou apresentador Bluetooth.

Nenhum incremento deve bloquear a saída do Modo Zen nem simular suporte que o
iPadOS ou o navegador não exponha.

**Valor:** transforma o modo atual em uma ferramenta de apresentação confiável
sem sobrecarregar o controle principal.

### 4 — Progresso e retomada da leitura

**Estado:** a fazer.

Registrar, por nota, um marcador estável de posição e oferecer retomada
explícita. Guardar somente os dados mínimos no armazenamento do plugin, prever
limpeza automática e tolerar mudanças no documento sem saltos perigosos.

**Valor:** facilita leituras longas interrompidas e alternância entre notas.

### 5 — Predefinições de conforto

**Estado:** a fazer.

Adicionar predefinições compactas — por exemplo, Compacta, Confortável e
Espaçosa — que combinem tamanho, altura de linha e medida de leitura. Manter os
controles atuais como ajuste fino e evitar novos sliders permanentes.

**Valor:** permite chegar rapidamente a uma configuração coerente e repetível.

### 6 — Rolagem automática opcional

**Estado:** a fazer.

Implementar rolagem contínua com velocidade ajustável, pausa imediata por
toque, caneta, teclado ou rolagem manual e desligamento seguro em mudança de
contexto. Respeitar `prefers-reduced-motion` e manter o recurso desligado por
padrão.

**Valor:** auxilia leitura em voz alta e apresentações sem interação constante.

## Futuro sem prioridade

### Duplo toque do Apple Pencil

Investigar uma ponte segura para `UIPencilInteraction` que respeite a ação
preferida do iPadOS e alterne entre marcador e borracha. Não há evento web
documentado equivalente; os botões manuais devem permanecer como alternativa.

### Itens deliberadamente adiados

- várias cores simultâneas, sublinhado e estilos próprios gravados no Markdown;
- desenho livre, tinta digital, Canvas e anotação de PDF;
- mecanismo próprio de texto para fala ou dependência obrigatória de serviço
  externo.

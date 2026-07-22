# Roteiro de desenvolvimento

## Regra de trabalho

Toda funcionalidade ou melhoria começa com pesquisa externa, priorizando GitHub, documentação oficial, padrões e código-fonte auditável. Registre se cada abordagem foi adotada, adaptada ou rejeitada.

Trabalhe diretamente em `main`, conforme o fluxo de mantenedor único definido em [`AGENTS.md`](../AGENTS.md).

## Marco 0 — Código-fonte reproduzível

**Objetivo:** tornar este repositório a fonte oficial completa sem alterar a versão `0.1.1`.

- [x] Migrar o código-fonte TypeScript, os testes, o arquivo de dependências, os scripts e a configuração de compilação.
- [x] Estabelecer `npm ci` e `npm run check` em um clone limpo.
- [x] Recompilar os três arquivos distribuíveis e comparar os hashes com a transição.
- [x] Documentar diferenças inevitáveis de compilação — nenhuma foi encontrada.
- [x] Adicionar integração contínua depois de comprovar a reprodutibilidade local.
- [x] Documentar a instalação de desenvolvimento e a reversão.

**Etapa de conclusão:** um commit isolado de migração, sem mudança visual ou comportamental.

**Concluído em 2026-07-21:** pesquisa `ce127a8`, migração isolada do código-fonte
`f176807` e evidência de reprodutibilidade `f658a96`. O pacote de produção e os
arquivos do lançamento permaneceram idênticos, byte por byte, à versão `0.1.1`;
a integração contínua e as orientações de desenvolvimento só foram adicionadas
depois da aprovação do clone limpo. Os commits de integração contínua `6de769c`
e `c4b983a` culminaram na execução bem-sucedida `29852766796` do GitHub Actions
em Node.js 20, 22 e 24.

## Marco 1 — Modo de apresentação

**Objetivo:** entrar e sair com segurança de um estado voltado à apresentação.

- [x] Pesquisar padrões atuais do Obsidian para apresentação, foco, espaço de trabalho e barra móvel.
- [x] Definir o estado capturado antes da entrada.
- [x] Implementar entrada, saída e restauração determinística.
- [x] Oferecer uma rota evidente de recuperação.
- [x] Simular falhas e verificar que a interface nunca fica bloqueada.
- [x] Preservar a posição de leitura e o slider aprovado.
- [x] Adicionar o primeiro controle de apresentação: botão persistente da barra de abas dentro do painel aprovado do slider.

**Já concluído:** o botão flutuante à esquerda ou à direita e o painel vertical formam a referência inicial.

**Primeira parte funcional concluída em 2026-07-21:** o botão da barra de abas
adapta o padrão de classe no `body` e CSS delimitado documentado em
[`RESEARCH-tab-bar-toggle-2026-07.md`](RESEARCH-tab-bar-toggle-2026-07.md).
Ele mantém uma rota de recuperação pela paleta de comandos e restaura a barra
de abas ao descarregar o plugin.

**Ampliação do controle concluída em 2026-07-21:** o controle flutuante completo
passou a ter 150% das dimensões originais usando layout intrínseco, sem
transformação visual. Consulte
[`RESEARCH-control-scale-2026-07.md`](RESEARCH-control-scale-2026-07.md).

**Aprimoramento do acionador de acessibilidade concluído em 2026-07-21:** o
símbolo tipográfico `A↕` foi primeiro substituído pelo ícone Lucide
`accessibility` do Obsidian e, após a avaliação para baixa visão, por uma
silhueta Material `accessibility_new` maior e preenchida. O acionador circular
estável agora representa o conjunto crescente de recursos de acessibilidade,
enquanto o painel existente continua sendo seu primeiro módulo. Consulte
[`RESEARCH-accessibility-launcher-2026-07.md`](RESEARCH-accessibility-launcher-2026-07.md).

**Modo Zen recuperável implementado em 2026-07-21:** o antigo botão isolado da
barra de abas agora captura e restaura as duas barras laterais, oculta elementos
de navegação com uma classe delimitada e mantém a gaveta móvel direita e seu
Outline ativo disponíveis ao gesto nativo do Obsidian. O modo vale apenas
durante a sessão e oferece recuperação por toque, comando, `Escape`, mudança de
contexto e descarregamento. Consulte
[`RESEARCH-zen-mode-2026-07.md`](RESEARCH-zen-mode-2026-07.md).

**Simetria do controle refinada em 2026-07-21:** a ação textual `Reset` foi
substituída por um botão inferior padronizado, com o ícone `rotate-ccw`, as
mesmas dimensões do botão do Modo Zen e nome acessível explícito. Consulte
[`RESEARCH-reset-control-2026-07.md`](RESEARCH-reset-control-2026-07.md).

**Tentativa de correção vertical em 2026-07-21:** na versão 0.4.2, o slider
deixou de ser um controle horizontal apenas girado por CSS e passou a usar a
orientação vertical nativa do navegador. O ensaio físico posterior invalidou
essa abordagem para o controle personalizado. Consulte
[`RESEARCH-native-vertical-slider-2026-07.md`](RESEARCH-native-vertical-slider-2026-07.md).

**Correção anterior invalidada no iPad em 2026-07-21:** a versão 0.4.2 não
resolveu o primeiro arrasto para baixo e introduziu desalinhamento entre o
puxador e o trilho. A substituição corretiva separa a semântica nativa da
pintura e da captura do ponteiro, conforme
[`RESEARCH-pointer-driven-slider-2026-07.md`](RESEARCH-pointer-driven-slider-2026-07.md).

**Etapa humana:** ensaiar com uma nota longa real no iPad sem modificá-la e
confirmar que o primeiro arrasto para baixo funciona diretamente em 55 px e
65 px na leitura, além de 50 px na visualização ao vivo, em retrato, paisagem e
Split View.

**Mínimo unificado concluído em 2026-07-22:** Leitura e edição agora aceitam
32 px como valor mínimo nos perfis Apresentação, Preparação e Pesquisa, mantendo
os máximos próprios de 75 px e 60 px. A alteração preserva os valores padrão e
não exige migração destrutiva. Consulte
[`RESEARCH-unified-font-minimum-2026-07.md`](RESEARCH-unified-font-minimum-2026-07.md).

**Personalização do controle concluída em 2026-07-22:** o botão flutuante combina
Direita ou Esquerda com Inferior, Meio ou Superior, sem posição horizontal
central. O componente completo oferece Mínima (50%), Média (100%) e Grande
(150%), preservando Grande como padrão. Após dois segundos fechado e sem
interação, o acionador fica com 50% de opacidade e recupera a visibilidade ao
toque ou foco. O painel parte do botão e permanece contido na nota e na área
visível. Consulte
[`RESEARCH-control-position-2026-07.md`](RESEARCH-control-position-2026-07.md).
Consulte também
[`RESEARCH-control-scale-2026-07.md`](RESEARCH-control-scale-2026-07.md).

## Marco 2 — Segurança da interação

- [ ] Pesquisar edição segura e proteção contra ações acidentais do teclado.
- [ ] Implementar proteção com recuperação imediata.
- [ ] Integrar comandos à barra móvel.
- [ ] Validar atalhos de teclado externo.
- [ ] Revalidar VoiceOver, ordem de foco, rótulos, valores e ações ajustáveis.
- [ ] Testar orientação, Split View, áreas seguras e mudança de contexto.

**Etapa humana:** concluir um ensaio de ponta a ponta antes de adicionar mais controles.

## Marco 3 — Auxílios opcionais de leitura

Criar protótipos independentes e mantê-los desativados até a aprovação:

- [ ] foco de parágrafo ou régua de leitura;
- [ ] navegação por blocos e marcador temporário de posição;
- [ ] compatibilidade com apresentador Bluetooth;
- [ ] prevenção confiável do bloqueio da tela;
- [ ] experimento isolado de pinça para ajustar escala;
- [ ] cronômetro opcional ou estimativa de tempo restante.

Cada módulo deve poder falhar isoladamente, evitar escrita nas notas e não depender apenas de cor.

## Marco 4 — Robustez e distribuição

- [ ] Ampliar os testes automatizados e em dispositivos físicos.
- [x] Formalizar o versionamento da configuração e as migrações.
- [ ] Testar atualização e reversão pelo BRAT.
- [ ] Verificar remoção e recuperação no modo restrito.
- [ ] Estabelecer referências de compatibilidade do Obsidian e iPadOS.
- [x] Manter arquivos do lançamento, tag, manifesto e `versions.json` coerentes.
- [ ] Decidir se é desejável solicitar inclusão no catálogo oficial.

## Aprimoramento contínuo

- Só introduzir controles adicionais após evidências de uso real.
- Remover opções sem uso antes de adicionar configurações.
- Revalidar depois de atualizações relevantes do Obsidian ou iPadOS.
- Priorizar a confiabilidade da apresentação em relação à conveniência.
- Atualizar este roteiro quando o escopo ou a sequência mudar.

# Obsidian Accessibility

Controles de acessibilidade para o Obsidian, desenvolvidos primeiro para leitura e apresentação de notas longas no iPad.

## Funcionalidades

- botão circular persistente de acessibilidade, com ícone preenchido de alta visibilidade, que abre um controle vertical compacto;
- Modo Zen recuperável, que reduz os elementos de navegação sem bloquear o Outline (sumário) na barra lateral direita;
- anotação rápida no modo de Leitura, com uma única cor configurável e
  borracha;
- escalas independentes para o modo de Leitura e a Pré-visualização em tempo
  real, aplicadas proporcionalmente a títulos, tabelas, código, notas de
  rodapé, propriedades, callouts e conteúdo incorporado;
- fonte mínima de 32 px em Leitura e edição para os três perfis;
- posicionamento configurável em seis combinações: Direita ou Esquerda com Inferior, Meio ou Superior;
- escala completa do controle em Mínima (50%), Média (100%) ou Grande (150%);
- acionador com contraste integral em repouso, reduzindo somente a sombra após
  dois segundos e respondendo imediatamente ao toque ou foco;
- configurações persistentes e restauração com um toque;
- nenhuma escrita fora do modo de anotação: somente a seleção deliberada com
  marcador ou borracha ativos escreve o formato nativo `==texto==`;
- nenhuma dependência de Node.js ou Electron no pacote móvel.

## Anotação rápida

1. No modo de Leitura, abra o controle de acessibilidade.
2. Toque no botão de lápis.
3. O marcador fica ativo por padrão. Selecione ou arraste sobre texto simples
   dentro de um único parágrafo, título, item de lista ou citação; a marcação
   `==texto==` é aplicada ao terminar a seleção.
4. Para apagar, toque na borracha e selecione ou arraste sobre uma marcação.
5. Marcador e borracha permanecem ativos entre seleções. Toque novamente no
   lápis para voltar ao controle de leitura.

A seleção também pode ser feita antes de abrir o controle: ao ativar o lápis, o
trecho existente é marcado. A paleta permanece aberta entre as seleções.
Trechos ambíguos, múltiplos blocos, transclusões e formatação aninhada são
recusados para evitar alterações no lugar errado. O fluxo usa os mesmos botões
com dedo, Apple Pencil, teclado e tecnologias assistivas.

Em **Configurações → Obsidian Accessibility → Destaque**, escolha a cor única
usada por todos os trechos `==texto==` quando a nota estiver ativa. Essa
preferência visual fica nos dados do plugin, não no Markdown, e substitui a cor
do tema somente para o destaque nativo. O texto marcado alterna
automaticamente entre preto e branco para conservar o melhor contraste.
**Usar cor do tema** remove a sobreposição personalizada.

## Instalação no iPad com o BRAT

1. No Obsidian, instale e ative o **BRAT** nos plugins da comunidade.
2. Abra **Configurações → BRAT** e escolha **Add beta plugin**.
3. Informe `mubarak-machado/obsidian-accessibility`.
4. Aguarde o BRAT instalar o lançamento mais recente.
5. Abra **Configurações → Plugins da comunidade** e ative **Obsidian Accessibility**.

O BRAT cuida da instalação e das atualizações. O Obsidian Sync pode continuar sincronizando normalmente o cofre e as configurações do plugin.

Para uso por toque no iPad, prefira Grande (padrão) ou Média: ambas mantêm
alvos de pelo menos `44 × 44`. Mínima preserva o desenho compacto preexistente,
mas seus botões de `22 × 22` não são recomendados para toque.

## Privacidade e escopo

O plugin funciona localmente, não coleta dados de uso, não envia o conteúdo das
notas pela rede e não grava preferências visuais nas notas. A anotação rápida
altera somente o trecho escolhido e somente após uma ação explícita.

Este repositório é a fonte oficial de desenvolvimento e também contém os três arquivos distribuíveis exigidos pelos lançamentos do Obsidian. Ele não inclui registros privados do projeto nem conteúdo de notas.

## Desenvolvimento

A versão `0.1.1` é a referência visual e comportamental aprovada. O código-fonte TypeScript autorizado, os testes, o arquivo de dependências, a compilação e a integração contínua são reproduzíveis neste repositório. Antes de fazer alterações, leia:

- [AGENTS.md](AGENTS.md) — fluxo de trabalho, restrições de segurança e regras de validação do repositório;
- [Transição de desenvolvimento da versão 0.1.1](docs/HANDOFF-v0.1.1.pt-BR.md) — referência técnica e tarefa obrigatória de migração do código-fonte;
- [Desenvolvimento e reversão](docs/DEVELOPMENT.md) — preparação limpa, instalação em cofre isolado de testes e recuperação;
- [Roteiro de desenvolvimento](docs/ROADMAP.md) — melhorias em sequência e etapas de validação humana.
- [Backlog do produto](docs/BACKLOG.md) — ordem canônica das melhorias
  aprovadas, independente das sessões de trabalho.

```bash
npm ci
npm run check
```

A migração do código-fonte reproduziu `main.js`, `manifest.json` e `styles.css` byte por byte; consulte o [registro de reprodutibilidade](docs/REPRODUCIBILITY-v0.1.1.md).

## Licença

[MIT](LICENSE)

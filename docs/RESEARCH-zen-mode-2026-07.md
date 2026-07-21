# Pesquisa — Modo Zen recuperável

Data: 2026-07-21

## Requisito

Transformar o botão existente de visibilidade da barra de abas em um Modo Zen
acessível para ler e apresentar notas longas no iPad. O modo deve reduzir os
elementos de navegação sem prender o usuário, alterar o conteúdo da nota, mudar
o modo atual de leitura ou edição nem perder o estado anterior das barras
laterais.

A gaveta móvel direita é uma rota obrigatória de navegação: seu Outline ativo
deve continuar selecionado e o gesto nativo a partir da borda direita deve
continuar capaz de mostrar a gaveta sobre a nota enquanto o Modo Zen estiver
ativo.

## Referências avaliadas

| Candidato | Versão avaliada | Licença | Evidência móvel | Classificação e conclusão |
| --- | --- | --- | --- | --- |
| [API do Obsidian](https://github.com/obsidianmd/obsidian-api/blob/master/obsidian.d.ts) | pacote npm `1.13.1` usado pelo projeto | MIT | a API pública expõe `collapsed`, `collapse()` e `expand()` em `WorkspaceMobileDrawer` e `WorkspaceSidedock` | **adotar** o estado e os métodos públicos das barras laterais; não executar identificadores não documentados de comandos internos nem remover o DOM da gaveta |
| [Obsidian Hider](https://github.com/kepano/obsidian-hider) | versão `1.6.2` | MIT | `isDesktopOnly: false`; os recursos de interface usam classes independentes no `body` | **adaptar** classes temporárias no `body` para a barra de abas, faixa lateral e barra de status; **rejeitar** a ampla matriz de configurações e a ocultação de barras de rolagem ou metadados do documento nesta primeira etapa |
| [Ultra Zen Mode](https://github.com/MarckFp/ultra-zen-mode) | versão `1.15.0` | Apache-2.0 | o README abrange explicitamente computador, tablet e celular | **adaptar** a limpeza determinística de classes e uma rota de recuperação sempre disponível; **rejeitar** bloquear notas, mudar o modo de visualização, ocultar propriedades ou título e adicionar outro botão flutuante de saída |
| [Zen Mode](https://github.com/paperbenni/obsidian-zenmode) | versão `1.6.8` | GPL-2.0 | o lançamento comunitário oferece suporte a computador e celular e documenta um botão de saída | **adaptar** a captura e restauração das barras laterais; **rejeitar** tela cheia, controles arrastáveis e expansão opcional da interface nesta versão |

Nenhum código-fonte ou regra CSS é copiado desses projetos.

## Decisão

Substituir a preferência persistente `tabBarHidden` por um
`ZenModeController` válido somente durante a sessão:

1. Capturar o estado recolhido das duas barras laterais.
2. Adicionar ao `body` uma única classe `oa-zen-mode` pertencente ao plugin.
3. Recolher as duas barras laterais pela API pública do Obsidian.
4. Ocultar somente a barra principal de abas, a faixa lateral esquerda e a barra de status com CSS delimitado.
5. Ao sair, remover a classe e restaurar cada barra lateral ao estado exato
   capturado, inclusive recolhendo uma gaveta que estava originalmente fechada,
   mas foi aberta temporariamente durante o Modo Zen.

Não deve existir seletor CSS do Modo Zen para `.workspace-drawer` ou barra
lateral. No iPad, recolher fecha a gaveta sobreposta, mas mantém a gaveta e seu
Outline ativo intactos para o gesto nativo do Obsidian a partir da borda.
Selecionar um título deve navegar dentro da nota sem sair do Modo Zen.

O Modo Zen não persiste após recarregar o plugin. A versão `2` do esquema de
configurações descarta o campo antigo `tabBarHidden` e preserva perfis, escalas,
altura da linha, estado ativado e lado do controle.

## Interação e recuperação

- Botão inativo: Lucide `focus`, `Ativar modo zen`, `aria-pressed=false`.
- Botão ativo: Lucide `minimize-2`, `Sair do modo zen`, `aria-pressed=true`.
- Ativar ou sair pelo painel fecha o painel temporário.
- O acionador universal de acessibilidade continua montado e anuncia quando o Modo Zen está ativo.
- `Escape` fecha primeiro um painel aberto; com o painel fechado, sai do Modo Zen.
- Um botão na paleta de comandos continua disponível.
- Mudar para uma visualização que não seja Markdown ou descarregar o plugin encerra o modo automaticamente.
- Erros da API das barras laterais ficam isolados; o CSS pertencente ao plugin sempre é removido.

## Contrato de validação

A cobertura automatizada deve incluir as quatro combinações iniciais de barras
laterais abertas ou fechadas, abertura da gaveta direita durante o Modo Zen,
restauração exata, ativações repetidas, falha da API, mudanças acessíveis de
estado e ícone, `Escape`, migração de configurações, CSS delimitado e ausência
de regras que ocultem gavetas.

A validação física no iPad continua obrigatória porque o gesto nativo a partir
da borda não é garantido pelo contrato da API TypeScript. Testar orientação
vertical e horizontal, Split View, modo de Leitura, Pré-visualização em tempo
real, teclado virtual, controle à esquerda e à direita, áreas seguras, toque,
VoiceOver e o tema realmente usado. O lançamento deve permanecer como
pré-lançamento até que o gesto da direita para a esquerda abra a gaveta direita
sobreposta, o Outline navegue pelos títulos sem sair do Modo Zen e todas as
rotas de recuperação funcionem.

# Pesquisa — botão da barra de abas

Data: 2026-07-21

## Requisito

Adicionar um botão entre o valor atual do tamanho da fonte e o botão de
incremento. Ele deve ocultar ou mostrar a barra principal de abas do Obsidian
sem alterar o conteúdo da nota, continuar utilizável em dispositivos móveis,
expor seu estado de forma acessível e restaurar a interface quando o plugin for
descarregado.

## Referências avaliadas

| Candidato | Versão avaliada | Licença | Evidência móvel | Classificação e conclusão |
| --- | --- | --- | --- | --- |
| [Obsidian Hider](https://github.com/kepano/obsidian-hider) | [versão `1.6.2`](https://github.com/kepano/obsidian-hider/releases/tag/1.6.2) | MIT | `manifest.json` declara `isDesktopOnly: false`; a versão exige Obsidian 1.11.1 ou posterior | **adotar** o padrão comprovado de alternar classe no `body` e o seletor delimitado por `.mod-root`, que evita ocultar cabeçalhos de abas das barras laterais |
| [Ultra Zen Mode](https://github.com/MarckFp/ultra-zen-mode) | [versão `1.15.0`](https://github.com/MarckFp/ultra-zen-mode/releases/tag/1.15.0) | Apache-2.0 | o README abrange explicitamente computador, tablet e celular | **adaptar** a limpeza determinística de classes e a rota de recuperação por comando; **rejeitar** o seletor mais abrangente para todas as abas e comportamentos não relacionados do Modo Zen |
| [API do Obsidian](https://github.com/obsidianmd/obsidian-api) | pacote npm `1.13.1` | MIT | API oficial multiplataforma usada por este projeto | **rejeitar** chamada direta porque as tipagens públicas não expõem operação compatível para mostrar ou ocultar a barra de abas; manter o seletor não documentado isolado em uma regra CSS, com falha inofensiva |

As orientações oficiais para manter `onload()` leve e limpar comportamentos
registrados também foram avaliadas em
[Otimizar o tempo de carregamento do plugin](https://docs.obsidian.md/plugins/guides/load-time)
e [Eventos](https://docs.obsidian.md/Plugins/Events).

## Decisão

- Persistir `tabBarHidden` como booleano normalizado, com valor inicial `false`,
  para que usuários existentes mantenham a interface visível.
- Alternar uma classe pertencente ao plugin no `body`; o CSS oculta somente os
  contêineres de cabeçalho de abas dentro do espaço de trabalho raiz.
- Manter no CSS o seletor dependente do DOM. Se o Obsidian mudar sua classe
  interna, o recurso se torna inofensivamente inoperante, sem manipular nem
  remover nós desconhecidos do DOM.
- Adicionar um botão na paleta de comandos como rota de recuperação quando o
  controle flutuante não estiver disponível fora de uma visualização Markdown.
- Remover a classe pertencente ao plugin durante `onunload()`, seja qual for a
  preferência persistida.
- Usar um botão de 44 px, nome acessível estável e `aria-pressed` para expor se
  a ocultação está ativa.

## Risco conhecido e etapa de lançamento

`.workspace-tab-header-container` não é uma API pública documentada. Uma futura
versão do Obsidian ou regra de tema com alta especificidade pode impedir o
efeito do CSS. A falha é intencionalmente inofensiva e o comando permanece
disponível. Antes do lançamento, validar o tema padrão e o tema realmente usado
em um iPad físico nas orientações vertical e horizontal e em Split View;
confirmar toque, estado no VoiceOver, ordem de foco, áreas seguras, ocultação,
recuperação e descarregamento do plugin.

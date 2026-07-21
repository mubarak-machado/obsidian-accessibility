# Pesquisa — botão padronizado de restauração

Data: 2026-07-21

## Requisito

Substituir a ação textual `Reset` por um botão inferior visualmente equivalente
ao botão do Modo Zen. Manter a ação imediatamente abaixo de `−`, preservar o
alvo de toque de 66 × 66 px, restaurar apenas o tamanho do perfil ativo e não
alterar o conteúdo da nota.

## Referências avaliadas

| Candidato | Versão ou página avaliada | Licença | Relevância móvel | Classificação e conclusão |
| --- | --- | --- | --- | --- |
| [Lucide `rotate-ccw`](https://lucide.dev/icons/rotate-ccw) | versão `1.25.0`, avaliada em 2026-07-21 | ISC | símbolo circular simples, disponível pelo `setIcon` do Obsidian sem arquivo ou dependência adicional | **adotar** como metáfora de restauração; manter o nome acessível independente do desenho |
| [Lucide `undo-2`](https://lucide.dev/icons/undo-2) | versão `1.25.0`, avaliada em 2026-07-21 | ISC | disponível no mesmo ambiente móvel | **rejeitar** porque “desfazer” pode sugerir alteração no histórico ou no conteúdo da nota |
| [Padrão de botão do WAI-ARIA](https://www.w3.org/WAI/ARIA/apg/patterns/button/) | orientação vigente, avaliada em 2026-07-21 | termos dos documentos do W3C | exige nome acessível e comportamento de botão previsível para leitores de tela | **adotar** o elemento `button` nativo com `aria-label` e `title` explícitos |
| Ação textual `Reset` existente | versão `0.4.0` do projeto | MIT | legível, mas menor que os demais alvos e dependente de texto em inglês | **rejeitar** após avaliação visual; quebra a simetria e exige lógica exclusiva de ajuste tipográfico |

Nenhum código ou traçado SVG é copiado dessas referências. O ícone é fornecido
pelo próprio Obsidian em tempo de execução.

## Decisão

Usar um botão com as mesmas classes, dimensões, estados de foco e resposta ao
toque do botão do Modo Zen. Renderizar o ícone Lucide `rotate-ccw` com 33 px,
manter `Restaurar tamanho do perfil` como nome acessível e remover o separador
inferior. A sequência visual fica simétrica: valor, Modo Zen, `+`, slider, `−` e
restauração.

O botão continua restaurando somente a escala do modo atual no perfil ativo. A
ação não restaura configurações globais, não altera o Modo Zen e não escreve na
nota.

## Risco e validação

O significado visual de uma seta circular depende do nome acessível para não ser
confundido com “atualizar”. Os testes devem verificar posição, classe comum,
ícone, ausência de texto visível, rótulo e efeito restrito à escala. A validação
física no iPad deve conferir simetria, alcance do último botão, foco, VoiceOver,
orientação, Split View e rolagem do painel em alturas reduzidas.

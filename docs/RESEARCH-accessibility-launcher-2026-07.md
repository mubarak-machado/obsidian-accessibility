# Pesquisa — acionador universal de acessibilidade

Data: 2026-07-21

## Requisito

Substituir o acionador flutuante tipográfico `A↕` por um acionador somente com
ícone, capaz de permanecer estável à medida que o Obsidian Accessibility cresça
além do ajuste de texto. Manter o alvo de toque atual de 72 px, o posicionamento
à esquerda ou à direita, as áreas seguras, o comportamento de foco e do painel
e a execução segura em dispositivos móveis.

## Referências avaliadas

| Candidato | Versão ou página avaliada | Licença | Relevância móvel | Classificação e conclusão |
| --- | --- | --- | --- | --- |
| [AssistiveTouch da Apple para iPad](https://support.apple.com/guide/ipad/use-assistivetouch-ipad9a2466d3/ipados) | Guia do Usuário do iPad vigente, avaliado em 2026-07-21 | termos da documentação da Apple | estabelece um acionador flutuante persistente que abre um menu expansível de acessibilidade | **adaptar** a entrada flutuante estável e o formato circular; **rejeitar** arrastar e reduzir a opacidade em repouso nesta etapa, pois aumentam a complexidade gestual e podem reduzir a descoberta |
| [Diretrizes de Interface Humana da Apple: ícones](https://developer.apple.com/design/human-interface-guidelines/icons) | orientação vigente, avaliada em 2026-07-21 | termos da documentação da Apple | recomenda símbolos simples e reconhecíveis, acompanhados de descrições acessíveis | **adotar** um símbolo universal conhecido com nome acessível separado, em vez de codificar o significado em texto decorativo |
| [Material Design: botão de ação flutuante](https://m2.material.io/components/buttons-floating-action-button) | orientação do Material Design 2, avaliada em 2026-07-21 | termos da documentação do Google | documenta controles flutuantes somente com ícone, tamanhos mínimos de alvo e descrições acessíveis | **adaptar** o formato flutuante fácil de encontrar; **rejeitar** tratar o acionador como uma única ação principal convencional, pois ele abre um conjunto crescente de controles |
| [Material Design Icons `accessibility_new`, arredondado](https://github.com/google/material-design-icons/blob/abd7f5c0e179c83f068c770650bd14ebac5d5a09/android/action/accessibility_new/materialiconsround/black/res/drawable/round_accessibility_new_24.xml) | commit `abd7f5c0e179c83f068c770650bd14ebac5d5a09`, avaliado em 2026-07-21 | Apache-2.0 | a silhueta preenchida possui menos lacunas internas e maior massa visual que o contorno existente à mesma distância | **adotar** o traçado de 24 unidades como SVG local incorporado, ampliado para 42 px; manter a atribuição no código-fonte, pacote e aviso de terceiros |
| [Lucide `person-standing`](https://lucide.dev/icons/person-standing) | versão `1.25.0`, avaliada em 2026-07-21 | ISC | o contorno simples continua disponível pelo Obsidian sem outro arquivo | **adaptar** apenas como alternativa de reserva; **rejeitar** no acionador porque pode ser interpretado como uma pessoa genérica, não como acessibilidade |
| [Font Awesome `universal-access`](https://fontawesome.com/icons/universal-access) | versão `7.3.1`, avaliada em 2026-07-21 | CC BY 4.0 para os ícones | o conhecido símbolo preenchido tem boa presença à distância | **rejeitar** neste acionador circular porque o segundo círculo reduz a silhueta útil da pessoa e acrescenta complexidade de atribuição |
| [Ícone Lucide `accessibility`](https://lucide.dev/icons/accessibility) | versão `1.25.0`, avaliada em 2026-07-21 | ISC | símbolo de acessibilidade centrado na pessoa e disponível pelo Obsidian | **rejeitar** como acionador definitivo após a avaliação para baixa visão: curvas cruzadas e membros separados são mais difíceis de identificar à distância |
| [API do Obsidian](https://github.com/obsidianmd/obsidian-api) | pacote da API `1.13.1` usado pelo projeto | MIT | `setIcon` fornece ícones Lucide sem dependência de Node.js ou Electron durante a execução | **adotar** o caminho de compatibilidade já usado pelos controles internos |

Os dados do traçado Material selecionado são copiados da fonte Apache-2.0 fixada
e mantêm o aviso de licença. Nenhum código-fonte ou traçado SVG dos demais
candidatos é copiado.

## Alternativas

| Alternativa | Classificação | Conclusão |
| --- | --- | --- |
| `A↕`, `Aa`, livro ou olho | **rejeitar** no acionador principal | cada um restringe o produto à tipografia ou leitura; esses símbolos podem servir a futuras categorias internas |
| ícone de sliders ou configurações | **rejeitar** | é abrangente, mas genérico; comunica configuração mais do que acessibilidade |
| marca personalizada `OA` | **adiar** | pode sustentar uma futura marca pública, mas hoje não possui significado aprendido e exige um contrato visual próprio |
| ícone ampliado com o texto `Acessibilidade` | **adiar** | melhora a descoberta inicial, mas cobre mais a nota; considerar apenas se surgirem evidências de necessidade de introdução opcional |
| remover o acionador persistente | **rejeitar** | reduz o alcance e a descoberta no iPad; os comandos podem continuar como rota secundária |

## Decisão

Renderizar a silhueta preenchida e arredondada `accessibility_new` do Material
Design Icons com 42 px dentro do acionador circular existente de 72 px. A forma
preenchida substitui o contorno Lucide de 33 px porque sua área contínua maior
permanece identificável a uma distância superior. Ela é incorporada por APIs
SVG do DOM, não exige acesso à rede nem dependência durante a execução, herda a
cor do tema atual e é decorativa para tecnologias assistivas; o botão nativo
recebe o nome dinâmico
`Abrir controles de acessibilidade` ou `Fechar controles de acessibilidade`
junto de `aria-expanded` e `aria-controls`.

O acionador representa o produto, não a implementação atual do painel. O painel
continua sendo o primeiro módulo e pode evoluir depois para uma central sem
mudar o ponto de entrada aprendido pelo usuário. Não adicionar arrastar,
desaparecimento automático, gestos ocultos, solicitação externa do ícone ou nova
dependência nesta mudança.

## Risco e validação

Os testes automatizados verificam o identificador local do ícone, o traçado
preenchido, a semântica decorativa, o estado expandido, o nome acessível
dinâmico, a ausência de texto visível e o comportamento preservado do controle.
A compilação de produção e a inspeção do pacote móvel devem continuar aprovadas.

Como o reconhecimento de forma e ícone envolve percepção visual e tecnologia
assistiva, continua obrigatória uma etapa em iPad físico antes do lançamento
estável: conferir orientação vertical e horizontal, Split View, posicionamento
à esquerda e à direita, temas claro e escuro, toque, foco do teclado, anúncio do
VoiceOver e retorno do foco.

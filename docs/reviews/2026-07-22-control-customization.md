# Code review — personalização do controle flutuante

Data: 2026-07-22

## Escopo

- dois eixos persistentes de posicionamento, com seis combinações;
- escalas intrínsecas Mínima (50%), Média (100%) e Grande (150%);
- repouso semitransparente do acionador após dois segundos;
- organização da tela de configuração;
- mínimo comum de 32 px em leitura e edição para os três perfis.

## Resultado da revisão

Nenhum bloqueador permaneceu. A revisão encontrou e corrigiu uma condição de
corrida: se o painel fosse aberto por teclado e fechado antes do próximo quadro,
o foco adiado ainda poderia acordar o acionador e cancelar o temporizador de
repouso. O callback agora confirma que o painel continua aberto antes de
posicionar ou mover o foco.

A escala usa dimensões intrínsecas e mantém CSS e geometria de ponteiro na mesma
proporção; não usa `zoom` nem transformação global. A escala Mínima preserva
captura vertical de 24 px para o polegar, mas continua abaixo dos 44 pt
recomendados pela Apple para toque confortável. Grande permanece como padrão.

O temporizador é cancelado na desmontagem e na desativação. Movimento e
transparência respeitam as preferências correspondentes do sistema. Nenhum dado
é escrito nas notas e o pacote móvel não contém Node.js ou Electron.

## Evidência automatizada

- `npm run check`: lint, 58 testes, TypeScript, build e inspeção móvel aprovados;
- pacote móvel: 25.703 bytes;
- `git diff --check`: aprovado.

## Evidência visual renderizada

Inspeção no Chrome headless em 2026-07-22:

| Cena | Resultado | SHA-256 |
| --- | --- | --- |
| configuração e três estados do acionador | grupos legíveis; Grande, Média e Mínima proporcionais; repouso visível | `833ee0e235b11cb2fe1461b7278f84d93ea640bd70730ee1d997088f2d9a3c6d` |
| seis combinações de posição | duas laterais × três alturas permanecem dentro da nota | `ba8b46e316524a3eb51f05076ebecf355f97952821971b74d7c130deaf518676` |
| painéis completos nas três escalas | acionadores internos, slider, trilho, polegar e espaçamentos escalam juntos | `a7ce63d3fbd85d7f562c687b17ef60d9ab812615dbf2aa04d4998270db898dff` |
| valores representativos do slider | máximos, intermediários, mínimos e compacto alinhados com desvio horizontal de 0,00 px | `6c31fa9f0ee2bf728f0f6b4f86985ef65d5a7510185426f42997d4246783e970` |

## Etapa humana pendente

Antes do lançamento, validar em iPad físico retrato, paisagem e Split View:
toque nas três escalas, VoiceOver, foco, áreas seguras, fechamento externo,
repouso de dois segundos e preferência de redução de transparência.

# Revisão — slider com geometria única

Data: 21 de julho de 2026.

## Escopo

- primeiro arrasto diretamente para baixo;
- alinhamento horizontal entre trilho e puxador;
- valores máximo, intermediário e mínimo;
- altura compacta;
- preservação do range nativo para teclado e tecnologia assistiva.

## Verificação automatizada

`npm run check` foi aprovado com 31 testes. Os testes de interação iniciam o
ponteiro no puxador em 55 px e enviam como primeiro movimento um deslocamento para
baixo; o valor diminui sem movimento preparatório. O mesmo cenário é repetido em
65 px.

## Verificação visual renderizada

O arquivo [`tests/visual/slider-harness.html`](../../tests/visual/slider-harness.html)
foi renderizado no Google Chrome em uma janela de 900 × 520 px. Foram
inspecionados:

- máximo, 75 px;
- intermediário, 55 px;
- mínimo, 32 px;
- estado compacto, 180 px de altura.

Nos quatro estados, a medição por `getBoundingClientRect()` encontrou **0,00 px**
de diferença entre os centros horizontais do trilho e do puxador. A captura
renderizada tinha SHA-256
`f8efde364a50912f2a34bdc03eaa2a457a3e3f725ed7e79d9a1d6ed86d3d0d89`.

Também foi tentada uma sessão automatizada no Safari/WebKit, mas o Safari local
está com “Permitir automação remota” desativado. Nenhuma configuração do usuário
foi alterada. A geometria agora usa elementos CSS comuns, sem pseudo-elementos
do range, reduzindo a variação entre Blink e WebKit; ainda assim, o ensaio físico
no iPad continua obrigatório para toque e VoiceOver.

## Resultado

O portão visual em navegador foi aprovado. O lançamento deve permanecer como
pré-lançamento até a confirmação do primeiro arrasto para baixo e do alinhamento
no iPad físico.

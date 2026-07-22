# Revisão — mínimo unificado de 32 px

Data: 22 de julho de 2026.

## Escopo

- mínimo de 32 px nos perfis Apresentação, Preparação e Pesquisa;
- mesma disponibilidade em Leitura e edição;
- máximos preservados em 75 px e 60 px;
- valores padrão inalterados;
- nenhum novo acesso à nota, Node.js ou Electron.

## Verificação automatizada

`npm run check` foi aprovado com 36 testes. A cobertura confirma:

- normalização de Leitura e edição em 32 px para cada um dos três perfis;
- clamp de Leitura em 32–75 px;
- clamp de edição em 32–60 px;
- atributos `min="32"` do controle nos dois modos;
- compilação TypeScript e pacote de produção;
- pacote móvel sem Node/Electron e sem rotas de escrita em notas.

## Verificação visual renderizada

O arquivo [`tests/visual/slider-harness.html`](../../tests/visual/slider-harness.html)
foi renderizado no Google Chrome em uma janela de 1280 × 920 px, com perfil de
navegador temporário e sem usar o perfil pessoal. Foram inspecionados:

- Leitura em 75, 55 e 32 px;
- edição em 60, 50 e 32 px;
- estado compacto de edição em 50 px.

Nos sete estados, o puxador permaneceu alinhado ao trilho com desvio horizontal
de **0,00 px**. Os mínimos de Leitura e edição apareceram corretamente na parte
inferior. A captura renderizada tinha SHA-256
`6c31fa9f0ee2bf728f0f6b4f86985ef65d5a7510185426f42997d4246783e970`.

## Resultado e portão humano

Os portões automatizado e visual em navegador foram aprovados. O ensaio físico
no iPad continua necessário antes de declarar validada a experiência de toque e
VoiceOver em 32 px nos três perfis, em retrato, paisagem e Split View.

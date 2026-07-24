# Revisão — cor única do destaque

Data: 2026-07-24

Escopo: permitir uma única cor configurável para `==texto==`, sem alterar o
Markdown, a versão do plugin ou as dependências.

## Resultado

A revisão não deixou bloqueios de código. A preferência é opcional, normalizada
e limitada à folha Markdown ativa. O estado padrão continua obedecendo ao tema;
o botão **Usar cor do tema** remove a sobreposição.

Leitura, Visualização ao vivo e a assinatura do marcador usam a mesma cor.
Resultados de busca conservam sua apresentação própria. O texto do destaque
usa preto ou branco, conforme o maior contraste calculado.

## Problemas prevenidos durante a revisão

1. **Migração destrutiva:** o incremento do esquema para `4` inicialmente
   poderia repetir a importação do Style Settings. A condição foi separada:
   dados do esquema `3` são normalizados sem reimportar valores visuais antigos.
2. **Escopo amplo demais:** aplicar `--text-highlight-bg` na folha inteira
   também recoloriria busca. O token agora é reancorado somente em `<mark>` e
   nos spans nativos do destaque; o span de busca é excluído.
3. **Contraste variável:** conservar `--text-normal` poderia falhar com cores
   arbitrárias. A implementação escolhe automaticamente preto ou branco e
   desativa o modo de mistura no destaque personalizado.
4. **Resíduo entre folhas:** classe e variáveis são removidas ao desmontar,
   trocar de folha, restaurar o tema ou descarregar o plugin.
5. **Nome acessível:** o `input[type=color]` criado pelo componente público
   recebe `aria-label="Escolher cor do destaque"` e referência à descrição; a
   restauração usa botão textual nativo.

## Evidência visual no navegador

O próprio `styles.css` foi renderizado com Leitura, Visualização ao vivo,
assinatura do marcador e um resultado de busca sentinela.

| Cor | Fundo calculado | Texto | Contraste | Busca |
| --- | --- | --- | ---: | --- |
| amarelo | `rgb(255, 208, 0)` | preto | `14,27:1` | preservada |
| azul | `rgb(29, 78, 216)` | branco | `6,70:1` | preservada |
| roxo | `rgb(91, 33, 182)` | branco | `8,98:1` | preservada |
| cinza limítrofe | `rgb(119, 119, 119)` | preto | `4,69:1` | preservada |

Nos temas claro e escuro, Leitura, editor e assinatura calcularam o mesmo
fundo. Ao restaurar o tema, a classe personalizada foi removida e reapareceram
os fundos nativos semitransparentes de `42%` e `48%`.

As larguras de `1024`, `744` e `390 px` foram inspecionadas. Não houve overflow
horizontal; a linha de configuração passa para uma coluna no estado mais
estreito, preservando seletor e botão.

O harness auditável está em
[`tests/visual/highlight-color-harness.html`](../../tests/visual/highlight-color-harness.html).

## Evidência automatizada

- `npm ci`: concluído com npm `11.11.0`;
- `npm run check`: ESLint, 113 testes em 10 arquivos, TypeScript, build e
  inspeção móvel concluídos;
- bundle: `44.533` bytes, sem Node/Electron e com escrita restrita a
  `Vault.process()`;
- `git diff --check`: concluído.

Os testes específicos cobrem:

- normalização e migração do esquema;
- persistência pelo store;
- cálculo de contraste em seis cores;
- montagem, troca de folha e limpeza;
- seletores de Leitura e Visualização ao vivo;
- exclusão explícita do resultado de busca;
- ausência de cor fixa ou regra global.

## Compatibilidade e gate humano

O runtime móvel não ganha Node.js, Electron nem nova rota de escrita na nota.
A alteração de cor não participa de `Vault.process()`; somente o marcador e a
borracha já existentes escrevem `==`.

Antes de lançamento, executar a matriz física registrada em
[`RESEARCH-highlight-color-2026-07.md`](../RESEARCH-highlight-color-2026-07.md),
incluindo seletor nativo, persistência, VoiceOver, dedo e Apple Pencil.

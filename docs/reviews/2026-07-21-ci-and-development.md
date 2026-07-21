# Revisão de código: integração contínua e fluxo de desenvolvimento

## Resumo

A mudança adiciona uma matriz de verificação somente para leitura no GitHub
Actions, torna explícita e portátil a instalação em cofre isolado, documenta a
reversão e conclui o Marco 0 sem alterar a execução do plugin nem os arquivos do
lançamento.

## Problemas críticos

Nenhum.

## Resolvido durante a revisão

O primeiro rascunho do fluxo executava o verificador imutável de hashes da
versão `0.1.1` em toda mudança futura. Isso rejeitaria incorretamente uma versão
posterior legítima. O fluxo agora executa o processo geral completo e confere se
os arquivos gerados correspondem aos registrados pela mudança atual. O
verificador da referência histórica continua sendo um comando explícito de
auditoria da migração.

O primeiro rascunho de reversão também mencionava o verificador na tag `0.1.1`,
onde o script ainda não existia. A reversão agora usa comparação direta de
SHA-256 com os hashes aprovados e documentados.

A primeira execução remota da matriz foi aprovada no Node.js 24, mas o npm 10
no Node.js 20 e 22 rejeitou o arquivo de dependências arquivado ao tentar
introduzir o esbuild 0.28 para o intervalo de pares do Vite. O fluxo agora
instala o npm `11.11.0` registrado antes de `npm ci` em todas as versões do
Node. Isso corrige a divergência da ferramenta sem mudar o grafo de dependências
nem o pacote aprovado.

## Dimensões da revisão

### Segurança

- As permissões do fluxo se limitam à leitura do conteúdo do repositório.
- As ações de terceiros são ações oficiais do GitHub fixadas em SHAs imutáveis correspondentes a `checkout@v6` e `setup-node@v6`.
- Nenhum segredo do repositório, escrita em lançamentos, escrita de cache além do cache npm do setup-node nem evento privilegiado é usado.
- O instalador de testes exige um cofre explícito com diretório `.obsidian/` existente e copia somente os três arquivos públicos do lançamento.

### Correção

- A integração contínua cobre Node.js 20, 22 e 24 com npm `11.11.0` e executa instalação, lint, testes, TypeScript, compilação de produção, inspeção móvel e verificação de divergência dos arquivos gerados.
- Uma instalação temporária em cofre isolado reproduziu os três hashes aprovados.
- README, contrato de trabalho, roteiro, instruções de desenvolvimento e transição imutável descrevem estados coerentes do projeto.

### Desempenho

- A matriz possui três tarefas limitadas, com cache npm e sem compilação ou implantação redundante de lançamento.
- O instalador copia três arquivos pequenos uma vez e não varre diretórios.

### Manutenção

- O caminho do cofre de testes é fornecido por argumento ou `OBSIDIAN_TEST_VAULT`; nenhuma referência ao projeto privado arquivado permanece nas ferramentas públicas.
- A integração contínua geral não codifica dependência permanente dos hashes da versão `0.1.1`.
- A conclusão do roteiro aponta para evidências de pesquisa, migração e reprodução, sem depender do histórico da conversa.

## Veredito

Aprovado. A execução `29852766796` do GitHub Actions passou por todo o processo
e pela verificação de divergência dos arquivos em Node.js 20, 22 e 24 com npm
`11.11.0`.

Validação local: `npm ci`, `npm run check`, `npm run verify:baseline`, instalação
em cofre isolado de testes, comparação SHA-256 dos arquivos e
`git diff --check`.

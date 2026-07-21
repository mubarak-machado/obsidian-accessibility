# Pesquisa sobre a migração do código-fonte TypeScript

Data da pesquisa: 2026-07-21.

## Decisão

Migrar o retrato TypeScript autorizado pelo mantenedor da versão `0.1.1` para a
raiz do repositório público sem alterar comportamento, dependências, metadados
do lançamento nem arquivos distribuíveis. Preservar o arquivo de dependências e
as versões das ferramentas até comparar uma compilação de clone limpo com os
arquivos aprovados.

A migração adota a estrutura oficial vigente do repositório, mas não atualiza o
código-fonte arquivado para APIs mais novas nem introduz código de outro plugin.

## Fontes avaliadas

| Fonte | Commit avaliado | Licença | Evidência móvel | Classificação e conclusão |
|---|---|---|---|---|
| [Plugin de exemplo do Obsidian](https://github.com/obsidianmd/obsidian-sample-plugin/tree/23c165fd362d4049330cb3edad6a52914ff2007a) | `23c165fd362d4049330cb3edad6a52914ff2007a` | 0BSD | `manifest.json` possui `isDesktopOnly: false`; a compilação gera CommonJS para `es2021` e mantém externos os módulos do Obsidian e da execução | **adotar** a estrutura raiz com `src/`, TypeScript, esbuild, ESLint, manifesto e arquivo de dependências; **rejeitar** mudanças no grafo de dependências arquivado durante a migração |
| [Registro de lançamentos do Obsidian](https://github.com/obsidianmd/obsidian-releases/tree/df00d76b5ddc5c90595fec38c54ef00102d61076) | `df00d76b5ddc5c90595fec38c54ef00102d61076` | repositório sem licença; referência apenas de política e dados | a compatibilidade é selecionada por `manifest.json` e `versions.json`; a instalação baixa `manifest.json`, `main.js` e `styles.css` de um lançamento correspondente | **adotar** o contrato de lançamento e compatibilidade; nenhum código-fonte é copiado |
| [Guia de desenvolvimento do BRAT](https://github.com/TfTHacker/obsidian42-brat/blob/e0908d3b8bf83397abcca3c70106c2236b861d71/BRAT-DEVELOPER-GUIDE.md) | `e0908d3b8bf83397abcca3c70106c2236b861d71` | MIT | o BRAT `2.2.0` possui `isDesktopOnly: false` e instala os arquivos correspondentes do lançamento no GitHub | **adaptar** o contrato de verificação do lançamento; o BRAT continua sendo canal de distribuição, não dependência de execução |
| [Note Toolbar](https://github.com/chrisgurney/obsidian-note-toolbar/tree/34e91c21565b2a9a790e9027b4619d16cdf7880f) | `34e91c21565b2a9a790e9027b4619d16cdf7880f` | GPL-3.0 | a versão `1.34.11` declara `isDesktopOnly: false` | **adaptar apenas conceitos** para o ciclo de vida da folha ativa, áreas seguras e interface flutuante contida; nenhum código GPL é copiado |
| [Mobile Pinch Zoom](https://github.com/hata-suriiken/obsidian-mobile-pinch-zoom/tree/8fe3152eb82c2084fbb847e1c445312145134b66) | `8fe3152eb82c2084fbb847e1c445312145134b66` | MIT | a versão `0.6.1` declara `isDesktopOnly: false` e oferece suporte explícito a iPad, iPhone e Android | **adaptar** os conceitos já aprovados de agendamento, espera e ancoragem da rolagem; gestos de pinça permanecem fora da versão `0.1.1` e nenhuma dependência é adicionada |

## Procedência do código-fonte autorizado

A fonte oficial é o projeto privado arquivado no commit
`49a5e8583c97bd4d94be41d1e01c1923e8c6a993`. A implementação do plugin foi
alterada pela última vez em `ce8bea637a55764b2894d03cfb431287762cbb7c`;
mudanças posteriores apenas ampliaram o README do arquivo histórico. O retrato
autorizado de `plugin/` contém:

- oito módulos TypeScript em `src/`;
- três conjuntos Vitest, com 15 casos aprovados e uma simulação do Obsidian;
- `package.json`, `package-lock.json` e configurações do TypeScript, ESLint, Vitest e esbuild;
- scripts do pacote móvel e do cofre isolado de testes;
- `manifest.json`, `styles.css` e `versions.json` aprovados.

A referência pública `0.1.1` corresponde aos hashes aprovados e arquivados:

| Arquivo | SHA-256 |
|---|---|
| `main.js` | `97c1a6090b32f5a42813b89c560a6046b15da034ee017feaf7bb678c044c6ca0` |
| `manifest.json` | `395f7f350b53e06b98e6b8cadd08693ba914db06d091ba3e30af57213271d9cb` |
| `styles.css` | `464e5cb687f810c238510f8052f416687085a113540f20d70a4fd01b953799d4` |

## Restrições da migração

1. Copiar o retrato autorizado para pastas convencionais na raiz; não derivar o código-fonte do `main.js` empacotado.
2. Manter a versão `0.1.1` do pacote e do manifesto, `isDesktopOnly: false` e o arquivo de dependências existente sem alterações.
3. Manter aparência no CSS e comportamento no TypeScript.
4. Preservar a raiz limitada à folha ativa, a limpeza completa do ciclo de vida,
   a âncora de leitura, as áreas seguras, o movimento reduzido, o foco, os alvos
   de toque e o posicionamento à esquerda ou à direita.
5. Tornar `npm ci`, seguido de `npm run check`, o caminho de validação do clone limpo.
6. Comparar todos os arquivos distribuíveis recompilados com os hashes aprovados
   e explicar qualquer diferença inevitável antes de adicionar integração contínua.

## Alternativas rejeitadas

- Engenharia reversa de `main.js`: perderia a intenção do código-fonte e violaria o requisito de procedência da transição.
- Começar pelo plugin de exemplo e recriar o comportamento: desnecessário e sujeito a divergir da compilação aprovada no iPad.
- Atualizar dependências durante a migração: mistura reprodutibilidade com atualização e torna ambíguas as diferenças nos arquivos.
- Adotar Note Toolbar ou Mobile Pinch Zoom como dependências: ambos são mais amplos que o controle necessário, e a licença GPL do Note Toolbar é incompatível com a cópia de código para este repositório MIT sem mudar as obrigações.

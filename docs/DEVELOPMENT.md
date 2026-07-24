# Desenvolvimento, instalação de teste e reversão

## Ambiente de desenvolvimento compatível

A integração contínua valida o Node.js 20, 22 e 24 em executores Linux
independentes do macOS. Use uma versão atual desse intervalo com o npm
`11.11.0`, versão registrada em `packageManager`, e o arquivo de dependências
do npm presente no repositório.

```bash
npm install --global npm@11.11.0
npm ci
npm run check
```

O npm 10 rejeita o grafo de dependências arquivado porque tenta resolver
novamente a dependência de par mais recente do esbuild para o Vite. O npm 11
instala o arquivo aprovado sem alterar dependências; o pacote de produção
permanece idêntico, byte por byte, ao da versão `0.1.1`.

`npm run check` executa o ESLint, a suíte do Vitest, a compilação estrita do
TypeScript, o pacote de produção do esbuild e a inspeção do pacote móvel,
incluindo a restrição da escrita de anotações a `Vault.process()`.
Durante a verificação da migração, execute também:

```bash
npm run verify:baseline
git diff --check
```

## Ciclo de desenvolvimento

Execute a compilação contínua na raiz do repositório:

```bash
npm run dev
```

A compilação grava `main.js` na raiz do repositório. O código-fonte deve ficar
em `src/`, os testes em `tests/`, o comportamento em TypeScript e a aparência
em `styles.css`.

## Instalação em um cofre isolado de testes

Não use o cofre pessoal principal no desenvolvimento rotineiro. Crie ou escolha
um cofre isolado do Obsidian, abra-o uma vez para que `.obsidian/` exista e,
depois, execute:

```bash
npm run build
npm run install:test -- /absolute/path/to/test-vault
```

O instalador se recusa a funcionar sem um cofre informado explicitamente e um
diretório `.obsidian/` existente. Ele copia apenas `main.js`, `manifest.json` e
`styles.css` para `.obsidian/plugins/obsidian-accessibility/`; não copia, lê nem
modifica notas.

No Obsidian, recarregue o aplicativo, ative **Obsidian Accessibility** e
verifique a ativação, a desativação, as mudanças da folha ativa, o modo de
Leitura e a Pré-visualização em tempo real. Alterações de aparência, toque,
orientação, área segura, foco, VoiceOver ou posição ainda exigem validação em um
iPad físico antes do lançamento estável.

## Reversão de uma instalação de desenvolvimento

1. Desative **Obsidian Accessibility** no cofre de testes.
2. Preserve `data.json` se as configurações salvas do desenvolvimento forem necessárias.
3. Substitua apenas `main.js`, `manifest.json` e `styles.css` pelos arquivos do
   [lançamento imutável 0.1.1](https://github.com/mubarak-machado/obsidian-accessibility/releases/tag/0.1.1), ou deixe o BRAT reinstalar essa versão.
4. Confira os arquivos restaurados com `shasum -a 256` e a tabela abaixo;
   depois, recarregue e reative o plugin.

Hashes aprovados para reversão:

| Arquivo | SHA-256 |
|---|---|
| `main.js` | `97c1a6090b32f5a42813b89c560a6046b15da034ee017feaf7bb678c044c6ca0` |
| `manifest.json` | `395f7f350b53e06b98e6b8cadd08693ba914db06d091ba3e30af57213271d9cb` |
| `styles.css` | `464e5cb687f810c238510f8052f416687085a113540f20d70a4fd01b953799d4` |

O plugin armazena as preferências em seu próprio `data.json`. Nem a instalação
nem a reversão gravam preferências visuais no Markdown ou no frontmatter.

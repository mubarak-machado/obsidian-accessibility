# Registro de reprodutibilidade da versão 0.1.1

Data da validação: 2026-07-21.

## Resultado

A versão `0.1.1` é reproduzível a partir de um clone limpo. Nenhuma diferença
de comportamento, aparência, metadados ou arquivos foi encontrada após a
migração autorizada do código-fonte TypeScript.

## Procedimento com clone limpo

O ramo público `main`, no commit de migração do código-fonte `f176807`, foi
clonado em um novo diretório temporário. Os comandos a seguir foram concluídos
com sucesso:

```bash
npm ci
npm run check
shasum -a 256 main.js manifest.json styles.css
git status -sb
```

Os hashes resultantes foram registrados em
`scripts/verify-release-baseline.mjs`. Depois da inclusão desse verificador,
`npm ci`, `npm run check` e `npm run verify:baseline` voltaram a ser aprovados
no repositório de trabalho.

Ambiente usado na execução registrada:

- Node.js `v25.8.0`;
- npm `11.11.0`;
- 362 pacotes instalados;
- nenhuma vulnerabilidade informada pelo `npm audit`;
- árvore de trabalho limpa após a compilação de produção.

## Evidências do processo

- ESLint: aprovado;
- Vitest: 3 arquivos e 15 casos aprovados;
- TypeScript: compilação estrita sem emissão aprovada;
- esbuild: compilação de produção aprovada;
- inspeção móvel: aprovada, sem dependência de Node.js/Electron na execução nem
  rota de escrita em notas;
- `main.js` de produção: 17.543 bytes.

## Comparação dos arquivos

| Arquivo | SHA-256 aprovado | SHA-256 do clone limpo | Resultado |
|---|---|---|---|
| `main.js` | `97c1a6090b32f5a42813b89c560a6046b15da034ee017feaf7bb678c044c6ca0` | `97c1a6090b32f5a42813b89c560a6046b15da034ee017feaf7bb678c044c6ca0` | idêntico |
| `manifest.json` | `395f7f350b53e06b98e6b8cadd08693ba914db06d091ba3e30af57213271d9cb` | `395f7f350b53e06b98e6b8cadd08693ba914db06d091ba3e30af57213271d9cb` | idêntico |
| `styles.css` | `464e5cb687f810c238510f8052f416687085a113540f20d70a4fd01b953799d4` | `464e5cb687f810c238510f8052f416687085a113540f20d70a4fd01b953799d4` | idêntico |

## Diferenças

Nenhuma. O arquivo de dependências arquivado, o código-fonte, os testes, a
configuração de compilação, o manifesto, os estilos e as versões foram
transferidos sem mudanças de dependência ou versão.

## Escopo da validação física

A migração não altera aparência, comportamento de toque, orientação, áreas
seguras, foco, semântica do VoiceOver nem posição do controle. Portanto, não
cria uma nova etapa de validação em iPad físico. O arquivo de execução aprovado
da versão `0.1.1` é exatamente o mesmo já validado no iPad; o VoiceOver continua
sendo a lacuna documentada para uma nova validação humana em um lançamento
comportamental posterior.

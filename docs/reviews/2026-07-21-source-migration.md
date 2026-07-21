# Revisão de código: migração autorizada do código-fonte TypeScript

## Resumo

A mudança transfere o código-fonte, os testes, o arquivo de dependências, os
scripts e a configuração de compilação autorizados da versão `0.1.1` para a
raiz do repositório público. O pacote recompilado é idêntico, byte por byte, ao
arquivo aprovado do lançamento.

## Problemas críticos

Nenhum.

## Dimensões da revisão

### Segurança

- O código de execução não possui execução dinâmica de código, inserção insegura de HTML, tratamento de credenciais nem acesso à rede.
- O pacote de produção não contém dependência de Node.js ou Electron nem rota de escrita em notas por `processFrontMatter`, `fileManager.processFrontMatter` ou `vault.modify`.
- `npm audit --audit-level=high` informa nenhuma vulnerabilidade.

### Desempenho

- A aplicação da escala é agrupada por `requestAnimationFrame`.
- As configurações persistidas usam espera limitada de 180 ms, cancelando o temporizador anterior antes de reagendar.
- Os ouvintes de eventos pertencem a um `AbortController`; quadros de animação, observadores, assinaturas, raízes do DOM, classes e variáveis CSS são removidos na desmontagem.

### Correção

- Configurações persistidas inválidas são normalizadas para valores seguros e limitados.
- Os intervalos de leitura e edição permanecem, respectivamente, em 32–75 px e 40–60 px.
- O controle é montado somente na visualização Markdown ativa, e o controle vertical nativo preserva o comportamento aprovado de mínimo na parte inferior.
- Três arquivos Vitest passam pelos 15 casos aprovados.
- A compilação de produção possui 17.543 bytes e corresponde ao SHA-256 aprovado de `main.js`: `97c1a6090b32f5a42813b89c560a6046b15da034ee017feaf7bb678c044c6ca0`.

### Manutenção

- Estado, controle do DOM, posicionamento, ancoragem da leitura, integração do ciclo de vida e interface de configurações continuam em módulos separados.
- A aparência continua em `styles.css`; o comportamento de execução permanece em TypeScript.
- As versões de ferramentas e dependências são preservadas pelo arquivo arquivado, sem atualização durante a migração.

## Acompanhamento não impeditivo

A cobertura direta de integração do ciclo de vida do Obsidian e de
`ReadingAnchor` aumentaria a confiança em refatorações posteriores. Ela não foi
adicionada intencionalmente a esta migração porque a tarefa aprovada proíbe
misturar transferência do código-fonte com mudanças comportamentais ou
refatorações.

## Veredito

Aprovado.

Validação: `npm ci`, `npm run check`, `npm audit --audit-level=high` e
`git diff --check`.

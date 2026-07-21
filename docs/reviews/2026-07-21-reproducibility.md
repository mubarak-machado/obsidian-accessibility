# Revisão de código: verificação de reprodutibilidade da versão 0.1.1

## Resumo

A mudança adiciona um verificador SHA-256 determinístico para os três arquivos
aprovados do lançamento e registra a evidência de reprodução em clone limpo.

## Problemas críticos

Nenhum.

## Resolvido durante a revisão

O primeiro rascunho dava a entender que o novo verificador havia sido executado
no commit `f176807`, antes de o script existir. O registro agora distingue a
comparação manual original de hashes da verificação automatizada posterior.

## Dimensões da revisão

- **Segurança:** o script lê apenas três arquivos do repositório, calcula
  SHA-256 localmente e não possui acesso à rede, execução de processos nem rota
  de escrita.
- **Correção:** cada arquivo esperado é identificado pelo nome; qualquer
  divergência define código de saída de falha e informa os hashes esperado e real.
- **Desempenho:** o verificador lê aproximadamente 25 KB no total e funciona uma vez; o uso de recursos é limitado.
- **Manutenção:** a verificação da referência é um comando explícito, não parte da verificação geral do desenvolvimento futuro, evitando obrigar versões posteriores a reproduzir acidentalmente a `0.1.1`.

## Veredito

Aprovado.

Validação: `npm ci` e `npm run check` em clone limpo, comparação manual SHA-256,
`npm run verify:baseline` e `git diff --check`.

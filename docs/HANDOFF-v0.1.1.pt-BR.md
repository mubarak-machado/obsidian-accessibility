# Transição de desenvolvimento da versão 0.1.1

> Tradução para português do Brasil do registro histórico imutável
> [`HANDOFF-v0.1.1.md`](HANDOFF-v0.1.1.md). Em caso de divergência, o arquivo
> original preservado continua sendo a evidência canônica.

## Finalidade

A versão `0.1.1` foi instalada pelo BRAT e aprovada no macOS e no iPad. Ela é a
referência visual e comportamental.

Naquele momento, o repositório continha apenas os arquivos distribuíveis. O
código-fonte TypeScript aprovado, os testes e as ferramentas de compilação
precisavam ser migrados antes de qualquer mudança funcional.

## Referência validada

| Item | Valor aprovado |
|---|---|
| Plugin | `0.1.1` |
| Obsidian | `1.12.7` no macOS e iPad |
| Obsidian mínimo | `1.12.0` |
| Manifesto | `isDesktopOnly: false` |
| iPad | iPad Pro de 11 polegadas M2, iPadOS 26.5 |
| Pacote | 17.543 bytes |
| Testes | 3 arquivos, 15 casos |
| Auditoria de dependências | nenhuma vulnerabilidade conhecida em 2026-07-21 |
| Lançamento | [`0.1.1`](https://github.com/mubarak-machado/obsidian-accessibility/releases/tag/0.1.1) |

### Hashes aprovados dos arquivos

| Arquivo | SHA-256 |
|---|---|
| `main.js` | `97c1a6090b32f5a42813b89c560a6046b15da034ee017feaf7bb678c044c6ca0` |
| `manifest.json` | `395f7f350b53e06b98e6b8cadd08693ba914db06d091ba3e30af57213271d9cb` |
| `styles.css` | `464e5cb687f810c238510f8052f416687085a113540f20d70a4fd01b953799d4` |

Os hashes correspondiam à compilação aprovada, à instalação no macOS e a um
download independente do lançamento.

## Primeira tarefa obrigatória: migrar o código-fonte

1. Pesquisar o [plugin de exemplo atual do Obsidian](https://github.com/obsidianmd/obsidian-sample-plugin) e plugins móveis comparáveis.
2. Obter o retrato TypeScript arquivado e autorizado pelo mantenedor que gerou a versão `0.1.1`; não tratar `main.js` reconstruído por engenharia reversa como código-fonte.
3. Transferir código-fonte, testes, arquivo de dependências, scripts e configuração de compilação para este repositório.
4. Preferir pastas convencionais na raiz, como `src/`, `tests/` e `scripts/`, conforme a orientação oficial vigente.
5. Não alterar comportamento, CSS, dependências, versão do manifesto nem arquivos do lançamento durante a migração.
6. Executar todo o processo de verificação e recompilar os arquivos distribuíveis.
7. Comparar os hashes recompilados com a referência e explicar toda diferença.
8. Adicionar integração contínua somente depois de comprovar a reprodutibilidade local.
9. Registrar a migração separadamente das melhorias posteriores.

## Arquitetura preservada

```text
main
  ├── ScaleStore: esquema, normalização, persistência e migração
  ├── ScaleController: variáveis CSS e ciclo de vida da folha ativa
  ├── FontScaleControl: botão, painel e tratamento de entradas
  ├── positioning: lado, contenção e áreas seguras
  ├── reading-anchor: preservação da posição ao aplicar escala
  └── settings model/tab: preferências e validação
```

- `onload()` registra comandos e monta uma raiz na folha Markdown ativa.
- `onunload()` remove raiz, ouvintes, temporizadores, observadores, classes e variáveis CSS.
- O TypeScript controla o comportamento; o CSS controla a aparência.
- Um controle HTML nativo é girado para oferecer comportamento vertical confiável.
- O pacote móvel é inspecionado em busca de imports de Node/Electron e rotas de escrita em notas.

## Comportamentos que não podem regredir

- Leitura e Pré-visualização em tempo real mantêm tamanhos independentes.
- O controle admite posicionamento à esquerda e à direita.
- Somente o botão permanece visível enquanto o painel está fechado.
- O painel aberto se sobrepõe ao botão e nunca reorganiza a nota.
- O mínimo fica na parte inferior e o máximo na parte superior.
- O polegar permanece centralizado e mantém espaço nas duas extremidades.
- `+` e `−` ficam alinhados verticalmente.
- O valor e o `Reset` textual da referência compartilham tipografia e peso visual.
- Interação externa e `Escape` fecham o painel.
- A aplicação de escala preserva a posição e nunca modifica a nota.
- Desativação e recarga não deixam interface nem estilo residuais.

## Limites conhecidos

- O VoiceOver não possuía um registro humano final separado e precisava ser revalidado explicitamente.
- O plugin não estava no catálogo oficial da comunidade do Obsidian.
- Futuras versões do Obsidian e iPadOS exigem nova pesquisa de compatibilidade.
- Modo de apresentação, proteção da edição, integração com a barra de ferramentas e auxílios avançados de leitura eram trabalhos futuros.

## Etapa de transição bem-sucedida

A migração só estaria completa quando um clone limpo executasse todas as
verificações, o TypeScript se tornasse a fonte oficial, os arquivos de produção
fossem gerados, o comportamento correspondesse à versão `0.1.1`, as diferenças
de hash fossem aceitas explicitamente e o commit de migração não contivesse
mudança funcional nem visual.

Prosseguir com o [roteiro](ROADMAP.md) somente depois dessa etapa.

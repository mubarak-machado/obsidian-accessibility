# Pesquisa — slider vertical nativo no iPad

Data da revisão: 21 de julho de 2026.

## Problema observado

No iPad, o primeiro arrasto para baixo não alterava o valor quando o slider
estava em um valor intermediário, como 55 px ou 65 px. Um pequeno movimento para
cima fazia os movimentos seguintes funcionarem. Portanto, o defeito não estava
limitado ao valor mínimo.

O controle era um `input[type="range"]` horizontal girado visualmente em 90°.
Essa transformação alterava a pintura, mas não convertia o controle em um range
vertical para a lógica de toque do WebKit.

## Fontes auditadas

| Fonte | Versão ou revisão | Licença | Compatibilidade móvel | Decisão |
| --- | --- | --- | --- | --- |
| [WebKit — Implementing Vertical Form Controls](https://webkit.org/blog/15190/implementing-vertical-form-controls/) | Safari 17.4, artigo de 18/03/2024; repositório WebKit em `60edc560c7b85a4b258d6ed501459fef5eddcbaa` | Licenciamento do WebKit por componente; nenhum código foi copiado | Declara suporte a `writing-mode` em controles no Safari para iOS e iPadOS desde a versão 17.4 | **Adotar** `writing-mode: vertical-lr` e propriedades lógicas |
| [MDN — input range vertical](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/range#creating_vertical_range_controls) | Conteúdo em `5cf8432d980cbe9b7e5611d647d8566b5c4ff3ed`, modificado em 09/06/2026 | Prosa CC BY-SA 2.5; exemplos CC0 | Recomenda `writing-mode` e documenta `orient="vertical"` para Firefox antigo | **Adaptar** com `direction: rtl` para manter o máximo no topo e com `orient` como compatibilidade adicional |
| [WPT — range-input-vertical-rtl-painting](https://github.com/web-platform-tests/wpt/blob/76301751b3f30d0df50f111a2b6a83f8f82a23a1/css/css-writing-modes/forms/range-input-vertical-rtl-painting.html) | `76301751b3f30d0df50f111a2b6a83f8f82a23a1` | BSD de 3 cláusulas | Teste interoperável de pintura vertical com direção da faixa invertida | **Adotar** a combinação `vertical-lr` + `rtl` |
| [WebKit Bug 266283](https://bugs.webkit.org/show_bug.cgi?id=266283) | Relato público sobre arrasto de `range` focado no iOS | Registro público do WebKit Bugzilla; nenhum código foi copiado | Confirma que o caminho de toque do range no iOS possui comportamento próprio | **Adaptar** como evidência de risco e exigir ensaio físico |
| Rotação CSS do range horizontal | Implementação até 0.4.1 | Código do próprio projeto | A área lógica de interação pode divergir da geometria mostrada no iPad | **Rejeitar** como caminho principal; manter somente em fallback isolado |

## Decisão

O caminho principal usa um range vertical nativo com:

- `writing-mode: vertical-lr`;
- `direction: rtl`, para manter máximo no topo e mínimo embaixo;
- dimensões lógicas `inline-size` e `block-size`;
- `aria-orientation="vertical"` e `orient="vertical"`;
- o mesmo evento nativo `input`, sem um manipulador de ponteiro próprio.

A rotação permanece apenas dentro de `@supports not (writing-mode:
vertical-lr)`. Esse fallback é deliberadamente limitado: versões antigas do
Safari podem reconhecer a propriedade em texto sem oferecer toda a semântica
vertical em controles. O alvo comprovado do caminho principal é Safari 17.4 ou
superior; não será introduzida detecção por versão nem uma simulação manual do
slider, pois ambas aumentariam o risco de acessibilidade.

> **Decisão invalidada no ensaio físico de 21/07/2026.** A versão 0.4.2 manteve
> o problema do primeiro arrasto para baixo e deslocou o puxador para a direita
> do trilho no iPad. A hipótese de que `writing-mode` resolveria também a
> interação de um range extensamente personalizado estava errada. Consulte a
> [pesquisa corretiva](RESEARCH-pointer-driven-slider-2026-07.md).

## Validação

Automatizada:

- redução direta de 55 px para 54 px pelo evento `input`;
- orientação e atributo de compatibilidade expostos no DOM;
- CSS nativo com máximo no topo e rotação restrita ao fallback;
- lint, testes, TypeScript, bundle de produção e inspeção móvel.

No iPad físico, antes de promover o pré-lançamento a estável:

1. testar o primeiro arrasto diretamente para baixo em 55 px e 65 px na
   leitura e em 50 px na visualização ao vivo;
2. testar primeiro arrasto para cima e os dois limites;
3. repetir em retrato, paisagem e Split View;
4. conferir toque, foco e ajuste pelo VoiceOver;
5. confirmar que a nota e a posição de leitura não são modificadas.

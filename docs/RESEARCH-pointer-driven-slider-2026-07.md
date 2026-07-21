# Pesquisa corretiva — interação e pintura independentes do range

Data da revisão: 21 de julho de 2026.

## Evidência que invalidou a correção anterior

A validação física da versão 0.4.2 mostrou dois defeitos:

1. o primeiro arrasto para baixo continuou sem alterar o valor;
2. o puxador personalizado ficou deslocado para a direita do trilho.

A verificação anterior em navegador não reproduziu a estrutura e o tema do
controle com rigor suficiente, e os testes de CSS conferiram apenas a presença
de declarações. Eles não mediram a posição renderizada.

## Fontes auditadas

| Fonte | Versão ou revisão | Licença | Relevância móvel | Decisão |
| --- | --- | --- | --- | --- |
| [WebKit — `SliderThumbElement.cpp`](https://github.com/WebKit/WebKit/blob/60edc560c7b85a4b258d6ed501459fef5eddcbaa/Source/WebCore/html/shadow/SliderThumbElement.cpp) | `60edc560c7b85a4b258d6ed501459fef5eddcbaa` | Licenciamento do WebKit por componente; nenhum código foi copiado | O iOS inicia o arrasto somente após aceitar o toque dentro da caixa calculada do thumb e então converte a coordenada conforme a orientação interna | **Adaptar** a área de toque de aproximadamente 48 px, sem depender do arrasto interno |
| [WebKit Bug 248320](https://bugs.webkit.org/show_bug.cgi?id=248320) | Correção `7275c7c8b394`, WebKit `257002@main` | Registro público; nenhum código foi copiado | Documenta histórico de posicionamento incorreto do thumb com `vertical-lr` e `rtl` | **Rejeitar** a pintura pelo pseudo-elemento nativo para este controle personalizado |
| [Pointer Events Level 3](https://www.w3.org/TR/2026/REC-pointerevents3-20260630/) | Recomendação W3C de 30/06/2026 | Licença permissiva de documentos do W3C | Unifica toque, caneta e mouse e define captura explícita do ponteiro | **Adotar** `pointerdown`, `pointermove`, `pointerup`, `pointercancel` e captura |
| [WAI-ARIA APG — Slider Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/slider/) | Repositório `w3c/aria-practices` em `18c1a2fca626f7aeb33270e23ae9b18833e2164d` | W3C Software and Document License | Alerta que sliders personalizados precisam preservar teclado e tecnologia assistiva de toque | **Adaptar** mantendo o `input[type="range"]` nativo como fonte semântica |

## Solução

- O `input[type="range"]` permanece no DOM, focável e com valor, limites,
  `aria-orientation` e `aria-valuetext` atualizados. Ele continua atendendo
  teclado e VoiceOver.
- Trilho e puxador passam a ser elementos do plugin dentro da mesma régua. Os
  dois usam `left: 50%`, eliminando cálculos internos diferentes do WebKit.
- O toque começa em uma área de 60 px centrada no puxador. O primeiro
  `pointermove`, para cima ou para baixo, calcula o valor diretamente pela
  coordenada vertical e preserva o ponto em que o dedo segurou o puxador.
- `setPointerCapture` mantém o arrasto mesmo quando o dedo sai da largura
  estreita do painel; `pointercancel` e `pointerup` sempre encerram o estado.
- Não há escrita na nota, dependência de Node/Electron no bundle móvel nem
  alteração dos limites aprovados.

## Portões de validação

1. teste automatizado do primeiro movimento diretamente para baixo;
2. teste automatizado de alinhamento estrutural do trilho e puxador;
3. renderização real em navegador nos valores máximo, intermediário e mínimo,
   incluindo altura compacta;
4. medição dos centros horizontais renderizados, com desvio esperado de 0 px;
5. ensaio físico no iPad para toque, VoiceOver, retrato, paisagem e Split View.

O portão visual em navegador é obrigatório antes de qualquer commit ou
lançamento com mudança de interface. Ele não substitui o portão físico do iPad.

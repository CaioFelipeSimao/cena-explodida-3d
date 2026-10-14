# Desempenho no iPhone (Artefato)

## Tela de um toque (obrigatória em Artefato)

No iPhone o quadro do Artefato roda a ~30 fps (mínimo ~24) até receber o primeiro **toque**, depois vai a 60. Medido no app do Claude e no Safari. No PC não acontece. Só o toque acorda; rolar não acorda. O motor abre com um botão em tela cheia ("Toque na tela para começar") que some no `pointerup` (não `scroll`: um gesto de rolagem termina em `pointercancel`). Se o usuário reclamar de "lerdo", **cheque o toque antes** de mexer em qualquer coisa.

## Painel de fps (motor/painel.js)

O motor embute um painel na página: fps, pior fps dos últimos 3 s, atualizações da cena por segundo, triângulos, chamadas de desenho, tamanho da tela, resolução; botões de resolução (1x, 2x, nativa) e suavização do scrub. `#sem-fps` na URL esconde. **Aprove desempenho sempre com ele, na página real rolando, no aparelho.**

Quando o número for ruim, o painel distingue: fps alto com poucas atualizações por segundo = o iPhone entrega poucos eventos de scroll; ambos baixos = custo de desenhar.

## O que aprendemos

- **A sonda que anima por relógio não reproduz o scroll**: deu 60 fps quando a página real estava a 18. Serve para comparar configurações, não para aprovar (`assets/css/sonda-relogio.html`, `sonda-fps.html`).
- **Chave por chave, na página real**: o que resolveu foi a chave "laterais" (número de planos CSS). Zoom por escala ou câmera, suavização, `pin` GSAP ou `sticky`, `normalizeScroll` e vidro não mudaram nada.
- **WebGL eliminou o problema**: relógio com ~18 mil triângulos e 26 chamadas de desenho, fluido a 60 fps no iPhone dentro do Artefato (confirmado pelo usuário). O limite era o CSS 3D, não o app.
- **Quadro do Artefato muda de tamanho depois de carregado no Chrome do PC**: o motor usa `ResizeObserver` e recalcula o ajuste à tela; carregue a janela pequena e cresça para testar.
- A aba do Chrome que você controla pode ficar oculta (`visibilityState: hidden`): os quadros travam e não dá para medir fps. Meça no aparelho real.
- Em Artefato só `#âncora` chega à página, nunca `?consulta`.

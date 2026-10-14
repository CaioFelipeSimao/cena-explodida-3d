# Caminho CSS 3D (só para props de faces planas e poucas peças)

Use este caminho só se o prop for feito de folhas e caixas planas e couber em ~150 camadas (o gibi tem ~30). **Qualquer prop com superfícies curvas, muitas peças ou detalhe vai para WebGL** (`caminho-webgl.md`): no iPhone, dentro do Artefato, o CSS 3D caiu para 30 fps com ~200 camadas e para 18 com ~620. Exemplos completos e testados: `assets/css/exemplo-gibi.html` (9 peças, validado no iPhone) e `assets/css/exemplo-relogio.html` (13 sólidos, ~216 camadas, redondo e detalhado mas no limite). O estilo do gibi (quadrinhos) é só dele: só o motor se reaproveita.

## Por que o CSS 3D cobra caro

Cada plano (lasca, cópia, tampa) é um elemento 3D com camada de composição própria. Medido no iPhone do usuário, rolando de verdade:

| Planos | Resultado |
|---|---|
| ~620 (540 só de lascas) | média 18 fps, mínimo 6 no começo; sem as laterais, 70 fps |
| ~216 | 30 fps |
| ~154 | "melhorou muito", mas o aro ficou com cara de polígono |

A sonda que anima por relógio (sem scroll) deu 60 fps com 620 planos: não pega o problema. Só o painel de fps na página real rolando prova.

## Estrutura de um sólido

Duas tampas detalhadas (`.cap`, nas pontas da espessura) e a espessura entre elas. Escolha a técnica pela espessura:

- **Empilhamento (peça fina, até ~6)**: n cópias achatadas da silhueta (`.meio`, cor da borda), ~1 px uma da outra. De lado parecem uma borda contínua; custam 2 a 4 planos. **Falha vista de lado exatamente**: as cópias viram linhas e a peça "some" (o usuário notou nas engrenagens). Serve só para peça que não gira de lado.
- **Lascas (peça grossa e oca): `casco()` e `tubo()`**: N planos finos em círculo, cada um `rotateZ(a) translateY(-R) rotateX(90deg)`, largura `2R·tan(π/N) + 0.8` (a lasca fica tangente: apótema R). Tubo = parede externa, parede interna (`dentro: true`) e duas bordas em anel.
- **Extrusão por aresta (`bordas`)**: um plano por aresta; perfeita mas custa dezenas por peça.

Regras de acabamento (cada uma custou uma rodada):

- **As tampas do tubo têm que ser o mesmo polígono das lascas** (`poli(R, N)`, vértices a R/cos(π/N)). Tampa circular + lascas tangentes deixa frestas nos vértices.
- **N mínimo para não parecer polígono: 40 por fora e 32 por dentro.** Com 24 e 16 o aro ficou angular.
- **Junção lateral/topo sem vazado**: a lasca avança 0,6 além de cada tampa; as tampas do tubo passam 0,5 do raio por fora e fecham 0,5 a mais o furo; cópias do empilhamento com raio R+0,3; nunca um traço centrado na borda da tampa (desenhe o traço para dentro). Mesmo assim sobra uma linha que muda com o movimento: é inevitável entre camadas independentes.
- **`translate(x, y)` leva `px` nos dois valores.** `translate(12,4px)` é inválido, o navegador descarta a transformação e a lateral fica solta como um risco fino.
- **As costas são projeto**: a câmera dá 360° e as duas tampas aparecem; verso pensado no que existiria ali (pontes, carimbo, gaxeta).
- **Texto que tem que caber**: `textLength` + `lengthAdjust="spacing"`.
- **Sem sombras, filtros, blur nem `will-change`.** Toda peça solta precisa de verso (`.f` e `.b` com `backface-visibility: hidden`).
- **Margin negativa em vez de `%`** para centrar cada peça (`--w`, `--h`); o GSAP só mexe em `x/y/z/rotation*`.

## Duas escalas, nunca uma

O ajuste à tela (`.escala`, refeito no `resize` e por `ResizeObserver`) e o zoom animado (`.zoom`, valores fixos) em elementos diferentes, ambos com `transform-style: preserve-3d`. Se forem a mesma escala, um resize depois do carregamento briga com a timeline e o objeto nasce minúsculo (acontece no Chrome do PC, onde o quadro do Artefato muda de tamanho). Nunca `scale: () => fit()` nem `invalidateOnRefresh`.

## Truque que ajudou pouco

Esconder (`display: none`) as peças internas com o prop montado tira ~20% das camadas sem mudar a imagem, mas não resolve o meio da animação. A parede interna da caixa não pode ser escondida: dá uma sombra que sugere profundidade.

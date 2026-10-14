# Vocabulário de movimento

O movimento de uma cena explodida é escolha por prop. Escolha pela natureza do objeto e combine no máximo dois ou três elementos; movimento demais vira ruído. Cada item abaixo diz onde mexer na tabela `partes` do exemplo e se já foi validado.

**Testados: o gibi (folhas, CSS) e o relógio (mecanismo, CSS e WebGL; seção "Mecanismos" no fim). A tabela "Propostas" é projeto ainda não medido.**

## Validado no gibi

- **Leque de folhas**: as peças empilhadas se afastam em Z e cada uma ganha um `rotationZ` pequeno (±3° na explosão).
- **Deriva alternada**: na fase `d`, cada folha sobe ou desce (`y` ±24) e balança (`rotationZ` ±8) em sentido alternado. Dá sensação de ar.
- **Varredura de câmera**: o conjunto (`.gibi`) inclina de um lado na explosão (-42°), varre até o outro (+10°) na deriva, dá uma volta completa (+360°) e fecha em +24°. Vale para qualquer prop que tenha um "lado de frente".
- **Peça solta que gira**: um selo ou detalhe pequeno com `rotationZ` grande (-40°) e mais `z`, como se flutuasse.
- **Laterais que viram de frente** para serem lidas como peças com desenho.

## Propostas (não testadas)

| Tipo de prop | Movimento que provavelmente combina | Onde mexer |
|---|---|---|
| Camadas planas (cartões, telas, circuitos) | Deslizar em camadas: cada uma desliza em `x` ou `y` alternando o sentido, sem `rotationZ` | `e` e `d` com `x`/`y` alternados |
| Peças concêntricas (lente, relógio) | Telescópio: cada anel avança em Z e gira em `rotationZ` em sentidos opostos | `e.z` escalonado, `d.rotationZ` ±30° alternado |
| Peças radiais (flor, turbina) | Abrir em leque: `rotationZ` aumenta com o índice da peça e o pivô fica no centro | `transform-origin` no pivô, `e.rotationZ` por índice |
| Objeto mecânico (engrenagens, caixa) | Peças saem em eixos diferentes (uma em Y, outra em X) com pouco giro; câmera varre devagar | `e.x`/`e.y`/`e.z` distintos por peça |
| Produto fechado (caixa, estojo) | Tampa levanta e gira, conteúdo sobe, base fica; depois tudo volta | `ordem` marca quem sai primeiro |

## Como escolher o ritmo

- Cada fase dura cerca de 2 a 4 unidades de timeline. Giro completo de 360°: 4 unidades foi bom no gibi (2,4 pareceu rápido demais, segundo o usuário).
- Escalona o início de cada peça em 0,12 por posição de `ordem`. Mais que isso, a cascata demora demais.
- Mantenha o scroll total entre 500% e 750% da altura da tela. Mais que isso cansa o dedo.
- `ease` de entrada e saída: `power3.inOut` para sair e voltar, `sine.inOut` para a deriva, `power2.inOut` para o giro.

## O que evitar

- **Bordas planas do miolo** num objeto de folhas: as três laterais do bloco de páginas ficaram feias no gibi e foram removidas.
- **Anel colorido "de enfeite"** sem relação com o prop.
- Movimentos diferentes em peças que deviam parecer do mesmo conjunto: quebra a coesão. Varie a direção, não o estilo.

## Mecanismos (validados no relógio, em CSS e em WebGL)

- **Telescópio em Z**: cada camada concêntrica avança em Z e a da frente sai primeiro (`e.z` de -330 a +320 no relógio).
- **Peças que giram (campo `r`)**: uma peça que dá várias voltas (ponteiros 1 a 6, engrenagens 2 a 3 em sentidos opostos) não usa os tweens `e`, `d` e `m` para o `rotationZ`: cada tween começa e termina devagar e a peça frearia nas fronteiras. Dê um `r` (rotação final = `m.rotationZ + 360·n`) e faça **um tween só** de `m.rotationZ` até `r`, do início da explosão dela até o fim da remontagem dela (`power1.inOut`), tirando `rotationZ` dos outros tweens (`sem()`). Como `r - m` é múltiplo de 360, a pose final é idêntica à inicial. A verificação numérica compara `rotationZ` módulo 360.
- **Engrenagens que engrenam**: dentes em polígono com fase controlada (ângulo do centro de um dente). Onde C tem um dente, A tem um vão: `phA = ang + 180 − 180/N_A`, `phB = ang + 180` (quando C tem vão na direção de B). Distância entre centros = soma dos raios primitivos. Com todas em `rotationZ: 0` montadas o encaixe fica certo.
- **Mecanismo sai pelos lados**: camadas concêntricas ficam escondidas atrás da da frente. Na deriva, mande as peças do mecanismo para os lados, em eixos diferentes (`d.x`/`d.y` grandes) e deixe o resto com oscilação pequena em Y.
- **Zoom do montado**: o objeto montado aparece maior (`CFG.grande` ≈ 1.3) e volta a 1 ao explodir, porque a cena explodida precisa de escala menor para caber.
- **Aproximação de longe (ideia, não feita)**: o prop entra pequeno, no fundo, e se aproxima até o tamanho da cena. O usuário achou boa para depois.

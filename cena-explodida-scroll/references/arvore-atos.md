# Peças em árvore e atos

Para props que contam uma história mais longa que "desmonta e remonta": uma peça que se abre em peças menores (boneca russa), a câmera que foca um sub-conjunto, vários ciclos de abrir e fechar. Exemplo completo: `props/relogio-arvore/` (herda faces, peças, fonte e estilo de `props/relogio` pelo campo `herda` do manifesto; tem só `config.js` e `partes.js`).

**Sem `ARVORE` e `ATOS` o motor roda o ciclo plano de sempre** (m → e → d → m, poses `POSES.e/d/giro/fim`), sem mudar nada. O relógio plano aprovado continua pixel-idêntico: rode `cmp3d` depois de mexer no motor.

## A árvore

```js
const ARVORE = {
  relogio:   ['tampa', 'caixa', 'mecanismo', 'frontal'],   // a raiz é o conjunto (o nó que não é filha de ninguém)
  mecanismo: ['platina', 'gC', 'gA', 'gB'],
  frontal:   ['mostrador', 'horas', 'minutos', 'segundos', 'pino', 'bisel', 'vidro'],
};
```

- Nó interno vira um `THREE.Group` criado pelo motor; as peças que `construirPecas()` fez (folhas) entram dentro dele. Mover o pai leva as filhas junto.
- `partes[nó]` tem `m/e/d/ordem/r` **relativos ao pai**. Com o grupo montado em 0, o `m` das filhas é o mesmo do prop plano.
- `e` é a pose da peça quando **o pai dela** está aberto. `ordem` é entre irmãs.
- `extra: true` (opcional): a peça só existe com o pai aberto (aparece ao abrir, some ao fechar; acessórios da Nikon). Não precisa ter lugar real na peça montada.
- `foco: {x, y, z}` (opcional, nó interno): ponto que a câmera centraliza ao focar o nó, relativo a ele. Sem ele vale a origem do nó, que num prop desenhado no lugar (Nikon) é o centro do conjunto, longe das peças.
- `fora` (opcional): deslocamento para sair de cena quando a câmera foca outro nó, no modo `'quadro'`. Sem ele a peça sobe 900.
- Um grupo pode ter `e = m` (não se move) e mesmo assim abrir as filhas: o `frontal` do relógio fica e as filhas se espalham.

## Os atos

`ATOS` é uma lista de passos em sequência. Cada passo combina ações, que acontecem **juntas**:

| campo | efeito |
|---|---|
| `abrir: [nós]` | as filhas desses nós saem (m → e, escalonadas) e derivam até d enquanto o nó estiver aberto |
| `fechar: [nós]` | as filhas voltam ao `m` literal (encaixe exato); o nó precisa ter sido aberto antes |
| `focar: nó` | centra e amplia o nó; as irmãs dele e as dos seus ancestrais saem de cena |
| `voltar: true` | desfaz o último foco (é uma pilha: focar A, focar B, voltar volta para A) |
| `camera: {rotationX, rotationY}` | pose do conjunto ao fim do passo; giro completo = +360 |
| `zoom` | escala ao fim do passo (1 = explodido cabe na tela; CFG.grande = montado) |
| `duracao` | opcional; padrão = tempo das peças (peca + passo × ordem máx.) ou `TEMPOS.foco` |
| `estilo` | reservado para a Fase 2 (tema e mistura de linhas por ato) |

Um passo só com `camera` serve de respiro com movimento (o `gira` do relógio: o mecanismo aberto deriva enquanto a câmera dá a volta). As histórias do usuário viram listas:

- explode, volta, explode de novo e foca: `abrir(P) → fechar(P) → abrir(P) → focar(X) → abrir(X) → …`
- explode e já foca, e a peça explode: `abrir(P) → { focar: X, abrir: [X] } → …`
- da primeira saem duas sub-props: `abrir(P) → focar(A) → abrir(A) → fechar(A) → voltar → focar(B) → abrir(B) → fechar(B) → voltar → fechar(P)`

Deriva curta: quando um nó fecha logo depois de abrir (sem passo de câmera no meio), cada peça só anda a parte de `d` que cabe na janela, na velocidade normal; antes ela percorria a deriva inteira num instante e dava um tranco no fim da abertura. Para ver a deriva inteira, ponha um passo só de câmera entre abrir e fechar (o `gira-lente` da Nikon). Para achar trancos: `node sonda-vel.mjs <arquivo> <t> ...` (maior passo de uma peça entre amostras de 0,05).

Regras que o motor garante: a deriva de cada peça termina quando a volta **dela** começa (nenhuma parada); peças com `r` giram num tween só por abertura (e o ângulo se acumula a cada abertura, fechando sempre num múltiplo de 360 além do `m`); termine a lista com tudo fechado e sem foco (o motor avisa no console se não).

**Foco longe do centro**: se o ponto focado está longe do centro do foco anterior, centro e zoom andando juntos com a curva padrão dão um tranco no meio do ato. `CFG.focoSuave: true` faz o centro andar primeiro (75% do ato, sine) e o zoom vir depois (a partir de 20%, sine). Ligado na Nikon; o relógio em árvore fica com o comportamento antigo.

## Saída de cena no foco

`CFG.saida` escolhe por prop; a chave "saída" no painel alterna para comparar no aparelho.

- `'quadro'`: as peças se afastam pelo `fora`. Barato; escolha direções que não passem pela frente do nó focado (para cima, para os lados, para trás).
- `'sumir'`: ficam transparentes e, em 0, deixam de ser desenhadas (sem custo). O motor clona o material de cada malha para a transparência não vazar entre peças que dividem material. Limite: enquanto somem, peças transparentes na frente do foco se desenham por cima dele como fantasmas.

O foco desloca o conjunto (`raizG.position`) para o nó ficar no centro, calculado a cada quadro com a rotação da câmera; pesos por nó permitem passar de um foco a outro.

## Scroll

`TEMPOS.porUnidade` = % da altura da tela por unidade de timeline. O relógio plano dá ~58 (730% para 12,6 unidades); com 58 o scroll cresce com os atos e o ritmo fica igual (relógio em árvore: 19,7 unidades, ~1140%).

## Verificação

`node atos3d.mjs <arquivo.html> [quadro|sumir] [sim]` (pasta de testes): depois de cada `fechar`, a subárvore do alvo está no `m` exato; no fim tudo em `m`, sem deslocamento de saída, opacidade 1 e sem foco; nenhum trecho de 0,2 parado entre o primeiro e o último ato; `sim` salva capturas no meio e no fim de cada ato. `node folha.mjs saida.png 4 a.png b.png …` junta capturas numa folha.

## Objetos deitados, giro contínuo e grupos com pivô (Dual 1019, 2026-10-03)

- A peça gira nos três eixos: `rotationX`, `rotationY`, `rotationZ` em `m/e/d` (mesmo sinal do conjunto). A tampa do toca-discos abre com `e: { y: -330, z: -150, rotationX: 24 }` em volta da dobradiça (o pivô do grupo).
- `eixo: 'rotationY'` muda o eixo de `r` e de `voltas` (padrão `rotationZ`).
- `voltas: n`: a peça gira a rolagem inteira (prato ligado, hélice), montada ou aberta, terminando em m + 360·n. Peças empilhadas que giram juntas levam o mesmo n.
- **Câmera vendo de cima**: `rotationX` NEGATIVO (positivo mostra o fundo). `POSES.ini: { rotationY: -28, rotationX: -26 }` no Dual.
- Prop desenhado no lugar: `const { em, deCima, deFrente, deLado, eixoY, discoY, peca, pivos } = montagem(U, Y0)` (motor/geometria.js) e, no fim de `construirPecas()`, `pivos({ grupo: [x, y, z] mm })`: o m de cada nó sai dos pivôs; grupo sem pivô fica na origem do pai.

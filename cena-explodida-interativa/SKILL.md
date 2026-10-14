---
name: cena-explodida-interativa
description: "Plugin opcional da cena-explodida-scroll que deixa o usuário mexer no prop com as mãos no fim da rolagem, com o objeto montado: dois toques abrem o prop com a mesma explosão do ato de abertura, dois toques num subconjunto (a lente, por exemplo) abrem ou fecham só ele, dois toques em outra peça fecham tudo; arrastar move a peça (subconjunto fechado vai inteiro), Shift + arrastar ou dois dedos giram, e ao soltar ela volta suavemente ao lugar. Use quando o usuário pedir para clicar, tocar, arrastar, girar ou abrir o prop explodido com o dedo ou o mouse, duplo clique para desmontar, ou peças que voltam ao soltar, mesmo sem citar o nome da skill. Só entra num projeto quando pedido."
---

# Cena explodida interativa (plugin)

Depende da **cena-explodida-scroll** (motor, props, `compor.cjs`). É opcional: um projeto só ganha interação quando o usuário pede. Junta com outros plugins (o blueprint, por exemplo):

```
node <cena-explodida-scroll>/scripts/compor.cjs props/<prop> saida.html --plugin <cena-blueprint-3d>/plugin --plugin <esta skill>/plugin
```

## O que o usuário faz

- **Só no fim da rolagem**, com o prop montado (a timeline em 100%). A dica do rodapé troca para a da interação; se a pessoa rolar de volta, a interação desliga.
- **Prop montado também se mexe**: arrastar move o prop inteiro, Shift + arrastar (ou dois dedos) gira em volta do centro dele, e ao soltar volta suave. No toque, o canvas passa a `touch-action: none` (o dedo no prop arrasta o prop) e o dedo no fundo **rola a página à mão** (`scrollBy`), senão não daria para voltar a rolagem no celular.
- **Dois toques no prop**: abre com **a mesma explosão do ato de abertura** (as mesmas poses `e` e o mesmo ritmo `TEMPOS.peca`/`passo`), sem girar a vista. **Sem a flutuação `d`**: as peças param na pose `e` (pedido do usuário, 2026-10-02, feito numa sessão com o Codex). Como a vista do fim costuma ser o espelho da do começo, a explosão aparece espelhada na tela. Decisão do usuário: nada de poses próprias para a interação, com uma exceção controlada: `ajustesAbertura` desloca uma ou outra peça só nessa explosão (na Nikon, a trava do Photomic em y 22 e o visor esportivo em y 30, para sair do caminho na vista do fim); volta ao fechar. A rolagem trava enquanto está aberto.
- **Dois toques numa peça de um subconjunto** (`subconjuntos`, ex.: a lente): abre ou fecha só ele, no lugar. A vista não gira, então peças no mesmo eixo vistas quase de frente se cobririam: o subconjunto pode **virar de lado em volta do próprio centro** (`girarAoAbrir`, graus), **espalhar mais** (`espalhar`), **sair do caminho** (`afastar`) e **recuar o zoom** para caber (`zoomAoAbrir`). Na Nikon: 45°, 1,8, `{ z: 230, y: 10 }`, 0,55 deram zero oclusão e nada fora do quadro (2026-10-01). **A sessão com o Codex (2026-10-02) trocou para 15°, 1,3, `{ z: 230, x: -150, y: 10 }`, 0,75** (menos giro e menos zoom); com esses valores a `oclusao.mjs` volta a achar a lente aberta cobrindo a tampa esquerda (89% escondida) e anéis cobrindo anéis (16 a 31%). **O usuário aprovou isso para a Nikon (escolha dele)**, então não é defeito; para outros props a regra de oclusão zero continua.
- **A peça agarrada desenha por cima** das outras (camada 1, segunda passada de desenho com o mesmo mapa de sombra) enquanto é arrastada e durante a volta suave, para não atravessar as outras como fantasma.
- **Dois toques em qualquer outra peça**: fecha tudo (e o que estiver arrastado volta). Fundo: nada.
- **Arrastar** move no plano da tela, na profundidade da peça. **Subconjunto fechado é um objeto só** (boneca russa menor): pegar qualquer peça dele arrasta o conjunto; depois de aberto, cada peça vai sozinha.
- **Girar** sem botão: Shift + arrastar ou botão direito no desktop; no toque, dois dedos (torcer gira no plano da tela, arrastar o meio tomba). O grupo gira em volta do centro da caixa dele; a folha, do seu pivô. O usuário recusou o botão mover/girar.
- **Escala da peça agarrada**: no desktop, rodinha/trackpad multiplica a escala por `exp(-deltaY * 0.0015)` (`wheel`, `passive: false`; linhas convertidas em 16 px, páginas na altura do canvas). `preventDefault` só é chamado enquanto há uma peça agarrada e a interação está ativa; sem peça agarrada, a rodinha mantém o comportamento atual. No iPhone, a pinça multiplica a escala pela razão entre a distância atual dos dedos e a distância no início do gesto, **ao mesmo tempo que a torção e o tombo continuam girando**. Limites padrão: **0,5 a 2,0**, configuráveis por `CFG.interativo.escalaMin/escalaMax`. O subconjunto fechado e o prop montado ampliam inteiros, como no arrasto. Ao passar de dois dedos para um, a escala fica congelada; uma nova pinça parte dessa escala, sem pulo.
- **Ao soltar volta suave**: posição e giro voltam ao repouso e o multiplicador de escala volta a 1 (`power2.inOut`, 0,8 s). O usuário recusou a mola (`elastic`).
- **Trocar de giro para mover no meio do arrasto** (soltar o Shift, ou tirar um dos dois dedos) não teleporta: a peça desliza até o ponteiro com a mesma cadência da volta e depois segue o cursor. O usuário apontou o pulo como defeito.
- Dois toques com mouse ou dedo; arrasto e dois dedos nunca contam como toque; `touch-action: manipulation` evita o zoom da página.

## Como funciona (e por que não quebra o encaixe)

O plugin **não toca nos proxies da rolagem**. O motor chama `depoisAplica` depois de posicionar as peças, e o plugin soma por cima: deslocamento de abertura `D` (calculado de `partes[n].e − m`, escalonado por `ordem` como na rolagem, extras aparecendo, anéis com `r` girando), arrasto `I` (posição e quaternion nos eixos do pai) e um multiplicador de zoom. Ao fechar, tudo volta a zero e o prop está exatamente no `m`. Ele se monta quando a cena fica pronta (`window.pronto`), porque as peças nascem de forma assíncrona.

## Configuração no prop (`config.js`)

A escala da peça é aplicada em `depoisAplica` no **mesmo nó `GG(arr.n)` que o arrasto move**, incluindo a raiz e o subconjunto fechado. `escalaBase[n]` guarda a escala original dos três eixos ao iniciar; cada quadro copia essa base e a multiplica por `I[n].escala`, sem perder a base nem acumular multiplicações. `soltar(n)` restaura o fator a 1 junto com a posição e com a mesma curva e duração da volta do giro. Fechar tudo por dois toques restaura também a raiz; fechar um subconjunto restaura o nó dele e seus descendentes. O zoom da vista (`ZI`) continua separado.

```js
CFG.interativo = {
  abrir: ['nikonF', 'tampaD', ...],     // nós que abrem com dois toques (como no ato que o usuário escolher)
  subconjuntos: ['lente'],              // nós que abrem e fecham sozinhos com dois toques numa peça deles
  ajustesAbertura: { travaFrontal: { y: 22 }, visorEsportivo: { y: 30 } },   // deslocamento extra de peças só nesta explosão (voltam ao fechar)
  zoom: .8,                             // zoom aberto (o do ato); ou [tela deitada, tela em pé]
  escalaMin: .5, escalaMax: 2,           // limites do multiplicador de escala da peça agarrada (padrões)
  afastar: { lente: { z: 230, x: -150, y: 10 } },   // deslocamento extra de um subconjunto quando ele abre (tirar do caminho)
  girarAoAbrir: { lente: 15 },          // o subconjunto vira de lado ao abrir (graus, em volta do centro dele)
  espalhar: { lente: 1.3 },             // fator sobre e − m das peças dele
  zoomAoAbrir: { lente: .75 },          // zoom enquanto ele está aberto
  textos: { montado, aberto },          // os padrões já trocam entre mouse e toque
};
```

## Verificação

- `node interacao3d.mjs <arquivo.html> [largura altura]` (pasta de testes): rola até o fim, dois cliques abrem, arrasta e gira (Shift) uma peça (tem de voltar a 0), arrasta a lente fechada (tem de ir o grupo inteiro), dois cliques na lente abrem e fecham só ela, dois cliques no corpo fecham tudo; no fim, nenhum deslocamento, zoom 1 e rolagem destravada. Rode em desktop e em 390 x 844 e olhe as capturas `i_*.png`.
- O teste também arrasta e gira o prop montado (tem de voltar a 0) e solta o Shift no meio do arrasto (salto imediato ~0, depois a peça chega ao ponteiro).
- **Oclusão e quadro (obrigatório)**: `node oclusao.mjs <arquivo.html> int [largura altura]` mede, depois dos dois toques, o fim da abertura, (o "fim da flutuação" do relatório é igual ao anterior agora que não há flutuação) e cada subconjunto aberto: nenhum objeto pode esconder outro (> 3%) nem sair do quadro. Rode também nos instantes dos atos (`oclusao.mjs <arquivo> t1,t2 L A nósAbertos`), porque mudar `e` para a vista do fim mexe na vista do começo.
- Fora do Artefato, o atributo `hidden` não vence o CSS da tela de um toque: o teste a esconde pelo estilo. No Artefato o esqueleto da página já corrige.
- Armadilha do `interacao3d.mjs`: a origem de uma peça em anel é o furo, onde o raio pode não pegar nada (com a lente aberta a 15°, o centro do anel de foco é só fundo). Para fechar a lente o teste clica no vidro frontal, um disco maciço; confirmado por um raio lançado no ponto (`sonda-clique.mjs`).

## Limites do que foi validado
Validado na Nikon F, no `relogio-arvore` e no Dual 1019 (34 peças, 7 atos, blueprint e interação; 2026-10-03). Fase 3 e pinça real aprovadas no iPhone. O Dual exercitou braço e prato como subconjuntos, abertura com giro em X/Y/Z e teste de todos os subconjuntos.

Lições do fechamento:

- Confira as medidas da ficha contra as fotos antes de desenhar. Calibre a cor comparando o pixel renderizado com a amostra da foto. Veja [referencias.md](../cena-explodida-scroll/references/referencias.md).
- Peça embutida nasce do contorno da mãe. Use `embutido()`, declare `apoio` e confira com `assentamento.mjs`. Blocos vizinhos encostam face a face, sem fresta, interpenetração ou chanfro na junção. Three r128 não tem `isShape`: use `instanceof THREE.Shape`. Veja [caminho-webgl.md](../cena-explodida-scroll/references/caminho-webgl.md).
- Giro aceita os três eixos. `eixo` escolhe o eixo de `r`; `voltas` mantém o giro durante a rolagem. Veja [arvore-atos.md](../cena-explodida-scroll/references/arvore-atos.md).
- Vidro no blueprint preserva as linhas atrás dele. O custo dominante é preenchimento na GPU. Use `densidadeMax`, pré-compilação, sombras congeladas na transição e painel BP com tempos. Veja [desempenho-iphone.md](../cena-explodida-scroll/references/desempenho-iphone.md).
- Na interação, desenhe peças transparentes uma vez só. Zoom da peça agarrada: 50 a 200%, por rodinha ou pinça, com volta a 1 ao soltar. Veja [plano-expansao.md](../cena-explodida-scroll/references/plano-expansao.md).

Os testes leem `CFG.interativo` e `ARVORE` e escolhem peças atingidas por um raio. A Nikon mantém sua tabela de cliques. As oclusões aprovadas da Nikon e as limitações dos discos coaxiais do relógio estão registradas em [plano-expansao.md](../cena-explodida-scroll/references/plano-expansao.md). A regra de oclusão zero vale para props novos.

---
name: cena-explodida-scroll
description: Monta uma cena de scroll em que um objeto (prop) se desmonta em peças 3D, as peças se movem e ele se remonta, tudo controlado pela rolagem da página. Padrão em WebGL (Three.js + GSAP ScrollTrigger) com um motor reaproveitável; CSS 3D só para props de faces planas. Use sempre que o usuário pedir vista explodida, peças que se separam e se encaixam de novo, objeto que desmonta no scroll, cena estilo home do animejs, animação de montagem/desmontagem de produto, ou "prop" 3D animado por scroll, mesmo que ele não diga "skill" nem cite GSAP ou Three.js. Cada prop recebe estilo e materiais próprios (nunca herdados de um exemplo) e toda peça com corpo é um sólido com espessura, não uma folha. Inclui encaixe exato, movimento por prop, tela de um toque e painel de fps para o iPhone em Artefatos.
---

# Cena explodida por scroll

Um prop desmonta nas suas peças, as peças se movem e ele se remonta, conforme o usuário rola. GSAP + ScrollTrigger dirigem a animação. O desenho tem dois caminhos, escolhidos pelo tipo de prop:

- **WebGL com Three.js: o padrão.** Superfícies curvas, muitas peças, detalhe. **Aprovado pelo usuário no iPhone dentro do Artefato (60 fps).** Veja `references/caminho-webgl.md`.
- **CSS 3D: só para faces planas e poucas peças** (folhas, caixas, cartões), até ~150 camadas. Cada plano custa uma camada no iPhone e o CSS chegou a 30 fps com ~200. Veja `references/caminho-css.md`.

O **motor** (`motor/`) é o que se reaproveita: cena, câmera, luz, geometria de sólidos, tabela de peças para timeline, tela de um toque, painel de fps. O **prop** (`props/<nome>/`) é tudo que é do objeto: estilo, faces, materiais, peças, poses. **O estilo nunca se reaproveita.** `scripts/compor.cjs` junta os dois num HTML só.

```
node scripts/compor.cjs props/relogio saida.html
```

## Ao retomar este projeto (sessão nova)

Se o usuário disser que vai continuar o projeto das skills (cena explodida, Nikon F, blueprint, interação), **primeiro leia `references/proxima-sessao.md` e mande a mensagem dele exatamente como está**; depois, se for preciso, **leia `references/todo.md` e liste os itens a ele logo no começo, antes de qualquer outra coisa** (ele pediu isso), depois leia `references/plano-expansao.md` ("Como retomar": comandos, decisões fechadas, pendências) e pergunte por onde começar. Primeiro passo técnico: conferir se o HTML ou o artefato publicado mudaram fora das fontes (o usuário também edita com o Codex).

## Duas regras que não se negociam

### 1. Estilo próprio do projeto, definido ANTES de desenhar

Paleta, materiais, tipografia e tom saem do próprio objeto, nunca de um exemplo. O gibi é quadrinho americano; o relógio é um regulador de oficina (ferro preto, níquel, latão, porcelana, fonte condensada). Copiar cores ou jeito de outro prop é um erro, mesmo com o mesmo motor. Antes de desenhar, escreva em 4 linhas no topo do `prop.css`:

- **Mundo do objeto**: que objeto real é, de que época e ofício.
- **Materiais**: de que cada peça é feita (ferro fundido, latão, porcelana, vidro, ABS, couro). O material dá a cor e o brilho.
- **Paleta**: 4 a 6 cores tiradas desses materiais, mais no máximo um acento.
- **Tipografia e textos**: fonte condizente com o objeto e textos plausíveis de quem o fabricou. Nada de marca ou slogan herdado de outro projeto.

Pergunte ao usuário só se o mundo do objeto for realmente ambíguo; se ele já descreveu o estilo, siga exatamente. O fundo da cena é escolhido para o objeto aparecer (caixa escura pede fundo claro).

### 2. Toda peça é um sólido, com espessura, profundidade e tamanho

Só é plano o que é lâmina de verdade (folha, cartão). Tampa, aro, disco, engrenagem, ponteiro, caixa, vidro, botão têm espessura e mostram as bordas quando a câmera gira. Dimensione em unidades proporcionais ao objeto (relógio de 330 de diâmetro: caixa de ~44 de fundo, vidro de 4, ponteiro de 2,4) e confira em tela. As **costas também são projeto**: a câmera dá 360°, então o verso de cada peça aparece e não fica liso por economia (pontes e carimbo na platina, gaxeta na tampa). Texto que tem que caber usa `textLength`; em face curva, `textPath`.

## O que o usuário quer (em ordem)

1. **Qualidade**: peças sólidas com detalhe, encaixe exato, coesão do estilo do objeto. Peça chapada, mal encaixada ou fora do estilo é o pior defeito.
2. **Desmontar e remontar** com movimento vivo.
3. **Extras** (anéis, legendas) só se o usuário pedir ou o prop pedir.

A pose final não precisa repetir a inicial (o relógio começa a -24° e termina espelhado, a +24° depois de um giro de 360°). O que nunca muda: as peças voltam ao encaixe exato.

## Fluxo

0. **Referências e ficha** (`references/referencias.md`): fotos, blueprint ou esquema explodido em `props/<nome>/ref/` (nunca vão para o HTML); prop inventado ou inspirado passa antes por um processo criativo. Escreva `ficha.md` (estilo, escala, árvore de peças com medidas, atos) e **só desenhe depois que o usuário aprovar**.
1. **Estilo do projeto** (regra 1) e **decomposição em peças reais** (regra 2): para cada peça, material, dimensões, centro da espessura em Z.
2. **Faces em SVG** (`faces.js`), frente e verso, com detalhe real.
3. **Geometria** (`pecas.js`): `disco`, `tubo`, `extrudar`, `engrenagem`, materiais em `M`.
   **Peça embutida nasce do contorno da mãe**: use `embutido()` com recuo, assente a base na face de apoio, preserve os UVs e declare `apoio: { em, face: 'cima' }` para verificar com `assentamento.mjs` (detalhes em `references/caminho-webgl.md`).
4. **Tabela `partes`** e **movimento** (`references/movimentos.md`): o movimento é decisão por prop; traduza o que o usuário descrever em valores da tabela.
5. **Poses de câmera e tempos** (`config.js`): início, explodido, deriva, giro, fim; eles são independentes.
6. **Compor, verificar** (`references/verificacao.md`) e **medir no iPhone** com o painel de fps embutido (`references/desempenho-iphone.md`).

## Estados por peça

```
m = montada (as coordenadas exatas do encaixe)
e = explodida   (herda de m, só sobrescreve o que muda)
d = à deriva    (herda de e)
```

A viagem é `m → e → d → m`. O estado final é literalmente o `m` do começo: nunca anime "de volta" com números novos, e todo tween de remontagem vai para `p.m` inteiro. Regras:

- **Sem peça parada**: a deriva de cada peça termina quando a remontagem *dela* começa.
- **Escalone**: a peça da frente sai primeiro; na remontagem a de trás chega primeiro (`passo` 0,12 por posição de `ordem`).
- **Afaste mais as peças mais fundas**: a mais perto da câmera é maior e esconde as laterais.
- **Peças laterais viram de frente** ao explodir (vistas de perfil parecem fiapos).
- **Peças que giram**: campo `r` (um tween só, sem frear); um giro completo vale `ângulo + 360`. `eixo` escolhe o eixo (padrão `rotationZ`); `voltas: n` gira a rolagem toda (prato ligado). A peça aceita `rotationX/Y/Z` em m/e/d (tampa na dobradiça). Câmera de cima = `rotationX` negativo.
- Coloque o mecanismo para fora (eixos diferentes na deriva) se ele fica atrás de uma peça opaca.
- **Explosão sem oclusão (regra do usuário, para todo projeto)**: na pose explodida nenhuma peça (ou subconjunto fechado, que conta como um objeto só) esconde outra nem sai do quadro, em **todas as vistas que mostram a explosão** (cada ato e, com o plugin interativo, a vista do fim da rolagem, que costuma ser o espelho da do começo). Meça com `oclusao.mjs` (desktop e 390 x 844, fim da abertura e fim da deriva) e ajuste `e`/`d` até dar "nenhuma oclusão". Peças alinhadas no mesmo eixo (seletor, disparador e alavanca da Nikon) precisam de alturas bem diferentes; uma peça que sai só "para trás" acaba atrás da maior. Cruzamentos no meio do movimento são aceitáveis; o estado final não.

## Árvore e atos (história mais longa)

Quando o prop tem sub-conjuntos que se abrem de novo (boneca russa), a câmera foca uma parte, ou ele abre e fecha mais de uma vez: o prop define `ARVORE` (pai → filhas) e `ATOS` (passos que combinam `abrir`, `fechar`, `focar`, `voltar`, `camera`, `zoom`) no `partes.js`. A história é decisão por prop: traduza o que o usuário contar numa lista de passos. No foco, as outras peças saem do quadro ou somem (`CFG.saida`, chave no painel). Sem `ATOS`, o motor roda o ciclo plano acima, intocado. Tudo em `references/arvore-atos.md`; exemplo `props/relogio-arvore/`.

## iPhone e Artefato (obrigatório)

- **Tela de um toque**: o quadro do Artefato roda a ~30 fps até o primeiro toque; o motor já abre com o botão que some no `pointerup`.
- **Painel de fps** na página real (`#sem-fps` esconde): aprove desempenho nele, rolando, no aparelho. Com blueprint ativo, `#hud-info` e `window.BP_TEMPOS` mostram médias móveis de 30 quadros em ms de normal/chapado/vidro/tela, alvo e ss; timer queries GPU assíncronos quando disponíveis, fallback marcado `cpu`. Sonda que anima por relógio não reproduz o scroll.
- **Duas escalas**: ajuste à tela e zoom animado em elementos separados.
Detalhes e o que já aprendemos: `references/desempenho-iphone.md`.

## Estrutura

```
SKILL.md
motor/           cena.js geometria.js timeline.js texturas.js painel.js arranque.js util.js base.css
props/relogio/   manifesto.json prop.css fonte.json + .woff2 config.js faces.js pecas.js partes.js   (primeiro prop, modelo para os outros)
props/relogio-arvore/   manifesto.json (herda: ../relogio) config.js partes.js   (árvore e atos; herda o resto)
props/nikon-f/   ref/ ficha.md + arquivos do prop   (segundo prop WebGL, feito de fotos e esquema explodido; peças desenhadas no lugar e recentradas no pivô; v1 com as peças de fora)
props/dual-1019/ ref/ ficha.md + arquivos do prop   (terceiro prop, teste final das 3 skills: objeto deitado, tampa na dobradiça, prato que gira a rolagem toda; usa montagem() do motor)
scripts/compor.cjs
references/      referencias.md arvore-atos.md caminho-webgl.md caminho-css.md desempenho-iphone.md verificacao.md movimentos.md modo-direcao.md
assets/css/      exemplos e sondas do caminho CSS (o exemplo WebGL se gera: compor.cjs props/relogio)
```

`references/modo-direcao.md` é só especificação (o usuário dirige o movimento peça por peça); não construa sem pedido.

## Skills irmãs (planejadas, construídas em cima deste motor)

- **`cena-blueprint-3d`** (pronta, opcional por projeto: só com `--plugin` quando o usuário pedir): estilo de linhas técnicas (passe de contorno como o do animejs, temas azul blueprint e papel branco com linhas cinza, rótulos, cotas, grade, carimbo), transição animada por ato.
- **`cena-explodida-interativa`** (pronta, opcional por projeto: só com `--plugin` quando o usuário pedir): no fim da rolagem, dois toques abrem e fecham, arrastar move e gira peças que voltam ao soltar.
O plano completo, as decisões do usuário e a especificação de cada fase estão em `references/plano-expansao.md` (**ler antes de continuar**). Ambas se apoiam na **árvore e atos** do motor (Fase 1, pronta); cada ato já tem o campo `estilo` reservado para a Fase 2.

## Limites do que foi validado
Validados: gibi em CSS e relógio de 13 sólidos no iPhone; Nikon F com 70 peças, 11 atos e sombras, aprovada no iPhone a 70 fps. Os plugins generalizaram no `relogio-arvore`. Em 2026-10-03, o Dual 1019 fechou o fluxo com 34 peças, 7 atos, blueprint e interação. Fase 3 e pinça real aprovadas no iPhone. Temas papel, azul e escuro conferidos.

Lições do fechamento:

- Confira as medidas da ficha contra as fotos antes de desenhar. Calibre a cor comparando o pixel renderizado com a amostra da foto. Veja [referencias.md](references/referencias.md).
- Peça embutida nasce do contorno da mãe. Use `embutido()`, declare `apoio` e confira com `assentamento.mjs`. Blocos vizinhos encostam face a face, sem fresta, interpenetração ou chanfro na junção. Three r128 não tem `isShape`: use `instanceof THREE.Shape`. Veja [caminho-webgl.md](references/caminho-webgl.md).
- Giro aceita os três eixos. `eixo` escolhe o eixo de `r`; `voltas` mantém o giro durante a rolagem. Veja [arvore-atos.md](references/arvore-atos.md).
- Vidro no blueprint preserva as linhas atrás dele. O custo dominante é preenchimento na GPU. Use `densidadeMax`, pré-compilação, sombras congeladas na transição e painel BP com tempos. Veja [desempenho-iphone.md](references/desempenho-iphone.md).
- Na interação, desenhe peças transparentes uma vez só. Zoom da peça agarrada: 50 a 200%, por rodinha ou pinça, com volta a 1 ao soltar. Veja [plano-expansao.md](references/plano-expansao.md).

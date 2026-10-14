---
name: cena-blueprint-3d
description: "Plugin opcional da cena-explodida-scroll que transforma o prop 3D em desenho técnico de linhas durante a rolagem (como a home do animejs): peças lisas na cor do papel, arestas e silhuetas em traço fino, com rótulos de linha-guia, cotas e carimbo por cima. O tema (papel branco com linhas cinza, azul blueprint, escuro chapado) e a mistura com o realista são escolhidos por ato. Use quando o usuário pedir blueprint, desenho técnico, vista em linhas, contorno, 'estilo esquema', rótulos com linha-guia, cotas ou carimbo numa cena explodida por scroll, mesmo sem citar o nome da skill. Só entra num projeto quando pedido; sem ele o prop roda realista como sempre."
---

# Cena blueprint 3D (plugin)

Depende da **cena-explodida-scroll** (o motor, os props, o `compor.cjs`). Não é obrigatório: um projeto só ganha linhas quando o usuário pede. Entra como plugin na composição:

```
node <cena-explodida-scroll>/scripts/compor.cjs props/<prop> saida.html --plugin <esta skill>/plugin
```

Sem `--plugin` o mesmo prop sai realista e nada do que está abaixo roda (os campos `estilo` dos atos e `CFG.blueprint` são ignorados).

## Como funciona

- **Linhas** (`plugin/linhas.js`): a cena é desenhada de novo num alvo invisível com um material chapado (normal da superfície + número da peça + cobertura e fator de quina); um passe de tela cheia acha as bordas e pinta papel, peça (com sombreado leve pela normal) e linha. Silhuetas contra o papel e bordas entre peças têm peso maior; quinas internas são mais finas e 20% mais claras em relação ao preenchimento, com afinamento e clareamento adicionais nas peças pequenas. Vidro fica fora do alvo principal, preservando as peças e linhas atrás dele; um alvo opcional só de vidro fornece suas arestas e cobertura para tingir o preenchimento com 8% da cor da linha, no mesmo passe final. `EST.linhas` (0 a 1) mistura o desenho por cima do realista. Em 0 a cena é desenhada direto, sem passes extras; em 1 o realista nem é desenhado. Durante `0 < EST.linhas < 1`, o render realista reutiliza o mapa de sombras: `shadowMap.autoUpdate` e `needsUpdate` ficam desativados durante o render e são restaurados em `finally` (inclusive se ocorrer erro).
- **Anotações** (`plugin/anotacoes.js`): SVG e DOM sobre o canvas, ancorados nas peças a cada quadro. Só começam **na metade** da transição (`EST.anot` > 0,5) e somem na metade da volta: o ponto, depois a linha crescendo, por último o texto. Antes disso a peça ainda é 3D, e ponto e texto pareciam os primeiros a chegar e os últimos a sair (o usuário recusou).
- **Sem escada**: filtro morfológico 3x3 para normal, id e cobertura (máximo das diferenças, sem cancelar bordas opostas de faixas finas), com raios independentes para silhuetas e quinas. O alvo usa `LinearFilter`: ids, fatores e normais são lidos no centro dos texels; só a cobertura decodificada recebe interpolação bilinear. Os quatro texels da cobertura também fornecem o dado central: são 44 leituras de textura por amostra e camada. O tamanho do alvo é calculado por `renderer.getSize()` (pixels CSS) vezes a densidade, não pelo drawing buffer vezes ss. A densidade é `max(dprEfetivo, min(ss * dprEfetivo, densidadeMax))`, com teto adicional de 4096 px e dos limites da GPU somente para a resolução extra; o piso é sempre o buffer do renderer. `ss` solicitado é 1,5 no celular (largura CSS < 600), 3 no desktop de DPR efetivo <= 1,5 e largura >= 900, e 2 nas demais telas. A grade do filtro usa `ceil(max(alvo/buffer))` por eixo, limitado a 1–3 (1, 4 ou 9 amostras), offsets pela razão real por eixo e normalização pelo número inteiro de amostras. Materiais, listas e esferas locais das peças são preparados uma vez, logo após o carregamento, no fim de `prepararPartes()`, antes de `window.pronto`; `renderer.compile` pré-compila os materiais chapados, vidro e passe final, restaurando materiais e estado do renderer. O alvo de vidro e sua filtragem só rodam com linhas > 0 e vidro visível no frustum (inclui ancestrais, camadas e material). `window.BP_TEMPOS` e o HUD expõem médias de 30 quadros em ms de normal/chapado/vidro/tela, resolução, razão alvo/buffer (`ss`) e densidade em pixels por pixel CSS, usando timer query GPU assíncrono quando disponível e `cpu` como fallback. `BP_TEMPOS` também fornece `dprEfetivo` e `amostrasFiltro` (1/4/9). Cada **peça** (não cada malha) tem um número: faces da mesma peça que se tocam não viram linha nem piscam.
- **Por ato**: no `partes.js` do prop, `estilo: { linhas, anot }` em cada ato anima os dois valores ao longo do ato (o motor faz o tween; valores iniciais 0).

```js
{ id: 'abre', abrir: [...], camera: {...}, estilo: { linhas: 1, anot: 1 } },   // vira desenho
{ id: 'foca-lente', focar: 'lente', ..., estilo: { linhas: 0, anot: 0 } },     // volta ao 3D
```

## Configuração no prop (`config.js`)

```js
CFG.blueprint = {
  tema: 'papel',                 // 'papel' (branco, linhas cinza: o esquema técnico), 'azul' (blueprint), 'escuro' (chapado)
  espessura: 1, limiar: .16,     // espessura base em pixels CSS; limiar controla a intensidade da quina
  espessuraCelular: .75,        // multiplicador da espessura quando a largura CSS é < 600
  ssCelular: 1.5,               // supersampling solicitado no celular (1–3); sujeito ao teto de densidade
  // densidadeMax: 3,           // opcional: um teto fixo; omitido usa 3 desktop / 2.25 celular, com piso no DPR efetivo
  pesoSilhueta: 1.35,           // multiplicador para silhuetas e bordas entre peças diferentes
  pesoQuina: .8,               // multiplicador para arestas internas de normal (um pouco mais claras)
  anguloQuina: 30, nitidez: [.18, .55], // ângulo mínimo; nitidez remapeia a cobertura média com smoothstep (false restaura o filtro anterior), compensa o raio em pixels CSS e mantém quinas a 80% após a curva, inclusive no vidro
  soContorno: [],               // nomes de nós/peças sem arestas internas de normal
  vidro: [],                    // nomes de nós/peças tratados como vidro, além da detecção automática
  rotulos: [{ no, ponto: [x, y, z], texto, curto, dir }],
  cotas:   [{ no, de: [x, y, z], ate: [x, y, z], texto, desvio }],
  carimbo: { titulo, linhas: [[rótulo, valor], ...] },
};
```

- `espessura` (padrão `1`): largura base em pixels CSS, convertida pela razão entre o tamanho real do alvo e o tamanho CSS do renderer. Usa o DPR efetivo, inclusive quando limitado pelo motor, mantendo o peso entre desktop e iPhone. O raio mínimo do filtro é meio texel para evitar perder traços subpixel.
- `espessuraCelular` (padrão `0.75`): multiplicador não negativo da `espessura` em largura CSS < 600. Com `espessura: 1`, a base no celular passa a 0,75 px CSS; `1` preserva o mesmo peso do desktop.
- `densidadeMax` (opcional): teto positivo da densidade do alvo em pixels por pixel CSS. Omitido, usa `3` no desktop e `2.25` no celular (largura CSS < 600), recalculados a cada quadro. Nunca reduz o DPR efetivo do renderer (`renderer.getPixelRatio()`): em 440×894 CSS e renderer 3x, resulta em 1320×2682 (3,54 Mpx, razão alvo/buffer 1 e uma amostra); em 2x, resulta em 990×2012 (1,99 Mpx, densidade 2,25, razão ~1,125 e quatro amostras). Arredondamento por eixo para pixels inteiros; o teto de 4096/limites GPU também não reduz o buffer original.
- `ssCelular` (padrão `1.5`, limitado a 1–3): supersampling solicitado em largura CSS < 600, multiplicado pelo DPR efetivo antes do teto. A grade e a normalização do filtro seguem a razão real alvo/buffer, inclusive se fracionária; `BP_TEMPOS.ss` mostra essa razão, não o ss solicitado.
- `pesoSilhueta` (padrão `1.35`) e `pesoQuina` (padrão `0.8`): multiplicadores não negativos da largura base, respectivamente para silhuetas/bordas entre peças e quinas internas. Com `espessura: 1`, os pesos nominais no desktop são 1,35 px CSS e 0,8 px CSS; no celular, com `espessuraCelular: .75`, são 1,0125 e 0,6 px CSS. A rasterização e o filtro 3x3 suavizam esses valores. Quinas usam até 80% da intensidade da cor da linha; silhuetas têm prioridade e usam a cor completa.
- **Afinamento por tamanho**: uma esfera por peça é calculada no carregamento a partir das caixas das malhas no espaço local da peça. A cada quadro com linhas, a CPU transforma e projeta seu centro e raio pela câmera e pelo tamanho CSS, sem ler pixels da GPU. Para raio projetado entre 18 e 40 px CSS, um `smoothstep` reduz a largura e a intensidade das quinas; abaixo de 18 px só permanecem silhuetas e bordas entre peças. O fator vai no alfa RGBA8 do alvo existente (`a = (128 + 127 * fator) / 255`), mantendo `b` como id e a cobertura binária independente. A decodificação desconta o byte 128 para garantir fator zero mesmo após a quantização, sem reintroduzir quinas em `soContorno`. O clareamento é aplicado após a curva de nitidez para não recuperar o contraste das peças pequenas. Vale também para vidro, sem alvo adicional além do já existente para essa camada.
- `anguloQuina` (padrão `30`, limitado a 0–180 graus): só há aresta de normal se o produto escalar das normais reconstruídas indicar um ângulo maior que esse mínimo. A reconstrução usa `n.z = sqrt(max(0, 1 - x² - y²))`. `limiar` continua ajustando a intensidade pela diferença entre as normais completas; ids e silhuetas independem dos dois campos.
- `soContorno` (padrão `[]`): nomes das peças em `G`, de grupos ancestrais ou de nós nomeados das malhas. Suas malhas preservam silhueta e bordas com outras peças **com o mesmo peso das demais**, mas não produzem quinas internas de normal. Use em serrilhas, engrenagens e cilindros pequenos/facetados. No alvo, `b` mantém o id original; `a` vale 0 no fundo, 128/255 em `soContorno` e 128/255–1 nas demais peças conforme o fator de tamanho. A cobertura é decodificada como ocupação antes de interpolar, sem tornar essas peças translúcidas. Também funciona no vidro.
- `vidro` (padrão `[]`): os mesmos tipos de nomes aceitos por `soContorno`, para forçar o tratamento como vidro. A detecção automática usa `material.transparent && material.opacity < 1`, individualmente em malhas com vários materiais; quando o motor fornece `userData.base`, usa os valores de origem para não confundir o fade de saída de sólidos com vidro. Vidro não escreve cobertura, id nem profundidade no alvo principal: o que está atrás mantém suas linhas. Um único alvo adicional, criado somente se houver vidro, desenha suas malhas com os mesmos pesos de linha; o preenchimento combina 8% de `cLinha` com o desenho existente, antes das linhas. Sem vidro, essa parte do shader é excluída na compilação. Este esquema técnico sobrepõe as arestas do vidro sem testar a oclusão pelas peças opacas no outro alvo; não simula refração nem camadas sucessivas de transparência.
- `no` é a peça (folha) onde a anotação se prende; `ponto`, `de`, `ate` estão no sistema dela (na Nikon, mm a partir do pivô da peça). A anotação some quando a peça some.
- **Rótulo** no padrão de desenho técnico: ponto na peça, linha-guia, e o texto **em cima** de uma linha de apoio (nunca riscado). `dir: [dx, dy]` escolhe para onde a linha sai (sem ele, para fora do centro da tela); `curto` é o texto em telas estreitas; o texto desliza para dentro se for passar da borda e o cotovelo acompanha.
- Use os números e nomes da legenda do objeto real quando houver (`'58 · Nikkor-S Auto 50 mm f/1.4'`).
- Poucos rótulos (as peças principais do ato), duas cotas no máximo, carimbo no canto: mais que isso polui. **Fora de escopo**: quadriculado e régua de progresso não existem e não foram implementados; só entram se o usuário pedir.
- Textos que se cobririam (rótulo com rótulo, rótulo com texto de cota) são separados pelo plugin: o rótulo desce (ou sobe, se a linha sobe) em passos até ficar livre. Texto em cima de peça, em tela estreita, o plugin não resolve: use `dir` e `curto` no prop.

## Temas

| tema | fundo | peça | linha | quando |
|---|---|---|---|---|
| `papel` | `#f3f2ee` | branco | `#6f7377` | fundo claro do prop; transição sem clarão; cara de esquema de manual |
| `azul` | `#1d4f86` | `#24578f` | `#e8f0fa` | planta técnica clássica |
| `escuro` | `#2a2c2f` | `#3a3d41` | `#9aa0a6` | abertura escura do animejs; prop de fundo escuro |

## Verificação

- **Conferência de sobreposições** (`sobreposicao.mjs`, ver `cena-explodida-scroll/references/verificacao.md`): texto sobre peça ou sobre texto, faces coincidentes, furos. Obrigatória, desktop e 390 x 844.

- `atos3d.mjs` com o HTML composto com o plugin (as peças e os atos não mudam).
- Capturas no meio e no fim do ato com linhas, no desktop e em 390 x 844 (`vista.mjs <arquivo> <saida> <t> "" "" "" 390 844`): rótulo cortado na borda, texto em cima de outro, cota em cima de peça.
- iPhone: o painel de fps durante o ato com linhas. Sem vidro, continuam um alvo e um passe final, com 1/4/9 amostras conforme a razão alvo/buffer e 44 leituras por amostra. Com vidro, há apenas um alvo e uma renderização de geometria adicionais (só materiais de vidro); o mesmo passe final também filtra essa camada, totalizando 88 leituras por amostra. O custo do filtro pode chegar perto de 2x, mas o custo do quadro inteiro depende da geometria e do aparelho. Memória adicional estimada: 6–8 bytes por texel (RGBA8 + profundidade), sem novos passes de sombras. Em uma manutenção explicitamente sem navegador, valide a sintaxe com `node --check` e registre que a medição visual/GPU posterior está pendente.

## Limites do que foi validado
Validado na Nikon F, no `relogio-arvore` e no Dual 1019 (34 peças, 7 atos, blueprint e interação; 2026-10-03). Temas papel, azul e escuro conferidos. No Dual, vidro ganhou contorno e tingimento leve. Anotações de peças com `voltas` ficam presas ao lugar da peça, sem girar com ela.

Lições do fechamento:

- Confira as medidas da ficha contra as fotos antes de desenhar. Calibre a cor comparando o pixel renderizado com a amostra da foto. Veja [referencias.md](../cena-explodida-scroll/references/referencias.md).
- Peça embutida nasce do contorno da mãe. Use `embutido()`, declare `apoio` e confira com `assentamento.mjs`. Blocos vizinhos encostam face a face, sem fresta, interpenetração ou chanfro na junção. Three r128 não tem `isShape`: use `instanceof THREE.Shape`. Veja [caminho-webgl.md](../cena-explodida-scroll/references/caminho-webgl.md).
- Giro aceita os três eixos. `eixo` escolhe o eixo de `r`; `voltas` mantém o giro durante a rolagem. Veja [arvore-atos.md](../cena-explodida-scroll/references/arvore-atos.md).
- Vidro no blueprint preserva as linhas atrás dele. O custo dominante é preenchimento na GPU. Use `densidadeMax`, pré-compilação, sombras congeladas na transição e painel BP com tempos. Veja [desempenho-iphone.md](../cena-explodida-scroll/references/desempenho-iphone.md).
- Na interação, desenhe peças transparentes uma vez só. Zoom da peça agarrada: 50 a 200%, por rodinha ou pinça, com volta a 1 ao soltar. Veja [plano-expansao.md](../cena-explodida-scroll/references/plano-expansao.md).

As linhas usam normal e id da peça, sem profundidade. Dobras suaves podem aparecer só na silhueta. A medição inicial do Dual no iPhone indicou gargalo de preenchimento, com 23 fps e pior de 17. O teto de densidade e os tempos BP permitem medir o efeito das otimizações; esse registro não atribui um fps final sem medição. Quadriculado e régua de progresso continuam fora de escopo.

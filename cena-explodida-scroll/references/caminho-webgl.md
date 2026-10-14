# Caminho WebGL (Three.js): o padrão

**Fato verificado (2026-09-30):** a página inicial do animejs, que inspirou esta skill, é WebGL (Three.js r172, modelo glTF, shaders); o anime.js só anima os valores. O relógio neste caminho (~18 mil triângulos, 26 chamadas de desenho) ficou **fluido a 60 fps no iPhone dentro do Artefato**, onde o CSS 3D caía para 30 com ~200 camadas. Three.js r128 (UMD) vem do cdnjs; r128 é a última com build UMD único.

## O motor e o que o prop fornece

`motor/` (não mexa por prop; melhore aqui e todos os props ganham) e `props/<nome>/` (tudo que é do objeto). `scripts/compor.cjs` junta os dois num HTML só.

| Arquivo | Papel |
|---|---|
| `motor/util.js` | `rad, TAU, pol, circ, V, circulo, $, sem`; registra ScrollTrigger |
| `motor/texturas.js` | `svgTex(svg, lado, px, comFonte)`: SVG para `CanvasTexture`, fonte embutida; `svgTexR(svg, w, h, pxW, pxH, comFonte)` retangular (faixas em volta de anéis) |
| `motor/cena.js` | renderer, câmera (z 1800), ambiente PMREM, luzes, grupos, proxies `G P R Z`, `mat()`, `aplica/desenha/tamanho/fit` |
| `motor/geometria.js` | `disco, tubo, perfilTubo, extrudar, engrenagem, pino3d`; `placa` (contorno com furos, materiais [frente, lado, verso] e UV de desenho nas tampas), `retangulo`, `serrilha`, `embutido` (recorte com recuo e furos da mãe) |
| `motor/timeline.js` | `prepararPartes()`, `construirTimeline()` a partir de `partes`, `POSES`, `TEMPOS` |
| `motor/painel.js` | painel de fps, botões, tela de um toque |
| `motor/arranque.js` | ticker de desenho sob demanda e início |

Cada prop tem: `manifesto.json` (título, dica, texto do toque), `prop.css` (as variáveis `--fundo --tinta --fonte --palco-fundo --inicio-fundo` e o estilo próprio), `fonte.json` + arquivos `.woff2` (a fonte do projeto; `compor.cjs` gera o `@font-face` em base64 só no arquivo final), `config.js` (`CFG`, `POSES`, `TEMPOS`), `faces.js` (SVG das faces), `pecas.js` (`M` materiais, `construirPecas()` que preenche `G` e faz `raizG.add`, e a tabela `partes`).

**Prop novo:** copie `props/relogio/` para `props/<novo>/`, reescreva tudo que é do objeto (estilo primeiro, veja a regra 1 do SKILL.md), troque a fonte embutida, `node scripts/compor.cjs props/<novo> saida.html`, verifique (`verificacao.md`) e meça no iPhone.

Fonte embutida: baixe os `.woff2` latin dos pesos usados em `fonts.gstatic.com` (o CSS de `fonts.googleapis.com` com User-Agent de Chrome dá as URLs) para a pasta do prop e liste-os em `fonte.json` (`familia` e `arquivos[{peso, arquivo}]`). Guarde-os como binário, não como base64 em texto: um base64 no repositório dispara falsos positivos do SkillSpector (uma sequência aleatória casou com uma regra de ferramenta de ataque). A `familia` nas faces e no `--fonte` tem de ser o mesmo nome.

## Coordenadas e proxies

O GSAP anima **proxies** em convenção CSS (`x, y, z, rotationX, rotationY, rotationZ`, y para baixo); `aplica()` os converte: `position = (x, -y, z)`, `rotation.z = -rotationZ`, conjunto `rotation = (-rotationX, +rotationY, 0)` na ordem `CFG.ordem`. Desenhos de faces e contornos ficam em coordenadas de desenho (y para baixo); `V()` converte para o 3D (y para cima). Câmera: z = 1800 e `fov = 2·atan(h/2/1800)`, então 1 unidade = 1 px no plano z = 0 (mesma escala do CSS). Só redesenha quando `sujo`.

## Geometria de sólidos

- **Disco** (`disco`): parede cilíndrica + duas tampas `CircleGeometry` com textura (UV correto; o UV das tampas do `CylinderGeometry` sai girado). A tampa de trás fica rotacionada 180° em Y e mostra o verso sem espelhar.
- **Tubo** (`tubo`): `LatheGeometry` de um perfil fechado (caixa, bisel); cantos chanfrados evitam o brilho estourado.
- **Extrusão** (`extrudar`, `engrenagem`): `ExtrudeGeometry` com chanfro; dentes, furos e laterais são geometria real, então a peça tem corpo em qualquer ângulo (o empilhamento do CSS sumia de lado).
- **Soldado**: uma malha só, sem as emendas que o CSS deixava entre lateral e tampa.
- **Nunca deixe planos coincidentes**: dá z-fighting (o bisel precisou subir 0,2 sobre a borda da caixa).

### Peças embutidas e apoio

**Peça embutida nasce do contorno da mãe**, nunca de uma quina aproximada desenhada separadamente. `embutido(contornoMae, regiao, recuo = 0)` em `motor/geometria.js` devolve um `THREE.Shape`: interseção da região desejada com o offset interno da mãe. Aceita listas `[x, y]` em coordenadas de desenho (em `deCima`, `[x, z]`), `{ contorno, furos }` ou `THREE.Shape` em coordenadas Three; a região é uma lista de pontos ou um Shape sem furos. O recuo usa a mesma unidade do contorno. Furos da mãe crescem pelo recuo, preservando a distância também até suas bordas; ao cruzar a região, viram reentrâncias reais.

Limitação: contorno externo e cada furo devem ser convexos; a região pode ser côncava, mas o resultado precisa ser conectado. Curvas de Shapes são amostradas com `getPoints(48)`; listas poligonais mantêm suas próprias facetas. O offset desloca as arestas e intersecta as retas vizinhas (cantos em mitra), portanto a curva acompanha o contorno poligonal real da mãe. Recortes vazios, desconectados, contornos degenerados, recuos que eliminam a mãe e tangências ambíguas lançam erro; não há suporte a mães côncavas ou regiões com furos próprios.

`placa()` e `montagem().deCima()` também aceitam esse Shape e preservam seus furos. Em `deCima`, mantenha `t`, `cx` e `cz` do desenho original: os UVs continuam ancorados nas coordenadas físicas, mesmo quando a borda é recortada. Verifique que textos e escalas inteiros cabem na nova face. Assente `y0` da filha exatamente em `y1` da mãe; o bisel já integra a espessura final. O contato das faces de baixo/cima não exige folga visual: são faces opostas entre sólidos opacos.

Declare opcionalmente `apoio: { em: 'chapa', face: 'cima' }` em `partes[filha]`. `em` aponta para a peça física de suporte em `G`, preferindo a folha da árvore; um grupo com parafusos acima da face daria uma cota superior incorreta. O teste `C:/Users/ACER/arsenal-scroll3d/testes/assentamento.mjs` recompõe `partes.m` pela `ARVORE`, mede na unidade do prop sem zoom/câmera e usa a normal da face como Z de medição (Y no Dual deitado). Confere distância absoluta até 0,1, interpenetração até 0,05 e todos os vértices da base por raycast contra o topo da mãe, inclusive seus furos. Uso: `node assentamento.mjs <html relativo a C:/Users/ACER/arsenal-scroll3d>`; imprime `ok`/`FALHA` e sai 1 em falha. No Dual, painel e chapa do seletor usam recuo de 3 mm e base em 112 mm, mantendo os UVs originais de `faces.js`.

## Texturas (faces em SVG)

`Image` com `data:image/svg+xml` para `canvas` para `CanvasTexture` (`encoding = sRGB`, `anisotropy 8`, lado em potência de 2). **Imagem SVG não enxerga as fontes da página**: a fonte vai embutida dentro do SVG (`comFonte: true`, só onde há texto). O lado do quadrado do desenho (`t`) tem de ser o diâmetro da peça, senão a textura sai escalada. Texto que tem que caber: `textLength` + `lengthAdjust="spacing"`. Texto em arco numa face curva: `<textPath href="#id" startOffset="50%" text-anchor="middle">` sobre um círculo concêntrico à ponte, linha de base na faixa, `letter-spacing` em vez de `textLength`.

## Luz e materiais (o que já foi acertado)

- `MeshStandardMaterial` + ambiente gerado por `PMREMGenerator` (céu em degradê + janelas de luz). **Sem ambiente, metal fica preto.**
- Tone mapping ACES estoura rápido: comece com `exposicao` ~0.8 e ajuste no `CFG`, não nos materiais.
- Cor chapada que deve ser escura (ponteiros): `roughness` ~.8 e `envMapIntensity` baixa, senão o reflexo deixa cinza ou rosado.
- Bisel de níquel polido fica quase branco de frente: use cor mais escura (0x8d929a) e `roughness` ~.34.
- **Contra o aspecto de plástico** (aprendido na Nikon F, 2026-10-01): (1) `CFG.sombras` liga sombras projetadas entre as peças, e o `sol` precisa ser forte (~2,6, hemi ~.12) senão a luz do ambiente apaga a sombra; (2) estúdio de produto nas `janelas`: faixas finas e fortes para os brilhos das arestas e uma caixa grande atrás de quem olha para as faces da frente refletirem; céu claro em cima e horizonte escuro; (3) `listrasTex` como `roughnessMap` do metal (escovado/torneado); (4) o desenho da face também como `bumpMap` (gravação afunda); (5) couro com `bumpMap` granulado forte e cor quase preta; (6) parafuso é peça 3D (cabeça abaulada + fenda), nunca desenho na textura: parece adesivo.
- Parede interna de anel visível de lado (retentor do vidro da lente) é preta fosca, nunca cromo: cromo de lado reflete o fundo claro e parece um buraco.
- **Vidro**: não multiplique a opacidade do material pela transparência da textura (some). Tampas com a textura (já com alfa, degradê verde até as bordas), borda de vidro colorida, um disco espelhado por cima (`metalness: 1`, opacidade ~.07) para o reflexo mudar com o ângulo; `depthWrite: false` e `renderOrder` alto.

## Escalas e tamanho

`escalaG` = ajuste à tela (`fit()`, refeito no `resize` e por `ResizeObserver`), `zoomG` = zoom animado (valores fixos). Nunca a mesma escala (o objeto nasce minúsculo depois de um resize, como no CSS). `renderer.setPixelRatio(min(devicePixelRatio, estado.res))`: 2 por padrão; a resolução nativa do iPhone (3) é cara.

## Desenho só depois de pronto

`window.pronto` marca que as peças existem; o ticker só desenha depois. Tocar em `G[nome]` antes quebra com "undefined".

**Torno (`LatheGeometry`) não fecha o perfil**: um perfil que não começa e termina no eixo perde o último lado (a parede de dentro de um anel some e se vê através dele). Feche repetindo o primeiro ponto (`perfilTubo` já faz isso). Ele também alisa o sombreado nos cantos: duplique só os pontos de canto vivo (> 25°) para a aresta sair nítida; duplicar os pontos de uma curva deixa a curva facetada em anéis (o vidro da lente ficou assim). A Nikon F faz as duas coisas em `solido()` (`props/nikon-f/pecas.js`).

**Sombra suave**: `PCFShadowMap` com `shadow.radius` 6–7. O `PCFSoftShadowMap` ignora o raio e deixa a sombra dura e escura demais para um estúdio.

**Furo em extrusão**: o furo precisa girar no sentido contrário ao contorno. O Three só acerta isso sozinho quando o contorno é anti-horário; no outro caso a parede de dentro sai com as faces para fora e o WebGL não a desenha (o anel de foco da Nikon ficou oco e sem a coroa vista de trás). `placa()` corrige sempre. Para conferir: sonda que conta, na parede do furo, triângulos com a normal apontando para fora do furo (tem de dar 0).

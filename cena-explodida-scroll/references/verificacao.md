# Verificação e como ver a cena sem a extensão do Chrome

## Verificação numérica (WebGL)

Confere que as peças voltam ao encaixe exato e que nenhuma para no meio do percurso. Roda na página (console ou puppeteer). `rotationZ` é comparado módulo 360, porque peças que giram várias voltas terminam em `m + 360·n` (mesma pose). Props com árvore e atos têm verificação por ato: `atos3d.mjs` (veja `arvore-atos.md`). Depois de mexer no motor, rode também `cmp3d` no relógio plano (tem que dar 0 px).

```js
tl.scrollTrigger.kill(false); tl.pause();
const nomes = Object.keys(P), props = ['x','y','z','rotationX','rotationY','rotationZ'];
const norm = (k, v) => k === 'rotationZ' ? ((v % 360) + 360) % 360 : Math.round(v * 1000) / 1000;
const ler = () => Object.fromEntries(nomes.map(n => [n, props.map(k => norm(k, P[n][k]))]));
tl.time(0); const ini = ler(); tl.time(tl.duration()); const fim = ler();
const difs = nomes.filter(n => JSON.stringify(ini[n]) !== JSON.stringify(fim[n]));
let ant = null, parados = 0;
for (let t = 1.4; t <= tl.duration() - 1.4; t += 0.2) { tl.time(t); const a = JSON.stringify(ler()); if (a === ant) parados++; ant = a; }
({ pecas: nomes.length, difs, passosParados: parados })
```

Esperado: `difs: []` e `passosParados: 0`. O ângulo do conjunto (`R`) fica fora da conta: pode terminar diferente do início de propósito. No CSS os proxies são os elementos (`gsap.getProperty(el, prop)`).

## Ver a cena com puppeteer (extensão do Chrome desconectada)

`npm install puppeteer-core` no scratchpad e abra o Chrome instalado:

- `executablePath` com barras normais (`C:/Program Files/Google/Chrome/Application/chrome.exe`); em heredoc do Bash, barra invertida some.
- WebGL em modo headless: `args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist']`.
- Espere `window.pronto === true`, depois `tl.scrollTrigger.kill(false); tl.pause();` e, para cada tempo, `tl.time(t); desenha();` e `page.screenshot`.
- **Armadilha:** `page.evaluate(() => tl.time(t))` devolve a própria timeline e o puppeteer trava tentando serializá-la; escreva `{ tl.time(t); }`.
- `clip: {x,y,width,height}` com `deviceScaleFactor: 2` para zoom em arestas e junções.
- Comparar duas versões: renderize as duas nos mesmos tempos e compare pixel a pixel num `<canvas>` (diferença por canal > 12). O refator do motor deu 0 pixels de diferença.
- Com a extensão conectada, `tabs_context_mcp`, `navigate`, `computer` (scroll e screenshot): serve para observar sites de referência (foi assim que vimos o animejs).
- Dois assuntos de peça que sempre valem zoom: a junção entre peças e o texto dentro de caixas.

## Conferência de sobreposições (obrigatória antes de entregar)

`node sobreposicao.mjs <arquivo.html> <t,t,...> [largura altura]` (pasta de testes), em desktop e em 390 x 844, nos instantes de cada ato:

- **faces coincidentes**: cada malha desenhada com uma cor única; pixel isolado de uma malha no meio de outra = duas faces no mesmo plano (z-fighting), vira ruído ao rolar. Corrija afastando ~0,15 mm ou fazendo uma peça entrar na outra; vão de 0,1 mm também pisca a distância. Molas (arame fino) ficam de fora.
- **furos**: pixel de fundo isolado no meio de uma peça (aresta aberta, parede que falta). Vão entre dentes e furo de anel aparecem com contagem pequena e são legítimos.
- **anotações** (com o plugin blueprint): texto sobre peça (> 3% do retângulo), texto sobre texto, texto na borda.

O usuário pediu essa conferência sempre: ele achava, nas capturas, cota em cima da lente, rótulo em cima de anel, fundo do Photomic piscando e números aparecendo em pedaços.

/* Junta o motor + um prop em UM arquivo HTML (um Artefato é um arquivo só).
   Uso: node scripts/compor.cjs <pasta-do-prop> <saida.html> [--plugin <pasta>]...
   O prop tem: manifesto.json, prop.css, fonte.json + arquivos .woff2, config.js, faces.js, pecas.js, partes.js (tabela de peças).
   manifesto.herda = pasta de outro prop (relativa a este): todo arquivo que falta aqui vem de lá (ex.: relogio-arvore herda faces e peças do relogio).
   --plugin junta os módulos de outra skill (cada pasta tem plugin.json com css[], html[], antes[] e depois[]: scripts a juntar antes e depois do arranque do motor). */
const fs = require('fs'), path = require('path');
const raiz = path.resolve(__dirname, '..');
const [pastaProp, saida, ...resto] = process.argv.slice(2);
if (!pastaProp || !saida) { console.error('uso: node compor.cjs <pasta-do-prop> <saida.html> [--plugin <pasta>]'); process.exit(1); }
const lerp = (...p) => fs.readFileSync(path.join(...p), 'utf8');
const prop = path.resolve(pastaProp), man = JSON.parse(lerp(prop, 'manifesto.json'));
const pastaDe = f => man.herda && !fs.existsSync(path.join(prop, f)) ? path.resolve(prop, man.herda) : prop;
const doProp = f => lerp(pastaDe(f), f);
const plugins = []; for (let i = 0; i < resto.length; i++) if (resto[i] === '--plugin') plugins.push(path.resolve(resto[++i]));
const extra = { css: '', html: '', antes: '', depois: '' };
for (const pl of plugins) {
  const pj = JSON.parse(lerp(pl, 'plugin.json'));
  extra.css += (pj.css || []).map(f => lerp(pl, f)).join('\n');
  extra.html += (pj.html || []).map(f => lerp(pl, f)).join('\n');
  extra.antes += (pj.antes || []).map(f => lerp(pl, f)).join('\n');       // depois do motor e antes do arranque
  extra.depois += (pj.depois || []).map(f => lerp(pl, f)).join('\n');     // depois do arranque
}
const motor = f => lerp(raiz, 'motor', f);
/* a fonte fica como .woff2 binário no prop e vira @font-face em base64 só aqui, no arquivo gerado */
function fonteCssDe(pasta) {
  const info = JSON.parse(lerp(pasta, 'fonte.json'));
  let css = '';
  for (const f of info.arquivos) {
    const binario = fs.readFileSync(path.join(pasta, f.arquivo));
    const b64 = binario.toString('base64');
    css += '@font-face{font-family:' + info.familia + ';font-weight:' + f.peso + ';';
    css += 'src:url(data:font/woff2;base64,' + b64 + ") format('woff2');}";
  }
  return css;
}
const fonteCss = fonteCssDe(pastaDe('fonte.json'));
const scripts = [
  doProp('config.js'), motor('util.js'), motor('texturas.js'), motor('cena.js'), motor('geometria.js'),
  doProp('faces.js'), doProp('pecas.js'), doProp('partes.js'), motor('timeline.js'), motor('painel.js'), extra.antes, motor('arranque.js'), extra.depois,
].join('\n\n');
const html = `<title>${man.titulo}</title>
<style id="fonte">${fonteCss}</style>
<style>
${doProp('prop.css')}
${motor('base.css')}
${extra.css}
</style>

<div id="pista"><section class="palco"><canvas id="c"></canvas></section></div>
<div class="dica" id="dica" hidden>${man.dica}</div>
<button class="inicio" id="inicio" type="button"><span>${man.toque}</span></button>
<div class="hud" id="hud"><div><b id="hud-fps">fps …</b></div><div id="hud-info"></div>
  <div class="chaves"><button id="c-res"></button><button id="c-suav"></button></div></div>
${extra.html}

<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
<script>
${scripts}
</script>
`;
fs.writeFileSync(saida, html); console.log(saida, (html.length / 1024).toFixed(0) + ' KB');

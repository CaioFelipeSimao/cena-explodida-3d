/* Motor: SVG -> textura. A fonte do projeto vai embutida em cada SVG (imagem SVG não enxerga as fontes da página):
   o CSS com @font-face em base64 fica no <style id="fonte"> da casca. t = lado do quadrado do desenho em unidades (= diâmetro da peça,
   para o UV bater); px = lado da textura (potência de 2). comFonte só onde há texto, porque a fonte pesa ~60 KB por textura. */
const FONT_CSS = $('fonte').textContent;
const svgTex = (inner, t, px, comFonte) => new Promise(ok => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${-t / 2} ${-t / 2} ${t} ${t}" width="${px}" height="${px}">${comFonte ? `<style>${FONT_CSS}</style>` : ''}${inner}</svg>`;
  const img = new Image();
  img.onload = () => {
    const cv = document.createElement('canvas'); cv.width = cv.height = px;
    cv.getContext('2d').drawImage(img, 0, 0, px, px);
    const tx = new THREE.CanvasTexture(cv); tx.encoding = THREE.sRGBEncoding; tx.anisotropy = 8; ok(tx);
  };
  img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
});
/* textura retangular (faixas de texto em volta de anéis, placas compridas): viewBox 0 0 w h esticado em pxW x pxH */
const svgTexR = (inner, w, h, pxW, pxH, comFonte) => new Promise(ok => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" width="${pxW}" height="${pxH}">${comFonte ? `<style>${FONT_CSS}</style>` : ''}${inner}</svg>`;
  const img = new Image();
  img.onload = () => {
    const cv = document.createElement('canvas'); cv.width = pxW; cv.height = pxH;
    cv.getContext('2d').drawImage(img, 0, 0, pxW, pxH);
    const tx = new THREE.CanvasTexture(cv); tx.encoding = THREE.sRGBEncoding; tx.anisotropy = 8; ok(tx);
  };
  img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
});

/* listras finas em tons de cinza (variação de brilho do metal): sem mapa, metal de computador parece plástico. Faixas horizontais =
   escovado nas faces planas e torneado nas peças de revolução (o v do torno corre ao longo do perfil). Usado como roughnessMap. */
function listrasTex(n = 512, base = 150, amp = 40, semente = 3) {
  const cv = document.createElement('canvas'); cv.width = 64; cv.height = n; const x = cv.getContext('2d');
  let s = semente; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < n; i++) { const g = Math.max(0, Math.min(255, base + (rnd() - .5) * amp + (rnd() < .04 ? amp : 0))) | 0; x.fillStyle = `rgb(${g},${g},${g})`; x.fillRect(0, i, 64, 1); }
  const t = new THREE.CanvasTexture(cv); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
}
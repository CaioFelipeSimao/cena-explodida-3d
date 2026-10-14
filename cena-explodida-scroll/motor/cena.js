/* Motor: renderer, câmera, ambiente, luzes, grupos, proxies e desenho sob demanda. Lê CFG (config do prop).
   Câmera com z = 1800 e fov calculado da altura: 1 unidade = 1 px no plano z = 0 (mesma perspectiva do CSS 3D).
   Escalas em grupos separados: escalaG = ajuste à tela (refeito no resize), zoomG = zoom animado pelo scroll (valores fixos).
   Os tweens do GSAP animam PROXIES ({x,y,z,rotationX...} em convenção CSS); aplica() copia os proxies para os objetos 3D. */
const palco = document.querySelector('.palco'), canvas = $('c');
const estado = { res: 2, suav: 0.6 };
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
renderer.outputEncoding = THREE.sRGBEncoding; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = CFG.exposicao;
renderer.setClearColor(0x000000, 0);
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(30, 1, 100, 8000); camera.position.set(0, 0, 1800);

/* ambiente para os metais refletirem: céu em degradê + janelas de luz (PMREM); sem isso metal fica preto */
(function ambiente() {
  const env = new THREE.Scene(), cv = document.createElement('canvas'); cv.width = 4; cv.height = 256;
  const x = cv.getContext('2d'), g = x.createLinearGradient(0, 0, 0, 256);
  CFG.ceu.forEach((c, i) => g.addColorStop([0, .45, .55, 1][i], c));
  x.fillStyle = g; x.fillRect(0, 0, 4, 256);
  const tx = new THREE.CanvasTexture(cv); tx.encoding = THREE.sRGBEncoding;
  env.add(new THREE.Mesh(new THREE.SphereGeometry(50, 32, 16), new THREE.MeshBasicMaterial({ map: tx, side: THREE.BackSide })));
  CFG.janelas.forEach(([px, py, pz, w, h, forca]) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(forca, forca, forca), side: THREE.DoubleSide }));
    m.position.set(px, py, pz); m.lookAt(0, 0, 0); env.add(m);
  });
  const pm = new THREE.PMREMGenerator(renderer); scene.environment = pm.fromScene(env, 0.03).texture; pm.dispose();
})();
const sol = new THREE.DirectionalLight(0xffffff, CFG.sol); sol.position.set(-400, 500, 700); scene.add(sol);
/* sombras (opcional, CFG.sombras = { raio, mapa }): as peças projetam sombra umas nas outras; custa uma passada de profundidade por quadro */
if (CFG.sombras) {
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFShadowMap;   // PCF (não o Soft): só ele respeita o raio de desfoque, e sombra de estúdio é suave
  const s = CFG.sombras, c = sol.shadow.camera; sol.castShadow = true; sol.shadow.mapSize.set(s.mapa || 2048, s.mapa || 2048);
  c.left = c.bottom = -(s.raio || 900); c.right = c.top = s.raio || 900; c.near = 100; c.far = 3000; sol.shadow.bias = -0.0004; sol.shadow.normalBias = s.normalBias || 1.2; sol.shadow.radius = s.suave || 6;
}
scene.add(new THREE.HemisphereLight(0xffffff, 0x8a9096, CFG.hemi));

const escalaG = new THREE.Group(), zoomG = new THREE.Group(), raizG = new THREE.Group();
scene.add(escalaG); escalaG.add(zoomG); zoomG.add(raizG);
const G = {}, P = {}, R = {}, Z = { scale: CFG.grande };   // G: peças (objetos 3D), P: proxies das peças, R: proxy da rotação do conjunto, Z: proxy do zoom

const mat = (cor, rough, metal, extra) => new THREE.MeshStandardMaterial(Object.assign({ color: cor, roughness: rough, metalness: metal }, extra));

let sujo = true;   // só redesenha quando algo mudou
const depoisAplica = [];
const aplica = () => {
  /* a peça gira nos três eixos, com o mesmo sinal do conjunto (rotationX/Y valem 0 nos props antigos: tampa com dobradiça e prato deitado usam X e Y) */
  for (const n in P) { const p = P[n], g = G[n]; g.position.set(p.x, -p.y, p.z); g.rotation.set(-rad(p.rotationX), rad(p.rotationY), -rad(p.rotationZ)); }
  raizG.rotation.set(-rad(R.rotationX), rad(R.rotationY), 0, CFG.ordem);
  zoomG.scale.setScalar(Z.scale);
  if (temAtos) aplicaAtos();   // árvore e atos: saída de cena, transparência e foco (timeline.js)
  for (const f of depoisAplica) f();   // plugins somam por cima (cena-explodida-interativa: abertura e arrasto), sem tocar nos proxies da rolagem
};
let renderizar = () => renderer.render(scene, camera);   // um plugin pode trocar o desenho do quadro (cena-blueprint-3d: passe de linhas)
const desenha = () => { aplica(); renderizar(); };

const fit = () => Math.max(0.3, Math.min(palco.clientWidth / CFG.fit.largura, palco.clientHeight / CFG.fit.altura, CFG.fit.max));
const tamanho = () => {
  const w = palco.clientWidth, h = palco.clientHeight; if (!w || !h) return;
  renderer.setPixelRatio(Math.min(devicePixelRatio, estado.res)); renderer.setSize(w, h, false);
  camera.aspect = w / h; camera.fov = 2 * Math.atan(h / 2 / 1800) * 180 / Math.PI; camera.updateProjectionMatrix();
  escalaG.scale.setScalar(fit()); sujo = true;
};
new ResizeObserver(() => { tamanho(); clearTimeout(tamanho.rt); tamanho.rt = setTimeout(() => ScrollTrigger.refresh(), 150); }).observe(palco);

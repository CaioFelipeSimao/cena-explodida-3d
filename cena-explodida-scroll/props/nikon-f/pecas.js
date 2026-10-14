/* Peças da Nikon F Photomic: as 58 do esquema (e as sub-peças do Photomic, da lente e do obturador). Medidas em mm (ficha.md), 1 mm = 2 unidades.
   Cada peça é desenhada no lugar onde fica montada (x para a direita de quem olha de frente, y a partir do fundo da câmera, z para a frente)
   e depois recentrada no seu pivô: o m da tabela vem do pivô, e o e/d do partes.js são deslocamentos a partir dele. */
const U = 2, Y0 = 46;                         // escala e altura (mm) do centro do conjunto
const LX = 13.5, LY = 33;                     // eixo da lente e do visor (deslocado 13,5 mm para o lado da rebobinagem, como na peça)
const BX = 73.5, BZ = 17;                     // meia largura e meia profundidade do corpo
const PIVO = {};

/* couro granulado: manchas aleatórias num canvas, usadas como cor e relevo. rep = mm por ladrilho */
function couroTex() {
  const cv = document.createElement('canvas'); cv.width = cv.height = 512; const x = cv.getContext('2d');
  x.fillStyle = '#3a3a3a'; x.fillRect(0, 0, 512, 512);
  let s = 7; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 5200; i++) {
    const px = rnd() * 512, py = rnd() * 512, r = 2.5 + rnd() * 4.5, g = 70 + rnd() * 70 | 0;
    for (const [dx, dy] of [[0, 0], [512, 0], [-512, 0], [0, 512], [0, -512]]) { x.beginPath(); x.ellipse(px + dx, py + dy, r, r * (.7 + rnd() * .3), rnd() * 3, 0, TAU); x.fillStyle = `rgb(${g},${g},${g})`; x.fill(); }
  }
  const t = new THREE.CanvasTexture(cv); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
}
const M = {};
function materiais() {
  const relevo = couroTex();
  const couro = rep => { const b = relevo.clone(); b.needsUpdate = true; b.repeat.set(rep, rep);
    return mat(0x050506, .56, 0, { bumpMap: b, bumpScale: 2.4, envMapIntensity: .5 }); };
  /* variação de brilho do metal: escovado nas faces planas, torneado nas peças de revolução (roughness x mapa) */
  const escov = listrasTex(512, 128, 50, 3), torno = listrasTex(256, 140, 60, 11);
  Object.assign(M, {
    cromo: mat(0xe0e2e4, .5, 1, { roughnessMap: escov }), cromoE: mat(0x9a9ea2, .45, 1, { roughnessMap: escov }), aco: mat(0xaab0b6, .5, 1, { roughnessMap: torno }),
    preto: mat(0x141516, .42, .35, { envMapIntensity: .6 }), anod: mat(0x0f1011, .6, .55, { envMapIntensity: .7, roughnessMap: torno }),
    fosco: mat(0x0b0b0c, .9, 0, { envMapIntensity: .1 }), plastico: mat(0x121213, .5, 0, { envMapIntensity: .5 }),
    espelho: mat(0xe6ecf0, .04, 1, { envMapIntensity: 1.3 }),
    latao: mat(0xb08e55, .42, 1, { roughnessMap: torno }), niquel: mat(0xb9bcbc, .36, 1, { roughnessMap: escov }), titanio: mat(0x5f5c57, .5, .85),
    despolido: mat(0xdfe3e2, .85, 0, { transparent: true, opacity: .9, envMapIntensity: .6 }),
    vidroLente: mat(0x3b2a0e, .05, .85, { transparent: true, opacity: .86, envMapIntensity: 1.8 }), vidroOcular: mat(0x0c1419, .04, .3, { envMapIntensity: 1.4 }),
    prisma: mat(0x9fb8c4, .05, 0, { transparent: true, opacity: .45, depthWrite: false, envMapIntensity: 1.4 }),
    couroMm: couro(1 / 18),   // paredes extrudadas: UV em mm
    couro: couro,
  });
}
/* face com desenho: o mesmo desenho vira relevo (gravações e parafusos afundam, a escovação aparece) */
const comTex = (base, tex, relevo = .35) => { const m = base.clone(); m.map = tex; m.color.set(0xffffff); m.bumpMap = tex; m.bumpScale = relevo; return m; };
/* parafuso de fenda de verdade: cabeça abaulada de aço e a fenda escura, virado para +z */
const parafuso3d = (x, y, z, r, rot = 0) => { const g = new THREE.Group();
  g.add(tubo([[0, 0], [r, 0], [r, r * .2], [r * .72, r * .52], [0, r * .62]], 20, M.aco));
  const f = new THREE.Mesh(new THREE.BoxGeometry(r * 1.75, r * .26, r * .5), M.fosco); f.position.z = r * .5; f.rotation.z = rot; g.add(f);
  return em(g, x, y, z); };

/* mola helicoidal de arame (eixo vertical), de y0 a y1 */
const mola = (x, z, y0, y1, r, fio, voltas, material) => { const pts = [], n = voltas * 16;
  for (let i = 0; i <= n; i++) { const a = i / 16 * TAU; pts.push(new THREE.Vector3(Math.cos(a) * r, y0 + (y1 - y0) * i / n - Y0, Math.sin(a) * r)); }
  const m = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), n * 2, fio, 6), material); m.position.set(x, 0, z); return m; };
/* engrenagem deitada (eixo vertical), centro da espessura em yc */
const engY = (N, pr, mod, x, yc, z, prof, material, furos = 0, fase = 0) => { const g = engrenagem(N, pr, mod, fase, material, furos, prof); g.rotation.x = -Math.PI / 2; return em(g, x, yc, z); };
/* engrenagem em pé (eixo z, virada para a frente) */
const engZ = (N, pr, mod, x, y, zc, prof, material, furos = 0) => em(engrenagem(N, pr, mod, 0, material, furos, prof), x, y, zc);
/* eixo vertical: cilindro de raio r de y0 a y1 */
const eixoV = (x, z, y0, y1, r, material) => eixoY([[0, y0], [r, y0], [r, y1], [0, y1]], x, z, 16, material);

/* ---- ajudantes de posição (mm do mundo) ---- */
const em = (o, x, y, z) => { o.position.set(x, y - Y0, z); return o; };
/* sólido de planta (contorno [x, z] visto de cima) extrudado na vertical de y0 a y1; materiais [topo, lado, fundo] */
function deCima(contorno, furos, y0, y1, bisel, mats, t = 150) {
  const m = placa(contorno.map(([x, z]) => [x, z]), furos, y1 - y0, bisel, mats, t);
  m.rotation.x = -Math.PI / 2; m.position.y = (y0 + y1) / 2 - Y0; return m;
}
/* sólido de frente (contorno [x, y] visto de frente, y para cima) extrudado em z de z0 a z1, centrado em (cx, cy) */
function deFrente(contorno, furos, cx, cy, z0, z1, bisel, mats, t) {
  const f = c => c.map(([x, y]) => [x - cx, -(y - cy)]);
  const m = placa(f(contorno), (furos || []).map(f), z1 - z0, bisel, mats, t); return em(m, cx, cy, (z0 + z1) / 2);
}
/* sólido de perfil (contorno [z, y] visto do lado) extrudado em x de x0 a x1 */
function deLado(contorno, x0, x1, bisel, mats) {
  const m = placa(contorno.map(([z, y]) => [-z, -(y - Y0)]), null, x1 - x0, bisel, mats, 200);
  m.rotation.y = Math.PI / 2; m.position.set((x0 + x1) / 2, 0, 0); return m;
}
/* sólido de revolução em volta de um eixo vertical (botões) ou do eixo da lente (z). O perfil é FECHADO aqui (o torno não fecha sozinho:
   faltava a parede de dentro dos anéis e se via através deles) e cada canto é duplicado, para a aresta sair viva e não arredondada no sombreado. */
const solido = p => { if (p.length < 3) return p; const f = p[0], u = p[p.length - 1], c = (f[0] !== u[0] || f[1] !== u[1]) && f[0] > 0 && u[0] > 0 ? [...p, f] : p; const ang = (a, b) => Math.atan2(b[1] - a[1], b[0] - a[0]);
  return c.flatMap((q, i) => { if (!i || i === c.length - 1) return [q]; let d = Math.abs(ang(q, c[i + 1]) - ang(c[i - 1], q)); if (d > Math.PI) d = 2 * Math.PI - d; return d > .45 ? [q, q] : [q]; }); };   // só canto vivo (> 25°): curva continua lisa
const eixoY = (perfil, x, z, seg, material) => { const m = tubo(solido(perfil), seg, material); m.rotation.x = -Math.PI / 2; return em(m, x, 0, z); };   // perfil [r, y] com y medido do fundo
const eixoZ = (perfil, seg, material) => em(tubo(solido(perfil), seg, material), LX, LY, 0);
/* disco de botão (tampas com textura) com o eixo na vertical, topo em y */
const discoY = (r, h, x, yTopo, z, seg, matLado, texTopo, matTopo) => { const d = disco(r, h, seg, matLado, texTopo, null, matTopo, matLado); d.rotation.x = -Math.PI / 2; return em(d, x, yTopo - h / 2, z); };
/* faixa: superfície cilíndrica de raio r entre z0 e z1 em volta do eixo da lente, com textura que dá a volta (u = ângulo) */
/* no eixo da lente o u do torno corre ao contrário do eixo vertical: sem inverter, os números saíam espelhados */
const faixa = (r, z0, z1, tex, rough = .4) => { tex.wrapS = THREE.RepeatWrapping; tex.repeat.x = -1; return eixoZ([[r, z0], [r, z1]], 96, new THREE.MeshStandardMaterial({ map: tex, roughness: rough, metalness: .4, side: THREE.FrontSide })); };
/* coroa: face plana em anel (r0 a r1) virada para a frente, no plano z, com textura que dá a volta */
const coroa = (r0, r1, z, tex) => eixoZ([[r1, z], [r0, z]], 96, new THREE.MeshStandardMaterial({ map: tex, roughness: .4, metalness: .4 }));
/* canelado: contorno com n caneluras arredondadas (anel de foco, botões) */
const canelado = (R, n, a, pts = 8) => Array.from({ length: n * pts }, (_, i) => pol(R - a * (.5 - .5 * Math.cos(i * TAU / pts)), i * 360 / (n * pts)));
const octo = (x0, x1, z0, z1, chF, chT) => [[x0, z1 - chF], [x0 + chF, z1], [x1 - chF, z1], [x1, z1 - chF], [x1, z0 + chT], [x1 - chT, z0], [x0 + chT, z0], [x0, z0 + chT]];

/* peça: junta os objetos (já no lugar, em mm) num grupo recentrado no pivô [x, y, z] (mm do mundo) e escalado para unidades */
function peca(nome, pivo, ...objs) {
  const g = new THREE.Group(), dentro = new THREE.Group();
  objs.forEach(o => dentro.add(o)); dentro.position.set(-pivo[0], -(pivo[1] - Y0), -pivo[2]);
  g.add(dentro); g.scale.setScalar(U); G[nome] = g; raizG.add(g);
  PIVO[nome] = { x: pivo[0] * U, y: -(pivo[1] - Y0) * U, z: pivo[2] * U };
}

async function construirPecas() {
  materiais();
  const pe = 2 * Math.PI;
  const [tPh, tJan, tAsa, tVel, tCont, tReb, tCapaE, tCapaD, tCaixa, tFundo, tChave, tAsaF, tOcular, tFxVel, tFxAb, tFxDist, tFxFr] = await Promise.all([
    svgTex(photomicF, 55, 1024, true), svgTex(janelaF, 16, 256, true), svgTex(asaF, 22, 512, true), svgTex(velocidadesF, 20, 512, true),
    svgTex(contadorF, 18, 512, true), svgTex(rebobinarF, 18, 256, true), svgTex(capaEF, 34, 512, true), svgTex(capaDF, 60, 512, false),
    svgTex(caixaF, 56, 512, false), svgTex(fundoF, 150, 2048, true), svgTex(chaveF, 14, 256, false), svgTex(asaFundoF, 12, 256, true),
    svgTex(ocularB, 20, 256, false),
    svgTexR(faixaVelocidades(pe * 12.6), pe * 12.6, 5, 2048, 64, true), svgTexR(faixaAbertura(pe * 30.05), pe * 30.05, 6, 2048, 64, true),
    svgTexR(faixaDistancia(pe * 30.25), pe * 30.25, 4.5, 2048, 64, true), svgTexR(faixaFrente(pe * 23.5), pe * 23.5, 5, 2048, 64, true),
  ]);
  const [tDesp, tContR, tSinc, tTit, tTitRolo, tEsp] = await Promise.all([svgTex(despolidoF, 40, 512, false), svgTex(contadorRodaF, 13.2, 256, true), svgTex(sincroF, 5.2, 128, true),
    svgTexR(titanioF(44, 30), 44, 30, 1024, 512, false), svgTexR(titanioF(30, 16), 30, 16, 512, 256, false), svgTex(esportivoF, 60, 512, false)]);

  /* ---- costas (36): fundo cromado + painel de couro, uma peça só; a chave OPEN/LOCK e a porca de tripé (49) ---- */
  const corpoPlanta = octo(-BX, BX, -BZ, BZ, 4, 2.5);
  const fundo = deCima(corpoPlanta, null, 0, 7, .6, [M.cromo, M.cromo, comTex(M.cromo, tFundo)]);
  const painel = deFrente(retangulo(146, 52).map(([x, y]) => [x, y + 33]), null, 0, 33, -BZ, -14.6, .5, [M.preto, M.preto, M.couro(146 / 18)], 146);
  const rebites = [-50, 0, 50].map(x => em(new THREE.Mesh(new THREE.SphereGeometry(.7, 10, 6), M.cromoE), x, 3.5, -BZ - .1));
  peca('fundo', [0, 3.5, 0], fundo, painel, ...rebites);
  const chave = discoY(7, 1.6, 50, -.0, -2, 40, M.cromo, tChave, comTex(M.cromo, tChave)); chave.rotation.x = Math.PI / 2;
  const alca = deFrente([[-1, 0], [1, 0], [1, 9], [-1, 9]], null, 0, 0, 0, 1.4, .3, M.cromoE, 20); alca.rotation.x = Math.PI / 2; em(alca, 50, -1.9, -6);
  peca('chave', [50, -.8, -2], chave, alca);
  const tripe = eixoY(perfilTubo(5.5, 2.6, .9, .3), 0, 0, 32, M.cromoE); tripe.position.y = -.6 - Y0;
  const furo = eixoY([[0, -.7], [2.5, -.7], [2.5, .7], [0, .7]], 0, 0, 24, M.fosco); furo.position.y = -.5 - Y0;
  const asaFundo = discoY(6, .8, -61, -.1, 0, 40, M.anod, tAsaF, comTex(M.anod, tAsaF)); asaFundo.rotation.x = Math.PI / 2;
  peca('tripe', [0, -.6, 0], tripe, furo, asaFundo);

  /* ---- casco do corpo (24): duas paredes em L de couro (a caixa do espelho passa no meio), friso preto em cima, câmara do filme por dentro ---- */
  const parede = (xa, xb, lado) => { const s = lado, xo = s < 0 ? -BX : BX, xi = s < 0 ? -BX + 2.5 : BX - 2.5;
    return [[xo, -14.6], [xo, BZ - 4], [xo - s * 4, BZ], [xb, BZ], [xb, BZ - 2.5], [xi - s * 3, BZ - 2.5], [xi, BZ - 5], [xi, -14.6]]; };
  const L = deCima(parede(-BX, -14.5, -1), null, 7, 59, 0, [M.preto, M.couroMm, M.preto]);
  const R = deCima(parede(BX, 41.5, 1), null, 7, 59, 0, [M.preto, M.couroMm, M.preto]);
  const friso = deCima([[-BX + 2.5, -BZ], [BX - 2.5, -BZ], [BX, -14.5], [BX, BZ - 4], [BX - 4, BZ], [41.5, BZ], [41.5, -10], [-14.5, -10], [-14.5, BZ], [-BX + 4, BZ], [-BX, BZ - 4], [-BX, -14.5]], null, 59, 62, .4, [M.preto, M.preto, M.preto]);
  const camaraFilme = deFrente(retangulo(118, 50).map(([x, y]) => [x, y + 33]), [retangulo(38, 26).map(([x, y]) => [x + LX, y + LY])], 0, 33, -12, -10, .3, [M.fosco, M.preto, M.preto], 120);
  const trilhos = [-1, 1].map(s => em(new THREE.Mesh(new THREE.BoxGeometry(44, 1.2, 1.2), M.aco), LX, LY + s * 14.5, -12.6));
  peca('casco', [0, 33, 0], L, R, friso, camaraFilme, ...trilhos);

  /* ---- caixa do espelho (50) com a boca da baioneta; o espelho (57) a 45° dentro ---- */
  const caixa = deFrente(retangulo(55.8, 54.7).map(([x, y]) => [x + LX, y + 34.65]), [circulo(LX, LY, 22.5, 64)], LX, 34.65, -8, 26, .5, [comTex(M.cromo, tCaixa), M.cromo, M.preto], 56);
  const garganta = eixoZ(perfilTubo(22.45, 21.7, 17, .2).map(([r, z]) => [r, z + 9]), 64, M.fosco);
  const aro = eixoZ(perfilTubo(27, 22.2, 2.7, .5).map(([r, z]) => [r, z + 27.7]), 96, M.cromo);
  const garras = [30, 150, 270].map(a => { const pts = []; for (let k = -18; k <= 18; k += 6) pts.push(pol(22.3, a + k)); for (let k = 18; k >= -18; k -= 6) pts.push(pol(20.4, a + k));
    return em(extrudar([pts], 1.6, .3, M.cromo), LX, LY, 28.4); });
  const parafusosCx = [[-25, 59], [25, 59], [-25, 10], [25, 10]].map(([dx, y], i) => parafuso3d(LX + dx, y, 26, 1.1, .6 + i));
  peca('caixaEspelho', [LX, LY, 8], caixa, garganta, aro, ...garras, ...parafusosCx);
  const espelho = em(placa(retangulo(36, 25, 1.5), null, 1.4, .3, [M.espelho, M.preto, M.preto], 40), LX, LY + 1, 1); espelho.rotation.x = -Math.PI / 4;
  peca('espelho', [LX, LY + 1, 1], espelho);
  /* vidro de foco (51): sai por cima quando o visor é tirado, como na F */
  const desp = em(placa(retangulo(36, 24, 1), null, 1.4, .3, [comTex(M.despolido, tDesp, .05), M.preto, M.despolido], 40), LX, 62.3, 5); desp.rotation.x = -Math.PI / 2;
  peca('despolido', [LX, 62.3, 5], desp);

  /* ---- frente: alavanca do temporizador (55/56), botão de profundidade de campo (53), trava da lente (52) ---- */
  const pivoT = eixoY(perfilTubo(4.6, 0, 1.6, .4), 0, 0, 40, M.cromo); pivoT.rotation.x = 0; em(pivoT, -38, 22, BZ + 1.6);
  const braco = deFrente([[-1.6, 22], [1.6, 22], [1.1, 39], [0, 40], [-1.1, 39]].map(([x, y]) => [x - 38, y]), null, -38, 30, BZ + 2.4, BZ + 4.6, .4, M.cromo, 20);
  peca('temporizador', [-38, 22, BZ + 1.6], pivoT);
  peca('alavancaTemp', [-38, 30, BZ + 3.5], braco);
  const botao = (x, y, r, h) => { const b = eixoZ(perfilTubo(r, 0, h / 2, .5).map(([rr, z]) => [rr, z + BZ + h / 2]), 32, M.cromo); b.position.set(x, y - Y0, 0); return b; };
  peca('profundidade', [-21, 45, BZ + 2], botao(-21, 45, 3.2, 3.6));
  peca('travaLente', [49, 28, BZ + 2], botao(49, 28, 3.6, 4.2));
  /* trava do espelho levantado (54): lingueta ao lado do botão de profundidade; trava do Photomic no corpo (46): lingueta em cima da caixa */
  const trEsp = deFrente([[-25.5, 40.5], [-16.5, 40.5], [-16.5, 42], [-23, 43], [-25.5, 42.4]], null, -21, 41.6, BZ, BZ + 1.2, .3, M.cromoE, 12);
  peca('travaEspelho', [-21, 41.6, BZ + .6], trEsp, botao(-24.5, 41.6, 1, 1.6));
  const trPh = deCima([[36, 18.5], [41, 18.5], [41.6, 21.6], [36.6, 22.4]], null, 61.6, 63.2, .3, M.cromoE, 10);
  peca('travaPhotomic', [38.8, 62.4, 20], trPh);

  /* ---- tampa direita (10) com o seletor de velocidades (11), o disparador (14), o contador (13) e a alavanca de avanço (9) ---- */
  /* Faces de contato em mm: os pivôs não mudam. Só o bordo interno cresce 0,5 mm;
     botões, furos e UV continuam ancorados nas mesmas coordenadas do corpo. */
  const phX0 = -14, phX1 = 41, basePh = 62, topoTampas = 76;
  const plantaD = [[-BX, BZ - 4], [-BX + 4, BZ], [phX0 - 1.2, BZ], [phX0, BZ],
    [phX0, -BZ], [phX0 - 1.2, -BZ], [-BX + 2.5, -BZ], [-BX, -BZ + 2.5]];
  const plantaE = [[phX1, BZ], [phX1 + 1.2, BZ], [BX - 4, BZ], [BX, BZ - 4],
    [BX, -BZ + 2.5], [BX - 2.5, -BZ], [phX1 + 1.2, -BZ], [phX1, -BZ]];
  /* placa() recua as tampas da extrusão em bisel * 5/6. Zera esse recuo só
     no encontro: x plano e os dois cantos internos, sem chanfrar a junta.
     Os pontos a 1,2 mm limitam a transição para o bisel das arestas externas.
     deCima: posição local [x, -z, altura da extrusão]. */
  const juntaTampa = (m, x, bisel) => {
    const pos = m.geometry.attributes.position, recuo = bisel * 5 / 6, eps = 1e-4;
    for (let i = 0; i < pos.count; i++) {
      if (Math.abs(pos.getX(i) - x) > recuo + eps) continue;
      pos.setX(i, x);
      const z = pos.getY(i);
      if (Math.abs(z) >= BZ - recuo - eps) pos.setY(i, Math.sign(z) * BZ);
    }
    pos.needsUpdate = true; m.geometry.computeVertexNormals(); return m;
  };
  /* tampa oca (paredes + teto): o mecanismo de cima mora dentro dela */
  const paredeD = deCima(plantaD, [octo(-BX + 1.2, -15.7, -BZ + 1.2, BZ - 1.2, 3.4, 2)], basePh, 74.6, 0, [M.cromo, M.cromo, M.preto]);
  const capaD = juntaTampa(deCima(plantaD, null, 74.6, topoTampas, .5, [comTex(M.cromo, tCapaD), M.cromo, M.preto], 60), phX0, .5);
  const presilha = s => { const x = s * (BX + 1.6), p = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.1, 3.4, 16), M.cromo); p.rotation.z = Math.PI / 2; em(p, s * (BX + .8), 68, 0);
    const a = new THREE.Mesh(new THREE.TorusGeometry(2.6, .55, 10, 28), M.cromo); a.rotation.y = Math.PI / 2; return [p, em(a, x + s * .6, 65.4, 0)]; };
  peca('capaD', [-44, 69, 0], capaD, paredeD, ...presilha(-1));
  const velCorpo = deCima(serrilha(10.6, 48, .5), null, 76, 82.4, .3, [M.cromo, M.cromo, M.cromo], 22); velCorpo.position.x = -23; velCorpo.position.z = 2;
  peca('velocidades', [-23, 79, 2], velCorpo, discoY(10, .5, -23, 82.65, 2, 64, M.cromo, tVel, comTex(M.cromo, tVel)));
  const colar = deCima(serrilha(6.4, 30, .35), [circulo(0, 0, 3.8, 24)], 76, 78.6, .25, M.cromo, 14); colar.position.x = -40; colar.position.z = 3;
  const gat = eixoY([[0, 76], [3.4, 76], [3.4, 81.6], [2.9, 82.1], [0, 82.1]], -40, 3, 32, M.cromo);
  const rosca = discoY(1.2, .3, -40, 82.2, 3, 16, M.fosco);
  peca('disparador', [-40, 79, 3], colar, gat, rosca);
  /* contador (13): a roda de números; capa do contador (7): o aro cromado em volta dela */
  peca('contador', [-59, 77.4, 0], discoY(6.5, 2.4, -59, 78.6, 0, 64, M.anod, tContR, comTex(M.anod, tContR, .1)));
  peca('capaContador', [-59, 77.6, 0], eixoY([[6.7, 76], [9, 76], [9, 78.6], [8.4, 79.2], [6.7, 79.2]], -59, 0, 64, M.cromo));
  const alavanca = deCima([[-62.5, -1], [-55.5, -3.5], [-33, -12.8], [-31, -15.2], [-32.5, -16.5], [-58, -7.5], [-63, -4.5]], null, 79.4, 81.4, .4, M.cromo, 40);
  const ponta = deCima([[-34.6, -11.2], [-30.4, -13.6], [-29.6, -16.8], [-33.2, -17.6], [-36.2, -15.4]], null, 79, 81.8, .5, M.plastico, 10);
  const eixoAv = discoY(3.2, 1.2, -59, 82.6, 0, 32, M.cromoE);
  peca('alavanca', [-59, 80, 0], alavanca, ponta, eixoAv);

  /* ---- tampa esquerda (41) e a manivela de rebobinar (37) ---- */
  const capaE = juntaTampa(deCima(plantaE, null, basePh, topoTampas, .8, [comTex(M.cromo, tCapaE), M.cromo, M.preto], 34), phX1, .8);
  capaE.position.x = 0;
  /* o desenho do topo é centrado na peça: recentra o UV em x = 57,5 */
  { const uv = capaE.geometry.attributes.uv, pos = capaE.geometry.attributes.position, n = capaE.geometry.groups[1].count * 2;
    for (let i = 0; i < n; i++) uv.setX(i, (i < n / 2 ? -1 : 1) * (pos.getX(i) - 57.5) / 34 + .5);
    const ud = capaD.geometry.attributes.uv, pd = capaD.geometry.attributes.position, nd = capaD.geometry.groups[1].count * 2;
    for (let i = 0; i < nd; i++) ud.setX(i, (i < nd / 2 ? -1 : 1) * (pd.getX(i) + 44) / 60 + .5); }
  peca('capaE', [57.5, 69, 0], capaE, ...presilha(1));
  const rebBase = deCima(serrilha(9, 40, .45), null, 76, 83.4, .3, M.cromo, 18); rebBase.position.x = 57; rebBase.position.z = 2;
  const rebTopo = discoY(9, .5, 57, 83.65, 2, 64, M.cromo, tReb, comTex(M.cromo, tReb));
  const manivela = deCima([[52.5, 1], [57, -.6], [61.5, 1], [60, 3.4], [54, 3.4]].map(([x, z]) => [x, z - 2]), null, 83.9, 85.3, .35, M.cromo, 12);
  peca('rebobinar', [57, 80, 2], rebBase, rebTopo, manivela);

  /* ---- Photomic (1): carcaça, cilindro do ASA e do acoplamento (2, 3, 5), pentaprisma, ocular ---- */
  const perfilPh = [[BZ, basePh], [BZ, topoTampas], [BZ, topoTampas + .9], [BZ, 90.5], [13.5, 95], [-14, 95], [-19.5, 88.5], [-19.5, basePh]];
  const carcaca = deLado(perfilPh, phX0, phX1, .9, [M.cromo, M.cromo, M.cromo]);
  /* deLado: posição local [-z, y-Y0, x-centro]. A base plana fica em y=62
     também nas faces x=-14/41 (antes, o bisel a recuava até y=62,75).
     Só a aresta frontal abaixo do topo das tampas perde o bisel lateral;
     acima, os pontos y=76/76,9 preservam o chanfro do restante do visor. */
  { const pos = carcaca.geometry.attributes.position, recuo = .9 * 5 / 6, eps = 1e-4;
    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i);
      if (y <= basePh - Y0 + recuo + eps) pos.setY(i, basePh - Y0);
      if (y <= topoTampas - Y0 + eps && Math.abs(pos.getX(i) + BZ) <= recuo + eps) pos.setX(i, -BZ);
    }
    pos.needsUpdate = true; carcaca.geometry.computeVertexNormals(); }
  const frentePh = deFrente(retangulo(54, 27).map(([x, y]) => [x + LX, y + 76.5]), null, LX, 76.5, BZ - .4, BZ + .9, .4, [comTex(M.cromo, tPh), M.cromo, M.cromo], 55);
  const janela = em(placa(retangulo(16, 9, 1), null, 1.2, .3, [comTex(M.cromo, tJan), M.cromo, M.cromo], 16), LX, 95.3, 0); janela.rotation.x = -Math.PI / 2;
  /* trava (6): posição MONTADA do blueprint, não mexer; o afastamento da placa "F Nikon" é só na explosão (partes.travaFrontal.e.x) */
  const trava = deFrente([[-12.5, 63], [-8.5, 63], [-8.5, 66], [-10.5, 70], [-12.5, 70]], null, -10.5, 66, BZ + .6, BZ + 2.4, .35, M.cromoE, 10);
  peca('travaFrontal', [-10.5, 66, BZ + 1.5], trava);
  /* sem a faixa preta da base do Photomic (pedido do usuário, 2026-10-02: ela era uma peça a mais que o esquema não tem) */
  peca('carcacaPh', [LX, 78, 0], carcaca, frentePh, janela, deFrente([[-14, 84], [-12.5, 84], [-12.5, 94], [-14, 94]], null, -13.25, 89, -12, 12, .4, M.cromo, 20), parafuso3d(LX - 24.5, 66, BZ + .9, .9, .5), parafuso3d(LX + 24.5, 66, BZ + .9, .9, 1.2));
  /* o cilindro do Photomic em anéis empilhados: escala de velocidades (5), seletor acoplado com o garfo (3), ASA (2); botão da bateria (4) */
  const fxVel = eixoY([[12.65, 83.2], [12.65, 87.8]], -23, 2, 96, new THREE.MeshStandardMaterial({ map: tFxVel, roughness: .4, metalness: .4, bumpMap: tFxVel, bumpScale: .2 }));
  peca('escala', [-23, 85.5, 2], eixoY([[0, 83], [12.6, 83], [12.6, 88], [0, 88]], -23, 2, 64, M.anod), fxVel);
  const acopla = deCima(serrilha(12.6, 56, .55), null, 88, 92.5, .3, M.cromo, 26); acopla.position.x = -23; acopla.position.z = 2;
  const garfo = deFrente([[-26, 83], [-20, 83], [-20, 79.5], [-21, 78.5], [-22, 79.5], [-22, 81], [-24, 81], [-24, 79.5], [-25, 78.5], [-26, 79.5]], null, -23, 81, 12.4, 14.2, .3, M.aco, 10);
  const hasteGarfo = deFrente([[-24, 83], [-22, 83], [-22, 89], [-24, 89]], null, -23, 86, 12.6, 14, .3, M.aco, 10);
  peca('acoplado', [-23, 90, 2], acopla, garfo, hasteGarfo);
  const asa = deCima(serrilha(11, 44, .45), null, 92.5, 96.4, .3, M.cromo, 22); asa.position.x = -23; asa.position.z = 2;
  peca('asa', [-23, 94.5, 2], asa, discoY(11, .4, -23, 96.6, 2, 64, M.cromo, tAsa, comTex(M.cromo, tAsa)));
  peca('bateria', [-16, 95.2, -9], discoY(2.4, 2, -16, 96.2, -9, 24, M.cromo), eixoV(-16, -9, 90, 94.2, 1.2, M.cromoE));
  /* célula: o galvanômetro do fotômetro, com o ponteiro, dentro da carcaça */
  const galv = em(tubo(solido([[0, -3], [5.2, -3], [5.2, 3], [0, 3]]), 32, M.preto), -2, 87, 2);
  const ima = em(tubo(solido([[0, 3], [3, 3], [3, 4.4], [0, 4.4]]), 24, M.latao), -2, 87, 2);
  const ponteiro = deFrente([[-2.3, 87], [-1.7, 87], [5.5, 93.4], [5.2, 93.8]], null, 1.6, 90.4, 6.4, 6.8, 0, M.preto, 12);
  peca('celula', [-2, 87, 3], galv, ima, ponteiro);

  const prisma = deLado([[11, 63], [11, 79], [0, 91], [-11, 79], [-11, 63]], 1, 26, .4, [M.prisma, M.prisma, M.prisma]); prisma.renderOrder = 10;
  peca('prisma', [LX, 77, 0], prisma);
  const ocular = deFrente(retangulo(20, 18, 2).map(([x, y]) => [x + LX, y + 77]), [retangulo(10, 9).map(([x, y]) => [x + LX, y + 77])], LX, 77, -25.5, -19.3, .6, [M.anod, M.anod, comTex(M.anod, tOcular)], 20);
  const lenteOc = em(placa(retangulo(10.2, 9.2), null, 1, 0, [M.vidroOcular, M.preto, M.vidroOcular], 12), LX, 77, -22);
  peca('ocular', [LX, 77, -22], ocular, lenteOc);

  /* ---- lente Nikkor-S Auto 50 mm f/1.4 (58): baioneta e corpo óptico, anel de abertura com a orelha, anel de foco canelado, anel da frente, vidros ---- */
  const bay = [eixoZ(perfilTubo(21.8, 18.5, 3.6, .3).map(([r, z]) => [r, z + 27.9]), 64, M.cromo), eixoZ(perfilTubo(25, 18.5, .55, .2).map(([r, z]) => [r, z + 31]), 64, M.cromo)];
  [90, 210, 330].forEach(a => { const pts = []; for (let k = -16; k <= 16; k += 4) pts.push(pol(23.6, a + k)); for (let k = 16; k >= -16; k -= 4) pts.push(pol(21.6, a + k)); bay.push(em(extrudar([pts], 1.2, .25, M.cromo), LX, LY, 25.6)); });
  bay.push(eixoZ(perfilTubo(19.6, 17.5, 15, .3).map(([r, z]) => [r, z + 39]), 64, M.fosco));   // corpo óptico preto por dentro
  peca('baionetaLente', [LX, LY, 28], ...bay);
  const ab = [eixoZ(perfilTubo(30, 26.6, 3.9, .6).map(([r, z]) => [r, z + 35.6]), 96, M.anod), faixa(30.06, 32.6, 38.6, tFxAb)];
  const orelha = deFrente([[-4.2, 0], [4.2, 0], [4.2, 7.5], [2.6, 7.5], [2.6, 2.6], [-2.6, 2.6], [-2.6, 7.5], [-4.2, 7.5]].map(([x, y]) => [x + LX, y + LY + 29]), null, LX, LY + 32, 34.6, 36.4, .3, M.cromo, 16);
  ab.push(orelha); ab.push(em(new THREE.Mesh(new THREE.CylinderGeometry(.7, .7, 2, 12), M.cromo), LX - 3.4, LY + 37, 35.5));
  peca('anelAbertura', [LX, LY, 35.6], ...ab);
  const foco = [em(placa(canelado(31, 20, 1.3), [circulo(0, 0, 26.6, 64)], 10.2, .5, M.anod, 64), LX, LY, 49.4), eixoZ(perfilTubo(30.2, 26.6, 2.3, .3).map(([r, z]) => [r, z + 42]), 96, M.anod), faixa(30.25, 39.95, 44.2, tFxDist)]   // escala de distâncias na altura das caneluras (num rebaixo, só apareciam pedaços dos números);
  peca('anelFoco', [LX, LY, 47], ...foco);
  const fr = [eixoZ([[25.2, 54.6], [28.6, 54.6], [28.6, 60.4], [27.6, 61.4], [25.2, 61.4]], 96, M.cromo), eixoZ([[21.2, 58.8], [25.3, 58.8], [25.3, 61.2], [21.2, 61.2]], 96, M.anod), coroa(21.4, 25.2, 61.25, tFxFr),
    eixoZ([[20.4, 55], [21.4, 55], [21.4, 61.6], [20.4, 61.6]], 64, M.anod)]   // anel que segura o vidro: preto por dentro, como na peça;
  peca('anelFrontal', [LX, LY, 58], ...fr);
  const R1 = 40, sag = R1 - Math.sqrt(R1 * R1 - 20.4 * 20.4), arco = [];
  for (let i = 0; i <= 12; i++) { const r = 20.4 * (1 - i / 12); arco.push([r, 55.6 + sag - (R1 - Math.sqrt(R1 * R1 - r * r))]); }
  const vf = eixoZ([[0, 54.6], [20.4, 54.6], ...arco], 64, M.vidroLente); vf.renderOrder = 5;
  peca('vidroFrontal', [LX, LY, 57], vf);
  const arcoT = []; for (let i = 0; i <= 10; i++) { const r = 13 * i / 10; arcoT.push([r, 25.2 + r * r / 70]); }   // convexo para trás
  const vt = eixoZ([...arcoT, [13, 28.6], [0, 28.6]], 48, M.vidroLente);
  peca('vidroTraseiro', [LX, LY, 26.5], vt);


  /* ================= mecanismo (as peças de dentro, números do esquema) ================= */

  /* ---- dentro da tampa direita: débreagem (8), indicador 20/36 (12), avanço do contador (15) ---- */
  peca('debreagem', [-23, 72.4, 2], eixoY([[6.5, 72.5], [8.5, 72.5], [8.5, 74.2], [6.5, 74.2]], -23, 2, 48, M.niquel), eixoY([[5, 70.6], [7.4, 70.6], [7.4, 72.3], [5, 72.3]], -23, 2, 48, M.latao),
    deCima([[-31.5, 1], [-29, -.5], [-27, 2.5], [-29.6, 3.6]], null, 72.6, 73.6, .2, M.aco, 8));
  peca('indicador', [-47.5, 72, -10], deCima([[-50.5, -11.4], [-44.5, -11.4], [-44.5, -8.6], [-50.5, -8.6]], null, 73, 74, .2, M.anod, 8), eixoV(-47.5, -10, 70, 73, .5, M.aco));
  peca('avancoContador', [-59, 73.4, 0], engY(24, 6, .5, -59, 73.4, 0, 1.6, M.latao, 3), deCima([[-52, -5], [-49.5, -6.5], [-49, -5.5], [-51.5, -3.6]], null, 72.8, 74, .2, M.aco, 8));

  /* ---- armamento (no corpo, embaixo da tampa e dentro da câmara direita) ---- */
  peca('armamentoTopo', [-59, 67, 0], engY(30, 8, .5, -59, 63.6, 0, 2, M.latao, 4), (() => { const c = deCima(serrilha(6.5, 20, .9), null, 64.4, 67, .3, M.aco, 14); c.position.x = -59; return c; })(),
    eixoY([[0, 67], [4.6, 67], [4.6, 72], [0, 72]], -59, 0, 32, M.niquel), mola(-59, 0, 67.2, 71.6, 5.4, .3, 4, M.aco));
  peca('interruptorFlash', [-45.5, 63.8, -9], deCima([[-48, -12], [-43, -12], [-43, -6], [-48, -6]], null, 62, 65.5, .3, M.preto, 8), eixoV(-46.6, -9, 65.5, 66.6, .45, M.latao), eixoV(-44.4, -9, 65.5, 66.6, .45, M.latao));
  const platV = deCima([[-38, -12], [-16, -12], [-16, 12], [-30, 12], [-38, 4]], [circulo(-23, 2, 2, 16), circulo(-31, -6, 1.2, 12)], 62.4, 63.6, .2, M.latao, 30);
  peca('platinaVel', [-27, 63.6, 0], platV, engY(14, 3.5, .5, -31, 64.5, -6, 1.6, M.aco, 0), engY(20, 5, .5, -25, 64.5, -6.5, 1.6, M.niquel, 3), engY(9, 2.2, .45, -34.5, 64.5, 4, 1.6, M.aco));
  peca('sincro', [-33, 65.4, 9], eixoV(-33, 9, 63.6, 64.8, .8, M.aco), discoY(2.6, 1.2, -33, 66, 9, 24, M.anod, tSinc, comTex(M.anod, tSinc, .05)));
  peca('eixoContador', [-64, 38, -11], eixoV(-64, -11, 14, 62, 1, M.aco), engY(10, 2.5, .5, -64, 60.4, -11, 1.6, M.latao));
  peca('copo', [-64, 12.7, -11], eixoY([[1.1, 11.4], [2.4, 11.4], [2.4, 14], [1.1, 14]], -64, -11, 24, M.niquel));
  const pl22 = deLado([[3, 18], [12, 18], [12, 40], [9, 52], [3, 52]], -68, -66.8, .2, [M.latao, M.latao, M.latao]);
  const g22 = em(engrenagem(22, 5.5, .5, 0, M.aco, 4, 1.6), -66.2, 30, 7); g22.rotation.y = Math.PI / 2;
  const lev22 = deLado([[4, 44], [13, 47], [13, 49], [4, 46]], -66.6, -65.4, .2, [M.aco, M.aco, M.aco]);
  peca('armEspelho', [-67, 35, 7.5], pl22, g22, lev22, mola(-66, 10.5, 20, 27, .9, .2, 6, M.aco));
  const pl23 = deFrente([[-63, 26], [-56, 26], [-56, 44], [-63, 44]], null, -59.5, 35, 8.6, 9.8, .2, M.latao, 20);
  const lev23 = deFrente([[-62, 40], [-50, 36], [-49.6, 37.4], [-61.6, 41.6]], null, -56, 39, 10, 11.2, .2, M.aco, 16);
  peca('disparoBloqueio', [-59.5, 35, 10], pl23, lev23, mola(-57.5, 7, 27, 33, .8, .18, 6, M.aco), parafuso3d(-61, 28, 9.8, .7));
  peca('eixoLentas', [-23, 46, 2], eixoV(-23, 2, 30, 62, 1.1, M.aco), discoY(3.2, 1.4, -23, 41, 2, 20, M.latao));
  peca('comandoSinc', [-18, 35, 10], eixoV(-18, 10, 12, 58, .9, M.aco), deCima([[-19, 8.6], [-14.8, 9.4], [-14.8, 11], [-19, 11.4]], null, 50, 51.2, .2, M.aco, 8));
  peca('pinhaoArm', [-31, 10.2, -7], engY(16, 5, .6, -31, 10.2, -7, 1.8, M.latao, 3));
  const pl47 = deFrente([[47, 10], [67, 10], [67, 26], [47, 26]], [circulo(52, 16, .8, 10), circulo(59.5, 20.5, .8, 10)], 57, 18, 9.6, 10.8, .2, M.latao, 22);
  peca('temporizadorLentas', [57, 18, 11], pl47, engZ(18, 4.5, .5, 52, 16, 11.8, 1.6, M.aco, 3), engZ(12, 3, .5, 59.5, 20.5, 11.8, 1.6, M.niquel), engZ(15, 3, .7, 63.5, 14, 11.8, 1.6, M.aco),
    deFrente([[61, 17.6], [66.5, 17], [66.6, 18], [61.2, 18.8]], null, 63.8, 17.8, 12.8, 13.6, .1, M.aco, 8), parafuso3d(49, 24, 10.8, .7), parafuso3d(65, 12, 10.8, .7));
  peca('alavancaDisparo', [-40, 52, 3], eixoV(-40, 3, 42, 62, .9, M.aco), deCima([[-41, 2], [-27, 7], [-27.6, 9], [-41.4, 4.2]], null, 41, 42.4, .2, M.aco, 16));

  /* ---- transporte do filme: carretel (29) com a fricção (28) e o pinhão (20), rolo dentado (30), eixo de rebobinar (45) ---- */
  const fenda = em(new THREE.Mesh(new THREE.BoxGeometry(1.4, 30, 3), M.fosco), -52, 33, 1.4);
  peca('bobina', [-52, 33, -5], eixoY([[0, 11], [9, 11], [9, 12.4], [6.2, 12.4], [6.2, 53.6], [9, 53.6], [9, 55], [0, 55]], -52, -5, 48, M.niquel), fenda);
  peca('friccao', [-52, 57, -5], mola(-52, -5, 55.2, 58.4, 3, .32, 5, M.aco), eixoY([[1.2, 58.4], [4, 58.4], [4, 59], [1.2, 59]], -52, -5, 24, M.latao));
  peca('pinhaoBobina', [-52, 9.8, -5], engY(22, 7.5, .6, -52, 9.8, -5, 1.8, M.latao, 4));
  peca('rolo', [-31, 33, -7], eixoV(-31, -7, 11.5, 58, 1.4, M.aco), engY(8, 5.2, 1.2, -31, 16.5, -7, 2, M.niquel), engY(8, 5.2, 1.2, -31, 49.5, -7, 2, M.niquel),
    eixoY([[0, 18], [4.4, 18], [4.4, 48], [0, 48]], -31, -7, 24, M.fosco));
  const garfoReb = [-1, 1].map(s => deFrente([[57 + s * 1.6 - .5, 43], [57 + s * 1.6 + .5, 43], [57 + s * 1.6 + .5, 48], [57 + s * 1.6 - .5, 48]], null, 57 + s * 1.6, 45.5, 1.5, 2.5, .1, M.aco, 6));
  peca('eixoRebobinar', [57, 60, 2], eixoV(57, 2, 47, 76, 1.3, M.aco), ...garfoReb, mola(57, 2, 58, 70, 2.4, .3, 8, M.aco));

  /* ---- base: chapa de baixo (33), retorno do contador (34), acoplamento do motor (35) ---- */
  peca('carterInf', [0, 7.8, 0], deCima(octo(-70.5, 70.5, -14.4, 14.4, 3, 2), [circulo(-31, -7, 4.2, 20), circulo(0, 0, 6.5, 24)], 7, 8.6, .2, [M.preto, M.preto, M.preto]));
  peca('reset', [-59, 9.2, 6], deCima([[-62, 4], [-50, 5.6], [-50, 7.6], [-62, 7]], null, 8.6, 9.6, .2, M.aco, 14), mola(-56, 9, 8.6, 11, .9, .2, 4, M.aco));
  peca('motor', [-31, 7.9, -7], eixoY([[0, 6.4], [3.6, 6.4], [3.6, 9.4], [0, 9.4]], -31, -7, 24, M.niquel), em(new THREE.Mesh(new THREE.BoxGeometry(5, .8, 1), M.fosco), -31, 6.2, -7));

  /* ---- obturador (26): dois tambores e as duas cortinas de titânio (a primeira fechando a janela, a segunda enrolada) ---- */
  const tambor = x => [eixoY([[0, 14], [2.4, 14], [2.4, 16], [1.8, 16], [1.8, 50], [2.4, 50], [2.4, 52], [0, 52]], x, -9.3, 24, M.niquel), engY(16, 3.2, .4, x, 53.2, -9.3, 1.6, M.latao)];
  peca('tamborA', [LX - 24, 33, -9.3], ...tambor(LX - 24));
  peca('tamborB', [LX + 24, 33, -9.3], ...tambor(LX + 24));
  peca('cortina1', [LX, LY, -9.6], em(placa(retangulo(44, 30), null, .4, 0, [comTex(M.titanio, tTit, .15), M.titanio, comTex(M.titanio, tTit, .15)], 44), LX, LY, -9.6));
  peca('cortina2', [LX + 24, 33, -9.3], eixoY([[2.5, 15], [3.4, 15], [3.4, 51], [2.5, 51]], LX + 24, -9.3, 32, M.titanio));

  /* ---- acessórios (extras: só aparecem com a câmera aberta): base em volta da rebobinagem (39), sapata (43), acessório (38),
     contatos de flash (40, 44), visor esportivo (42) ---- */
  peca('portaAcessorios', [57, 77, 2], eixoY([[9.4, 76], [11, 76], [11, 77.6], [9.4, 77.6]], 57, 2, 48, M.cromo), deCima([[52, 11], [62, 11], [62, 16], [52, 16]], null, 76.3, 77.3, .2, M.cromo, 12));
  peca('baseAcessorios', [57, 78.7, 2], deCima([[50, -6], [64, -6], [64, 10], [50, 10]], null, 78, 79.4, .3, M.cromo, 16), deCima([[50, -6], [51.4, -6], [51.4, 10], [50, 10]], null, 79.4, 80.6, .2, M.cromo, 16), deCima([[62.6, -6], [64, -6], [64, 10], [62.6, 10]], null, 79.4, 80.6, .2, M.cromo, 16));
  peca('acessorio', [57, 83, 2], deCima([[52, -4], [62, -4], [62, 8], [52, 8]], null, 80.6, 86, .5, M.cromo, 14), deCima([[53.5, -2.5], [60.5, -2.5], [60.5, 6.5], [53.5, 6.5]], null, 86, 86.6, .2, M.anod, 10));
  peca('contatoFlash', [62, 87, 2], deCima([[60.5, .5], [63.5, .5], [63.5, 3.5], [60.5, 3.5]], null, 86, 88, .2, M.anod, 6), eixoV(62, 2, 88, 89.4, .5, M.latao));
  peca('contatoFlash2', [52, 87, 2], deCima([[50.5, .5], [53.5, .5], [53.5, 3.5], [50.5, 3.5]], null, 86, 88, .2, M.anod, 6), eixoV(52, 2, 88, 89.4, .5, M.latao));
  const espCorpo = deLado([[18, 62], [18, 100], [-22, 100], [-22, 62]], LX - 28, LX + 28, .8, [M.preto, M.preto, M.preto]);
  const espFrente = deFrente(retangulo(56, 38).map(([x, y]) => [x + LX, y + 81]), null, LX, 81, 18, 19.4, .4, [comTex(M.cromo, tEsp), M.cromo, M.cromo], 60);
  const espOcular = deFrente(retangulo(30, 22, 3).map(([x, y]) => [x + LX, y + 82]), [retangulo(24, 16).map(([x, y]) => [x + LX, y + 82])], LX, 82, -26, -22, .5, M.anod, 30);
  peca('visorEsportivo', [LX, 81, 0], espCorpo, espFrente, espOcular);

  /* m vem do pivô; e e d do partes.js são deslocamentos (e a partir de m, d a partir de e) */
  const soma = (a, b) => { const r = { ...a }; for (const k in b) r[k] = (r[k] || 0) + b[k]; return r; };
  for (const n in partes) { const p = partes[n]; p.m = soma(PIVO[n] || {}, p.m || {}); p.e = soma(p.m, p.e || {}); p.d = soma(p.e, p.d || {}); if (p.r !== undefined) p.r += p.m.rotationZ || 0; }
}

/* Peças do Dual 1019 no gabinete Grundig. Medidas em mm (ficha.md, conferidas nas fotos), 1 mm = 0,8 unidade.
   Cada peça é desenhada onde fica montada (x para a direita de quem olha de frente, y para cima a partir do chão, z para a frente)
   e recentrada no seu pivô (montagem() do motor); grupos com pivô próprio giram em volta dele (tampa na dobradiça). */
const U = .8, Y0 = 118;
const { PIVO, em, deCima, deFrente, deLado, eixoY, discoY, peca, pivos } = montagem(U, Y0);
const PX = -38, PZ = 0;                                    // eixo do prato
const AX = 140, AZ = -95, PHI = Math.atan2(-40, 205);      // pivô do braço e a direção do tubo (para a frente, um pouco para a esquerda)
const MX = 22, MZ = -60;                                   // motor: a polia sobe por dentro da saia do prato, atrás à direita
const RX = PX + 109 * Math.SQRT1_2, RZ = PZ - 109 * Math.SQRT1_2;   // roda intermediária, entre a polia e a borda interna do prato
/* pivôs dos grupos (mm): a tampa gira na dobradiça; os outros ficam no centro do que levam */
const GRUPOS = { tampa: [0, 113, -184.5], pratoConj: [PX, 130, PZ], braco: [AX, 130, AZ], comandos: [110, 113, 40], platina: [0, 105, 0], mecanismo: [0, 95, 0], gabinete: [0, 50, 0] };

/* retângulo de cantos redondos [x, z], centrado em (cx, cz) */
const rr = (w, d, r, cx = 0, cz = 0, n = 6) => { const pts = [];
  for (const [x, z, a0] of [[w / 2 - r, d / 2 - r, 0], [-w / 2 + r, d / 2 - r, 90], [-w / 2 + r, -d / 2 + r, 180], [w / 2 - r, -d / 2 + r, 270]])
    for (let i = 0; i <= n; i++) { const [px, pz] = pol(r, a0 + 90 * i / n); pts.push([cx + x + px, cz + z + pz]); }
  return pts; };
/* barra de chapa estampada de p a q, largura w, pontas redondas */
const barra = ([x0, z0], [x1, z1], w) => { const a = Math.atan2(z1 - z0, x1 - x0) * 180 / Math.PI, pts = [];
  for (let i = 0; i <= 8; i++) { const [px, pz] = pol(w / 2, a - 90 - 180 * i / 8); pts.push([x0 + px, z0 + pz]); }
  for (let i = 0; i <= 8; i++) { const [px, pz] = pol(w / 2, a + 90 - 180 * i / 8); pts.push([x1 + px, z1 + pz]); }
  return pts; };
/* braço: objetos desenhados em coordenadas locais do braço (z ao longo do tubo, a partir do pivô) e girados para o lugar */
const noBraco = (...objs) => { const g = new THREE.Group(); objs.forEach(o => g.add(o)); g.rotation.y = PHI; g.position.set(AX, 0, AZ); return g; };
const W = (lx, y, lz) => [AX + lx * Math.cos(PHI) + lz * Math.sin(PHI), y, AZ - lx * Math.sin(PHI) + lz * Math.cos(PHI)];
const cilX = (r, comp, x, y, z, material) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, comp, 24), material); m.rotation.z = Math.PI / 2; return em(m, x, y, z); };
const cilZ = (r, comp, x, y, z, material, seg = 24) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, comp, seg), material); m.rotation.x = Math.PI / 2; return em(m, x, y, z); };
/* mola helicoidal de arame, eixo vertical, de y0 a y1 */
const mola = (x, z, y0, y1, r, fio, voltas, material) => { const pts = [], n = voltas * 16;
  for (let i = 0; i <= n; i++) { const a = i / 16 * TAU; pts.push(new THREE.Vector3(x + Math.cos(a) * r, y0 + (y1 - y0) * i / n - Y0, z + Math.sin(a) * r)); }
  return new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), n * 2, fio, 6), material); };

/* teca: base menos saturada para a luz de estúdio; veios castanhos discretos, sem tingimento duplo no material.
   Referência: #c57f41 iluminado / #ad7354 na sombra; base #b06530 calibrada pelo render (frente iluminada medida perto de #c57f41). */
function tecaTex() {
  const cv = document.createElement('canvas'); cv.width = cv.height = 512; const x = cv.getContext('2d');
  x.fillStyle = '#b06530'; x.fillRect(0, 0, 512, 512);
  let s = 5; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 300; i++) {   // veio fino e quase reto, como a teca das fotos
    const y0 = rnd() * 512, amp = .4 + rnd() * 2.2, f = 1 + Math.floor(rnd() * 2), ph = rnd() * 6, escuro = rnd() < .7;
    x.strokeStyle = escuro ? `rgba(119,70,38,${.04 + rnd() * .09})` : `rgba(188,120,66,${.03 + rnd() * .06})`; x.lineWidth = .4 + rnd() * 1.2;
    x.beginPath(); for (let px = 0; px <= 512; px += 8) { const yy = y0 + Math.sin(px / 512 * TAU * f + ph) * amp; px ? x.lineTo(px, yy) : x.moveTo(px, yy); } x.stroke();
  }
  const t = new THREE.CanvasTexture(cv); t.encoding = THREE.sRGBEncoding; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8; return t;
}
const M = {};
function materiais() {
  const escov = listrasTex(512, 120, 46, 9), torno = listrasTex(256, 132, 56, 4), teca = tecaTex();
  const tecaLado = teca.clone(); tecaLado.needsUpdate = true; tecaLado.repeat.set(1 / 420, 1 / 520);   // paredes extrudadas: UV em mm
  Object.assign(M, {
    tecaTopo: mat(0xffffff, .64, 0, { map: teca, envMapIntensity: .25 }), tecaLado: mat(0xffffff, .66, 0, { map: tecaLado, envMapIntensity: .25 }),
    tecaCrua: mat(0xb48c62, .88, 0, { envMapIntensity: .3 }),                                        // madeira sem verniz por dentro e por baixo
    laminado: mat(0x070707, .5, 0, { envMapIntensity: .15 }),
    platina: mat(0x150d0b, .4, .3, { envMapIntensity: .5 }), platinaFosca: mat(0x181210, .75, .2, { envMapIntensity: .4 }),
    alu: mat(0xd2d2d4, .3, 1, { roughnessMap: escov }), aluE: mat(0xb4b4b3, .34, 1, { roughnessMap: escov }), aluTorno: mat(0xcfcfd1, .28, 1, { roughnessMap: torno }),
    aluFundido: mat(0xa9a9ab, .58, 1, { envMapIntensity: .8 }),
    borracha: mat(0x2c2a28, .86, 0, { envMapIntensity: .3 }), plastico: mat(0x111011, .38, 0, { envMapIntensity: .6 }), cinzaPl: mat(0x343436, .55, 0, { envMapIntensity: .35 }),
    tapeteBorracha: mat(0x3b3937, .92, 0, { envMapIntensity: .12 }),
    tapeteAlu: mat(0xcdcdcf, .28, 1, { roughnessMap: torno, envMapIntensity: .8 }),
    cromo: mat(0xe4e5e7, .16, 1), latao: mat(0xb89a5a, .32, 1, { roughnessMap: torno }), aco: mat(0xb8bbbe, .36, 1, { roughnessMap: escov }), acoPreto: mat(0x121111, .45, .5, { envMapIntensity: .45 }),
    marfim: mat(0xd9d1bd, .5, 0), feltro: mat(0x2b2723, 1, 0, { envMapIntensity: .2 }),
    engrenagem: mat(0xe8e2cf, .18, 0, { transparent: true, opacity: .55, depthWrite: false, envMapIntensity: 1.2 }),
    acr: mat(0x4a3324, .06, .1, { transparent: true, opacity: .42, depthWrite: false, envMapIntensity: 1.3 }),   // acrílico fumê: translúcido, reflete a luz
    acrBorda: mat(0x2b221c, .1, .1, { transparent: true, opacity: .78, depthWrite: false, envMapIntensity: 1 }),   // a borda do acrílico parece escura (fotos)
  });
}
/* face com desenho: o mesmo desenho vira relevo (gravações afundam) */
const comTex = (base, tex, relevo = .3) => { const m = base.clone(); m.map = tex; m.color.set(0xffffff); m.bumpMap = tex; m.bumpScale = relevo; return m; };

async function construirPecas() {
  materiais();
  const [tPainel, tPainelB, tPlat, tPlatB, tVinA, tVinB, tTap, tTapB, tVelo, tPlacaV, tAnti, tGrundig, tEscudo, tBaseB, tMotorB] = await Promise.all([
    svgTex(painelF, 210, 1024, true), svgTex(painelB, 210, 256, true), svgTex(platinaF, 380, 1024, true), svgTex(platinaB, 380, 1024, true),
    svgTex(vinilF(1), 175, 1024, true), svgTex(vinilF(2), 175, 1024, true), svgTex(tapeteF, 266, 1024, false), svgTex(tapeteB, 266, 1024, false),
    svgTex(veloF, 21, 256, true), svgTex(placaVeloF, 60, 512, true), svgTex(antiskF, 54, 512, true), svgTex(grundigF, 56, 512, true),
    svgTex(escudoF, 22, 256, false), svgTex(baseB, 480, 1024, true), svgTex(motorB, 60, 256, true)]);

  /* ===== gabinete Grundig: base de laminado preto, moldura de teca com o tampo rebaixado, emblema ===== */
  const pes = [[-200, -155], [200, -155], [-200, 155], [200, 155]].map(([x, z]) => eixoY([[0, 0], [14, 0], [14, 4.3], [0, 4.3]], x, z, 32, M.feltro));
  peca('base', [0, 20, 0], deCima(rr(472, 382, 3), null, 4, 34.8, 1, [M.laminado, M.laminado, comTex(M.laminado, tBaseB, .05)], 480), ...pes);
  const paredes = deCima(rr(480, 390, 3), [rr(452, 362, 1.5)], 35, 110, 1.2, [M.tecaTopo, M.tecaLado, M.tecaCrua], 480);
  const tampo = deCima(rr(456, 366, 1.5), [rr(300, 230, 22)], 89.5, 96, 0, [M.tecaTopo, M.tecaLado, M.tecaCrua], 480);   // tampo com o vão do mecanismo
  peca('moldura', [0, 72, 0], paredes, tampo);
  peca('emblemaGrundig', [175, 18, 191.8], deFrente([[149, 12.5], [201, 12.5], [201, 23.5], [149, 23.5]], null, 175, 18, 190.9, 192.6, .3, [comTex(M.alu, tGrundig, .2), M.alu, M.alu], 56));

  /* ===== platina (15): chapa com saia dobrada, furos, o anel estampado por baixo; parafusos de transporte e suspensão ===== */
  const contorno = rr(370, 300, 24), furos = [rr(18, 18, 9, PX, PZ), rr(22, 22, 11, MX, MZ), rr(18, 18, 9, AX, AZ)];
  const topoPlatina = 112, maePlatina = { contorno, furos }, recuoChapas = 3;
  const chapa = deCima(contorno, furos, 109.5, topoPlatina, .6, [comTex(M.platina, tPlat, .08), M.platina, comTex(M.platinaFosca, tPlatB, .05)], 380);
  const saia = deCima(contorno, [rr(364, 294, 21)], 99, 109.6, .4, [M.platina, M.platina, M.platinaFosca], 380);
  const estampa = eixoY([[118, 106.5], [126, 106.5], [126, 109.6], [118, 109.6]], PX, PZ, 96, M.platinaFosca);
  peca('chapa', [0, 106, 0], chapa, saia, estampa);
  const parafusoT = (x, z) => [eixoY([[0, 85], [2.5, 85], [2.5, 112], [8, 112], [8, 113.2], [6, 113.6], [6, 118.5], [5.4, 119.2], [0, 119.2]], x, z, 32, M.cromo),
    deCima(serrilha(6.1, 20, .5).map(([a, b]) => [a + x, b + z]), null, 114, 118.4, .3, M.cromo, 14)];
  peca('parafusoFrente', [20, 112, 140], ...parafusoT(20, 140));
  peca('parafusoTras', [-120, 112, -140], ...parafusoT(-120, -140));
  const suspensao = (x, z) => [mola(x, z, 96.3, 103.4, 6, .75, 5, M.aco), eixoY([[2.4, 103], [8, 103], [8.5, 104], [8.5, 109.4], [2.4, 109.4]], x, z, 32, M.borracha), eixoY([[0, 95], [2, 95], [2, 109.4], [0, 109.4]], x, z, 12, M.aco)];   // a cabeça do parafuso fica escondida embaixo (só os de transporte aparecem em cima)
  peca('suspensaoE', [-168, 104, -128], ...suspensao(-168, -128));
  peca('suspensaoD', [168, 104, -128], ...suspensao(168, -128));
  peca('suspensaoF', [0, 104, 132], ...suspensao(0, 132));

  /* ===== mecanismo embaixo da platina (inventado a partir das fotos de baixo) ===== */
  /* corpo com as aletas no mesmo perfil (aletas em malhas separadas brigavam com o corpo a distância) */
  const motorCorpo = eixoY([[0, 54], [30, 54], [31, 56], ...[64, 76, 88].flatMap(y => [[31, y], [34, y], [34, y + 2.4], [31, y + 2.4]]), [31, 98], [30, 100], [6, 100], [6, 102], [0, 102]], MX, MZ, 64, M.plastico);
  const aletas = [];
  const tampaMotor = discoY(29.4, 1, MX, 54.4, MZ, 64, M.plastico, null, null, tMotorB, comTex(M.plastico, tMotorB, .05));
  const polia = eixoY([[0, 100], [8, 100], [8, 106], [6.5, 106], [6.5, 112], [5, 112], [5, 126], [3.6, 127], [0, 127]], MX, MZ, 32, M.latao);   // polia escalonada (uma faixa por velocidade)
  const suporte = deCima([0, 120, 240].flatMap(a => { const [x0, z0] = pol(42, a - 22), [x1, z1] = pol(46, a), [x2, z2] = pol(42, a + 22), [x3, z3] = pol(16, a + 60); return [[MX + x0, MZ + z0], [MX + x1, MZ + z1], [MX + x2, MZ + z2], [MX + x3, MZ + z3]]; }),
    [rr(17, 17, 8.5, MX, MZ)], 103.5, 105, .3, M.acoPreto, 100);
  const coxins = [0, 120, 240].map(a => { const [x, z] = pol(44, a); return eixoY([[0, 105], [4.5, 105], [4.5, 109.4], [0, 109.4]], MX + x, MZ + z, 20, M.borracha); });
  peca('motor', [MX, 80, MZ], motorCorpo, ...aletas, tampaMotor, polia, suporte, ...coxins);
  const eng = engrenagem(96, 44, .9, 0, M.engrenagem, 6, 5); eng.rotation.x = -Math.PI / 2; em(eng, PX, 90, PZ); eng.renderOrder = 4;
  const cubo = eixoY([[0, 84], [9, 84], [9, 96], [0, 96]], PX, PZ, 32, M.aco);
  const came = deCima([[-8, -26], [10, -30], [24, -18], [22, 4], [8, 10], [-6, -4]].map(([x, z]) => [x + PX, z + PZ]), null, 92.6, 95, .3, M.aco, 70);
  peca('engrenagem', [PX, 90, PZ], eng, cubo, came);
  const b1 = deCima(barra([-150, 110], [100, 60], 11), [rr(5, 5, 2.5, -120, 104), rr(5, 5, 2.5, 70, 66)], 101, 102.6, .3, M.aco, 260);
  const b2 = deCima(barra([-140, -40], [90, 130], 9), [rr(5, 5, 2.5, -110, -28)], 103, 104.6, .3, M.aco, 260);
  const b3 = deCima([[60, 120], [70, 112], [150, -14], [166, -18], [164, -4], [74, 128]], null, 105, 106.4, .3, M.aco, 260);
  const rebites = [[-60, 92], [40, 72], [10, 72], [-30, 47], [118, 40]].map(([x, z]) => eixoY([[0, 100], [2.6, 100], [2.6, 100.8], [1.6, 101.4], [0, 101.4]], x, z, 16, M.cromo));
  const molaH = (() => { const pts = []; for (let i = 0; i <= 144; i++) { const a = i / 16 * TAU; pts.push(new THREE.Vector3(-84 + 44 * i / 144, 99 - Y0 + Math.cos(a) * 2.6, 100 + Math.sin(a) * 2.6)); }
    return new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 288, .45, 6), M.aco); })();   // mola de retorno deitada, embaixo das barras
  peca('alavancas', [0, 103.6, 40], b1, b2, b3, ...rebites, molaH);
  const tri = [[55, 60], [125, 35], [115, 105]];
  peca('interruptor', [98, 90, 67], deCima(tri, null, 80, 100, 1.5, M.plastico, 100), eixoY([[0, 78.5], [3, 78.5], [3, 80.2], [0, 80.2]], 98, 67, 16, M.cromo),
    deCima(rr(10, 8, 1.5, 70, 60), null, 100, 103, .3, M.marfim, 12));
  peca('amortecedor', [135, 90, -40], eixoY([[0, 70], [7, 70], [7, 104], [4, 105], [4, 109.2], [0, 109.2]], 135, -40, 32, M.cromo),
    deCima(barra([135, -40], [160, -40], 9), null, 96, 97.6, .3, M.aco, 40));

  /* ===== prato-conjunto: eixo central, tapete com o anel de alumínio, prato fundido com nervuras por baixo, roda intermediária ===== */
  peca('eixo', [PX, 145, PZ], eixoY([[0, 124], [3.6, 124], [3.6, 158], [4.6, 160], [4.6, 164], [3.2, 167], [0, 167.5]], PX, PZ, 32, M.cromo));
  const anelAlu = eixoY([[92, 145.2], [124, 145.2], [124, 146.5], [92, 146.5]], PX, PZ, 128, M.tapeteAlu);
  peca('tapete', [PX, 144, PZ], discoY(133, 4, PX, 146, PZ, 128, M.tapeteBorracha, tTap, comTex(M.tapeteBorracha, tTap, .22), tTapB, comTex(M.tapeteBorracha, tTapB, .35)), anelAlu);
  const pratoCorpo = eixoY([[3.8, 118], [16, 118], [16, 136.5], [128.5, 136.5], [128.5, 117], [131, 116], [135, 116], [135.6, 117], [135.6, 141], [134.6, 142], [3.8, 142]], PX, PZ, 128, M.aluTorno);
  const nervuras = Array.from({ length: 12 }, (_, i) => { const a = i * 30 + 15, b = new THREE.Mesh(new THREE.BoxGeometry(111, 8, 3), M.aluFundido);
    b.rotation.y = -rad(a); return em(b, PX + 72.5 * Math.cos(rad(a)), 132.6, PZ + 72.5 * Math.sin(rad(a))); });
  peca('prato', [PX, 129, PZ], pratoCorpo, ...nervuras);
  const pneu = eixoY([[11, 118], [17.5, 118], [19, 119.5], [19, 124.5], [17.5, 126], [11, 126]], RX, RZ, 48, M.borracha);
  const miolo = eixoY([[2, 117], [11.2, 117], [11.2, 127], [2, 127]], RX, RZ, 32, M.latao);
  const marca = em(new THREE.Mesh(new THREE.BoxGeometry(4, 1, 8), M.aco), RX + 6.5, 127.4, RZ);   // marca no cubo: deixa ver a roda girar
  peca('roda', [RX, 122, RZ], pneu, miolo, marca, eixoY([[0, 112.5], [2, 112.5], [2, 128], [0, 128]], RX, RZ, 12, M.aco));

  /* ===== disco de vinil (compacto de 17 cm) em cima do tapete ===== */
  peca('vinil', [PX, 146.9, PZ], discoY(87.5, 1.5, PX, 147.65, PZ, 128, mat(0x0c0c0d, .3, 0, { envMapIntensity: .9 }),
    tVinA, comTex(mat(0xffffff, .3, 0, { envMapIntensity: .9 }), tVinA, .25), tVinB, comTex(mat(0xffffff, .3, 0, { envMapIntensity: .9 }), tVinB, .25)));

  /* ===== braço (37-68): base do antiskating, cardan, tubo, contrapeso, cabeçote e cápsula ===== */
  peca('baseAntiskating', [AX, 120, AZ], noBraco(deCima(serrilha(28, 72, .6), null, 112.05, 126, .6, M.plastico, 60),
    discoY(26.8, 1.2, 0, 127, 0, 64, M.plastico, tAnti, comTex(M.plastico, tAnti, .05))));
  const lateral = s => deLado([[-14, 127], [14, 127], [14, 152], [10, 158], [-10, 158], [-14, 152]], s > 0 ? 12 : -15, s > 0 ? 15 : -12, .4, M.acoPreto, 40, 0, 142);
  peca('cardan', W(0, 142, 0), noBraco(lateral(1), lateral(-1), deCima(rr(23, 27, 2), null, 126.8, 129.5, .4, M.acoPreto, 30),
    cilX(2.2, 34, 0, 152, 0, M.cromo), cilX(5, 5, 17.5, 138, 2, M.cromo), cilX(5.4, 1.2, 20.4, 138, 2, M.aco)));
  peca('tubo', W(0, 152, 51), noBraco(cilZ(4, 242, 0, 152, 51, M.alu), deCima(rr(22, 16, 2), null, 146, 158.5, .6, M.plastico, 24),
    cilZ(5.5, 10, 0, 152, 172, M.plastico), cilZ(4.6, 3, 0, 152, 166, M.cromo)));
  const peso = placa(serrilha(15, 44, .9), [circulo(0, 0, 4.2, 20)], 28, .8, [M.cinzaPl, M.cinzaPl, M.cinzaPl], 30); em(peso, 0, 152, -60);
  peca('contrapeso', W(0, 152, -61), noBraco(peso, cilZ(11, 3, 0, 152, -75.4, M.cromo, 40), cilZ(6, 1, 0, 152, -77.3, M.aco, 32)));
  const concha = deLado([[176, 149], [214, 149], [222, 152], [222, 156], [176, 157.5]], -9, 9, .8, M.plastico, 60, 199, 153);
  const alca = deCima(rr(18, 5, 2, 15, 214), null, 155, 156.6, .4, M.plastico, 20);
  peca('cabecote', W(0, 153, 199), noBraco(concha, alca, deFrente([[22, 155], [24, 155], [24, 163], [22, 163]], null, 23, 159, 211.5, 216.5, .3, M.plastico, 12)));
  const corpoCap = deCima(rr(12, 20, 1.5, 0, 204), null, 139, 149.6, .5, M.marfim, 20);
  const agulha = (() => { const c = new THREE.Mesh(new THREE.ConeGeometry(.9, 4, 12), M.aco); c.rotation.x = Math.PI; return em(c, 0, 137, 212); })();
  peca('capsula', W(0, 144, 204), noBraco(corpoCap, agulha, deFrente([[-3, 139.4], [3, 139.4], [3, 141], [-3, 141]], null, 0, 140.2, 213.9, 214.4, .1, M.plastico, 8)));

  /* ===== comandos: painel (81), alavanca de partida (82), seletor de tamanho (75-77), seletor de velocidade (7-14), descanso do braço (45-47) ===== */
  const zArco = Math.sqrt(141 * 141 - 78 * 78);
  const arcoP = Array.from({ length: 14 }, (_, i) => { const z = zArco * (1 - i / 13); return [PX + Math.sqrt(141 * 141 - z * z), z]; });
  /* Região prolongada até fora da mãe: a quina vem exclusivamente da platina recuada, sem curva desenhada à mão.
     Mesmo centro e lado dos UVs: logotipo, manual/stop/start e 17/25/30 mantêm suas coordenadas em faces.js. */
  const contornoP = embutido(maePlatina, [[104, -55], [190, -55], [190, 155], [40, 155], [40, 143], ...arcoP], recuoChapas);
  peca('painel', [PAINEL_C[0], 112.8, PAINEL_C[1]], deCima(contornoP, null, topoPlatina, 113.6, .4, [comTex(M.aluE, tPainel, .12), M.aluE, comTex(M.aluE, tPainelB, .05)], 210, PAINEL_C[0], PAINEL_C[1]));
  const [kx, kz] = (() => { const [x, z] = pol(52, 112); return [PAINEL_C[0] + PAINEL_ARCO[0] + x, PAINEL_C[1] + PAINEL_ARCO[1] + z]; })();
  peca('alavancaStart', [kx, 116, kz], deCima(rr(9, 13, 2.5, kx, kz), null, 113.6, 121, 1.2, M.plastico, 14), deCima(rr(4, 8, 1.5, kx, kz - 7), null, 113.6, 115, .3, M.aco, 10));
  const [sx, sz] = [PAINEL_C[0] + 58, PAINEL_C[1] + 18];
  peca('seletorTamanho', [sx, 116, sz], deCima(rr(11, 7, 2, sx, sz), null, 113.6, 120, 1, M.plastico, 12));
  peca('descanso', [108, 130, 70], eixoY([[0, 113.6], [3.5, 113.6], [3.5, 141], [0, 141]], 108, 70, 20, M.cromo),
    eixoY([[0, 140.5], [6.5, 140.5], [6.5, 147.4], [5, 147.4], [5, 145], [0, 145]], 108, 70, 24, M.plastico));
  const VX = -155, VZ = 128;
  const contornoV = embutido(maePlatina, rr(56, 38, 5, VX, VZ), recuoChapas);
  peca('seletorVelocidade', [VX, 118, VZ], deCima(contornoV, null, topoPlatina, 113.5, .3, [comTex(M.aluE, tPlacaV, .1), M.aluE, M.aluE], 60, VX, VZ),
    deCima(serrilha(12, 36, .7).map(([a, b]) => [a + VX, b + VZ]), null, 113.5, 123, .5, M.plastico, 26),
    discoY(10.5, 1.2, VX, 124.2, VZ, 48, M.alu, tVelo, comTex(M.alu, tVelo, .1)),
    deCima(rr(16, 9, 2, VX - 37, VZ - 2), null, 113, 116.5, .6, M.plastico, 16));

  /* ===== tampa de acrílico fumê: caixa de 5 faces com espessura, emblema no topo, dobradiças atrás ===== */
  const acrParedes = deCima(rr(448, 358, 5), [rr(442, 352, 2)], 96.4, 233.4, 0, [M.acrBorda, M.acr, M.acrBorda], 450);
  const acrTopo = deCima(rr(448.6, 358.6, 5.3), null, 233, 236,   // aba de 0,3: o lado do topo não coincide com o das paredes
    .4, [M.acr, M.acrBorda, M.acr], 450);
  acrParedes.renderOrder = acrTopo.renderOrder = 10;
  peca('acrilico', [0, 166, 0], acrParedes, acrTopo);
  peca('emblemaTopo', [0, 236.5, -40], deCima(rr(22, 22, 1.5, 0, -40), null, 236, 237, .2, [comTex(M.plastico, tEscudo, .1), M.plastico, M.plastico], 22, 0, -40));
  const dobradica = x => [deFrente([[x - 12, 112], [x + 12, 112], [x + 12, 128], [x - 12, 128]], null, x, 120, -182.5, -178.8, .5, M.acoPreto, 40),
    cilX(3, 30, x, 113, -184.5, M.acoPreto), deCima(rr(34, 12, 2, x, -187), null, 110.1, 111.6, .3, M.acoPreto, 40)];
  peca('dobradicaE', [-150, 113, -184.5], ...dobradica(-150));
  peca('dobradicaD', [150, 113, -184.5], ...dobradica(150));

  pivos(GRUPOS);
}

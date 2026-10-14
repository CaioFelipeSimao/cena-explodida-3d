/* Motor: geometria de sólidos. Eixo de cada peça em z, centro na origem. Nenhuma peça é um plano:
   disco = parede + duas tampas com textura; tubo = revolução de um perfil; extrusão chanfrada para contornos (ponteiro, engrenagem). */

/* disco sólido: parede cilíndrica (matLado) + duas tampas com textura (texF, texB). As tampas usam CircleGeometry (UV certo). */
function disco(R, h, seg, matLado, texF, texB, matF, matB) {
  const g = new THREE.Group();
  const lado = new THREE.Mesh(new THREE.CylinderGeometry(R, R, h, seg, 1, true), matLado); lado.rotation.x = Math.PI / 2; g.add(lado);
  const f = new THREE.Mesh(new THREE.CircleGeometry(R, seg), matF || matLado.clone()); f.position.z = h / 2; if (texF) f.material.map = texF; g.add(f);
  const b = new THREE.Mesh(new THREE.CircleGeometry(R, seg), matB || matLado.clone()); b.position.z = -h / 2; b.rotation.y = Math.PI; if (texB) b.material.map = texB; g.add(b);
  return g;
}

/* tubo por revolução de um perfil fechado [[r, z], ...] (caixa, aro, cano) */
function tubo(perfil, seg, material) {
  const geo = new THREE.LatheGeometry(perfil.map(([r, z]) => new THREE.Vector2(r, z)), seg); geo.rotateX(Math.PI / 2);
  return new THREE.Mesh(geo, material);
}
/* perfil de um tubo de parede fina com cantos chanfrados (ch): raio externo Re, interno Ri, meia altura h */
const perfilTubo = (Re, Ri, h, ch) => [[Ri + ch, -h], [Re - ch, -h], [Re, -h + ch], [Re, h - ch], [Re - ch, h], [Ri + ch, h], [Ri, h - ch], [Ri, -h + ch], [Ri + ch, -h]];

/* extrusão chanfrada de contornos (listas de pontos no sistema de desenho): ponteiros, placas, qualquer forma */
function extrudar(contornos, prof, bisel, material) {
  const d = prof - 2 * bisel;
  const geo = new THREE.ExtrudeGeometry(contornos.map(c => new THREE.Shape(c.map(V))), { depth: d, bevelEnabled: true, bevelThickness: bisel, bevelSize: bisel * 5 / 6, bevelOffset: -bisel * 5 / 6, bevelSegments: 1, curveSegments: 8 });
  geo.translate(0, 0, -d / 2);
  return new THREE.Mesh(geo, material);
}

/* engrenagem: dentes e furos extrudados com chanfro. N dentes, raio primitivo pr, módulo m, fase phi (ângulo do centro de um dente).
   Engrenam de verdade quando a fase é calculada: onde uma tem dente, a vizinha tem vão. */
function engrenagem(N, pr, m, phi, material, furos, prof) {
  const tip = pr + m, root = pr - 1.25 * m, P = 360 / N, pts = [];
  for (let i = 0; i < N; i++) { const c = phi + i * P; pts.push(pol(root, c - .25 * P), pol(tip, c - .11 * P), pol(tip, c + .11 * P), pol(root, c + .25 * P)); }
  const shape = new THREE.Shape(pts.map(V));
  const furo = (x, y, r) => { const h = new THREE.Path(); h.absarc(x, -y, r, 0, TAU, true); shape.holes.push(h); };
  furo(0, 0, root * .2);
  for (let k = 0; k < furos; k++) { const [x, y] = pol(root * .58, phi + (k + .5) * 360 / furos); furo(x, y, root * .22); }
  const d = prof - 1.4;
  const geo = new THREE.ExtrudeGeometry(shape, { depth: d, bevelEnabled: true, bevelThickness: .7, bevelSize: .6, bevelOffset: -.6, bevelSegments: 2, curveSegments: 24 });
  geo.translate(0, 0, -d / 2);
  return new THREE.Mesh(geo, material);
}

/* pino: cilindro curto com eixo em z, posição no sistema de desenho */
const pino3d = (x, y, z, r, comp, material) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, comp, 20), material); m.rotation.x = Math.PI / 2; m.position.set(x, -y, z); return m; };

/* placa: contorno com furos (pontos de desenho, centrado na origem), extrudado em z com chanfro. Materiais [frente, lado, verso]:
   frente e verso levam textura de um desenho quadrado de lado t centrado na peça (como as faces do disco); o verso já sai desespelhado. */
function placa(contorno, furos, prof, bisel, mats, t) {
  const d = prof - 2 * bisel, shape = (contorno instanceof THREE.Shape) ? contorno.clone() : new THREE.Shape(contorno.map(V));
  /* o furo tem de girar ao contrário do contorno: o Three só corrige isso quando o contorno está no sentido anti-horário, e senão a parede
     de dentro do furo sai com as faces para fora e some (via-se o fundo através do anel de foco da Nikon) */
  const horario = THREE.ShapeUtils.isClockWise(shape.getPoints());
  (furos || []).forEach(f => { const p = f.map(V); if (THREE.ShapeUtils.isClockWise(p) === horario) p.reverse(); shape.holes.push(new THREE.Path(p)); });
  const geo = new THREE.ExtrudeGeometry(shape, { depth: d, bevelEnabled: bisel > 0, bevelThickness: bisel, bevelSize: bisel * 5 / 6, bevelOffset: -bisel * 5 / 6, bevelSegments: 1, curveSegments: 12 });
  geo.translate(0, 0, -d / 2);
  const tampas = geo.groups[0].count, meio = tampas / 2, pos = geo.attributes.position, uv = geo.attributes.uv;
  for (let i = 0; i < tampas; i++) uv.setXY(i, (i < meio ? -1 : 1) * pos.getX(i) / t + .5, pos.getY(i) / t + .5);   // ExtrudeGeometry: tampa de trás primeiro, depois a da frente
  geo.clearGroups(); geo.addGroup(0, meio, 2); geo.addGroup(meio, meio, 0); geo.addGroup(tampas, pos.count - tampas, 1);
  return new THREE.Mesh(geo, Array.isArray(mats) ? mats : [mats, mats, mats]);
}
const retangulo = (w, h, ch = 0) => ch ? [[-w / 2 + ch, -h / 2], [w / 2 - ch, -h / 2], [w / 2, -h / 2 + ch], [w / 2, h / 2 - ch], [w / 2 - ch, h / 2], [-w / 2 + ch, h / 2], [-w / 2, h / 2 - ch], [-w / 2, -h / 2 + ch]]
  : [[-w / 2, -h / 2], [w / 2, -h / 2], [w / 2, h / 2], [-w / 2, h / 2]];
/* serrilha: contorno de botão serrilhado (n dentes rasos de altura a no raio R), para placa() */
const serrilha = (R, n, a) => Array.from({ length: n * 2 }, (_, i) => pol(i % 2 ? R - a : R, i * 180 / n));

/* Peça embutida nasce da mãe: interseção com seu offset interno, inclusive furos (offset externo).
   Entrada: pontos de desenho, { contorno, furos } ou THREE.Shape (coordenadas Three); região = pontos ou Shape sem furos.
   Mãe e furos precisam ser convexos; região pode ser côncava. Curvas são amostradas em 48 segmentos por curva.
   Retorna UM Shape; interseções vazias, desconectadas ou tangências ambíguas falham explicitamente. */
function embutido(contornoMae, regiao, recuo = 0) {
  const eps = 1e-7, sonda = 1e-5;
  if (!Number.isFinite(recuo) || recuo < 0) throw new Error('embutido: recuo deve ser finito e não negativo');
  const cruz = (a, b) => a[0] * b[1] - a[1] * b[0];
  const sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
  const perto = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]) < eps;
  const area = p => p.reduce((s, a, i) => s + cruz(a, p[(i + 1) % p.length]), 0) / 2;
  const limpa = pontos => {
    const p = pontos.map(q => [...q]).filter((q, i, a) => !i || !perto(q, a[i - 1]));
    if (p.length > 1 && perto(p[0], p[p.length - 1])) p.pop();
    if (p.length < 3 || Math.abs(area(p)) < eps) throw new Error('embutido: contorno degenerado');
    return area(p) < 0 ? p.reverse() : p;
  };
  const pontosShape = s => s.getPoints(48).map(p => [p.x, -p.y]);
  const mae = (contornoMae instanceof THREE.Shape) ? { contorno: pontosShape(contornoMae), furos: contornoMae.holes.map(pontosShape) }
    : Array.isArray(contornoMae) ? { contorno: contornoMae, furos: [] } : contornoMae;
  if ((regiao instanceof THREE.Shape) && regiao.holes.length) throw new Error('embutido: região com furos não suportada');
  const offset = (pontos, distancia) => {
    const p = limpa(pontos), linhas = p.map((a, i) => {
      const b = p[(i + 1) % p.length], d = sub(b, a), len = Math.hypot(...d);
      if (cruz(d, sub(p[(i + 2) % p.length], b)) < -eps) throw new Error('embutido: mãe e furos devem ser convexos');
      return { a: [a[0] - d[1] / len * distancia, a[1] + d[0] / len * distancia], d };
    });
    const q = linhas.map((l, i) => {
      const ant = linhas[(i + linhas.length - 1) % linhas.length], den = cruz(ant.d, l.d);
      if (Math.abs(den) < eps) return l.a;
      const t = cruz(sub(l.a, ant.a), l.d) / den;
      return [ant.a[0] + ant.d[0] * t, ant.a[1] + ant.d[1] * t];
    });
    if (area(q) < eps || q.some(a => linhas.some(l => cruz(l.d, sub(a, l.a)) < -eps)))
      throw new Error('embutido: recuo elimina o contorno');
    return limpa(q);
  };
  const externo = offset(mae.contorno, recuo), furos = (mae.furos || []).map(f => offset(f, -recuo));
  const desejado = limpa((regiao instanceof THREE.Shape) ? pontosShape(regiao) : regiao);
  const dentro = (q, p) => {
    let sim = false;
    for (let i = 0, j = p.length - 1; i < p.length; j = i++) {
      const a = p[i], b = p[j];
      if ((a[1] > q[1]) !== (b[1] > q[1]) && q[0] < (b[0] - a[0]) * (q[1] - a[1]) / (b[1] - a[1]) + a[0]) sim = !sim;
    }
    return sim;
  };
  const pertence = q => dentro(q, externo) && dentro(q, desejado) && !furos.some(f => dentro(q, f));
  /* Quebra todas as arestas nas interseções; só conserva as que separam interior/exterior do recorte.
     Assim um furo que cruza a região vira uma reentrância, em vez de um hole encostado no contorno. */
  const segmentos = [externo, desejado, ...furos].flatMap(p => p.map((a, i) => ({ a, b: p[(i + 1) % p.length], cortes: [0, 1] })));
  for (let i = 0; i < segmentos.length; i++) for (let j = i + 1; j < segmentos.length; j++) {
    const a = segmentos[i], b = segmentos[j], da = sub(a.b, a.a), db = sub(b.b, b.a), den = cruz(da, db), ab = sub(b.a, a.a);
    if (Math.abs(den) > eps) {
      const t = cruz(ab, db) / den, u = cruz(ab, da) / den;
      if (t >= -eps && t <= 1 + eps && u >= -eps && u <= 1 + eps) {
        a.cortes.push(Math.max(0, Math.min(1, t))); b.cortes.push(Math.max(0, Math.min(1, u)));
      }
    } else if (Math.abs(cruz(ab, da)) < eps) {
      for (const [s, outro] of [[a, b], [b, a]]) {
        const d = sub(s.b, s.a), len2 = d[0] ** 2 + d[1] ** 2;
        for (const q of [outro.a, outro.b]) { const v = sub(q, s.a), t = (v[0] * d[0] + v[1] * d[1]) / len2; if (t > 0 && t < 1) s.cortes.push(t); }
      }
    }
  }
  const vertices = [], arestas = [];
  const indice = q => { const i = vertices.findIndex(p => perto(p, q)); if (i >= 0) return i; vertices.push(q); return vertices.length - 1; };
  for (const s of segmentos) {
    const d = sub(s.b, s.a), ts = s.cortes.sort((a, b) => a - b).filter((t, i, a) => !i || t - a[i - 1] > eps);
    const emT = t => [s.a[0] + d[0] * t, s.a[1] + d[1] * t];
    for (let i = 1; i < ts.length; i++) {
      const a = emT(ts[i - 1]), b = emT(ts[i]), m = emT((ts[i - 1] + ts[i]) / 2), len = Math.hypot(...d);
      const n = [-d[1] / len * sonda, d[0] / len * sonda];
      const esquerda = pertence([m[0] + n[0], m[1] + n[1]]), direita = pertence([m[0] - n[0], m[1] - n[1]]);
      if (esquerda === direita) continue;
      const v = esquerda ? [indice(a), indice(b)] : [indice(b), indice(a)];
      if (!arestas.some(e => e[0] === v[0] && e[1] === v[1])) arestas.push(v);
    }
  }
  const ciclos = [];
  while (arestas.length) {
    const [inicio, fim] = arestas.shift(), ciclo = [vertices[inicio]]; let atual = fim;
    while (atual !== inicio) {
      ciclo.push(vertices[atual]);
      const proximas = arestas.map((e, i) => e[0] === atual ? i : -1).filter(i => i >= 0);
      if (proximas.length !== 1) throw new Error('embutido: tangência ou contorno aberto');
      atual = arestas.splice(proximas[0], 1)[0][1];
    }
    ciclos.push(ciclo);
  }
  const bordas = ciclos.filter(p => area(p) > eps), vazios = ciclos.filter(p => area(p) < -eps);
  if (bordas.length !== 1) throw new Error('embutido: região vazia ou desconectada');
  const shape = new THREE.Shape(bordas[0].map(V));
  shape.holes = vazios.map(p => new THREE.Path(p.map(V)));
  return shape;
}

/* ===== Prop desenhado no lugar (nasceu na Nikon F e foi trazido para o motor no Dual 1019) =====
   Cada peça é desenhada em mm do objeto real, onde fica montada (x para a direita de quem olha de frente, y para cima a partir do chão,
   z para a frente), e recentrada no seu pivô. U = unidades por mm; Y0 = altura (mm) do centro do conjunto.
   montagem(U, Y0) devolve os ajudantes; pivos(grupos) calcula o m de TODO nó da ARVORE a partir dos pivôs (folhas: o de peca();
   grupos: o do mapa grupos, em mm) e soma os deslocamentos e/d de partes (em unidades, y para baixo). Grupo com pivô próprio gira em volta
   dele (tampa na dobradiça, prato no eixo); sem pivô, o grupo fica na origem do pai, como na Nikon. */
function montagem(U, Y0) {
  const PIVO = {};
  const em = (o, x, y, z) => { o.position.set(x, y - Y0, z); return o; };
  /* perfil de torno fechado (sem isso falta a parede de dentro dos anéis) e com os cantos vivos (> 25°) duplicados (aresta nítida) */
  const solido = p => { if (p.length < 3) return p; const f = p[0], u = p[p.length - 1], c = (f[0] !== u[0] || f[1] !== u[1]) && f[0] > 0 && u[0] > 0 ? [...p, f] : p; const ang = (a, b) => Math.atan2(b[1] - a[1], b[0] - a[0]);
    return c.flatMap((q, i) => { if (!i || i === c.length - 1) return [q]; let d = Math.abs(ang(q, c[i + 1]) - ang(c[i - 1], q)); if (d > Math.PI) d = 2 * Math.PI - d; return d > .45 ? [q, q] : [q]; }); };
  /* sólido de planta (contorno [x, z] visto de cima, z para a frente) extrudado na vertical de y0 a y1; materiais [topo, lado, fundo];
     o desenho do topo (lado t) fica centrado em (cx, cz): no SVG, x = x e y = z (a frente embaixo) */
  const desloca = (c, cx, cz) => c.map(([x, z]) => [x - cx, z - cz]);
  const deCima = (contorno, furos, y0, y1, bisel, mats, t = 150, cx = 0, cz = 0) => {
    const desenho = p => p.getPoints(48).map(v => [v.x, -v.y]);
    const borda = (contorno instanceof THREE.Shape) ? desenho(contorno) : contorno;
    const vazios = [...((contorno instanceof THREE.Shape) ? contorno.holes.map(desenho) : []), ...(furos || [])];
    const m = placa(desloca(borda, cx, cz), vazios.map(f => desloca(f, cx, cz)), y1 - y0, bisel, mats, t);
    m.rotation.x = -Math.PI / 2; m.position.set(cx, (y0 + y1) / 2 - Y0, cz); return m; };
  /* sólido de frente (contorno [x, y] visto de frente, y para cima) extrudado em z de z0 a z1, desenho centrado em (cx, cy) */
  const deFrente = (contorno, furos, cx, cy, z0, z1, bisel, mats, t = 100) => { const f = c => c.map(([x, y]) => [x - cx, -(y - cy)]);
    return em(placa(f(contorno), (furos || []).map(f), z1 - z0, bisel, mats, t), cx, cy, (z0 + z1) / 2); };
  /* sólido de perfil (contorno [z, y] visto do lado direito) extrudado em x de x0 a x1, desenho centrado em (cz, cy) */
  const deLado = (contorno, x0, x1, bisel, mats, t = 200, cz = 0, cy = Y0) => { const m = placa(contorno.map(([z, y]) => [-(z - cz), -(y - cy)]), null, x1 - x0, bisel, mats, t);
    m.rotation.y = Math.PI / 2; m.position.set((x0 + x1) / 2, cy - Y0, cz); return m; };
  /* torno em volta de um eixo vertical: perfil [r, y] com y em mm do chão */
  const eixoY = (perfil, x, z, seg, material) => { const m = tubo(solido(perfil), seg, material); m.rotation.x = -Math.PI / 2; return em(m, x, 0, z); };
  /* disco deitado (tampas com textura: topo e fundo), topo em yTopo */
  const discoY = (r, h, x, yTopo, z, seg, matLado, texTopo, matTopo, texFundo, matFundo) => { const d = disco(r, h, seg, matLado, texTopo, texFundo, matTopo, matFundo || matLado.clone()); d.rotation.x = -Math.PI / 2; return em(d, x, yTopo - h / 2, z); };
  /* peça: junta os objetos (no lugar, em mm) num grupo recentrado no pivô [x, y, z] (mm) e escalado para unidades */
  function peca(nome, pivo, ...objs) {
    const g = new THREE.Group(), dentro = new THREE.Group();
    objs.forEach(o => dentro.add(o)); dentro.position.set(-pivo[0], -(pivo[1] - Y0), -pivo[2]);
    g.add(dentro); g.scale.setScalar(U); G[nome] = g; raizG.add(g); PIVO[nome] = pivo;
  }
  /* m de cada nó = (pivô dele − pivô do pai) em unidades; e/d de partes são deslocamentos (e a partir de m, d a partir de e); r soma o m */
  function pivos(grupos = {}) {
    const pai = {}; for (const p in ARVORE) for (const f of ARVORE[p]) pai[f] = p;
    const raiz = Object.keys(ARVORE).find(n => !(n in pai)), pv = n => n === raiz ? [0, Y0, 0] : PIVO[n] || grupos[n] || pv(pai[n]);
    const soma = (a, b) => { const r = { ...a }; for (const k in b) r[k] = (r[k] || 0) + b[k]; return r; };
    for (const n in pai) {
      const p = partes[n] || (partes[n] = { ordem: 0 }), a = pv(n), b = pv(pai[n]);
      p.m = soma({ x: (a[0] - b[0]) * U, y: -(a[1] - b[1]) * U, z: (a[2] - b[2]) * U }, p.m || {}); p.e = soma(p.m, p.e || {}); p.d = soma(p.e, p.d || {});
      if (p.r !== undefined) p.r += p.m[p.eixo || 'rotationZ'] || 0;
    }
  }
  return { PIVO, em, solido, deCima, deFrente, deLado, eixoY, discoY, peca, pivos };
}

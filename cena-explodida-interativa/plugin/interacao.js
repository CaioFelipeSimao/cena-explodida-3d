/* cena-explodida-interativa: depois que a rolagem termina (prop montado), o usuário mexe no prop com as mãos.
   Dois toques no prop abrem com a MESMA explosão do ato de abertura (mesmas poses e e o mesmo ritmo; sem a flutuação d: as peças param
   na pose, pedido do usuário em 2026-10-02), sem girar a vista;
   como a vista do fim costuma ser o espelho da do começo, a explosão aparece espelhada. Dois toques numa peça de um subconjunto (a lente)
   abrem ou fecham só ele; dois toques em qualquer outra peça fecham tudo.
   Arrastar move; Shift + arrastar (ou botão direito) gira; no toque, um dedo move e dois dedos giram (torcer gira no plano da tela,
   arrastar com dois dedos tomba); pinça e rodinha ampliam a peça agarrada. Ao soltar, posição, giro e escala voltam suavemente.
   Subconjunto fechado (boneca russa menor) se arrasta inteiro.
   Nada disso toca nos proxies da rolagem: o plugin soma deslocamentos próprios depois de aplica() (depoisAplica).
   A peça agarrada desenha por cima das outras (camada 1, segunda passada de desenho). ajustesAbertura: deslocamento extra de uma peça só
   na explosão por dois toques (volta ao fechar).
   Lê CFG.interativo = { abrir: [nós], subconjuntos: [nós], zoom, afastar: { nó: {x,y,z} }, ajustesAbertura: { nó: {x,y,z} }, textos }. */
const INT = {};
/* as peças nascem depois (construirPecas é assíncrona): o plugin se monta quando a cena fica pronta */
function iniciarInteracao() {
  const cfg = Object.assign({ abrir: [], subconjuntos: [], zoom: 1, escalaMin: .5, escalaMax: 2, afastar: {}, girarAoAbrir: {}, espalhar: {}, zoomAoAbrir: {}, ajustesAbertura: {}, textos: {} }, CFG.interativo);
  const toque = matchMedia('(pointer: coarse)').matches;
  const txt = Object.assign({ montado: toque ? 'arraste · dois dedos giram · dois toques abrem' : 'arraste · shift + arrastar gira · dois cliques abrem',
    aberto: toque ? 'um dedo move · dois dedos giram · dois toques fecham' : 'arraste para mover · shift + arrastar gira · dois cliques fecham' }, cfg.textos);
  const arv = typeof ARVORE !== 'undefined' ? ARVORE : {};
  const nos = Object.keys(G).filter(n => G[n] !== raizG), folhas = nos.filter(n => !arv[n]);
  const pai = {}; for (const p in arv) for (const f of arv[p]) pai[f] = p;
  /* o prop inteiro também se arrasta (com ele montado): RZ é a raiz (o grupo do conjunto) */
  const RZ = Object.keys(G).find(n => G[n] === raizG) || '__raiz', GG = n => n === RZ ? raizG : G[n];
  /* D: abertura (convenção CSS, como os proxies); X: afastamento extra de um subconjunto aberto; I: arrasto (eixos do pai) e giro em volta de um pivô */
  const D = {}, X = {}, I = {}, ZI = { k: 1 }, v = new THREE.Vector3(), w = new THREE.Vector3(), q = new THREE.Quaternion(), eixoY = new THREE.Vector3(0, 1, 0);
  I[RZ] = { x: 0, y: 0, z: 0, q: new THREE.Quaternion(), piv: new THREE.Vector3(), girou: false, escala: 1 };
  /* D.rx/ry/rzE: giro da pose e (tampa na dobradiça); D.rz: a volta das peças com r */
  for (const n of nos) { D[n] = { x: 0, y: 0, z: 0, rx: 0, ry: 0, rzE: 0, rz: 0 }; X[n] = { x: 0, y: 0, z: 0, ry: 0, piv: new THREE.Vector3() }; I[n] = { x: 0, y: 0, z: 0, q: new THREE.Quaternion(), piv: new THREE.Vector3(), girou: false, escala: 1 }; }
  /* aplica() repõe posição e giro, mas não a escala: copiar a base evita acúmulo entre quadros. */
  const escalaBase = {}; for (const n of [RZ, ...nos]) escalaBase[n] = GG(n).scale.clone();
  const aplicarEscala = n => GG(n).scale.copy(escalaBase[n]).multiplyScalar(I[n].escala);
  const folhaDe = new Map(); for (const n of folhas) G[n].traverse(o => { if (o.isMesh) folhaDe.set(o, n); });
  const malhas = [...folhaDe.keys()];
  let estado = 'inativo'; const abertos = new Set();
  const marca = () => { sujo = true; };

  depoisAplica.push(() => {
    for (const n of nos) {
      const d = D[n], x = X[n], i = I[n], g = G[n];
      if (d.x || d.y || d.z) g.position.add(v.set(d.x, -d.y, d.z));
      if (x.x || x.y || x.z) g.position.add(v.set(x.x, -x.y, x.z));
      if (x.ry) { q.setFromAxisAngle(eixoY, rad(x.ry)); g.quaternion.premultiply(q); w.copy(x.piv).applyQuaternion(q); g.position.add(v.copy(x.piv).sub(w)); }   // subconjunto vira de lado em volta do próprio centro
      if (d.rx || d.ry || d.rzE) { g.rotation.x -= rad(d.rx); g.rotation.y += rad(d.ry); g.rotation.z -= rad(d.rzE); }   // mesmo sinal de aplica()
      if (d.rz) { const e = partes[n] && partes[n].eixo; if (e === 'rotationY') g.rotateY(rad(d.rz)); else if (e === 'rotationX') g.rotateX(-rad(d.rz)); else g.rotateZ(-rad(d.rz)); }
      aplicarEscala(n);
      if (i.x || i.y || i.z) g.position.add(v.set(i.x, i.y, i.z));
      if (i.girou) { g.quaternion.premultiply(i.q); w.copy(i.piv).applyQuaternion(i.q); g.position.add(v.copy(i.piv).sub(w)); }   // gira em volta do pivô, não da origem
    }
    const ir = I[RZ];   // o prop inteiro
    aplicarEscala(RZ);
    if (ir.x || ir.y || ir.z) raizG.position.add(v.set(ir.x, ir.y, ir.z));
    if (ir.girou) { raizG.quaternion.premultiply(ir.q); w.copy(ir.piv).applyQuaternion(ir.q); raizG.position.add(v.copy(ir.piv).sub(w)); }
    if (ZI.k !== 1) zoomG.scale.multiplyScalar(ZI.k);
  });

  /* ---- dica (o rodapé da rolagem sai enquanto a interação está ligada: as duas ficavam uma em cima da outra) ---- */
  const dica = document.createElement('div'); dica.className = 'int-dica'; dica.hidden = true; palco.append(dica);
  const mostra = () => { const d0 = $('dica'); if (d0) d0.style.visibility = estado === 'inativo' ? '' : 'hidden';
    dica.hidden = estado === 'inativo'; dica.textContent = estado === 'aberto' ? txt.aberto : txt.montado;
    /* com a interação ligada o navegador não rola sozinho sobre o canvas (o dedo arrasta o prop); no fundo, a rolagem é feita à mão */
    if (estado !== 'aberto') canvas.style.touchAction = estado === 'inativo' ? 'manipulation' : 'none'; };
  const travaRolagem = sim => { document.documentElement.style.overflow = document.body.style.overflow = sim ? 'hidden' : ''; canvas.style.touchAction = sim ? 'none' : 'manipulation'; };
  canvas.style.touchAction = 'manipulation';   // duplo toque não dá zoom na página
  canvas.addEventListener('contextmenu', e => { if (estado !== 'inativo') e.preventDefault(); });   // botão direito gira

  /* ---- abrir e fechar: o mesmo movimento do ato (escalonado por ordem, power3); extras aparecem e somem ---- */
  const T = TEMPOS;   // sem flutuação depois de abrir: as peças param na pose e, sem a fase 2 (pedido do usuário, 2026-10-02)
  const viagem = (p, abrindo) => {
    const filhas = arv[p] || [], om = Math.max(...filhas.map(n => partes[n].ordem));
    filhas.forEach(n => {
      const pt = partes[n], atraso = T.passo * (abrindo ? om - pt.ordem : pt.ordem);
      gsap.killTweensOf(D[n]);
      const k = abrindo && cfg.espalhar[p] || 1;   // espalhar: subconjunto aberto à mão se espalha mais (peças no mesmo eixo não se cobrem)
      /* giro da pose e (a tampa vira na dobradiça), menos o eixo das peças que giram (r/voltas) */
      const ex = pt.eixo || 'rotationZ', gi = pt.r !== undefined || pt.voltas !== undefined, dr = q => gi && q === ex ? 0 : (pt.e[q] || 0) - (pt.m[q] || 0);
      if (abrindo) {
        gsap.to(D[n], { x: (pt.e.x - pt.m.x) * k, y: (pt.e.y - pt.m.y) * k, z: (pt.e.z - pt.m.z) * k, rx: dr('rotationX'), ry: dr('rotationY'), rzE: dr('rotationZ'), duration: T.peca, delay: atraso, ease: 'power3.inOut', onUpdate: marca });
      } else gsap.to(D[n], { x: 0, y: 0, z: 0, rx: 0, ry: 0, rzE: 0, duration: T.peca, delay: atraso, ease: 'power3.inOut', onUpdate: marca });
      if (pt.r !== undefined) gsap.fromTo(D[n], { rz: 0 }, { rz: abrindo ? 360 : -360, duration: T.peca, delay: atraso, ease: 'power2.inOut', onUpdate: marca, onComplete: () => { D[n].rz = 0; } });
      if (typeof E !== 'undefined' && E[n]) gsap.to(E[n], { a: abrindo ? 1 : 0, duration: T.peca * .5, delay: atraso + T.peca * (abrindo ? .2 : .35), onUpdate: marca });
    });
    if (cfg.afastar[p]) gsap.to(X[p], { ...(abrindo ? cfg.afastar[p] : { x: 0, y: 0, z: 0 }), duration: T.peca, ease: 'power3.inOut', onUpdate: marca });
    /* girarAoAbrir: a vista não gira na interação, então o subconjunto vira de lado para mostrar o que abre ao longo do eixo dele */
    if (cfg.girarAoAbrir[p] !== undefined && G[p]) {
      if (abrindo && !X[p].ry) { caixa.setFromObject(G[p]); caixa.getCenter(p0); G[p].parent.worldToLocal(p0); X[p].piv.copy(p0).sub(G[p].position); }
      gsap.to(X[p], { ry: abrindo ? cfg.girarAoAbrir[p] : 0, duration: T.peca, ease: 'power3.inOut', onUpdate: marca });
    }
  };
  const zoomAberto = () => Array.isArray(cfg.zoom) ? cfg.zoom[palco.clientWidth < palco.clientHeight ? 1 : 0] : cfg.zoom;   // [tela deitada, tela em pé]
  const abrir = () => {
    soltar(RZ);
    cfg.abrir.forEach(p => { viagem(p, true); abertos.add(p); });
    for (const n in cfg.ajustesAbertura) gsap.to(X[n], { ...cfg.ajustesAbertura[n], duration: T.peca, ease: 'power3.inOut', onUpdate: marca });
    gsap.to(ZI, { k: zoomAberto() / Z.scale, duration: T.peca, ease: 'power3.inOut', onUpdate: marca });
    estado = 'aberto'; travaRolagem(true); mostra();
  };
  const fechar = () => {
    for (const p of [...abertos]) viagem(p, false); abertos.clear();
    for (const n in cfg.ajustesAbertura) gsap.to(X[n], { x: 0, y: 0, z: 0, duration: T.peca, ease: 'power3.inOut', onUpdate: marca });
    for (const n of [RZ, ...nos]) soltar(n);
    gsap.to(ZI, { k: 1, duration: T.peca, delay: T.passo * 3, ease: 'power3.inOut', onUpdate: marca });
    estado = 'montado'; travaRolagem(false); mostra();
  };
  /* zoomAoAbrir: o subconjunto aberto à mão pode precisar de mais espaço (recua o zoom para caber inteiro) */
  const alternar = s => { const ab = !abertos.has(s); viagem(s, ab); if (ab) abertos.add(s); else { abertos.delete(s); for (const n of nos) if (dentroDe(n, s)) soltar(n); }
    if (cfg.zoomAoAbrir[s]) gsap.to(ZI, { k: (ab ? cfg.zoomAoAbrir[s] : zoomAberto()) / Z.scale, duration: T.peca, ease: 'power3.inOut', onUpdate: marca }); };

  /* ---- raio na peça visível sob o ponteiro ---- */
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
  const visivel = o => { for (let k = o; k; k = k.parent) if (!k.visible) return false; return true; };
  const naTela = (cx, cy) => { const r = canvas.getBoundingClientRect(); ndc.set((cx - r.left) / r.width * 2 - 1, -(cy - r.top) / r.height * 2 + 1); ray.setFromCamera(ndc, camera); };
  const peca = (cx, cy) => { naTela(cx, cy); const h = ray.intersectObjects(malhas.filter(visivel), false)[0]; return h ? { n: folhaDe.get(h.object), p: h.point } : null; };
  const dentroDe = (n, s) => { for (let k = n; k; k = pai[k]) if (k === s) return true; return false; };
  /* o que se arrasta: sobe da peça até o nó cujo pai está aberto (subconjunto fechado vai inteiro, como um objeto só) */
  const alvoDe = n => { let k = n; while (pai[k] && !abertos.has(pai[k])) k = pai[k]; return k; };

  /* ---- arrasto: mover (um dedo, botão esquerdo) ou girar (Shift, botão direito, dois dedos); ao soltar volta suave ---- */
  const dedos = new Map(); let arr = null;
  const plano = new THREE.Plane(), p0 = new THREE.Vector3(), p1 = new THREE.Vector3(), eixo = new THREE.Vector3(), qp = new THREE.Quaternion(), qd = new THREE.Quaternion(), caixa = new THREE.Box3();
  const soltar = n => { const i = I[n]; if (!(i.x || i.y || i.z || i.girou || i.escala !== 1)) return;
    gsap.to(i, { x: 0, y: 0, z: 0, escala: 1, duration: .8, ease: 'power2.inOut', onUpdate: () => { aplicarEscala(n); marca(); } });
    if (!i.girou) return;
    const de = i.q.clone(), k = { t: 0 };
    gsap.to(k, { t: 1, duration: .8, ease: 'power2.inOut', onUpdate: () => { i.q.copy(de).slerp(q.identity(), k.t); marca(); }, onComplete: () => { i.q.identity(); i.girou = false; marca(); } }); };
  const limitarEscala = k => Math.max(cfg.escalaMin, Math.min(cfg.escalaMax, k));
  canvas.addEventListener('wheel', e => {
    if (estado === 'inativo' || !arr || arr.rolagem) return;
    e.preventDefault();
    /* deltaMode: pixels, linhas (~16 px) ou páginas; só captura a rodinha com um nó agarrado. */
    const dy = e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? canvas.clientHeight : 1);
    I[arr.n].escala = limitarEscala(I[arr.n].escala * Math.exp(-dy * .0015));
    arr.moveu = true; if (baixo) baixo.varios = true; marca();
  }, { passive: false });
  /* eixo de giro: gesto na tela -> eixos do pai do nó (o giro acontece onde a peça vive) */
  const paraPai = (n, eixoTela) => { GG(n).parent.getWorldQuaternion(qp); return eixoTela.applyQuaternion(camera.quaternion).applyQuaternion(qp.invert()); };
  const girar = (n, eixoTela, ang) => { const i = I[n]; qd.setFromAxisAngle(paraPai(n, eixoTela).normalize(), ang); i.q.premultiply(qd); i.girou = true; };
  const comecar = (n, ponto) => {
    const i = I[n]; gsap.killTweensOf(i);
    /* pivô: a origem da peça; num grupo (subconjunto inteiro), o centro da caixa dele, para girar em volta de si e não do centro do prop */
    const g = GG(n); if (arv[n] || n === RZ) { caixa.setFromObject(g); caixa.getCenter(p0); g.parent.worldToLocal(p0); i.piv.copy(p0).sub(g.position); } else if (!i.girou) i.piv.set(0, 0, 0);
    plano.setFromNormalAndCoplanarPoint(camera.getWorldDirection(eixo).negate(), ponto);
    return { n, ini: { x: i.x, y: i.y, z: i.z }, p0: ponto.clone() };
  };
  /* onde a peça deve estar com o ponteiro em (cx, cy): o deslocamento desde o ponto agarrado, nos eixos do pai */
  const alvoDoPonteiro = (cx, cy) => { naTela(cx, cy); if (!ray.ray.intersectPlane(plano, p1)) return null; const g = GG(arr.n).parent; p0.copy(arr.p0); g.worldToLocal(p0); g.worldToLocal(p1);
    return { x: arr.ini.x + p1.x - p0.x, y: arr.ini.y + p1.y - p0.y, z: arr.ini.z + p1.z - p0.z }; };
  const mover = () => { if (!arr || !arr.alvo) return; const i = I[arr.n], a = arr.alvo, tr = arr.trans, t = tr ? tr.t : 1, d = tr ? tr.de : a;
    i.x = d.x + (a.x - d.x) * t; i.y = d.y + (a.y - d.y) * t; i.z = d.z + (a.z - d.z) * t; marca(); };
  /* saindo do giro (soltou o Shift, ou ficou um dedo só) a peça não pula: desliza até o ponteiro com a mesma cadência da volta */
  const deslizar = () => { const i = I[arr.n], tr = arr.trans = { t: 0, de: { x: i.x, y: i.y, z: i.z } };
    arr.alvo = alvoDoPonteiro(arr.ux, arr.uy) || arr.alvo;
    gsap.to(tr, { t: 1, duration: .8, ease: 'power2.inOut', onUpdate: mover, onComplete: () => { if (arr && arr.trans === tr) arr.trans = null; } }); };
  addEventListener('keyup', e => { if (e.key === 'Shift' && arr && !arr.gira && arr.girando && !arr.dois) { arr.girando = false; deslizar(); } });
  /* a peça agarrada desenha POR CIMA das outras (não passa por dentro delas como fantasma): ela fica nas camadas 0 E 1. A passada
     normal (camada 0) a desenha com tudo, e o mapa de sombra a inclui (o three r128 só põe na sombra o que a câmera principal enxerga).
     Depois de limpar a profundidade, a segunda passada (só camada 1) a redesenha por cima com o MESMO mapa de sombra e as mesmas
     luzes: recebe e projeta sombra como as outras, só ganha a frente. */
  scene.traverse(o => { if (o.isLight) o.layers.enable(1); }); ray.layers.enable(1);
  let topo = null, soltarTopo = null;
  const porCima = n => { if (soltarTopo) { soltarTopo.kill(); soltarTopo = null; }
    if (topo) topo.traverse(o => o.layers.set(0)); topo = n ? GG(n) : null; if (topo) topo.traverse(o => o.layers.enable(1)); marca(); };
  const desenhoBase = renderizar;
  /* vidro e acrílico da peça agarrada entram só na segunda passada: desenhados nas duas, o fumê soma duas vezes e escurece.
     Com o objeto inteiro agarrado não há nada de que ganhar a frente: uma passada só. */
  renderizar = () => { if (!topo || topo === raizG || topo === GG(RZ)) { desenhoBase(); return; }
    const vidros = []; topo.traverse(o => { if (o.isMesh && o.visible && [].concat(o.material).some(m => m.transparent)) { vidros.push(o); o.visible = false; } });
    desenhoBase(); for (const o of vidros) o.visible = true;
    const ac = renderer.autoClear, au = renderer.shadowMap.autoUpdate; renderer.autoClear = false; renderer.shadowMap.autoUpdate = false;
    renderer.clearDepth(); camera.layers.set(1); renderer.render(scene, camera); camera.layers.set(0);
    renderer.autoClear = ac; renderer.shadowMap.autoUpdate = au; };
  canvas.addEventListener('pointerdown', e => {
    if (estado === 'inativo') return;
    dedos.set(e.pointerId, { x: e.clientX, y: e.clientY }); canvas.setPointerCapture(e.pointerId);
    if (dedos.size === 1) {
      const h = peca(e.clientX, e.clientY);
      if (!h) { arr = estado === 'montado' && e.pointerType !== 'mouse' ? { rolagem: true, id: e.pointerId, y: e.clientY } : null; return; }   // dedo no fundo: rola a página
      arr = { ...comecar(alvoDe(h.n), h.p), id: e.pointerId, x: e.clientX, y: e.clientY, ux: e.clientX, uy: e.clientY, gira: e.shiftKey || e.button === 2, girando: e.shiftKey || e.button === 2, moveu: false };
      porCima(arr.n);
    } else if (dedos.size === 2 && arr && !arr.rolagem) {
      const [a, b] = [...dedos.values()]; arr.girando = true; arr.dois = { distancia: Math.max(Math.hypot(b.x - a.x, b.y - a.y), 1), escala: I[arr.n].escala, ang: Math.atan2(b.y - a.y, b.x - a.x), mx: (a.x + b.x) / 2, my: (a.y + b.y) / 2 }; arr.moveu = true;
    }
  });
  canvas.addEventListener('pointermove', e => {
    if (!dedos.has(e.pointerId)) return; dedos.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (!arr) return;
    if (arr.rolagem) { if (e.pointerId === arr.id) { scrollBy(0, arr.y - e.clientY); arr.y = e.clientY; } return; }
    if (arr.dois && dedos.size >= 2) {
      /* dois dedos: distância amplia desde o início; torcer gira e arrastar o meio tomba ao mesmo tempo. */
      const [a, b] = [...dedos.values()], ang = Math.atan2(b.y - a.y, b.x - a.x), mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
      I[arr.n].escala = limitarEscala(arr.dois.escala * Math.hypot(b.x - a.x, b.y - a.y) / arr.dois.distancia);
      /* sincroniza com o valor deste evento, mesmo antes do próximo depoisAplica. */
      aplicarEscala(arr.n);
      let da = ang - arr.dois.ang; if (da > Math.PI) da -= TAU; if (da < -Math.PI) da += TAU;
      if (da) girar(arr.n, eixo.set(0, 0, -1), da);
      const dx = mx - arr.dois.mx, dy = my - arr.dois.my; if (dx || dy) girar(arr.n, eixo.set(dy, dx, 0), Math.hypot(dx, dy) * .012);
      Object.assign(arr.dois, { ang, mx, my }); marca(); return;
    }
    if (e.pointerId !== arr.id || dedos.size > 1) return;
    const dx = e.clientX - arr.x, dy = e.clientY - arr.y; if (!arr.moveu && Math.hypot(dx, dy) < 6) return; arr.moveu = true;
    arr.ux = e.clientX; arr.uy = e.clientY;
    const gira = arr.gira || e.shiftKey;
    if (gira) { girar(arr.n, eixo.set(dy, dx, 0), Math.hypot(dx, dy) * .012); arr.x = e.clientX; arr.y = e.clientY; arr.girando = true; marca(); return; }
    if (arr.girando) { arr.girando = false; arr.x = e.clientX; arr.y = e.clientY; deslizar(); return; }
    arr.alvo = alvoDoPonteiro(e.clientX, e.clientY) || arr.alvo; arr.x = e.clientX; arr.y = e.clientY; mover();
  });
  const fimDedo = e => { if (!dedos.delete(e.pointerId)) return;
    /* ao soltar, a peça continua por cima durante a volta (.8 s, a duração de soltar) e só então volta à camada normal */
    if (dedos.size === 0 && arr) { const { n, moveu, rolagem } = arr; arr = null;
      if (!rolagem && (moveu || I[n].escala !== 1)) { soltar(n); const t = gsap.delayedCall(.8, () => { if (soltarTopo === t) { soltarTopo = null; porCima(null); } }); soltarTopo = t; } else porCima(null);
      return; }
    /* de dois dedos para um: descarta a referência da pinça, congelando I[n].escala; o dedo restante move sem pulo. */
    if (dedos.size === 1 && arr && arr.dois) { const [[id, p]] = [...dedos]; arr.dois = null; arr.id = id; arr.x = arr.ux = p.x; arr.y = arr.uy = p.y; arr.girando = false; deslizar(); } };
  canvas.addEventListener('pointerup', fimDedo); canvas.addEventListener('pointercancel', fimDedo);

  /* ---- dois toques (mouse e dedo): dois toques curtos e parados, em menos de 320 ms e 24 px; arrasto ou dois dedos não contam ---- */
  let ult = null, baixo = null;
  canvas.addEventListener('pointerdown', e => { baixo = { t: performance.now(), x: e.clientX, y: e.clientY, varios: dedos.size > 1 }; });
  canvas.addEventListener('pointerup', e => {
    if (estado === 'inativo' || !baixo) return;
    const agora = performance.now();
    if (baixo.varios || agora - baixo.t > 300 || Math.hypot(e.clientX - baixo.x, e.clientY - baixo.y) > 10) { ult = null; return; }
    if (ult && agora - ult.t < 320 && Math.hypot(e.clientX - ult.x, e.clientY - ult.y) < 24) { ult = null; duplo(e.clientX, e.clientY); return; }
    ult = { t: agora, x: e.clientX, y: e.clientY };
  });
  const duplo = (cx, cy) => {
    const h = peca(cx, cy); if (!h) return;                                  // fundo: nada
    if (estado === 'montado') return abrir();
    const s = cfg.subconjuntos.find(s => dentroDe(h.n, s));
    if (s) alternar(s); else fechar();
  };

  /* ---- liga só com a rolagem no fim (prop montado); se a rolagem voltar, desliga ---- */
  gsap.ticker.add(() => {
    if (!tl || estado === 'aberto') return;
    const fim = tl.progress() > .995;
    if (fim && estado === 'inativo') { estado = 'montado'; mostra(); } else if (!fim && estado === 'montado') { estado = 'inativo'; mostra(); }
  });
  Object.assign(INT, { RZ, D, X, I, ZI, estado: () => estado, abrir, fechar, alternar, duplo, alvoDe });
}
gsap.ticker.add(function esperaPronto() { if (window.pronto) { gsap.ticker.remove(esperaPronto); iniciarInteracao(); } });

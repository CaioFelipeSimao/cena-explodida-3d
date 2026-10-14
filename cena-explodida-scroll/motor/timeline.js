/* Motor: tabela de peças -> timeline do scroll. Lê partes (tabela do prop), POSES, TEMPOS e CFG.grande.
   Cada peça: m = montada, e = explodida (herda de m), d = à deriva (herda de e), ordem = quem sai primeiro, r = giro total (opcional).
   A viagem é m -> e -> d -> m; o estado final é literalmente o m do começo, então o encaixe não desalinha.
   Peças com r giram num tween só de m.rotationZ até r (r - m é múltiplo de 360), para nunca frear entre as fases. */
let tl = null, nUpd = 0;
const baseP = { x: 0, y: 0, z: 0, rotationX: 0, rotationY: 0, rotationZ: 0 };

function prepararPartes() {
  if (temAtos) return prepararArvore();
  for (const [nome, p] of Object.entries(partes)) {
    p.m = { ...baseP, ...p.m }; p.e = { ...p.m, ...p.e }; p.d = { ...p.e, ...p.d };
    P[nome] = { ...p.m };
  }
}

function construirTimeline() {
  if (tl) { tl.scrollTrigger && tl.scrollTrigger.kill(true); tl.kill(); }
  if (temAtos) return construirAtos();
  for (const [n, p] of Object.entries(partes)) Object.assign(P[n], p.m);
  Object.assign(R, POSES.ini); Z.scale = CFG.grande; sujo = true;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const T = TEMPOS, ordemMax = Math.max(...Object.values(partes).map(p => p.ordem));
  tl = gsap.timeline({ defaults: { ease: 'power3.inOut' }, onUpdate: () => { nUpd++; sujo = true; },
    scrollTrigger: { trigger: palco, start: 'top top', end: T.scroll, pin: true, scrub: estado.suav === 0 ? true : estado.suav } });
  tl.to({}, { duration: T.respiroIni });
  tl.addLabel('explode');
  const T_CAMERA = T.explode + T.camera, FIM_DERIVA = T_CAMERA + T.giro;
  Object.entries(partes).forEach(([n, p]) => {
    const eixo = p.eixo || 'rotationZ', gira = p.r !== undefined, f = o => gira ? sem(o, eixo) : o;
    const iniE = T.passo * (ordemMax - p.ordem), iniD = iniE + T.peca, iniR = FIM_DERIVA + T.passo * p.ordem;   // a deriva de cada peça termina quando a remontagem DELA começa
    tl.to(P[n], { ...f(p.e), duration: T.peca }, `explode+=${iniE}`);
    tl.to(P[n], { ...f(p.d), duration: iniR - iniD, ease: 'sine.inOut' }, `explode+=${iniD}`);
    tl.to(P[n], { ...f(p.m), duration: T.peca }, `explode+=${iniR}`);
    if (gira) tl.to(P[n], { [eixo]: p.r, duration: iniR + T.peca - iniE, ease: 'power1.inOut' }, `explode+=${iniE}`);
  });
  tl.to(Z, { scale: 1, duration: T.explode }, 'explode');
  tl.to(Z, { scale: CFG.grande, duration: T.remonta }, `explode+=${FIM_DERIVA}`);
  tl.to(R, { ...POSES.e, duration: T.explode }, 'explode');
  tl.to(R, { ...POSES.d, duration: T.camera, ease: 'sine.inOut' }, `explode+=${T.explode}`);
  tl.to(R, { ...POSES.giro, duration: T.giro, ease: 'power2.inOut' }, `explode+=${T_CAMERA}`);
  tl.to(R, { ...POSES.fim, duration: T.remonta }, `explode+=${FIM_DERIVA}`);
  tl.to({}, { duration: T.respiroFim });
  ScrollTrigger.refresh();
}

/* ===== Árvore e atos. Só vale quando o prop define ARVORE e ATOS (no partes.js); sem eles o ciclo plano acima roda intocado. =====
   ARVORE = { pai: [filhas] }; a raiz (o nó que não é filha de ninguém) é o conjunto, raizG. Nó interno vira um THREE.Group com as filhas
   dentro: quando o pai se move, as filhas vão junto. partes[nó] = m/e/d/ordem/r RELATIVOS ao pai; e = pose quando o PAI está aberto;
   fora = deslocamento para sair de cena quando a câmera foca outro nó (modo 'quadro').
   ATOS = passos em sequência; cada passo combina ações, que acontecem juntas:
     abrir: [nós]   as filhas desses nós se separam (m -> e) e derivam (-> d) até o fechar delas
     fechar: [nós]  as filhas voltam ao m literal (encaixe exato, como no ciclo plano)
     focar: nó      centra e amplia o nó; as irmãs dele e as irmãs dos seus ancestrais saem de cena
     voltar: true   desfaz o último foco (as peças voltam à cena)
     camera: { rotationX, rotationY } do conjunto, zoom: escala, duracao (opcional: calcula pelas peças), estilo (reservado, Fase 2)
   Saída de cena: CFG.saida = 'quadro' (afastam-se pelo campo fora) ou 'sumir' (ficam transparentes e deixam de ser desenhadas); chave no painel. */
const temAtos = typeof ATOS !== 'undefined';
const PAI = {}, S = {}, A = {}, FW = {}, E = {};   // PAI: pai de cada nó; S: deslocamento de saída; A: opacidade; FW: peso do foco (nós internos); E: presença das peças extra
const EST = {};                            // estilo animado por ato (ato.estilo); os valores iniciais vêm de CFG.estilo, que os plugins preenchem
let RAIZ = null, MARCAS = [];              // MARCAS: início e fim de cada passo (verificação por ato)

function prepararArvore() {
  const filhas = new Set(Object.values(ARVORE).flat());
  RAIZ = Object.keys(ARVORE).find(n => !filhas.has(n)); G[RAIZ] = raizG;
  const monta = pai => ARVORE[pai].forEach(n => { PAI[n] = pai; G[n] = G[n] || new THREE.Group(); G[pai].add(G[n]); if (ARVORE[n]) monta(n); });
  monta(RAIZ);
  for (const n in PAI) {
    const p = partes[n] || (partes[n] = { ordem: 0 });
    p.m = { ...baseP, ...p.m }; p.e = { ...p.m, ...p.e }; p.d = { ...p.e, ...p.d };
    P[n] = { ...p.m }; S[n] = { x: 0, y: 0, z: 0 }; A[n] = { a: 1 }; if (ARVORE[n]) FW[n] = { w: 0 }; if (p.extra) E[n] = { a: 0 };
  }
  /* material próprio por malha: a transparência de uma peça não vaza para outra que usa o mesmo material (latão da platina e do pino) */
  const mats = o => Array.isArray(o.material) ? o.material : [o.material];   // malhas com vários materiais (placa: frente, lado, verso)
  raizG.traverse(o => { if (o.isMesh) { o.material = Array.isArray(o.material) ? o.material.map(m => m.clone()) : o.material.clone(); o.userData.base = mats(o).map(m => ({ op: m.opacity, tr: m.transparent })); } });
  estado.saida = CFG.saida || 'quadro';
}

const vW = new THREE.Vector3(), vC = new THREE.Vector3();
function opacidade(g, a) {
  g.visible = a > 0.002; if (!g.visible) return;   // sumida = não desenhada (não custa nada no iPhone)
  g.traverse(o => {
    if (!o.isMesh) return;
    (Array.isArray(o.material) ? o.material : [o.material]).forEach((m, i) => {
      const b = o.userData.base[i], tr = b.tr || a < 1;
      m.opacity = b.op * a; if (m.transparent !== tr) { m.transparent = tr; m.needsUpdate = true; }
    });
  });
}
function aplicaAtos() {
  for (const n in S) { const s = S[n]; if (s.x || s.y || s.z) G[n].position.add(vW.set(s.x, -s.y, s.z)); }
  for (const n in PAI) if (!ARVORE[n]) { let a = 1; for (let k = n; k !== RAIZ; k = PAI[k]) a *= A[k].a * (E[k] ? E[k].a : 1); opacidade(G[n], a); }
  /* foco: desloca o conjunto para o nó focado ficar no centro (a posição dele já rodada pela câmera); pesos permitem passar de um foco a outro */
  raizG.position.set(0, 0, 0); vC.set(0, 0, 0);
  for (const n in FW) if (FW[n].w > 0) { const f = partes[n].foco; if (f) { G[n].updateWorldMatrix(true, false); G[n].localToWorld(vW.set(f.x || 0, -(f.y || 0), f.z || 0)); } /* matriz do quadro atual: sem isso o deslocamento do foco se somava */ else G[n].getWorldPosition(vW); zoomG.worldToLocal(vW); vC.addScaledVector(vW, FW[n].w); }
  raizG.position.copy(vC).negate();
}

function botaoSaida() {
  let b = $('c-saida');
  if (!b) {
    b = document.createElement('button'); b.id = 'c-saida'; $('c-res').parentNode.append(b);
    b.onclick = () => { estado.saida = estado.saida === 'quadro' ? 'sumir' : 'quadro'; construirTimeline(); };
  }
  b.textContent = 'saída: ' + (estado.saida === 'quadro' ? 'sai do quadro' : 'some');
}

function construirAtos() {
  for (const n in PAI) { Object.assign(P[n], partes[n].m); Object.assign(S[n], { x: 0, y: 0, z: 0 }); A[n].a = 1; }
  for (const n in FW) FW[n].w = 0;
  for (const n in E) E[n].a = 0;
  Object.assign(EST, CFG.estilo || {});
  Object.assign(R, POSES.ini); Z.scale = CFG.grande; sujo = true;
  botaoSaida();
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const T = TEMPOS;
  tl = gsap.timeline({ paused: true, defaults: { ease: 'power3.inOut' }, onUpdate: () => { nUpd++; sujo = true; } });
  const giro = {}, aberto = {}, foco = [], fora = new Set();   // giro: rotationZ acumulada das que giram; aberto: nó -> quando abriu; foco: pilha
  for (const n in PAI) giro[n] = partes[n].m[partes[n].eixo || 'rotationZ'];
  const giraSo = p => p.r !== undefined || p.voltas !== undefined;   // o eixo do giro sai dos tweens de e/d/m (r: só aberta; voltas: a rolagem toda)
  const ordemMax = pai => Math.max(...ARVORE[pai].map(n => partes[n].ordem));
  const durMov = pais => Math.max(0, ...pais.map(p => T.peca + T.passo * ordemMax(p)));
  const outros = x => { const s = new Set(); for (let k = x; k !== RAIZ; k = PAI[k]) ARVORE[PAI[k]].forEach(n => n !== k && s.add(n)); return s; };
  const destino = n => ({ x: 0, y: 0, z: 0, ...(partes[n].fora || { y: -900 }) });

  /* a viagem das filhas de um pai entre abrir (tA) e fechar (tF): mesmas regras do ciclo plano (escalonada, deriva sem parar, volta ao m literal) */
  const viagem = (pai, tA, tF) => {
    const om = ordemMax(pai);
    ARVORE[pai].forEach(n => {
      const p = partes[n], eixo = p.eixo || 'rotationZ', gira = p.r !== undefined, f = o => giraSo(p) ? sem(o, eixo) : o;
      const iniE = tA + T.passo * (om - p.ordem), iniD = iniE + T.peca, iniR = tF + T.passo * p.ordem;
      tl.to(P[n], { ...f(p.e), duration: T.peca }, iniE);
      /* deriva: com janela curta (fechar logo depois de abrir) a peça só anda a parte de d que cabe nela na velocidade normal; antes ela percorria
         a deriva inteira num instante e dava um tranco no fim da abertura (armamento e obturador da Nikon) */
      const jan = Math.max(0, iniR - iniD), k = Math.min(1, jan / (T.peca * .75)), alvo = {};
      for (const q in p.d) alvo[q] = p.e[q] + (p.d[q] - p.e[q]) * k;
      tl.to(P[n], { ...f(alvo), duration: jan, ease: 'sine.inOut' }, iniD);
      tl.to(P[n], { ...f(p.m), duration: T.peca }, iniR);
      if (E[n]) { tl.to(E[n], { a: 1, duration: T.peca * .5, ease: 'power1.out' }, iniE + T.peca * .2); tl.to(E[n], { a: 0, duration: T.peca * .45, ease: 'power1.in' }, iniR + T.peca * .35); }   // extra: só existe com o pai aberto
      if (gira) { giro[n] += p.r - p.m[eixo]; tl.to(P[n], { [eixo]: giro[n], duration: iniR + T.peca - iniE, ease: 'power1.inOut' }, iniE); }
    });
  };

  let t = T.respiroIni; MARCAS = [];
  tl.to({}, { duration: t }, 0);
  for (const ato of ATOS) {
    const abrir = ato.abrir || [], fechar = ato.fechar || [];
    const dur = ato.duracao || Math.max(durMov(abrir), durMov(fechar), ato.focar || ato.voltar ? T.foco : 0);
    abrir.forEach(p => { aberto[p] = t; });
    fechar.forEach(p => { if (!(p in aberto)) throw new Error(`ATOS: fechar ${p} sem abrir antes`); viagem(p, aberto[p], t); delete aberto[p]; });
    if (ato.focar || ato.voltar) {
      const antes = foco[foco.length - 1];
      if (ato.focar) foco.push(ato.focar); else foco.pop();
      const agora = foco[foco.length - 1], novos = agora ? outros(agora) : new Set();
      /* CFG.focoSuave: o centro anda primeiro com curva suave e o zoom vem depois (sem isso, foco longe do centro + zoom juntos dão um tranco no meio do ato) */
      const fw = CFG.focoSuave ? { duration: dur * .75, ease: 'sine.inOut' } : { duration: dur };
      if (antes) tl.to(FW[antes], { w: 0, ...fw }, t);
      if (agora) tl.to(FW[agora], { w: 1, ...fw }, t);
      for (const n of new Set([...fora, ...novos])) {
        const sai = novos.has(n); if (sai === fora.has(n)) continue;
        if (estado.saida === 'sumir') tl.to(A[n], { a: sai ? 0 : 1, duration: dur * .7, ease: 'power1.inOut' }, sai ? t : t + dur * .3);
        else tl.to(S[n], { ...(sai ? destino(n) : { x: 0, y: 0, z: 0 }), duration: dur }, t);
      }
      fora.clear(); novos.forEach(n => fora.add(n));
    }
    if (ato.camera) tl.to(R, { ...ato.camera, duration: dur, ease: 'power2.inOut' }, t);
    if (ato.estilo) tl.to(EST, { ...ato.estilo, duration: dur, ease: 'sine.inOut' }, t);
    if (ato.zoom !== undefined) { if (CFG.focoSuave && (ato.focar || ato.voltar)) tl.to(Z, { scale: ato.zoom, duration: dur * .8, ease: 'sine.inOut' }, t + dur * .2); else tl.to(Z, { scale: ato.zoom, duration: dur }, t); }
    MARCAS.push({ id: ato.id, ini: t, fim: t + dur, fechar });
    t += dur;
  }
  if (Object.keys(aberto).length || foco.length) console.warn('ATOS: termina com', Object.keys(aberto), 'aberto(s) e foco em', foco);
  tl.to({}, { duration: T.respiroFim }, t);
  /* voltas: peça que gira a rolagem inteira em volta do próprio eixo (prato de um toca-discos ligado, hélice), montada ou aberta;
     acaba em m + 360 x voltas, a mesma pose do começo. Não combine com r na mesma peça. */
  for (const n in PAI) { const p = partes[n]; if (p.voltas !== undefined) { const eixo = p.eixo || 'rotationZ'; tl.to(P[n], { [eixo]: p.m[eixo] + 360 * p.voltas, duration: tl.duration(), ease: 'power1.inOut' }, 0); } }
  /* o scroll cresce com os atos: TEMPOS.porUnidade = % da altura da tela por unidade de timeline (o ciclo plano do relógio dá ~58) */
  ScrollTrigger.create({ animation: tl, trigger: palco, start: 'top top', end: '+=' + Math.round(tl.duration() * T.porUnidade) + '%', pin: true,
    scrub: estado.suav === 0 ? true : estado.suav });
  ScrollTrigger.refresh();
}

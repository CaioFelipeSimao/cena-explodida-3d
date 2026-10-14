/* cena-blueprint-3d: anotações por cima do desenho (SVG e DOM sobre o canvas, ancoradas nas peças a cada quadro).
   EST.anot (0..1, animado por ato) faz tudo aparecer: as linhas-guia crescem a partir do ponto, os textos e o carimbo surgem.
   CFG.blueprint:
     rotulos: [{ no, ponto: [x, y, z], texto, curto, dir }]   curto = texto para telas estreitas (opcional)
              ponto no sistema da peça (o da peça montada no lugar: mm a partir do pivô na Nikon);
                                                    dir = [dx, dy] na tela (opcional): para onde a linha-guia sai; sem ele, para fora do centro
     cotas:   [{ no, de: [x, y, z], ate: [x, y, z], texto, desvio }]   linha de cota entre dois pontos da peça, afastada `desvio` px
     carimbo: { titulo, linhas: [[rótulo, valor], ...] }   quadro de identificação no canto */
const AN = (() => {
  const cfg = CFG.blueprint || {}, tema = TEMAS_BP[cfg.tema] || TEMAS_BP.papel, ns = 'http://www.w3.org/2000/svg';
  palco.style.setProperty('--bp-linha', tema.linha); palco.style.setProperty('--bp-fundo', tema.fundo);
  const svg = document.createElementNS(ns, 'svg'); svg.setAttribute('class', 'bp-anot'); svg.setAttribute('aria-hidden', 'true'); palco.append(svg);
  const el = (tag, cls) => { const e = document.createElementNS(ns, tag); if (cls) e.setAttribute('class', cls); svg.append(e); return e; };
  const rot = (cfg.rotulos || []).map(r => ({ ...r, p: r.ponto, ponto: el('circle', 'bp-ponto'), linha: el('polyline', 'bp-guia'), txt: el('text', 'bp-texto') }));
  rot.forEach(r => { r.ponto.setAttribute('r', 2.4); r.txt.textContent = r.texto; });
  const cot = (cfg.cotas || []).map(c => ({ ...c, linha: el('path', 'bp-cota'), txt: el('text', 'bp-texto bp-texto-cota') }));
  cot.forEach(c => { c.txt.textContent = c.texto; c.txt.setAttribute('text-anchor', 'middle'); });
  let carimbo = null;
  if (cfg.carimbo) {
    carimbo = document.createElement('div'); carimbo.className = 'bp-carimbo'; carimbo.setAttribute('aria-hidden', 'true');
    carimbo.innerHTML = '<b>' + cfg.carimbo.titulo + '</b>' + cfg.carimbo.linhas.map(([k, v]) => '<span>' + k + '</span><span>' + v + '</span>').join('');
    palco.append(carimbo);
  }
  const v = new THREE.Vector3();
  /* peça que gira a rolagem toda (partes.voltas: o prato de um toca-discos) levaria o ponto junto e o rótulo daria voltas:
     nela o ponto fica preso ao lugar da peça (posição e escala dela no pai), sem o giro */
  const gira = no => typeof partes !== 'undefined' && partes[no] && partes[no].voltas !== undefined;
  const tela = (no, p) => { const g = G[no]; g.updateWorldMatrix(true, false);
    if (gira(no)) g.parent.localToWorld(v.set(p[0], p[1], p[2]).multiply(g.scale).add(g.position)); else g.localToWorld(v.set(p[0], p[1], p[2])); v.project(camera);
    return [(v.x + 1) / 2 * palco.clientWidth, (1 - v.y) / 2 * palco.clientHeight]; };
  const visivel = no => { for (let o = G[no]; o; o = o.parent) if (!o.visible) return false; return true; };
  return function () {
    /* as anotações só começam na metade da transição (e somem na metade da volta): antes disso a peça ainda é 3D, e ponto e texto
       pareciam os primeiros a chegar e os últimos a sair. Daí em diante: ponto, linha crescendo, texto. */
    const a = Math.max(0, Math.min(1, ((EST.anot || 0) - .5) * 2));
    svg.style.opacity = a > .001 ? 1 : 0; if (carimbo) carimbo.style.opacity = a;
    if (a <= .001) return;
    for (const r of rot) r.ponto.style.opacity = Math.min(1, a * 4);
    const W = palco.clientWidth, H = palco.clientHeight, cx = W / 2, cy = H / 2, L = Math.min(70, W * .11) * a, pequeno = W < 520;
    const caixas = [];   // textos já postos (cotas primeiro): um rótulo que cairia em cima de um deles desce até ficar livre
    for (const c of cot) {
      const ok = visivel(c.no); c.linha.style.display = c.txt.style.display = ok ? '' : 'none'; if (!ok) continue;
      const [x1, y1] = tela(c.no, c.de), [x2, y2] = tela(c.no, c.ate), dx = x2 - x1, dy = y2 - y1, n = Math.hypot(dx, dy) || 1;
      const ox = -dy / n * (c.desvio || 16), oy = dx / n * (c.desvio || 16), m = (1 - a) / 2;       // a cota cresce do meio para as pontas
      const ax = x1 + ox + dx * m, ay = y1 + oy + dy * m, bx = x2 + ox - dx * m, by = y2 + oy - dy * m, t = 4;
      c.linha.setAttribute('d', `M${x1 + ox * .3},${y1 + oy * .3}L${x1 + ox * 1.25},${y1 + oy * 1.25}M${x2 + ox * .3},${y2 + oy * .3}L${x2 + ox * 1.25},${y2 + oy * 1.25}` +
        `M${ax},${ay}L${bx},${by}M${ax - dy / n * t + dx / n * t},${ay + dx / n * t + dy / n * t}L${ax + dy / n * t - dx / n * t},${ay - dx / n * t - dy / n * t}` +
        `M${bx - dy / n * t + dx / n * t},${by + dx / n * t + dy / n * t}L${bx + dy / n * t - dx / n * t},${by - dx / n * t - dy / n * t}`);
      c.txt.setAttribute('x', (x1 + x2) / 2 + ox * 1.7); c.txt.setAttribute('y', (y1 + y2) / 2 + oy * 1.7);
      c.txt.style.fontSize = pequeno ? '9px' : '11px';
      { const w = c.txt.getComputedTextLength(), cx2 = +c.txt.getAttribute('x'), cy2 = +c.txt.getAttribute('y'); caixas.push([cx2 - w / 2, cy2 - 7, cx2 + w / 2, cy2 + 7]); }
      c.txt.style.opacity = Math.max(0, a * 2 - 1); c.txt.style.fontSize = pequeno ? '9px' : '11px';
    }
    for (const r of rot) {
      const ok = visivel(r.no); r.ponto.style.display = r.linha.style.display = r.txt.style.display = ok ? '' : 'none'; if (!ok) continue;
      const [x, y] = tela(r.no, r.p), dx = r.dir ? r.dir[0] : x - cx, dy = r.dir ? r.dir[1] : y - cy, n = Math.hypot(dx, dy) || 1, lado = dx < 0 ? -1 : 1;
      const ex = x + dx / n * L, borda = 8; let ey = y + dy / n * L;
      r.ponto.setAttribute('cx', x); r.ponto.setAttribute('cy', y);
      const t = pequeno && r.curto ? r.curto : r.texto; if (r.txt.textContent !== t) r.txt.textContent = t;
      r.txt.style.fontSize = pequeno ? '9px' : '11px'; r.txt.style.opacity = Math.max(0, a * 2 - 1);
      /* rótulo técnico: o texto fica em cima da linha de apoio (nunca riscado) e desliza para dentro se for passar da borda da tela */
      const w = r.txt.getComputedTextLength();
      let x0 = lado > 0 ? ex + 3 : ex - 3 - w; x0 = Math.max(borda, Math.min(W - borda - w, x0));
      const cot = lado > 0 ? x0 - 3 : x0 + w + 3, fim = lado > 0 ? x0 + w : x0, apoio = cot + (fim - cot) * a;   // o cotovelo acompanha o texto
      const alt = pequeno ? 6 : 8, passo = pequeno ? 11 : 14, sentido = dy < 0 ? -1 : 1;
      const bate = e => caixas.some(b => x0 < b[2] && x0 + w > b[0] && e - alt - 7 < b[3] && e - alt + 7 > b[1]), dentro = e => e - alt - 7 >= borda && e - alt + 7 <= H - borda;
      const ey0 = ey;   // tenta descer/subir; se sair da tela, tenta o outro lado; se nenhum couber, fica preso dentro da tela
      for (const s of [sentido, -sentido]) { ey = ey0; for (let k = 0; k < 8 && bate(ey) && dentro(ey + s * passo); k++) ey += s * passo; if (dentro(ey) && !bate(ey)) break; }
      ey = Math.max(borda + alt + 7, Math.min(H - borda - 7 + alt, ey));
      caixas.push([x0, ey - alt - 7, x0 + w, ey - alt + 7]);
      r.linha.setAttribute('points', `${x},${y} ${cot},${ey} ${apoio},${ey}`);
      r.txt.setAttribute('x', x0); r.txt.setAttribute('y', ey - (pequeno ? 6 : 8)); r.txt.setAttribute('text-anchor', 'start');
    }
  };
})();
function anotar() { AN(); }

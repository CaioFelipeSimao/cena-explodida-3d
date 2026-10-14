/* Faces do Dual 1019 em SVG (cada uma vira textura). Gravações como as do aparelho: pretas no alumínio, brancas no preto; o único acento é o azul do selo "S".
   Coordenadas em mm, centradas na peça; nas faces de cima x = x do mundo e y = z (a frente fica embaixo do desenho). */
const CD = { alu: '#c9c9cb', aluE: '#aeaead', grav: '#141110', platina: '#1f1411', branco: '#efede8', borracha: '#2c2a28', sulco: '#3b3937', azul: '#2f7fc1', creme: '#e6dcc4', cinza: '#636365' };
const FT = 'font-family="Archivo, Helvetica, Arial, sans-serif"';
const tx = (x, y, s, tam, peso, cor, extra = '') => `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="central" font-size="${tam}" font-weight="${peso}" ${FT} fill="${cor}" ${extra}>${s}</text>`;
/* escovado: linhas finas claras (o alumínio do painel é escovado de lado a lado) */
const riscos = (w, h, n, op) => Array.from({ length: n }, (_, i) => { const y = -h / 2 + (i + .5) * h / n; return `<line x1="${-w / 2}" x2="${w / 2}" y1="${y}" y2="${y}" stroke="#fff" stroke-opacity="${op * (i % 3 ? .45 : 1)}" stroke-width=".25"/>`; }).join('');
const aneis = (r0, r1, passo, cor, larg, op = 1) => { let s = ''; for (let r = r0; r <= r1; r += passo) s += `<circle r="${r.toFixed(2)}" fill="none" stroke="${cor}" stroke-width="${larg}" stroke-opacity="${op}"/>`; return s; };
const arco = (cx, cy, r, a0, a1) => { const [x0, y0] = pol(r, a0), [x1, y1] = pol(r, a1); return `M${cx + x0},${cy + y0}A${r},${r} 0 ${Math.abs(a1 - a0) > 180 ? 1 : 0} ${a1 > a0 ? 1 : 0} ${cx + x1},${cy + y1}`; };

/* painel de comando (81): alumínio escovado, o logotipo "Dual" numa caixa preta, "1019", a escala manual · stop · start e os tamanhos 17 · 25 · 30.
   Centro do desenho = centro da peça (x 110, z 41,5 no mundo); 210 de lado. */
const PAINEL_C = [110, 41.5], PAINEL_ARCO = [20, 40];   // centro do painel no mundo; centro do arco da partida no desenho
const painelF = (() => {
  const [ax, ay] = PAINEL_ARCO;   // centro do arco da alavanca de partida (local; a alavanca em pecas.js usa o mesmo)
  let s = `<rect x="-105" y="-105" width="210" height="210" fill="${CD.aluE}"/>${riscos(210, 210, 160, .22)}`;
  /* deCima/UV e viewBox -105 -105 210 210: (x,y)=(X-110,Z-41.5).
     Caixa (2,-86) e número até y=-58.7: >7.8 mm até a borda plana com chanfro .4 (>6.2 unidades com U=.8). */
  s += `<rect x="2" y="-86" width="34" height="14" fill="${CD.grav}"/>${tx(19, -78.9, 'Dual', 10.5, 700, CD.branco, 'textLength="27" lengthAdjust="spacingAndGlyphs"')}`;
  s += tx(19, -63, '1019', 8.6, 700, CD.grav, 'textLength="34" lengthAdjust="spacingAndGlyphs" letter-spacing=".4"');
  s += `<path d="${arco(ax, ay, 52, 160, 35)}" fill="none" stroke="${CD.grav}" stroke-width="1.1"/>`;
  [160, 132, 105, 70, 35].forEach(a => { const [x0, y0] = pol(48, a), [x1, y1] = pol(55, a); s += `<line x1="${ax + x0}" y1="${ay + y0}" x2="${ax + x1}" y2="${ay + y1}" stroke="${CD.grav}" stroke-width=".7"/>`; });
  [['manual', 150], ['stop', 112], ['start', 66]].forEach(([t, a]) => { const [x, y] = pol(61, a); s += tx(ax + x, ay + y, t, 4.4, 500, CD.grav); });
  [['30', 6], ['25', 18], ['17', 30]].forEach(([t, y]) => { s += tx(42, y, t, 5.4, 700, CD.grav); s += `<line x1="48" x2="53" y1="${y}" y2="${y}" stroke="${CD.grav}" stroke-width=".6"/>`; });
  s += `<rect x="-68" y="-99" width="134" height="200" fill="none" stroke="#8f8f8e" stroke-width=".5" stroke-opacity=".7"/>`;
  return s;
})();
/* verso do painel: alumínio sem escovar, o número da peça carimbado */
const painelB = `<rect x="-105" y="-105" width="210" height="210" fill="#b9b9b8"/>${tx(30, 0, '219 181', 6, 500, '#7d7d7c', 'letter-spacing="1"')}`;

/* platina (15), por cima: pintura preto-café, o selo azul "S" e a plaquinha de alumínio atrás, à esquerda do braço */
const platinaF = `<rect x="-190" y="-190" width="380" height="380" fill="${CD.platina}"/>
  <circle cx="58" cy="-132" r="7" fill="${CD.azul}"/><circle cx="58" cy="-132" r="6" fill="none" stroke="${CD.branco}" stroke-width=".5"/>${tx(58, -131.6, 'S', 8, 700, CD.branco)}
  <rect x="68" y="-139" width="30" height="13" fill="${CD.alu}"/>${tx(83, -135.3, 'Dual 1019', 3.4, 700, CD.grav)}${tx(83, -130.2, '220 V ~ 50 Hz', 2.6, 500, CD.grav)}
  ${tx(-150, 141, 'Transportschrauben lösen', 3, 500, '#8c837b')}`;
/* platina por baixo: o mesmo preto, fosco, com o anel estampado do prato e as gravações da fábrica */
const platinaB = `<rect x="-190" y="-190" width="380" height="380" fill="#181210"/>
  <circle cx="38" cy="0" r="132" fill="none" stroke="#2b221d" stroke-width="3"/>
  ${tx(38, 70, 'DUAL GEBR. STEIDINGER', 6, 700, '#3a302a', 'letter-spacing="1.2"')}${tx(38, 80, 'ST. GEORGEN / SCHWARZW.', 4.6, 500, '#3a302a', 'letter-spacing="1"')}
  ${tx(-120, -120, 'Typ 1019', 5, 700, '#3a302a')}${tx(-120, -112, 'Made in Germany', 3.6, 500, '#3a302a')}`;

/* disco de vinil (compacto de 17 cm): sulcos, faixas entre as músicas, selo creme com o texto da gravadora (inventada) */
let vinilSeloId = 0;
const vinilF = lado => {
  const seloR = 44, arcoR = seloR * .78, arcoId = `dual-1019-selo-${++vinilSeloId}`;
  let s = `<circle r="87.5" fill="#0b0b0c"/>${aneis(45, 86, .55, '#1d1d1f', .28)}`;
  [58, 69, 78].forEach(r => { s += `<circle r="${r}" fill="none" stroke="#262628" stroke-width="1.1"/>`; });
  s += `<circle r="86.6" fill="none" stroke="#1a1a1b" stroke-width="1.6"/><circle r="44" fill="${CD.creme}"/><circle r="41.5" fill="none" stroke="${CD.grav}" stroke-width=".4"/><circle r="39.8" fill="none" stroke="${CD.grav}" stroke-width=".25"/>`;
  /* Arco superior centrado em (0,0), r=34.32; comprimento de 150°. Textos retos
     limitados em largura: envelopes dentro de r=41.36 (94% do selo), fora de r=5.6 (furo + 2). */
  s += `<defs><path id="${arcoId}" d="M${-arcoR},0A${arcoR},${arcoR} 0 0 1 ${arcoR},0"/></defs>
    <text text-anchor="middle" font-size="4.4" font-weight="700" ${FT} fill="${CD.grav}" letter-spacing=".8" textLength="${arcoR * Math.PI * 5 / 6}" lengthAdjust="spacingAndGlyphs"><textPath href="#${arcoId}" startOffset="50%">SCHWARZWALD-PLATTE</textPath></text>`;
  s += tx(0, -20, 'STEREO', 3.4, 500, CD.grav, 'textLength="22" lengthAdjust="spacingAndGlyphs" letter-spacing="1.4"');
  s += tx(0, 15, lado === 1 ? 'Tanz der Stunden' : 'Abend am See', 5, 700, CD.grav, 'textLength="44" lengthAdjust="spacingAndGlyphs"') + tx(0, 22, 'Orchester Hans Berger', 3.6, 500, CD.grav, 'textLength="40" lengthAdjust="spacingAndGlyphs"');
  s += tx(-24, 0, 'SEITE ' + lado, 3.4, 700, CD.grav, 'textLength="14" lengthAdjust="spacingAndGlyphs"') + tx(24, 0, '33 U/min', 3.4, 700, CD.grav, 'textLength="16" lengthAdjust="spacingAndGlyphs"') + tx(0, 31, 'Made in Germany', 2.8, 500, CD.grav, 'textLength="24" lengthAdjust="spacingAndGlyphs"');
  return s + '<circle r="3.6" fill="#050505"/>'; };

/* tapete (5): borracha preta fosca, anel largo de alumínio em malha própria (r 92–124),
   miolo preto inclusive junto ao eixo. Pares claro/escuro pintam o relevo dos sulcos. */
const tapeteF = `<circle r="133" fill="#3b3937"/>
  ${aneis(22, 90, 1.6, '#292725', .55)}${aneis(22.45, 90, 1.6, '#484542', .35)}
  ${aneis(125, 132, 1.4, '#292725', .5)}${aneis(125.4, 132, 1.4, '#484542', .3)}
  <circle r="20" fill="#3b3937"/><circle r="20" fill="none" stroke="#292725" stroke-width=".7"/>
  ${aneis(7, 18, 3, '#34312f', .45)}`;
/* verso: borracha texturada com sulcos concêntricos e pequenas nervuras radiais;
   contraste suficiente para o bumpMap preservar o relevo sob luz rasante. */
const tapeteB = `<circle r="133" fill="#3b3937"/>
  ${aneis(24, 129, 4, '#292725', .8)}${aneis(24.6, 129, 4, '#4b4844', .55)}
  ${Array.from({ length: 36 }, (_, i) => { const [x0, y0] = pol(26, i * 10), [x1, y1] = pol(128, i * 10); return `<line x1="${x0}" y1="${y0}" x2="${x1}" y2="${y1}" stroke="#292725" stroke-width="2.4"/><line x1="${x0}" y1="${y0}" x2="${x1}" y2="${y1}" stroke="#4b4844" stroke-width="1.1"/>`; }).join('')}
  <circle r="20" fill="#3b3937"/>${aneis(8, 20, 4, '#34312f', .6)}`;

/* seletor de velocidade (7-14): topo de alumínio com 16 · 33 · 45 · 78 e o índice */
const veloF = `<circle r="10.5" fill="${CD.alu}"/><circle r="10" fill="none" stroke="#8c8c8c" stroke-width=".3"/>
  ${[['16', -135], ['33', -45], ['45', 45], ['78', 135]].map(([t, a]) => { const [x, y] = pol(6.6, a - 90); return tx(x, y, t, 2.9, 700, CD.grav, `transform="rotate(${a} ${x} ${y})"`); }).join('')}
  <circle r="2.2" fill="#8a8a8c"/><path d="M0,-10L1,-8.4H-1Z" fill="${CD.grav}"/>`;
/* placa do seletor: alumínio escovado com a escala do ajuste fino */
const placaVeloF = `<rect x="-30" y="-30" width="60" height="60" fill="${CD.aluE}"/>${riscos(60, 60, 50, .2)}
  <path d="${arco(0, 0, 15.5, 200, 340)}" fill="none" stroke="${CD.grav}" stroke-width=".5"/>${tx(-14, 9, '−', 4, 700, CD.grav)}${tx(14, 9, '+', 4, 700, CD.grav)}`;

/* base do antiskating (63-68): anel preto com a escala 0 a 6 e o índice branco */
const antiskF = `<circle r="27" fill="#141213"/>${anelNum(['0', '1', '2', '3', '4', '5', '6'], 21, -75, 25, 3.6, CD.branco)}
  <circle r="15" fill="none" stroke="#3a3839" stroke-width=".8"/><path d="M0,-26.6L1.4,-23.6H-1.4Z" fill="${CD.branco}"/>`;
function anelNum(lista, r, a0, passo, tam, cor) { return lista.map((t, i) => { const a = a0 + i * passo, [x, y] = pol(r, a - 90); return tx(x, y, t, tam, 700, cor, `transform="rotate(${a} ${x} ${y})"`); }).join(''); }

/* emblema GRUNDIG (na base, frente direita): plaquinha de alumínio com o nome em letras pretas, redesenhado como gravação */
const grundigF = `<rect x="-28" y="-28" width="56" height="56" fill="${CD.alu}"/><rect x="-25.6" y="-4.9" width="51.2" height="9.8" rx="1.2" fill="none" stroke="${CD.grav}" stroke-width=".7"/>
  ${tx(0, .2, 'GRUNDIG', 6.6, 700, CD.grav, 'textLength="42" lengthAdjust="spacingAndGlyphs"')}`;
/* emblema no topo da tampa: quadrado preto com um escudo prateado */
const escudoF = `<rect x="-11" y="-11" width="22" height="22" fill="#121011"/><rect x="-10" y="-10" width="20" height="20" fill="none" stroke="#5c5a58" stroke-width=".3"/>
  <path d="M-5,-6.5H5V0Q5,5 0,7.5Q-5,5 -5,0Z" fill="none" stroke="#d2d2d4" stroke-width=".7"/><path d="M-3,-3H3M-3,-.5H3M-2.4,2H2.4" stroke="#d2d2d4" stroke-width=".55"/>`;
/* fundo da base: laminado preto e a etiqueta de papel da Grundig (os pés de feltro são peças 3D) */
const baseB = `<rect x="-240" y="-240" width="480" height="480" fill="#121111"/><rect x="-60" y="-30" width="120" height="60" fill="${CD.creme}"/>
  <rect x="-57" y="-27" width="114" height="54" fill="none" stroke="${CD.grav}" stroke-width=".6"/>${tx(0, -14, 'GRUNDIG', 11, 700, CD.grav, 'letter-spacing="2"')}
  ${tx(0, 0, 'Plattenspieler-Zarge mit Haube', 5.6, 500, CD.grav)}${tx(0, 9, 'für Dual 1019 · 220 V', 5.2, 500, CD.grav)}${tx(0, 18, 'Made in Germany', 4.6, 500, CD.grav)}`;
/* fundo do motor: tampa com a etiqueta */
const motorB = `<circle r="30" fill="#151414"/>${aneis(8, 28, 4, '#232121', .8)}<rect x="-14" y="-6" width="28" height="12" fill="${CD.alu}"/>${tx(0, -2, 'Dual', 4, 700, CD.grav)}${tx(0, 3, '220 V 50 Hz', 2.6, 500, CD.grav)}`;

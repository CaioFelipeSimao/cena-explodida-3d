/* Faces do relógio desenhadas em SVG (cada uma vira uma textura). Coordenadas centradas na peça, y para baixo, diâmetro = lado do quadrado. As costas também são projeto. */
const C = { ferro: '#1d2024', esmalte: '#efece3', esmalteE: '#d5d1c4', laton: '#b88a3c', latao2: '#8a6428', aco: '#aab0b8', sinal: '#c4291f' };
const FONTE = `font-family="BarlowSC, Arial Narrow, Arial, sans-serif"`;
const parafuso = (x, y, r, rot) => `<g transform="translate(${x} ${y}) rotate(${rot})"><circle r="${r}" fill="${C.aco}" stroke="#0b0d10" stroke-width="1"/><rect x="${-r * .75}" y="-1.1" width="${r * 1.5}" height="2.2" fill="#0b0d10"/></g>`;
const par4 = (raio, r, rot0 = 0) => [45, 135, 225, 315].map(a => { const [x, y] = pol(raio, a); return parafuso(x, y, r, a + rot0); }).join('');
const boss = (raio, cor) => [45, 135, 225, 315].map(a => { const [x, y] = pol(raio, a); return `<circle cx="${x}" cy="${y}" r="10" fill="${cor}" stroke="#0b0d10" stroke-width="1.5"/>` + parafuso(x, y, 5, a); }).join('');

function mostradorF() {
  let s = `<circle r="148" fill="${C.esmalte}"/><circle r="146" fill="none" stroke="${C.esmalteE}" stroke-width="2"/>`;
  for (let i = 0; i < 60; i++) {
    const g = i % 5 === 0, a = i * 6 - 90, [x1, y1] = pol(g ? 120 : 130, a), [x2, y2] = pol(140, a);
    s += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${C.ferro}" stroke-width="${g ? 4.2 : 1.6}"/>`;
  }
  for (let n = 1; n <= 12; n++) { const [x, y] = pol(92, n * 30 - 90); s += `<text x="${x}" y="${y}" dy=".35em" text-anchor="middle" font-size="32" font-weight="600" ${FONTE} fill="${C.ferro}">${n}</text>`; }
  return s + `<text y="-46" text-anchor="middle" font-size="13" font-weight="600" letter-spacing="5" ${FONTE} fill="${C.ferro}">REGULADOR</text>` +
    `<text y="-31" text-anchor="middle" font-size="9" font-weight="500" letter-spacing="3" ${FONTE} fill="${C.ferro}">Nº 214</text>` +
    `<text y="62" text-anchor="middle" font-size="9" font-weight="500" letter-spacing="3" ${FONTE} fill="${C.ferro}">CORDA 8 DIAS</text>`;
}
let mostradorB = `<circle r="148" fill="#c9bfa8"/><circle r="140" fill="none" stroke="#a99f86" stroke-width="1.5"/>`;
mostradorB += [-112, 112].map(y => `<circle cy="${y}" r="8" fill="none" stroke="#a99f86" stroke-width="1.5"/>`).join('');
mostradorB += `<rect x="-46" y="-19" width="92" height="38" fill="none" stroke="#3a3f38" stroke-width="1.5"/>`;
mostradorB += `<text y="-3" text-anchor="middle" font-size="9" font-weight="600" textLength="76" lengthAdjust="spacing" ${FONTE} fill="#3a3f38">PORCELANA ESMALTADA</text>`;
mostradorB += `<text y="11" text-anchor="middle" font-size="9" font-weight="500" textLength="58" lengthAdjust="spacing" ${FONTE} fill="#3a3f38">LOTE 214-09</text>`;
let tampaF = `<circle r="152.5" fill="#33383e"/><path d="${circ(0, 0, 147)}${circ(0, 0, 138)}" fill-rule="evenodd" fill="#15171a"/>`;
tampaF += boss(124, '#4a5058') + `<rect x="-14" y="-14" width="28" height="28" fill="#4a5058" stroke="#15171a" stroke-width="1.5" transform="rotate(45)"/><circle r="7" fill="#15171a"/>`;
let tampaB = `<defs><linearGradient id="gv" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#a4a9af"/><stop offset="1" stop-color="#70767d"/></linearGradient></defs>`;
tampaB += `<circle r="152.5" fill="url(#gv)"/><circle r="146" fill="none" stroke="#5d636a" stroke-width="1.5"/>`;
tampaB += `<circle cy="-106" r="11" fill="#15171a"/><rect x="-5" y="-106" width="10" height="26" fill="#15171a"/>`;
tampaB += `<rect x="-11" y="-11" width="22" height="22" fill="#5d636a" stroke="#15171a" stroke-width="1.5" transform="rotate(45)"/>`;
tampaB += `<text y="30" text-anchor="middle" font-size="10" font-weight="600" textLength="34" lengthAdjust="spacing" ${FONTE} fill="#2a2e33">CORDA</text>`;
tampaB += `<rect x="-76" y="54" width="152" height="50" rx="4" fill="#c7cbd0" stroke="#5d636a" stroke-width="1.5"/>`;
tampaB += `<text x="0" y="75" text-anchor="middle" font-size="12" font-weight="600" textLength="124" lengthAdjust="spacing" ${FONTE} fill="#2a2e33">REGULADOR Nº 214</text>`;
tampaB += `<text x="0" y="92" text-anchor="middle" font-size="9" font-weight="500" textLength="92" lengthAdjust="spacing" ${FONTE} fill="#2a2e33">CORDA 8 DIAS</text>` + par4(126, 6);
const perlage = id => `<defs><pattern id="${id}" width="11" height="11" patternUnits="userSpaceOnUse"><circle cx="5.5" cy="5.5" r="5" fill="none" stroke="#000" stroke-opacity=".24"/></pattern></defs>`;
let platinaF = perlage('pe') + `<circle r="150" fill="${C.laton}"/><circle r="150" fill="url(#pe)"/><circle r="134" fill="none" stroke="#000" stroke-opacity=".3" stroke-width="1.5"/>`;
platinaF += par4(124, 7, 20) + `<circle r="15" fill="${C.latao2}" stroke="#0b0d10" stroke-width="1.5"/><circle r="5" fill="#0b0d10"/>`;
const ponte = d => `<path d="${d}" fill="none" stroke="#0b0d10" stroke-width="34" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${C.laton}" stroke-width="30" stroke-linecap="round"/>`;
let platinaB = perlage('pe2') + `<circle r="150" fill="${C.latao2}"/><circle r="150" fill="url(#pe2)"/>`;
platinaB += ponte('M-96,-58A112,112 0 0 1 96,-58') + ponte('M-96,70A112,112 0 0 0 96,70');
platinaB += `<circle r="46" fill="${C.laton}" stroke="#0b0d10" stroke-width="2"/><circle r="36" fill="none" stroke="#0b0d10" stroke-opacity=".4" stroke-width="1.5"/><rect x="-9" y="-9" width="18" height="18" fill="#0b0d10" transform="rotate(45)"/>`;
platinaB += boss(124, C.laton) + [[-84, -60], [84, -60], [-84, 72], [84, 72]].map(([x, y]) => parafuso(x, y, 6, x + y)).join('');
platinaB += `<defs><path id="arcoMov" d="M-101.5,66.3A115,115 0 0 0 101.5,66.3"/></defs>` + `<text font-size="8.5" font-weight="500" letter-spacing="2.4" ${FONTE} fill="#0b0d10"><textPath href="#arcoMov" startOffset="50%" text-anchor="middle">MOVIMENTO Nº 214</textPath></text>`;
let vidroF = `<defs><radialGradient id="vg"><stop offset=".55" stop-color="#b9dcd5" stop-opacity=".02"/><stop offset="1" stop-color="#7fb5ab" stop-opacity=".42"/></radialGradient></defs><circle r="147.5" fill="url(#vg)"/><circle r="146.5" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="2"/>`;
vidroF += `<path d="M-118,-48A127,127 0 0 1 -48,-118A145,145 0 0 0 -118,-48Z" fill="#fff" fill-opacity=".38"/>`;
vidroF += `<path d="M-132,-12A134,134 0 0 1 -122,-36" stroke="#fff" stroke-opacity=".32" stroke-width="3" fill="none" stroke-linecap="round"/>`;
const pinoF = `<circle r="10" fill="${C.laton}"/><circle r="9.5" fill="none" stroke="#0b0d10" stroke-width="1"/><circle r="6" fill="none" stroke="${C.latao2}" stroke-width="1.5"/><circle r="2.5" fill="#0b0d10"/>`;

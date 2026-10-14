/* Faces da Nikon F em SVG (cada uma vira textura). Gravações como as da peça: preto no cromo, branco no anodizado; o vermelho só no índice do ASA.
   Coordenadas centradas na peça, y para baixo, em mm (o lado do quadrado = medida da peça). As faixas em volta dos anéis usam svgTexR (largura = perímetro). */
const C = { cromo: '#d6d8d9', cromoE: '#9da1a4', gravado: '#17181a', couro: '#1c1c1d', anod: '#101112', branco: '#ecebe6', sinal: '#c8322a', vidro: '#0d1418' };
const FONTE = `font-family="Jost, Futura, Arial, sans-serif"`;
const txt = (x, y, s, tam, peso, cor, extra = '') => `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="central" font-size="${tam}" font-weight="${peso}" ${FONTE} fill="${cor}" ${extra}>${s}</text>`;
const parafusoF = (x, y, r, rot) => `<g transform="translate(${x} ${y}) rotate(${rot})"><circle r="${r}" fill="#b9bcbe" stroke="#55595c" stroke-width=".25"/><rect x="${-r * .8}" y="-.22" width="${r * 1.6}" height=".44" fill="#3b3e41"/></g>`;
/* o "F" serifado do visor, gravado em contorno (como na peça) */
const letraF = (x, y, s) => `<path transform="translate(${x} ${y}) scale(${s})" fill="none" stroke="${C.gravado}" stroke-width=".55" stroke-linejoin="round"
  d="M0,0H10V4H9.1Q8.7,1.3 6,1.3H4.3V6.3H6.4Q7.6,6.3 7.8,4.9H8.7V9.1H7.8Q7.6,7.6 6.4,7.6H4.3V12.5Q4.3,13.1 5.9,13.3V14H0V13.3Q1.6,13.1 1.6,12.5V1.5Q1.6,.9 0,.7Z"/>`;
const escova = (w, h, n, op) => Array.from({ length: n }, (_, i) => `<line x1="${-w / 2}" x2="${w / 2}" y1="${-h / 2 + (i + .5) * h / n}" y2="${-h / 2 + (i + .5) * h / n}" stroke="#fff" stroke-opacity="${op * .3 * (i % 3 ? .5 : 1)}" stroke-width=".18"/>`).join('');
/* números em volta de um disco: lista, raio, ângulo inicial e passo (graus, 0 = em cima, horário) */
const anelNumeros = (lista, r, a0, passo, tam, cor, peso = 500) => lista.map((s, i) => { const [x, y] = pol(r, a0 + i * passo - 90); return txt(x, y, s, tam, peso, cor, `transform="rotate(${a0 + i * passo} ${x} ${y})"`); }).join('');

/* Photomic, placa da frente (55 x 28): F, Nikon e a pequena escala do fotômetro */
const photomicF = `<rect x="-27.5" y="-27.5" width="55" height="55" fill="${C.cromo}"/>${escova(55, 28, 40, .25)}
  <rect x="-27.2" y="-13.7" width="54.4" height="27.4" fill="none" stroke="${C.cromoE}" stroke-width=".3"/>
  ${letraF(-22.5, -11.5, .62)}${txt(2, -1.5, 'Nikon', 9.2, 600, C.gravado, 'letter-spacing=".25"')}
  <g stroke="${C.gravado}" stroke-width=".3">${[-6, -2, 2, 6].map(x => `<line x1="${x}" x2="${x}" y1="7.5" y2="9.5"/>`).join('')}<line x1="-7" x2="7" y1="9.5" y2="9.5"/></g>
  ${txt(-6, 11.4, '54', 1.6, 500, C.gravado)}${txt(-2, 11.4, '28', 1.6, 500, C.gravado)}${txt(2, 11.4, '11', 1.6, 500, C.gravado)}${txt(6, 11.4, '5.6', 1.6, 500, C.gravado)}
`;
/* janela do fotômetro em cima do Photomic: vidro escuro, escala e o ponteiro */
const janelaF = `<rect x="-8" y="-8" width="16" height="16" fill="${C.cromo}"/><rect x="-7" y="-4" width="14" height="8" rx="1" fill="${C.vidro}"/>
  <path d="M-5,2.2A7,7 0 0 1 5,2.2" fill="none" stroke="${C.branco}" stroke-width=".3"/>${txt(-5.4, -1.6, '−', 2, 600, C.branco)}${txt(5.4, -1.6, '+', 2, 600, C.branco)}
  <line x1="0" y1="3.6" x2="1.6" y2="-2.6" stroke="${C.sinal}" stroke-width=".35"/><rect x="-7.6" y="-4.6" width="15.2" height="9.2" rx="1.4" fill="none" stroke="${C.cromoE}" stroke-width=".5"/>`;
/* faixa do seletor acoplado (5): escala de velocidades em volta do cilindro do Photomic */
const faixaVelocidades = perim => { const v = ['1000', '500', '250', '125', '60', '30', '15', '8', '4', '2', '1', 'B']; let s = `<rect width="${perim}" height="5" fill="${C.anod}"/>`;
  v.forEach((n, i) => { s += txt((i + .5) * perim / v.length, 2.5, n, 2.1, 500, n === '125' || n === '60' ? '#e8b25a' : C.branco); }); return s; };
/* ASA (2), topo do cilindro do Photomic: escala 10–1600 e o índice vermelho */
const asaF = `<circle r="11" fill="${C.cromo}"/><circle r="9.4" fill="none" stroke="${C.cromoE}" stroke-width=".3"/>
  ${anelNumeros(['10', '25', '50', '100', '200', '400', '800', '1600'], 7.6, -140, 40, 1.6, C.gravado)}${txt(0, -1.2, 'ASA', 1.8, 600, C.gravado)}
  <path d="M0,-10.6L.8,-9.2H-.8Z" fill="${C.sinal}"/><circle r="2.4" fill="${C.cromoE}"/><circle r="1.1" fill="#4a4d50"/>`;
/* seletor de velocidades do corpo (11), topo */
const velocidadesF = `<circle r="10" fill="${C.cromo}"/>${anelNumeros(['B', '1', '2', '4', '8', '15', '30', '60', '125', '250', '500', '1000'], 7.4, -150, 25, 1.35, C.gravado)}
  <circle r="4.4" fill="${C.cromoE}"/><circle r="3.6" fill="none" stroke="#5b5f62" stroke-width=".3"/><circle r="1.2" fill="#3b3e41"/>`;
/* contador (13) com o anel da alavanca de avanço */
const contadorF = `<circle r="9" fill="${C.cromo}"/><circle r="6.6" fill="${C.anod}"/>${anelNumeros(['S', '•', '4', '•', '8', '•', '12', '•', '16', '•', '20', '•', '24', '•', '28', '•', '32', '36'], 5.2, 0, 20, 1.15, C.branco)}
  <circle r="3.2" fill="${C.cromoE}"/><path d="M0,-8.9L.7,-7.5H-.7Z" fill="${C.gravado}"/>`;
/* botão de rebobinar (37), topo com a seta e o R */
const rebobinarF = `<circle r="9" fill="${C.cromo}"/><circle r="7.6" fill="none" stroke="${C.cromoE}" stroke-width=".35"/>${txt(0, -4.4, 'R', 2.4, 600, C.gravado)}
  <path d="M-3.6,1.6A3.8,3.8 0 1 0 0,-2.2" fill="none" stroke="${C.gravado}" stroke-width=".45"/><path d="M0,-3.1L1.1,-2.2L0,-1.3Z" fill="${C.gravado}"/>`;
/* tampa esquerda (41), topo: número de série e o símbolo do plano do filme */
const capaEF = `<rect x="-17" y="-17" width="34" height="34" fill="${C.cromo}"/>${escova(34, 34, 30, .2)}
  ${txt(-7.5, -11.6, '6512487', 2.2, 500, C.gravado, 'letter-spacing=".15"')}<circle cx="-12.6" cy="11" r="1.2" fill="none" stroke="${C.gravado}" stroke-width=".3"/><line x1="-14.6" x2="-10.6" y1="11" y2="11" stroke="${C.gravado}" stroke-width=".3"/>`;
const capaDF = `<rect x="-30" y="-30" width="60" height="60" fill="${C.cromo}"/>${escova(60, 60, 50, .2)}`;
/* frente da caixa do espelho (50): cromo com 4 parafusos */
const caixaF = `<rect x="-28" y="-28" width="56" height="56" fill="${C.cromo}"/>${escova(56, 56, 46, .18)}`;   // os parafusos são peças 3D (pecas.js)
/* fundo (36): MADE IN JAPAN, OPEN/LOCK em volta da chave, marcas da rosca de tripé, lembrete de ASA */
const fundoF = `<g transform="rotate(180)"><rect x="-75" y="-75" width="150" height="150" fill="${C.cromo}"/>${escova(150, 150, 120, .15)}
  ${txt(0, 10, 'MADE IN JAPAN', 2.3, 500, C.gravado, 'letter-spacing=".5"')}<circle r="8.2" fill="none" stroke="${C.cromoE}" stroke-width=".35"/>
  <path d="M43.5,-9A10,10 0 0 1 56.5,-9" fill="none" stroke="${C.gravado}" stroke-width=".3"/>${txt(41.5, -9.6, 'OPEN', 1.9, 600, C.gravado)}${txt(58.6, -9.6, 'LOCK', 1.9, 600, C.gravado)}
  ${[-13.5, 13.5].map(x => `<circle cx="${x * 3.3}" cy="13.8" r=".55" fill="#b9bcbe" stroke="#55595c" stroke-width=".2"/>`).join('')}</g>`;
const chaveF = `<circle r="7" fill="${C.cromo}"/><circle r="6.2" fill="none" stroke="${C.cromoE}" stroke-width=".3"/><path d="M0,-6V-3.4" stroke="${C.gravado}" stroke-width=".5"/>`;
const asaFundoF = `<circle r="6" fill="${C.anod}"/>${anelNumeros(['25', '50', '100', '200', '400', '800'], 4.3, -75, 30, 1, C.branco)}<circle r="2" fill="${C.cromoE}"/>`;
/* lente: aberturas (anel de abertura), distâncias (anel de foco) e a gravação da face da frente */
const faixaAbertura = perim => { const v = ['16', '11', '8', '5.6', '4', '2.8', '2', '1.4']; let s = `<rect width="${perim}" height="6" fill="${C.anod}"/>`;
  v.forEach((n, i) => { s += txt(perim * (.32 + i * .05), 3, n, 2.2, 500, n === '1.4' ? '#e8b25a' : C.branco); }); return s; };
const faixaDistancia = perim => { const v = ['∞', '10', '5', '3', '2', '1.5', '1.2', '1', '.8', '.7', '.6', '.5', '.45']; let s = `<rect width="${perim}" height="4.5" fill="${C.anod}"/>`;
  v.forEach((n, i) => { s += txt(perim * (.3 + i * .033), 2.1, n, 1.9, 500, C.branco); }); return s + txt(perim * .735, 2.1, 'm', 1.9, 500, C.branco); };
const faixaFrente = perim => `<rect width="${perim}" height="5" fill="${C.anod}"/>` +
  txt(perim * .5, 2.5, 'NIKKOR-S Auto 1:1.4  f=5cm    Nippon Kogaku Japan    No. 412873', 2.3, 500, C.branco, `textLength="${perim * .82}" lengthAdjust="spacing"`);
/* ocular do Photomic, vista de trás: moldura quadrada com degraus */
const ocularB = `<rect x="-10" y="-10" width="20" height="20" fill="${C.anod}"/>${[8.4, 7, 5.6].map((h, i) => `<rect x="${-h}" y="${-h * .9}" width="${2 * h}" height="${1.8 * h}" rx="1.2" fill="none" stroke="${['#2a2c2e', '#202224', '#2a2c2e'][i]}" stroke-width=".5"/>`).join('')}<rect x="-5" y="-4.4" width="10" height="8.8" rx="1" fill="${C.vidro}"/>`;

/* ---- mecanismo ---- */
/* vidro de foco (51), visto de cima: despolido com anéis de Fresnel, o círculo de microprismas no centro e a marca do formato 24 x 36 */
const despolidoF = `<rect x="-20" y="-20" width="40" height="40" fill="#dfe3e2"/>${Array.from({ length: 14 }, (_, i) => `<circle r="${3 + i * 1.25}" fill="none" stroke="#b9c0c0" stroke-width=".18"/>`).join('')}
  <circle r="2.6" fill="#c3cacb"/><circle r="2.6" fill="none" stroke="#8f989a" stroke-width=".25"/><rect x="-17.8" y="-11.8" width="35.6" height="23.6" fill="none" stroke="#9aa3a5" stroke-width=".3"/>`;
/* roda do contador (13): números de 0 a 36 em volta, branco no anodizado */
const contadorRodaF = `<circle r="6.6" fill="${C.anod}"/>${anelNumeros(['S', '•', '4', '•', '8', '•', '12', '•', '16', '•', '20', '•', '24', '•', '28', '•', '32', '36'], 5.2, 0, 20, 1.15, C.branco)}<circle r="3.2" fill="${C.cromoE}"/>`;
/* janela do sincronismo (19): X e FP, com o ponto vermelho */
const sincroF = `<circle r="2.6" fill="${C.anod}"/>${txt(-1, -.4, 'X', 1.4, 600, C.branco)}${txt(1.1, .8, 'FP', 1, 600, '#e8b25a')}<circle cy="-1.9" r=".35" fill="${C.sinal}"/>`;
/* cortina do obturador em folha de titânio: as nervuras quadradas que a Nikon estampava, desenhadas como faixa (largura = comprimento da cortina) */
const titanioF = (w, h) => `<rect width="${w}" height="${h}" fill="#55524c"/>${Array.from({ length: Math.round(w / 2.2) }, (_, i) => `<rect x="${i * 2.2 + .25}" y=".4" width="1.7" height="${h - .8}" fill="#6a665f" stroke="#3e3c38" stroke-width=".12"/>`).join('')}`;
/* visor esportivo (42), frente: a janela grande e o F */
const esportivoF = `<rect x="-30" y="-30" width="60" height="60" fill="${C.cromo}"/><rect x="-21" y="-16" width="42" height="27" rx="2" fill="${C.vidro}"/>${letraF(-4, -27, .65)}`;

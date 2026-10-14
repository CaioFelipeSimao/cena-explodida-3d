/* Relógio em árvore: as mesmas 13 peças do relogio, agrupadas em sub-conjuntos. Coordenadas RELATIVAS ao pai
   (os grupos frontal e mecanismo montados ficam em 0, então o m de cada peça é o mesmo do relógio plano). */
const ARVORE = {
  relogio: ['tampa', 'caixa', 'mecanismo', 'frontal'],
  mecanismo: ['platina', 'gC', 'gA', 'gB'],
  frontal: ['mostrador', 'horas', 'minutos', 'segundos', 'pino', 'bisel', 'vidro'],
};

/* e = pose quando o pai está aberto; fora = para onde vai quando a câmera foca o mecanismo (modo 'quadro') */
const partes = {
  tampa:     { m: { z: -19 }, e: { z: -330 },          d: { y: 24 },           ordem: 0, fora: { x: 1100 } },
  caixa:     { m: {},         e: { z: -225 },          d: { y: -24 },          ordem: 1, fora: { y: 1000 } },
  mecanismo: { m: {},         e: { z: -120 },          d: { x: -240, y: 20 },  ordem: 2 },   // sai inteiro, como um bloco, e deriva para o lado para o mostrador não escondê-lo
  frontal:   { m: {},         ordem: 3, fora: { y: -1100 } },                                // o grupo fica; as filhas se espalham

  platina:   { m: { z: -12 },                        e: { z: -40 }, d: { y: 24 },           ordem: 0 },
  gC:        { m: { z: -6 },                         e: { z: 40 },  d: { y: 215 },          ordem: 1, r: 720 },
  gA:        { m: { x: posA[0], y: posA[1], z: -6 }, e: { z: 30 },  d: { x: -190, y: 40 },  ordem: 1, r: -1080 },
  gB:        { m: { x: posB[0], y: posB[1], z: -6 }, e: { z: 55 },  d: { x: 190, y: 30 },   ordem: 1, r: -720 },

  mostrador: { m: { z: 0 },                 e: { z: -10 }, d: { y: 24 },  ordem: 0, r: -360 },
  horas:     { m: { z: 4, rotationZ: -60 }, e: { z: 55 },  d: { y: -24 }, ordem: 1, r: 300 },
  minutos:   { m: { z: 7, rotationZ: 60 },  e: { z: 90 },  d: { y: -24 }, ordem: 2, r: 1140 },
  segundos:  { m: { z: 10, rotationZ: 210 },e: { z: 125 }, d: { y: -24 }, ordem: 3, r: 2370 },
  pino:      { m: { z: 13 },                e: { z: 160 }, d: { y: -24 }, ordem: 4 },
  bisel:     { m: { z: 17.2 },              e: { z: 235 }, d: { y: 24 },  ordem: 5 },
  vidro:     { m: { z: 18 },                e: { z: 320 }, d: { y: -24 }, ordem: 6 },
};

/* A história: abre tudo, foca o mecanismo, abre ele, gira, fecha, volta, fecha tudo. Passos sem ação (gira) só mexem a câmera. */
const ATOS = [
  { id: 'abre',      abrir: ['relogio', 'frontal'], camera: { rotationY: -42, rotationX: 14 }, zoom: 1, estilo: { linhas: 1, anot: 1 } },
  { id: 'foca',      focar: 'mecanismo',            camera: { rotationY: -16, rotationX: 12 }, zoom: 1.7, estilo: { linhas: 0, anot: 0 } },
  { id: 'abre-mec',  abrir: ['mecanismo'],          camera: { rotationY: 14, rotationX: 22 }, duracao: 2.6 },
  { id: 'gira',                                     camera: { rotationY: 14 + 360 }, duracao: 3.5 },
  { id: 'fecha-mec', fechar: ['mecanismo'],         camera: { rotationY: 360 - 4, rotationX: 14 } },
  { id: 'volta',     voltar: true,                  camera: { rotationY: 360 - 30, rotationX: 16 }, zoom: 1 },
  { id: 'fecha',     fechar: ['relogio', 'frontal'], camera: { rotationY: 24 + 360, rotationX: 10 }, zoom: 1.3 },
];

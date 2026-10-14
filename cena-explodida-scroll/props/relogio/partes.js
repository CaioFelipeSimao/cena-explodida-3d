/* Tabela de peças. Hora marcada 10:10:35: horas -60°, minutos 60°, segundos 210°. O bisel fica 0,2 acima para não coincidir com a borda da caixa (z-fighting). */
const partes = {
  tampa:     { m: { z: -19 },                        e: { z: -330 }, d: { y: 24 },            ordem: 0 },
  caixa:     { m: { z: 0 },                          e: { z: -225 }, d: { y: -24 },           ordem: 1 },
  platina:   { m: { z: -12 },                        e: { z: -140 }, d: { y: 24 },            ordem: 2 },
  gC:        { m: { z: -6 },                         e: { z: -85 },  d: { y: 215 },           ordem: 3, r: 720 },
  gA:        { m: { x: posA[0], y: posA[1], z: -6 }, e: { z: -70 },  d: { x: -190, y: 40 },   ordem: 3, r: -1080 },
  gB:        { m: { x: posB[0], y: posB[1], z: -6 }, e: { z: -100 }, d: { x: 190, y: 30 },    ordem: 3, r: -720 },
  mostrador: { m: { z: 0 },                          e: { z: -10 },  d: { y: 24 },            ordem: 4, r: -360 },
  horas:     { m: { z: 4, rotationZ: -60 },          e: { z: 55 },   d: { y: -24 },           ordem: 5, r: 300 },
  minutos:   { m: { z: 7, rotationZ: 60 },           e: { z: 90 },   d: { y: -24 },           ordem: 6, r: 1140 },
  segundos:  { m: { z: 10, rotationZ: 210 },         e: { z: 125 },  d: { y: -24 },           ordem: 7, r: 2370 },
  pino:      { m: { z: 13 },                         e: { z: 160 },  d: { y: -24 },           ordem: 8 },
  bisel:     { m: { z: 17.2 },                       e: { z: 235 },  d: { y: 24 },            ordem: 9 },
  vidro:     { m: { z: 18 },                         e: { z: 320 },  d: { y: -24 },           ordem: 10 },
};

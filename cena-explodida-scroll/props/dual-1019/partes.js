/* Dual 1019 em árvore (ficha.md, seção 4). O m de cada nó vem dos pivôs (pecas.js, pivos()); aqui e e d são DESLOCAMENTOS
   em unidades (1 mm = 0,8), y para baixo: e a partir de m, d a partir de e. ordem: a maior sai primeiro e volta por último.
   voltas: gira a rolagem inteira em volta do eixo (o prato ligado, a 33 1/3 de mentira); eixo: 'rotationY' = o eixo vertical. */
const ARVORE = {
  dual1019:  ['tampa', 'vinil', 'pratoConj', 'braco', 'comandos', 'platina', 'mecanismo', 'gabinete'],
  tampa:     ['acrilico', 'emblemaTopo', 'dobradicaE', 'dobradicaD'],
  pratoConj: ['eixo', 'tapete', 'prato', 'roda'],                                          // 19, 5, 6 e a roda intermediária
  braco:     ['tubo', 'cabecote', 'capsula', 'contrapeso', 'cardan', 'baseAntiskating'], // 37, 38-44, 51-52, 58-62, 63-68
  comandos:  ['painel', 'alavancaStart', 'seletorTamanho', 'seletorVelocidade', 'descanso'],   // 81, 82, 75-77, 7-14, 45-47
  platina:   ['chapa', 'parafusoFrente', 'parafusoTras', 'suspensaoE', 'suspensaoD', 'suspensaoF'],   // 15, 16 e 84, 26-36
  mecanismo: ['motor', 'engrenagem', 'alavancas', 'interruptor', 'amortecedor'],
  gabinete:  ['moldura', 'base', 'emblemaGrundig'],
};
/* direção do tubo do braço (para a frente ao longo dele) e a lateral, para abrir o braço no eixo dele */
const BF = [Math.sin(PHI), Math.cos(PHI)], ao = (k, y = 0) => ({ x: BF[0] * k, z: BF[1] * k, y });

const partes = {
  /* Apoio físico na folha chapa (o grupo platina também contém parafusos acima do tampo). */
  painel:            { apoio: { em: 'chapa', face: 'cima' }, ordem: 0 },
  seletorVelocidade: { apoio: { em: 'chapa', face: 'cima' }, ordem: 0 },
  /* abertura geral: a tampa sobe e tomba para trás, o disco sai primeiro, o prato sobe pelo eixo, o braço sai para cima e para a direita,
     os comandos e a platina sobem, o mecanismo aparece entre a platina e o gabinete, que desce */
  tampa:     { e: { y: -330, z: -150, rotationX: 24 }, d: { y: -10 }, ordem: 7, fora: { y: -900 } },
  vinil:     { e: { y: -220, x: -60, z: 40 },  d: { y: -10 }, ordem: 6, fora: { x: -900 }, voltas: -6, eixo: 'rotationY' },
  pratoConj: { e: { y: -100, x: -40 },         d: { y: -8 },  ordem: 5, fora: { x: -900 }, foco: { y: -40 } },
  braco:     { e: { y: -60, x: 240, z: 30 },  d: { y: -8 },  ordem: 4, fora: { x: 900 }, foco: { x: -11, y: -10, z: 55 } },
  comandos:  { e: { y: -35 },                   d: { y: -6 },  ordem: 3, fora: { y: 1300, x: -400 } },
  platina:   { e: { y: 80 },                    d: { y: -6 },  ordem: 2, fora: { y: 900 } },
  mecanismo: { e: { y: 205 },                   d: { y: 6 },   ordem: 1, fora: { y: 900 } },
  gabinete:  { e: { y: 385 },                   d: { y: 8 },   ordem: 0, fora: { y: 900 } },

  /* prato aberto, de perfil: o eixo sobe, o tapete sobe menos, a roda desce por baixo da borda */
  eixo:   { e: { y: -120 }, d: { y: -6 }, ordem: 3, voltas: -6, eixo: 'rotationY' },
  tapete: { e: { y: -60 },  d: { y: -4 }, ordem: 2, voltas: -6, eixo: 'rotationY' },
  prato:  {                               ordem: 1, voltas: -6, eixo: 'rotationY' },
  roda:   { e: { y: 70, x: 150, z: 30 },  d: { y: 4 }, ordem: 0, voltas: -40, eixo: 'rotationY' },   // gira mais depressa (raio menor), no mesmo sentido do prato

  /* braço aberto, no eixo dele: o contrapeso para trás, cabeçote e cápsula para a frente (a cápsula desce), o cardan sobe, a base desce */
  contrapeso:      { e: ao(-80),        d: ao(-6),     ordem: 0 },
  cabecote:        { e: ao(70, -16),    d: ao(5),      ordem: 0 },
  capsula:         { e: ao(70, 40),     d: { y: 4 },   ordem: 1 },
  cardan:          { e: { y: -75 },     d: { y: -4 },  ordem: 1 },
  tubo:            { e: { y: -24 },     d: { y: -3 },  ordem: 2 },
  baseAntiskating: { e: { y: 46 },      d: { y: 4 },   ordem: 3 },
};

/* a história (ficha.md, seção 5): abre tudo (em desenho técnico, com o plugin); foco no braço e ele se abre; volta; foco no prato,
   que se abre de perfil e a câmera passa por baixo (as nervuras); volta; fecha tudo. O prato gira o tempo todo (voltas). */
const ATOS = [
  { id: 'abre',        abrir: ['dual1019'],  camera: { rotationY: -34, rotationX: -16 }, zoom: .55, estilo: { linhas: 1, anot: 1 } },
  { id: 'foca-braco',  focar: 'braco', abrir: ['braco'], camera: { rotationY: -66, rotationX: -24 }, zoom: 1.5, estilo: { linhas: 0, anot: 0 } },
  { id: 'fecha-braco', fechar: ['braco'], voltar: true, camera: { rotationY: -30, rotationX: -16 }, zoom: .6 },
  { id: 'foca-prato',  focar: 'pratoConj', abrir: ['pratoConj'], camera: { rotationY: 20, rotationX: -6 }, zoom: 1.2 },
  { id: 'gira-prato',  camera: { rotationY: 200, rotationX: 14 }, duracao: 3.5 },
  { id: 'fecha-prato', fechar: ['pratoConj'], voltar: true, camera: { rotationY: 320, rotationX: -16 }, zoom: .6 },
  { id: 'fecha',       fechar: ['dual1019'], camera: { rotationY: 360 + 28, rotationX: -26 }, zoom: 1.35 },
];

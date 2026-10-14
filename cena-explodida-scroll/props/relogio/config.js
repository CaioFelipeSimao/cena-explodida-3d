/* Config do prop: luz, ambiente, ajuste à tela, poses de câmera e tempos da timeline. Lido pelo motor. */
const CFG = {
  exposicao: 0.78,                    // tone mapping: metal estoura fácil; baixe antes de mexer nos materiais
  sol: 1.05, hemi: 0.22,              // luz direcional (de cima à esquerda) e luz de céu
  ceu: ['#e9edf1', '#9ba1a8', '#6c7279', '#3a3e44'],                        // degradê do ambiente refletido pelos metais (topo, horizonte alto, horizonte baixo, chão)
  janelas: [[-30, 25, 28, 34, 22, 3.2], [32, 14, 20, 18, 28, 2], [0, 42, -10, 40, 16, 2]],   // x, y, z, largura, altura, força
  fit: { largura: 720, altura: 780, max: 1.2 },                            // tamanho do conjunto explodido, para caber na tela
  grande: 1.3,                        // zoom do objeto montado (encolhe para 1 ao explodir)
  ordem: 'XYZ',                       // ordem dos eixos de rotação do conjunto
};
const POSES = {                       // câmera: o conjunto gira em Y e X; início e fim são independentes (o fim pode ser espelhado)
  ini: { rotationY: -24, rotationX: 10 }, e: { rotationY: -42, rotationX: 14 }, d: { rotationY: 10, rotationX: 22 },
  giro: { rotationY: 10 + 360 }, fim: { rotationY: 24 + 360, rotationX: 10 },
};
const TEMPOS = {                      // em unidades de timeline; o scroll total é 730% da altura da tela
  respiroIni: 0.6, explode: 2.6, camera: 1.6, giro: 4.0, remonta: 2.6, respiroFim: 0.6,
  peca: 2, passo: 0.12, scroll: '+=730%',
};

/* Config do relógio em árvore: mesma luz e ambiente do relogio (de onde herda faces, peças e estilo); poses dos atos ficam em partes.js. */
const CFG = {
  exposicao: 0.78,                    // tone mapping: metal estoura fácil; baixe antes de mexer nos materiais
  sol: 1.05, hemi: 0.22,              // luz direcional (de cima à esquerda) e luz de céu
  ceu: ['#e9edf1', '#9ba1a8', '#6c7279', '#3a3e44'],                        // degradê do ambiente refletido pelos metais (topo, horizonte alto, horizonte baixo, chão)
  janelas: [[-30, 25, 28, 34, 22, 3.2], [32, 14, 20, 18, 28, 2], [0, 42, -10, 40, 16, 2]],   // x, y, z, largura, altura, força
  fit: { largura: 720, altura: 780, max: 1.2 },                            // tamanho do conjunto explodido, para caber na tela
  grande: 1.3,                        // zoom do objeto montado (encolhe para 1 ao explodir)
  ordem: 'XYZ',                       // ordem dos eixos de rotação do conjunto
  saida: 'quadro',                    // no foco, as outras peças saem do quadro ('quadro') ou ficam transparentes ('sumir'); chave no painel
};
const POSES = { ini: { rotationY: -24, rotationX: 10 } };   // câmera antes do primeiro ato; as outras poses ficam em cada ato (ATOS, partes.js)
const TEMPOS = {                      // em unidades de timeline
  respiroIni: 0.6, respiroFim: 0.6,
  peca: 2, passo: 0.12,               // cada peça leva 2 para sair ou voltar; escalonamento de 0,12 por posição de ordem
  foco: 2.4,                          // duração padrão de focar e voltar
  porUnidade: 58,                     // scroll: % da altura da tela por unidade de timeline (mesmo ritmo do relógio plano); cresce com os atos
};

/* Blueprint (só com o plugin cena-blueprint-3d): poucos rótulos e uma cota na primeira explosão. Pontos no sistema de cada peça (px do relógio, a partir do pivô dela). */
CFG.blueprint = {
  tema: 'papel', espessura: 1, limiar: .16,
  rotulos: [
    { no: 'tampa',     ponto: [140, 60, 3],   texto: '1 · Tampa traseira', curto: '1 · Tampa', dir: [.3, -1] },
    { no: 'caixa',     ponto: [100, -110, 0], texto: '2 · Caixa', dir: [1, .6] },
    { no: 'mostrador', ponto: [-60, -90, 1.5], texto: '3 · Mostrador', dir: [-.4, 1] },
    { no: 'vidro',     ponto: [-110, 100, 2],  texto: '4 · Vidro', dir: [-1, -.5] },
  ],
  cotas: [{ no: 'bisel', de: [-162.5, 175, 0], ate: [162.5, 175, 0], texto: 'Ø 325', desvio: -22 }],   // fora da peça, em cima
  carimbo: { titulo: 'Relógio em árvore', linhas: [['peças', '13'], ['hora', '10:10:35'], ['vista', 'explodida']] },
};
/* Interação (só com o plugin cena-explodida-interativa): dois toques abrem com a explosão do ato de abertura; dois toques no mecanismo abrem só ele. */
CFG.interativo = {
  abrir: ['relogio', 'frontal'],
  subconjuntos: ['mecanismo'],
  zoom: 1,
  afastar: { mecanismo: { x: -330, y: 60, z: 160 } },   // ao abrir, o mecanismo sai de trás do mostrador (na vista do fim ele ficaria escondido)
  girarAoAbrir: { mecanismo: 40 },
  espalhar: { mecanismo: 1.5 },
  zoomAoAbrir: { mecanismo: .8 },
};

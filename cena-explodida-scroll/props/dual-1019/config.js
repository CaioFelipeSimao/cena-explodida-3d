/* Config do Dual 1019: luz de estúdio de catálogo (fundo branco frio das fotos), ajuste à tela, poses e tempos.
   Teca e acrílico pedem luz macia e grande; o alumínio escovado do prato e do painel precisa de faixas finas para o brilho correr nas bordas. */
const CFG = {
  exposicao: 0.82,
  sol: 2.3, hemi: 0.2,
  ceu: ['#f6f6f8', '#c9cacd', '#6b6d72', '#202124'],
  janelas: [[-30, 34, 26, 40, 22, 3.2], [8, 48, -4, 70, 30, 2.2], [0, 26, 40, 90, 3, 6.5], [-46, 6, 20, 3, 50, 5], [46, 4, 14, 4, 40, 4],
    [26, -12, 34, 60, 2.5, 3], [-20, 14, -44, 36, 24, 2.6], [4, 8, 48, 60, 36, 1.7]],
  sombras: { raio: 950, mapa: 2048, suave: 6 },
  fit: { largura: 720, altura: 720, max: 1.3 },
  grande: 1.35,                       // zoom da vista montada (encolhe ao abrir)
  ordem: 'XYZ',
  focoSuave: true,
  saida: 'quadro',                    // no foco, as outras peças saem do quadro pelo campo fora (a Nikon usa 'sumir')
};
const POSES = { ini: { rotationY: -28, rotationX: -26 } };
const TEMPOS = { respiroIni: 0.6, respiroFim: 0.6, peca: 2, passo: 0.12, foco: 2.4, porUnidade: 58 };

/* Blueprint (só com o plugin cena-blueprint-3d): o ato de abertura em desenho técnico, tema papel; rótulos em inglês do esquema didático,
   duas cotas e o carimbo. Pontos em mm a partir do pivô da peça (pecas.js). */
CFG.blueprint = {
  tema: 'papel', espessura: 1, limiar: .16, anguloQuina: 30,
  espessuraCelular: .75, ssCelular: 1.5, // traço menor; densidadeMax automático: 2.25 no celular, 3 no desktop
  pesoSilhueta: 1.35, pesoQuina: .8, // multiplicadores da espessura em pixels CSS
  vidro: ['acrilico'],             // vidro técnico; materiais transparentes também entram automaticamente
  // Serrilhas e cilindros pequenos: só contornos; a polia pertence ao motor.
  soContorno: ['contrapeso', 'baseAntiskating', 'seletorVelocidade', 'parafusoFrente', 'parafusoTras', 'engrenagem', 'motor', 'tubo'],
  rotulos: [
    { no: 'acrilico',  ponto: [-224, 40, 60],  texto: 'Dust cover', dir: [-1, -.2] },
    { no: 'vinil',     ponto: [-80, 0, 20],    texto: 'Record', dir: [-1, -.1] },
    { no: 'prato',     ponto: [-135, 0, 30],   texto: 'Platter', dir: [-1, .1] },
    { no: 'tubo',      ponto: [10, 0, 60],     texto: 'Tonearm', dir: [1, -.3] },
    { no: 'contrapeso', ponto: [0, 15, 0],     texto: 'Counterweight', dir: [1, -.6] },
    { no: 'seletorVelocidade', ponto: [-20, 4, 6], texto: 'Speed selector', curto: 'Speed', dir: [-1, .3] },
    { no: 'motor',     ponto: [-30, -10, 10],  texto: 'Motor', dir: [1, .2] },
  ],
  cotas: [
    { no: 'prato', de: [-135.6, 13, 0], ate: [135.6, 13, 0], texto: 'Ø 270 mm', desvio: -30 },
    { no: 'moldura', de: [-240, -37, 195], ate: [240, -37, 195], texto: '480 mm', desvio: 20 },
  ],
  carimbo: { titulo: 'Dual 1019 · Grundig', linhas: [['maker', 'Dual · St. Georgen'], ['year', '1967'], ['parts', '34'], ['view', 'exploded'], ['scale', '1 : 5']] },
};
/* Interação (só com o plugin cena-explodida-interativa): no fim da rolagem, dois toques abrem com a explosão do ato 1; o braço e o prato
   abrem e fecham sozinhos com dois toques numa peça deles. */
CFG.interativo = {
  abrir: ['dual1019'],
  subconjuntos: ['braco', 'pratoConj'],
  zoom: .55,
  espalhar: { pratoConj: 1.8 },                  // aberto à mão, de cima: os discos precisam de mais vão para não se cobrirem
  afastar: { pratoConj: { x: -230, z: -110 } },  // e sai de baixo do disco para o lado livre da vista do fim (esquerda)
  zoomAoAbrir: { pratoConj: .45 },
};

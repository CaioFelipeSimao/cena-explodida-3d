/* Config da Nikon F: luz, ambiente, ajuste à tela, poses e tempos. Cromo pede um céu com contraste (claro em cima, escuro embaixo) para parecer metal. */
const CFG = {
  exposicao: 0.72,
  sol: 1.9, hemi: 0.22,               // sol forte o bastante para as sombras aparecerem sobre a luz do ambiente
  /* estúdio de produto: céu claro em cima e horizonte escuro (o cromo precisa de contraste para parecer metal), caixas de luz e faixas finas que desenham os brilhos nas arestas */
  ceu: ['#efeeeb', '#c2c5c8', '#74787d', '#3a3c40'],
  janelas: [[-26, 30, 30, 30, 20, 3.6], [0, 46, 0, 54, 26, 2.4], [0, 22, 42, 80, 3, 7], [-44, 4, 24, 3, 52, 6], [44, 2, 16, 4, 44, 4.5], [-18, 12, -46, 34, 22, 3], [30, -14, 30, 50, 2.5, 3], [6, 6, 48, 56, 34, 1.9]],   // a última é a caixa grande atrás de quem olha: as faces da frente refletem luz
  sombras: { raio: 950, mapa: 2048, suave: 7 },   // as peças projetam sombra umas nas outras
  fit: { largura: 820, altura: 660, max: 1.3 },
  grande: 1.8,                        // zoom da câmera montada (encolhe para 1 ao explodir)
  ordem: 'XYZ',
  focoSuave: true,                    // no foco, o centro anda primeiro e o zoom vem depois, com curva suave
  saida: 'sumir',                     // no foco, as outras peças ficam transparentes (decisão do usuário)
};
const POSES = { ini: { rotationY: -28, rotationX: 10 } };
const TEMPOS = { respiroIni: 0.6, respiroFim: 0.6, peca: 2, passo: 0.12, foco: 2.4, porUnidade: 58 };
/* Blueprint (só com o plugin cena-blueprint-3d): papel branco com linhas cinza, como o esquema; rótulos nas peças da primeira explosão,
   duas cotas e o carimbo. Pontos no sistema de cada peça: mm a partir do pivô dela (pecas.js). Sem o plugin, isto é ignorado. */
CFG.blueprint = {
  tema: 'papel', espessura: 1, limiar: .16,
  rotulos: [
    { no: 'carcacaPh',  ponto: [-18, 12, 10],  texto: '1 · Photomic', dir: [-1, -.25] },
    { no: 'capaD',      ponto: [-16, 7, 8],    texto: '10 · Tampa direita' },
    { no: 'capaE',      ponto: [8, 7, 8],      texto: '41 · Tampa esquerda', dir: [1, -.15] },
    { no: 'anelFrontal', ponto: [0, -28, 3],   texto: '58 · Nikkor-S Auto 50 mm f/1.4', curto: '58 · Nikkor-S 50/1.4', dir: [-.3, 1] },
    { no: 'casco',      ponto: [-62, -28, 17], texto: '24 · Corpo', dir: [-.5, 1] },
    { no: 'fundo',      ponto: [-10, 6, -17],  texto: '36 · Costas', dir: [-.15, 1] },
    { no: 'visorEsportivo', ponto: [-18, -17, 18], texto: '38–44 · Acessórios', curto: '38–44 · Acess.', dir: [.25, 1] },
  ],
  cotas: [
    { no: 'casco',    de: [-73.5, -33, 17], ate: [73.5, -33, 17], texto: '147 mm', desvio: 18 },
    { no: 'anelFoco', de: [-31, 31, 7],     ate: [31, 31, 7],     texto: 'Ø 62 mm', desvio: -16 },   // em cima da lente, fora dela
  ],
  carimbo: { titulo: 'Nikon F Photomic', linhas: [['fabricante', 'Nippon Kogaku · Tóquio'], ['ano', '1963'], ['peças', '58'], ['vista', 'explodida'], ['escala', '1 : 1']] },
};
/* Interação (só com o plugin cena-explodida-interativa): no fim da rolagem, dois toques abrem a câmera com a mesma explosão do ato de abertura
   (espelhada na tela, porque a vista do fim é o espelho da do começo); dois toques na lente abrem ou fecham só ela; em outra peça, fecham tudo. */
CFG.interativo = {
  abrir: ['nikonF', 'tampaD', 'tampaE', 'photomic', 'costas', 'acessorios'],   // a mesma explosão do ato de abertura
  subconjuntos: ['lente'],
  // Na explosão interativa: trava abaixo do Photomic e visor esportivo afastado para baixo da lente (voltam ao fechar).
  ajustesAbertura: { travaFrontal: { y: 22 }, visorEsportivo: { y: 30 } },
  zoom: .8,                                   // o zoom do ato de abertura
  afastar: { lente: { z: 230, x: -150, y: 10 } },    // ao abrir, a lente vem para a frente e para a esquerda: com menos giro e menos zoom ela precisa caber no quadro
  girarAoAbrir: { lente: 15 },                // ao abrir, a lente vira de lado (graus): a vista do fim olha quase pelo eixo dela e os anéis se cobriam
  espalhar: { lente: 1.3 },                     // e se espalha mais ao longo do eixo
  zoomAoAbrir: { lente: .75 },               // e o zoom recua para ela caber inteira
};

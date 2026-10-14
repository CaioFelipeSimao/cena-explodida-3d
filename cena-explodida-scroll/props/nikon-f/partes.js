/* Nikon F em árvore: as 58 peças do esquema (números nos comentários) e as sub-peças do Photomic, da lente e do obturador.
   O m de cada peça vem do pivô (pecas.js); aqui e e d são DESLOCAMENTOS (e a partir de m, d a partir de e), em unidades (1 mm = 2), y para baixo.
   Nós internos ficam em 0 quando montados. foco = ponto que a câmera centraliza ao focar o nó (relativo ao nó). extra = só existe aberto. */
const ARVORE = {
  nikonF:     ['costas', 'corpo', 'lente', 'tampaD', 'tampaE', 'photomic', 'acessorios'],
  costas:     ['fundo', 'chave', 'tripe'],                                                          // 36, 49
  corpo:      ['casco', 'camara', 'frente', 'obturador', 'transporte', 'armamento', 'base'],        // 24
  camara:     ['caixaEspelho', 'despolido', 'espelho'],                                             // 50, 51, 57
  frente:     ['temporizador', 'alavancaTemp', 'profundidade', 'travaLente', 'travaEspelho', 'travaPhotomic'],   // 55, 56, 53, 52, 54, 46
  obturador:  ['tamborA', 'tamborB', 'cortina1', 'cortina2'],                                       // 26
  transporte: ['bobina', 'friccao', 'pinhaoBobina', 'rolo', 'eixoRebobinar'],                       // 29, 28, 20, 30, 45
  armamento:  ['armamentoTopo', 'interruptorFlash', 'platinaVel', 'sincro', 'eixoContador', 'copo', 'armEspelho', 'disparoBloqueio',
               'eixoLentas', 'comandoSinc', 'pinhaoArm', 'temporizadorLentas', 'alavancaDisparo'],  // 16, 17, 18, 19, 21, 32, 22, 23, 25, 27, 31, 47, 48
  base:       ['carterInf', 'reset', 'motor'],                                                      // 33, 34, 35
  tampaD:     ['capaD', 'capaContador', 'debreagem', 'alavanca', 'velocidades', 'indicador', 'contador', 'disparador', 'avancoContador'],   // 10, 7, 8, 9, 11, 12, 13, 14, 15
  tampaE:     ['capaE', 'rebobinar'],                                                               // 41, 37
  photomic:   ['carcacaPh', 'asa', 'acoplado', 'bateria', 'escala', 'travaFrontal', 'prisma', 'celula', 'ocular'],   // 1: 2, 3, 4, 5, 6
  lente:      ['baionetaLente', 'anelAbertura', 'anelFoco', 'anelFrontal', 'vidroFrontal', 'vidroTraseiro'],         // 58
  acessorios: ['portaAcessorios', 'baseAcessorios', 'acessorio', 'contatoFlash', 'contatoFlash2', 'visorEsportivo'], // 39, 43, 38, 40, 44, 42
};

const partes = {
  /* primeira explosão: a lente sai para a frente, o Photomic e as tampas sobem, as costas descem para trás, os acessórios aparecem à direita */
  lente:      { e: { z: 300, x: -24, y: -29 },   d: { z: -14 },        ordem: 0, foco: { x: 27, y: 26, z: 90 } },
  photomic:   { e: { y: -200, z: 20 },   d: { y: -16, x: 10 }, ordem: 1 },
  tampaD:     { e: { y: -130, x: -60 },  d: { y: -12 },        ordem: 2 },
  tampaE:     { e: { y: -130, x: 60 },   d: { y: -16 },        ordem: 2 },
  acessorios: { e: { x: 250, y: -170 },  d: { y: -14 },        ordem: 2 },
  corpo:      { ordem: 3, foco: { y: 26 } },
  costas:     { e: { z: -200, y: 80 },   d: { y: 18 },         ordem: 4 },

  fundo: { ordem: 1 }, chave: { e: { y: 30 }, ordem: 0 }, tripe: { e: { y: 42 }, ordem: 0 },

  /* tampa direita aberta: os botões sobem, o que fica dentro dela desce */
  velocidades:    { e: { y: -60 },         d: { y: -6 }, ordem: 0 },
  disparador:     { e: { y: -100 },        d: { y: -8 }, ordem: 0 },
  alavanca:       { e: { y: -156, x: -44, z: -24 }, d: { y: -6 }, ordem: 0 },   // alturas bem diferentes: alavanca, disparador e seletor estão alinhados em x e se cobriam
  capaContador:   { e: { y: -52 },         d: { y: -4 }, ordem: 1 },
  contador:       { e: { y: -30 },         d: { y: -4 }, ordem: 2 },
  capaD:          { ordem: 3 },
  debreagem:      { e: { y: 50 },          d: { y: 6 },  ordem: 4 },
  avancoContador: { e: { y: 56 },          d: { y: 6 },  ordem: 4 },
  indicador:      { e: { y: 52, z: -24 },  d: { y: 6 },  ordem: 4 },
  capaE: { ordem: 1 }, rebobinar: { e: { y: -64 }, d: { y: -6 }, ordem: 0 },

  /* Photomic aberto: o cilindro se desempilha para cima, o prisma e a célula descem pela base, a ocular sai para trás */
  asa:          { e: { y: -126 },         d: { y: -6 },  ordem: 0 },
  acoplado:     { e: { y: -100 },         d: { y: -6 },  ordem: 1 },
  escala:       { e: { y: -66 },          d: { y: -6 },  ordem: 2 },
  bateria:      { e: { y: -74, x: 46 },   d: { y: -6 },  ordem: 1 },   // para o lado: atrás do cilindro ela sumia
  travaFrontal: { e: { z: 60, y: 44, x: -6.5 }, d: { z: 6 }, ordem: 1 },   // x só na explosão: sai de cima da placa "F Nikon"; montada fica no blueprint
  carcacaPh:    { ordem: 3 },
  prisma:       { e: { y: 96 },           d: { y: 8 },   ordem: 4 },
  celula:       { e: { y: 116, x: -64 },  d: { y: 6 },   ordem: 4 },   // bem abaixo da carcaça: a -50/70 ficava na frente da placa "F Nikon" (vista do fim)
  ocular:       { e: { x: 60, z: -50, y: -110 }, d: { y: -8 },  ordem: 4 },   // sobe acima da carcaça: só para trás, ficava atrás dela (vista do fim) ou da tampa esquerda (vista do começo)

  /* corpo aberto (foco no corpo): a caixa do espelho e a frente saem para a frente, o mecanismo sobe, o transporte e o obturador saem por trás, a base desce */
  camara:     { e: { z: 130 },             d: { y: -10 }, ordem: 0 },
  frente:     { e: { z: 66 },              d: { y: 10 },  ordem: 1 },
  armamento:  { e: { y: -120, x: -30 },    d: { y: -10 }, ordem: 2, foco: { x: -90, y: 12 } },
  obturador:  { e: { z: -80 },             d: { y: 8 },   ordem: 3, foco: { x: 27, y: 26, z: -19 } },
  transporte: { e: { z: -170, x: -20 },    d: { y: -8 },  ordem: 3 },
  base:       { e: { y: 120 },             d: { y: 10 },  ordem: 4 },
  casco:      { ordem: 5 },
  caixaEspelho: { ordem: 2 }, despolido: { e: { y: -56 }, d: { y: -6 }, ordem: 0 }, espelho: { e: { z: 60 }, d: { y: 6 }, ordem: 1 },
  temporizador: { e: { z: 30 }, ordem: 1 }, alavancaTemp: { e: { z: 54, y: -10 }, ordem: 0 }, profundidade: { e: { z: 40 }, ordem: 0 },
  travaLente: { e: { z: 40 }, ordem: 0 }, travaEspelho: { e: { z: 60 }, ordem: 0 }, travaPhotomic: { e: { y: -44, z: 30 }, ordem: 0 },
  bobina: { ordem: 1 }, friccao: { e: { y: -54 }, ordem: 0 }, pinhaoBobina: { e: { y: 44 }, ordem: 0 }, rolo: { e: { x: 50 }, ordem: 0 }, eixoRebobinar: { e: { y: -64 }, ordem: 0 },
  carterInf: { ordem: 1 }, reset: { e: { y: 34 }, ordem: 0 }, motor: { e: { y: 56 }, ordem: 0 },

  /* mecanismo aberto (foco no armamento): as peças se abrem em leque */
  armamentoTopo:      { e: { y: -52 },          d: { y: -4 }, ordem: 0 },
  interruptorFlash:   { e: { y: -37, z: -27 },  d: { y: -4 }, ordem: 0 },
  platinaVel:         { e: { y: -33, x: 21 },   d: { y: -4 }, ordem: 0 },
  sincro:             { e: { y: -60, x: 27 },   d: { y: -4 }, ordem: 0 },
  eixoContador:       { e: { x: -27 },          d: { y: 4 },  ordem: 1 },
  copo:               { e: { x: -27, y: 33 },   d: { y: 4 },  ordem: 1 },
  armEspelho:         { e: { x: -41 },          d: { y: 4 },  ordem: 2 },
  disparoBloqueio:    { e: { z: 40, x: -15 },   d: { y: 4 },  ordem: 1 },
  eixoLentas:         { e: { y: -15, z: 27 },   d: { y: -4 }, ordem: 1 },
  comandoSinc:        { e: { x: 27, z: 27 },    d: { y: 4 },  ordem: 1 },
  pinhaoArm:          { e: { y: 40 },           d: { y: 4 },  ordem: 2 },
  temporizadorLentas: { e: { z: 40 },           d: { y: 4 },  ordem: 0 },
  alavancaDisparo:    { e: { y: -21, x: 15, z: 21 }, d: { y: -4 }, ordem: 1 },

  /* obturador aberto: os tambores se afastam, a primeira cortina vem para a frente, a segunda vai para trás */
  tamborA: { e: { x: -76 }, d: { y: 6 }, ordem: 1 }, tamborB: { e: { x: 76 }, d: { y: -6 }, ordem: 1 },
  cortina1: { e: { z: 50 }, d: { y: 6 }, ordem: 0 }, cortina2: { e: { x: 76, z: -40 }, d: { y: -6 }, ordem: 2 },

  /* acessórios (extras) */
  portaAcessorios: { e: { y: 20 }, extra: true, ordem: 2 }, baseAcessorios: { e: { y: -20 }, extra: true, ordem: 1 }, acessorio: { e: { y: -64 }, extra: true, ordem: 0 },
  contatoFlash: { e: { x: 44, y: -44 }, extra: true, ordem: 0 }, contatoFlash2: { e: { x: -44, y: -44 }, extra: true, ordem: 0 },
  visorEsportivo: { e: { x: 110, y: 230 }, d: { y: 10 }, extra: true, ordem: 1 },

  /* lente aberta: as peças se espalham ao longo do eixo óptico; os anéis giram (o eixo da lente é o z, então o giro é de verdade) */
  vidroTraseiro: { e: { z: -112 }, d: { z: -14 }, ordem: 5 },
  baionetaLente: { e: { z: -67 },  d: { z: -10 }, ordem: 4 },
  anelAbertura:  { e: { z: -22 },  d: { y: 6 },   ordem: 3, r: 360 },
  anelFoco:      { e: { z: 23 },   d: { y: -6 },  ordem: 2, r: -360 },
  anelFrontal:   { e: { z: 68 },   d: { z: 10 },  ordem: 1, r: 360 },
  vidroFrontal:  { e: { z: 113 },  d: { z: 16 },  ordem: 0 },
};

/* a história: abre tudo; lente; corpo (e dentro dele o mecanismo e o obturador); fecha tudo */
const ATOS = [
  { id: 'abre',        abrir: ['nikonF', 'tampaD', 'tampaE', 'photomic', 'costas', 'acessorios'], camera: { rotationY: -48, rotationX: 18 }, zoom: .8, estilo: { linhas: 1, anot: 1 } },   // vira desenho técnico (com o plugin)
  { id: 'foca-lente',  focar: 'lente', abrir: ['lente'],  camera: { rotationY: -52, rotationX: 18 }, zoom: 1.5, estilo: { linhas: 0, anot: 0 } },   // volta ao 3D
  { id: 'gira-lente',                                      camera: { rotationY: -52 + 360, rotationX: 24 }, duracao: 3.5 },
  { id: 'fecha-lente', fechar: ['lente'], voltar: true,   camera: { rotationY: 360 - 40, rotationX: 16 }, zoom: .8 },
  { id: 'foca-corpo',  focar: 'corpo', abrir: ['corpo', 'camara', 'frente', 'transporte', 'base'], camera: { rotationY: 360 - 140, rotationX: 20 }, zoom: 1 },
  { id: 'foca-mec',    focar: 'armamento', abrir: ['armamento'], camera: { rotationY: 360 - 160, rotationX: 28 }, zoom: 1.6 },
  { id: 'fecha-mec',   fechar: ['armamento'], voltar: true, camera: { rotationY: 360 - 170, rotationX: 20 }, zoom: 1 },
  { id: 'foca-obt',    focar: 'obturador', abrir: ['obturador'], camera: { rotationY: 360 - 200, rotationX: 12 }, zoom: 1.8 },
  { id: 'fecha-obt',   fechar: ['obturador'], voltar: true, camera: { rotationY: 360 - 210, rotationX: 18 }, zoom: 1 },
  { id: 'fecha-corpo', fechar: ['corpo', 'camara', 'frente', 'transporte', 'base'], voltar: true, camera: { rotationY: 360 - 60, rotationX: 16 }, zoom: .8 },
  { id: 'fecha',       fechar: ['nikonF', 'tampaD', 'tampaE', 'photomic', 'costas', 'acessorios'], camera: { rotationY: 360 + 28, rotationX: 10 }, zoom: 1.8 },
];

/* Peças do relógio: materiais, geometria e tabela de peças. Usa o motor (disco, tubo, engrenagem, extrudar, svgTex) e as faces de faces.js.
   Unidades = px de um relógio de ~330 de diâmetro; z montado = centro da espessura de cada peça. */

const M = {   // materiais: a cor e o brilho vêm do material de verdade (ferro, níquel, latão, aço, porcelana, vidro)
  ferro: mat(0x16191d, .48, .12, { envMapIntensity: .5 }), niquel: mat(0x8d929a, .34, 1), latao: mat(0xb98a35, .34, 1), aco: mat(0x9aa0a8, .32, 1),
  galv: mat(0x8c9298, .4, .7), esmalte: mat(0xc9c2ae, .3, 0, { envMapIntensity: .3 }), preto: mat(0x0b0c0e, .8, 0, { envMapIntensity: .15 }),
  sinal: mat(0xb02a1f, .75, 0, { envMapIntensity: .2 }), gaxeta: mat(0x15171a, .8, 0),
  vidro: mat(0x7fb5ab, .06, 0, { transparent: true, opacity: .6, depthWrite: false, envMapIntensity: 1.5 }),
};

/* três engrenagens que ENGRENAM: módulo igual, fases calculadas (onde uma tem dente, a vizinha tem vão) */
const MOD = 5.5, NC = 20, NA = 12, NB = 14, PG = 6;
const prC = NC * MOD / 2, prA = NA * MOD / 2, prB = NB * MOD / 2, angA = 150, angB = 33;
const phC = angA, phA = angA + 180 - 180 / NA, phB = angB + 180;
const posA = pol(prC + prA, angA), posB = pol(prC + prB, angB);
const espada = (ponta, largo, cintura, base, larg) => [[0, -ponta], [largo, -ponta + 22], [cintura, -ponta + 32], [larg, base], [-larg, base], [-cintura, -ponta + 32], [-largo, -ponta + 22]];

async function construirPecas() {
  const [dF, dB, tF, tB, pF, pB, vF, piF] = await Promise.all([
    svgTex(mostradorF(), 296, 1024, true), svgTex(mostradorB, 296, 512, true),
    svgTex(tampaF, 305, 512, false), svgTex(tampaB, 305, 1024, true),
    svgTex(platinaF, 300, 1024, false), svgTex(platinaB, 300, 1024, true),
    svgTex(vidroF, 295, 512, false), svgTex(pinoF, 20, 128, false),
  ]);
  const feito = {};
  feito.tampa = disco(152.5, 6, 96, M.galv, tF, tB, mat(0xffffff, .6, .15), mat(0xffffff, .4, .55));
  feito.caixa = new THREE.Group(); feito.caixa.add(tubo(perfilTubo(160, 153, 22, .8), 120, M.ferro));
  feito.platina = disco(150, 4, 96, M.latao, pF, pB, mat(0xffffff, .42, .55), mat(0xffffff, .42, .55));
  feito.gC = engrenagem(NC, prC, MOD, phC, M.latao, 5, PG);
  feito.gA = engrenagem(NA, prA, MOD, phA, M.aco, 3, PG);
  feito.gB = engrenagem(NB, prB, MOD, phB, M.aco, 4, PG);
  feito.mostrador = disco(148, 3, 96, M.esmalte, dF, dB, mat(0xe6e2d6, .32, 0, { envMapIntensity: .25 }), mat(0xd8d2c0, .8, 0, { envMapIntensity: .2 }));
  feito.mostrador.add(pino3d(0, -112, -5.5, 3.5, 8, M.aco), pino3d(0, 112, -5.5, 3.5, 8, M.aco));   // os dois pés que prendem o mostrador à platina
  feito.horas = extrudar([espada(84, 10, 3.5, 16, 4), circulo(0, 0, 8)], 2.4, .3, M.preto);
  feito.minutos = extrudar([espada(122, 8, 3, 18, 3.6), circulo(0, 0, 7)], 2.4, .3, M.preto);
  feito.segundos = extrudar([[[-1.1, -130], [1.1, -130], [1.1, 14], [3, 14], [3, 42], [-3, 42], [-3, 14], [-1.1, 14]], circulo(0, -96, 7), circulo(0, 0, 6)], 1.6, .3, M.sinal);
  feito.pino = disco(10, 5, 32, M.latao, piF, null, mat(0xffffff, .3, .9));
  feito.bisel = new THREE.Group(); feito.bisel.add(tubo(perfilTubo(162.5, 148, 5, .7), 120, M.niquel));
  const gax = new THREE.Mesh(new THREE.RingGeometry(148, 152, 96), M.gaxeta); gax.position.z = -5.03; gax.rotation.y = Math.PI; feito.bisel.add(gax);   // gaxeta preta onde o vidro assenta
  /* vidro: as tampas levam a textura (que já tem a transparência), a borda é vidro verde, e um disco espelhado por cima reflete o ambiente e muda com o ângulo */
  const capVidro = () => new THREE.MeshStandardMaterial({ map: vF, transparent: true, roughness: .1, metalness: 0, depthWrite: false, envMapIntensity: 1 });
  const brilho = mat(0xffffff, .03, 1, { transparent: true, opacity: .07, depthWrite: false, envMapIntensity: 1.2 });
  feito.vidro = disco(147.5, 4, 96, M.vidro, vF, vF, capVidro(), capVidro());
  const sf = new THREE.Mesh(new THREE.CircleGeometry(147.5, 96), brilho); sf.position.z = 2.08; feito.vidro.add(sf);
  const sb = new THREE.Mesh(new THREE.CircleGeometry(147.5, 96), brilho); sb.position.z = -2.08; sb.rotation.y = Math.PI; feito.vidro.add(sb);
  feito.vidro.traverse(o => { o.renderOrder = 10; });   // translúcido por último
  for (const [nome, g] of Object.entries(feito)) { G[nome] = g; raizG.add(g); }
}


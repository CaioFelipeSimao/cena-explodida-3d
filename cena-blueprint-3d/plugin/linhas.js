/* cena-blueprint-3d: passe de linhas. O prop vira desenho técnico com hierarquia de traço.
   O alvo chapado guarda normal, id da peça e cobertura; o filtro 3x3 separa silhuetas e quinas.
   Vidro não ocupa o alvo principal: um alvo opcional fornece suas linhas e um tingimento de 8%.
   EST.linhas (0..1, animado por ato em ato.estilo) mistura o desenho por cima do realista; em 0 não há custo extra.
   Lê CFG.blueprint = { tema, espessura, espessuraCelular, densidadeMax, ssCelular, pesoSilhueta, pesoQuina, limiar, anguloQuina, nitidez, soContorno, vidro }. */
let BP_ALVO = null;   // o alvo principal (a conferência de sobreposições pode ler)
const TEMAS_BP = {
  papel:  { fundo: '#f3f2ee', peca: '#ffffff', linha: '#6f7377', sombra: .07 },
  azul:   { fundo: '#1d4f86', peca: '#24578f', linha: '#e8f0fa', sombra: .10 },
  escuro: { fundo: '#2a2c2f', peca: '#3a3d41', linha: '#9aa0a6', sombra: .12 },
};
CFG.estilo = Object.assign({ linhas: 0, anot: 0 }, CFG.estilo);

const BP = (() => {
  const cfg = Object.assign({ tema: 'papel', espessura: 1, espessuraCelular: .75, pesoSilhueta: 1.35, pesoQuina: .8, limiar: .16, anguloQuina: 30, nitidez: [.18, .55], soContorno: [], vidro: [], ssCelular: 1.5 }, CFG.blueprint);
  const nitidez = cfg.nitidez === false ? null : cfg.nitidez;
  const tema = TEMAS_BP[cfg.tema] || TEMAS_BP.papel;
  const criarAlvo = () => new THREE.WebGLRenderTarget(4, 4, { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, depthBuffer: true });
  const alvo = criarAlvo(); let alvoVidro = null;
  BP_ALVO = alvo;
  /* rg = normal na vista, b = id original, a = (128 + 127 * fatorQuina) / 255 na peça, 0 no fundo.
     soContorno e peças pequenas usam fator 0. A cobertura é binária, independente do fator. */
  const chapado = new THREE.ShaderMaterial({
    uniforms: { uId: { value: 0 }, uContorno: { value: 0 }, uQuina: { value: 1 } },
    vertexShader: 'varying vec3 vN; void main(){ vN = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: 'uniform float uId, uContorno, uQuina; varying vec3 vN; void main(){ vec3 n = normalize(vN); gl_FragColor = vec4(n.xy * 0.5 + 0.5, uId, (128.0 + 127.0 * uQuina * (1.0 - uContorno)) / 255.0); }',
  });
  const oculto = chapado.clone(); oculto.visible = false;
  const col = c => new THREE.Color(c);
  /* Grade de 1, 4 ou 9 amostras conforme a razão alvo/buffer. Cada camada usa 44 leituras
     por amostra (antes: 45): os quatro texels da cobertura também fornecem o dado central.
     Assim os dois raios de traço não aumentam as leituras quando não há vidro. */
  const passe = new THREE.ShaderMaterial({
    transparent: true, depthTest: false, depthWrite: false,
    defines: {},
    uniforms: {
      tL: { value: alvo.texture }, tV: { value: alvo.texture },
      tx: { value: new THREE.Vector2() }, esp: { value: new THREE.Vector2() }, escala: { value: new THREE.Vector2() },
      pesoSilhueta: { value: cfg.pesoSilhueta }, pesoQuina: { value: cfg.pesoQuina },
      nitidez: { value: nitidez !== null }, curvaNitidez: { value: new THREE.Vector2(...(nitidez || [.18, .55])) },
      mistura: { value: 0 }, limiar: { value: cfg.limiar },
      usarVidro: { value: false },
      cosQuina: { value: Math.cos(Math.max(0, Math.min(180, cfg.anguloQuina)) * Math.PI / 180) }, ss: { value: 2 },
      cFundo: { value: col(tema.fundo) }, cPeca: { value: col(tema.peca) }, cLinha: { value: col(tema.linha) }, sombra: { value: tema.sombra },
    },
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }',
    fragmentShader: [
      'uniform sampler2D tL, tV; uniform vec2 tx, esp, escala;',
      'uniform bool usarVidro;',
      'uniform bool nitidez; uniform vec2 curvaNitidez;',
      'uniform float mistura, limiar, sombra, cosQuina, ss, pesoSilhueta, pesoQuina;',
      'uniform vec3 cFundo, cPeca, cLinha; varying vec2 vUv;',
      'vec4 dados(sampler2D alvoTex, vec2 uv){ return texture2D(alvoTex, (floor(uv / tx) + 0.5) * tx); }',
      'float ocupado(vec4 a){ return step(0.25, a.a); }',
      'float fatorQuina(vec4 a){ return clamp((floor(a.a * 255.0 + 0.5) - 128.0) / 127.0, 0.0, 1.0); }',
      'vec3 normalVista(vec4 a){',
      '  vec2 xy = a.rg * 2.0 - 1.0;',
      '  return normalize(vec3(xy, sqrt(max(0.0, 1.0 - dot(xy, xy)))));',
      '}',
      // Cobertura bilinear binária; normal, id e fator vêm de um único texel, sem interpolar.
      'vec4 dadosCobertura(sampler2D alvoTex, vec2 uv, out float cob){',
      '  vec2 q = uv / tx - 0.5, f = fract(q), base = (floor(q) + 0.5) * tx;',
      '  vec4 a00 = texture2D(alvoTex, base), a10 = texture2D(alvoTex, base + vec2(tx.x, 0.0));',
      '  vec4 a01 = texture2D(alvoTex, base + vec2(0.0, tx.y)), a11 = texture2D(alvoTex, base + tx);',
      '  cob = mix(mix(ocupado(a00), ocupado(a10), f.x), mix(ocupado(a01), ocupado(a11), f.x), f.y);',
      '  return f.y < 0.5 ? (f.x < 0.5 ? a00 : a10) : (f.x < 0.5 ? a01 : a11);',
      '}',
      // Retorna cobertura, silhueta/borda entre peças e quina, com raios independentes.
      'vec4 bordas(sampler2D alvoTex, vec2 uv, out vec3 n){',
      // Compensa o avanço do meio da curva: .135 pixel do buffer por lado no padrão.
      // A conversão esp/escala preserva a largura CSS e o mínimo de meio texel.
      '  vec2 ajuste = nitidez ? escala * max(0.0, 0.5 - (curvaNitidez.x + curvaNitidez.y) * 0.5) : vec2(0.0);',
      '  vec2 pS = tx * max(vec2(0.5), esp * max(0.0, pesoSilhueta) * 0.5 - ajuste);',
      '  float coberturaA; vec4 a = dadosCobertura(alvoTex, uv, coberturaA); n = normalVista(a);',
      '  float fator = fatorQuina(a);',
      '  vec2 pQ = tx * max(vec2(0.5), esp * max(0.0, pesoQuina) * fator * 0.5 - ajuste);',
      '  float ca = ocupado(a), dn = 0.0, di = 0.0, dc = 0.0;',
      // Máximo morfológico 3x3: não cancela bordas opostas de faixas finas.
      '  for (int y = -1; y <= 1; y++){ for (int x = -1; x <= 1; x++){',
      '    if (x == 0 && y == 0) continue;',
      '    vec2 dir = vec2(float(x), float(y));',
      '    float coberturaB; vec4 b = dadosCobertura(alvoTex, uv + dir * pS, coberturaB);',
      '    float cb = ocupado(b), outra = step(0.002, abs(a.b - b.b));',
      '    di = max(di, outra * ca * cb);',
      '    dc = max(dc, abs(coberturaA - coberturaB));',
      '    vec4 q = dados(alvoTex, uv + dir * pQ);',
      '    if (ca * ocupado(q) > 0.5 && abs(a.b - q.b) < 0.002 && fator > 0.0 && fatorQuina(q) > 0.0){',
      '      float produto = clamp(dot(n, normalVista(q)), -1.0, 1.0);',
      '      if (produto < cosQuina) dn = max(dn, sqrt(max(0.0, 2.0 - 2.0 * produto)));',
      '    }',
      '  }}',
      '  float l = max(limiar, 0.0001);',
      '  return vec4(coberturaA, max(di, dc), smoothstep(l * .6, l, dn), fator);',
      '}',
      'vec3 amostra(vec2 uv, out vec3 linhas){',
      '  vec3 n; vec4 b = bordas(tL, uv, n);',
      '  vec3 peca = cPeca * (1.0 - sombra * (1.0 - clamp(dot(n, normalize(vec3(-.4, .6, .7))), 0.0, 1.0)));',
      '  vec3 cor = mix(cFundo, peca, b.x);',
      '#ifdef BP_VIDRO',
      '  if (usarVidro){',
      '    vec3 nVidro; vec4 v = bordas(tV, uv, nVidro);',
      '    cor = mix(cor, cLinha, 0.08 * v.x);',
      '    b.y = max(b.y, v.y);',
      '    if (v.z * v.w > b.z * b.w) b.zw = v.zw;',
      '  }',
      '#endif',
      '  linhas = vec3(b.yz, b.z * b.w);',
      '  if (nitidez) return cor;',
      // Quinas um pouco mais claras; silhuetas têm prioridade, inclusive em soContorno e vidro.
      '  cor = mix(cor, cLinha, 0.8 * b.z * b.w);',
      '  return mix(cor, cLinha, b.y);',
      '}',
      'void main(){',
      '  vec3 cor = vec3(0.0), coberturaLinha = vec3(0.0);',
      '  for (int y = 0; y < 3; y++){ for (int x = 0; x < 3; x++){',
      '    if (float(x) >= ss || float(y) >= ss) continue;',
      '    vec2 offset = ((vec2(float(x), float(y)) + 0.5) / ss - 0.5) * tx * escala;',
      '    vec3 linhas; cor += amostra(vUv + offset, linhas); coberturaLinha += linhas;',
      '  }}',
      '  cor /= ss * ss;',
      '  if (nitidez){',
      '    vec2 alfa = smoothstep(vec2(curvaNitidez.x), vec2(curvaNitidez.y), coberturaLinha.xy / (ss * ss));',
      // Contraste menor só depois do remapeamento; silhuetas e vidro mantêm prioridade.
      '    float fator = coberturaLinha.z / max(coberturaLinha.y, 0.00001);',
      '    cor = mix(cor, cLinha, 0.8 * alfa.y * fator);',
      '    cor = mix(cor, cLinha, alfa.x);',
      '  }',
      '  gl_FragColor = vec4(cor, mistura);',
      '}',
    ].join('\n'),
  });
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), passe), cena2 = new THREE.Scene(), cam2 = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  quad.frustumCulled = false; cena2.add(quad);
  let malhas = null; const malhasVidro = [], pecas = [];
  const tam = new THREE.Vector2(), tela = new THREE.Vector2(), corLimpa = new THREE.Color();
  const frustum = new THREE.Frustum(), projVista = new THREE.Matrix4();
  const esferaVista = new THREE.Sphere(), centroVista = new THREE.Vector3();
  /* Consultas assíncronas: nunca esperar pela GPU nem chamar finish/readPixels.
     Cada média inclui 30 quadros (etapas puladas contam como zero). */
  const etapas = ['normal', 'chapado', 'vidro', 'tela'];
  const tempos = window.BP_TEMPOS = {
    fonte: 'cpu', normal: 0, chapado: 0, vidro: 0, tela: 0,
    aw: 0, ah: 0, ss: 0, amostrasFiltro: 0, densidade: 0, dprEfetivo: 0, ativo: false, vidroVisivel: false, amostras: 0,
    cpu: { normal: 0, chapado: 0, vidro: 0, tela: 0 }, gpu: null,
  };
  const media = () => ({ quadros: Array.from({ length: 30 }, () => [0, 0, 0, 0]), soma: [0, 0, 0, 0], n: 0, pos: 0 });
  const cpu = media(), gpu = media();
  const acumular = (m, valores) => {
    const antigo = m.quadros[m.pos];
    for (let i = 0; i < 4; i++) { m.soma[i] += valores[i] - antigo[i]; antigo[i] = valores[i]; }
    m.n = Math.min(30, m.n + 1); m.pos = (m.pos + 1) % 30;
  };
  const publicar = () => {
    for (let i = 0; i < 4; i++) {
      tempos.cpu[etapas[i]] = cpu.n ? cpu.soma[i] / cpu.n : 0;
      if (gpu.n) tempos.gpu[etapas[i]] = gpu.soma[i] / gpu.n;
      tempos[etapas[i]] = tempos.fonte === 'gpu' && gpu.n ? tempos.gpu[etapas[i]] : tempos.cpu[etapas[i]];
    }
    tempos.amostras = tempos.fonte === 'gpu' ? gpu.n : cpu.n;
  };
  const gl = renderer.getContext(), webgl2 = renderer.capabilities.isWebGL2;
  const ext = gl.getExtension(webgl2 ? 'EXT_disjoint_timer_query_webgl2' : 'EXT_disjoint_timer_query');
  const pendentes = [];
  const apagar = q => { if (webgl2) gl.deleteQuery(q); else ext.deleteQueryEXT(q); };
  const disponivel = q => webgl2 ? gl.getQueryParameter(q, gl.QUERY_RESULT_AVAILABLE) : ext.getQueryObjectEXT(q, ext.QUERY_RESULT_AVAILABLE_EXT);
  const resultado = q => (webgl2 ? gl.getQueryParameter(q, gl.QUERY_RESULT) : ext.getQueryObjectEXT(q, ext.QUERY_RESULT_EXT)) / 1e6;
  const colherGPU = () => {
    if (!ext || gl.isContextLost()) return;
    if (gl.getParameter(ext.GPU_DISJOINT_EXT)) {
      for (const quadro of pendentes) for (const q of quadro.consultas) if (q) apagar(q);
      pendentes.length = 0; gpu.n = 0; gpu.pos = 0; gpu.soma.fill(0);
      for (const quadro of gpu.quadros) quadro.fill(0);
      tempos.gpu = null; tempos.fonte = 'cpu'; publicar(); return;
    }
    while (pendentes.length) {
      const quadro = pendentes[0];
      if (!quadro.consultas.every(q => !q || disponivel(q))) break;
      for (let i = 0; i < 4; i++) {
        const q = quadro.consultas[i]; quadro.valores[i] = q ? resultado(q) : 0;
        if (q) apagar(q);
      }
      pendentes.shift(); acumular(gpu, quadro.valores);
      if (!tempos.gpu) tempos.gpu = { normal: 0, chapado: 0, vidro: 0, tela: 0 };
      tempos.fonte = 'gpu'; publicar();
    }
  };
  // O HUD também colhe o último quadro quando o scroll deixa de redesenhar.
  let hudDensidade = null;
  tempos.atualizar = () => {
    colherGPU();
    // Linha própria: o motor substitui o texto de #hud-info a cada atualização.
    const hud = document.getElementById('hud');
    if (!hudDensidade && hud) { hudDensidade = document.createElement('div'); hud.appendChild(hudDensidade); }
    if (hudDensidade) {
      hudDensidade.hidden = !tempos.ativo;
      hudDensidade.textContent = `BP densidade ${tempos.densidade.toFixed(2)} px/CSS · DPR efetivo ${tempos.dprEfetivo.toFixed(2)}`;
    }
  };
  let quadro = null, inicioCPU = 0, consulta = null;
  const iniciar = i => {
    consulta = null;
    if (quadro.consultas) {
      consulta = webgl2 ? gl.createQuery() : ext.createQueryEXT();
      if (consulta) {
        quadro.consultas[i] = consulta;
        if (webgl2) gl.beginQuery(ext.TIME_ELAPSED_EXT, consulta); else ext.beginQueryEXT(ext.TIME_ELAPSED_EXT, consulta);
      } else quadro.valido = false;
    }
    inicioCPU = performance.now();
  };
  const terminar = i => {
    quadro.valores[i] = performance.now() - inicioCPU;
    if (consulta) {
      if (webgl2) gl.endQuery(ext.TIME_ELAPSED_EXT); else ext.endQueryEXT(ext.TIME_ELAPSED_EXT);
      consulta = null;
    }
  };
  const vidroNaTela = normalRenderizado => {
    // O render normal já atualizou as matrizes; em blueprint puro ele é pulado.
    if (!normalRenderizado) { scene.updateMatrixWorld(); camera.updateMatrixWorld(); }
    projVista.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
    frustum.setFromProjectionMatrix(projVista);
    for (const entrada of malhasVidro) {
      const o = entrada.o;
      if (!camera.layers.test(o.layers)) continue;
      let visivel = true;
      for (let pai = o; pai; pai = pai.parent) if (!pai.visible) { visivel = false; break; }
      if (!visivel) continue;
      const materiais = o.material;
      let materialVisivel = false;
      for (const i of entrada.indicesVidro) {
        const m = Array.isArray(materiais) ? materiais[i] : materiais;
        if (m.visible !== false && m.opacity > 0) { materialVisivel = true; break; }
      }
      if (!materialVisivel) continue;
      if (frustum.intersectsObject(o)) return true;
    }
    return false;
  };
  /* Um id por peça, inclusive na camada de vidro. Preserva side/visible e materiais mistos.
     As listas também aceitam grupos ancestrais e nós nomeados das malhas. */
  const preparar = () => {
    if (malhas) return;
    malhas = []; let k = 0, temVidro = false;
    scene.updateMatrixWorld(true);
    const folhas = Object.keys(G).filter(n => G[n] !== raizG && !(typeof ARVORE !== 'undefined' && ARVORE[n]));
    const contornos = new Set(cfg.soContorno), vidros = new Set(cfg.vidro), vistos = new Set();
    const gruposContorno = new Set([...contornos].map(n => G[n]).filter(Boolean));
    const gruposVidro = new Set([...vidros].map(n => G[n]).filter(Boolean));
    const listado = (o, n, nomes, grupos) => {
      if (nomes.has(n)) return true;
      for (let pai = o; pai; pai = pai.parent) if (nomes.has(pai.name) || grupos.has(pai)) return true;
      return false;
    };
    for (const n of folhas) {
      const id = ((k++ * 37) % 251 + 1) / 252, variantes = new Map();
      const caixa = new THREE.Box3(), inversa = G[n].matrixWorld.clone().invert(), local = new THREE.Matrix4();
      G[n].traverse(o => {
        if (!o.isMesh || vistos.has(o)) return;
        vistos.add(o);
        if (!o.geometry.boundingBox) o.geometry.computeBoundingBox();
        local.multiplyMatrices(inversa, o.matrixWorld);
        caixa.union(o.geometry.boundingBox.clone().applyMatrix4(local));
        const contorno = listado(o, n, contornos, gruposContorno), vidro = listado(o, n, vidros, gruposVidro);
        const indicesVidro = [];
        const separar = (original, i) => {
          const key = [contorno, original.side, original.visible].join(':');
          if (!variantes.has(key)) {
            const m = chapado.clone(); m.uniforms.uId.value = id; m.uniforms.uContorno.value = contorno ? 1 : 0;
            m.side = original.side; m.visible = original.visible; variantes.set(key, m);
          }
          // O motor guarda o material de origem: um fade de saída não transforma sólido em vidro.
          const base = o.userData && o.userData.base && o.userData.base[i];
          const transparente = base ? base.tr && base.op < 1 : original.transparent && original.opacity < 1;
          const m = variantes.get(key), ehVidro = vidro || transparente;
          if (ehVidro) { temVidro = true; indicesVidro.push(i); }
          return ehVidro ? [oculto, m] : [m, oculto];
        };
        const pares = (Array.isArray(o.material) ? o.material : [o.material]).map(separar);
        const principal = pares.map(p => p[0]), transparente = pares.map(p => p[1]);
        const entrada = { o, original: null, indicesVidro, principal: Array.isArray(o.material) ? principal : principal[0], vidro: Array.isArray(o.material) ? transparente : transparente[0] };
        malhas.push(entrada);
        if (indicesVidro.length) malhasVidro.push(entrada);
      });
      if (!caixa.isEmpty()) pecas.push({ o: G[n], esfera: caixa.getBoundingSphere(new THREE.Sphere()), materiais: [...variantes.values()] });
    }
    if (temVidro) {
      alvoVidro = criarAlvo(); passe.uniforms.tV.value = alvoVidro.texture;
      passe.defines.BP_VIDRO = 1; passe.needsUpdate = true; // sem código de vidro no shader de cenas opacas
    }
  };
  const compilar = () => {
    preparar();
    const auto = renderer.shadowMap.autoUpdate;
    try {
      renderer.shadowMap.autoUpdate = false;
      for (const entrada of malhas) { entrada.original = entrada.o.material; entrada.o.material = entrada.principal; }
      renderer.compile(scene, camera);
      if (alvoVidro) {
        for (const entrada of malhas) entrada.o.material = entrada.vidro;
        renderer.compile(scene, camera);
      }
      renderer.compile(cena2, cam2);
    } finally {
      for (const entrada of malhas) entrada.o.material = entrada.original;
      renderer.shadowMap.autoUpdate = auto;
    }
  };
  // O arranque chama isto após construirPecas(), antes de window.pronto e do primeiro desenho.
  const prepararMotor = prepararPartes;
  prepararPartes = function (...args) {
    const resultado = prepararMotor.apply(this, args);
    compilar();
    return resultado;
  };
  const atualizarQuinas = () => {
    scene.updateMatrixWorld(); camera.updateMatrixWorld();
    const p = camera.projectionMatrix.elements;
    const projRaio = Math.max(tela.x * Math.abs(p[0]), tela.y * Math.abs(p[5])) * .5;
    for (const peca of pecas) {
      esferaVista.copy(peca.esfera).applyMatrix4(peca.o.matrixWorld);
      centroVista.copy(esferaVista.center).applyMatrix4(camera.matrixWorldInverse);
      // Projeta centro e raio em CSS; uma esfera que cruza a câmera não é considerada pequena.
      const raio = camera.isPerspectiveCamera
        ? (centroVista.z + esferaVista.radius >= 0 ? Infinity : esferaVista.radius * projRaio / Math.max(camera.near, -centroVista.z))
        : esferaVista.radius * projRaio;
      const t = Math.max(0, Math.min(1, (raio - 18) / (40 - 18))), fator = t * t * (3 - 2 * t);
      for (const m of peca.materiais) m.uniforms.uQuina.value = fator;
    }
  };
  return function () {
    const mis = EST.linhas || 0;
    tempos.ativo = mis > 0;
    if (hudDensidade) hudDensidade.hidden = !tempos.ativo;
    colherGPU();
    if (mis <= 0) { renderer.render(scene, camera); return; }
    // Limita a oito quadros pendentes; uma GPU atrasada não acumula consultas sem limite.
    quadro = { valores: [0, 0, 0, 0], consultas: ext && !gl.isContextLost() && pendentes.length < 8 ? [null, null, null, null] : null, valido: true };
    if (mis < 1) {
      const auto = renderer.shadowMap.autoUpdate, atualizar = renderer.shadowMap.needsUpdate;
      iniciar(0);
      try {
        renderer.shadowMap.autoUpdate = false; renderer.shadowMap.needsUpdate = false;
        renderer.render(scene, camera);
      } finally { renderer.shadowMap.autoUpdate = auto; renderer.shadowMap.needsUpdate = atualizar; terminar(0); }
    }
    renderer.getDrawingBufferSize(tam); renderer.getSize(tela);
    const dprEfetivo = renderer.getPixelRatio(), ehCelular = tela.x < 600;
    const celular = Number(cfg.ssCelular);
    const ss = ehCelular ? (Number.isFinite(celular) ? Math.max(1, Math.min(3, celular)) : 1.5) : dprEfetivo <= 1.5 && tela.x >= 900 ? 3 : 2;
    const limite = Number(cfg.densidadeMax), densidadeMax = Number.isFinite(limite) && limite > 0 ? limite : ehCelular ? 2.25 : 3;
    // O teto limita só a densidade extra: nunca reduz o buffer que o usuário escolheu.
    const tetoAlvo = Math.min(4096, renderer.capabilities.maxTextureSize, renderer.capabilities.maxRenderbufferSize || Infinity);
    const densidade = Math.max(dprEfetivo, Math.min(ss * dprEfetivo, densidadeMax, tetoAlvo / Math.max(tela.x, tela.y)));
    const aw = Math.max(tam.x, Math.round(tela.x * densidade)), ah = Math.max(tam.y, Math.round(tela.y * densidade));
    const razao = Math.max(aw / tam.x, ah / tam.y), amostrasFiltro = Math.max(1, Math.min(3, Math.ceil(razao)));
    tempos.aw = aw; tempos.ah = ah; tempos.ss = Number(razao.toFixed(3)); tempos.amostrasFiltro = amostrasFiltro * amostrasFiltro;
    tempos.densidade = densidade; tempos.dprEfetivo = dprEfetivo;
    atualizarQuinas();
    const usarVidro = !!alvoVidro && vidroNaTela(true);
    tempos.vidroVisivel = usarVidro; passe.uniforms.usarVidro.value = usarVidro;
    if (alvo.width !== aw || alvo.height !== ah) alvo.setSize(aw, ah);
    if (usarVidro && (alvoVidro.width !== aw || alvoVidro.height !== ah)) alvoVidro.setSize(aw, ah);
    passe.uniforms.tx.value.set(1 / aw, 1 / ah);
    // Pixels CSS -> texels do alvo; usa o DPR efetivo (que o motor pode limitar), não o global.
    const pesoCelular = Number(cfg.espessuraCelular);
    const espessura = cfg.espessura * (ehCelular ? (Number.isFinite(pesoCelular) ? Math.max(0, pesoCelular) : .75) : 1);
    passe.uniforms.esp.value.set(espessura * aw / tela.x, espessura * ah / tela.y);
    // A escala do alvo pode ser fracionária; a grade do filtro tem tamanho inteiro.
    // Dividir quatro amostras por 1.5² alteraria a cor e a cobertura das linhas.
    passe.uniforms.ss.value = amostrasFiltro; passe.uniforms.escala.value.set(aw / tam.x, ah / tam.y);
    const auto = renderer.shadowMap.autoUpdate, atualizar = renderer.shadowMap.needsUpdate, ac = renderer.autoClear;
    const anterior = renderer.getRenderTarget(), alfa = renderer.getClearAlpha(), fundo = scene.background;
    renderer.getClearColor(corLimpa);
    try {
      renderer.shadowMap.autoUpdate = false; renderer.shadowMap.needsUpdate = false; renderer.autoClear = false; scene.background = null;
      renderer.setClearColor(0x000000, 0);
      for (const entrada of malhas) { entrada.original = entrada.o.material; entrada.o.material = entrada.principal; }
      iniciar(1);
      try { renderer.setRenderTarget(alvo); renderer.clear(); renderer.render(scene, camera); } finally { terminar(1); }
      if (usarVidro) {
        for (const entrada of malhas) entrada.o.material = entrada.vidro;
        iniciar(2);
        try { renderer.setRenderTarget(alvoVidro); renderer.clear(); renderer.render(scene, camera); } finally { terminar(2); }
      }
    } finally {
      for (const entrada of malhas) entrada.o.material = entrada.original;
      scene.background = fundo; renderer.shadowMap.autoUpdate = auto; renderer.shadowMap.needsUpdate = atualizar; renderer.autoClear = ac;
      renderer.setRenderTarget(anterior); renderer.setClearColor(corLimpa, alfa);
    }
    passe.uniforms.mistura.value = mis;
    renderer.autoClear = false;
    iniciar(3);
    try {
      if (mis >= 1) renderer.clear();
      renderer.render(cena2, cam2);
    } finally { terminar(3); renderer.autoClear = ac; }
    acumular(cpu, quadro.valores);
    if (quadro.consultas && quadro.valido) pendentes.push(quadro);
    else {
      if (quadro.consultas) for (const q of quadro.consultas) if (q) apagar(q);
      tempos.fonte = 'cpu';
    }
    publicar();
  };
})();
renderizar = () => { BP(); if (typeof anotar === 'function') anotar(); };

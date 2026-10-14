/* Motor: arranque. O prop fornece construirPecas() (preenche G e adiciona as peças a raizG). O desenho só começa depois de as peças existirem. */
gsap.ticker.add(() => { if (sujo && window.pronto) { sujo = false; desenha(); } });
construirPecas().then(() => {
  if (CFG.sombras) raizG.traverse(o => { if (o.isMesh) { o.receiveShadow = true; o.castShadow = !(Array.isArray(o.material) ? o.material[0] : o.material).transparent; } }); prepararPartes(); window.pronto = true; rotulo(); tamanho(); construirTimeline(); });

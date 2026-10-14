/* Motor: painel de diagnóstico (fps, pior fps dos últimos 3 s, atualizações da cena, triângulos, chamadas de desenho, resolução) e tela de um toque.
   #sem-fps na URL esconde o painel. Aprove desempenho SEMPRE com este painel na página real rolando; uma sonda que anima por relógio não reproduz o scroll. */
const rotulo = () => {
  $('c-res').textContent = 'resolução: ' + (estado.res >= 3 ? 'nativa' : estado.res + 'x');
  $('c-suav').textContent = 'suavização: ' + (estado.suav === 0 ? 'nenhuma' : estado.suav + 's');
  $('c-res').classList.toggle('lig', estado.res !== 2); $('c-suav').classList.toggle('lig', estado.suav !== 0.6);
};
$('c-res').onclick = () => { estado.res = estado.res === 2 ? 1 : estado.res === 1 ? 3 : 2; rotulo(); tamanho(); };
$('c-suav').onclick = () => { estado.suav = estado.suav === 0.6 ? 0 : 0.6; rotulo(); construirTimeline(); };
if (location.hash === '#sem-fps') $('hud').hidden = true;

const amostras = []; let nq = 0, t0 = performance.now();
requestAnimationFrame(function laco(t) {
  nq++;
  if (t - t0 >= 500) {
    const seg = (t - t0) / 1000, fps = nq / seg; amostras.push(fps); if (amostras.length > 6) amostras.shift();
    $('hud-fps').textContent = Math.round(fps) + ' fps · pior 3s: ' + Math.round(Math.min(...amostras));
    const i = renderer.info.render;
    $('hud-info').textContent = `cena ${tl ? tl.time().toFixed(1) + '/' + tl.duration().toFixed(1) : '-'} · atualiz ${Math.round(nUpd / seg)}/s · ${i.triangles} triângulos · ${i.calls} chamadas\ntela ${palco.clientWidth}x${palco.clientHeight} · resolução ${renderer.getPixelRatio()}x`;
    if (EST.linhas > 0 && window.BP_TEMPOS) {
      const b = window.BP_TEMPOS; b.atualizar();
      $('hud-info').textContent += `\nBP ${b.fonte} ms · normal ${b.normal.toFixed(2)} · chapado ${b.chapado.toFixed(2)} · vidro ${b.vidro.toFixed(2)} · tela ${b.tela.toFixed(2)} · alvo ${b.aw}x${b.ah} · ss ${b.ss}`;
    }
    nq = 0; nUpd = 0; t0 = t;
  }
  requestAnimationFrame(laco);
});

/* tela de um toque: no iPhone o frame do Artefato roda a ~30 fps até o primeiro TOQUE (rolar não acorda); só o pointerup dispensa */
$('inicio').addEventListener('pointerup', () => { $('inicio').hidden = true; $('dica').hidden = false; }, { once: true });

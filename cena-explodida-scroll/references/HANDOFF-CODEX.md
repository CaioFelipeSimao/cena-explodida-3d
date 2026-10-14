# Handoff para o Codex (2026-10-03)

O usuário prefere trabalhar com o Claude delegando ao Codex. Este handoff apoia esse fluxo. Fale em português do Brasil, com frases curtas e claras, sem travessões longos. Siga o escopo autorizado pelo pedido atual. Ele testa no iPhone (app do Claude) e no PC.

## O projeto

Três skills irmãs em `C:\Users\ACER\.claude\skills\`:
- `cena-explodida-scroll`: motor WebGL (Three.js + GSAP ScrollTrigger) em `motor/`, props em `props/<nome>/`, `scripts/compor.cjs` junta tudo num HTML. Leia `SKILL.md` primeiro.
- `cena-blueprint-3d`: plugin de desenho técnico (`plugin/linhas.js`, `plugin/anotacoes.js`).
- `cena-explodida-interativa`: plugin de interação no fim da rolagem (`plugin/interacao.js`).

Props: `relogio` (plano, regressão), `relogio-arvore`, `nikon-f` (publicada), `dual-1019` (toca-discos, o teste final das 3 skills).

Pasta de trabalho e testes: `C:\Users\ACER\arsenal-scroll3d\` (repositório git; `testes/` com puppeteer-core; `testes/LEIA.md`). As fontes das skills NÃO estão em git.

## Regras que não se negociam

- Fonte da verdade são as fontes (props, motor, plugins), nunca o HTML composto. Se editar um HTML, leve a mudança para as fontes.
- Estilo próprio por objeto; toda peça é sólido com espessura; explosão sem oclusão (exceto as oclusões da lente da Nikon, aprovadas pelo usuário: não corrigir).
- Peça embutida nasce do contorno da mãe (`embutido()` em `motor/geometria.js`, campo `apoio`, teste `assentamento.mjs`).
- three.js desta versão NÃO tem `isShape`: use `instanceof THREE.Shape`.
- Não use `node -e` nem heredoc para textos com crases ou `${}`.

## Compor

```
cd C:\Users\ACER\.claude\skills\cena-explodida-scroll
node scripts/compor.cjs props/dual-1019 C:/Users/ACER/arsenal-scroll3d/dual-1019.html --plugin ../cena-blueprint-3d/plugin --plugin ../cena-explodida-interativa/plugin
node scripts/compor.cjs props/nikon-f C:/Users/ACER/arsenal-scroll3d/nikon-int-fontes.html --plugin ../cena-blueprint-3d/plugin --plugin ../cena-explodida-interativa/plugin
node scripts/compor.cjs props/relogio C:/Users/ACER/arsenal-scroll3d/relogio-motor-novo.html
```

## Bateria (rodar em `C:\Users\ACER\arsenal-scroll3d\testes`, caminhos relativos a `arsenal-scroll3d`)

```
node assentamento.mjs dual-1019.html
node cmp3d.mjs relogio-3d-do-motor.html relogio-motor-novo.html      (exigir 0 px)
node atos3d.mjs <html>
node oclusao.mjs <html> int
node interacao3d.mjs <html>
node escala-peca.mjs <html> [390 844]      (a pinça simulada por CDP é instável; a pinça real foi aprovada no iPhone)
node bpshots.mjs <html> <prefixo> 1280 800  (captura do blueprint)
```

Se o navegador headless travar no seu sandbox, peça ao usuário para rodar os testes no terminal dele e colar a saída. Abra as capturas antes de dizer que algo está bom.

## Publicação

O Codex não publica Artefatos do Claude. O usuário publica abrindo o HTML composto numa conversa do Claude, ou usa o arquivo local. Artefatos atuais: Nikon F (https://claude.ai/artifact/Kifex3PEmSivYTVTf5QPG2, v22) e Dual 1019 (https://claude.ai/artifact/LmSnvZkEekYPfwkU2ZFai4, v8).

## Estado em 2026-10-03

Feito e aprovado pelo usuário: fases 0 a 3, generalização dos plugins no relogio-arvore, temas azul e escuro, Dual 1019 (34 peças, 7 atos, blueprint, interação), zoom da peça agarrada (rodinha e pinça, 50% a 200%, volta a 1 ao soltar), linhas do blueprint com ângulo de quina, `soContorno`, hierarquia de traço e vidro, chapas embutidas no Dual.

## O que falta (opcional)

1. **Linhas desenhadas como vetor.** Só se o usuário decidir.
2. **Fontes das skills em git.** A pasta também contém outras skills do usuário.

## Fechamento 2026-10-03

Ajustes concluídos: Nikon na variação C, céu `['#efeeeb','#c2c5c8','#74787d','#3a3c40']` e cromo com `roughness: .5`. Blocos de cima encostados face a face, sem fresta, interpenetração ou chanfro na junção. Dual com teca calibrada pelo pixel renderizado contra a foto, tapete preto e alumínio. Limpeza parcial registrada em `_antigos`.

As três skills e o plano registram o Dual e as lições finais. Blueprint tem vidro, teto `densidadeMax`, pré-compilação, sombras congeladas na transição e painel BP com tempos. Peças transparentes são desenhadas uma vez só na interação.

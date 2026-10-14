# Plano de expansão: de 1 para 3 skills

Decidido com o usuário em 2026-09-30. Projeto fechado em 2026-10-03. O estado final abaixo prevalece sobre os registros históricos das fases. Comandos de composição em "Como retomar". O relógio de referência foi aprovado no iPhone: https://claude.ai/artifact/XUudh4a2V2dCLwzfyHRvJe.

## Estado final 2026-10-03

Fases 0 a 3 concluídas, com interação testada no iPhone. Plugins generalizados no `relogio-arvore`. Temas azul e escuro conferidos. Dual 1019 concluído: 34 peças, 7 atos, blueprint e interação.

Artefatos publicados: [Nikon F v22](https://claude.ai/artifact/Kifex3PEmSivYTVTf5QPG2) e [Dual 1019 v8](https://claude.ai/artifact/LmSnvZkEekYPfwkU2ZFai4).

Bateria atual em `C:/Users/ACER/arsenal-scroll3d/testes`: `assentamento.mjs`, `cmp3d.mjs`, `atos3d.mjs`, `oclusao.mjs`, `interacao3d.mjs`, `escala-peca.mjs` e `bpshots.mjs`. Exigir regressão 0 px no relógio plano. A pinça real foi aprovada no iPhone; sua simulação por CDP é instável. Neste fechamento, não rodar navegador.

Nikon: sombra/reflexo na variação C, céu `['#efeeeb','#c2c5c8','#74787d','#3a3c40']`, cromo com `roughness: .5` e blocos superiores encostados. Dual: teca calibrada pelo render, tapete preto e alumínio. Limpeza parcial em `_antigos`. Restam só dois opcionais: linhas como vetor e fontes das skills em git.

## As três skills

1. **`cena-explodida-scroll`** (esta, a base): motor WebGL + props + compor. Ganha peças em árvore e atos (Fase 1).
2. **`cena-blueprint-3d`** (Fase 2): o prop vira desenho de linhas técnicas durante a animação, como na home do animejs.
3. **`cena-explodida-interativa`** (Fase 3): duplo clique abre e fecha; arrastar move e gira peças; ao soltar voltam.

As duas novas dependem do motor desta e entram como **plugins** de `scripts/compor.cjs` (`--plugin <pasta>`, com `plugin.json` `{css[], html[], antes[], depois[]}`). Nomes escolhidos: `cena-blueprint-3d` e `cena-explodida-interativa`. Validação no próprio relógio reestruturado em árvore; um segundo prop entra depois, para provar que generaliza.

## Decisões do usuário (respostas literais resumidas)

- **Transição para linhas** (como no site): a tela vai de cinza-escuro a branca, as peças ficam brancas e os cantos viram linhas cinza. Acontece "na transição de processos", no meio da animação geral; não precisa separar as peças como um blueprint, mas pode.
- **Temas**: azul blueprint OU branco com linhas cinza. O usuário **escolhe na construção do projeto, e por trecho (ato)**. Um terceiro tema opcional é o escuro chapado do início do site (cinza-escuro, peças cinza, contorno fino, realce cor de pêssego).
- **Extras** (todos entram na skill como possibilidade, escolhidos por projeto): rótulos com ponto e linha-guia, cotas, fundo quadriculado, carimbo de projeto. Vistos no site: textos de seção, rótulos com linha que cresce, régua de progresso com marcador vermelho no canto.
- **Complexidade**: o prop pode se desmontar e remontar várias vezes, e um prop maior pode se abrir em partes menores em que uma delas se abre de novo ("boneca russa").
- **Interação**: duplo clique/toque abre o prop na pose explodida, sem girar a câmera (só se a pose exigir), outro fecha; só depois que a animação de scroll termina. Arrastar = **move e gira** (mover no plano da tela; um botão alterna para girar), volta ao lugar ao soltar. Duplo clique numa peça com filhas abre só aquela.

## Fase 1: peças em árvore e atos (no motor) — CONCLUÍDA e aprovada no iPhone em 2026-09-30 (https://claude.ai/artifact/2uRhmajdoEbjn7NCB5sJ95)

O que foi feito: ações combináveis (abrir, fechar, focar, voltar, camera, zoom) em vez de um tipo de ato fixo; saída de cena 'quadro' ou 'sumir' por prop; props sem ATOS rodam o código plano intocado (regressão 0 px); `partes.js` separado de `pecas.js` e `herda` no manifesto; teste `atos3d.mjs`. A especificação original abaixo fica como registro.

**Objetivo**: o motor descreve um prop como **árvore** e a animação como **lista de atos**, sem perder o modo plano de hoje.

Modelo proposto (ajuste ao implementar):

```js
// pecas.js
const arvore = { nome: 'relogio', filhos: [
  { nome: 'frontal',   filhos: ['bisel', 'vidro', 'mostrador', 'horas', 'minutos', 'segundos', 'pino'] },
  { nome: 'mecanismo', filhos: ['platina', 'gC', 'gA', 'gB'] },
  'caixa', 'tampa' ] };
// cada nó: m/e/d/ordem/r RELATIVOS ao pai; nó interno vira THREE.Group com as filhas dentro
const ATOS = [
  { id: 'abrir',   alvo: 'relogio',   acao: 'explodir', pose: 'e', duracao: 2.6 },
  { id: 'mecanismo', alvo: 'mecanismo', acao: 'explodir', pose: 'e2', duracao: 2 },
  { id: 'fecha-m', alvo: 'mecanismo', acao: 'remontar' },
  { id: 'fecha',   alvo: 'relogio',   acao: 'remontar' },
];
```

Regras de projeto:
- `G[nome]` e `P[nome]` existem para **todo nó** (grupos inclusive); `aplica()` percorre a árvore; quando o pai se move, os filhos vão junto.
- Um ato "explodir" leva os **filhos diretos do alvo** de `m` para `e` (e opcionalmente `d`) relativos ao pai; "remontar" volta para `m` literal. O estado final de cada remontagem é exatamente o `m` (mesma garantia de hoje).
- O campo `estilo` de cada ato fica reservado (valor usado na Fase 2 para o tema e a mistura de linhas).
- Pose de câmera por ato (hoje `POSES` global vira o caso de 1 ato); respiros e tempos por ato.
- **Compatibilidade**: o `partes` plano de hoje continua valendo: equivale a uma árvore de 1 nível e um ato `ciclo` (m→e→d→m com a câmera atual). O relógio plano tem que continuar **pixel-idêntico** (0 px nos 4 instantes do `cmp3d`).
- Verificação numérica por nó e por ato: depois de cada "remontar", todo nó do alvo está exatamente em `m`; nenhuma peça parada no meio.

Critérios de pronto: (a) regressão do relógio plano = 0 px; (b) relógio em árvore com 3 atos (abrir tudo, abrir o mecanismo, fechar tudo) com verificação numérica por ato e capturas de cada ato; (c) `compor.cjs` sem mudança de uso; (d) `references/` atualizado, SKILL.md com a seção de árvore e atos; (e) SkillSpector sem nada novo além do AE1 do `faces.js`.

**Respostas do usuário (2026-09-30, início da Fase 1)**: a história NÃO é fixa; varia por prop. O motor oferece ações combináveis em qualquer ordem e repetíveis: `abrir(nó)`, `fechar(nó)`, `focar(nó)` (câmera dá zoom no nó, as outras peças saem de cena), `voltar` (desfaz o foco); ações podem ser simultâneas. Exemplos dele: explode, volta, explode de novo e foca numa peça; explode e já foca e a peça explode; da primeira explosão saem duas sub-props que explodem cada uma. Saída de cena no foco: **as duas formas, escolhidas por prop** (sair do quadro/afastar para as bordas, ou sumir por transparência). Scroll cresce com os atos (ritmo de hoje). O relógio plano aprovado **convive** com o novo `props/relogio-arvore` (regressão 0 px). Demo do relógio: abrir(relógio) → focar(mecanismo) → abrir(mecanismo) → fechar(mecanismo) → voltar → fechar(relógio).

Perguntas para o usuário no início da Fase 1 (respondidas acima): que história os atos contam no relógio (quantos, em que ordem)? Quanto do scroll cada ato ocupa? O relógio em árvore substitui o plano como exemplo ou convivem?

## Fase 2: `cena-blueprint-3d` — CONSTRUÍDA em 2026-10-01 (falta o iPhone)

**Decisão do usuário**: é **opcional por projeto** (plugin; só entra quando pedido). Na Nikon: blueprint tema papel na primeira explosão, volta ao 3D no foco da lente; rótulos nas 7 peças principais, duas cotas e carimbo; sem quadriculado nem régua. Skill em `~/.claude/skills/cena-blueprint-3d` (plugin/ linhas.js anotacoes.js blueprint.css plugin.json). Motor ganhou `renderizar` trocável e `ato.estilo` animado em `EST`. Publicado: https://claude.ai/artifact/Kifex3PEmSivYTVTf5QPG2 (versão 8). Abaixo, a especificação original.


Como o animejs faz (lido em home.js e visto no Chrome do usuário): renderiza a cena num alvo de render com um **material chapado** (cor por peça misturada com a normal, profundidade no alfa) em resolução alta (eles usam 4x), depois um **passe de tela cheia** faz detecção de borda (Roberts cross sobre a diferença de cor entre pixels vizinhos, limiar ~.035) e desenha o contorno. Uniformes: `outlineColor, backgroundColor, rimColor, shadowColor, worldColor`, e `sourceMix, effectMix, backgroundMix` para misturar o realista e o de linhas (**animável**). Cores vêm de variáveis CSS, com versão clara e escura.

Plano: plugin `passe-linhas` (alvo de render, material de contorno por `scene.overrideMaterial`, passe de borda com profundidade + normal + id da peça para silhuetas nítidas, `mistura` 0..1 animada pela timeline por ato); temas como objetos de paleta (azul blueprint, papel cinza, escuro chapado); extras como plugin `anotacoes` (SVG/DOM sobre o canvas, âncoras projetadas por quadro: rótulos com ponto e linha que cresce, cotas, grade, carimbo, régua de progresso). **Risco principal: custo da passada extra no iPhone**; medir com o painel de fps e ter níveis de resolução do alvo (1x, 1.5x, 2x); quando a mistura é 0, renderizar direto (sem custo extra). `WebGLMultisampleRenderTarget` existe na r128.

## Fase 3: `cena-explodida-interativa` — CONSTRUÍDA em 2026-10-01 (falta o iPhone)

**Decisões do usuário**: opcional por projeto (plugin); liga no fim da rolagem com o prop montado. Na Nikon: dois toques abrem como a primeira explosão (Photomic, tampas e costas abertos); dali, arrastar peças individuais (mover e girar, com botão), dois toques na lente abrem ou fecham só ela (o resto fica na tela), dois toques no resto fecham; arrastar o fundo não faz nada. Skill em `~/.claude/skills/cena-explodida-interativa`; o motor ganhou `depoisAplica`. Publicado: https://claude.ai/artifact/Kifex3PEmSivYTVTf5QPG2 (versão 10). Abaixo, a especificação original.


Plugin `interacao`: máquina de estados `montado ⇄ aberto` (+ `arrastando`); `Raycaster` mapeia malha para nó; duplo clique (`dblclick`) e duplo toque (dois `pointerup` em <300 ms e <20 px, com `touch-action: manipulation`); aberto = tween para a pose `e` do nó sem mexer na câmera; trava a rolagem enquanto aberto (`overflow: hidden` + `touch-action: none` no canvas) para o arrasto não brigar com ela; arrastar move no plano da tela na profundidade da peça, botão alterna para girar (trackball); ao soltar volta à pose aberta (mola/ease); duplo clique numa peça com filhas abre só aquela (boneca russa); duplo clique no fundo fecha o último nível. Só habilita depois do fim da animação de scroll (manter o prop preso num trecho final com a interação ligada).

## Ordem e critérios de cada fase

Fase 1 → 2 → 3, cada uma termina com um Artefato para o usuário testar no iPhone antes de seguir ("pode"). Depois de cada skill nova: descrição que dispara sozinha, exemplo publicado, varredura do SkillSpector, conferência de que a skill aparece carregada numa sessão nova.

## Modelo recomendado

Fase 0 foi feita com Sonnet 5.5. Para as Fases 1 a 3 recomendado Opus 5.5 (ou Fable 5.1): arquitetura de árvore e atos, shader de contorno, máquina de gestos e depuração sem poder medir o iPhone. Trocar com `/model` antes de começar; planejar cada fase em modo plano cai no Opus na configuração atual do usuário.


## Como retomar (escrito em 2026-10-01; atualizado em 2026-10-02)

**A lista de tarefas para a próxima sessão está em `references/todo.md`: liste-a ao usuário logo no começo (pedido dele).**

**Atualização de 2026-10-02**: o usuário editou a Nikon numa sessão com o **Codex**, direto no `nikon-int.html`. Eu comparei esse HTML com o que as fontes geram e **levei todas as mudanças para as fontes** (agora `nikon-int-fontes.html`, gerado das fontes, é equivalente ao `nikon-int.html`; sobram só comentários e a ordem de uma linha). O que o Codex mudou:
- `pecas.js`: sem a faixa preta da base do Photomic; comentário de que a posição montada da trava (6) é a do blueprint.
- `partes.js`: `travaFrontal.e.x = -6.5` (sai de cima da placa "F Nikon"), `celula.e = { y: 116, x: -64 }`.
- `config.js`: `ajustesAbertura: { travaFrontal: { y: 22 }, visorEsportivo: { y: 30 } }` (só na explosão por dois toques, volta ao fechar) e a lente aberta com outros valores: giro 15 (era 45), espalhar 1,3 (era 1,8), zoom 0,75 (era 0,55), `afastar.x = -150` (era 0).
- `cena-explodida-interativa/plugin/interacao.js`: `ajustesAbertura`; **sem a flutuação `d`** depois de abrir (pedido do usuário, 2026-10-02); a peça agarrada desenha por cima das outras (camada 1) durante o arrasto e a volta.
- `motor/base.css`: painel de fps (`.hud`) compacto no canto superior esquerdo, só do tamanho dos dados.

**Conferência de deriva de 2026-10-03**: `nikon-int.html` (gravado 2026-10-02 16:56) ficou igual às fontes (diff só com o invólucro, comentários e a ordem de uma linha `keyup`), e o artefato publicado (v19) é igual às fontes. Nenhuma edição nova do Codex desde as da seção acima. Das duas mudanças que o usuário disse ter feito: (a) **posição de 2 peças ao explodir** = `CFG.interativo.ajustesAbertura = { travaFrontal: { y: 22 }, visorEsportivo: { y: 30 } }` em `props/nikon-f/config.js` (deslocamento extra, em mm do sistema da peça, aplicado só na explosão por dois toques e desfeito ao fechar; implementado em `cena-explodida-interativa/plugin/interacao.js`; mais `travaFrontal.e.x = -6.5` em `partes.js` para a pose do ato de abertura); (b) **interação de luz e sombra com peças em movimento**: NÃO está no HTML local, nem no publicado, nem nas fontes (nada mexe em luz, `sombras` ou `shadowMap` além do que já existia: as peças projetam sombra umas nas outras via `CFG.sombras`, mapa 2048, e a peça agarrada desenha na camada 1). Se o usuário a fez, está noutro arquivo ou não foi salva: pedir o arquivo antes de implementar.

**Revisão dessas mudanças (2026-10-02, `oclusao.mjs`)**: interação, atos e regressão do relógio (0 px) passam. **Duas regressões da regra "sem oclusão"**, que o usuário ainda não viu: (a) lente aberta por dois toques: a tampa esquerda (41) fica 89% atrás da lente no desktop (67% no celular), a base e a porta dos acessórios ficam atrás do anel frontal, e há anéis cobrindo anéis (16 a 31%); (b) ato 1 (t = 3): a célula do Photomic cobre 7 a 9% da tampa direita. Os valores antigos da lente (45°, 1,8, 0,55, x 0) davam zero. Não desfiz nada. **Decisão do usuário (2026-10-02): para a Nikon esse caso está aprovado, as oclusões foram escolhidas à mão por ele.** É uma exceção dele para esse prop; a regra "oclusão zero" continua valendo para os outros props e para qualquer vista que ele não tenha escolhido. Quem rodar `oclusao.mjs` na Nikon vai ver esses achados: não são defeito.

**Projeto vivo**: a Nikon F Photomic, publicada em https://claude.ai/artifact/Kifex3PEmSivYTVTf5QPG2 (**versão 19, publicada em 2026-10-02 com as mudanças do Codex**; a versão que estava no ar antes era uma etapa intermediária dessas mesmas edições). Para atualizar esse mesmo link numa sessão nova, publique com `url` igual a ele (o Artefato exige ler antes: `action: "read"` com essa url). Composição (com os dois plugins):

```
cd ~/.claude/skills/cena-explodida-scroll
node scripts/compor.cjs props/nikon-f C:/Users/ACER/arsenal-scroll3d/nikon-int-fontes.html --plugin ../cena-blueprint-3d/plugin --plugin ../cena-explodida-interativa/plugin
```

Sem `--plugin` sai a Nikon só realista. **Fonte da verdade são as fontes** (props, motor, plugins), nunca o HTML: se o usuário editar o HTML ou usar outra ferramenta, compare antes de continuar (`compor.cjs ... nikon-int-fontes.html` e `diff nikon-int-fontes.html nikon-int.html`; ignore o invólucro `<!doctype>` no começo e o `</body></html>` no fim, que vêm do Artefato) e leve as diferenças para as fontes, senão a próxima composição as perde.

**O que já está decidido (não reabrir)**: blueprint só na primeira explosão, tema papel, rótulos nas 7 peças principais + 2 cotas + carimbo, sem rótulos nas outras 45; anotações aparecem só na metade da transição; interação só no fim da rolagem; dois toques abrem com a MESMA explosão do ato 1 (espelhada pela vista, sem flutuação); subconjunto fechado arrasta inteiro; girar por Shift / botão direito / dois dedos (sem botão); volta suave sem mola; trocar de giro para mover desliza, não pula; prop montado também se arrasta e gira.

**Regras de qualidade que o usuário exige (todas registradas nas skills)**: sem oclusão nem peça fora do quadro em nenhuma vista explodida (`oclusao.mjs`); sem texto sobre peça/texto e sem faces coincidentes (`sobreposicao.mjs`); sem tranco (`sonda-vel.mjs`); regressão do relógio 0 px (`cmp3d.mjs`); verificação por ato (`atos3d.mjs`); interação (`interacao3d.mjs`).

**Armadilha recorrente desta sessão**: editar arquivos com `node -e "..."` ou heredoc no Bash come as crases (\`) e os `${}` (vira substituição de comando). Para texto com crases ou template strings, use a ferramenta Write/Edit, ou um script .cjs gravado com Write. Desktop e 390 x 844 sempre.

**Pendências históricas resolvidas em 2026-10-03**: Fase 3 testada no iPhone, sombra/reflexo calibrados e blocos superiores da Nikon encostados. As duas oclusões da Nikon continuam aprovadas pelo usuário. O estado final e os opcionais estão no topo.

## Teste final das 3 skills: Dual 1019 (2026-10-03)

Terceiro prop WebGL (`props/dual-1019`, ficha aprovada), feito para exercitar tudo: árvore com 8 subconjuntos e 34 peças, 7 atos, saída `'quadro'`, blueprint no ato 1, interação com dois subconjuntos. Composição:

```
node scripts/compor.cjs props/dual-1019 C:/Users/ACER/arsenal-scroll3d/dual-1019.html --plugin ../cena-blueprint-3d/plugin --plugin ../cena-explodida-interativa/plugin
```

**O que estava preso aos props anteriores e mudou (genérico):**

1. **Peça só girava em Z** (`aplica()` fazia `rotation.set(0, 0, rotZ)`): servia ao relógio e à Nikon, que giram de frente para a câmera; um objeto deitado precisa de `rotationX` (tampa na dobradiça) e `rotationY` (prato). Agora a peça gira nos três eixos com o sinal do conjunto. Props antigos não usam X/Y: relógio plano continua 0 px.
2. **`r` só em `rotationZ`**: novo campo `eixo` por peça (`'rotationY'` no prato); `sem(o, eixo)` tira o eixo certo dos tweens.
3. **Não havia giro contínuo**: `r` só gira enquanto o pai está aberto. Novo campo `voltas: n` (árvore e atos): a peça gira a rolagem toda (power1.inOut), montada ou aberta, e termina em m + 360·n. Não combine com `r`.
4. **Grupos sempre na origem do pai** (Nikon): girar a tampa na dobradiça ou o prato no eixo pede grupo com pivô próprio. Os ajudantes de "prop desenhado no lugar" (em, deCima, deFrente, deLado, eixoY, discoY, solido, peca) viviam só no `pecas.js` da Nikon; agora estão no motor em `montagem(U, Y0)`, com `pivos(grupos)` que calcula o m de todo nó a partir dos pivôs (folhas e grupos) e soma e/d. A Nikon segue com as cópias dela (não mexi; regressão zero).
5. **Sinal do `rotationX` da câmera**: positivo mostra o objeto **por baixo**. Na Nikon e no relógio (10°, de frente) isso não aparecia; num toca-discos visto de cima é preciso `rotationX` negativo (-16 a -26). Registrado em `arvore-atos.md`.
6. **Blueprint**: rótulo e cota presos a uma peça que gira (`voltas`) davam a volta com ela; agora o ponto fica no lugar da peça, sem o giro (`anotacoes.js`).
7. **Interação**: os dois toques só levavam a posição de e − m (e o giro `r` em Z); a tampa abria sem tombar. Agora também o giro da pose e (`rotationX/Y/Z`, menos o eixo de quem gira), e o giro `r` respeita `eixo`.
8. **Testes**: `atos3d.mjs` compara todo eixo de giro módulo 360 e ignora o eixo das peças com `voltas` no meio da rolagem; `oclusao.mjs` não conta, no modo `'quadro'`, as peças que estão saindo de cena (antes davam "sai do quadro"/"fundo?") e acusa as que deviam ter saído e ainda aparecem (achou o seletor de velocidade no celular); `interacao3d.mjs` testa **todos** os subconjuntos (antes só o primeiro) e mede o nó que realmente se arrasta (peça de grupo fechado: o grupo).

**Armadilhas desta sessão**: um `//` no meio de uma linha com vários comandos engoliu o resto dela no `interacao.js` (erro "Unexpected end of input" só no HTML composto: confira com `node --check` no plugin); no foco com `'quadro'`, `fora` tem de tirar a peça do quadro também em 390 x 844 (alto e estreito: 900 não bastou para o seletor de velocidade, foi para 1300).

Fechamento 2026-10-03: Dual publicado na v8. Vidro no blueprint preserva as peças e linhas atrás dele. Zoom da peça agarrada de 50 a 200%, por rodinha e pinça. Peças transparentes desenhadas uma vez só na interação. O gargalo do blueprint é preenchimento na GPU: teto `densidadeMax`, pré-compilação, sombras congeladas na transição e painel BP com tempos. O fps final das otimizações não está quantificado neste registro.

Lições de geometria e materiais: conferir medidas da ficha contra fotos antes de desenhar. Peça embutida nasce do contorno da mãe, com `embutido()`, `apoio` e `assentamento.mjs`. Blocos vizinhos encostam face a face, sem fresta, interpenetração ou chanfro na junção. Em Three r128, usar `instanceof THREE.Shape`, pois não há `isShape`. Calibrar cor pelo pixel renderizado contra a amostra da foto. Detalhes em `referencias.md`, `caminho-webgl.md` e `desempenho-iphone.md`.

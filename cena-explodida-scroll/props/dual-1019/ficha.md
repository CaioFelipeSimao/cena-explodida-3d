# Ficha: toca-discos Dual 1019 em gabinete Grundig (aprovada em 2026-10-03)

Terceiro prop WebGL, feito do zero pelo fluxo de `references/referencias.md` (caso "objeto real, trabalho específico": fotos + esquema explodido).

## 1. Origem

| Arquivo em `ref/` | Uso |
|---|---|
| `esquema-explodido-fig21.jpg` | Manual de serviço Dual, "Fig. 21 Explosionsdarstellung, Teile über der Platine" (direitos reservados: **só consulta, nunca publicado**). Lista das 84 peças acima da platina, sub-conjuntos e eixos de saída. |
| `esquema-didatico.jpg` | Esquema didático colorido (toca-discos genérico). Lógica do que fica embaixo da platina (motor, polia) e nomes em inglês para os rótulos do blueprint. Não serve para medir. |
| `estilo-linhas-ia.webp` | Desenho de linhas gerado por IA (textos embaralhados, marca d'água). **Só alvo visual do blueprint**; nada de geometria nem nomes. |
| `foto-sem-tampa-3q.jpg` | Principal: prato, tapete, braço, painel, seletor, gabinete, em 3/4 sem tampa. Amostras de cor. |
| `foto-tampa-aberta.jpg` | Tampa erguida: espessura do acrílico, dobradiças atrás, proporção do gabinete. |
| `foto-baixo-cromada.jpg`, `foto-baixo-gabinete.jpg`, `foto-baixo-detalhe.jpg` | Por baixo da platina (outro exemplar e o 1019): motor, engrenagem translúcida do trocador, alavancas estampadas, tampa triangular, amortecedor. Base do mecanismo de baixo. |
| `foto-tampa-3q-esq.jpg`, `foto-tampa-3q-dir.jpg` | Tampa fechada: cor do acrílico fumê, emblema no topo, emblema GRUNDIG, cabos atrás. |

Legenda: **[m]** medido, **[e]** estimado por proporção a partir do prato, **[esq]** forma lida do esquema, **[s]** suposição (não aparece em nenhuma referência).

## 2. Estilo (regra 1)

- **Mundo do objeto**: Dual 1019, toca-discos trocador automático alemão (Dual, St. Georgen, Floresta Negra, 1966–69), num gabinete de teca da Grundig com tampa de acrílico fumê. Aparelho de sala de estar, alta fidelidade de catálogo, não de estúdio.
- **Materiais**: teca envernizada (moldura do gabinete), laminado preto fosco (base), chapa de aço com pintura preto-café (platina), alumínio escovado (prato, painel de comando, tubo do braço, escalas), borracha preta com sulcos (tapete), plástico preto (cabeçote, contrapeso, botões), acrílico fumê translúcido (tampa), aço cromado (eixo central, parafusos de transporte), latão (eixo do motor e buchas, só no mecanismo).
- **Paleta** (amostras das fotos): teca `#c57f41` e teca na sombra `#ad7354`, platina `#1f1411`, alumínio do prato `#cdcdcf` e do painel `#aeaead`, borracha `#3b3937`, plástico do contrapeso `#636365`, acrílico fumê sobre a teca `#807773`. Acento único: o azul do selo "S" da platina [e].
- **Tipografia e textos**: gravações sans grotesca alemã, pretas no alumínio e brancas no preto. Textos da peça: "Dual 1019" no painel, "manual · stop · start", tamanhos 17 · 25 · 30, velocidades 16 · 33 · 45 · 78, escala do antiskating 0–6, "GRUNDIG" no emblema da base. Logotipos redesenhados como gravação, nunca imagem.
- **Fundo**: branco frio `#f2f2f4` (o das fotos), para a teca e o preto aparecerem.

## 3. Escala

1 mm = 0,8 unidade, para o gabinete ficar perto dos ~330 de largura do relógio e da Nikon e as poses de câmera servirem de ponto de partida.

| Medida | mm | unidades |
|---|---|---|
| Diâmetro do prato | ~270 [e] (lembrança do catálogo, a confirmar; é a medida-base) | 216 |
| Platina Dual 1019 | ~330 × 275 [e] | 264 × 220 |
| Gabinete Grundig (largura × fundo × altura) | ~420 × 360 × 95 [e] | 336 × 288 × 76 |
| Tampa de acrílico (altura) | ~140 [e] | 112 |
| Espessura do acrílico | ~3 [e] | 2,4 |
| Braço (pivô até a agulha) | ~220 [e] | 176 |

## 4. Árvore de peças

Cerca de 40 malhas (contra 75 da Nikon). Número do esquema entre parênteses.

```
dual1019
├─ tampa                                 acrílico fumê, sai para cima e gira para trás nas dobradiças
│  ├─ caixa-acrilico                     5 faces com espessura e cantos vivos · extrudar
│  ├─ emblema-topo                       quadrado preto com escudo · extrudar
│  └─ dobradicas ×2                      aço preto, atrás [e]
├─ prato-conjunto                        sobe no eixo; gira 33⅓ ao longo da rolagem
│  ├─ eixo-central      (19, 3, 4)       cromo, com a cabeça de encaixe · torno
│  ├─ tapete            (5)              borracha com sulcos concêntricos e o anel de alumínio · torno + textura
│  ├─ prato             (6)              alumínio fundido, aba escovada, nervuras por baixo · torno
│  └─ roda-intermediaria [s]             roda de borracha que leva o giro do motor ao prato · disco
├─ braco                                 sai para cima e para a direita; abre de novo
│  ├─ tubo              (37)             alumínio · tubo
│  ├─ cabecote          (38–44)          plástico preto com levantador · extrudar
│  ├─ capsula + agulha  (43, 44)         · extrudar
│  ├─ contrapeso        (51, 52)         plástico preto serrilhado · torno
│  ├─ cardan            (58–62)          suporte em U, aço · extrudar
│  └─ base-antiskating  (63–68)          anel com escala 0–6 · torno
├─ comandos
│  ├─ painel            (81)             chapa de alumínio com "Dual 1019" e escalas · extrudar
│  ├─ alavanca-start    (82)             · extrudar
│  ├─ seletor-tamanho   (75–77)          17 · 25 · 30 · extrudar
│  ├─ seletor-velocidade (7–14)          botão com escala 16–78 e alavanca de ajuste fino · torno + extrudar
│  └─ descanso-braco    (45–47)          coluna com apoio · tubo
├─ platina              (15)             chapa preta com recorte do prato, furos, selo "S" · placa
│  ├─ parafusos-transporte (16, 84) ×2   cromo · torno
│  └─ suspensao         (26–36) ×3       mola + bucha embaixo · tubo
├─ mecanismo-baixo [s]                   embaixo da platina; só aparece na explosão
│  ├─ motor             [s]              cilindro com polia escalonada · torno
│  └─ engrenagem-trocador [s]            disco dentado · engrenagem
└─ gabinete
   ├─ moldura-teca                       caixa de teca sem tampo, borda levantada · extrudar
   ├─ base-preta                         laminado preto · extrudar
   └─ emblema-grundig                    plaquinha de alumínio · extrudar
```

**Fora**: os cabos (fio de força e cabo DIN) e o eixo trocador alto (1, 2), que no esquema aparecem soltos. Ver decisões em aberto.

## 5. História (atos), proposta

1. **Abertura geral.** A tampa sobe e gira para trás; o prato-conjunto sobe pelo eixo com as peças em pilha (tapete, prato, roda); o braço sai para cima e para a direita; a platina se afasta do gabinete; o mecanismo de baixo aparece entre a platina e a base.
2. **Foco no braço.** O braço se abre: contrapeso para trás, cabeçote e cápsula para a frente, cardan para cima.
3. **Volta e foco no prato.** O braço se fecha e o prato-conjunto se abre de perfil (eixo, tapete, prato, roda), mostrando as nervuras por baixo.
4. **Remontagem.** Tudo volta ao encaixe; o prato gira o tempo todo a 33⅓, um movimento vivo que dá a ideia de aparelho ligado.

Blueprint (se ligado): o ato 1 em desenho técnico, como na Nikon, com rótulos em inglês tirados do esquema didático (Platter, Tonearm, Counterweight, Cartridge, Speed selector, Dust cover). Interação no fim: dois toques abrem, o braço e o prato como subconjuntos.

## 6. Decisões do usuário (2026-10-03, ficha aprovada)

Objetivo declarado: este prop é o teste final das 3 skills (base, blueprint, interativa) antes de aplicá-las em projetos reais; tem que exercitar tudo.

1. **Mecanismo de baixo: incluir**, inventando o que faltar, guiado por `ref/foto-baixo-*.jpg`: motor cilíndrico preto grande com polia escalonada (canto traseiro direito), tampa triangular preta do interruptor, engrenagem grande translúcida do ciclo do trocador (centro), alavancas de aço estampado prateadas cruzando a platina, cilindro cromado do amortecedor do levantador, molas e buchas de suspensão. Platina por baixo preta (como no gabinete), com o recorte circular do prato estampado. A roda intermediária fica entre a polia do motor e a borda interna do prato.
2. **Cabos: fora.**
3. **Eixo trocador alto: fora.**
4. **Disco de vinil: incluir** (preto, sulcos, selo central), em cima do tapete; sai primeiro na abertura.
5. **Plugins: blueprint e interação, os dois.** Testar tudo.

## 7. Estado (2026-10-03, construído)

Construído e verificado; ainda **não visto pelo usuário nem medido no iPhone**. HTML: `C:\Users\ACER\arsenal-scroll3d\dual-1019.html` (com os dois plugins). Capturas em `arsenal-scroll3d/testes/dual/`.

- **34 peças (folhas) em 8 subconjuntos, 41 nós, 7 atos**: abre (desenho técnico) · foca-braco (abre o braço) · fecha-braco · foca-prato (abre o prato de perfil) · gira-prato (a câmera passa por baixo: as nervuras) · fecha-prato · fecha. 19,98 unidades de timeline (~1160% de rolagem). Saída de cena `'quadro'` (a Nikon usa `'sumir'`; as duas passam no `atos3d`).
- **Prato ligado**: disco, eixo, tapete e prato com `voltas: -6` em `rotationY` (horário visto de cima), a roda intermediária com -40; giram a rolagem toda, montados ou abertos.
- **Tampa**: grupo com pivô na dobradiça; abre subindo e tombando 24° (`rotationX` da peça, novo no motor).
- **Medidas mudadas depois de olhar as fotos** (as da seção 3 eram estimativa): platina 370 x 300 (era 330 x 275) e gabinete 480 x 390 x 110 (era 420 x 360 x 95); a proporção prato/platina/gabinete das fotos (0,72 e 0,55) não fechava com as antigas. Prato Ø 270 mantido.
- **Disco**: compacto de 17 cm (selo creme, "Schwarzwald-Platte", inventado), para o anel de alumínio do tapete continuar à vista como nas fotos; um LP de 30 cm cobriria o prato inteiro. Trocar é só o raio em `pecas.js`.
- Mecanismo de baixo inventado a partir das fotos: motor preto com aletas e polia escalonada de latão (sobe por dentro da saia do prato), engrenagem translúcida do trocador com came, três alavancas de chapa estampada com rebites e mola, tampa triangular do interruptor, amortecedor cromado; suspensão de 3 pontos (mola + bucha).
- Rótulos do blueprint em inglês (Dust cover, Record, Platter, Tonearm, Counterweight, Speed selector, Motor), cotas Ø 270 mm e 480 mm, carimbo.
- Interação: `abrir: ['dual1019']`, subconjuntos braço e prato; o prato aberto à mão vai para o lado livre da vista do fim (`afastar { x: -230, z: -110 }`, `espalhar 1.8`, `zoomAoAbrir .45`).

Bateria (desktop 900 x 800 e 390 x 844): `testes/dual/bateria3.txt` (regressões em `bateria2.txt`). Oclusão zero em todas as vistas explodidas (ato 1, deriva, focos, dois toques, braço e prato abertos à mão).

Abaixo do ideal: `sobreposicao.mjs` ainda acusa 7 px entre a parede e o tampo da moldura em 390 x 844 no ato 1 (junção côncava vista rasante e pequena; tirar o bisel não mudou); o fundo do tapete sai quase preto na vista de baixo; o desenho técnico pinta o acrílico como sólido branco (o passe de linhas não sabe de transparência); a luz é de estúdio genérico, sem o contraste das fotos; teca procedural, não fotografada.

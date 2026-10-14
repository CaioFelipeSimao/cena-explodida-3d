# Ficha: Nikon F Photomic (aprovada em 2026-10-01)

Estado (2026-10-01, fim da sessão): **publicada na versão 12** (https://claude.ai/artifact/Kifex3PEmSivYTVTf5QPG2) com os plugins blueprint (primeira explosão em desenho técnico) e interativo (dois toques, arrastar, girar no fim da rolagem). 70 folhas em 13 subconjuntos, 11 atos. As poses e/d de várias peças foram ajustadas para zero oclusão nas duas vistas (ato 1 e explosão por dois toques); não mexa nelas sem rodar `oclusao.mjs` de novo. Pendências em `references/plano-expansao.md` (Como retomar).

**Atualização de 2026-10-02**: o usuário editou a Nikon numa sessão com o Codex e as mudanças foram levadas para as fontes: sem a faixa preta da base do Photomic; `travaFrontal` e `celula` com novas poses de explosão; na explosão por dois toques, `ajustesAbertura` (trava y 22, visor esportivo y 30) e a lente aberta com giro 15, espalhar 1,3, zoom 0,75, afastar x -150. A revisão com `oclusao.mjs` achou oclusões (lente aberta cobrindo a tampa esquerda; célula cobrindo 7 a 9% da tampa direita no ato 1): **o usuário aprovou, foram escolhas dele**; não são defeito nem devem ser "corrigidas". Publicada na versão 19 em 2026-10-02.

## 1. Origem

| Arquivo em `ref/` | Uso |
|---|---|
| `esquema-explodido.webp` | Esquema explodido de manual (Le Hedan / Phot'Argus, direitos reservados: **só consulta, nunca publicado**). Lista das 58 peças, sub-conjuntos, eixos de saída e forma das peças internas. |
| `foto-photomic-3q.png` | O visor Photomic montado: volume, proporção, acabamento. |
| `foto-frente.png` | Proporções de frente do corpo, da lente e dos botões (o visor nessa foto é o prisma simples e é ignorado). |
| `foto-costas.webp` | Verso: ocular, couro granulado, borda do fundo cromada com 3 rebites, botões de cima. |
| `foto-fundo.png` | Vista de baixo: chave OPEN/LOCK das costas, rosca de tripé, lembrete de ASA, "MADE IN JAPAN". |

Legenda: **[m]** medido na foto, **[e]** estimado por proporção, **[esq]** forma lida do esquema (peça interna, sem foto), **[s]** suposição (não aparece em nenhuma referência).

## 2. Estilo (regra 1)

- **Mundo do objeto**: Nikon F com visor Photomic, Nippon Kogaku, Tóquio, por volta de 1962–65. É a SLR profissional de sistema, câmera de fotojornalista: robusta, usinada, sem plástico.
- **Materiais**: latão cromado acetinado (tampas, visor, fundo, botões), couro sintético preto granulado, alumínio anodizado preto (corpo da lente, anéis), vidro óptico com tratamento âmbar, espelho de vidro prateado, cortinas do obturador em folha de titânio, aço e latão nu (eixos, molas, engrenagens, platinas do mecanismo).
- **Paleta**: cromo `#d9dbdc` e sombra do cromo `#8e9295`, couro `#1c1c1d`, anodizado `#0f1011`, titânio `#8a877f`, latão nu do mecanismo `#a88a52`, tratamento da lente `#b4893a`. Acento único: o vermelho do índice do ASA, `#c8322a`.
- **Tipografia e textos**: gravações em sans geométrica fina, pintadas em branco no preto e em preto no cromo. O "F" do visor é serifado. Os textos são os da peça: "Nikon", "F", "Nippon Kogaku Japan", "MADE IN JAPAN", "OPEN / LOCK", a escala de velocidades 1–1000, o ASA 10–1600, a escala de distâncias e as aberturas 1.4–16. O logotipo é redesenhado como gravação e não vem de nenhum arquivo de imagem.
- **Fundo**: cinza-claro quente `#ecebe8` (o das fotos), para o cromo e o preto aparecerem.

## 3. Escala

1 mm = 2 unidades. A câmera com Photomic tem cerca de 294 unidades de largura, perto dos 330 do relógio, então as poses de câmera atuais servem de ponto de partida.

| Medida | mm |
|---|---|
| Largura do corpo | 147 [m] |
| Altura do corpo sem o visor | ~80 [e] |
| Altura com o Photomic | ~106 [e] (foto em 3/4) |
| Largura do Photomic | ~75 [e] (foto em 3/4) |
| Profundidade do corpo (sem lente) | ~36 [e] (foto de baixo, ±10%) |
| Faixa cromada inferior | ~8 [m] |
| Encaixe da lente (baioneta F) | 44 de diâmetro interno, 46,5 de distância de registro |
| Lente Nikkor-S Auto 50/1.4 | ~62 de diâmetro × ~47 de comprimento [e] |
| Janela do filme | 24 × 36 |

## 4. Árvore de peças

As **58 peças do esquema** (número entre parênteses), mais as sub-peças dos conjuntos que se abrem de novo: o Photomic (1), a lente (58) e o obturador (26). São cerca de 75 malhas no total.

```
nikonF
├─ photomic  (1)                         sai para cima; ao voltar, o garfo encaixa no seletor de velocidades
│  ├─ carcaca-photomic                   cromo com "F" e "Nikon", janela do ponteiro · extrudar com chanfros
│  ├─ seletor-asa        (2)             serrilhado, ASA 10–1600, índice vermelho · tubo
│  ├─ seletor-acoplado   (3)             o garfo que abraça o seletor de velocidades · tubo + extrudar
│  ├─ botao-bateria      (4)             · disco
│  ├─ escala-velocidades (5)             · tubo fino gravado
│  ├─ trava-frontal      (6)             · extrudar
│  ├─ pentaprisma        [s]             vidro meio transparente · extrudar em "casa"
│  ├─ celula-ponteiro    [s]             galvanômetro com ponteiro · disco + extrudar
│  └─ ocular             [m]             quadrada, anodizada · extrudar + tubo
├─ tampa-direita  (10)                   cromo; sai para cima, levando o lado do avanço
│  ├─ capa-contador      (7) · mecanismo-debreagem (8) · alavanca-avanco (9) · seletor-velocidades (11)
│  └─ indicador-20-36    (12) · contador (13) · disparador (14) · avanco-contador (15)
├─ tampa-esquerda  (41)                  cromo; sai para cima, levando o lado da rebobinagem
│  └─ manivela-rebobinar (37)
├─ lente  (58)                           Nikkor-S Auto 50/1.4; sai para a frente
│  ├─ anel-frontal · anel-foco (serrilhado, distâncias) · anel-abertura (1.4–16 + orelha de coelho)
│  └─ vidros ×3 [s] (tratamento âmbar) · baioneta (3 garras)
├─ corpo  (24)                           chassi fundido com couro na frente
│  ├─ camara-reflexa  (50)               caixa do espelho com plaqueta "Nikon" e a boca da baioneta
│  │  └─ despolido (51) · espelho (57, sobe 45° ao abrir) · trava-espelho (54)
│  ├─ frente                             botões e alavancas da frente
│  │  └─ trava-lente (52) · preselecao (53) · temporizador (55) · alavanca-temporizador (56) · trava-photomic (46)
│  ├─ armamento  [esq]                   o mecanismo em cima do chassi, embaixo da tampa direita
│  │  └─ 16 · 17 · 18 · 19 · 20 · 21 · 22 · 23 · 25 · 27 · 31 · 32 · 47 · 48   (engrenagens, platinas, eixos, alavancas)
│  ├─ obturador  (26)                    abre de novo: 2 cortinas de titânio, 2 tambores, molas
│  ├─ transporte  [esq]                  o caminho do filme
│  │  └─ friccao-bobina (28) · bobina-receptora (29) · rolo-dentado (30) · eixo-rebobinar (45) · acionamento-motor (35)
│  └─ base  [esq]
│     └─ carter-inferior (33) · reset-contador (34)
├─ costas  (36)                          costas e fundo numa peça só (a F não tem dobradiça); saem para trás e para baixo
│  └─ porca-tripe (49) · chave-trava OPEN/LOCK [m] · placa-pressao [s]
└─ acessorios                            EXTRAS: não existem com a câmera montada, aparecem só na explosão
   └─ acessorio (38) · porta-acessorios (39) · contato-flash (40) · visor-esportivo (42) · base-acessorios (43) · contato-flash (44)
```

A correia e o estojo ficam de fora. Nas peças **[esq]**, a forma vem do desenho do esquema. Elas recebem detalhe de mecanismo (dentes, furos, parafusos), mas não são cópias exatas.

**Mudança no motor que isso pede**: um campo `extra: true` em `partes`, que deixa a peça com opacidade 0 enquanto o pai está fechado e faz ela aparecer quando ele abre. Só entra em ação nos props que usam o campo, então o relógio continua com regressão de 0 px.

## 5. História (proposta de ATOS)

```
abre          abrir(nikonF): o Photomic sobe, as tampas sobem, a lente vem para a frente, as costas descem
              para trás e os acessórios aparecem ao redor
foca-lente    focar(lente)                      as outras peças somem
abre-lente    abrir(lente): os anéis giram e se espalham ao longo do eixo óptico
fecha-lente   fechar(lente)
volta         voltar
foca-corpo    focar(corpo)
abre-corpo    abrir(corpo): o espelho sobe, os sub-conjuntos se separam
foca-mec      focar(armamento)                  terceira boneca russa
abre-mec      abrir(armamento): as engrenagens giram e saem em camadas
fecha-mec     fechar(armamento)
volta         voltar
fecha-corpo   fechar(corpo)
volta         voltar
fecha         fechar(nikonF): os acessórios somem e o Photomic desce por último, encaixando o garfo
```

Pelo ritmo de hoje, dá uns 2.000% de altura de scroll. Se ficar longo demais, o candidato a sair é o foco no armamento.

## 6. Decisões

1. ~~Visor~~ → **Photomic** (2026-10-01).
2. ~~Detalhe interno~~ → **as 58 peças do esquema**.
3. ~~Saída de cena no foco~~ → **`sumir`** (transparência).
4. ~~Acessórios~~ → **peças extras que aparecem só na explosão**.

**Risco**: são cerca de 75 malhas contra as 13 do relógio, e o iPhone sente o número de chamadas de desenho. Plano: juntar as geometrias de cada peça por material e medir no painel de fps já no primeiro Artefato.

**Ajuste de 2026-10-03**: eliminadas as frestas das tampas com o Photomic: faces internas em x = −14/41 mm e apoio plano em y = 62 mm, sem sobreposição entre os três blocos. Chanfros retirados só nas junções; pivôs, poses e/d, botões, furos e ancoragem dos SVGs preservados.

# Ficha: planilha de vendas que vira painel (rascunho, aguardando aprovação)

Quarto prop WebGL e o primeiro que **não volta à montagem original**: a planilha se desmonta e se remonta em outro objeto, o painel. Vai numa seção da landing P0 (`C:\Users\ACER\Desktop\p0-landing`), logo depois da primeira dobra.

## 1. Origem

Prop inventado (sem fotos). Os dados vêm da planilha e do painel que já estão no site (`src/BeforeAfter.jsx`), para a cena contar a mesma história com os mesmos números fictícios.

## 2. Estilo (regra 1)

- **Mundo do objeto**: a planilha de vendas de outubro de uma papelaria de bairro, feita à mão no computador e impressa, cheia de remendos. Cada célula vira uma **ficha física**: um bloquinho de papel-cartão colado sobre uma base fina, como as peças de um jogo de tabuleiro.
- **Materiais**: papel offset branco-gelo (frente das células), cartão cinza-claro (cabeçalhos e números de linha), tinta de marca-texto amarelo (células "conferir"), caneta vermelha (erros `#REF!`, `#VALOR!`, `???`), base de MDF cru nas laterais. **Verso** das fichas: tinta chapada azul (a do site) ou cinza, que é o que forma as barras do painel.
- **Paleta**: papel `#fbfbf8`, cabeçalho `#eceef1`, grade e lateral `#c9cbd1`, marca-texto `#ffe86b`, erro `#b42318`, barra campeã `#2148c0`, barras `#858a95`. Fundo da cena `#f6f6f4`, o mesmo da página travada no claro.
- **Tipografia e textos**: Schibsted Grotesk (a fonte do site) nas células, em tamanho de planilha; os textos são os da planilha do site (`caderno 10 mat`, `CANETA AZUL`, `xerox`, `#REF!`...). Nada de marca.

## 3. Escala

Célula = 120 × 36 unidades de face, 8 de espessura (papel 1 + base 7). Planilha de 6 colunas × 11 linhas, com 1 de folga entre fichas: cerca de 730 × 410 unidades, perto dos ~330 a 700 dos outros props, para as poses servirem de ponto de partida.

## 4. Peças

Cerca de 66 fichas, cada uma um sólido com frente (textura de texto), verso (cor de barra ou papel liso) e laterais. Tudo instanciado da mesma geometria: o custo no iPhone é baixo.

```
planilha
├─ cabecalho        A · B · C · D · E + números de linha 1 a 11 (cartão cinza)
├─ vendas           as linhas de produto: caderno, caneta, mochila, presente, xerox (com as grafias trocadas)
├─ ruido            #REF!, #VALOR!, ???, linha vazia, "TOTAL?" e as notas "conferir no caderno"
└─ (pose final) painel
   ├─ barra-cadernos   12 fichas em fila, verso azul      → R$ 1.840
   ├─ barra-mochilas    8 fichas, verso cinza             → R$ 1.215
   ├─ barra-canetas     6 fichas                          → R$ 960
   ├─ barra-presentes   3 fichas                          → R$ 430
   └─ barra-copias      2 fichas                          → R$ 290
```

As 31 fichas que viram barras saem das linhas de venda. As outras (cabeçalho, datas, ruído) saem de cena.

## 5. Atos (a história, rolando)

| Ato | O que acontece | Frase na tela |
|---|---|---|
| 0. Montada | Planilha inteira em 3/4, levemente torta, realista: papel, marca-texto, erros em vermelho. | "Isso é o que você tem hoje." |
| 1. Solta | As fichas se descolam em onda, começando pelos erros; a câmera gira devagar. | "Cada linha guarda uma resposta, mas tudo misturado." |
| 2. Explode | Fichas no ar, girando, sem uma esconder a outra; o ruído cai e some. | "Primeiro eu separo o que é venda do que é ruído." |
| 3. Reagrupa | Fichas do mesmo produto se juntam ("caderno", "Caderno espiral" e "CADERNO" viram uma coisa só), viram de costas e encaixam em fila, formando as barras. | "Juntando o que é igual, aparece o que dá lucro." |
| 4. Painel | A câmera fica de frente e o painel 3D se alinha exatamente com um painel de verdade em HTML (o mesmo do topo do site), que aparece por cima enquanto o 3D some: título, valores e nomes dos produtos nítidos, legíveis por leitor de tela. | "Cadernos deram mais lucro: R$ 1.840." |

Só a skill de rolagem: **sem** `cena-blueprint-3d` e **sem** `cena-explodida-interativa` (decisão do usuário em 2026-10-13). O "limpo" do fim vem do verso chapado das fichas e da passagem para o painel em HTML. Pegar, girar e ampliar o painel no fim fica como ideia para depois, talvez só no PC.

## 6. O que muda no motor

- **Ato novo `transformar`**: as peças vão para uma segunda pose de encaixe (`c`, o painel), em vez de voltar ao `m`. O `c` tem as mesmas exigências do `m`: encaixe exato, fichas face a face, sem fresta. Verificação numérica nova para o `c`.
- **Modo página**: o motor roda dentro de uma seção do site (sem a tela de um toque e sem o painel de fps, que só aparece com `?fps`), usando o GSAP do próprio site, e carrega o Three.js só quando a seção se aproxima.

## 7. Riscos

- iPhone: 30 fps até o primeiro toque (não dá para usar a tela de um toque numa landing page).
- A passagem 3D para HTML exige que a pose final caia exatamente sobre o painel em HTML em qualquer largura de tela: medir em desktop e 390 × 844.
- Quem pede menos movimento (ou não tem WebGL) vê a imagem parada do painel.
- Conferir sobreposições e oclusão em todos os atos (desktop e 390 × 844) antes de mostrar.

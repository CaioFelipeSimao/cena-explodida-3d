# Referências: fotos, blueprint e esquema

O passo 0 do fluxo. As imagens ficam em `props/<nome>/ref/`. O `compor.cjs` só lê os arquivos que ele conhece, então `ref/` **nunca entra no HTML**. Isso importa porque muito esquema de manual tem direitos reservados: ele serve de consulta e não é publicado.

## Três pontos de partida

| Caso | O que chega | O que fazer antes da ficha |
|---|---|---|
| **Objeto real** (o normal) | fotos | Ler as fotos e tirar materiais, cores, gravações e proporções. Peças internas que não aparecem nas fotos são deduzidas e marcadas como *suposição* na ficha. |
| **Objeto real, trabalho específico** | fotos + blueprint e/ou esquema explodido | O blueprint dá as medidas. O esquema explodido dá a lista de peças, a árvore (sub-conjuntos) e a ordem de montagem. As fotos dão o acabamento. |
| **Prop criado ou inspirado** | descrição, às vezes um blueprint real de base | Processo criativo primeiro: mundo do objeto, época, ofício, materiais (regra 1), proposto ao usuário em poucas linhas. Se houver blueprint real de base, a mecânica e as proporções vêm dele e o estilo vem da criação. O usuário escolhe o que sai do real e o que é inventado. |

## O que tirar de cada tipo

- **Fotos**: material e cor de cada peça (com amostras de cor tiradas da imagem, não inventadas), textura (couro granulado, serrilhado, escovado), gravações e fontes, o verso das peças (regra 2) e as proporções. Escolha fotos frontais e de topo para medir; foto em 3/4 só para entender volume.
- **Blueprint (vistas ortogonais)**: a escala vem de uma medida conhecida (largura total, diâmetro de uma rosca padrão). As outras medidas saem por proporção. O perfil de peças que giram vira um torno ou um `extrudar` direto.
- **Esquema explodido**: os números da legenda viram a lista de peças. As linhas tracejadas mostram o eixo de saída de cada peça, que é um bom ponto de partida para o `e`. Os agrupamentos do desenho viram a `ARVORE`.
- **Foto como textura**: só para face plana fotografada de frente com luz uniforme (mostrador, etiqueta). Nos outros casos, redesenhe em SVG.

## A ficha (portão de aprovação)

Antes de qualquer geometria, escreva `props/<nome>/ficha.md` e peça aprovação ao usuário. A ficha tem:

1. **Origem**: quais referências, e o que é medido, o que é estimado e o que é suposição.
2. **Estilo**: as 4 linhas da regra 1, com a paleta tirada das fotos.
3. **Escala**: a unidade do prop (ex.: 1 mm = 2 unidades) e as medidas gerais.
4. **Árvore de peças**: nó → filhas. Para cada folha: material, medidas, forma no motor (`disco`, `tubo`, `extrudar`, `engrenagem`, torno) e o número no esquema, se houver.
5. **História (atos)**: proposta de `ATOS`, que o usuário corrige.
6. **Decisões em aberto**: só o que é realmente do usuário (variante do modelo, até onde ir no detalhe interno).

Os erros de leitura aparecem na ficha, e ali corrigir é barato. Depois de aprovada, a ficha é a fonte das dimensões para `pecas.js` e `partes.js`.

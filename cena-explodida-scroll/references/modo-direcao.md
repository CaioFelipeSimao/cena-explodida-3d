# Modo direção

**Não construído.** Este arquivo é a especificação combinada com o usuário (2026-09-30), para construir só quando ele pedir para dirigir o movimento peça por peça. Para props simples, descrever em palavras e ajustar a tabela `partes` basta.

## O que é

Uma página aberta com `#dirigir` (em Artifact só `#âncora` chega à página, nunca `?consulta`) que trava o prop desmontado e mostra uma lista das peças. Ao escolher uma peça, o usuário ajusta com controles os valores do estado explodido (`e`) ou da deriva (`d`) e vê o resultado na hora. Um botão "copiar" gera um trecho pronto para colar de volta na conversa, por exemplo:

```js
capa: { e: { z: 210, rotationZ: -2 }, d: { y: -14, rotationZ: -4 } },
```

## Especificação mínima

- Um controle deslizante por propriedade: `x`, `y`, `z`, `rotationX`, `rotationY`, `rotationZ`, mais `atraso` (a `ordem`).
- Escolher o estado que está sendo editado (`e` ou `d`) e posicionar a timeline nele (`tl.time(...)`), sem scroll.
- Clicar na peça, na cena, também a seleciona.
- Copiar: `navigator.clipboard.writeText` dentro do clique, com retorno para selecionar o texto se a cópia falhar.
- Controles de no mínimo 40 px de altura e texto de 11 px ou mais: o iPhone é o aparelho principal do usuário, mas controles pequenos funcionam melhor no PC ou no tablet. Diga isso ao entregar.

## Limite conhecido

Os controles só definem pontos de chegada. Uma trajetória curva (a peça desenhando um arco) precisa ser descrita em palavras e implementada por você, porque a timeline interpola em linha reta entre os estados.

# To-do do projeto das skills de cena explodida (fechamento 2026-10-03)

**Ao retomar, liste os dois opcionais ao usuário e pergunte por onde começar.** Ele pediu essa rotina.

As quatro fases estão concluídas. Nikon F publicada na v22 e Dual 1019 na v8. Links e bateria atual em [plano-expansao.md](plano-expansao.md), seção "Estado final 2026-10-03".

## Concluído

- [x] (feito 2026-10-03) **Conferência entre HTML e fontes.** Repita ao retomar. Componha das fontes e compare com o HTML local e o publicado. Leve diferenças para as fontes antes de continuar.
- [x] (feito 2026-10-03) **Fase 3 testada no iPhone.** Usuário confirmou os gestos, a troca de dois dedos para um, a trava da rolagem e o arrasto do prop montado.
- [x] (feito 2026-10-03) **Generalização no relogio-arvore.** Blueprint e interação configurados. Bateria em desktop e 390 x 844. Relógio plano preservado, com regressão 0 px em `cmp3d.mjs`.
- [x] (feito 2026-10-03) **Temas azul e escuro.** Conferidos junto com papel. Rótulos dentro da tela. Quadriculado e régua de progresso ficaram fora de escopo.
- [x] (feito 2026-10-03) **Terceiro prop: Dual 1019.** Fluxo de referências aplicado a um objeto novo. 34 peças, 7 atos, blueprint e interação.
- [x] (feito parcial 2026-10-03) **Limpeza.** HTMLs antigos separados em `_antigos`. Este fechamento registra só essa etapa; não afirma que a pasta foi apagada.
- [x] (feito 2026-10-03) **Ajuste fino da sombra e do reflexo.** Nikon: variação C, céu `['#efeeeb','#c2c5c8','#74787d','#3a3c40']` e cromo com `roughness: .5`. Dual: teca calibrada pelo pixel renderizado contra a amostra da foto, tapete preto e alumínio.
- [x] (feito 2026-10-03) **Blocos de cima da Nikon encostados.** Contato face a face, sem fresta, sem interpenetração e sem chanfro na junção.
- [x] (feito 2026-10-03) **Zoom da peça agarrada.** Rodinha e pinça, de 50 a 200%, com volta a 1 ao soltar.
- [x] (feito 2026-10-03) **Vidro e custo do blueprint.** Vidro preserva o desenho atrás dele. Teto `densidadeMax`, pré-compilação, sombras congeladas na transição e painel BP com tempos.

## Opcionais (decisão do usuário)

- [ ] **Linhas desenhadas como vetor.**
- [ ] **Fontes das skills em git.** A pasta também contém outras skills do usuário.

## Decisões já tomadas (não reabrir)

Na Nikon: blueprint na primeira explosão, tema papel, rótulos nas 7 peças principais, 2 cotas e carimbo. Interação no fim da rolagem. Dois toques abrem com a explosão do ato 1, sem flutuação. Subconjunto fechado arrasta inteiro. Giro por Shift, botão direito ou dois dedos. Volta suave sem mola. Trocar de giro para mover desliza.

As oclusões da Nikon foram aprovadas pelo usuário: lente aberta cobrindo a tampa esquerda e célula cobrindo 7 a 9% da tampa direita no ato 1. Não corrigir. A regra de oclusão zero continua valendo para outros props.

## Cuidados ao retomar

Use Write/Edit para editar. Nunca `node -e` nem heredoc com crases ou `${}`.

`cmp3d.mjs` compara HTMLs existentes. Para provar a recomposição, gere antes o HTML das fontes.

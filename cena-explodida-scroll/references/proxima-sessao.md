# Abertura da próxima sessão (combinado com o usuário em 2026-10-03)

Quando o usuário voltar a este projeto, **mande a mensagem abaixo exatamente como está, antes de qualquer outra coisa**, e espere as respostas dele. Antes, confira em 2 minutos se as fontes ou os HTMLs mudaram fora da sessão (`git log` em `C:\Users\ACER\arsenal-scroll3d`, compor e comparar), e só cite isso se algo mudou.

---

Então o próximo passo é uma fase nova: transformar a skill de "gera um Artefato" em "entrega uma cena para um site". Proponho quatro lotes, nesta ordem, cada um testado e aprovado por você antes do seguinte.

**Lote A: base atualizada**
- **Fontes das skills no git,** para revisar e poder voltar atrás.
- **three.js atual no lugar da r128.** A versão atual também carrega nos Artefatos pelo jsDelivr, então o motor continua um só para os dois mundos.
- **Critério de pronto:** a Nikon, o toca-discos e o relógio continuam passando na bateria inteira, sem diferença visual.

**Lote B: a cena dentro de uma seção do site**
- **Motor como componente:** `montar(elemento, prop)`. A cena ocupa a caixa onde foi colocada, e não a tela inteira. Cabe mais de uma cena na mesma página.
- **Pausa fora da tela:** a cena para de desenhar quando sai da tela, o que é essencial em site, porque o resto da página fica leve.
- **Saída da composição:** além do HTML único, um pacote para encaixar num site existente.
- **Teste:** uma página de site fictícia, com cabeçalho, textos e duas cenas no meio do conteúdo.

**Lote C: modelo 3D pronto (GLB)**
- **Carregar o modelo do cliente** e ligar as peças dele à árvore e aos atos da skill, pelo nome de cada peça.
- **Explosão proposta automaticamente** a partir da forma e da posição das peças. Depois o teste de oclusão ajusta, e você aprova.
- **Material:** fica o original do modelo, ou o estilo próprio da skill, à escolha por projeto.
- **Teste:** um modelo gratuito com peças separadas, até aparecer um de cliente.

**Lote D: robustez para o público**
- **Qualidade que se ajusta sozinha:** se o fps cair, baixa a resolução e, se precisar, desliga o blueprint.
- **Carregamento:** imagem estática enquanto carrega, carregamento só quando a cena se aproxima da tela e uma versão completa para quem desativa animações.
- **Testes em Android e em aparelhos fracos.**

O trabalho braçal vai para o Codex. Eu fico com o desenho da solução, a revisão e os testes no navegador.

**Três perguntas**
1. **Ordem dos lotes:** posso seguir A → B → C → D?
2. **Tecnologia dos sites:** HTML simples, React/Next, WordPress? Isso muda o formato do pacote do lote B. Se variar, começo pelo mais universal, que é um script que funciona em qualquer página.
3. **Android:** você tem um aparelho Android para os testes do lote D, mesmo emprestado?

---

Contexto que o usuário já deu: os projetos reais são **sites dele ou de clientes**, e **é real a chance de o cliente ter o produto em 3D** (GLB/CAD). Ele trabalha com o Claude, que delega o trabalho braçal ao Codex (`codex-companion.mjs task --write`); o Codex não roda navegador nem escreve fora de `~/.claude/skills`.

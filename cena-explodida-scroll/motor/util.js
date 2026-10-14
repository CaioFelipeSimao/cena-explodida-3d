/* Motor: utilidades. Coordenadas de desenho: y para baixo, ângulos em graus, 0 = direita, sentido horário (como no CSS e no SVG).
   O 3D usa y para cima: V() faz a conversão. */
gsap.registerPlugin(ScrollTrigger);
const rad = g => g * Math.PI / 180, TAU = Math.PI * 2;
const pol = (r, a) => [r * Math.cos(rad(a)), r * Math.sin(rad(a))];
const circ = (x, y, r) => `M${x - r},${y}a${r},${r} 0 1,0 ${2 * r},0a${r},${r} 0 1,0 ${-2 * r},0Z`;   // caminho SVG de um círculo
const V = ([x, y]) => new THREE.Vector2(x, -y);
const circulo = (cx, cy, r, n = 28) => Array.from({ length: n }, (_, i) => { const [x, y] = pol(r, i * 360 / n); return [cx + x, cy + y]; });
const $ = id => document.getElementById(id);
const sem = (o, eixo = 'rotationZ') => { const r = { ...o }; delete r[eixo]; return r; };   // tira o eixo do giro dos tweens das peças que giram (campos r/giro e eixo da tabela)

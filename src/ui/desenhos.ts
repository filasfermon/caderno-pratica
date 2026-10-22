// Desenhos feitos no próprio app (SVG): objetos para contar, notas e moedas
// GENÉRICAS (com "SEM VALOR", nunca imitando cédulas reais) e o relógio de ponteiros.

import { svg, el } from '../util/dom';
import type { Objeto } from '../atividades/tipos';
import { rotuloDoDinheiro } from '../atividades/rotulos';
import { ehNota } from '../conteudo/contas';

// ---------- Objetos para contar (latas, colheres, feijões) ----------

export function desenharObjeto(tipo: Objeto, tamanho = 44): SVGSVGElement {
  const s = svg('svg', { viewBox: '0 0 40 40', width: tamanho, height: tamanho, 'aria-hidden': 'true' });
  if (tipo === 'lata') {
    s.append(
      svg('rect', { x: 9, y: 7, width: 22, height: 28, rx: 3, fill: '#c9d3dc', stroke: '#1b1b1b', 'stroke-width': 2 }),
      svg('rect', { x: 9, y: 15, width: 22, height: 11, fill: '#e05c1a' }),
      svg('ellipse', { cx: 20, cy: 7, rx: 11, ry: 3.5, fill: '#e9eef2', stroke: '#1b1b1b', 'stroke-width': 2 }),
    );
  } else if (tipo === 'colher') {
    s.append(
      svg('ellipse', { cx: 20, cy: 11, rx: 7, ry: 9, fill: '#d0d4d8', stroke: '#1b1b1b', 'stroke-width': 2 }),
      svg('rect', { x: 18, y: 19, width: 4, height: 18, rx: 2, fill: '#d0d4d8', stroke: '#1b1b1b', 'stroke-width': 2 }),
    );
  } else {
    // Feijão: forma de rim, com brilho — não parece um ponto solto.
    s.append(
      svg('path', {
        d: 'M8 21c0-8 7-13 14-12 7 1 11 6 10 12-1 7-8 10-12 7-3-2-5-2-7 0-3 2-5-2-5-7z',
        fill: '#7a3b16',
        stroke: '#1b1b1b',
        'stroke-width': 2,
      }),
      svg('path', { d: 'M15 14c3-2 7-2 10 0', stroke: '#f3d2bd', 'stroke-width': 2, fill: 'none', 'stroke-linecap': 'round' }),
    );
  }
  return s;
}

/** Fileiras de 5. Acima de 20, as dezenas vêm em "pacotes de 10". */
export function desenharQuantidade(n: number, tipo: Objeto): HTMLElement {
  const caixa = el('div', { class: 'objetos', role: 'img', 'aria-label': `${n} objetos` });
  if (n === 0) {
    caixa.append(el('div', { class: 'etiqueta' }, 'NENHUM'));
    return caixa;
  }
  const fileira = (q: number, tam: number) => el('div', { class: 'fileira' }, ...Array.from({ length: q }, () => desenharObjeto(tipo, tam)));
  if (n <= 20) {
    for (let i = 0; i < n; i += 5) caixa.append(fileira(Math.min(5, n - i), 44));
    return caixa;
  }
  const dezenas = Math.floor(n / 10);
  const unidades = n % 10;
  const grupo = el('div', { class: 'grupo-dezenas' });
  for (let d = 0; d < dezenas; d++) {
    grupo.append(el('div', { class: 'objetos', style: { padding: '4px', borderWidth: '2px' } }, fileira(5, 20), fileira(5, 20)));
  }
  caixa.append(grupo);
  for (let i = 0; i < unidades; i += 5) caixa.append(fileira(Math.min(5, unidades - i), 36));
  return caixa;
}

// ---------- Notas e moedas genéricas ----------

export function desenharDinheiro(centavos: number, escala = 1): SVGSVGElement {
  const rotulo = rotuloDoDinheiro(centavos);
  if (ehNota(centavos)) {
    const w = 146 * escala;
    const h = 74 * escala;
    return svg(
      'svg',
      { viewBox: '0 0 118 60', width: w, height: h, role: 'img', 'aria-label': `nota de ${rotulo}` },
      svg('rect', { x: 1.5, y: 1.5, width: 115, height: 57, rx: 6, fill: '#e6ecdf', stroke: '#1b1b1b', 'stroke-width': 3 }),
      svg('circle', { cx: 22, cy: 30, r: 13, fill: 'none', stroke: '#5b6b52', 'stroke-width': 2 }),
      svg('text', { x: 72, y: 34, 'text-anchor': 'middle', 'font-size': 22, 'font-weight': 700, fill: '#1b1b1b', 'font-family': 'Atkinson Hyperlegible, sans-serif' }, rotulo),
      svg('text', { x: 72, y: 52, 'text-anchor': 'middle', 'font-size': 10, 'font-weight': 700, fill: '#3d3d3d', 'font-family': 'Atkinson Hyperlegible, sans-serif', 'letter-spacing': 1 }, 'SEM VALOR'),
    );
  }
  const d = (centavos >= 100 ? 66 : 58) * escala;
  const valor = centavos >= 100 ? String(centavos / 100) : `0,${String(centavos).padStart(2, '0')}`;
  return svg(
    'svg',
    { viewBox: '0 0 60 60', width: d, height: d, role: 'img', 'aria-label': `moeda de ${rotulo}` },
    svg('circle', { cx: 30, cy: 30, r: 27.5, fill: '#d9d4c7', stroke: '#1b1b1b', 'stroke-width': 3 }),
    svg('circle', { cx: 30, cy: 30, r: 21, fill: 'none', stroke: '#7d7666', 'stroke-width': 1.5 }),
    svg('text', { x: 30, y: 25, 'text-anchor': 'middle', 'font-size': 11, 'font-weight': 700, fill: '#1b1b1b', 'font-family': 'Atkinson Hyperlegible, sans-serif' }, 'R$'),
    svg('text', { x: 30, y: 41, 'text-anchor': 'middle', 'font-size': valor.length > 2 ? 14 : 18, 'font-weight': 700, fill: '#1b1b1b', 'font-family': 'Atkinson Hyperlegible, sans-serif' }, valor),
  );
}

/** Divide um valor em notas e moedas (do maior para o menor). */
export function decompor(centavos: number): number[] {
  const valores = [10000, 5000, 2000, 1000, 500, 200, 100, 50, 25, 10, 5];
  const r: number[] = [];
  let resto = centavos;
  for (const v of valores) {
    while (resto >= v) {
      r.push(v);
      resto -= v;
    }
  }
  return r;
}

/** Para "ver com dinheiro": só notas de R$ 10 e moedas de R$ 1. */
export function desenharEmDezEUm(reais: number): HTMLElement {
  const caixa = el('div', { class: 'dinheiro' });
  for (let i = 0; i < Math.floor(reais / 10); i++) caixa.append(desenharDinheiro(1000, 0.8));
  for (let i = 0; i < reais % 10; i++) caixa.append(desenharDinheiro(100, 0.75));
  return caixa;
}

// ---------- Relógio de ponteiros ----------

export function desenharRelogio(hora: string): SVGSVGElement {
  const [h, m] = hora.split(':').map((x) => parseInt(x, 10));
  const s = svg('svg', { viewBox: '0 0 200 200', role: 'img', 'aria-label': 'relógio de ponteiros' });
  s.append(svg('circle', { cx: 100, cy: 100, r: 94, fill: '#ffffff', stroke: '#1b1b1b', 'stroke-width': 6 }));
  for (let i = 0; i < 60; i++) {
    const a = (i * Math.PI) / 30;
    const grande = i % 5 === 0;
    const r1 = grande ? 80 : 85;
    s.append(
      svg('line', {
        x1: 100 + r1 * Math.sin(a),
        y1: 100 - r1 * Math.cos(a),
        x2: 100 + 89 * Math.sin(a),
        y2: 100 - 89 * Math.cos(a),
        stroke: '#1b1b1b',
        'stroke-width': grande ? 3 : 1,
      }),
    );
  }
  for (let n = 1; n <= 12; n++) {
    const a = (n * Math.PI) / 6;
    s.append(
      svg('text', { x: 100 + 64 * Math.sin(a), y: 100 - 64 * Math.cos(a) + 7, 'text-anchor': 'middle', 'font-size': 20, 'font-weight': 700, fill: '#1b1b1b', 'font-family': 'Atkinson Hyperlegible, sans-serif' }, String(n)),
    );
  }
  const anguloHora = (((h % 12) + m / 60) * Math.PI) / 6;
  const anguloMin = (m * Math.PI) / 30;
  s.append(
    svg('line', { x1: 100, y1: 100, x2: 100 + 45 * Math.sin(anguloHora), y2: 100 - 45 * Math.cos(anguloHora), stroke: '#1b1b1b', 'stroke-width': 9, 'stroke-linecap': 'round' }),
    svg('line', { x1: 100, y1: 100, x2: 100 + 72 * Math.sin(anguloMin), y2: 100 - 72 * Math.cos(anguloMin), stroke: '#e05c1a', 'stroke-width': 5, 'stroke-linecap': 'round' }),
    svg('circle', { cx: 100, cy: 100, r: 7, fill: '#1b1b1b' }),
  );
  return s;
}

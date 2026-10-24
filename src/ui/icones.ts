// Ícones desenhados em SVG (sem arquivos externos). Todos decorativos:
// o botão que os usa sempre tem texto ou um rótulo para leitores de tela.

import { svg } from '../util/dom';

function base(tamanho: number, ...filhos: SVGElement[]): SVGSVGElement {
  return svg(
    'svg',
    { viewBox: '0 0 24 24', width: tamanho, height: tamanho, 'aria-hidden': 'true', focusable: 'false', class: 'icone' },
    ...filhos,
  );
}

const traco = { fill: 'none', stroke: 'currentColor', 'stroke-width': 2.2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' };

export const icones = {
  altoFalante: (t = 32) =>
    base(t, svg('path', { d: 'M4 9h4l5-4v14l-5-4H4z', fill: 'currentColor' }), svg('path', { d: 'M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12', ...traco })),
  voltar: (t = 28) => base(t, svg('path', { d: 'M15 5l-7 7 7 7', ...traco, 'stroke-width': 3 })),
  fechar: (t = 28) => base(t, svg('path', { d: 'M6 6l12 12M18 6L6 18', ...traco, 'stroke-width': 3 })),
  seguir: (t = 28) => base(t, svg('path', { d: 'M5 12h13M13 6l6 6-6 6', ...traco, 'stroke-width': 3 })),
  certo: (t = 28) => base(t, svg('path', { d: 'M4.5 12.5l5 5L19.5 7', ...traco, 'stroke-width': 3.2 })),
  /** Tartaruga: o botão MAIS DEVAGAR. */
  tartaruga: (t = 32) =>
    base(
      t,
      svg('path', { d: 'M3.5 15.5C3.5 11 7 8 11 8s7.5 3 7.5 7.5z', fill: 'currentColor' }),
      svg('path', { d: 'M7 15.5 9 11.5h4l2 4M9 11.5 11 8.6 13 11.5', fill: 'none', stroke: '#fff', 'stroke-width': 1.3, 'stroke-linejoin': 'round' }),
      svg('circle', { cx: 20.6, cy: 13.4, r: 2.1, fill: 'currentColor' }),
      svg('path', { d: 'M6 15.5v3M10 15.5v3M14 15.5v3M2 15l1.6.8', ...traco, 'stroke-width': 2.4 }),
    ),
  /** Balão de fala: AGORA FALE VOCÊ. */
  falar: (t = 40) =>
    base(t, svg('path', { d: 'M4 5h16v10H10l-4.5 4v-4H4z', ...traco }), svg('path', { d: 'M8.5 10h.01M12 10h.01M15.5 10h.01', ...traco, 'stroke-width': 3 })),
  apagar: (t = 28) =>
    base(t, svg('path', { d: 'M9 5h11v14H9l-6-7z', ...traco }), svg('path', { d: 'M12 9.5l5 5M17 9.5l-5 5', ...traco })),
  mao: (t = 64) =>
    svg(
      'svg',
      { viewBox: '0 0 64 64', width: t, height: t, 'aria-hidden': 'true', class: 'icone' },
      svg('path', {
        d: 'M24 6c-3 0-5 2.2-5 5v22l-4-4c-2.2-2.2-5.6-2-7.4.4-1.4 1.9-1.2 4.6.4 6.3L22 50c3 3.3 7.2 5 11.6 5H38c8.8 0 16-7.2 16-16V27c0-2.8-2.2-5-5-5s-5 2.2-5 5v-2c0-2.8-2.2-5-5-5s-5 2.2-5 5v-1c0-2.8-2.2-5-5-5-1.1 0-2.1.3-3 1V11c0-2.8-2.2-5-5-5z',
        fill: '#FFFFFF',
        stroke: '#1B1B1B',
        'stroke-width': 3,
        'stroke-linejoin': 'round',
      }),
    ),
  polegarCima: (t = 48) =>
    base(t, svg('path', { d: 'M7 11v9H4v-9zM9 20h8.5a2 2 0 0 0 2-1.6l1.4-6.5A2 2 0 0 0 19 9.5h-5l.8-4a1.8 1.8 0 0 0-3.3-1.2L9 9.5z', fill: 'currentColor' })),
  polegarBaixo: (t = 48) =>
    base(t, svg('g', { transform: 'rotate(180 12 12)' }, svg('path', { d: 'M7 11v9H4v-9zM9 20h8.5a2 2 0 0 0 2-1.6l1.4-6.5A2 2 0 0 0 19 9.5h-5l.8-4a1.8 1.8 0 0 0-3.3-1.2L9 9.5z', fill: 'currentColor' }))),
  livro: (t = 28) => base(t, svg('path', { d: 'M3 5.5C6 4 9 4 12 6c3-2 6-2 9-.5V19c-3-1.5-6-1.5-9 .5-3-2-6-2-9-.5z', ...traco }), svg('path', { d: 'M12 6v13.5', ...traco })),
  estrela: (t = 28) => base(t, svg('path', { d: 'M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z', fill: 'currentColor' })),
};

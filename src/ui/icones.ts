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
  engrenagem: (t = 28) =>
    base(
      t,
      svg('path', {
        d: 'M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7zm8.2 4.6.1-1.1-.1-1.1 2-1.6-2-3.4-2.4 1a8 8 0 0 0-1.9-1.1L15.5 3h-4l-.4 2.6a8 8 0 0 0-1.9 1.1l-2.4-1-2 3.4 2 1.6-.1 1.1.1 1.1-2 1.6 2 3.4 2.4-1a8 8 0 0 0 1.9 1.1l.4 2.6h4l.4-2.6a8 8 0 0 0 1.9-1.1l2.4 1 2-3.4z',
        fill: 'currentColor',
        'fill-rule': 'evenodd',
      }),
    ),
  voltar: (t = 28) => base(t, svg('path', { d: 'M15 5l-7 7 7 7', ...traco, 'stroke-width': 3 })),
  fechar: (t = 28) => base(t, svg('path', { d: 'M6 6l12 12M18 6L6 18', ...traco, 'stroke-width': 3 })),
  seguir: (t = 28) => base(t, svg('path', { d: 'M5 12h13M13 6l6 6-6 6', ...traco, 'stroke-width': 3 })),
  certo: (t = 28) => base(t, svg('path', { d: 'M4.5 12.5l5 5L19.5 7', ...traco, 'stroke-width': 3.2 })),
  microfone: (t = 28) =>
    base(t, svg('rect', { x: 9, y: 3, width: 6, height: 11, rx: 3, fill: 'currentColor' }), svg('path', { d: 'M6 11a6 6 0 0 0 12 0M12 17v4M8.5 21h7', ...traco })),
  parar: (t = 28) => base(t, svg('rect', { x: 6, y: 6, width: 12, height: 12, rx: 2, fill: 'currentColor' })),
  tocar: (t = 28) => base(t, svg('path', { d: 'M8 5v14l11-7z', fill: 'currentColor' })),
  apagar: (t = 28) =>
    base(t, svg('path', { d: 'M9 5h11v14H9l-6-7z', ...traco }), svg('path', { d: 'M12 9.5l5 5M17 9.5l-5 5', ...traco })),
  lixeira: (t = 24) => base(t, svg('path', { d: 'M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13', ...traco })),
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
  pacote: (t = 28) => base(t, svg('path', { d: 'M3 7l9-4 9 4v10l-9 4-9-4zM3 7l9 4 9-4M12 11v10', ...traco })),
  lista: (t = 28) => base(t, svg('path', { d: 'M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01', ...traco, 'stroke-width': 2.6 })),
  /** Logotipo "G" do Google (cores oficiais), para o botão ENTRAR COM GOOGLE. */
  google: (t = 30) =>
    svg(
      'svg',
      { viewBox: '0 0 48 48', width: t, height: t, 'aria-hidden': 'true', focusable: 'false', class: 'icone' },
      svg('path', { fill: '#EA4335', d: 'M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z' }),
      svg('path', { fill: '#4285F4', d: 'M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z' }),
      svg('path', { fill: '#FBBC05', d: 'M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z' }),
      svg('path', { fill: '#34A853', d: 'M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z' }),
    ),
  cadeado: (t = 28) => base(t, svg('rect', { x: 5, y: 11, width: 14, height: 10, rx: 2, fill: 'currentColor' }), svg('path', { d: 'M8 11V8a4 4 0 0 1 8 0v3', ...traco })),
};

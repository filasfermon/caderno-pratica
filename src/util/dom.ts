// Ajudante para criar elementos da página sem framework.
// Exemplo: el('button', { class: 'botao', onclick: () => ... }, 'VOLTAR')

type Filho = Node | string | number | null | undefined | false;
type Atributos = Record<string, unknown>;

function anexar(pai: Node, filhos: Filho[]): void {
  for (const f of filhos) {
    if (f === null || f === undefined || f === false) continue;
    pai.appendChild(typeof f === 'string' || typeof f === 'number' ? document.createTextNode(String(f)) : f);
  }
}

function aplicar(e: Element, atributos: Atributos): void {
  for (const [nome, valor] of Object.entries(atributos)) {
    if (valor === undefined || valor === null || valor === false) continue;
    if (nome.startsWith('on') && typeof valor === 'function') {
      e.addEventListener(nome.slice(2), valor as EventListener);
    } else if (nome === 'class') {
      e.setAttribute('class', String(valor));
    } else if (nome === 'style' && typeof valor === 'object') {
      Object.assign((e as HTMLElement).style, valor);
    } else if (valor === true) {
      e.setAttribute(nome, '');
    } else {
      e.setAttribute(nome, String(valor));
    }
  }
}

export function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  atributos: Atributos = {},
  ...filhos: Filho[]
): HTMLElementTagNameMap[K] {
  const e = document.createElement(tag);
  aplicar(e, atributos);
  anexar(e, filhos);
  return e;
}

const SVG_NS = 'http://www.w3.org/2000/svg';

export function svg<K extends keyof SVGElementTagNameMap>(
  tag: K,
  atributos: Atributos = {},
  ...filhos: Filho[]
): SVGElementTagNameMap[K] {
  const e = document.createElementNS(SVG_NS, tag);
  aplicar(e, atributos);
  anexar(e, filhos);
  return e;
}

export function limpar(e: Element): void {
  while (e.firstChild) e.removeChild(e.firstChild);
}

export function esperar(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

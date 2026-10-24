// Estrutura do app: guarda o conteúdo carregado, troca de telas e monta a barra do topo.
// As telas usam endereços com "#" (ex.: #/aula/23), que funcionam no GitHub Pages e sem internet.

import { el, limpar } from './util/dom';
import { icones } from './ui/icones';
import type { Conteudo } from './conteudo/tipos';
import { falarEmSequencia, pararFala } from './audio/voz';

let conteudo: Conteudo | null = null;

export function definirConteudo(c: Conteudo): void {
  conteudo = c;
}

export function obterConteudo(): Conteudo {
  if (!conteudo) throw new Error('Conteúdo ainda não carregado');
  return conteudo;
}

export function raiz(): HTMLElement {
  return document.getElementById('app')!;
}

/** Cada tela nova ganha um número; tarefas de telas antigas param sozinhas. */
let numeroDaTela = 0;

export function telaAtual(): number {
  return numeroDaTela;
}

export function irPara(rota: string): void {
  if (location.hash === rota) window.dispatchEvent(new HashChangeEvent('hashchange'));
  else location.hash = rota;
}

/** Troca o conteúdo da tela. Para a voz da tela anterior. */
export function mostrarTela(titulo: string, ...filhos: (Node | null)[]): number {
  numeroDaTela++;
  pararFala();
  const app = raiz();
  limpar(app);
  for (const f of filhos) if (f) app.appendChild(f);
  document.title = titulo ? `${titulo} · Caderno Prática` : 'Caderno Prática';
  window.scrollTo(0, 0);
  const h1 = app.querySelector('h1');
  if (h1) {
    h1.setAttribute('tabindex', '-1');
    h1.focus({ preventScroll: true });
  }
  return numeroDaTela;
}

/** Botão grande de alto-falante: repete a instrução da tela. */
export function botaoOuvir(texto: () => string | string[], rotulo = 'Ouvir de novo'): HTMLButtonElement {
  return el(
    'button',
    {
      type: 'button',
      class: 'botao-ouvir',
      'aria-label': rotulo,
      onclick: () => {
        const t = texto();
        void falarEmSequencia((Array.isArray(t) ? t : [t]).map((x) => ({ categoria: 'instrucao' as const, texto: x })));
      },
    },
    icones.altoFalante(34),
  );
}

/** Barra do topo: VOLTAR, título e (opcional) alto-falante. */
export function topo(opcoes: { titulo: string; voltar?: string; fala?: string; extra?: Node }): HTMLElement {
  const barra = el('header', { class: 'topo' });
  if (opcoes.voltar !== undefined) {
    barra.append(
      el('a', { class: 'botao-icone contorno', href: opcoes.voltar, 'aria-label': 'Voltar' }, icones.voltar(26), el('span', {}, 'VOLTAR')),
    );
  }
  barra.append(el('h1', {}, opcoes.titulo));
  if (opcoes.extra) barra.append(opcoes.extra);
  if (opcoes.fala) barra.append(botaoOuvir(() => opcoes.fala!));
  return barra;
}

/** Fala a instrução de uma tela assim que ela abre (uma frase ou várias, em sequência). */
export function anunciar(texto: string | string[]): void {
  const minha = numeroDaTela;
  const frases = Array.isArray(texto) ? texto : [texto];
  setTimeout(() => {
    if (minha === numeroDaTela) void falarEmSequencia(frases.map((t) => ({ categoria: 'instrucao' as const, texto: t })));
  }, 150);
}

/** "PÁGINA 51" ou "PÁGINAS 49–50". */
export function textoPaginas(paginas: string): string {
  return /[–-]/.test(paginas) ? `PÁGINAS ${paginas}` : `PÁGINA ${paginas}`;
}

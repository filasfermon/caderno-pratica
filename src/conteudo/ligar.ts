// Descobre os pares de um item "ligar" do caderno.
// O JSON traz só as duas colunas; os pares são achados por estas regras:
// - textos iguais (AI ↔ AI);
// - maiúscula ↔ minúscula da mesma letra (P ↔ p);
// - palavra ↔ sílabas ("LUPA" ↔ "LU + PA");
// - número ↔ preço ("2" ↔ "R$ 2,00").
// Se não der para ligar todos de um jeito único, o item não é usado.

import type { ItemLigar } from './tipos';
import { precoEmCentavos } from './contas';
import { maiusculas } from '../util/texto';

export function correspondem(a: string, b: string): boolean {
  const x = a.trim();
  const y = b.trim();
  if (x === y) return true;
  if (x.length === 1 && y.length === 1 && x !== y && maiusculas(x) === maiusculas(y)) return true;
  const juntar = (t: string) => maiusculas(t.split(/\s*\+\s*/).join(''));
  if ((y.includes('+') || x.includes('+')) && juntar(x) === juntar(y) && !/\d/.test(x + y)) return true;
  const px = /^\d+$/.test(x) ? parseInt(x, 10) * 100 : precoEmCentavos(x);
  const py = /^\d+$/.test(y) ? parseInt(y, 10) * 100 : precoEmCentavos(y);
  if (px !== null && py !== null && px === py && (x.includes('R$') !== y.includes('R$'))) return true;
  return false;
}

/** Devolve os pares [índice da esquerda, índice da direita], ou null se não der. */
export function resolverPares(item: ItemLigar): [number, number][] | null {
  const { esquerda, direita } = item;
  if (esquerda.length !== direita.length || esquerda.length < 2) return null;
  const opcoes = esquerda.map((e) => direita.map((d, j) => (correspondem(e, d) ? j : -1)).filter((j) => j >= 0));
  if (opcoes.some((o) => o.length === 0)) return null;
  const usado = new Set<number>();
  const escolha: number[] = [];
  const tentar = (i: number): boolean => {
    if (i === esquerda.length) return true;
    for (const j of opcoes[i]) {
      if (usado.has(j)) continue;
      usado.add(j);
      escolha.push(j);
      if (tentar(i + 1)) return true;
      usado.delete(j);
      escolha.pop();
    }
    return false;
  };
  return tentar(0) ? escolha.map((j, i) => [i, j] as [number, number]) : null;
}

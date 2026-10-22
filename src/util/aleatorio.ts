// Sorteios. Usa um gerador com "semente" para os testes poderem repetir o mesmo resultado.

export type Sorteio = () => number;

/** Gerador simples (mulberry32). Mesma semente → mesma sequência. */
export function criarSorteio(semente: number = Date.now()): Sorteio {
  let a = semente >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function embaralhar<T>(lista: T[], s: Sorteio): T[] {
  const copia = [...lista];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(s() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

/** Embaralha garantindo que a ordem final seja diferente da original (quando possível). */
export function embaralharDiferente<T>(lista: T[], s: Sorteio, igual: (a: T[], b: T[]) => boolean): T[] {
  for (let tentativa = 0; tentativa < 20; tentativa++) {
    const r = embaralhar(lista, s);
    if (!igual(r, lista)) return r;
  }
  return [...lista].reverse();
}

export function sortearUm<T>(lista: T[], s: Sorteio): T {
  return lista[Math.floor(s() * lista.length)];
}

export function sortearVarios<T>(lista: T[], n: number, s: Sorteio): T[] {
  return embaralhar(lista, s).slice(0, n);
}

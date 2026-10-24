// Junta dois progressos (o do aparelho e o da conta Google) sem perder nada:
// aulas e itens dos dois lados entram; quando os dois têm o mesmo, fica o que foi
// praticado mais vezes. Usado ao entrar com Google (levando o progresso local junto)
// e quando chega uma mudança feita em outro aparelho.

import type { Progresso } from '../dados/progresso';

export function juntarProgressos(a: Progresso, b: Progresso): Progresso {
  const aulas: Progresso['aulas'] = { ...b.aulas };
  for (const [n, reg] of Object.entries(a.aulas ?? {})) {
    const outro = aulas[n];
    aulas[n] = outro ? { vezes: Math.max(reg.vezes, outro.vezes), ultima: Math.max(reg.ultima, outro.ultima) } : reg;
  }
  const itens: Progresso['itens'] = { ...b.itens };
  for (const [chave, item] of Object.entries(a.itens ?? {})) {
    const outro = itens[chave];
    if (!outro || item.vezes > outro.vezes || (item.vezes === outro.vezes && item.caixa < outro.caixa)) itens[chave] = item;
  }
  const maisRecente = (a.atualizado ?? 0) >= (b.atualizado ?? 0) ? a : b;
  return {
    sessoes: Math.max(a.sessoes ?? 0, b.sessoes ?? 0),
    ultimaAula: maisRecente.ultimaAula ?? a.ultimaAula ?? b.ultimaAula ?? null,
    aulas,
    itens,
    tiposVistos: [...new Set([...(a.tiposVistos ?? []), ...(b.tiposVistos ?? [])])],
    atualizado: Math.max(a.atualizado ?? 0, b.atualizado ?? 0),
  };
}

/** Os dois progressos têm o mesmo conteúdo? (para não gravar à toa) */
export function mesmoProgresso(a: Progresso, b: Progresso): boolean {
  const limpo = (p: Progresso) => JSON.stringify({ ...p, atualizado: 0 });
  return limpo(a) === limpo(b);
}

// Consultas ao conteúdo: achar aulas, formatar textos, listar palavras e sílabas.

import type { Aula, Conteudo } from './tipos';
import { ehPalavraSimples, silabar } from './silabas';
import { limparPalavra, maiusculas } from '../util/texto';

export function aulaPorNumero(c: Conteudo, numero: number): Aula | undefined {
  return c.aulas.find((a) => a.aula === numero);
}

/** Aulas de "AS MESMAS LETRAS" (minúsculas): o texto delas fica como está no conteúdo. */
export function ehAulaDeMinusculas(aula: Aula): boolean {
  return (aula.tipo ?? []).some((t) => maiusculas(t).includes('MINÚSCULA'));
}

/** Aulas de "palavrinhas" (A, O, E, DE, NA...): letras sozinhas ali são palavras, não nomes de letras. */
export function ehAulaDePalavrinhas(aula: Aula): boolean {
  const titulos = [...(aula.titulos ?? []), aula.objetivo ?? ''].join(' ');
  return maiusculas(titulos).includes('PALAVRINHAS');
}

/**
 * Regra de caixa: até a Parte 5, todo texto em MAIÚSCULAS.
 * Exceção: nas aulas de minúsculas o texto fica como no caderno (é o assunto da aula).
 * Na Parte 6, maiúsculas e minúsculas como no conteúdo.
 */
export function formatarParaAula(texto: string, aula: Aula): string {
  if (aula.parte <= 5 && !ehAulaDeMinusculas(aula)) return maiusculas(texto);
  return texto;
}

/** Tira duplicados mantendo a ordem. */
export function semRepetidos<T>(lista: T[]): T[] {
  return [...new Set(lista)];
}

/** Uma letra sozinha (A, p, Ç...). */
export function ehLetraSozinha(texto: string): boolean {
  return /^\p{L}$/u.test(texto.trim());
}

/** Par de letras do tipo "P p". */
export function ehParDeLetras(texto: string): boolean {
  return /^\p{Lu} \p{Ll}$/u.test(texto.trim());
}

/** Palavras "de verdade" da aula (só letras, mais de uma letra), já formatadas. */
export function palavrasDaAula(aula: Aula): string[] {
  const brutas = [
    ...(aula.palavras ?? []),
    ...(aula.ditado ?? []),
    ...(aula.formar ?? []).map((f) => f.palavra),
  ];
  return semRepetidos(
    brutas
      .map((p) => formatarParaAula(p.trim(), aula))
      .filter((p) => ehPalavraSimples(p) && p.length > 1),
  );
}

/** Frases (linhas) dos textos da aula, já formatadas. */
export function frasesDaAula(aula: Aula): string[] {
  return semRepetidos((aula.textos ?? []).flat().map((f) => formatarParaAula(f.trim(), aula)).filter(Boolean));
}

/**
 * Todas as sílabas que o app pode falar sozinhas, em MAIÚSCULAS:
 * as do campo "silabas" (com mais de uma letra), as partes de "formar",
 * as partes "LU + PA" de "ligar" e as sílabas de todas as palavras.
 * A tabela de pronúncia precisa ter todas (o teste confere).
 */
export function silabasDoConteudo(c: Conteudo): string[] {
  const conjunto = new Set<string>();
  const add = (s: string) => {
    const m = maiusculas(limparPalavra(s));
    // Só entra o que tem vogal (siglas como KG ficam na lista de palavras da tabela).
    if (/[AEIOUÁÉÍÓÚÂÊÔÃÕ]/.test(m)) conjunto.add(m);
  };
  for (const a of c.aulas) {
    for (const s of a.silabas ?? []) if (!ehLetraSozinha(s)) add(s);
    for (const f of a.formar ?? []) f.partes.forEach(add);
    for (const l of a.ligar ?? []) for (const d of [...l.esquerda, ...l.direita]) if (d.includes(' + ')) d.split(' + ').forEach(add);
    for (const p of palavrasDaAula(a)) silabar(maiusculas(p)).forEach(add);
    for (const p of palavrasDaAula(a)) if (silabar(p).length === 1) add(p);
  }
  return [...conjunto].sort((x, y) => x.localeCompare(y, 'pt-BR'));
}

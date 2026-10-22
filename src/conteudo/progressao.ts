// VALIDADOR DA REGRA DE PROGRESSÃO
//
// Numa aula N, tudo o que aparece escrito para o estudante só pode usar o que
// ele já aprendeu até a aula N (campos acumulados do conteudo_licoes.json):
// - letras maiúsculas em letras_conhecidas;
// - letras minúsculas em minusculas_conhecidas;
// - algarismos em numeros_conhecidos;
// - combinações em combinacoes_conhecidas:
//     CH, LH, NH, RR, SS, Ç, ÃO → liberados quando aparecem na lista;
//     CODA   → letra no fim da sílaba (POR-TA, SOL) liberada;
//     ENC    → encontros como PR, BL (PRA-TO) liberados;
//     ACENTO → acentos liberados;
// - e as palavras de palavras_de_leitura_global (lidas "de olho", como PARE).
//
// O app inteiro usa este validador: o que não passa não é mostrado.

import type { Aula } from './tipos';
import { silabarDetalhado } from './silabas';
import { limparPalavra, maiusculas, semAcento } from '../util/texto';

export interface Conhecimento {
  letras: Set<string>;
  minusculas: Set<string>;
  numeros: Set<string>;
  combinacoes: Set<string>;
  globais: Set<string>;
}

export function conhecimentoDaAula(aula: Aula): Conhecimento {
  const letras = new Set((aula.letras_conhecidas ?? '').split('').filter((c) => /\p{L}/u.test(c)));
  return {
    letras,
    minusculas: new Set((aula.minusculas_conhecidas ?? '').split('').filter((c) => /\p{L}/u.test(c))),
    numeros: new Set((aula.numeros_conhecidos ?? '').split('').filter((c) => /\d/.test(c))),
    combinacoes: new Set((aula.combinacoes_conhecidas ?? []).map((c) => maiusculas(c))),
    globais: new Set((aula.palavras_de_leitura_global ?? []).map((p) => maiusculas(p))),
  };
}

const ACENTOS_GERAIS = /[ÁÉÍÓÚÂÊÔÕÀáéíóúâêôõà]/;

/** Confere um caractere isolado. Devolve a explicação do problema ou null. */
function problemaDoCaractere(c: string, proximo: string | undefined, k: Conhecimento): string | null {
  if (/\d/.test(c)) return k.numeros.has(c) ? null : `número ${c} ainda não ensinado`;
  if (!/\p{L}/u.test(c)) return null; // pontuação e símbolos são livres
  const maiuscula = c !== c.toLowerCase();
  if (c === 'Ç' || c === 'ç') {
    if (!(k.combinacoes.has('Ç') || k.letras.has('Ç'))) return 'Ç ainda não ensinado';
    if (!maiuscula && !k.minusculas.has('c')) return 'minúscula c ainda não ensinada';
    return null;
  }
  const base = semAcento(c);
  if (maiuscula ? !k.letras.has(base) : !k.minusculas.has(base)) {
    return maiuscula ? `letra ${base} ainda não ensinada` : `minúscula ${base} ainda não ensinada`;
  }
  if (c === 'Ã' || c === 'ã') {
    if (k.combinacoes.has('ACENTO')) return null;
    const temAO = k.combinacoes.has('ÃO') || k.letras.has('Ã');
    if (temAO && proximo !== undefined && (proximo === 'O' || proximo === 'o')) return null;
    return 'Ã fora de ÃO ainda não ensinado';
  }
  if (ACENTOS_GERAIS.test(c) && !k.combinacoes.has('ACENTO')) return `acento (${c}) ainda não ensinado`;
  return null;
}

/** Confere a estrutura da palavra: dígrafos, letra no fim da sílaba, encontros. */
function problemasDeEstrutura(palavra: string, k: Conhecimento): string[] {
  const problemas: string[] = [];
  const m = maiusculas(palavra);
  for (const d of ['CH', 'LH', 'NH', 'RR', 'SS']) {
    if (m.includes(d) && !k.combinacoes.has(d)) problemas.push(`${d} ainda não ensinado`);
  }
  if (!/[AEIOUÁÉÍÓÚÂÊÔÃÕY]/.test(m)) return problemas; // sigla sem vogal: só as letras contam
  const silabas = silabarDetalhado(m);
  silabas.forEach((s, i) => {
    if (s.coda.length > 0) {
      const seguinte = silabas[i + 1];
      // O primeiro R de RR e o primeiro S de SS ficam por conta da marca RR/SS.
      const ehDobrada =
        s.coda.length === 1 &&
        seguinte !== undefined &&
        (s.coda[0] === 'R' || s.coda[0] === 'S') &&
        seguinte.ataque[0] === s.coda[0];
      if (!ehDobrada && !k.combinacoes.has('CODA')) problemas.push(`letra no fim da sílaba (${s.texto}) ainda não ensinada`);
    }
    // "RRA", "SSA": a família do RR/SS escrita sozinha não é encontro.
    const ehFamiliaDobrada = i === 0 && s.ataque.length === 2 && s.ataque[0] === s.ataque[1];
    if (s.ataque.length >= 2 && !ehFamiliaDobrada && !k.combinacoes.has('ENC'))
      problemas.push(`encontro (${s.texto}) ainda não ensinado`);
  });
  return problemas;
}

/** Confere uma palavra (sem espaços). */
export function problemasDaPalavra(token: string, k: Conhecimento): string[] {
  const nucleo = limparPalavra(token);
  if (nucleo === '') return [];
  if (k.globais.has(maiusculas(nucleo))) return [];
  const problemas: string[] = [];
  for (let i = 0; i < nucleo.length; i++) {
    const p = problemaDoCaractere(nucleo[i], nucleo[i + 1], k);
    if (p) problemas.push(p);
  }
  // Partes só de letras (ex.: "19h" → "h"; "R$" → "R")
  for (const pedaco of nucleo.split(/[^\p{L}]+/u).filter(Boolean)) {
    if (k.globais.has(maiusculas(pedaco))) continue;
    if (pedaco.length > 1) problemas.push(...problemasDeEstrutura(pedaco, k));
  }
  return problemas;
}

/**
 * Confere um texto qualquer (sílaba, palavra ou frase).
 * Devolve a lista de problemas; lista vazia = pode mostrar.
 */
export function problemasDoTexto(texto: string, k: Conhecimento): string[] {
  // Sílabas soltas de uma palavra ("CAR + RO") são conferidas como a palavra inteira.
  if (texto.includes(' + ') && !/\d/.test(texto)) texto = texto.split(/\s*\+\s*/).join('');
  const problemas: string[] = [];
  for (const token of texto.split(/[\s/\-–]+/)) {
    for (const p of problemasDaPalavra(token, k)) problemas.push(`"${limparPalavra(token)}": ${p}`);
  }
  return problemas;
}

export function textoPermitido(texto: string, k: Conhecimento): boolean {
  return problemasDoTexto(texto, k).length === 0;
}

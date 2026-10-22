// Funções pequenas para lidar com textos.

/** Vogais do português, com e sem acento (maiúsculas). */
export const VOGAIS = 'AEIOUÁÉÍÓÚÂÊÔÃÕÀ';

export function ehVogal(letra: string): boolean {
  return VOGAIS.includes(letra.toUpperCase());
}

export function ehLetra(c: string): boolean {
  return /\p{L}/u.test(c);
}

/** Tira acentos: "SÁBADO" → "SABADO". */
export function semAcento(texto: string): string {
  return texto.normalize('NFD').replace(/[̀-ͯ]/g, '');
}

/** Junta espaços repetidos e tira espaço antes de pontuação: "O PAI ." → "O PAI." */
export function normalizarFrase(texto: string): string {
  return texto
    .replace(/\s+/g, ' ')
    .replace(/\s+([.,!?;:])/g, '$1')
    .trim();
}

/** Tira a pontuação das pontas de uma palavra: "PAI." → "PAI". */
export function limparPalavra(palavra: string): string {
  return palavra.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, '');
}

/** Converte para maiúsculas no padrão do português (Ç, acentos). */
export function maiusculas(texto: string): string {
  return texto.toLocaleUpperCase('pt-BR');
}

/** Primeira letra maiúscula: "pai" → "Pai". */
export function capitalizar(texto: string): string {
  return texto.charAt(0).toLocaleUpperCase('pt-BR') + texto.slice(1);
}

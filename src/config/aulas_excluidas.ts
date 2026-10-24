// LISTA DE EXCLUSÃO DE AULAS
//
// O app só traz atividades de RECONHECER letras, sílabas e palavras (ouvir, ler, falar).
// As aulas de caligrafia e coordenação motora ficam só no caderno.
//
// Como mudar:
//  - PARTES_EXCLUIDAS: números das Partes inteiras que não aparecem no app.
//  - AULAS_EXCLUIDAS: números de aulas avulsas que não aparecem no app.
// Aulas excluídas somem da lista de aulas e da revisão.
//
// Além desta lista, o app esconde sozinho as aulas que não têm nenhuma atividade
// de reconhecimento (por exemplo, aulas que são só para fazer no caderno).

/** Parte 1 inteira: Unidade 1 "Meu caderno, meu nome" e Unidade 2 "Preparar a mão" (traços). */
export const PARTES_EXCLUIDAS: number[] = [1];

/** Aulas avulsas excluídas (pelo número que está no caderno). Ex.: [12, 55] */
export const AULAS_EXCLUIDAS: number[] = [];

export function aulaNaListaDeExclusao(aula: { aula: number; parte: number }): boolean {
  return PARTES_EXCLUIDAS.includes(aula.parte) || AULAS_EXCLUIDAS.includes(aula.aula);
}

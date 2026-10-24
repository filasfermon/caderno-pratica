// QUAIS AULAS E ATIVIDADES APARECEM NO APP
//
// - Aulas da lista de exclusão (src/config/aulas_excluidas.ts) não aparecem.
// - Atividades de números e dinheiro podem ser desligadas em src/config/padroes.ts.
// - Aulas que ficam sem nenhuma atividade de reconhecimento também não aparecem.
// Nada disso trava o acesso: toda aula que aparece abre livremente.

import type { Aula, Conteudo } from '../conteudo/tipos';
import type { Atividade, TipoAtividade } from './tipos';
import { ehAtividadeDeNumeros } from './tipos';
import { gerarCandidatas } from './gerar';
import { aulaNaListaDeExclusao } from '../config/aulas_excluidas';
import { MOSTRAR_NUMEROS_E_DINHEIRO } from '../config/padroes';
import { criarSorteio, type Sorteio } from '../util/aleatorio';
import { maiusculas } from '../util/texto';

export interface OpcoesConteudo {
  /** Mostrar atividades de números e dinheiro (valor fixo em src/config/padroes.ts). */
  numeros: boolean;
}

export const OPCOES_PADRAO: OpcoesConteudo = { numeros: MOSTRAR_NUMEROS_E_DINHEIRO };

/** Atividades possíveis de uma aula, já com a lista de exclusão e a chave de números aplicadas. */
export function atividadesDaAula(c: Conteudo, aula: Aula, s: Sorteio, op: OpcoesConteudo = OPCOES_PADRAO): Atividade[] {
  if (aulaNaListaDeExclusao(aula)) return [];
  const lista = gerarCandidatas(c, aula, s);
  return op.numeros ? lista : lista.filter((a) => !ehAtividadeDeNumeros(a));
}

const cache = new WeakMap<Conteudo, Map<string, boolean>>();

/** A aula aparece no app? (não está excluída e tem pelo menos uma atividade) */
export function aulaDisponivel(c: Conteudo, aula: Aula, op: OpcoesConteudo = OPCOES_PADRAO): boolean {
  let mapa = cache.get(c);
  if (!mapa) cache.set(c, (mapa = new Map()));
  const chave = `${aula.aula}|${op.numeros}`;
  if (!mapa.has(chave)) mapa.set(chave, atividadesDaAula(c, aula, criarSorteio(aula.aula), op).length > 0);
  return mapa.get(chave)!;
}

export function aulasDisponiveis(c: Conteudo, op: OpcoesConteudo = OPCOES_PADRAO): Aula[] {
  return c.aulas.filter((a) => aulaDisponivel(c, a, op));
}

/**
 * Tipos que não podem faltar na sessão:
 * nas aulas das vogais (Unidades 3 e 4) e nas aulas "Aprenda" de cada consoante,
 * "Escute e toque a letra", "Escute e toque a sílaba" e "Ouça e fale".
 */
export function tiposObrigatorios(aula: Aula): TipoAtividade[] {
  const tipos = (aula.tipo ?? []).map(maiusculas);
  const deNumeros = tipos.some((t) => t.includes('NÚMEROS'));
  const dasVogais = (aula.unidade === 3 || aula.unidade === 4) && !deNumeros;
  const aprendaConsoante = tipos.includes('APRENDA') && (aula.letras_novas ?? []).length > 0;
  return dasVogais || aprendaConsoante ? ['escute_letra', 'escute_silaba', 'ouca_fale'] : [];
}

/**
 * Confere as aulas aos poucos, quando o celular está parado, para as telas
 * Partes, Unidades e Aulas abrirem sem demora.
 */
export function prepararAulasDisponiveis(c: Conteudo, op: OpcoesConteudo = OPCOES_PADRAO): void {
  if (typeof requestIdleCallback !== 'function') return; // sem esse recurso, confere na hora (como antes)
  let i = 0;
  const passo = (prazo: IdleDeadline) => {
    // Uma aula de cada vez, só enquanto sobra tempo: nunca trava o toque na tela.
    while (i < c.aulas.length && prazo.timeRemaining() > 8) aulaDisponivel(c, c.aulas[i++], op);
    if (i < c.aulas.length) requestIdleCallback(passo);
  };
  requestIdleCallback(passo);
}

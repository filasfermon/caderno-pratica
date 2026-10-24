// PROGRESSO DO ESTUDANTE e REPETIÇÃO ESPAÇADA (estilo Leitner, por item).
//
// Cada item praticado fica numa "caixa" de 1 a 5:
//   acertou de primeira → sobe uma caixa (volta mais tarde);
//   errou               → volta para a caixa 1 (volta logo, na próxima sessão).
// Caixa 1 volta na próxima sessão; 2 → daqui a 2 sessões; 3 → 4; 4 → 8; 5 → 16.
// Tudo fica guardado só neste aparelho.

import { lerLocal, gravarLocal, apagarLocal } from './local';

export interface ItemLeitner {
  caixa: number;
  /** Número da sessão a partir da qual o item volta para revisão. */
  proxima: number;
  aula: number;
  vezes: number;
}

export interface Progresso {
  sessoes: number;
  ultimaAula: number | null;
  aulas: Record<string, { vezes: number; ultima: number }>;
  itens: Record<string, ItemLeitner>;
  /** Tipos de atividade que o estudante já viu (para mostrar a demonstração só na primeira vez). */
  tiposVistos: string[];
  /** Quando o progresso mudou pela última vez (para juntar com a cópia da conta Google). */
  atualizado?: number;
}

export const INTERVALOS = [0, 1, 2, 4, 8, 16];

function vazio(): Progresso {
  return { sessoes: 0, ultimaAula: null, aulas: {}, itens: {}, tiposVistos: [] };
}

let atual: Progresso = { ...vazio(), ...lerLocal<Partial<Progresso>>('progresso', {}) };

export function progresso(): Progresso {
  return atual;
}

/** "apagado" = o professor apagou o progresso (a cópia da conta também deve ser apagada). */
type Ouvinte = (p: Progresso, motivo: 'mudou' | 'apagado') => void;
const ouvintes = new Set<Ouvinte>();

/** Avisa quando o progresso muda (usado pela sincronização com a conta Google). */
export function aoMudarProgresso(cb: Ouvinte): () => void {
  ouvintes.add(cb);
  return () => ouvintes.delete(cb);
}

function salvar(): void {
  atual.atualizado = Date.now();
  gravarLocal('progresso', atual);
  ouvintes.forEach((cb) => cb(atual, 'mudou'));
}

/** Troca o progresso do aparelho (ex.: depois de juntar com a cópia da conta). */
export function substituirProgresso(p: Progresso): void {
  atual = { ...vazio(), ...p };
  gravarLocal('progresso', atual);
}

/** Registra o resultado de um item (true = acertou de primeira). */
export function registrarItem(p: Progresso, chave: string, aula: number, acertouDePrimeira: boolean): void {
  const antes = p.itens[chave];
  const caixa = acertouDePrimeira ? Math.min(5, (antes?.caixa ?? 1) + 1) : 1;
  p.itens[chave] = { caixa, proxima: p.sessoes + INTERVALOS[caixa], aula, vezes: (antes?.vezes ?? 0) + 1 };
}

export function marcarResultado(chave: string, aula: number, acertouDePrimeira: boolean): void {
  registrarItem(atual, chave, aula, acertouDePrimeira);
  salvar();
}

/** Itens que já devem voltar (de aulas anteriores à aula indicada), os mais difíceis primeiro. */
export function itensParaRevisar(p: Progresso, antesDaAula: number): [string, ItemLeitner][] {
  return Object.entries(p.itens)
    .filter(([, it]) => it.aula < antesDaAula && it.proxima <= p.sessoes)
    .sort(([, a], [, b]) => a.caixa - b.caixa || a.proxima - b.proxima);
}

export function iniciarSessao(aula: number): void {
  atual.sessoes += 1;
  atual.ultimaAula = aula;
  salvar();
}

export function terminarSessao(aula: number): void {
  const reg = atual.aulas[aula] ?? { vezes: 0, ultima: 0 };
  atual.aulas[aula] = { vezes: reg.vezes + 1, ultima: Date.now() };
  atual.ultimaAula = aula;
  salvar();
}

export function jaViuTipo(tipo: string): boolean {
  return atual.tiposVistos.includes(tipo);
}

export function marcarTipoVisto(tipo: string): void {
  if (!atual.tiposVistos.includes(tipo)) {
    atual.tiposVistos.push(tipo);
    salvar();
  }
}

/** Mostrar as demonstrações de novo (modo professor). */
export function esquecerDemonstracoes(): void {
  atual.tiposVistos = [];
  salvar();
}

/** Apaga todo o progresso do estudante neste aparelho (modo professor). */
export function zerarProgresso(): void {
  atual = vazio();
  apagarLocal('progresso');
  atual.atualizado = Date.now();
  ouvintes.forEach((cb) => cb(atual, 'apagado'));
}

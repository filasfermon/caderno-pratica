// Configurações do app. Ficam no modo professor, para o estudante não se perder.

import { lerLocal, gravarLocal } from './local';

export type TamanhoTexto = 'normal' | 'grande' | 'muito-grande';

export interface Config {
  tamanhoTexto: TamanhoTexto;
  /** Velocidade da voz do aparelho (1 = normal). Padrão 0,85. */
  velocidade: number;
  /** Como a voz lê E e O nas sílabas: aberta (é, ó) ou fechada (ê, ô). */
  vogalE: 'aberta' | 'fechada';
  vogalO: 'aberta' | 'fechada';
  animacoes: boolean;
  /** Nome da voz escolhida pelo professor (vazio = a melhor voz pt-BR do aparelho). */
  voz: string;
  /** Quantas atividades por sessão (8 a 12). */
  atividadesPorSessao: number;
  /** Chave "MOSTRAR ATIVIDADES DE NÚMEROS E DINHEIRO" (ligada por padrão). */
  mostrarNumeros: boolean;
}

const PADRAO: Config = {
  tamanhoTexto: 'normal',
  velocidade: 0.85,
  vogalE: 'aberta',
  vogalO: 'aberta',
  animacoes: true,
  voz: '',
  atividadesPorSessao: 10,
  mostrarNumeros: true,
};

let atual: Config = { ...PADRAO, ...lerLocal<Partial<Config>>('config', {}) };

export function config(): Config {
  return atual;
}

export function mudarConfig(mudancas: Partial<Config>): void {
  atual = { ...atual, ...mudancas };
  gravarLocal('config', atual);
  aplicarConfigNaTela();
}

/** Aplica tamanho do texto e animações na página. */
export function aplicarConfigNaTela(): void {
  const raiz = document.documentElement;
  raiz.dataset.tamanho = atual.tamanhoTexto;
  const reduzir = !atual.animacoes || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  raiz.dataset.animacoes = reduzir ? 'nao' : 'sim';
}

export function animacoesLigadas(): boolean {
  return document.documentElement.dataset.animacoes !== 'nao';
}

/** Opções que mudam quais aulas e atividades aparecem. */
export function opcoesDoConteudo(): { numeros: boolean } {
  return { numeros: atual.mostrarNumeros };
}

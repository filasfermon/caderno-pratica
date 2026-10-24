// Como uma tela de atividade conversa com a sessão.

import type { ItemAudio } from '../../audio/pronuncia';
import type { OpcoesFala } from '../../audio/voz';
import type { Sorteio } from '../../util/aleatorio';

/** O que a sessão oferece para a atividade. */
export interface Contexto {
  /** Onde a atividade se desenha. */
  area: HTMLElement;
  sorteio: Sorteio;
  /** Avisa que o estudante acertou. "resposta" é o que ele respondeu (mostrado se ele voltar). */
  acertou(resposta?: string): void;
  /** Avisa um erro. 1º erro: "Vamos tentar de novo". 2º erro: mostra a resposta. */
  errou(resposta?: string): void;
  /** Erro "pequeno" numa atividade de várias partes (ex.: um par do Ligue): só pede nova tentativa. */
  errouParcial(): void;
  /** Para atividades sem certo/errado (Conheça, Leia, Ouça e fale): conta como feita. */
  concluir(): void;
  /** Vai para a próxima atividade (botão SEGUIR do "Ouça e fale"). */
  seguir(): void;
  falar(item: ItemAudio, opcoes?: OpcoesFala): Promise<void>;
  /** true durante a demonstração animada. */
  emDemonstracao(): boolean;
}

/** Um passo da demonstração: o elemento que a "mão" vai tocar. */
export type PassoDemo = () => HTMLElement | null | undefined;

/** O que a atividade devolve para a sessão. */
export interface Controle {
  /** Fala o modelo (ex.: a sílaba a achar). Chamado depois da instrução e ao errar. */
  modelo?(): Promise<void>;
  /** Volta ao começo depois de um erro (limpa o que foi montado). */
  reiniciar?(): void;
  /** Mostra a resposta certa destacada e a lê em voz alta (depois do 2º erro). */
  mostrarResposta?(): Promise<void>;
  /** Fala a resposta certa depois do acerto (ex.: a palavra formada). */
  aoAcertar?(): Promise<void>;
  /** Os toques da demonstração, em ordem. */
  passosDemo?(): PassoDemo[];
  /** Impede novos toques (atividade terminada). */
  travar?(): void;
}

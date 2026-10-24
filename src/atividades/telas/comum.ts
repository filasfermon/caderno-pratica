// Peças de tela usadas por várias atividades.

import { el } from '../../util/dom';
import { icones } from '../../ui/icones';
import type { ItemAudio } from '../../audio/pronuncia';
import { falar } from '../../audio/voz';
import { cancelarGravacaoEmAndamento, podeGravar } from '../../audio/gravador';
import { criarPainelGravacao } from '../../ui/painel-gravacao';
import type { Contexto } from './contrato';
import { config } from '../../dados/config';

/** Texto que, tocado, é lido em voz alta. */
export function tocavel(texto: string, item: ItemAudio, classe = ''): HTMLButtonElement {
  return el('button', { type: 'button', class: `tocavel ${classe}`, onclick: () => falar(item), 'aria-label': `${texto}. Toque para ouvir.` }, texto);
}

/** Botão grande de alto-falante ("ouvir de novo"). */
export function botaoOuvirDeNovo(acao: () => void, rotulo = 'OUVIR DE NOVO'): HTMLButtonElement {
  return el('button', { type: 'button', class: 'botao', onclick: acao }, icones.altoFalante(30), rotulo);
}

export interface OpcaoEscolha {
  conteudo: string | Node;
  certa: boolean;
  /** Nome lido por leitores de tela (quando o conteúdo é um desenho). */
  rotulo?: string;
  classe?: string;
}

export interface Escolha {
  botoes: HTMLButtonElement[];
  certo: HTMLButtonElement;
  mostrarCerta(): void;
  travar(): void;
}

/**
 * Opções com palavras compridas ficam numa coluna só, para as letras continuarem grandes
 * (no mínimo 40 px) mesmo no celular pequeno e no "texto muito grande".
 */
export function classeDasColunas(opcoes: string[]): string {
  const limite = config().tamanhoTexto === 'normal' ? 5 : 3;
  return opcoes.some((o) => o.length > limite) ? 'uma-coluna' : '';
}

/**
 * Grade de opções: toque na certa. A errada fica apagadinha (sem "X", sem som de erro).
 * As opções NÃO falam ao toque (falar entregaria a resposta).
 */
export function criarEscolha(ctx: Contexto, opcoes: OpcaoEscolha[], classeGrade = ''): { grade: HTMLElement; escolha: Escolha } {
  const botoes: HTMLButtonElement[] = [];
  let travado = false;
  const travar = () => {
    travado = true;
    botoes.forEach((b) => (b.disabled = true));
  };
  opcoes.forEach((o) => {
    const b = el(
      'button',
      { type: 'button', class: `opcao ${o.classe ?? ''}`, 'aria-label': o.rotulo, 'data-certo': o.certa ? 'sim' : 'nao' },
      o.conteudo,
    );
    b.addEventListener('click', () => {
      if (travado) return;
      const resposta = typeof o.conteudo === 'string' ? o.conteudo : o.rotulo;
      if (o.certa) {
        b.classList.add('certa');
        travar();
        ctx.acertou(resposta);
      } else {
        b.classList.add('tentou');
        b.disabled = true;
        ctx.errou(resposta);
      }
    });
    botoes.push(b);
  });
  const certo = botoes[opcoes.findIndex((o) => o.certa)];
  const grade = el('div', { class: `opcoes ${classeGrade}`, role: 'group' }, ...botoes);
  return {
    grade,
    escolha: {
      botoes,
      certo,
      mostrarCerta: () => {
        certo.classList.add('certa', 'destaque');
        travar();
      },
      travar,
    },
  };
}

/** Linha onde a resposta vai sendo montada (sílabas, letras, palavras). */
export function criarMontagem(vagas: number, classePeca = ''): {
  caixa: HTMLElement;
  pecas: string[];
  por(texto: string): void;
  tirarUltima(): string | undefined;
  limpar(): void;
  preencher(textos: string[]): void;
  marcarCerta(): void;
} {
  const caixa = el('div', { class: 'montagem', 'aria-live': 'polite', 'data-montagem': '' });
  const pecas: string[] = [];
  const desenhar = () => {
    caixa.replaceChildren(
      ...pecas.map((p) => el('span', { class: `peca ${classePeca}` }, p)),
      ...Array.from({ length: Math.max(0, vagas - pecas.length) }, () => el('span', { class: 'vazio', 'aria-hidden': 'true' })),
    );
  };
  desenhar();
  return {
    caixa,
    pecas,
    por(t) {
      pecas.push(t);
      desenhar();
    },
    tirarUltima() {
      const t = pecas.pop();
      desenhar();
      return t;
    },
    limpar() {
      pecas.length = 0;
      caixa.classList.remove('certa');
      desenhar();
    },
    preencher(textos) {
      pecas.length = 0;
      pecas.push(...textos);
      desenhar();
    },
    marcarCerta() {
      caixa.classList.add('certa');
    },
  };
}

/** Desliga o microfone se o estudante sair da tela no meio de uma gravação. */
export function pararGravacaoDoEstudante(): void {
  cancelarGravacaoEmAndamento();
}

/**
 * "Ouça e repita": o estudante grava a própria leitura e ouve em seguida,
 * comparando com o modelo. Sem avaliação automática. A última gravação de cada
 * item fica guardada só neste aparelho.
 */
export function criarOucaERepita(chave: string, texto: string, modelo: () => void, aoGravar?: () => void): HTMLElement | null {
  if (!podeGravar()) return null;
  return criarPainelGravacao({ gaveta: 'aluno', chave: `aluno:${chave}`, texto, modelo, aoSalvar: () => aoGravar?.() }).elemento;
}

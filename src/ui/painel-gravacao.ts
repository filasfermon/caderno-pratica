// Painel de gravação de voz (estudante e professor).
//
// GRAVAR → (licença do microfone) → PARAR vermelho, com ponto piscando e contador de segundos
//        → SALVANDO... → a gravação toca sozinha uma vez → OUVIR DE NOVO.
// Se o microfone for negado ou não existir: aviso falado e escrito + TENTAR DE NOVO.
// Nada aqui trava a atividade: o estudante sempre pode seguir.

import { el } from '../util/dom';
import { icones } from './icones';
import { Gravador, LIMITE_SEGUNDOS, type EstadoGravacao, type Gravacao } from '../audio/gravador';
import { destravarAudio, falar, pararFala, tocarAudio } from '../audio/voz';
import { guardar, ler, type Audio, type Gaveta } from '../dados/banco';

export interface OpcoesPainel {
  /** Onde a gravação é guardada no aparelho. */
  gaveta: Extract<Gaveta, 'aluno' | 'gravacoes'>;
  chave: string;
  texto: string;
  /** Botão MODELO (a voz do modelo). */
  modelo?: () => void;
  /** Avisado depois que a gravação foi salva (e começou a tocar). */
  aoSalvar?: (g: Gravacao) => void;
  rotuloGravar?: string;
}

export const AVISO_MICROFONE = 'Para gravar, permita o uso do microfone.';
const AVISO_SEM_SUPORTE = 'Este navegador não grava a voz. Use o Chrome ou o Safari atualizados.';
const AVISO_FALHOU = 'A gravação não deu certo. Tente de novo.';

function relogio(s: number): string {
  return `0:${String(s).padStart(2, '0')}`;
}

export function criarPainelGravacao(op: OpcoesPainel): { elemento: HTMLElement; gravador: Gravador } {
  const gravador = new Gravador();
  const rotuloGravar = op.rotuloGravar ?? 'GRAVAR';
  const principal = el('button', { type: 'button', class: 'botao', 'data-gravar': '' });
  const ouvir = el('button', { type: 'button', class: 'botao', disabled: true, 'data-ouvir-gravacao': '', 'aria-label': 'Ouvir a minha gravação de novo' }, icones.tocar(28), 'OUVIR DE NOVO');
  const modelo = op.modelo
    ? el('button', { type: 'button', class: 'botao', 'data-ouvir-modelo': '', 'aria-label': 'Ouvir o modelo' }, icones.altoFalante(28), 'MODELO')
    : null;
  const aviso = el('p', { class: 'aviso-gravacao', 'aria-live': 'polite' });
  const elemento = el(
    'div',
    { class: 'painel-gravacao', 'data-estado': 'parado' },
    el('div', { class: `botoes-gravacao${modelo ? '' : ' dois'}` }, principal, ouvir, modelo),
    aviso,
  );

  const desenhar = (estado: EstadoGravacao) => {
    elemento.dataset.estado = estado;
    principal.classList.remove('gravando');
    principal.disabled = estado === 'pedindo' || estado === 'processando';
    ouvir.disabled = !gravador.ultima || estado === 'gravando' || estado === 'pedindo';
    switch (estado) {
      case 'parado':
        principal.replaceChildren(icones.microfone(28), rotuloGravar);
        principal.setAttribute('aria-label', 'Gravar a minha voz');
        aviso.textContent = '';
        break;
      case 'pedindo':
        principal.replaceChildren(icones.microfone(28), 'AGUARDE...');
        aviso.textContent = 'SE O CELULAR PERGUNTAR, TOQUE EM PERMITIR.';
        break;
      case 'gravando':
        principal.classList.add('gravando');
        principal.setAttribute('aria-label', 'Parar a gravação');
        principal.replaceChildren(
          el('span', { class: 'ponto-gravando', 'aria-hidden': 'true' }),
          'PARAR',
          el('span', { class: 'contador', 'data-contador': '' }, relogio(gravador.segundos)),
        );
        aviso.textContent = `GRAVANDO... FALE AGORA. (ATÉ ${LIMITE_SEGUNDOS} SEGUNDOS)`;
        break;
      case 'processando':
        principal.replaceChildren('SALVANDO...');
        aviso.textContent = '';
        break;
      case 'pronto':
        principal.replaceChildren(icones.microfone(28), 'GRAVAR DE NOVO');
        principal.setAttribute('aria-label', 'Gravar de novo');
        aviso.textContent = '';
        break;
      case 'erro': {
        const texto = gravador.erro === 'nao-suportado' ? AVISO_SEM_SUPORTE : gravador.erro === 'falhou' ? AVISO_FALHOU : AVISO_MICROFONE;
        principal.replaceChildren(icones.microfone(28), 'TENTAR DE NOVO');
        principal.setAttribute('aria-label', 'Tentar gravar de novo');
        aviso.textContent = texto.toLocaleUpperCase('pt-BR');
        void falar({ categoria: 'retorno', texto });
        break;
      }
    }
  };
  gravador.aoMudar = desenhar;
  gravador.aoContar = (s) => {
    const c = principal.querySelector('[data-contador]');
    if (c) c.textContent = relogio(s);
  };

  const tocar = (blob: Blob) =>
    tocarAudio(blob, {
      aoComecar: () => {
        elemento.dataset.tocou = 'sim';
      },
    });

  /** Depois de parar: salva no aparelho e toca a gravação na hora, uma vez. */
  const concluir = async (g: Gravacao | null) => {
    if (!g) return;
    try {
      await guardar<Audio>(op.gaveta, { chave: op.chave, texto: op.texto, blob: g.blob, mime: g.mime, data: Date.now() });
      elemento.dataset.salvo = 'sim';
    } catch {
      /* sem banco (navegação privada): a gravação ainda toca nesta tela */
    }
    gravador.marcarPronto();
    op.aoSalvar?.(g);
    void tocar(g.blob);
  };
  gravador.aoPararSozinho = (g) => void concluir(g);

  principal.addEventListener('click', async () => {
    if (gravador.estado === 'gravando') {
      destravarAudio(); // dentro do toque: o áudio seguinte pode tocar (iPhone)
      await concluir(await gravador.parar());
      return;
    }
    pararFala();
    await gravador.iniciar();
  });
  ouvir.addEventListener('click', () => gravador.ultima && void tocar(gravador.ultima.blob));
  modelo?.addEventListener('click', () => op.modelo!());

  desenhar('parado');
  // Se já existe uma gravação salva deste item, ela fica pronta para ouvir.
  void ler<Audio>(op.gaveta, op.chave).then((salva) => {
    if (salva && gravador.estado === 'parado') {
      gravador.ultima = { blob: salva.blob, mime: salva.mime };
      gravador.marcarPronto();
    }
  });
  return { elemento, gravador };
}

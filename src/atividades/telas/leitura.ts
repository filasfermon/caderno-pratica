// Telas das atividades de leitura: Conheça, Escute e toque, Monte a sílaba,
// Complete a palavra, Forme a palavra, Quantas sílabas, Leia com a voz, Ordene a frase.

import { el } from '../../util/dom';
import { icones } from '../../ui/icones';
import type { ItemAudio } from '../../audio/pronuncia';
import { falar, geracaoAtual } from '../../audio/voz';
import type {
  CompletePalavra,
  Conheca,
  EscutePalavra,
  EscuteSilaba,
  FormePalavra,
  Leia,
  MonteSilaba,
  Ordene,
  QuantasSilabas,
  Tutorial,
} from '../tipos';
import type { Contexto, Controle, PassoDemo } from './contrato';
import { botaoOuvirDeNovo, classeDasColunas, criarEscolha, criarMontagem, criarOucaERepita, tocavel } from './comum';

const itemDe = (texto: string, categoria: ItemAudio['categoria']): ItemAudio => ({ categoria, texto });

// ---------- Tutorial (aulas sem conteúdo praticável, Parte 1) ----------

export function montarTutorial(_a: Tutorial, ctx: Contexto): Controle {
  const botao = el(
    'button',
    { type: 'button', class: 'botao principal', 'data-certo': 'sim', style: { minHeight: '140px', fontSize: '1.8rem' } },
    icones.certo(40),
    'TOQUE AQUI',
  );
  let feito = false;
  botao.addEventListener('click', () => {
    if (feito) return;
    feito = true;
    ctx.acertou();
  });
  ctx.area.append(
    el('p', { class: 'etiqueta' }, 'ESTA AULA É FEITA NO CADERNO, COM O PROFESSOR. AQUI VOCÊ TREINA COMO USAR O APLICATIVO.'),
    el('div', { style: { flex: '1', display: 'grid', placeItems: 'center' } }, botao),
  );
  return { passosDemo: () => [() => botao], travar: () => (feito = true) };
}

// ---------- 1. Conheça ----------

export function montarConheca(a: Conheca, ctx: Contexto): Controle {
  const categoria = a.categoria === 'par' || a.categoria === 'letra' ? 'letra' : a.categoria === 'silaba' ? 'silaba' : 'palavra';
  const item = itemDe(a.alvo, categoria);
  const grande = a.alvo.length <= 4 ? 'leitura-gigante' : 'leitura';
  const alvo = el('button', { type: 'button', class: `tocavel ${grande}`, 'aria-label': `${a.alvo}. Toque para ouvir.`, 'data-certo': 'sim' }, a.alvo);
  const cartaz = el('div', { class: 'cartaz' }, alvo);
  if (a.silabas && a.silabas.length > 1) {
    const linha = el('div', { class: 'silabas-da-palavra' });
    a.silabas.forEach((s, i) => {
      if (i) linha.append(' · ');
      linha.append(tocavel(s, itemDe(s, 'silaba')));
    });
    cartaz.append(linha);
  }
  alvo.addEventListener('click', () => void ctx.falar(item));
  ctx.area.append(cartaz);
  const repita = criarOucaERepita(() => void ctx.falar(item));
  if (repita) ctx.area.append(repita);
  return {
    modelo: async () => {
      await ctx.falar(item);
      ctx.concluir();
    },
    passosDemo: () => [() => alvo],
  };
}

// ---------- 2 e 7. Escute e toque a sílaba / letra / palavra certa ----------

export function montarEscute(a: EscuteSilaba | EscutePalavra, ctx: Contexto): Controle {
  const categoria: ItemAudio['categoria'] = a.categoria === 'letra' ? 'letra' : a.categoria === 'silaba' ? 'silaba' : 'palavra';
  const item = itemDe(a.alvo, categoria);
  const { grade, escolha } = criarEscolha(
    ctx,
    a.opcoes.map((o) => ({ conteudo: o, certa: o === a.alvo, classe: 'leitura' })),
    classeDasColunas(a.opcoes),
  );
  ctx.area.append(botaoOuvirDeNovo(() => void ctx.falar(item)), grade);
  return {
    modelo: () => ctx.falar(item),
    mostrarResposta: async () => {
      escolha.mostrarCerta();
      await ctx.falar(item);
    },
    aoAcertar: () => ctx.falar(item),
    passosDemo: () => [() => escolha.certo],
    travar: escolha.travar,
  };
}

// ---------- Montar com peças (sílabas, palavras) — usado por várias atividades ----------

interface ConfigPecas {
  opcoes: string[];
  resposta: string[];
  fala: (peca: string) => ItemAudio;
  classeOpcao?: string;
  classePeca?: string;
  /** Teclas que podem ser usadas mais de uma vez (teclado). */
  reutilizavel?: boolean;
  classeGrade?: string;
  /** Compara a montagem com a resposta (padrão: peça por peça). */
  confere?: (montada: string[]) => boolean;
}

export interface Pecas {
  montagem: ReturnType<typeof criarMontagem>;
  grade: HTMLElement;
  apagar: HTMLButtonElement;
  reiniciar(): void;
  mostrarResposta(): void;
  travar(): void;
  passosDemo(): PassoDemo[];
}

export function criarPecas(ctx: Contexto, cfg: ConfigPecas): Pecas {
  const montagem = criarMontagem(cfg.resposta.length, cfg.classePeca);
  const usados: HTMLButtonElement[] = [];
  let travado = false;
  const confere = cfg.confere ?? ((m: string[]) => m.length === cfg.resposta.length && m.every((x, i) => x === cfg.resposta[i]));
  const botoes = cfg.opcoes.map((t) => {
    const b = el('button', { type: 'button', class: `opcao ${cfg.classeOpcao ?? 'leitura'}`, 'data-peca': t }, t);
    b.addEventListener('click', () => {
      if (travado || montagem.pecas.length >= cfg.resposta.length) return;
      void falar(cfg.fala(t));
      montagem.por(t);
      if (!cfg.reutilizavel) {
        b.disabled = true;
        b.classList.add('usada');
        usados.push(b);
      }
      if (montagem.pecas.length === cfg.resposta.length) {
        if (confere(montagem.pecas)) {
          travado = true;
          montagem.marcarCerta();
          botoes.forEach((x) => (x.disabled = true));
          ctx.acertou();
        } else ctx.errou();
      }
    });
    return b;
  });
  const apagar = el('button', { type: 'button', class: 'botao-icone contorno', 'aria-label': 'Apagar a última' }, icones.apagar(26), 'APAGAR');
  apagar.addEventListener('click', () => {
    if (travado) return;
    montagem.tirarUltima();
    const b = usados.pop();
    if (b) {
      b.disabled = false;
      b.classList.remove('usada');
    }
  });
  const grade = el('div', { class: `opcoes ${cfg.classeGrade ?? ''}`, role: 'group' }, ...botoes);
  return {
    montagem,
    grade,
    apagar,
    reiniciar() {
      montagem.limpar();
      usados.length = 0;
      botoes.forEach((b) => {
        b.disabled = false;
        b.classList.remove('usada');
      });
    },
    mostrarResposta() {
      travado = true;
      montagem.preencher(cfg.resposta);
      montagem.marcarCerta();
      botoes.forEach((b) => (b.disabled = true));
    },
    travar() {
      travado = true;
      botoes.forEach((b) => (b.disabled = true));
    },
    passosDemo: () =>
      cfg.resposta.map((peca) => () => botoes.find((b) => b.dataset.peca === peca && !b.disabled)),
  };
}

function linhaDeApagar(pecas: Pecas): HTMLElement {
  return el('div', { style: { display: 'flex', justifyContent: 'flex-end' } }, pecas.apagar);
}

// ---------- 3. Monte a sílaba ----------

export function montarMonteSilaba(a: MonteSilaba, ctx: Contexto): Controle {
  const item = itemDe(a.alvo, 'silaba');
  const pecas = criarPecas(ctx, { opcoes: a.opcoes, resposta: a.pecas, fala: (t) => itemDe(t, 'tecla') });
  ctx.area.append(botaoOuvirDeNovo(() => void ctx.falar(item)), pecas.montagem.caixa, linhaDeApagar(pecas), pecas.grade);
  return {
    modelo: () => ctx.falar(item),
    reiniciar: pecas.reiniciar,
    mostrarResposta: async () => {
      pecas.mostrarResposta();
      await ctx.falar(item);
    },
    aoAcertar: () => ctx.falar(item),
    passosDemo: pecas.passosDemo,
    travar: pecas.travar,
  };
}

// ---------- 4. Complete a palavra com a sílaba que falta ----------

export function montarCompletePalavra(a: CompletePalavra, ctx: Contexto): Controle {
  const item = itemDe(a.palavra, 'palavra');
  const lacuna = el('span', { class: 'lacuna' }, ' ');
  const palavra = el(
    'div',
    { class: 'palavra-com-lacuna leitura-gigante', style: { fontSize: a.silabas.length > 3 ? '3rem' : undefined } },
    ...a.silabas.map((s, i) => (i === a.falta ? el('span', {}, el('span', { class: 'visualmente-oculto' }, 'sílaba que falta:'), lacuna) : el('span', {}, s))),
  );
  const { grade, escolha } = criarEscolha(
    ctx,
    a.opcoes.map((o) => ({ conteudo: o, certa: o === a.silabas[a.falta], classe: 'leitura' })),
    classeDasColunas(a.opcoes),
  );
  ctx.area.append(el('div', { class: 'cartaz' }, palavra), botaoOuvirDeNovo(() => void ctx.falar(item)), grade);
  const preencher = () => {
    lacuna.textContent = a.silabas[a.falta];
  };
  return {
    modelo: () => ctx.falar(item),
    mostrarResposta: async () => {
      escolha.mostrarCerta();
      preencher();
      await ctx.falar(item);
    },
    aoAcertar: async () => {
      preencher();
      await ctx.falar(item);
    },
    passosDemo: () => [() => escolha.certo],
    travar: escolha.travar,
  };
}

// ---------- 5. Forme a palavra ----------

export function montarFormePalavra(a: FormePalavra, ctx: Contexto): Controle {
  const item = itemDe(a.palavra, 'palavra');
  const pecas = criarPecas(ctx, {
    opcoes: a.embaralhadas,
    resposta: a.partes,
    fala: (t) => itemDe(t, 'silaba'),
    // Sílabas repetidas (CO + CO) podem vir em qualquer ordem: vale o resultado.
    confere: (m) => m.join('') === a.partes.join(''),
  });
  ctx.area.append(botaoOuvirDeNovo(() => void ctx.falar(item)), pecas.montagem.caixa, linhaDeApagar(pecas), pecas.grade);
  return {
    modelo: () => ctx.falar(item),
    reiniciar: pecas.reiniciar,
    mostrarResposta: async () => {
      pecas.mostrarResposta();
      await ctx.falar(item);
    },
    aoAcertar: () => ctx.falar(item),
    passosDemo: pecas.passosDemo,
    travar: pecas.travar,
  };
}

// ---------- 6. Quantas sílabas? ----------

export function montarQuantas(a: QuantasSilabas, ctx: Contexto): Controle {
  const item = itemDe(a.palavra, 'palavra');
  const palavra = el('button', { type: 'button', class: 'tocavel leitura-gigante', 'aria-label': `${a.palavra}. Toque para ouvir.` }, a.palavra);
  palavra.addEventListener('click', () => void ctx.falar(item));
  const divisao = el('div', { class: 'silabas-da-palavra', 'aria-live': 'polite' });
  const { grade, escolha } = criarEscolha(
    ctx,
    a.opcoes.map((n) => ({ conteudo: String(n), certa: n === a.silabas.length, classe: 'leitura', rotulo: String(n) })),
  );
  ctx.area.append(el('div', { class: 'cartaz' }, palavra, divisao), grade);
  const mostrarDivisao = async () => {
    divisao.textContent = a.silabas.join(' · ');
    for (const s of a.silabas) await falar(itemDe(s, 'silaba'));
  };
  return {
    modelo: () => ctx.falar(item),
    mostrarResposta: async () => {
      escolha.mostrarCerta();
      await mostrarDivisao();
    },
    aoAcertar: mostrarDivisao,
    passosDemo: () => [() => escolha.certo],
    travar: escolha.travar,
  };
}

// ---------- 11. Leia com a voz (karaokê) ----------

export function montarLeia(a: Leia, ctx: Contexto): Controle {
  const linhas: HTMLElement[][] = [];
  const caixa = el('div', { class: 'texto-leitura' });
  a.linhas.forEach((linha) => {
    const spans = linha
      .split(/\s+/)
      .filter(Boolean)
      .map((p) => {
        const b = el('button', { type: 'button', class: 'tocavel palavra' }, p);
        b.addEventListener('click', () => void ctx.falar(itemDe(p.replace(/[.,!?;:"“”]/g, ''), 'palavra')));
        return b;
      });
    linhas.push(spans);
    caixa.append(el('div', { class: 'linha' }, ...spans));
  });
  const limparDestaque = () => linhas.flat().forEach((s) => s.classList.remove('lendo'));
  const lerTudo = async () => {
    for (let i = 0; i < a.linhas.length; i++) {
      const antes = geracaoAtual();
      await ctx.falar(itemDe(a.linhas[i], 'frase'), {
        aoLerPalavra: (k) => {
          limparDestaque();
          linhas[i][k]?.classList.add('lendo');
        },
      });
      if (geracaoAtual() !== antes + 1) break; // outra fala interrompeu
    }
    limparDestaque();
  };
  const ouvir = botaoOuvirDeNovo(() => void lerTudo());
  ctx.area.append(caixa, ouvir);
  const repita = criarOucaERepita(() => void lerTudo());
  if (repita) ctx.area.append(el('p', { class: 'etiqueta' }, 'AGORA LEIA SOZINHO. SE QUISER, GRAVE A SUA LEITURA.'), repita);
  return {
    modelo: async () => {
      await lerTudo();
      ctx.concluir();
    },
    passosDemo: () => [() => ouvir],
  };
}

// ---------- 12. Ordene a frase ----------

export function montarOrdene(a: Ordene, ctx: Contexto): Controle {
  const item = itemDe(a.frase, 'frase');
  const pecas = criarPecas(ctx, {
    opcoes: a.embaralhadas,
    resposta: a.palavras,
    fala: (t) => itemDe(t.replace(/[.,!?;:]/g, ''), 'palavra'),
    classeOpcao: '',
    classePeca: 'frase',
    classeGrade: '',
    confere: (m) => m.join(' ') === a.palavras.join(' '),
  });
  pecas.grade.querySelectorAll('button').forEach((b) => (b.style.fontSize = '1.6rem'));
  ctx.area.append(botaoOuvirDeNovo(() => void ctx.falar(item)), pecas.montagem.caixa, linhaDeApagar(pecas), pecas.grade);
  return {
    modelo: () => ctx.falar(item),
    reiniciar: pecas.reiniciar,
    mostrarResposta: async () => {
      pecas.mostrarResposta();
      await ctx.falar(item);
    },
    aoAcertar: () => ctx.falar(item),
    passosDemo: pecas.passosDemo,
    travar: pecas.travar,
  };
}

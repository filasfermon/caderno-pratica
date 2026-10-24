// Telas de escrita e de frases: Escreva a palavra, Complete a frase, Ligue e Maiúscula/minúscula.

import { el, svg } from '../../util/dom';
import type { ItemAudio } from '../../audio/pronuncia';
import { falar, falarEmSequencia } from '../../audio/voz';
import type { CompleteFrase, Escreva, Ligue, Maiuscula } from '../tipos';
import type { Contexto, Controle, PassoDemo } from './contrato';
import { botaoOuvirDeNovo, classeDasColunas, criarEscolha } from './comum';
import { criarPecas } from './leitura';

const itemDe = (texto: string, categoria: ItemAudio['categoria']): ItemAudio => ({ categoria, texto });

// ---------- 8. Escreva a palavra que ouviu ----------

export function montarEscreva(a: Escreva, ctx: Contexto): Controle {
  const item = itemDe(a.palavra, 'palavra');
  const pecas = criarPecas(ctx, {
    opcoes: a.teclas,
    resposta: a.resposta,
    fala: (t) => itemDe(t, 'tecla'),
    reutilizavel: true,
    classeOpcao: 'tecla',
    classeGrade: a.modo === 'silabas' ? 'teclado silabas' : 'teclado',
    confere: (m) => m.join('') === a.resposta.join(''),
  });
  pecas.apagar.classList.add('tecla', 'acao');
  pecas.apagar.classList.remove('botao-icone', 'contorno');
  pecas.grade.append(pecas.apagar);
  ctx.area.append(botaoOuvirDeNovo(() => void ctx.falar(item)), pecas.montagem.caixa, pecas.grade);
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

// ---------- 9. Complete a frase ----------

export function montarCompleteFrase(a: CompleteFrase, ctx: Contexto): Controle {
  const comLacuna = itemDe(a.frase, 'frase');
  const completa = itemDe(a.frase.replace('____', a.resposta), 'frase');
  const lacuna = el('span', { class: 'lacuna' }, ' ');
  const partes = a.frase.split('____');
  const fraseEl = el('p', { class: 'frase-grande' });
  partes.forEach((parte, i) => {
    parte
      .split(/\s+/)
      .filter(Boolean)
      .forEach((p) => {
        if (/^[.,!?;:]$/.test(p)) fraseEl.append(p);
        else fraseEl.append(' ', el('button', { type: 'button', class: 'tocavel', onclick: () => falar(itemDe(p.replace(/[.,!?;:]/g, ''), 'palavra')) }, p), ' ');
      });
    if (i < partes.length - 1) fraseEl.append(' ', el('span', { class: 'visualmente-oculto' }, 'espaço para completar:'), lacuna, ' ');
  });
  const { grade, escolha } = criarEscolha(
    ctx,
    a.opcoes.map((o) => ({ conteudo: o, certa: o === a.resposta, classe: 'leitura' })),
    classeDasColunas(a.opcoes),
  );
  ctx.area.append(el('div', { class: 'cartaz' }, fraseEl), botaoOuvirDeNovo(() => void ctx.falar(comLacuna)), grade);
  const preencher = () => {
    lacuna.textContent = a.resposta;
  };
  return {
    modelo: () => ctx.falar(comLacuna),
    mostrarResposta: async () => {
      escolha.mostrarCerta();
      preencher();
      await ctx.falar(completa);
    },
    aoAcertar: async () => {
      preencher();
      await ctx.falar(completa);
    },
    passosDemo: () => [() => escolha.certo],
    travar: escolha.travar,
  };
}

// ---------- 10 e 13. Ligue (e maiúscula ↔ minúscula) ----------

/** Fala um item do Ligue: "LU + PA" é lido sílaba por sílaba (para não entregar a palavra). */
function falarItemDoLigue(texto: string): void {
  if (texto.includes(' + ')) void falarEmSequencia(texto.split(' + ').map((s) => itemDe(s, 'silaba')));
  else if (/^\p{L}$/u.test(texto)) void falar(itemDe(texto, 'tecla'));
  else void falar(itemDe(texto, 'palavra'));
}

export function montarLigue(a: Ligue | Maiuscula, ctx: Contexto): Controle {
  const caixa = el('div', { class: 'ligue' });
  const linhas = svg('svg', { class: 'linhas', 'aria-hidden': 'true' });
  const esquerda = a.esquerda.map((t, i) => el('button', { type: 'button', class: 'item', 'data-lado': 'e', 'data-indice': i }, t));
  const direita = a.direita.map((t, j) => el('button', { type: 'button', class: 'item', 'data-lado': 'd', 'data-indice': j }, t));
  caixa.append(el('div', { class: 'coluna' }, ...esquerda), el('div', { class: 'coluna' }, ...direita), linhas);
  ctx.area.append(caixa);
  const parDe = new Map(a.pares.map(([i, j]) => [i, j]));
  const ligados: [number, number][] = [];
  const errosPorItem = new Map<number, number>();
  let selE: number | null = null;
  let selD: number | null = null;
  let travado = false;

  const desenharLinhas = () => {
    const base = caixa.getBoundingClientRect();
    linhas.replaceChildren(
      ...ligados.map(([i, j]) => {
        const r1 = esquerda[i].getBoundingClientRect();
        const r2 = direita[j].getBoundingClientRect();
        return svg('line', {
          x1: r1.right - base.left,
          y1: r1.top + r1.height / 2 - base.top,
          x2: r2.left - base.left,
          y2: r2.top + r2.height / 2 - base.top,
          stroke: '#1e7b34',
          'stroke-width': 6,
          'stroke-linecap': 'round',
        });
      }),
    );
  };
  const aoRedimensionar = () => desenharLinhas();
  window.addEventListener('resize', aoRedimensionar);
  new MutationObserver((_, obs) => {
    if (!caixa.isConnected) {
      window.removeEventListener('resize', aoRedimensionar);
      obs.disconnect();
    }
  }).observe(ctx.area, { childList: true });

  const limparSelecao = () => {
    [...esquerda, ...direita].forEach((b) => b.classList.remove('selecionado'));
    selE = selD = null;
  };
  const ligar = (i: number, j: number, mostrar = false) => {
    ligados.push([i, j]);
    for (const b of [esquerda[i], direita[j]]) {
      b.classList.add('ligado');
      if (mostrar) b.classList.add('destaque');
      b.disabled = true;
    }
    desenharLinhas();
    if (ligados.length === a.pares.length) {
      travado = true;
      ctx.acertou();
    }
  };
  const conferir = () => {
    if (selE === null || selD === null) return;
    const i = selE;
    const j = selD;
    limparSelecao();
    if (parDe.get(i) === j) {
      ligar(i, j);
      return;
    }
    const erros = (errosPorItem.get(i) ?? 0) + 1;
    errosPorItem.set(i, erros);
    if (erros >= 2) {
      // Segunda tentativa errada neste item: mostra o par certo e segue.
      ligar(i, parDe.get(i)!, true);
      falarItemDoLigue(a.direita[parDe.get(i)!]);
    } else ctx.errouParcial();
  };
  esquerda.forEach((b, i) =>
    b.addEventListener('click', () => {
      if (travado) return;
      esquerda.forEach((x) => x.classList.remove('selecionado'));
      b.classList.add('selecionado');
      selE = i;
      falarItemDoLigue(a.esquerda[i]);
      conferir();
    }),
  );
  direita.forEach((b, j) =>
    b.addEventListener('click', () => {
      if (travado) return;
      direita.forEach((x) => x.classList.remove('selecionado'));
      b.classList.add('selecionado');
      selD = j;
      falarItemDoLigue(a.direita[j]);
      conferir();
    }),
  );
  requestAnimationFrame(desenharLinhas);
  return {
    passosDemo: (): PassoDemo[] => a.pares.slice(0, 2).flatMap(([i, j]) => [() => esquerda[i], () => direita[j]]),
    // Ao voltar a esta atividade: todos os pares aparecem ligados.
    mostrarResposta: async () => {
      travado = true;
      for (const [i, j] of a.pares) if (!ligados.some(([x]) => x === i)) {
        ligados.push([i, j]);
        for (const b of [esquerda[i], direita[j]]) {
          b.classList.add('ligado');
          b.disabled = true;
        }
      }
      requestAnimationFrame(desenharLinhas);
    },
    travar: () => (travado = true),
  };
}


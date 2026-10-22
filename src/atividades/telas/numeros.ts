// Telas de números e dinheiro: Conte, Faça a conta, Pague com notas, Troco, O dinheiro dá?, Leia a hora.

import { el, esperar } from '../../util/dom';
import { icones } from '../../ui/icones';
import type { ItemAudio } from '../../audio/pronuncia';
import { falar } from '../../audio/voz';
import type { Conta, Conte, Da, Hora, Pague, Troco } from '../tipos';
import type { Contexto, Controle, PassoDemo } from './contrato';
import { botaoOuvirDeNovo, criarEscolha } from './comum';
import { decompor, desenharDinheiro, desenharEmDezEUm, desenharQuantidade, desenharRelogio } from '../../ui/desenhos';
import { formatarReais, resultadoComoTexto } from '../../conteudo/contas';
import { animacoesLigadas } from '../../dados/config';

const itemDe = (texto: string, categoria: ItemAudio['categoria']): ItemAudio => ({ categoria, texto });

// ---------- 14. Conte e toque o número ----------

export function montarConte(a: Conte, ctx: Contexto): Controle {
  const numero = itemDe(String(a.quantidade), 'numero');
  const { grade, escolha } = criarEscolha(ctx, a.opcoes.map((n) => ({ conteudo: String(n), certa: n === a.quantidade, classe: 'leitura' })));
  ctx.area.append(desenharQuantidade(a.quantidade, a.objeto), grade);
  return {
    mostrarResposta: async () => {
      escolha.mostrarCerta();
      await ctx.falar(numero);
    },
    aoAcertar: () => ctx.falar(numero),
    passosDemo: () => [() => escolha.certo],
    travar: escolha.travar,
  };
}

// ---------- Teclado numérico ----------

function criarTecladoNumerico(comVirgula: boolean, aoTeclar: (t: string) => void, aoApagar: () => void, aoPronto: () => void) {
  const teclas = ['1', '2', '3', '4', '5', '6', '7', '8', '9', comVirgula ? ',' : '', '0'];
  const botoes = new Map<string, HTMLButtonElement>();
  const teclado = el('div', { class: 'teclado', style: { gridTemplateColumns: 'repeat(3, 1fr)' }, role: 'group', 'aria-label': 'teclado de números' });
  for (const t of teclas) {
    if (!t) {
      teclado.append(el('span'));
      continue;
    }
    const b = el('button', { type: 'button', class: 'tecla', 'data-tecla': t, 'aria-label': t === ',' ? 'vírgula' : t }, t);
    b.addEventListener('click', () => aoTeclar(t));
    botoes.set(t, b);
    teclado.append(b);
  }
  const apagar = el('button', { type: 'button', class: 'tecla acao', 'aria-label': 'Apagar' }, icones.apagar(26));
  apagar.addEventListener('click', aoApagar);
  teclado.append(apagar);
  const pronto = el('button', { type: 'button', class: 'botao principal', 'data-pronto': '' }, icones.certo(30), 'PRONTO');
  pronto.addEventListener('click', aoPronto);
  return { teclado, pronto, botoes };
}

// ---------- 15. Faça a conta ----------

export function montarConta(a: Conta, ctx: Contexto): Controle {
  const item = itemDe(a.conta, 'conta');
  const resultadoTexto = resultadoComoTexto(a.resultado);
  // A conta com a resposta, para ler no fim: "3 + 5 = 8", "R$ 12 + R$ 13 = R$ 25", "1 L + 1 L = 2 L".
  const unidade = a.conta.match(/=\s*(KG|L)\s*$/i);
  const completa = itemDe(
    unidade ? a.conta.replace(/=\s*(KG|L)\s*$/i, `= ${resultadoTexto} $1`) : `${a.conta} ${resultadoTexto}`,
    'conta',
  );
  let digitado = '';
  let travado = false;
  const resposta = el('span', { class: 'resposta-numero', 'aria-live': 'polite', 'data-resposta': '' }, ' ');
  const contaEl = el('div', { class: 'conta-grande' }, ...a.conta.split(' ').map((p) => el('span', {}, p)), resposta);
  const mostrar = () => (resposta.textContent = digitado || ' ');
  const conferir = () => {
    if (travado || !digitado) return;
    const n = parseFloat(digitado.replace(',', '.'));
    if (Math.abs(n - a.resultado) < 0.001) {
      travado = true;
      ctx.acertou();
    } else ctx.errou();
  };
  const { teclado, pronto, botoes } = criarTecladoNumerico(
    !Number.isInteger(a.resultado),
    (t) => {
      if (travado || digitado.length >= 7) return;
      digitado += t;
      mostrar();
      void falar(itemDe(t === ',' ? 'vírgula' : t, 'numero'));
    },
    () => {
      if (travado) return;
      digitado = digitado.slice(0, -1);
      mostrar();
    },
    conferir,
  );
  ctx.area.append(el('div', { class: 'cartaz' }, contaEl));
  if (a.produtos.length) {
    ctx.area.append(el('ul', { class: 'precos', 'aria-label': 'preços' }, ...a.produtos.map((p) => el('li', {}, `${p.produto} ${p.preco}`))));
  }
  if (a.dinheiro) {
    const d = a.dinheiro;
    const figura = el('div', { class: 'dinheiro', hidden: true },
      desenharEmDezEUm(d.valores[0]),
      el('div', { class: 'sinal', 'aria-label': d.sinal === '+' ? 'mais' : 'menos' }, d.sinal),
      desenharEmDezEUm(d.valores[1]),
    );
    const ver = el('button', { type: 'button', class: 'botao' }, 'VER COM DINHEIRO');
    ver.addEventListener('click', () => {
      figura.hidden = !figura.hidden;
      ver.textContent = figura.hidden ? 'VER COM DINHEIRO' : 'ESCONDER O DINHEIRO';
    });
    ctx.area.append(ver, figura);
  }
  ctx.area.append(botaoOuvirDeNovo(() => void ctx.falar(item)), teclado, pronto);
  return {
    modelo: () => ctx.falar(item),
    reiniciar: () => {
      digitado = '';
      mostrar();
    },
    mostrarResposta: async () => {
      travado = true;
      digitado = resultadoTexto;
      mostrar();
      resposta.classList.add('destaque');
      await ctx.falar(completa);
    },
    aoAcertar: () => ctx.falar(completa),
    passosDemo: (): PassoDemo[] => [...resultadoTexto].map((c) => () => botoes.get(c)).concat([() => pronto]),
    travar: () => (travado = true),
  };
}

// ---------- 16. Pague com notas ----------

export function montarPague(a: Pague, ctx: Contexto): Controle {
  const precoTexto = formatarReais(a.preco);
  const item = itemDe(a.produto ? `${a.produto}: ${precoTexto}` : precoTexto, 'frase');
  const naMao: number[] = [];
  let travado = false;
  const mao = el('div', { class: 'mao-do-estudante', 'aria-label': 'dinheiro separado', 'aria-live': 'polite' });
  const total = el('p', { class: 'total', 'aria-live': 'polite' });
  const desenharMao = () => {
    mao.replaceChildren(
      ...naMao.map((v, i) => {
        const b = el('button', { type: 'button', 'aria-label': `tirar ${formatarReais(v)}` }, desenharDinheiro(v, 0.7));
        b.addEventListener('click', () => {
          if (travado) return;
          naMao.splice(i, 1);
          desenharMao();
        });
        return b;
      }),
    );
    if (!naMao.length) mao.append(el('span', { class: 'etiqueta' }, 'TOQUE NO DINHEIRO ABAIXO'));
    total.textContent = `VOCÊ JUNTOU: ${formatarReais(naMao.reduce((s, v) => s + v, 0))}`;
  };
  const botoes = new Map<number, HTMLButtonElement>();
  const carteira = el('div', { class: 'carteira', role: 'group', 'aria-label': 'notas e moedas' });
  for (const v of a.dinheiro) {
    const b = el('button', { type: 'button', 'data-valor': v }, desenharDinheiro(v, 0.85));
    b.addEventListener('click', () => {
      if (travado) return;
      naMao.push(v);
      desenharMao();
      void falar(itemDe(formatarReais(v), 'palavra'));
    });
    botoes.set(v, b);
    carteira.append(b);
  }
  const pronto = el('button', { type: 'button', class: 'botao principal', 'data-pronto': '' }, icones.certo(30), 'PRONTO');
  pronto.addEventListener('click', () => {
    if (travado || !naMao.length) return;
    if (naMao.reduce((s, v) => s + v, 0) === a.preco) {
      travado = true;
      ctx.acertou();
    } else ctx.errou();
  });
  desenharMao();
  ctx.area.append(
    el('div', { class: 'cartaz' }, a.produto ? el('div', { class: 'etiqueta' }, a.produto) : null, el('div', { class: 'preco-grande' }, precoTexto)),
    mao,
    total,
    carteira,
    pronto,
  );
  // Uma forma certa de pagar (para a demonstração e para mostrar a resposta).
  const jeitoCerto = () => {
    const r: number[] = [];
    let resto = a.preco;
    for (const v of [...a.dinheiro].sort((x, y) => y - x)) while (resto >= v) (r.push(v), (resto -= v));
    return r;
  };
  return {
    modelo: () => ctx.falar(item),
    reiniciar: () => {
      naMao.length = 0;
      desenharMao();
    },
    mostrarResposta: async () => {
      travado = true;
      naMao.length = 0;
      naMao.push(...jeitoCerto());
      desenharMao();
      mao.classList.add('destaque');
      await ctx.falar(item);
    },
    passosDemo: (): PassoDemo[] => [...jeitoCerto().map((v) => () => botoes.get(v)), () => pronto],
    travar: () => (travado = true),
  };
}

// ---------- 17. Quanto volta de troco ----------

export function montarTroco(a: Troco, ctx: Contexto): Controle {
  const troco = a.pago - a.preco;
  const animacao = el('div', { class: 'dinheiro', 'aria-live': 'polite', style: { minHeight: '70px' } });
  const contagem = el('p', { class: 'total', 'aria-live': 'polite' });
  const { grade, escolha } = criarEscolha(
    ctx,
    a.opcoes.map((v) => ({ conteudo: formatarReais(v), certa: v === troco })),
  );
  escolha.botoes.forEach((b) => (b.style.fontSize = '1.7rem'));
  const valores = el(
    'div',
    { class: 'cartaz', style: { minHeight: '0' } },
    el('div', { class: 'etiqueta' }, 'PREÇO'),
    el('div', { class: 'preco-grande' }, formatarReais(a.preco)),
    el('div', { class: 'etiqueta' }, 'PAGOU COM'),
    el('div', { class: 'dinheiro' }, ...decompor(a.pago).map((v) => desenharDinheiro(v, 0.8))),
  );
  ctx.area.append(valores, el('div', { class: 'etiqueta' }, 'O TROCO, CONTANDO A PARTIR DO PREÇO:'), animacao, contagem, grade);
  let rodando = 0;
  const animar = async () => {
    const meu = ++rodando;
    animacao.replaceChildren();
    contagem.textContent = formatarReais(a.preco);
    await ctx.falar(itemDe(formatarReais(a.preco), 'palavra'));
    let atual = a.preco;
    for (const passo of a.passos) {
      if (meu !== rodando || !animacao.isConnected) return;
      atual += passo;
      const d = desenharDinheiro(passo, 0.7);
      if (animacoesLigadas()) d.classList.add('aparecer');
      animacao.append(d);
      contagem.textContent = formatarReais(atual);
      await ctx.falar(itemDe(formatarReais(atual), 'palavra'));
      await esperar(150);
    }
  };
  const fraseTroco = itemDe(`Troco: ${formatarReais(troco)}`, 'frase');
  return {
    modelo: animar,
    mostrarResposta: async () => {
      escolha.mostrarCerta();
      await ctx.falar(fraseTroco);
    },
    aoAcertar: () => ctx.falar(fraseTroco),
    passosDemo: () => [() => escolha.certo],
    travar: escolha.travar,
  };
}

// ---------- 18. O dinheiro dá? ----------

export function montarDa(a: Da, ctx: Contexto): Controle {
  const da = a.naMao >= a.preco;
  const item = itemDe(`${a.produto}: ${formatarReais(a.preco)}. Na mão: ${formatarReais(a.naMao)}.`, 'frase');
  const resposta = itemDe(da ? 'Dá, sim.' : 'Não dá.', 'retorno');
  const rotuloSim = a.rotulos?.sim;
  const rotuloNao = a.rotulos?.nao;
  const { grade, escolha } = criarEscolha(ctx, [
    { conteudo: el('span', { class: 'coluna' }, icones.polegarCima(52), rotuloSim ?? ''), certa: da, rotulo: 'Sim, dá', classe: 'leitura' },
    { conteudo: el('span', { class: 'coluna' }, icones.polegarBaixo(52), rotuloNao ?? ''), certa: !da, rotulo: 'Não dá', classe: 'leitura' },
  ]);
  escolha.botoes.forEach((b) => (b.style.minHeight = '120px'));
  ctx.area.append(
    el('div', { class: 'cartaz', style: { minHeight: '0' } }, el('div', { class: 'etiqueta' }, a.produto), el('div', { class: 'preco-grande' }, formatarReais(a.preco))),
    el('div', { class: 'etiqueta' }, 'NA MÃO:'),
    el('div', { class: 'dinheiro' }, ...decompor(a.naMao).map((v) => desenharDinheiro(v, 0.8))),
    el('p', { class: 'total' }, formatarReais(a.naMao)),
    botaoOuvirDeNovo(() => void ctx.falar(item)),
    grade,
  );
  return {
    modelo: () => ctx.falar(item),
    mostrarResposta: async () => {
      escolha.mostrarCerta();
      await ctx.falar(resposta);
    },
    aoAcertar: () => ctx.falar(resposta),
    passosDemo: () => [() => escolha.certo],
    travar: escolha.travar,
  };
}

// ---------- 19. Leia a hora ----------

export function montarHora(a: Hora, ctx: Contexto): Controle {
  const item = itemDe(a.hora, 'hora');
  const { grade, escolha } = criarEscolha(ctx, a.opcoes.map((h) => ({ conteudo: h, certa: h === a.hora, classe: 'leitura' })));
  ctx.area.append(el('div', { class: 'relogio' }, desenharRelogio(a.hora)), grade);
  return {
    mostrarResposta: async () => {
      escolha.mostrarCerta();
      await ctx.falar(item);
    },
    aoAcertar: () => ctx.falar(item),
    passosDemo: () => [() => escolha.certo],
    travar: escolha.travar,
  };
}

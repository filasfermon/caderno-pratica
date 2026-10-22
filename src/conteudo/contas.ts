// Contas, preços e dinheiro.
// Valores em dinheiro são guardados em CENTAVOS (números inteiros) para não haver erro de arredondamento.

import type { ItemProduto } from './tipos';
import { maiusculas } from '../util/texto';

/** "R$ 12,90" → 1290. "R$ 5" → 500. Devolve null se não for preço. */
export function precoEmCentavos(texto: string): number | null {
  const m = texto.match(/R\$\s*(\d+)(?:,(\d{1,2}))?/);
  if (!m) return null;
  const centavos = m[2] ? parseInt(m[2].padEnd(2, '0'), 10) : 0;
  return parseInt(m[1], 10) * 100 + centavos;
}

/** 1290 → "R$ 12,90". */
export function formatarReais(centavos: number): string {
  const reais = Math.floor(centavos / 100);
  const resto = Math.round(centavos % 100);
  return `R$ ${reais},${String(resto).padStart(2, '0')}`;
}

/** Resultado do JSON (ex.: 6.25) → centavos (625). */
export function numeroParaCentavos(n: number): number {
  return Math.round(n * 100);
}

/** Resultado como o estudante digita: 8 → "8"; 6.25 → "6,25"; 17.0 → "17". */
export function resultadoComoTexto(n: number): string {
  if (Number.isInteger(n)) return String(n);
  return n.toFixed(2).replace('.', ',');
}

export const SINAIS = ['+', '−', '-', '×', '÷'] as const;

interface Termo {
  valor: number; // em unidades (reais ou quantidade)
  dinheiro: boolean;
}

/** Lê um termo da conta: "R$ 6,90", "3", "2 KG", "SUCO" (preço do produto). */
function lerTermo(texto: string, produtos: ItemProduto[]): Termo | null {
  const t = texto.trim();
  const preco = precoEmCentavos(t);
  if (preco !== null) return { valor: preco / 100, dinheiro: true };
  const numero = t.match(/^(\d+(?:,\d+)?)(\s*(KG|L|ML|G))?$/i);
  if (numero) return { valor: parseFloat(numero[1].replace(',', '.')), dinheiro: false };
  const produto = produtos.find((p) => maiusculas(p.produto) === maiusculas(t));
  if (produto) {
    const c = precoEmCentavos(produto.preco);
    if (c !== null) return { valor: c / 100, dinheiro: true };
  }
  return null;
}

export interface ContaLida {
  termos: Termo[];
  sinais: string[];
}

/** Separa "R$ 12 + R$ 13 = R$" em termos e sinais. */
export function lerConta(conta: string, produtos: ItemProduto[] = []): ContaLida | null {
  const antesDoIgual = conta.split('=')[0];
  const partes = antesDoIgual.split(/\s([+−×÷-])\s/);
  const termos: Termo[] = [];
  const sinais: string[] = [];
  for (let i = 0; i < partes.length; i++) {
    if (i % 2 === 1) sinais.push(partes[i] === '-' ? '−' : partes[i]);
    else {
      const termo = lerTermo(partes[i], produtos);
      if (!termo) return null;
      termos.push(termo);
    }
  }
  if (termos.length < 2 || sinais.length !== termos.length - 1) return null;
  return { termos, sinais };
}

/** Calcula a conta (× e ÷ antes de + e −). Usado para conferir o JSON e montar as figuras. */
export function calcularConta(conta: string, produtos: ItemProduto[] = []): number | null {
  const lida = lerConta(conta, produtos);
  if (!lida) return null;
  const valores = lida.termos.map((t) => t.valor);
  const sinais = [...lida.sinais];
  for (let i = 0; i < sinais.length; ) {
    if (sinais[i] === '×' || sinais[i] === '÷') {
      const r = sinais[i] === '×' ? valores[i] * valores[i + 1] : valores[i] / valores[i + 1];
      valores.splice(i, 2, r);
      sinais.splice(i, 1);
    } else i++;
  }
  let total = valores[0];
  sinais.forEach((s, i) => (total = s === '+' ? total + valores[i + 1] : total - valores[i + 1]));
  return Math.round(total * 100) / 100;
}

/** A conta é de dinheiro? (tem R$ ou nomes de produtos) */
export function ehContaDeDinheiro(conta: string): boolean {
  return conta.includes('R$');
}

/**
 * Para o botão "ver com dinheiro": só contas de + e − com números inteiros.
 * Devolve os valores (em reais inteiros) e o sinal.
 */
export function contaParaDinheiro(conta: string, produtos: ItemProduto[] = []): { valores: number[]; sinal: '+' | '−' } | null {
  const lida = lerConta(conta, produtos);
  if (!lida) return null;
  const sinal = lida.sinais[0];
  if (!lida.sinais.every((s) => s === sinal) || (sinal !== '+' && sinal !== '−')) return null;
  if (lida.termos.length !== 2) return null;
  const valores = lida.termos.map((t) => t.valor);
  if (!valores.every((v) => Number.isInteger(v) && v >= 0 && v <= 200)) return null;
  return { valores, sinal };
}

/** "R$ 50 − R$ 37 = R$" → troco: pago 5000, preço 3700 (centavos). */
export function contaDeTroco(conta: string): { pago: number; preco: number } | null {
  const m = conta.match(/^\s*(R\$\s*[\d,]+)\s*[−-]\s*(R\$\s*[\d,]+)\s*=\s*R\$\s*$/);
  if (!m) return null;
  const pago = precoEmCentavos(m[1]);
  const preco = precoEmCentavos(m[2]);
  if (pago === null || preco === null || preco > pago) return null;
  return { pago, preco };
}

// ---------- Notas e moedas (desenhos genéricos, "SEM VALOR") ----------

/** Valores em centavos. Notas: 100, 50, 20, 10, 5, 2 reais. Moedas: 1 real e centavos. */
export const NOTAS = [10000, 5000, 2000, 1000, 500, 200];
export const MOEDAS = [100, 50, 25, 10, 5];

export function ehNota(valor: number): boolean {
  return NOTAS.includes(valor);
}

/**
 * Passos de "contar para cima" do preço até o valor pago (como no caixa):
 * 37 → 38 → 39 → 40 → 50. Cada passo é uma moeda ou nota.
 */
export function passosDoTroco(preco: number, pago: number): number[] {
  const valores = [5000, 2000, 1000, 500, 100, 50, 25, 10, 5];
  const passos: number[] = [];
  let atual = preco;
  while (atual < pago && passos.length < 40) {
    const falta = pago - atual;
    // Usa o maior valor que chega num número "redondo" (37 + 1 = 38 ... 40 + 10 = 50).
    const passo = valores.find((v) => v <= falta && (atual + v) % v === 0) ?? valores.find((v) => v <= falta)!;
    passos.push(passo);
    atual += passo;
  }
  return passos;
}

/** Notas e moedas oferecidas para pagar um preço (qualquer combinação certa vale). */
export function dinheiroParaPagar(preco: number): number[] {
  const notas = NOTAS.filter((n) => n <= preco);
  const moedas = preco >= 100 ? [100] : [];
  if (preco % 100 !== 0) moedas.push(...MOEDAS.filter((m) => m < 100 && (m !== 5 || preco % 10 !== 0)));
  return [...notas, ...moedas];
}

/**
 * Uma forma certa de juntar o valor com as notas e moedas oferecidas (a com menos peças).
 * Usada na demonstração e para mostrar a resposta. Devolve null se não houver.
 */
export function combinacaoExata(valor: number, disponiveis: number[]): number[] | null {
  const melhor: (number[] | null)[] = Array(valor + 1).fill(null);
  melhor[0] = [];
  for (let v = 1; v <= valor; v++) {
    for (const d of disponiveis) {
      const antes = v - d >= 0 ? melhor[v - d] : null;
      if (antes && (!melhor[v] || antes.length + 1 < melhor[v]!.length)) melhor[v] = [...antes, d];
    }
  }
  return melhor[valor] ? [...melhor[valor]!].sort((a, b) => b - a) : null;
}

// Transforma o texto da tela no texto que a voz do aparelho vai ler.
//
// Ordem de prioridade do texto falado:
//   1. tabela src/dados/pronuncia.json (sílabas, letras, palavras especiais)
//   2. regras automáticas (dinheiro, contas, horas, minúsculas)

import tabela from '../dados/pronuncia.json';
import { VOGAL_NAS_SILABAS } from '../config/padroes';
import { falaAutomaticaDaSilaba } from './regras-pronuncia';
import { maiusculas, normalizarFrase } from '../util/texto';

export type Categoria =
  | 'letra' // letra sozinha: nome + exemplo ("pê, de pai")
  | 'tecla' // letra numa tecla: só o nome ("pê")
  | 'silaba'
  | 'palavra'
  | 'frase'
  | 'conta'
  | 'numero'
  | 'hora'
  | 'instrucao'
  | 'retorno'
  | 'aula';

/** Um pedaço de áudio do app: o que aparece na tela e de que tipo é. */
export interface ItemAudio {
  categoria: Categoria;
  texto: string;
}

type EntradaSilaba = string | { aberta: string; fechada: string };
const SILABAS = tabela.silabas as Record<string, EntradaSilaba>;
const LETRAS = tabela.letras as Record<string, { nome: string; fala: string }>;
const PALAVRAS = tabela.palavras as Record<string, string>;

// ---------- Sílabas e letras ----------

function escolherVariante(entrada: EntradaSilaba): string {
  return typeof entrada === 'string' ? entrada : entrada[VOGAL_NAS_SILABAS];
}

export function falaDaSilaba(silaba: string): string {
  const m = maiusculas(silaba.trim());
  const entrada = SILABAS[m];
  if (entrada !== undefined) return escolherVariante(entrada);
  return falaAutomaticaDaSilaba(m, VOGAL_NAS_SILABAS);
}

export function nomeDaLetra(letra: string): string {
  return LETRAS[maiusculas(letra)]?.nome ?? letra.toLowerCase();
}

export function falaDaLetra(letra: string): string {
  const m = maiusculas(letra.trim());
  // Par "P p": maiúscula e minúscula
  const par = m.match(/^(\p{L}) (\p{L})$/u);
  if (par) return `${nomeDaLetra(par[1])} maiúsculo, e ${nomeDaLetra(par[2])} minúsculo`;
  return LETRAS[m]?.fala ?? nomeDaLetra(m);
}

// ---------- Números, dinheiro, contas e horas ----------

function reais(inteiro: string, centavos?: string): string {
  const n = parseInt(inteiro, 10);
  const c = centavos ? parseInt(centavos, 10) : 0;
  const parteReais = n === 1 ? '1 real' : `${n} reais`;
  if (c === 0) return parteReais;
  const parteCentavos = c === 1 ? '1 centavo' : `${c} centavos`;
  return n === 0 ? parteCentavos : `${parteReais} e ${parteCentavos}`;
}

/** Regras gerais para frases, contas e preços. */
export function prepararTextoGeral(texto: string): string {
  let t = ` ${texto} `;
  // Perguntas no fim da conta: "= R$" → "é igual a quantos reais?"
  t = t.replace(/=\s*R\$\s*$/, ' é igual a quantos reais? ');
  t = t.replace(/=\s*KG\s*$/i, ' é igual a quantos quilos? ');
  t = t.replace(/=\s*L\s*$/i, ' é igual a quantos litros? ');
  t = t.replace(/=\s*$/, ' é igual a quanto? ');
  // Dinheiro: "R$ 2,50" → "2 reais e 50 centavos"
  t = t.replace(/R\$\s*(\d+)(?:,(\d{1,2}))?/g, (_, i: string, c?: string) => reais(i, c));
  // Horas: "8:00" → "8 horas"; "3:30" → "3 horas e 30 minutos"; "17h" → "17 horas"
  t = t.replace(/\b(\d{1,2}):(\d{2})\b/g, (_, h: string, m: string) => {
    const horas = h === '1' ? '1 hora' : `${parseInt(h, 10)} horas`;
    return m === '00' ? horas : `${horas} e ${parseInt(m, 10)} minutos`;
  });
  t = t.replace(/\b(\d{1,2})h\b/g, (_, h: string) => (h === '1' ? '1 hora' : `${h} horas`));
  // Unidades de medida
  t = t.replace(/\b1\s*(KG|kg)\b/g, '1 quilo').replace(/\b(\d+)\s*(KG|kg)\b/g, '$1 quilos');
  t = t.replace(/\b1\s*L\b/g, '1 litro').replace(/\b(\d+)\s*L\b/g, '$1 litros');
  // Sinais das contas
  t = t
    .replace(/\s\+\s/g, ' mais ')
    .replace(/\s[−-]\s/g, ' menos ')
    .replace(/\s×\s/g, ' vezes ')
    .replace(/\s÷\s/g, ' dividido por ')
    .replace(/\s=\s/g, ' é igual a ');
  t = t.replace(/←/g, ', ').replace(/\s–\s/g, ', ').replace(/_{2,}/g, ' ... ');
  // Palavras especiais da tabela (IFCE, WI-FI...)
  t = t.replace(/[\p{L}\p{N}][\p{L}\p{N}-]*/gu, (p) => PALAVRAS[maiusculas(p)] ?? p);
  return normalizarFrase(t).toLocaleLowerCase('pt-BR');
}

/** Texto que a voz do aparelho deve ler para este item. */
export function textoParaFala(item: ItemAudio): string {
  const t = item.texto.trim();
  switch (item.categoria) {
    case 'letra':
      return falaDaLetra(t);
    case 'tecla':
      // Tecla de letra (P, CH) → nome das letras; tecla de sílaba (PA) → a sílaba.
      if (/^\p{L}+$/u.test(t) && (t.length === 1 || !/[AEIOUÁÉÍÓÚÂÊÔÃÕ]/i.test(t))) return [...t].map(nomeDaLetra).join(' ');
      return /^\p{L}+$/u.test(t) ? falaDaSilaba(t) : prepararTextoGeral(t);
    case 'silaba':
      return falaDaSilaba(t);
    case 'palavra':
      return PALAVRAS[maiusculas(t)] ?? prepararTextoGeral(t);
    case 'instrucao':
    case 'retorno':
    case 'aula':
      return t;
    default:
      return prepararTextoGeral(t);
  }
}

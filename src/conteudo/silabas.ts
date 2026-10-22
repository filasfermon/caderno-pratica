// Divisão de palavras em sílabas (silabador simples do português).
//
// Regras usadas (as mesmas que se ensinam na escola):
// - CH, LH, NH, QU e GU (antes de vogal) contam como uma consoante só.
// - RR e SS se separam: CAR-RO, MAS-SA.
// - Uma consoante entre vogais vai para a sílaba seguinte: PA-TO.
// - Duas consoantes entre vogais se separam (POR-TA), menos os encontros
//   como PR, BL, TR, que ficam juntos (PRA-TO, LI-VRO).
// - Ditongos (AI, EI, OI, UI, AU, EU, OU, ÃO, ÃE, ÕE) ficam juntos; outras
//   vogais seguidas se separam (RU-A, TI-A, CLI-EN-TE).
// O resultado foi conferido com todas as divisões que o caderno traz
// (campo "formar" e os "LU + PA" do campo "ligar") — veja tests/silabas.test.ts.

import { ehVogal, maiusculas } from '../util/texto';

/** Uma unidade é uma vogal ou uma consoante (CH, LH, NH, QU, GU contam como uma). */
interface Unidade {
  texto: string; // como está na palavra original
  vogal: boolean;
}

export interface SilabaDetalhada {
  texto: string;
  /** Consoantes antes da vogal (ex.: ["P","R"] em PRA). */
  ataque: string[];
  /** Consoantes depois da vogal (ex.: ["R"] em POR). */
  coda: string[];
}

const ENCONTROS = new Set(['BL', 'BR', 'CL', 'CR', 'DR', 'FL', 'FR', 'GL', 'GR', 'KL', 'KR', 'PL', 'PR', 'TR', 'VR']);
const SEMIVOGAIS = new Set(['I', 'U']);

function unidades(palavra: string): Unidade[] {
  const m = maiusculas(palavra);
  const lista: Unidade[] = [];
  let i = 0;
  while (i < m.length) {
    const dois = m.slice(i, i + 2);
    const depois = m[i + 2];
    if (dois === 'CH' || dois === 'LH' || dois === 'NH') {
      lista.push({ texto: palavra.slice(i, i + 2), vogal: false });
      i += 2;
    } else if ((dois === 'QU' || dois === 'GU') && depois !== undefined && ehVogal(depois)) {
      lista.push({ texto: palavra.slice(i, i + 2), vogal: false });
      i += 2;
    } else {
      lista.push({ texto: palavra[i], vogal: ehVogal(m[i]) });
      i += 1;
    }
  }
  return lista;
}

/** Decide se a vogal "seguinte" se junta à anterior formando ditongo. */
function formaDitongo(anterior: string, seguinte: string, nucleoTemSemivogal: boolean): boolean {
  if (nucleoTemSemivogal) return false;
  const a = maiusculas(anterior);
  const s = maiusculas(seguinte);
  if ((a === 'Ã' && (s === 'O' || s === 'E')) || (a === 'Õ' && s === 'E')) return true;
  if (!SEMIVOGAIS.has(s)) return false; // só I e U sem acento viram semivogal
  if (a === s) return false; // "II", "UU"
  return true;
}

/** Divide a palavra em sílabas, com detalhes (ataque e coda). */
export function silabarDetalhado(palavra: string): SilabaDetalhada[] {
  const us = unidades(palavra);
  // 1) Acha os núcleos (grupos de vogais de cada sílaba).
  type Nucleo = { inicio: number; fim: number; semivogal: boolean };
  const nucleos: Nucleo[] = [];
  for (let i = 0; i < us.length; i++) {
    if (!us[i].vogal) continue;
    const ultimo = nucleos[nucleos.length - 1];
    if (ultimo && ultimo.fim === i - 1 && formaDitongo(us[i - 1].texto, us[i].texto, ultimo.semivogal)) {
      ultimo.fim = i;
      ultimo.semivogal = true;
    } else {
      nucleos.push({ inicio: i, fim: i, semivogal: false });
    }
  }
  if (nucleos.length === 0) {
    return [{ texto: palavra, ataque: us.map((u) => u.texto), coda: [] }];
  }
  // 2) Distribui as consoantes entre os núcleos.
  const silabas: { de: number; ate: number; ataque: string[]; coda: string[] }[] = nucleos.map((n) => ({
    de: n.inicio,
    ate: n.fim,
    ataque: [],
    coda: [],
  }));
  // Consoantes antes do primeiro núcleo
  for (let i = 0; i < nucleos[0].inicio; i++) silabas[0].ataque.push(us[i].texto);
  silabas[0].de = 0;
  for (let k = 0; k < nucleos.length - 1; k++) {
    const meio = us.slice(nucleos[k].fim + 1, nucleos[k + 1].inicio).map((u) => u.texto);
    let paraAtaque: number;
    if (meio.length <= 1) paraAtaque = meio.length;
    else {
      const ultimosDois = maiusculas(meio[meio.length - 2] + meio[meio.length - 1]);
      paraAtaque = ENCONTROS.has(ultimosDois) ? 2 : 1;
    }
    const coda = meio.slice(0, meio.length - paraAtaque);
    const ataque = meio.slice(meio.length - paraAtaque);
    silabas[k].coda.push(...coda);
    silabas[k].ate = nucleos[k].fim + coda.length;
    silabas[k + 1].ataque.push(...ataque);
    silabas[k + 1].de = nucleos[k + 1].inicio - ataque.length;
  }
  const ult = silabas[silabas.length - 1];
  for (let i = nucleos[nucleos.length - 1].fim + 1; i < us.length; i++) ult.coda.push(us[i].texto);
  ult.ate = us.length - 1;

  return silabas.map((s) => ({
    texto: us
      .slice(s.de, s.ate + 1)
      .map((u) => u.texto)
      .join(''),
    ataque: s.ataque,
    coda: s.coda,
  }));
}

/** Divide a palavra em sílabas: "CEBOLA" → ["CE","BO","LA"]. */
export function silabar(palavra: string): string[] {
  return silabarDetalhado(palavra).map((s) => s.texto);
}

/** Palavra "simples" = só letras (sem espaço, número ou pontuação). */
export function ehPalavraSimples(texto: string): boolean {
  return /^\p{L}+$/u.test(texto);
}

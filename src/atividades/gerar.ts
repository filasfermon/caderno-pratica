// GERAÇÃO DAS ATIVIDADES de uma aula, a partir dos campos do conteudo_licoes.json.
//
// Tudo o que vai para a tela passa pelo validador de progressão:
// se um texto usa algo ainda não ensinado naquela aula, a atividade não é criada.
// Os distratores (opções erradas) são tirados do próprio conteúdo: sílabas e
// palavras desta aula e das aulas anteriores.

import type { Aula, Conteudo } from '../conteudo/tipos';
import type { Atividade, Conheca, Objeto, TipoTexto } from './tipos';
import { conhecimentoDaAula, textoPermitido, type Conhecimento } from '../conteudo/progressao';
import {
  ehAulaDeMinusculas,
  ehAulaDePalavrinhas,
  ehLetraSozinha,
  ehParDeLetras,
  formatarParaAula,
  frasesDaAula,
  palavrasDaAula,
  semRepetidos,
} from '../conteudo/consulta';
import { ehPalavraSimples, silabar } from '../conteudo/silabas';
import { resolverPares } from '../conteudo/ligar';
import {
  contaDeTroco,
  contaParaDinheiro,
  dinheiroParaPagar,
  ehContaDeDinheiro,
  formatarReais,
  numeroParaCentavos,
  passosDoTroco,
  precoEmCentavos,
} from '../conteudo/contas';
import { embaralhar, embaralharDiferente, sortearVarios, type Sorteio } from '../util/aleatorio';
import { maiusculas, normalizarFrase, semAcento, ehVogal } from '../util/texto';

const iguais = (a: string[], b: string[]) => a.length === b.length && a.every((x, i) => x === b[i]);

/** Consoante(s) do começo da sílaba: "PA" → "P", "CHA" → "CH", "AI" → "". */
export function familia(silaba: string): string {
  return maiusculas(silaba).match(/^[^AEIOUÁÉÍÓÚÂÊÔÃÕ]*/)![0];
}

// ---------- "Bancos" de sílabas e palavras já vistas até cada aula ----------

const memoria = new WeakMap<Conteudo, Map<number, { silabas: string[]; palavras: string[] }>>();

/** Sílabas e palavras de todas as aulas até a aula N (para distratores). */
function vistasAte(c: Conteudo, n: number): { silabas: string[]; palavras: string[] } {
  let porAula = memoria.get(c);
  if (!porAula) memoria.set(c, (porAula = new Map()));
  const pronto = porAula.get(n);
  if (pronto) return pronto;
  const silabas: string[] = [];
  const palavras: string[] = [];
  for (const a of c.aulas) {
    if (a.aula > n) continue;
    for (const s of a.silabas ?? []) if (s.length > 1) silabas.push(maiusculas(s));
    for (const p of palavrasDaAula(a)) {
      palavras.push(maiusculas(p));
      for (const s of silabar(maiusculas(p))) silabas.push(s);
    }
  }
  const r = { silabas: semRepetidos(silabas), palavras: semRepetidos(palavras) };
  porAula.set(n, r);
  return r;
}

// ---------- Ajudantes ----------

/** Escolhe distratores: primeiro os "parecidos", depois os outros. */
function escolherDistratores(alvo: string, parecidos: string[], outros: string[], n: number, s: Sorteio): string[] {
  const p = sortearVarios(semRepetidos(parecidos).filter((x) => x !== alvo), n, s);
  const resto = sortearVarios(
    semRepetidos(outros).filter((x) => x !== alvo && !p.includes(x)),
    n - p.length,
    s,
  );
  return [...p, ...resto];
}

/** Pega a letra-chave da aula (letras_novas) para escolher a sílaba que falta. */
function letrasNovas(aula: Aula): string[] {
  return (aula.letras_novas ?? []).map((l) => maiusculas(l));
}

const OBJETOS: Objeto[] = ['lata', 'colher', 'feijao'];

/** Letras que se confundem pelo som (para "Escute e toque a letra"). */
const LETRAS_PARECIDAS: Record<string, string[]> = {
  A: ['E', 'O'], E: ['A', 'I'], I: ['E', 'U'], O: ['U', 'A'], U: ['O', 'I'],
  P: ['B', 'T'], B: ['P', 'D'], T: ['D', 'P'], D: ['T', 'B'], F: ['V', 'S'], V: ['F', 'B'],
  M: ['N'], N: ['M'], C: ['G', 'S'], G: ['C', 'J'], S: ['Z', 'C'], Z: ['S'], J: ['G', 'X'],
  X: ['J', 'S'], L: ['R'], R: ['L'], Q: ['C', 'G'], H: ['A'], K: ['C', 'Q'], W: ['V', 'U'], Y: ['I', 'J'],
};

// ---------- Geração ----------

/**
 * Todas as atividades possíveis de uma aula (as "candidatas").
 * A sessão depois escolhe algumas delas.
 */
export function gerarCandidatas(c: Conteudo, aula: Aula, s: Sorteio): Atividade[] {
  const k = conhecimentoDaAula(aula);
  const ok = (t: string) => textoPermitido(t, k);
  const F = (t: string) => formatarParaAula(normalizarFrase(t), aula);
  const n = aula.aula;
  const lista: Atividade[] = [];
  const vistas = vistasAte(c, n);
  const minusculasAula = ehAulaDeMinusculas(aula) || aula.parte >= 6;
  // Para distratores, as sílabas/palavras são postas na mesma "caixa" da aula.
  const caixa = (t: string) => (minusculasAula ? t : maiusculas(t));

  // ----- Separa o campo "palavras" em letras, pares, palavras, frases curtas e números -----
  const letras: string[] = [];
  const pares: string[] = [];
  const numerais: string[] = [];
  const frasesCurtas: string[] = [];
  for (const bruto of aula.palavras ?? []) {
    const t = bruto.trim();
    if (ehParDeLetras(t)) {
      if (ok(t)) pares.push(t);
      continue;
    }
    const f = F(t);
    if (!ok(f)) continue;
    if (ehLetraSozinha(f) && !ehAulaDePalavrinhas(aula)) letras.push(f);
    else if (/^(R\$\s*)?[\d,]+$/.test(f)) numerais.push(f);
    else if (/\s/.test(f) && /\p{L}/u.test(f)) frasesCurtas.push(f);
  }
  const silabasAula: string[] = [];
  for (const bruto of aula.silabas ?? []) {
    const f = ehLetraSozinha(bruto) && aula.parte >= 5 ? bruto.trim() : F(bruto.trim());
    if (!ok(f)) continue;
    if (ehLetraSozinha(f)) letras.push(f);
    else silabasAula.push(f);
  }
  const palavras = palavrasDaAula(aula).filter(ok);
  const palavrasCurtas = ehAulaDePalavrinhas(aula)
    ? semRepetidos((aula.palavras ?? []).map((p) => F(p.trim())).filter((p) => ehPalavraSimples(p) && ok(p)))
    : palavras;
  // Aulas das vogais (Unidades 3 e 4) e aulas "Aprenda" de cada consoante: sempre têm
  // "Escute e toque a letra", "Escute e toque a sílaba" e "Ouça e fale".
  const ehAulaDeNumeros = (aula.tipo ?? []).some((t) => maiusculas(t).includes('NÚMEROS'));
  const ehAulaDasVogais = (aula.unidade === 3 || aula.unidade === 4) && !ehAulaDeNumeros;
  const novas = letrasNovas(aula);
  if (ehAulaDasVogais) for (const v of 'AEIOU') if (k.letras.has(v)) letras.push(v);
  for (const l of novas) if (ok(l)) letras.push(l);
  if (ehAulaDasVogais && silabasAula.length === 0) {
    // Nas vogais, a vogal sozinha e os encontros de vogais (AI, EU) são as sílabas da aula.
    const silabasDeVogais = [
      ...palavrasDaAula(aula).filter((p) => /^[AEIOU]+$/.test(p) && silabar(p).length === 1),
      ...'AEIOU'.split('').filter((v) => k.letras.has(v)),
    ];
    silabasAula.push(...semRepetidos(silabasDeVogais).filter(ok));
  }
  const letrasU = semRepetidos(letras);

  // Bancos para distratores
  const bancoSilabas = semRepetidos([...silabasAula.map(caixa), ...vistas.silabas.map(caixa)]).filter(ok);
  const silabasDasPalavras = semRepetidos(palavras.flatMap((p) => silabar(p)));
  const bancoPalavras = semRepetidos([...palavrasCurtas, ...vistas.palavras.map(caixa)]).filter(
    (p) => ok(p) && ehPalavraSimples(p),
  );

  // ===== 1. CONHEÇA =====
  const conhecer = (alvo: string, categoria: TipoTexto) => {
    const at: Conheca = { tipo: 'conheca', chave: `conheca|${categoria}:${alvo}`, aula: n, alvo, categoria };
    if (categoria === 'palavra' && ehPalavraSimples(alvo)) at.silabas = silabar(alvo);
    lista.push(at);
  };
  silabasAula.forEach((x) => conhecer(x, 'silaba'));
  letrasU.forEach((x) => conhecer(x, 'letra'));
  pares.forEach((x) => conhecer(x, 'par'));
  numerais.forEach((x) => conhecer(x, 'palavra'));
  palavrasCurtas.slice(0, 6).forEach((x) => conhecer(x, 'palavra'));

  // ===== 2. ESCUTE E TOQUE A SÍLABA (ou a letra) CERTA =====
  for (const alvo of silabasAula) {
    const parecidos = bancoSilabas.filter((x) => familia(x) === familia(alvo) && x.length === alvo.length);
    const outros = [...silabasAula, ...bancoSilabas].filter((x) => Math.abs(x.length - alvo.length) <= 1);
    const distratores = escolherDistratores(alvo, parecidos, outros, 3, s).filter(ok);
    // Normalmente 3 ou 4 opções; no começo do caderno (só A e E conhecidos), 2.
    const minimo = semRepetidos([...silabasAula, ...bancoSilabas]).length >= 3 ? 2 : 1;
    if (distratores.length >= minimo)
      lista.push({ tipo: 'escute_silaba', chave: `escute_silaba|${alvo}`, aula: n, alvo, categoria: 'silaba', opcoes: embaralhar([alvo, ...distratores], s) });
  }

  // ===== ESCUTE E TOQUE A LETRA  e  OUÇA E FALE (letra) =====
  for (const alvo of letrasU) {
    const minuscula = alvo !== maiusculas(alvo);
    const conhecidas = [...(minuscula ? k.minusculas : k.letras)].filter((l) => /^\p{L}$/u.test(l) && ok(l));
    // Primeiro as letras parecidas no som (A e E, P e B), depois as da mesma classe (vogal/consoante).
    const parecidasNoSom = (LETRAS_PARECIDAS[maiusculas(alvo)] ?? []).map((l) => (minuscula ? l.toLowerCase() : l)).filter((l) => conhecidas.includes(l));
    const mesmaClasse = conhecidas.filter((l) => ehVogal(l) === ehVogal(alvo));
    const distratores = [
      ...parecidasNoSom.slice(0, 2),
      ...escolherDistratores(alvo, mesmaClasse.filter((l) => !parecidasNoSom.includes(l)), conhecidas.filter((l) => !parecidasNoSom.includes(l)), 3, s),
    ]
      .filter((l, i, arr) => l !== alvo && arr.indexOf(l) === i)
      .slice(0, 3);
    if (distratores.length >= 1)
      lista.push({ tipo: 'escute_letra', chave: `escute_letra|${alvo}`, aula: n, alvo, opcoes: embaralhar([alvo, ...distratores], s) });
    lista.push({ tipo: 'ouca_fale', chave: `ouca_fale|letra:${alvo}`, aula: n, alvo, categoria: 'letra' });
  }

  // ===== OUÇA E FALE (sílabas e palavras da aula) =====
  for (const alvo of silabasAula) lista.push({ tipo: 'ouca_fale', chave: `ouca_fale|silaba:${alvo}`, aula: n, alvo, categoria: 'silaba' });
  for (const alvo of palavrasCurtas.filter((p) => ehPalavraSimples(p)).slice(0, 4))
    lista.push({ tipo: 'ouca_fale', chave: `ouca_fale|palavra:${alvo}`, aula: n, alvo, categoria: 'palavra' });

  // ===== 3. MONTE A SÍLABA =====
  const consoantesConhecidas = [...k.letras].filter((l) => /^[A-Z]$/.test(l) && !ehVogal(l));
  const vogaisConhecidas = [...k.letras].filter((l) => /^[AEIOU]$/.test(l));
  for (const alvo of silabasAula) {
    const m = maiusculas(alvo).match(/^(CH|LH|NH|QU|GU|RR|SS|Ç|[B-DF-HJ-NP-TV-Z]{1,2})([AEIOU])$/);
    if (!m) continue;
    const pecas = [m[1], m[2]];
    const outraConsoante = sortearVarios(consoantesConhecidas.filter((x) => x !== m[1] && x !== m[1][0]), 1, s);
    const outrasVogais = sortearVarios(vogaisConhecidas.filter((x) => x !== m[2]), outraConsoante.length ? 1 : 2, s);
    const opcoes = embaralhar([...pecas, ...outraConsoante, ...outrasVogais], s);
    if (opcoes.length >= 3 && opcoes.every(ok))
      lista.push({ tipo: 'monte_silaba', chave: `monte_silaba|${alvo}`, aula: n, alvo: maiusculas(alvo), pecas, opcoes });
  }

  // ===== 4. COMPLETE A PALAVRA COM A SÍLABA QUE FALTA =====
  for (const palavra of palavras) {
    const sil = silabar(palavra);
    if (sil.length < 2 || sil.length > 4) continue;
    const comNova = sil.findIndex((x) => novas.some((l) => semAcento(maiusculas(x)).includes(l)));
    const falta = comNova >= 0 ? comNova : Math.floor(s() * sil.length);
    const certa = sil[falta];
    const parecidos = [...silabasDasPalavras, ...bancoSilabas].filter((x) => familia(x) === familia(certa));
    const outros = [...silabasAula, ...silabasDasPalavras, ...bancoSilabas];
    const distratores = escolherDistratores(certa, parecidos, outros, 2, s).filter(
      (d) => ok(sil.map((x, i) => (i === falta ? d : x)).join('')) && d !== certa,
    );
    if (distratores.length === 2)
      lista.push({ tipo: 'complete_palavra', chave: `complete_palavra|${palavra}`, aula: n, palavra, silabas: sil, falta, opcoes: embaralhar([certa, ...distratores], s) });
  }

  // ===== 5. FORME A PALAVRA =====
  const jaFormadas = new Set<string>();
  const formar = (palavra: string, partes: string[]) => {
    if (jaFormadas.has(palavra) || partes.length < 2 || !ok(palavra)) return;
    jaFormadas.add(palavra);
    const embaralhadas = embaralharDiferente(partes, s, iguais);
    lista.push({ tipo: 'forme_palavra', chave: `forme_palavra|${palavra}`, aula: n, palavra, partes, embaralhadas });
  };
  for (const f of aula.formar ?? []) formar(F(f.palavra), f.partes.map(F));
  for (const p of palavras) {
    const sil = silabar(p);
    if (sil.length >= 2 && sil.length <= 4) formar(p, sil);
  }

  // ===== 6. QUANTAS SÍLABAS? =====
  const numerosOpcoes = [1, 2, 3, 4].filter((x) => k.numeros.has(String(x)));
  if (numerosOpcoes.length >= 3) {
    for (const palavra of palavras) {
      const sil = silabar(palavra);
      if (sil.length > 4 || !numerosOpcoes.includes(sil.length)) continue;
      lista.push({ tipo: 'quantas_silabas', chave: `quantas_silabas|${palavra}`, aula: n, palavra, silabas: sil, opcoes: numerosOpcoes });
    }
  }

  // ===== 7. ESCUTE E TOQUE A PALAVRA CERTA =====
  for (const alvo of palavrasCurtas) {
    const parecidas = bancoPalavras.filter(
      (p) => Math.abs(p.length - alvo.length) <= 1 && (p[0] === alvo[0] || p.slice(-2) === alvo.slice(-2)),
    );
    const outras = [...palavrasCurtas, ...bancoPalavras];
    const distratores = escolherDistratores(alvo, [...palavrasCurtas.filter((p) => p !== alvo), ...parecidas], outras, 2, s);
    if (distratores.length === 2)
      lista.push({ tipo: 'escute_palavra', chave: `escute_palavra|${alvo}`, aula: n, alvo, categoria: 'palavra', opcoes: embaralhar([alvo, ...distratores], s) });
  }
  if (numerais.length >= 3) {
    for (const alvo of numerais) {
      const distratores = sortearVarios(numerais.filter((x) => x !== alvo), 2, s);
      lista.push({ tipo: 'escute_palavra', chave: `escute_palavra|${alvo}`, aula: n, alvo, categoria: 'palavra', opcoes: embaralhar([alvo, ...distratores], s) });
    }
  }

  // ===== 8. ESCREVA A PALAVRA QUE OUVIU (só a partir da Unidade 5) =====
  if (aula.unidade >= 5) {
    const doDitado = (aula.ditado ?? []).map((d) => F(d.trim())).filter((d) => ehPalavraSimples(d) && d.length >= 2);
    const paraEscrever = semRepetidos([...doDitado, ...palavras]).filter((p) => ok(p) && p.length <= 8);
    const modoSilabas = aula.parte <= 3; // nas primeiras unidades, teclas com sílabas
    for (const palavra of paraEscrever) {
      if (modoSilabas) {
        const resposta = silabar(palavra);
        const parecidos = bancoSilabas.filter((x) => resposta.some((r) => familia(r) === familia(x)) && x.length <= 3);
        const distratores = escolherDistratores('', parecidos.filter((x) => !resposta.includes(x)), bancoSilabas.filter((x) => !resposta.includes(x) && x.length <= 3), 3, s);
        const teclas = embaralhar(semRepetidos([...resposta, ...distratores]), s);
        if (teclas.every(ok)) lista.push({ tipo: 'escreva', chave: `escreva|${palavra}`, aula: n, palavra, teclas, modo: 'silabas', resposta });
      } else {
        // Cada tecla é uma letra; ÃO fica numa tecla só (é ensinado junto).
        const resposta: string[] = [...(palavra.match(/ÃO|ão|./gu) ?? [])];
        if (!resposta.every(ok)) continue; // palavra lida "de olho" (ex.: HOJE antes do H): não se escreve
        const minuscula = palavra === palavra.toLowerCase();
        const conhecidas = [...(minuscula ? k.minusculas : k.letras)].filter((l) => /^\p{L}$/u.test(l) && ok(l) && !resposta.includes(l));
        const unicas = semRepetidos(resposta);
        const total = Math.max(8, Math.min(12, unicas.length + 4));
        const distratores = sortearVarios(conhecidas, total - unicas.length, s);
        const teclas = semRepetidos([...resposta, ...distratores]).sort((a, b) => a.localeCompare(b, 'pt-BR'));
        lista.push({ tipo: 'escreva', chave: `escreva|${palavra}`, aula: n, palavra, teclas, modo: 'letras', resposta });
      }
    }
  }

  // ===== 9. COMPLETE A FRASE =====
  const frasesDosTextos = (aula.textos ?? []).flat().map((t) => normalizarFrase(t));
  (aula.completar ?? []).forEach((item) => {
    let resposta = item.resposta;
    if (resposta === null) {
      // Sem resposta no JSON: vale a opção que deixa a frase igual a uma frase dos textos da aula.
      const encaixa = item.opcoes.filter((o) => frasesDosTextos.includes(normalizarFrase(item.frase.replace('____', o))));
      resposta = encaixa.length === 1 ? encaixa[0] : null;
    }
    if (resposta === null || !item.opcoes.includes(resposta)) return;
    const frase = F(item.frase);
    const opcoes = item.opcoes.map(F);
    const todasOk = opcoes.every((o) => ok(o) && ok(frase.replace('____', o)));
    if (!todasOk) return;
    lista.push({ tipo: 'complete_frase', chave: `complete_frase|${frase}`, aula: n, frase, opcoes: embaralhar(opcoes, s), resposta: F(resposta) });
  });

  // ===== 10. LIGUE =====
  (aula.ligar ?? []).forEach((item, i) => {
    const pares = resolverPares(item);
    if (!pares) return;
    const ehLetras = [...item.esquerda, ...item.direita].every((x) => ehLetraSozinha(x));
    const fmt = (x: string) => (ehLetras ? x.trim() : F(x));
    const esquerda = item.esquerda.map(fmt);
    const direita = item.direita.map(fmt);
    if (![...esquerda, ...direita].every(ok)) return;
    lista.push({ tipo: 'ligue', chave: `ligue|${n}#${i}`, aula: n, esquerda, direita, pares });
  });

  // ===== 11. LEIA COM A VOZ =====
  (aula.textos ?? []).forEach((texto, i) => {
    const linhas = texto.map((l) => F(l)).filter((l) => l && ok(l));
    if (linhas.length) lista.push({ tipo: 'leia', chave: `leia|${n}#${i}`, aula: n, linhas });
  });
  if (frasesCurtas.length && !(aula.textos ?? []).length) {
    lista.push({ tipo: 'leia', chave: `leia|${n}#curtas`, aula: n, linhas: frasesCurtas.slice(0, 4) });
  }

  // ===== 12. ORDENE A FRASE =====
  for (const frase of frasesDaAula(aula)) {
    if (!ok(frase)) continue;
    const palavrasFrase = frase.split(' ').filter(Boolean);
    if (palavrasFrase.length < 3 || palavrasFrase.length > 7 || /[←:]/.test(frase)) continue;
    lista.push({ tipo: 'ordene', chave: `ordene|${frase}`, aula: n, frase, palavras: palavrasFrase, embaralhadas: embaralharDiferente(palavrasFrase, s, iguais) });
  }

  // ===== 13. MAIÚSCULA E MINÚSCULA =====
  const anterior = c.aulas.find((a) => a.aula === n - 1);
  const minNovas = [...k.minusculas].filter((m) => !(anterior?.minusculas_conhecidas ?? '').includes(m));
  if (minNovas.length) {
    const comMaiuscula = (m: string) => k.letras.has(maiusculas(m));
    let escolhidas = minNovas.filter(comMaiuscula).slice(0, 5);
    if (escolhidas.length < 3) {
      const extras = sortearVarios([...k.minusculas].filter((m) => comMaiuscula(m) && !escolhidas.includes(m)), 3 - escolhidas.length, s);
      escolhidas = [...escolhidas, ...extras];
    }
    if (escolhidas.length >= 3) {
      const esquerda = escolhidas.map((m) => maiusculas(m));
      const direita = embaralharDiferente(escolhidas, s, iguais);
      const pares = esquerda.map((_, i) => [i, direita.indexOf(escolhidas[i])] as [number, number]);
      lista.push({ tipo: 'maiuscula', chave: `maiuscula|${n}`, aula: n, esquerda, direita, pares });
    }
  }

  // ===== 14. CONTE E TOQUE O NÚMERO =====
  const numeroConhecido = (x: number) => String(x).split('').every((d) => k.numeros.has(d));
  semRepetidos(aula.numeros ?? []).forEach((q, i) => {
    if (!numeroConhecido(q)) return;
    const vizinhos = (q >= 10 ? [q - 10, q + 10, q - 1, q + 1] : [q - 1, q + 1, q + 2, q - 2]).filter((x) => x >= 0 && numeroConhecido(x));
    const opcoes = embaralhar([q, ...vizinhos.slice(0, 2)], s);
    if (opcoes.length >= 3) lista.push({ tipo: 'conte', chave: `conte|${q}`, aula: n, quantidade: q, objeto: OBJETOS[i % OBJETOS.length], opcoes });
  });

  // ===== 15. FAÇA A CONTA =====
  const produtos = (aula.produtos ?? []).map((p) => ({ produto: F(p.produto), preco: p.preco }));
  for (const item of aula.contas ?? []) {
    const conta = F(item.conta);
    const usados = produtos.filter((p) => maiusculas(conta).includes(maiusculas(p.produto)));
    if (!ok(conta) || !usados.every((p) => ok(p.produto) && ok(p.preco))) continue;
    const dinheiro = Number.isInteger(item.resultado) ? contaParaDinheiro(conta, produtos) ?? undefined : undefined;
    lista.push({ tipo: 'conta', chave: `conta|${conta}`, aula: n, conta, resultado: item.resultado, produtos: usados, dinheiro });
  }

  // ===== 16. PAGUE COM NOTAS =====
  const contasComReais = (aula.contas ?? []).filter((x) => ehContaDeDinheiro(x.conta) && ok(F(x.conta)));
  for (const p of produtos) {
    const preco = precoEmCentavos(p.preco);
    if (preco === null || preco <= 0 || !ok(p.produto) || !ok(p.preco)) continue;
    lista.push({ tipo: 'pague', chave: `pague|${p.produto}@${n}`, aula: n, preco, produto: p.produto, dinheiro: dinheiroParaPagar(preco) });
  }
  if (!produtos.length) {
    for (const x of contasComReais) {
      const preco = numeroParaCentavos(x.resultado);
      if (preco <= 0 || !ok(formatarReais(preco))) continue;
      lista.push({ tipo: 'pague', chave: `pague|${x.conta}`, aula: n, preco, dinheiro: dinheiroParaPagar(preco) });
    }
  }

  // ===== 17. QUANTO VOLTA DE TROCO =====
  for (const x of contasComReais) {
    const t = contaDeTroco(x.conta);
    if (!t) continue;
    const troco = t.pago - t.preco;
    if (troco !== numeroParaCentavos(x.resultado)) continue; // confere com o JSON
    const vizinhos = [troco + 100, troco - 100, troco + 1000, troco - 1000].filter((v) => v > 0);
    const opcoes = embaralhar([troco, ...vizinhos.slice(0, 2)], s);
    lista.push({ tipo: 'troco', chave: `troco|${x.conta}`, aula: n, preco: t.preco, pago: t.pago, passos: passosDoTroco(t.preco, t.pago), opcoes });
  }

  // ===== 18. O DINHEIRO DÁ? =====
  const comPreco = produtos
    .map((p) => ({ ...p, centavos: precoEmCentavos(p.preco) ?? 0 }))
    .filter((p) => p.centavos > 0 && ok(p.produto));
  if (comPreco.length >= 2) {
    const rotulos = ok('SIM') && ok('NÃO') ? { sim: 'SIM', nao: 'NÃO' } : null;
    comPreco.forEach((p, i) => {
      // O dinheiro na mão é o preço de outro produto da mesma aula (valor do próprio conteúdo).
      const outros = comPreco.filter((o) => o.centavos !== p.centavos);
      if (!outros.length) return;
      const naMao = outros[(i + Math.floor(s() * outros.length)) % outros.length].centavos;
      lista.push({ tipo: 'da', chave: `da|${p.produto}@${n}`, aula: n, produto: p.produto, preco: p.centavos, naMao, rotulos });
    });
  }

  // ===== 19. LEIA A HORA =====
  const horas = semRepetidos(aula.horas ?? []).filter(ok);
  if (horas.length >= 3) {
    for (const hora of horas) {
      lista.push({ tipo: 'hora', chave: `hora|${hora}`, aula: n, hora, opcoes: embaralhar([hora, ...sortearVarios(horas.filter((h) => h !== hora), 2, s)], s) });
    }
  }

  return lista;
}

/** Usado pelos testes: o conhecimento da aula. */
export function conhecimento(aula: Aula): Conhecimento {
  return conhecimentoDaAula(aula);
}

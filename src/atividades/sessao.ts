// MONTAGEM DA SESSÃO: 8 a 12 atividades curtas.
// Cerca de 70% vêm da aula escolhida e 30% são revisão de aulas anteriores
// (repetição espaçada: o que o estudante errou volta mais cedo).

import type { Aula, Conteudo } from '../conteudo/tipos';
import type { Atividade, TipoAtividade } from './tipos';
import { atividadesDaAula, aulaDisponivel, tiposObrigatorios, OPCOES_PADRAO, type OpcoesConteudo } from './disponiveis';
import { itensParaRevisar, type Progresso } from '../dados/progresso';
import { embaralhar, type Sorteio } from '../util/aleatorio';

/** Ordem didática: primeiro conhecer e ouvir, depois montar, escrever e ler textos. */
const ESTAGIO: Record<TipoAtividade, number> = {
  conheca: 1,
  escute_letra: 1,
  diga_letra: 2,
  escute_silaba: 2,
  monte_silaba: 3,
  escute_palavra: 4,
  complete_palavra: 5,
  forme_palavra: 6,
  quantas_silabas: 7,
  maiuscula: 8,
  ligue: 8,
  conte: 2,
  hora: 3,
  conta: 4,
  da: 5,
  pague: 6,
  troco: 7,
  complete_frase: 9,
  escreva: 10,
  ordene: 11,
  leia: 12,
};

/** Quantas vezes, no máximo, cada tipo aparece numa sessão. */
const MAXIMO: Partial<Record<TipoAtividade, number>> = {
  conheca: 2,
  leia: 1,
  ligue: 1,
  maiuscula: 1,
  quantas_silabas: 2,
};

/** Tipos que servem bem para revisão (curtos). */
const BONS_PARA_REVISAO: TipoAtividade[] = [
  'escute_letra', 'diga_letra', 'escute_silaba', 'escute_palavra', 'monte_silaba', 'complete_palavra', 'forme_palavra', 'quantas_silabas',
  'escreva', 'complete_frase', 'ordene', 'ligue', 'maiuscula', 'conte', 'conta', 'pague', 'troco', 'da', 'hora',
];

export interface Sessao {
  aula: Aula;
  atividades: Atividade[];
}

/** Escolhe atividades variando os tipos (um de cada tipo por rodada; os obrigatórios primeiro). */
function escolherVariado(candidatas: Atividade[], quantas: number, p: Progresso, s: Sorteio, sortear = true, obrigatorios: TipoAtividade[] = []): Atividade[] {
  const porTipo = new Map<TipoAtividade, Atividade[]>();
  // Itens nunca vistos ou "vencidos" primeiro; dentro disso, ordem sorteada.
  const prioridade = (a: Atividade) => {
    const it = p.itens[a.chave];
    return it === undefined ? 0 : it.proxima <= p.sessoes ? 1 : 2;
  };
  const ordenadas = (sortear ? embaralhar(candidatas, s) : [...candidatas]).sort((a, b) => prioridade(a) - prioridade(b));
  for (const a of ordenadas) {
    if (!porTipo.has(a.tipo)) porTipo.set(a.tipo, []);
    porTipo.get(a.tipo)!.push(a);
  }
  const peso = (t: TipoAtividade) => (obrigatorios.includes(t) ? -100 : 0) + ESTAGIO[t];
  const tipos = [...porTipo.keys()].sort((a, b) => peso(a) - peso(b));
  const escolhidas: Atividade[] = [];
  const usadosPorTipo = new Map<TipoAtividade, number>();
  let mudou = true;
  while (escolhidas.length < quantas && mudou) {
    mudou = false;
    for (const t of tipos) {
      if (escolhidas.length >= quantas) break;
      const usados = usadosPorTipo.get(t) ?? 0;
      if (usados >= (MAXIMO[t] ?? 99)) continue;
      const proxima = porTipo.get(t)!.shift();
      if (!proxima) continue;
      escolhidas.push(proxima);
      usadosPorTipo.set(t, usados + 1);
      mudou = true;
    }
  }
  return escolhidas;
}

/** Atividades de revisão de aulas anteriores. */
export function escolherRevisao(
  c: Conteudo,
  aula: Aula,
  p: Progresso,
  quantas: number,
  s: Sorteio,
  evitar: Set<string>,
  op: OpcoesConteudo = OPCOES_PADRAO,
): Atividade[] {
  if (quantas <= 0) return [];
  const cache = new Map<number, Atividade[]>();
  const candidatasDa = (n: number) => {
    if (!cache.has(n)) {
      const a = c.aulas.find((x) => x.aula === n);
      // Aulas excluídas (ou sem atividades) não entram na revisão.
      const lista = a && aulaDisponivel(c, a, op) ? atividadesDaAula(c, a, s, op) : [];
      // A escrita só entra a partir da Unidade 5 (vale também na revisão).
      cache.set(n, lista.filter((x) => BONS_PARA_REVISAO.includes(x.tipo) && (x.tipo !== 'escreva' || aula.unidade >= 5)));
    }
    return cache.get(n)!;
  };
  const escolhidas: Atividade[] = [];
  const usar = (a: Atividade) => {
    if (escolhidas.length >= quantas || evitar.has(a.chave)) return;
    evitar.add(a.chave);
    escolhidas.push({ ...a, revisao: true });
  };
  // 1) O que já venceu na repetição espaçada (os mais errados primeiro).
  for (const [chave, item] of itensParaRevisar(p, aula.aula)) {
    if (escolhidas.length >= quantas) break;
    const a = candidatasDa(item.aula).find((x) => x.chave === chave);
    if (a) usar(a);
  }
  // 2) Completa com itens das aulas anteriores mais próximas (primeiro os nunca praticados),
  //    variando os tipos de atividade.
  if (escolhidas.length < quantas) {
    const banco: Atividade[] = [];
    for (let n = aula.aula - 1, olhadas = 0; n >= 1 && olhadas < 15; n--) {
      const lista = candidatasDa(n);
      if (!lista.length) continue;
      olhadas++;
      banco.push(...embaralhar(lista, s));
    }
    const nuncaVistos = banco.filter((x) => !p.itens[x.chave] && !evitar.has(x.chave));
    for (const a of escolherVariado(nuncaVistos, quantas - escolhidas.length, p, s, false)) usar(a);
    const outros = banco.filter((x) => !evitar.has(x.chave));
    for (const a of escolherVariado(outros, quantas - escolhidas.length, p, s, false)) usar(a);
  }
  return escolhidas;
}

/**
 * Como a sessão é montada:
 *  - 'aula'    → SÓ ESTA AULA (padrão): todas as atividades vêm da aula escolhida.
 *  - 'revisao' → ESTA AULA + REVISÃO: cerca de 70% da aula e 30% de revisão de aulas anteriores.
 */
export type ModoSessao = 'aula' | 'revisao';

/** Tipos que podem se repetir para completar a sessão (os de só ouvir/ler não se repetem). */
const NAO_REPETIR: TipoAtividade[] = ['conheca', 'leia', 'diga_letra'];

/** Monta a sessão de uma aula. Aula sem atividades → sessão vazia (a aula nem aparece na lista). */
export function montarSessao(
  c: Conteudo,
  aula: Aula,
  p: Progresso,
  s: Sorteio,
  total = 10,
  op: OpcoesConteudo = OPCOES_PADRAO,
  modo: ModoSessao = 'aula',
): Sessao {
  const tamanho = Math.max(8, Math.min(12, total));
  const proprias = atividadesDaAula(c, aula, s, op);
  if (proprias.length === 0) return { aula, atividades: [] };
  const obrigatorios = tiposObrigatorios(aula);

  const querRevisao = modo === 'revisao' ? Math.round(tamanho * 0.3) : 0;
  let daAula = escolherVariado(proprias, tamanho - querRevisao, p, s, true, obrigatorios);
  const evitar = new Set(daAula.map((a) => a.chave));
  const revisao = modo === 'revisao' ? escolherRevisao(c, aula, p, tamanho - daAula.length, s, evitar, op) : [];
  // Se faltou revisão (começo do caderno), completa com mais atividades da própria aula.
  if (daAula.length + revisao.length < tamanho) {
    const resto = proprias.filter((a) => !evitar.has(a.chave));
    daAula = [...daAula, ...escolherVariado(resto, tamanho - daAula.length - revisao.length, p, s)];
  }
  // Aula com pouco conteúdo: repete atividades de responder (não as de só ouvir e ler).
  // Se a aula só tiver atividades de ouvir e ler, a sessão fica mais curta.
  const repetiveis = proprias.filter((a) => !NAO_REPETIR.includes(a.tipo));
  for (let i = 0; repetiveis.length && daAula.length + revisao.length < tamanho && i < tamanho * 2; i++) {
    daAula.push(repetiveis[i % repetiveis.length]);
  }
  daAula.sort((a, b) => ESTAGIO[a.tipo] - ESTAGIO[b.tipo]);

  // Espalha a revisão no meio da sessão: depois da 2ª, 5ª, 8ª atividade...
  const atividades: Atividade[] = [...daAula];
  revisao.forEach((r, i) => atividades.splice(Math.min(atividades.length, 2 + i * 3 + i), 0, r));
  return { aula, atividades };
}

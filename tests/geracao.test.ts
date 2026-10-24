// Geração de atividades e montagem das sessões.
import { describe, expect, it } from 'vitest';
import { gerarCandidatas } from '../src/atividades/gerar';
import { montarSessao } from '../src/atividades/sessao';
import type { Atividade, TipoAtividade } from '../src/atividades/tipos';
import { criarSorteio } from '../src/util/aleatorio';
import { itensParaRevisar, registrarItem, INTERVALOS, type Progresso } from '../src/dados/progresso';
import { resolverPares } from '../src/conteudo/ligar';
import { normalizarFrase } from '../src/util/texto';
import { aula, conteudo } from './apoio';
import { aulaDisponivel } from '../src/atividades/disponiveis';

const vazio = (): Progresso => ({ sessoes: 1, ultimaAula: null, aulas: {}, itens: {}, tiposVistos: [] });
const todas = (): Atividade[] => conteudo.aulas.flatMap((a) => gerarCandidatas(conteudo, a, criarSorteio(a.aula)));

describe('geração das atividades', () => {
  it('gera todos os tipos de atividade ao longo do caderno', () => {
    const tipos = new Set(todas().map((a) => a.tipo));
    const esperados: TipoAtividade[] = [
      'conheca', 'escute_letra', 'diga_letra', 'escute_silaba', 'monte_silaba', 'complete_palavra', 'forme_palavra', 'quantas_silabas',
      'escute_palavra', 'escreva', 'complete_frase', 'ligue', 'leia', 'ordene', 'maiuscula',
      'conte', 'conta', 'pague', 'troco', 'da', 'hora',
    ];
    for (const t of esperados) expect(tipos, t).toContain(t);
  });

  it('a resposta certa está sempre entre as opções, e as opções não se repetem', () => {
    for (const a of todas()) {
      if (a.tipo === 'escute_silaba' || a.tipo === 'escute_palavra') {
        expect(a.opcoes).toContain(a.alvo);
        expect(new Set(a.opcoes).size).toBe(a.opcoes.length);
        expect(a.opcoes.length).toBeGreaterThanOrEqual(2);
      }
      if (a.tipo === 'complete_palavra') {
        expect(a.opcoes).toContain(a.silabas[a.falta]);
        expect(a.opcoes.length).toBe(3);
      }
      if (a.tipo === 'complete_frase') expect(a.opcoes).toContain(a.resposta);
      if (a.tipo === 'quantas_silabas') expect(a.opcoes).toContain(a.silabas.length);
      if (a.tipo === 'conte') expect(a.opcoes).toContain(a.quantidade);
      if (a.tipo === 'hora') expect(a.opcoes).toContain(a.hora);
      if (a.tipo === 'troco') expect(a.opcoes).toContain(a.pago - a.preco);
      if (a.tipo === 'monte_silaba') {
        expect(a.pecas.join('')).toBe(a.alvo);
        for (const p of a.pecas) expect(a.opcoes).toContain(p);
      }
      if (a.tipo === 'forme_palavra' || a.tipo === 'ordene') {
        const partes = a.tipo === 'forme_palavra' ? a.partes : a.palavras;
        expect([...a.embaralhadas].sort()).toEqual([...partes].sort());
      }
      if (a.tipo === 'forme_palavra') expect(a.partes.join('')).toBe(a.palavra);
      if (a.tipo === 'escreva') {
        expect(a.resposta.join('')).toBe(a.palavra);
        for (const r of a.resposta) expect(a.teclas).toContain(r);
      }
    }
  });

  it('a escrita (atividade 8) só aparece a partir da Unidade 5', () => {
    for (const a of conteudo.aulas) {
      const sessao = montarSessao(conteudo, a, vazio(), criarSorteio(a.aula));
      if (a.unidade < 5) expect(sessao.atividades.some((x) => x.tipo === 'escreva'), `aula ${a.aula}`).toBe(false);
    }
    for (const x of todas().filter((x) => x.tipo === 'escreva')) expect(aula(x.aula).unidade).toBeGreaterThanOrEqual(5);
  });

  it('nas Partes 3 a 3 a escrita usa sílabas como teclas; depois, letras', () => {
    for (const x of todas()) if (x.tipo === 'escreva') expect(x.modo).toBe(aula(x.aula).parte <= 3 ? 'silabas' : 'letras');
  });

  it('pagar e troco só em aulas com produtos ou contas com R$ (e na revisão depois delas)', () => {
    const temDinheiro = (n: number) => {
      const a = aula(n);
      return (a.produtos ?? []).length > 0 || (a.contas ?? []).some((c) => c.conta.includes('R$'));
    };
    const primeira = Math.min(...conteudo.aulas.filter((a) => temDinheiro(a.aula)).map((a) => a.aula));
    for (const a of conteudo.aulas) {
      const sessao = montarSessao(conteudo, a, vazio(), criarSorteio(a.aula));
      for (const x of sessao.atividades.filter((x) => x.tipo === 'pague' || x.tipo === 'troco')) {
        expect(temDinheiro(x.aula), `atividade da aula ${x.aula}`).toBe(true);
        expect(a.aula).toBeGreaterThanOrEqual(primeira);
      }
    }
  });

  it('complete a frase: usa a resposta do JSON ou a frase igual dos textos; senão, o item não é usado', () => {
    for (const a of conteudo.aulas) {
      const frases = (a.textos ?? []).flat().map((t) => normalizarFrase(t).toLocaleUpperCase('pt-BR'));
      for (const x of gerarCandidatas(conteudo, a, criarSorteio(1)).filter((x) => x.tipo === 'complete_frase')) {
        if (x.tipo !== 'complete_frase') continue;
        const original = (a.completar ?? []).find((c) => normalizarFrase(c.frase).toLocaleUpperCase('pt-BR') === normalizarFrase(x.frase).toLocaleUpperCase('pt-BR'));
        expect(original, x.frase).toBeDefined();
        if (original!.resposta !== null) expect(x.resposta.toLocaleUpperCase('pt-BR')).toBe(original!.resposta.toLocaleUpperCase('pt-BR'));
        else expect(frases).toContain(normalizarFrase(x.frase.replace('____', x.resposta)).toLocaleUpperCase('pt-BR'));
      }
    }
    // Casos do caderno: aula 52 "EU LEVO A ____ ." (null, sem frase igual) fica de fora;
    // aula 56 "O PAI ANOTA O ____ ." (null) vira NOME, porque o texto tem "O PAI ANOTA O NOME."
    const c52 = gerarCandidatas(conteudo, aula(52), criarSorteio(1)).filter((x) => x.tipo === 'complete_frase');
    expect(c52.map((x) => (x.tipo === 'complete_frase' ? x.frase : ''))).not.toContain('EU LEVO A ____.');
    const c56 = gerarCandidatas(conteudo, aula(56), criarSorteio(1)).find((x) => x.tipo === 'complete_frase' && x.frase.startsWith('O PAI ANOTA'));
    expect(c56 && c56.tipo === 'complete_frase' ? c56.resposta : '').toBe('NOME');
  });

  it('todos os itens "ligar" do caderno têm os pares descobertos', () => {
    for (const a of conteudo.aulas) for (const l of a.ligar ?? []) expect(resolverPares(l), `aula ${a.aula}: ${l.esquerda.join(',')}`).not.toBeNull();
  });
});

describe('sessões', () => {
  it('toda aula com conteúdo tem sessão de 8 a 12 atividades', () => {
    for (const a of conteudo.aulas) {
      const s = montarSessao(conteudo, a, vazio(), criarSorteio(a.aula), 10);
      if (s.atividades.length === 0) {
        expect(aulaDisponivel(conteudo, a)).toBe(false);
        continue;
      }
      expect(s.atividades.length, `aula ${a.aula}`).toBeGreaterThanOrEqual(8);
      expect(s.atividades.length, `aula ${a.aula}`).toBeLessThanOrEqual(12);
    }
  });

  it('cerca de 70% da aula e 30% de revisão', () => {
    const s = montarSessao(conteudo, aula(23), vazio(), criarSorteio(5), 10);
    expect(s.atividades.filter((a) => a.revisao).length).toBe(3);
    expect(s.atividades.filter((a) => !a.revisao).length).toBe(7);
    for (const r of s.atividades.filter((a) => a.revisao)) expect(r.aula).toBeLessThan(23);
  });

  it('aulas sem atividades de reconhecimento não têm sessão (e não aparecem)', () => {
    const s20 = montarSessao(conteudo, aula(20), vazio(), criarSorteio(1));
    expect(s20.atividades).toEqual([]);
    expect(aulaDisponivel(conteudo, aula(20))).toBe(false);
  });

  it('repetição espaçada: o que foi errado volta mais cedo', () => {
    const p = vazio();
    registrarItem(p, 'escute_palavra|LUPA', 23, false); // errou → caixa 1
    registrarItem(p, 'escute_palavra|PULO', 23, true); // acertou → caixa 2
    registrarItem(p, 'escute_palavra|PULO', 23, true); // acertou de novo → caixa 3
    expect(p.itens['escute_palavra|LUPA'].caixa).toBe(1);
    expect(p.itens['escute_palavra|PULO'].caixa).toBe(3);
    expect(p.itens['escute_palavra|LUPA'].proxima).toBe(p.sessoes + INTERVALOS[1]);
    p.sessoes += 1;
    const devidos = itensParaRevisar(p, 24).map(([c]) => c);
    expect(devidos).toEqual(['escute_palavra|LUPA']);
    // Na sessão da aula 24, o item errado aparece na revisão.
    const s = montarSessao(conteudo, aula(24), p, criarSorteio(3));
    expect(s.atividades.some((a) => a.revisao && a.chave === 'escute_palavra|LUPA')).toBe(true);
  });
});

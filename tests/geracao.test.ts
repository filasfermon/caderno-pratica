// Geração de atividades e montagem das sessões.
import { describe, expect, it } from 'vitest';
import { gerarCandidatas } from '../src/atividades/gerar';
import { montarSessao } from '../src/atividades/sessao';
import type { Atividade, TipoAtividade } from '../src/atividades/tipos';
import { criarSorteio } from '../src/util/aleatorio';
import { resolverPares } from '../src/conteudo/ligar';
import { normalizarFrase } from '../src/util/texto';
import { aula, conteudo } from './apoio';
import { aulaDisponivel } from '../src/atividades/disponiveis';

const todas = (): Atividade[] => conteudo.aulas.flatMap((a) => gerarCandidatas(conteudo, a, criarSorteio(a.aula)));

describe('geração das atividades', () => {
  it('gera todos os tipos de atividade ao longo do caderno', () => {
    const tipos = new Set(todas().map((a) => a.tipo));
    const esperados: TipoAtividade[] = [
      'conheca', 'escute_letra', 'ouca_fale', 'escute_silaba', 'monte_silaba', 'complete_palavra', 'forme_palavra', 'quantas_silabas',
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
      const sessao = montarSessao(conteudo, a, criarSorteio(a.aula), 10, undefined, 'revisao');
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
      const sessao = montarSessao(conteudo, a, criarSorteio(a.aula), 10, undefined, 'revisao');
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
  it('ESTA AULA + REVISÃO: toda aula com atividades tem sessão de 8 a 12', () => {
    for (const a of conteudo.aulas) {
      const s = montarSessao(conteudo, a, criarSorteio(a.aula), 10, undefined, 'revisao');
      if (s.atividades.length === 0) {
        expect(aulaDisponivel(conteudo, a)).toBe(false);
        continue;
      }
      expect(s.atividades.length, `aula ${a.aula}`).toBeGreaterThanOrEqual(8);
      expect(s.atividades.length, `aula ${a.aula}`).toBeLessThanOrEqual(12);
    }
  });

  it('SÓ ESTA AULA (padrão): todas as atividades são da aula, sem revisão; 8 a 12 quando há o que responder', () => {
    for (const a of conteudo.aulas) {
      const s = montarSessao(conteudo, a, criarSorteio(a.aula), 10);
      if (!aulaDisponivel(conteudo, a)) continue;
      expect(s.atividades.length, `aula ${a.aula}`).toBeGreaterThan(0);
      expect(s.atividades.length, `aula ${a.aula}`).toBeLessThanOrEqual(12);
      for (const at of s.atividades) {
        expect(at.revisao, `aula ${a.aula}`).toBeFalsy();
        expect(at.aula).toBe(a.aula);
      }
      const temOQueResponder = s.atividades.some((x) => !['conheca', 'leia', 'ouca_fale'].includes(x.tipo));
      if (temOQueResponder) expect(s.atividades.length, `aula ${a.aula}`).toBeGreaterThanOrEqual(8);
    }
  });

  it('cerca de 70% da aula e 30% de revisão no modo ESTA AULA + REVISÃO', () => {
    const s = montarSessao(conteudo, aula(23), criarSorteio(5), 10, undefined, 'revisao');
    expect(s.atividades.filter((a) => a.revisao).length).toBe(3);
    expect(s.atividades.filter((a) => !a.revisao).length).toBe(7);
    for (const r of s.atividades.filter((a) => a.revisao)) expect(r.aula).toBeLessThan(23);
  });

  it('aulas sem atividades de reconhecimento não têm sessão (e não aparecem)', () => {
    const s20 = montarSessao(conteudo, aula(20), criarSorteio(1));
    expect(s20.atividades).toEqual([]);
    expect(aulaDisponivel(conteudo, aula(20))).toBe(false);
  });

  it('a revisão não tem memória: duas práticas iguais podem sortear itens diferentes', () => {
    const revisoes = new Set<string>();
    for (let k = 1; k <= 6; k++)
      for (const r of montarSessao(conteudo, aula(40), criarSorteio(k), 10, undefined, 'revisao').atividades.filter((a) => a.revisao)) {
        expect(r.aula).toBeLessThan(40);
        revisoes.add(r.chave);
      }
    expect(revisoes.size).toBeGreaterThan(3);
  });
});

describe('Ouça e fale (sem gravação)', () => {
  it('existe para letras (dita pelo nome), sílabas e palavras', () => {
    const ouca = todas().filter((a) => a.tipo === 'ouca_fale');
    const categorias = new Set(ouca.map((a) => (a.tipo === 'ouca_fale' ? a.categoria : '')));
    expect([...categorias].sort()).toEqual(['letra', 'palavra', 'silaba']);
    const p = gerarCandidatas(conteudo, aula(23), criarSorteio(1)).find((a) => a.tipo === 'ouca_fale' && a.categoria === 'letra');
    expect(p && p.tipo === 'ouca_fale' && p.alvo).toBe('L');
  });

  it('nas aulas das vogais e "Aprenda", o da letra vem primeiro; no máximo 2 quando a aula tem bastante conteúdo', () => {
    for (const n of [8, 9, 23, 24, 40]) {
      const s = montarSessao(conteudo, aula(n), criarSorteio(n), 10);
      const ouca = s.atividades.filter((a) => a.tipo === 'ouca_fale');
      expect(ouca.length, `aula ${n}`).toBeGreaterThanOrEqual(1);
      // Aulas do começo (só vogais) têm pouco conteúdo: a prática é completada com mais itens.
      if (n >= 23) expect(ouca.length, `aula ${n}`).toBeLessThanOrEqual(2);
      const temLetra = gerarCandidatas(conteudo, aula(n), criarSorteio(1)).some((a) => a.tipo === 'ouca_fale' && a.categoria === 'letra');
      if (temLetra) expect(ouca[0].tipo === 'ouca_fale' && ouca[0].categoria, `aula ${n}`).toBe('letra');
    }
  });
});

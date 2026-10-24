// VALIDADOR DA REGRA DE PROGRESSÃO, rodado sobre todas as atividades geradas para todas as aulas.
import { describe, expect, it } from 'vitest';
import { conhecimentoDaAula, problemasDoTexto } from '../src/conteudo/progressao';
import { gerarCandidatas } from '../src/atividades/gerar';
import { montarSessao } from '../src/atividades/sessao';
import { textosVisiveis } from '../src/atividades/visiveis';
import { criarSorteio } from '../src/util/aleatorio';
import { registrarItem, type Progresso } from '../src/dados/progresso';
import { aula, conteudo } from './apoio';

const pode = (n: number, texto: string) => problemasDoTexto(texto, conhecimentoDaAula(aula(n))).length === 0;

describe('validador (casos conhecidos)', () => {
  it('letras: só as já ensinadas', () => {
    expect(pode(21, 'PAPO')).toBe(true);
    expect(pode(21, 'LUPA')).toBe(false); // L só na aula 23
    expect(pode(23, 'LUPA')).toBe(true);
  });
  it('palavras de leitura global valem antes das letras', () => {
    expect(pode(18, 'PARE')).toBe(true);
    expect(pode(18, 'SAÍDA')).toBe(true);
    expect(pode(17, 'PARE')).toBe(false);
  });
  it('CH, LH, NH, RR, SS, Ç e ÃO só depois de liberados', () => {
    expect(pode(99, 'CHUVA')).toBe(false);
    expect(pode(100, 'CHUVA')).toBe(true);
    expect(pode(108, 'TERRA')).toBe(false);
    expect(pode(109, 'TERRA')).toBe(true);
    expect(pode(112, 'LAÇO')).toBe(false);
    expect(pode(113, 'LAÇO')).toBe(true);
    expect(pode(114, 'LIMÃO')).toBe(false);
    expect(pode(115, 'LIMÃO')).toBe(true);
  });
  it('CODA (letra no fim da sílaba), ENC (encontros) e ACENTO', () => {
    expect(pode(121, 'CARTA')).toBe(false);
    expect(pode(122, 'CARTA')).toBe(true);
    expect(pode(128, 'LIVRO')).toBe(false);
    expect(pode(129, 'LIVRO')).toBe(true);
    expect(pode(119, 'VOCÊ')).toBe(false);
    expect(pode(120, 'VOCÊ')).toBe(true);
  });
  it('minúsculas e números', () => {
    expect(pode(30, 'O pai leu o mapa.')).toBe(false);
    expect(pode(31, 'O pai leu o mapa.')).toBe(true);
    expect(pode(10, '3')).toBe(false);
    expect(pode(11, '3')).toBe(true);
    expect(pode(11, '7')).toBe(false);
  });
});

describe('regra de progressão em TODAS as atividades geradas', () => {
  it('toda atividade candidata de cada aula só mostra o que já foi ensinado', () => {
    let conferidos = 0;
    for (const a of conteudo.aulas) {
      const k = conhecimentoDaAula(a);
      for (const semente of [1, 2, 3]) {
        for (const at of gerarCandidatas(conteudo, a, criarSorteio(semente * 1000 + a.aula))) {
          for (const t of textosVisiveis(at)) {
            expect(problemasDoTexto(t, k), `aula ${a.aula} · ${at.tipo} · "${t}"`).toEqual([]);
            conferidos++;
          }
        }
      }
    }
    expect(conferidos).toBeGreaterThan(10000);
  });

  it('toda sessão (aula + revisão) só mostra o que já foi ensinado na aula escolhida', () => {
    // Progresso simulado: o estudante já praticou e errou itens de várias aulas.
    const p: Progresso = { sessoes: 0, ultimaAula: null, aulas: {}, itens: {}, tiposVistos: [] };
    for (const a of conteudo.aulas) {
      p.sessoes++;
      const sessao = montarSessao(conteudo, a, p, criarSorteio(a.aula), 10, undefined, a.aula % 2 ? 'revisao' : 'aula');
      const k = conhecimentoDaAula(a);
      for (const at of sessao.atividades) {
        for (const t of textosVisiveis(at)) expect(problemasDoTexto(t, k), `aula ${a.aula} · ${at.tipo} · "${t}"`).toEqual([]);
        registrarItem(p, at.chave, at.aula, at.chave.length % 3 !== 0);
      }
    }
  });
});

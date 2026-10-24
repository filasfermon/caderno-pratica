// Correção 1: só atividades de reconhecimento; lista de exclusão; chave de números e dinheiro.
import { describe, expect, it } from 'vitest';
import { atividadesDaAula, aulaDisponivel, aulasDisponiveis, tiposObrigatorios } from '../src/atividades/disponiveis';
import { montarSessao } from '../src/atividades/sessao';
import { ehAtividadeDeNumeros, TIPOS_DE_NUMEROS } from '../src/atividades/tipos';
import { PARTES_EXCLUIDAS, aulaNaListaDeExclusao } from '../src/config/aulas_excluidas';
import { registrarItem, type Progresso } from '../src/dados/progresso';
import { criarSorteio } from '../src/util/aleatorio';
import { aula, conteudo } from './apoio';

const vazio = (): Progresso => ({ sessoes: 1, ultimaAula: null, aulas: {}, itens: {}, tiposVistos: [] });
const SEM_NUMEROS = { numeros: false };

describe('lista de exclusão', () => {
  it('a Parte 1 inteira (caligrafia e coordenação motora) está fora do app', () => {
    expect(PARTES_EXCLUIDAS).toContain(1);
    for (const a of conteudo.aulas.filter((x) => x.parte === 1)) {
      expect(aulaNaListaDeExclusao(a)).toBe(true);
      expect(aulaDisponivel(conteudo, a), `aula ${a.aula}`).toBe(false);
      expect(atividadesDaAula(conteudo, a, criarSorteio(1))).toEqual([]);
    }
  });

  it('aulas sem nenhuma atividade de reconhecimento também somem; as outras continuam', () => {
    const disponiveis = aulasDisponiveis(conteudo).map((a) => a.aula);
    for (const n of [7, 20, 35, 55, 57, 58, 82, 136, 145, 150]) expect(disponiveis, `aula ${n}`).not.toContain(n);
    for (const n of [8, 14, 21, 23, 97, 140, 149]) expect(disponiveis, `aula ${n}`).toContain(n);
  });

  it('aulas excluídas não entram na revisão', () => {
    const p = vazio();
    for (let k = 0; k < 20; k++) {
      const s = montarSessao(conteudo, aula(9), p, criarSorteio(k));
      for (const at of s.atividades) expect(aulaNaListaDeExclusao(aula(at.aula))).toBe(false);
      for (const at of s.atividades) registrarItem(p, at.chave, at.aula, false);
      p.sessoes++;
    }
  });
});

describe('atividades de reconhecimento obrigatórias', () => {
  const alvo = conteudo.aulas.filter((a) => tiposObrigatorios(a).length > 0 && aulaDisponivel(conteudo, a));

  it('aulas das vogais e "Aprenda" de consoante: letra, sílaba e "diga o nome da letra"', () => {
    expect(alvo.map((a) => a.aula)).toEqual(expect.arrayContaining([8, 9, 10, 11, 13, 14, 15, 16, 18, 19, 21, 23, 25, 36, 59, 76, 78]));
    for (const a of alvo) {
      const tipos = new Set(atividadesDaAula(conteudo, a, criarSorteio(1)).map((x) => x.tipo));
      for (const t of ['escute_letra', 'escute_silaba', 'diga_letra'] as const) expect(tipos, `aula ${a.aula}: ${t}`).toContain(t);
      // ...e os três aparecem de fato na sessão
      for (let semente = 1; semente <= 3; semente++) {
        const naSessao = new Set(montarSessao(conteudo, a, vazio(), criarSorteio(semente)).atividades.filter((x) => !x.revisao).map((x) => x.tipo));
        for (const t of ['escute_letra', 'escute_silaba', 'diga_letra'] as const) expect(naSessao, `sessão aula ${a.aula}: ${t}`).toContain(t);
      }
    }
  });

  it('"Escute e toque a letra" tem de 2 a 4 letras e distingue vogais parecidas (A e E)', () => {
    for (const a of alvo) {
      for (const at of atividadesDaAula(conteudo, a, criarSorteio(2))) {
        if (at.tipo !== 'escute_letra') continue;
        expect(at.opcoes.length).toBeGreaterThanOrEqual(2);
        expect(at.opcoes.length).toBeLessThanOrEqual(4);
        expect(at.opcoes).toContain(at.alvo);
      }
    }
    const aula8 = atividadesDaAula(conteudo, aula(8), criarSorteio(1)).find((x) => x.tipo === 'escute_letra' && x.alvo === 'A');
    expect(aula8 && aula8.tipo === 'escute_letra' ? [...aula8.opcoes].sort() : []).toEqual(['A', 'E']);
    const aula10 = atividadesDaAula(conteudo, aula(10), criarSorteio(1)).find((x) => x.tipo === 'escute_letra' && x.alvo === 'A');
    expect(aula10 && aula10.tipo === 'escute_letra' ? aula10.opcoes : []).toContain('E');
  });
});

describe('chave "mostrar atividades de números e dinheiro"', () => {
  it('desligada: nenhuma atividade de números nas sessões', () => {
    for (const a of aulasDisponiveis(conteudo, SEM_NUMEROS)) {
      const s = montarSessao(conteudo, a, vazio(), criarSorteio(a.aula), 10, SEM_NUMEROS);
      for (const at of s.atividades) {
        expect(TIPOS_DE_NUMEROS, `aula ${a.aula}`).not.toContain(at.tipo);
        expect(ehAtividadeDeNumeros(at), `aula ${a.aula} ${at.tipo}`).toBe(false);
      }
    }
  });

  it('desligada: aulas que só têm números somem da lista; ligada, voltam', () => {
    const com = aulasDisponiveis(conteudo).map((a) => a.aula);
    const sem = aulasDisponiveis(conteudo, SEM_NUMEROS).map((a) => a.aula);
    for (const n of [17, 32, 47, 53, 54, 68, 81, 88, 97, 106, 117, 126, 140, 144]) {
      expect(com, `aula ${n}`).toContain(n);
      expect(sem, `aula ${n}`).not.toContain(n);
    }
    expect(sem).toContain(23);
  });
});

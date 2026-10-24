// Correção 2: ritmo natural da voz e instruções curtas.
import { describe, expect, it } from 'vitest';
import { normalizarConfig, VELOCIDADE_MAXIMA, VELOCIDADE_MINIMA, config } from '../src/dados/config';
import { instrucaoDe, TODAS_AS_INSTRUCOES } from '../src/atividades/rotulos';
import { gerarCandidatas } from '../src/atividades/gerar';
import { criarSorteio } from '../src/util/aleatorio';
import { conteudo } from './apoio';

describe('velocidade da voz', () => {
  it('padrão 1,0 e ajuste de 0,9 a 1,2', () => {
    expect(config().velocidade).toBe(1);
    expect(VELOCIDADE_MINIMA).toBe(0.9);
    expect(VELOCIDADE_MAXIMA).toBe(1.2);
  });
  it('a velocidade antiga (0,85) passa para 1,0; valores fora da faixa são ajustados', () => {
    expect(normalizarConfig({ velocidade: 0.85 }).velocidade).toBe(1);
    expect(normalizarConfig({ velocidade: 0.5 }).velocidade).toBe(0.9);
    expect(normalizarConfig({ velocidade: 2 }).velocidade).toBe(1.2);
    expect(normalizarConfig({ velocidade: 1.1 }).velocidade).toBe(1.1);
  });
});

describe('instruções', () => {
  it('são uma frase curta e direta (no máximo 6 palavras) e estão na lista do professor', () => {
    const vistas = new Set<string>();
    for (const a of conteudo.aulas)
      for (const at of gerarCandidatas(conteudo, a, criarSorteio(1))) vistas.add(instrucaoDe(at));
    for (const t of vistas) {
      expect(t.split(/\s+/).length, t).toBeLessThanOrEqual(6);
      expect((t.match(/[.?!]/g) ?? []).length, t).toBe(1);
      expect(TODAS_AS_INSTRUCOES, t).toContain(t);
    }
    expect(vistas).toContain('Escute e toque a letra.');
    expect(vistas).toContain('Qual é a sílaba?');
    expect(vistas).toContain('Forme a palavra.');
  });
});

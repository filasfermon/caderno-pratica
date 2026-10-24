// Ritmo natural da voz e instruções curtas.
import { describe, expect, it } from 'vitest';
import { VELOCIDADE_DA_VOZ, VOGAL_NAS_SILABAS, MOSTRAR_NUMEROS_E_DINHEIRO } from '../src/config/padroes';
import { instrucaoDe, TODAS_AS_INSTRUCOES } from '../src/atividades/rotulos';
import { gerarCandidatas } from '../src/atividades/gerar';
import { criarSorteio } from '../src/util/aleatorio';
import { conteudo } from './apoio';

describe('valores fixos (src/config/padroes.ts)', () => {
  it('voz do celular a 1,0, vogal aberta, números e dinheiro incluídos', () => {
    expect(VELOCIDADE_DA_VOZ).toBe(1);
    expect(VOGAL_NAS_SILABAS).toBe('aberta');
    expect(MOSTRAR_NUMEROS_E_DINHEIRO).toBe(true);
  });
});

describe('instruções', () => {
  it('são uma frase curta e direta (no máximo 6 palavras) e estão na lista de instruções', () => {
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

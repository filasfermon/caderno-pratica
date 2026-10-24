// Correção 6: juntar o progresso do aparelho com o da conta Google; app sem Firebase configurado.
import { describe, expect, it } from 'vitest';
import { juntarProgressos, mesmoProgresso } from '../src/conta/juntar';
import { firebaseConfigurado } from '../src/conta/config-firebase';
import type { Progresso } from '../src/dados/progresso';

const p = (x: Partial<Progresso>): Progresso => ({ sessoes: 0, ultimaAula: null, aulas: {}, itens: {}, tiposVistos: [], ...x });

describe('juntar progressos (entrar com Google levando o progresso local)', () => {
  it('nada se perde: aulas e itens dos dois lados', () => {
    const local = p({ sessoes: 3, ultimaAula: 23, atualizado: 200, aulas: { 23: { vezes: 2, ultima: 200 } }, itens: { a: { caixa: 2, proxima: 4, aula: 23, vezes: 1 } }, tiposVistos: ['conheca'] });
    const conta = p({ sessoes: 5, ultimaAula: 40, atualizado: 100, aulas: { 40: { vezes: 1, ultima: 100 }, 23: { vezes: 1, ultima: 50 } }, itens: { b: { caixa: 1, proxima: 6, aula: 40, vezes: 3 } }, tiposVistos: ['ligue'] });
    const j = juntarProgressos(local, conta);
    expect(Object.keys(j.aulas).sort()).toEqual(['23', '40']);
    expect(j.aulas[23].vezes).toBe(2);
    expect(Object.keys(j.itens).sort()).toEqual(['a', 'b']);
    expect(j.tiposVistos.sort()).toEqual(['conheca', 'ligue']);
    expect(j.sessoes).toBe(5);
    expect(j.ultimaAula).toBe(23); // do lado mais recente
  });

  it('o mesmo item nos dois lados: fica o mais praticado', () => {
    const a = p({ itens: { x: { caixa: 3, proxima: 9, aula: 1, vezes: 4 } } });
    const b = p({ itens: { x: { caixa: 1, proxima: 2, aula: 1, vezes: 2 } } });
    expect(juntarProgressos(a, b).itens.x.vezes).toBe(4);
    expect(juntarProgressos(b, a).itens.x.vezes).toBe(4);
  });

  it('juntar com uma cópia igual não muda nada', () => {
    const a = p({ sessoes: 2, aulas: { 9: { vezes: 1, ultima: 5 } }, atualizado: 5 });
    expect(mesmoProgresso(juntarProgressos(a, a), a)).toBe(true);
  });
});

describe('sem as variáveis do Firebase', () => {
  it('o app funciona só com "ENTRAR SEM CONTA" (nada é configurado)', () => {
    expect(firebaseConfigurado()).toBe(false);
  });
});

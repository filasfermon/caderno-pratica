import { describe, expect, it } from 'vitest';
import { silabar } from '../src/conteudo/silabas';
import { conteudo } from './apoio';

describe('silabador', () => {
  it('divide igual ao caderno em todas as divisões que o conteúdo traz (formar e "LU + PA")', () => {
    const casos: [string, string[]][] = [];
    for (const a of conteudo.aulas) {
      for (const f of a.formar ?? []) casos.push([f.palavra, f.partes]);
      for (const l of a.ligar ?? [])
        for (const d of [...l.esquerda, ...l.direita]) if (d.includes(' + ')) casos.push([d.split(' + ').join(''), d.split(' + ')]);
    }
    expect(casos.length).toBeGreaterThan(50);
    for (const [palavra, partes] of casos) expect(silabar(palavra), palavra).toEqual(partes);
  });

  it.each([
    ['CEBOLA', 'CE-BO-LA'],
    ['QUIABO', 'QUI-A-BO'],
    ['GUIA', 'GUI-A'],
    ['ÁGUA', 'Á-GUA'],
    ['CLIENTE', 'CLI-EN-TE'],
    ['BICICLETA', 'BI-CI-CLE-TA'],
    ['SAÍDA', 'SA-Í-DA'],
    ['CAMINHÃO', 'CA-MI-NHÃO'],
    ['PASSEIO', 'PAS-SEI-O'],
    ['LIMPEZA', 'LIM-PE-ZA'],
    ['TRÊS', 'TRÊS'],
    ['UAU', 'U-AU'],
    ['cozinha', 'co-zi-nha'],
  ])('%s → %s', (palavra, esperado) => {
    expect(silabar(palavra).join('-')).toBe(esperado);
  });
});

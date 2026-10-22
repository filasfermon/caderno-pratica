// Tabela de pronúncia sem lacunas: toda sílaba do conteúdo tem entrada.
import { describe, expect, it } from 'vitest';
import tabela from '../src/dados/pronuncia.json';
import { silabasDoConteudo } from '../src/conteudo/consulta';
import { gerarCandidatas } from '../src/atividades/gerar';
import { audiosDaAtividade } from '../src/atividades/audios';
import { criarSorteio } from '../src/util/aleatorio';
import { textoParaFala, prepararTextoGeral } from '../src/audio/pronuncia';
import { maiusculas } from '../src/util/texto';
import { conteudo } from './apoio';

const silabas = tabela.silabas as Record<string, string | { aberta: string; fechada: string }>;
const letras = tabela.letras as Record<string, { nome: string; fala: string }>;

describe('tabela de pronúncia', () => {
  it('toda sílaba do conteúdo tem entrada', () => {
    const faltando = silabasDoConteudo(conteudo).filter((s) => !(s in silabas));
    expect(faltando).toEqual([]);
  });

  it('toda sílaba que as atividades falam tem entrada', () => {
    const faltando = new Set<string>();
    for (const a of conteudo.aulas)
      for (const at of gerarCandidatas(conteudo, a, criarSorteio(1)))
        for (const item of audiosDaAtividade(at)) if (item.categoria === 'silaba' && !(maiusculas(item.texto) in silabas)) faltando.add(item.texto);
    expect([...faltando]).toEqual([]);
  });

  it('toda letra que aparece sozinha tem nome e exemplo', () => {
    for (const a of conteudo.aulas)
      for (const s of [...(a.silabas ?? []), ...(a.palavras ?? [])])
        if (/^\p{L}$/u.test(s.trim())) {
          expect(letras[maiusculas(s.trim())], s).toBeDefined();
          expect(letras[maiusculas(s.trim())].fala).toContain(',');
        }
  });

  it('nenhuma entrada vazia; sílabas com E ou O soltos têm forma aberta e fechada', () => {
    for (const [s, v] of Object.entries(silabas)) {
      if (typeof v === 'string') expect(v.trim(), s).not.toBe('');
      else {
        expect(v.aberta.trim(), s).not.toBe('');
        expect(v.fechada.trim(), s).not.toBe('');
      }
    }
    expect(silabas.PE).toEqual({ aberta: 'pé', fechada: 'pê' });
    expect(silabas.PO).toEqual({ aberta: 'pó', fechada: 'pô' });
  });

  it('o texto falado é diferente do texto da tela quando precisa', () => {
    expect(textoParaFala({ categoria: 'silaba', texto: 'PE' })).toBe('pé'); // vogal aberta é o padrão
    expect(textoParaFala({ categoria: 'silaba', texto: 'QUE' })).toBe('qué');
    expect(textoParaFala({ categoria: 'silaba', texto: 'ÇA' })).toBe('sá');
    expect(textoParaFala({ categoria: 'silaba', texto: 'HA' })).toBe('á');
    expect(textoParaFala({ categoria: 'letra', texto: 'P' })).toBe('pê, de pai');
    expect(textoParaFala({ categoria: 'tecla', texto: 'CH' })).toBe('cê agá');
    expect(textoParaFala({ categoria: 'palavra', texto: 'IFCE' })).toBe('í éfe cê é');
    expect(prepararTextoGeral('R$ 2,50')).toBe('2 reais e 50 centavos');
    expect(prepararTextoGeral('3 + 5 =')).toBe('3 mais 5 é igual a quanto?');
    expect(prepararTextoGeral('R$ 60 ÷ 3 = R$')).toBe('60 reais dividido por 3 é igual a quantos reais?');
    expect(prepararTextoGeral('8:00')).toBe('8 horas');
  });
});

// Contas e dinheiro: todo resultado gerado deve bater com o JSON.
import { describe, expect, it } from 'vitest';
import { gerarCandidatas } from '../src/atividades/gerar';
import { calcularConta, contaDeTroco, numeroParaCentavos, passosDoTroco, precoEmCentavos, formatarReais, resultadoComoTexto, dinheiroParaPagar, combinacaoExata } from '../src/conteudo/contas';
import { criarSorteio } from '../src/util/aleatorio';
import { conteudo } from './apoio';

describe('contas', () => {
  it('a resposta de cada atividade "Faça a conta" é o resultado do JSON', () => {
    let n = 0;
    for (const a of conteudo.aulas) {
      for (const at of gerarCandidatas(conteudo, a, criarSorteio(1))) {
        if (at.tipo !== 'conta') continue;
        const original = (a.contas ?? []).find((c) => c.conta.toLocaleUpperCase('pt-BR') === at.conta.toLocaleUpperCase('pt-BR'));
        expect(original, at.conta).toBeDefined();
        expect(at.resultado).toBe(original!.resultado);
        n++;
      }
    }
    expect(n).toBeGreaterThan(80);
  });

  it('o próprio JSON está certo: cada conta, calculada, dá o resultado escrito', () => {
    for (const a of conteudo.aulas) {
      for (const c of a.contas ?? []) {
        const calculado = calcularConta(c.conta, a.produtos ?? []);
        expect(calculado, `aula ${a.aula}: ${c.conta}`).not.toBeNull();
        expect(calculado, `aula ${a.aula}: ${c.conta}`).toBeCloseTo(c.resultado, 2);
      }
    }
  });

  it('troco: o valor certo é pago − preço, igual ao JSON, e as moedas somam o troco', () => {
    let n = 0;
    for (const a of conteudo.aulas) {
      for (const at of gerarCandidatas(conteudo, a, criarSorteio(1))) {
        if (at.tipo !== 'troco') continue;
        const original = (a.contas ?? []).find((c) => contaDeTroco(c.conta)?.pago === at.pago && contaDeTroco(c.conta)?.preco === at.preco)!;
        expect(at.pago - at.preco).toBe(numeroParaCentavos(original.resultado));
        expect(at.passos.reduce((s, v) => s + v, 0)).toBe(at.pago - at.preco);
        n++;
      }
    }
    expect(n).toBeGreaterThan(4);
    expect(passosDoTroco(3700, 5000)).toEqual([100, 100, 100, 1000]);
  });

  it('pagar: sempre existe uma combinação certa com as notas e moedas oferecidas', () => {
    for (const a of conteudo.aulas) {
      for (const at of gerarCandidatas(conteudo, a, criarSorteio(1))) {
        if (at.tipo !== 'pague') continue;
        const jeito = combinacaoExata(at.preco, at.dinheiro);
        expect(jeito, `aula ${a.aula}: ${formatarReais(at.preco)}`).not.toBeNull();
        expect(jeito!.reduce((s, v) => s + v, 0)).toBe(at.preco);
      }
    }
    expect(dinheiroParaPagar(625)).toContain(25);
  });

  it('o dinheiro dá?: a resposta compara o dinheiro na mão com o preço', () => {
    for (const a of conteudo.aulas)
      for (const at of gerarCandidatas(conteudo, a, criarSorteio(1)))
        if (at.tipo === 'da') {
          const p = (a.produtos ?? []).find((x) => x.produto.toLocaleUpperCase('pt-BR') === at.produto.toLocaleUpperCase('pt-BR'))!;
          expect(precoEmCentavos(p.preco)).toBe(at.preco);
        }
  });

  it('formatos', () => {
    expect(precoEmCentavos('R$ 12,90')).toBe(1290);
    expect(formatarReais(625)).toBe('R$ 6,25');
    expect(resultadoComoTexto(6.25)).toBe('6,25');
    expect(resultadoComoTexto(17.0)).toBe('17');
  });
});

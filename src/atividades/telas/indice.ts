// Liga cada tipo de atividade à sua tela.

import type { Atividade } from '../tipos';
import { combinacaoExata, resultadoComoTexto } from '../../conteudo/contas';
import type { Contexto, Controle } from './contrato';
import {
  montarCompletePalavra,
  montarConheca,
  montarEscute,
  montarFormePalavra,
  montarLeia,
  montarMonteSilaba,
  montarOrdene,
  montarQuantas,
  montarDigaLetra,
} from './leitura';
import { montarCompleteFrase, montarEscreva, montarLigue } from './escrita';
import { montarConta, montarConte, montarDa, montarHora, montarPague, montarTroco } from './numeros';

/**
 * A resposta esperada, guardada num atributo da tela (data-resposta).
 * Serve aos testes automáticos (Playwright) para fazer uma sessão inteira.
 */
function respostaParaTeste(a: Atividade): unknown {
  switch (a.tipo) {
    case 'monte_silaba':
      return a.pecas;
    case 'forme_palavra':
      return a.partes;
    case 'ordene':
      return a.palavras;
    case 'escreva':
      return a.resposta;
    case 'conta':
      return [...resultadoComoTexto(a.resultado)];
    case 'pague':
      return combinacaoExata(a.preco, a.dinheiro);
    case 'ligue':
    case 'maiuscula':
      return a.pares;
    default:
      return null;
  }
}

export function montarAtividade(a: Atividade, ctx: Contexto): Controle {
  ctx.area.dataset.resposta = JSON.stringify(respostaParaTeste(a));
  return montarTela(a, ctx);
}

function montarTela(a: Atividade, ctx: Contexto): Controle {
  switch (a.tipo) {
    case 'escute_letra':
      return montarEscute(a, ctx);
    case 'diga_letra':
      return montarDigaLetra(a, ctx);
    case 'conheca':
      return montarConheca(a, ctx);
    case 'escute_silaba':
    case 'escute_palavra':
      return montarEscute(a, ctx);
    case 'monte_silaba':
      return montarMonteSilaba(a, ctx);
    case 'complete_palavra':
      return montarCompletePalavra(a, ctx);
    case 'forme_palavra':
      return montarFormePalavra(a, ctx);
    case 'quantas_silabas':
      return montarQuantas(a, ctx);
    case 'escreva':
      return montarEscreva(a, ctx);
    case 'complete_frase':
      return montarCompleteFrase(a, ctx);
    case 'ligue':
    case 'maiuscula':
      return montarLigue(a, ctx);
    case 'leia':
      return montarLeia(a, ctx);
    case 'ordene':
      return montarOrdene(a, ctx);
    case 'conte':
      return montarConte(a, ctx);
    case 'conta':
      return montarConta(a, ctx);
    case 'pague':
      return montarPague(a, ctx);
    case 'troco':
      return montarTroco(a, ctx);
    case 'da':
      return montarDa(a, ctx);
    case 'hora':
      return montarHora(a, ctx);
  }
}

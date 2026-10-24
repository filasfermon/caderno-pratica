// Lista tudo o que uma atividade mostra escrito na tela.
// O teste da regra de progressão confere cada um destes textos.
// (Instruções e botões da interface — VOLTAR, SEGUIR... — são sempre lidos em voz alta
// e não fazem parte do conteúdo de leitura; veja as decisões no README.)

import type { Atividade } from './tipos';
import { formatarReais, resultadoComoTexto } from '../conteudo/contas';
import { rotuloDoDinheiro } from './rotulos';

export function textosVisiveis(a: Atividade): string[] {
  switch (a.tipo) {
    case 'escute_letra':
      return a.opcoes;
    case 'diga_letra':
      return [a.alvo];
    case 'conheca':
      return [a.alvo, ...(a.silabas ? [a.silabas.join(' + ')] : [])];
    case 'escute_silaba':
    case 'escute_palavra':
      return a.opcoes;
    case 'monte_silaba':
      return [a.alvo, ...a.opcoes];
    case 'complete_palavra':
      return a.opcoes.map((o) => a.silabas.map((x, i) => (i === a.falta ? o : x)).join(' + '));
    case 'forme_palavra':
      return [a.palavra, a.partes.join(' + ')];
    case 'quantas_silabas':
      return [a.palavra, ...a.opcoes.map(String)];
    case 'escreva':
      return [a.palavra, ...a.teclas];
    case 'complete_frase':
      return [...a.opcoes.map((o) => a.frase.replace('____', o)), ...a.opcoes];
    case 'ligue':
    case 'maiuscula':
      return [...a.esquerda, ...a.direita];
    case 'leia':
      return a.linhas;
    case 'ordene':
      return a.palavras;
    case 'conte':
      return a.opcoes.map(String);
    case 'conta':
      return [a.conta, resultadoComoTexto(a.resultado), ...a.produtos.flatMap((p) => [p.produto, p.preco])];
    case 'pague':
      return [formatarReais(a.preco), ...(a.produto ? [a.produto] : []), ...a.dinheiro.map(rotuloDoDinheiro)];
    case 'troco':
      return [formatarReais(a.preco), formatarReais(a.pago), ...a.opcoes.map(formatarReais), ...a.passos.map(rotuloDoDinheiro)];
    case 'da':
      return [a.produto, formatarReais(a.preco), formatarReais(a.naMao), ...(a.rotulos ? [a.rotulos.sim, a.rotulos.nao] : [])];
    case 'hora':
      return a.opcoes;
  }
}

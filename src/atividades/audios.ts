// O que o app fala em cada atividade (letras, sílabas, palavras, frases...).
// Usado pelos testes e pela lista de áudios prontos de letras e sílabas.

import type { Aula } from '../conteudo/tipos';
import type { Atividade } from './tipos';
import type { ItemAudio } from '../audio/pronuncia';
import { formatarReais, resultadoComoTexto } from '../conteudo/contas';

const i = (categoria: ItemAudio['categoria'], texto: string): ItemAudio => ({ categoria, texto });
const semPontuacao = (t: string) => t.replace(/[.,!?;:"“”]/g, '');

export function audiosDaAtividade(a: Atividade): ItemAudio[] {
  switch (a.tipo) {
    case 'escute_letra':
      return [i('letra', a.alvo)];
    case 'diga_letra':
      return [i('tecla', a.alvo)];
    case 'conheca': {
      const cat = a.categoria === 'par' || a.categoria === 'letra' ? 'letra' : a.categoria === 'silaba' ? 'silaba' : 'palavra';
      return [i(cat, a.alvo), ...(a.silabas && a.silabas.length > 1 ? a.silabas.map((s) => i('silaba', s)) : [])];
    }
    case 'escute_silaba':
      return [i('silaba', a.alvo)];
    case 'escute_palavra':
      return [i(a.categoria === 'letra' ? 'letra' : 'palavra', a.alvo)];
    case 'monte_silaba':
      return [i('silaba', a.alvo)];
    case 'complete_palavra':
      return [i('palavra', a.palavra)];
    case 'forme_palavra':
      return [i('palavra', a.palavra), ...a.partes.map((s) => i('silaba', s))];
    case 'quantas_silabas':
      return [i('palavra', a.palavra), ...a.silabas.map((s) => i('silaba', s))];
    case 'escreva':
      return [i('palavra', a.palavra), ...(a.modo === 'silabas' ? a.teclas.map((s) => i('silaba', s)) : [])];
    case 'complete_frase':
      return [i('frase', a.frase), i('frase', a.frase.replace('____', a.resposta))];
    case 'ligue':
    case 'maiuscula':
      return [...a.esquerda, ...a.direita].flatMap((t) =>
        t.includes(' + ') ? t.split(' + ').map((s) => i('silaba', s)) : /^\p{L}$/u.test(t) ? [] : [i('palavra', t)],
      );
    case 'leia':
      return [...a.linhas.map((l) => i('frase', l)), ...a.linhas.flatMap((l) => l.split(/\s+/).map((p) => i('palavra', semPontuacao(p))))];
    case 'ordene':
      return [i('frase', a.frase), ...a.palavras.map((p) => i('palavra', semPontuacao(p)))];
    case 'conte':
      return [i('numero', String(a.quantidade))];
    case 'conta': {
      const r = resultadoComoTexto(a.resultado);
      const unidade = a.conta.match(/=\s*(KG|L)\s*$/i);
      return [i('conta', a.conta), i('conta', unidade ? a.conta.replace(/=\s*(KG|L)\s*$/i, `= ${r} $1`) : `${a.conta} ${r}`)];
    }
    case 'pague': {
      const preco = formatarReais(a.preco);
      return [i('frase', a.produto ? `${a.produto}: ${preco}` : preco)];
    }
    case 'troco':
      return [i('frase', `Troco: ${formatarReais(a.pago - a.preco)}`)];
    case 'da':
      return [i('frase', `${a.produto}: ${formatarReais(a.preco)}. Na mão: ${formatarReais(a.naMao)}.`)];
    case 'hora':
      return [i('hora', a.hora)];
  }
}

/** O que é falado quando o estudante toca nas peças e teclas da atividade. */
export function audiosDeToque(a: Atividade): ItemAudio[] {
  switch (a.tipo) {
    case 'monte_silaba':
      return a.opcoes.map((t) => i('tecla', t));
    case 'forme_palavra':
      return a.embaralhadas.map((t) => i('silaba', t));
    case 'escreva':
      return a.teclas.map((t) => i('tecla', t));
    case 'ligue':
    case 'maiuscula':
      return [...a.esquerda, ...a.direita].filter((t) => /^\p{L}$/u.test(t)).map((t) => i('tecla', t));
    default:
      return [];
  }
}

/** Fala de abertura da aula (a mesma da tela de abertura). */
export function falaDaAbertura(aula: Aula): string {
  return `Aula ${aula.aula}. ${aula.objetivo ?? ''}`.trim();
}

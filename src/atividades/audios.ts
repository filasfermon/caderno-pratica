// Lista todos os áudios que o app fala numa aula (para o professor gravar).
// Usa as mesmas atividades que o estudante vê, então a lista sempre bate com o app.

import type { Aula, Conteudo } from '../conteudo/tipos';
import type { Atividade } from './tipos';
import type { ItemAudio } from '../audio/pronuncia';
import { chaveDoItem } from '../audio/pronuncia';
import { gerarCandidatas } from './gerar';
import { formatarReais, resultadoComoTexto } from '../conteudo/contas';
import { TODAS_AS_INSTRUCOES, FRASES_ACERTO, FRASE_DEMONSTRACAO, FRASE_RESPOSTA, FRASE_SUA_VEZ, FRASE_TENTAR_DE_NOVO } from './rotulos';
import { criarSorteio } from '../util/aleatorio';

const i = (categoria: ItemAudio['categoria'], texto: string): ItemAudio => ({ categoria, texto });
const semPontuacao = (t: string) => t.replace(/[.,!?;:"“”]/g, '');

export function audiosDaAtividade(a: Atividade): ItemAudio[] {
  switch (a.tipo) {
    case 'tutorial':
      return [];
    case 'conheca': {
      const cat = a.categoria === 'par' || a.categoria === 'letra' ? 'letra' : a.categoria === 'silaba' ? 'silaba' : 'palavra';
      return [i(cat, a.alvo), ...(a.silabas && a.silabas.length > 1 ? a.silabas.map((s) => i('silaba', s)) : [])];
    }
    case 'escute_silaba':
      return [i(a.categoria, a.alvo)];
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

/** Fala de abertura da aula (a mesma da tela de abertura). */
export function falaDaAbertura(aula: Aula): string {
  return `Aula ${aula.aula}. ${aula.objetivo ?? ''}`.trim();
}

/** Todos os áudios de uma aula, sem repetição. */
export function audiosDaAula(c: Conteudo, aula: Aula): ItemAudio[] {
  const itens = [i('instrucao', falaDaAbertura(aula)), ...gerarCandidatas(c, aula, criarSorteio(aula.aula)).flatMap(audiosDaAtividade)];
  const vistos = new Set<string>();
  return itens.filter((x) => {
    const k = chaveDoItem(x);
    if (vistos.has(k) || !x.texto.trim()) return false;
    vistos.add(k);
    return true;
  });
}

/** Instruções e frases fixas do app (iguais em todas as aulas). */
export function audiosDoApp(): ItemAudio[] {
  return [
    ...TODAS_AS_INSTRUCOES.map((t) => i('instrucao', t)),
    ...[...FRASES_ACERTO, FRASE_TENTAR_DE_NOVO, FRASE_RESPOSTA, FRASE_DEMONSTRACAO, FRASE_SUA_VEZ, 'Dá, sim.', 'Não dá.'].map((t) => i('retorno', t)),
    ...[
      'Toque no botão laranja para praticar.',
      'Escolha a parte do caderno. Ou digite o número da aula.',
      'Escolha a unidade.',
      'Escolha a aula. O número da aula está no caderno.',
    ].map((t) => i('instrucao', t)),
  ];
}

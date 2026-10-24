// Textos fixos das atividades: instruções faladas (sempre iguais para a mesma
// atividade, com os verbos do caderno) e frases de retorno.

import type { Atividade } from './tipos';

/**
 * Instrução de cada atividade: uma frase curta e direta, sempre a mesma para o mesmo tipo.
 * A mesma frase é escrita e falada. Usa os verbos do caderno (ESCUTE, TOQUE, FORME, LIGUE...).
 */
export function instrucaoDe(a: Atividade): string {
  switch (a.tipo) {
    case 'conheca':
      return a.categoria === 'letra' || a.categoria === 'par'
        ? 'Escute e leia a letra.'
        : a.categoria === 'silaba'
          ? 'Escute e leia a sílaba.'
          : 'Escute e leia.';
    case 'escute_letra':
      return 'Escute e toque a letra.';
    case 'diga_letra':
      return 'Diga o nome da letra.';
    case 'escute_silaba':
      return 'Qual é a sílaba?';
    case 'monte_silaba':
      return 'Forme a sílaba.';
    case 'complete_palavra':
      return 'Complete a palavra.';
    case 'forme_palavra':
      return 'Forme a palavra.';
    case 'quantas_silabas':
      return 'Quantas sílabas?';
    case 'escute_palavra':
      return /\d/.test(a.alvo) ? 'Qual é o número?' : 'Qual é a palavra?';
    case 'escreva':
      return 'Escreva a palavra.';
    case 'complete_frase':
      return 'Complete a frase.';
    case 'ligue':
      return 'Ligue os pares.';
    case 'maiuscula':
      return 'Ligue a maiúscula com a minúscula.';
    case 'leia':
      return 'Escute e leia junto.';
    case 'ordene':
      return 'Forme a frase.';
    case 'conte':
      return 'Conte e toque o número.';
    case 'conta':
      return 'Faça a conta.';
    case 'pague':
      return 'Pague o preço.';
    case 'troco':
      return 'Quanto é o troco?';
    case 'da':
      return 'O dinheiro dá?';
    case 'hora':
      return 'Que horas são?';
  }
}

/** Todas as instruções possíveis (conferidas nos testes). */
export const TODAS_AS_INSTRUCOES = [
  'Escute e leia a letra.',
  'Escute e leia a sílaba.',
  'Escute e leia.',
  'Escute e toque a letra.',
  'Diga o nome da letra.',
  'Qual é a sílaba?',
  'Forme a sílaba.',
  'Complete a palavra.',
  'Forme a palavra.',
  'Quantas sílabas?',
  'Qual é o número?',
  'Qual é a palavra?',
  'Escreva a palavra.',
  'Complete a frase.',
  'Ligue os pares.',
  'Ligue a maiúscula com a minúscula.',
  'Escute e leia junto.',
  'Forme a frase.',
  'Conte e toque o número.',
  'Faça a conta.',
  'Pague o preço.',
  'Quanto é o troco?',
  'O dinheiro dá?',
  'Que horas são?',
];

/** Frases de acerto (variam). */
export const FRASES_ACERTO = ['Isso mesmo.', 'Muito bem.', 'Certo.'];
export const FRASE_TENTAR_DE_NOVO = 'Vamos tentar de novo.';
export const FRASE_RESPOSTA = 'Olhe a resposta certa.';
export const FRASE_DEMONSTRACAO = 'Veja como se faz.';
export const FRASE_SUA_VEZ = 'Agora é a sua vez.';

/** Frases da tela final (adultas, sem infantilizar). */
export const FRASES_FIM = [
  'Bom trabalho. Cada dia de prática deixa a leitura mais fácil.',
  'Muito bem. Você está avançando no seu tempo.',
  'Bom trabalho. Mostre ao professor o que você praticou hoje.',
];

/** Texto de uma nota ou moeda desenhada: 1000 → "R$ 10"; 50 → "R$ 0,50". */
export function rotuloDoDinheiro(centavos: number): string {
  if (centavos % 100 === 0) return `R$ ${centavos / 100}`;
  return `R$ ${Math.floor(centavos / 100)},${String(centavos % 100).padStart(2, '0')}`;
}

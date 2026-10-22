// Textos fixos das atividades: instruções faladas (sempre iguais para a mesma
// atividade, com os verbos do caderno) e frases de retorno.

import type { Atividade } from './tipos';

/** Instrução de cada atividade. A mesma frase é escrita e falada. */
export function instrucaoDe(a: Atividade): string {
  switch (a.tipo) {
    case 'tutorial':
      return 'Toque no botão laranja.';
    case 'conheca':
      return a.categoria === 'letra' || a.categoria === 'par'
        ? 'Escute e leia a letra. Toque nela para ouvir de novo.'
        : a.categoria === 'silaba'
          ? 'Escute e leia a sílaba. Toque nela para ouvir de novo.'
          : 'Escute e leia. Toque para ouvir de novo.';
    case 'escute_silaba':
      return a.categoria === 'letra' ? 'Escute e toque a letra certa.' : 'Escute e toque a sílaba certa.';
    case 'monte_silaba':
      return 'Escute e forme a sílaba. Toque nas letras na ordem certa.';
    case 'complete_palavra':
      return 'Escute a palavra. Toque na sílaba que falta.';
    case 'forme_palavra':
      return 'Toque nas sílabas na ordem certa para formar a palavra.';
    case 'quantas_silabas':
      return 'Escute a palavra. Quantas sílabas ela tem? Toque no número.';
    case 'escute_palavra':
      return /\d/.test(a.alvo) ? 'Escute e toque o número certo.' : 'Escute e toque a palavra certa.';
    case 'escreva':
      return 'Escute e escreva a palavra. Toque nas teclas.';
    case 'complete_frase':
      return 'Leia e complete a frase. Toque na resposta certa.';
    case 'ligue':
      return 'Ligue os pares. Toque num item da esquerda e depois no par da direita.';
    case 'maiuscula':
      return 'Ligue a letra maiúscula com a letra minúscula.';
    case 'leia':
      return 'Escute e leia junto. Depois, leia sozinho.';
    case 'ordene':
      return 'Toque nas palavras na ordem certa para formar a frase.';
    case 'conte':
      return 'Conte e toque o número certo.';
    case 'conta':
      return 'Faça a conta. Toque nos números da resposta.';
    case 'pague':
      return 'Toque nas notas e moedas para pagar o preço.';
    case 'troco':
      return 'Veja o troco. Depois, toque no valor do troco.';
    case 'da':
      return 'O dinheiro dá para comprar? Toque na resposta.';
    case 'hora':
      return 'Leia a hora no relógio. Toque na hora certa.';
  }
}

/** Todas as instruções possíveis (o professor pode gravar cada uma). */
export const TODAS_AS_INSTRUCOES = [
  'Toque no botão laranja.',
  'Escute e leia a letra. Toque nela para ouvir de novo.',
  'Escute e leia a sílaba. Toque nela para ouvir de novo.',
  'Escute e leia. Toque para ouvir de novo.',
  'Escute e toque a letra certa.',
  'Escute e toque a sílaba certa.',
  'Escute e forme a sílaba. Toque nas letras na ordem certa.',
  'Escute a palavra. Toque na sílaba que falta.',
  'Toque nas sílabas na ordem certa para formar a palavra.',
  'Escute a palavra. Quantas sílabas ela tem? Toque no número.',
  'Escute e toque o número certo.',
  'Escute e toque a palavra certa.',
  'Escute e escreva a palavra. Toque nas teclas.',
  'Leia e complete a frase. Toque na resposta certa.',
  'Ligue os pares. Toque num item da esquerda e depois no par da direita.',
  'Ligue a letra maiúscula com a letra minúscula.',
  'Escute e leia junto. Depois, leia sozinho.',
  'Toque nas palavras na ordem certa para formar a frase.',
  'Conte e toque o número certo.',
  'Faça a conta. Toque nos números da resposta.',
  'Toque nas notas e moedas para pagar o preço.',
  'Veja o troco. Depois, toque no valor do troco.',
  'O dinheiro dá para comprar? Toque na resposta.',
  'Leia a hora no relógio. Toque na hora certa.',
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

// Os tipos de atividade do app. Cada atividade é um objeto simples com os dados
// de uma tela; a tela é montada pelos arquivos de src/atividades/telas/.

export type TipoAtividade =
  | 'conheca' // 1
  | 'escute_letra' // escute e toque a letra certa
  | 'diga_letra' // veja a letra e diga o nome dela (voz do modelo + gravação do aluno)
  | 'escute_silaba' // 2
  | 'monte_silaba' // 3
  | 'complete_palavra' // 4
  | 'forme_palavra' // 5
  | 'quantas_silabas' // 6
  | 'escute_palavra' // 7
  | 'escreva' // 8
  | 'complete_frase' // 9
  | 'ligue' // 10
  | 'leia' // 11
  | 'ordene' // 12
  | 'maiuscula' // 13
  | 'conte' // 14
  | 'conta' // 15
  | 'pague' // 16
  | 'troco' // 17
  | 'da' // 18
  | 'hora'; // 19

/** Dados comuns a todas as atividades. */
interface Base {
  tipo: TipoAtividade;
  /** Identifica o item para a repetição espaçada (o mesmo item volta na revisão). */
  chave: string;
  /** Aula de onde veio o conteúdo. */
  aula: number;
  /** true quando a atividade é de revisão de uma aula anterior. */
  revisao?: boolean;
}

export type TipoTexto = 'letra' | 'silaba' | 'palavra' | 'par';

export interface EscuteLetra extends Base {
  tipo: 'escute_letra';
  alvo: string;
  /** 2 a 4 letras, com letras parecidas no som (A e E, P e B...). */
  opcoes: string[];
}

export interface DigaLetra extends Base {
  tipo: 'diga_letra';
  alvo: string;
}

export interface Conheca extends Base {
  tipo: 'conheca';
  alvo: string;
  categoria: TipoTexto;
  /** Para palavras: as sílabas, mostradas embaixo (LU · PA). */
  silabas?: string[];
}

export interface EscuteSilaba extends Base {
  tipo: 'escute_silaba';
  alvo: string;
  categoria: 'silaba';
  opcoes: string[];
}

export interface MonteSilaba extends Base {
  tipo: 'monte_silaba';
  alvo: string;
  /** Peças na ordem certa (ex.: ["P","A"], ["QU","E"]). */
  pecas: string[];
  /** Peças na tela (certas + distratoras, embaralhadas). */
  opcoes: string[];
}

export interface CompletePalavra extends Base {
  tipo: 'complete_palavra';
  palavra: string;
  silabas: string[];
  falta: number;
  opcoes: string[];
}

export interface FormePalavra extends Base {
  tipo: 'forme_palavra';
  palavra: string;
  partes: string[];
  embaralhadas: string[];
}

export interface QuantasSilabas extends Base {
  tipo: 'quantas_silabas';
  palavra: string;
  silabas: string[];
  opcoes: number[];
}

export interface EscutePalavra extends Base {
  tipo: 'escute_palavra';
  alvo: string;
  categoria: 'letra' | 'palavra';
  opcoes: string[];
}

export interface Escreva extends Base {
  tipo: 'escreva';
  palavra: string;
  /** Teclas: letras (A, B...) ou sílabas (PA, LA...) nas primeiras aulas. */
  teclas: string[];
  modo: 'letras' | 'silabas';
  /** A resposta dividida nas teclas certas. */
  resposta: string[];
}

export interface CompleteFrase extends Base {
  tipo: 'complete_frase';
  frase: string; // com "____"
  opcoes: string[];
  resposta: string;
}

export interface Ligue extends Base {
  tipo: 'ligue';
  esquerda: string[];
  direita: string[];
  pares: [number, number][];
}

export interface Leia extends Base {
  tipo: 'leia';
  linhas: string[];
}

export interface Ordene extends Base {
  tipo: 'ordene';
  frase: string;
  palavras: string[];
  embaralhadas: string[];
}

export interface Maiuscula extends Base {
  tipo: 'maiuscula';
  esquerda: string[];
  direita: string[];
  pares: [number, number][];
}

export type Objeto = 'lata' | 'colher' | 'feijao';

export interface Conte extends Base {
  tipo: 'conte';
  quantidade: number;
  objeto: Objeto;
  opcoes: number[];
}

export interface Conta extends Base {
  tipo: 'conta';
  conta: string;
  /** Resultado do conteudo_licoes.json (fonte da verdade). */
  resultado: number;
  /** Produtos com preço, para contas como "SUCO + BOLO = R$". */
  produtos: { produto: string; preco: string }[];
  /** Valores para o botão "ver com dinheiro" (só + e −). */
  dinheiro?: { valores: number[]; sinal: '+' | '−' };
}

export interface Pague extends Base {
  tipo: 'pague';
  /** Em centavos. */
  preco: number;
  produto?: string;
  dinheiro: number[];
}

export interface Troco extends Base {
  tipo: 'troco';
  preco: number;
  pago: number;
  passos: number[];
  opcoes: number[];
}

export interface Da extends Base {
  tipo: 'da';
  produto: string;
  preco: number;
  naMao: number;
  /** Como mostrar a resposta: palavras SIM/NÃO (se já ensinadas) ou só símbolos. */
  rotulos: { sim: string; nao: string } | null;
}

export interface Hora extends Base {
  tipo: 'hora';
  hora: string;
  opcoes: string[];
}

export type Atividade =
  | Conheca
  | EscuteLetra
  | DigaLetra
  | EscuteSilaba
  | MonteSilaba
  | CompletePalavra
  | FormePalavra
  | QuantasSilabas
  | EscutePalavra
  | Escreva
  | CompleteFrase
  | Ligue
  | Leia
  | Ordene
  | Maiuscula
  | Conte
  | Conta
  | Pague
  | Troco
  | Da
  | Hora;

/** Atividades sem certo/errado (só ouvir, ler, falar e gravar). */
export function ehSoDeOuvir(a: Atividade): boolean {
  return a.tipo === 'conheca' || a.tipo === 'leia' || a.tipo === 'diga_letra';
}

/** Atividades de números e dinheiro (podem ser desligadas no modo professor). */
export const TIPOS_DE_NUMEROS: TipoAtividade[] = ['conte', 'conta', 'pague', 'troco', 'da', 'hora'];

export function ehAtividadeDeNumeros(a: Atividade): boolean {
  if (TIPOS_DE_NUMEROS.includes(a.tipo)) return true;
  // "Conheça" e "Escute e toque" com números ou preços (aulas de números: 10, 20, R$ 2,50)
  if ((a.tipo === 'conheca' || a.tipo === 'escute_palavra') && /\d/.test(a.alvo)) return true;
  if (a.tipo === 'ligue' && [...a.esquerda, ...a.direita].some((t) => /\d/.test(t))) return true;
  return false;
}

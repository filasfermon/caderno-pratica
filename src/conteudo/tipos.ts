// Tipos do arquivo conteudo_licoes.json.
// Se o caderno ganhar campos novos, eles podem ser acrescentados aqui.

export interface Parte {
  parte: number;
  nome: string;
  pagina_abertura?: number;
}

export interface Unidade {
  unidade: number;
  nome: string;
}

export interface ItemCompletar {
  frase: string;
  opcoes: string[];
  resposta: string | null;
}

export interface ItemFormar {
  partes: string[];
  palavra: string;
}

export interface ItemLigar {
  esquerda: string[];
  direita: string[];
}

export interface ItemConta {
  conta: string;
  resultado: number;
}

export interface ItemProduto {
  produto: string;
  preco: string;
}

export interface Aula {
  aula: number;
  paginas: string;
  parte: number;
  unidade: number;
  nome_unidade?: string;
  titulos?: string[];
  tipo?: string[];
  objetivo?: string;
  letras_novas?: string[];
  silabas?: string[];
  palavras?: string[];
  textos?: string[][];
  completar?: ItemCompletar[];
  formar?: ItemFormar[];
  ligar?: ItemLigar[];
  contas?: ItemConta[];
  ditado?: string[];
  numeros?: number[];
  produtos?: ItemProduto[];
  horas?: string[];
  letras_conhecidas?: string;
  minusculas_conhecidas?: string;
  numeros_conhecidos?: string;
  combinacoes_conhecidas?: string[];
  palavras_de_leitura_global?: string[];
}

export interface Conteudo {
  titulo: string;
  versao?: string;
  total_aulas?: number;
  observacoes?: string[];
  partes: Parte[];
  unidades: Unidade[];
  aulas: Aula[];
}

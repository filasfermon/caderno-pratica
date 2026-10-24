// ÁUDIOS PRONTOS DE LETRAS E SÍLABAS (pasta public/audio).
//
// A voz do celular lê bem palavras e frases, mas lê mal letras e sílabas soltas
// (LHA, NHO, QUE, PE...). Por isso letras e sílabas podem ter um arquivo de áudio
// pronto, igual em todos os celulares:
//   public/audio/letras/NOME.mp3   → a letra dita pelo nome ("pê")
//   public/audio/silabas/NOME.mp3  → a sílaba ("pá")
// Se o arquivo não existir, o app usa a voz do celular (como antes).
//
// REGRA DOS NOMES DE ARQUIVO (escrita na tela → nome do arquivo):
//   - tudo em minúsculas, sem acento;
//   - cada acento vira uma palavra no fim, separada por "-", na ordem em que aparece:
//     ´ agudo · ^ circunflexo · ~ til · ` crase · ç cedilha.
//   Exemplos: PA → pa.mp3 · LHA → lha.mp3 · PÉ → pe-agudo.mp3 · VÔ → vo-circunflexo.mp3
//             PÃO → pao-til.mp3 · ÇA → ca-cedilha.mp3 · Ç (letra) → c-cedilha.mp3
//
// A lista dos arquivos que existem (audio/lista.json) é montada sozinha na publicação
// (vite.config.ts), então basta pôr o arquivo na pasta.

import type { ItemAudio } from './pronuncia';

const MARCAS: Record<string, string> = {
  '́': 'agudo',
  '̂': 'circunflexo',
  '̃': 'til',
  '̀': 'crase',
  '̧': 'cedilha',
};

/** Um nome de arquivo dentro da regra (usado também na publicação, em vite.config.ts). */
export const NOME_DE_ARQUIVO_VALIDO = /^[a-z]+(-(agudo|circunflexo|til|crase|cedilha))*\.mp3$/;

/** Nome do arquivo (sem a pasta e sem ".mp3") para uma letra ou sílaba da tela. */
export function nomeDeArquivo(texto: string): string {
  let base = '';
  const marcas: string[] = [];
  for (const ch of texto.trim().toLocaleLowerCase('pt-BR').normalize('NFD')) {
    if (MARCAS[ch]) marcas.push(MARCAS[ch]);
    else base += ch;
  }
  return [base, ...marcas].join('-');
}

const SO_LETRAS = /^\p{L}+$/u;
const TEM_VOGAL = /[AEIOUÁÉÍÓÚÂÊÔÃÕ]/i;

/**
 * Qual arquivo pronto serve para este item (ou null: usa a voz do celular).
 * Só letras e sílabas soltas têm arquivo; palavras e frases usam sempre a voz do celular.
 */
export function arquivoDoItem(item: ItemAudio): string | null {
  const t = item.texto.trim();
  if (!SO_LETRAS.test(t)) return null;
  const umaLetra = [...t].length === 1;
  switch (item.categoria) {
    case 'silaba':
      return `silabas/${nomeDeArquivo(t)}.mp3`;
    case 'letra':
      return umaLetra ? `letras/${nomeDeArquivo(t)}.mp3` : null;
    case 'tecla':
      // Tecla de letra (P) → nome da letra; tecla de sílaba (PA) → a sílaba; CH, LH... → voz do celular.
      if (umaLetra) return `letras/${nomeDeArquivo(t)}.mp3`;
      return TEM_VOGAL.test(t) ? `silabas/${nomeDeArquivo(t)}.mp3` : null;
    default:
      return null;
  }
}

// ---------- Lista dos arquivos que existem (carregada ao abrir o app) ----------

let prontos = new Set<string>();

export function definirAudiosProntos(lista: string[]): void {
  prontos = new Set(lista);
}

export function temAudioPronto(arquivo: string): boolean {
  return prontos.has(arquivo);
}

/** Lê audio/lista.json. Sem a lista (ou sem internet na 1ª vez), o app usa a voz do celular. */
export async function carregarAudiosProntos(base: string): Promise<void> {
  try {
    const r = await fetch(`${base}audio/lista.json`);
    if (r.ok) definirAudiosProntos(((await r.json()) as unknown[]).filter((x): x is string => typeof x === 'string'));
  } catch {
    /* segue com a voz do celular */
  }
}

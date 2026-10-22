// Regras automáticas de pronúncia para a voz do aparelho.
//
// A voz sintetizada costuma errar sílabas soltas ("PE" vira "pê" ou é soletrado,
// "QUE" vira a palavra "que"). Por isso o texto mandado para a voz é diferente
// do texto da tela. Estas regras criam a sugestão inicial; a tabela final fica
// em src/dados/pronuncia.json, que pode ser editada à mão (veja o README).

import { maiusculas } from '../util/texto';

export type Vogal = 'aberta' | 'fechada';

const AGUDO: Record<string, string> = { A: 'á', E: 'é', I: 'í', O: 'ó', U: 'ú' };
const CIRCUNFLEXO: Record<string, string> = { A: 'á', E: 'ê', I: 'í', O: 'ô', U: 'ú' };

/** Consoante (ou grupo) do começo da sílaba → como escrever para a voz ler certo. */
function ataqueParaFala(ataque: string): string {
  switch (ataque) {
    case '':
    case 'H': // H não tem som: HA = "á"
      return '';
    case 'RR':
      return 'r'; // RRA soa como RA forte
    case 'SS':
    case 'Ç':
      return 's';
    default:
      return ataque.toLowerCase();
  }
}

/**
 * Sugestão automática para uma sílaba em MAIÚSCULAS.
 * Ex.: PE → "pé" (aberta) ou "pê" (fechada); QUE → "qué"/"quê"; HA → "á"; ÇA → "sá".
 */
export function falaAutomaticaDaSilaba(silaba: string, vogal: Vogal): string {
  const s = maiusculas(silaba);
  // Ditongos nasais e sílabas com acento: a própria escrita já guia a voz.
  if (/[ÃÕÁÉÍÓÚÂÊÔ]/.test(s)) {
    const m = s.match(/^(RR|SS|Ç|H)?(.*)$/)!;
    return (ataqueParaFala(m[1] ?? '') + m[2].toLowerCase()).normalize('NFC');
  }
  const m = s.match(/^(CH|LH|NH|QU|GU|RR|SS|[BCDFGJKLMNPRSTVWXZÇH]{0,2})([AEIOUY]+)([^AEIOUY]*)$/);
  if (!m) return s.toLowerCase();
  const [, ataque, vogais, coda] = m;
  const inicio = ataqueParaFala(ataque);
  if (vogais.length > 1) {
    // Ditongo (LEI, POU, CAI): a voz lê bem como palavra. OI e OU com O aberto à escolha.
    let v = vogais.toLowerCase();
    if (vogais === 'OI') v = vogal === 'aberta' ? 'ói' : 'ôi';
    return inicio + v + coda.toLowerCase();
  }
  const base = vogais;
  // Vogal nasal (AM, EN, TEM, PON): não tem aberta/fechada.
  if (/^[MN]$/.test(coda)) {
    const nasal = base === 'A' ? 'am' : base === 'E' ? 'em' : base === 'I' ? 'im' : base === 'O' ? 'om' : 'um';
    return inicio + nasal;
  }
  const comAcento = vogal === 'aberta' ? AGUDO[base] : CIRCUNFLEXO[base];
  return inicio + (comAcento ?? base.toLowerCase()) + coda.toLowerCase();
}

/** Diz se a pronúncia desta sílaba muda com a opção "vogal aberta/fechada". */
export function silabaTemVariante(silaba: string): boolean {
  return falaAutomaticaDaSilaba(silaba, 'aberta') !== falaAutomaticaDaSilaba(silaba, 'fechada');
}

/** Nomes das letras, para falar letras sozinhas (nunca o "som" isolado da consoante). */
export const NOMES_DAS_LETRAS: Record<string, string> = {
  A: 'á', B: 'bê', C: 'cê', D: 'dê', E: 'é', F: 'éfe', G: 'gê', H: 'agá', I: 'í', J: 'jóta',
  K: 'cá', L: 'éle', M: 'ême', N: 'ene', O: 'ó', P: 'pê', Q: 'quê', R: 'érre', S: 'ésse',
  T: 'tê', U: 'ú', V: 'vê', W: 'dáblio', X: 'xis', Y: 'ípsilon', Z: 'zê', Ç: 'cê cedilha',
  Á: 'á com acento agudo', É: 'é com acento agudo', Í: 'í com acento agudo', Ó: 'ó com acento agudo',
  Ú: 'ú com acento agudo', Â: 'â com acento circunflexo', Ê: 'ê com acento circunflexo',
  Ô: 'ô com acento circunflexo', Ã: 'ã, com til', Õ: 'õ, com til',
};

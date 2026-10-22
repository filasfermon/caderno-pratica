// Gera (ou completa) a tabela de pronúncia src/dados/pronuncia.json.
//
// Uso: npm run pronuncia
//
// - Acrescenta as sílabas do conteúdo que ainda não estão na tabela, com uma
//   sugestão automática (src/audio/regras-pronuncia.ts).
// - NÃO apaga nem muda o que já está na tabela: correções feitas à mão ficam.
// Rode sempre que trocar o conteudo_licoes.json.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import type { Conteudo } from '../src/conteudo/tipos';
import { silabasDoConteudo, palavrasDaAula } from '../src/conteudo/consulta';
import { silabar } from '../src/conteudo/silabas';
import { falaAutomaticaDaSilaba, silabaTemVariante, NOMES_DAS_LETRAS } from '../src/audio/regras-pronuncia';
import { maiusculas } from '../src/util/texto';

const CAMINHO = new URL('../src/dados/pronuncia.json', import.meta.url);
const conteudo: Conteudo = JSON.parse(readFileSync(new URL('../conteudo_licoes.json', import.meta.url), 'utf8'));

type Entrada = string | { aberta: string; fechada: string };
interface Tabela {
  _leia_me: string[];
  silabas: Record<string, Entrada>;
  letras: Record<string, { nome: string; fala: string }>;
  palavras: Record<string, string>;
}

const EXEMPLOS: Record<string, string> = {
  A: 'água', B: 'bola', C: 'casa', D: 'dado', E: 'elevador', F: 'faca', G: 'gota', H: 'hora',
  I: 'igreja', J: 'jogo', K: 'Karina', L: 'lua', M: 'mala', N: 'nome', O: 'olho', P: 'pai',
  Q: 'queijo', R: 'rua', S: 'sala', T: 'tia', U: 'unha', V: 'vela', W: 'Wilson', X: 'xícara',
  Y: 'Yara', Z: 'zero',
};
const EXEMPLOS_ESPECIAIS: Record<string, string> = {
  Ç: 'como em moça', Á: 'como em água', É: 'como em café', Í: 'como em saída', Ó: 'como em avó',
  Ú: 'como em saúde', Â: 'como em lâmpada', Ê: 'como em você', Ô: 'como em avô', Ã: 'como em mão',
  Õ: 'como em limões',
};

const LEIA_ME = [
  'TABELA DE PRONÚNCIA do Caderno Prática.',
  'A tela mostra a sílaba como no caderno; a voz do aparelho recebe o texto desta tabela.',
  'silabas: "PA": "pá" quer dizer: a tela mostra PA e a voz lê pá.',
  'Quando a sílaba tem E ou O, há duas formas: "aberta" (pé, pó) e "fechada" (pê, pô).',
  'O professor escolhe aberta ou fechada nas configurações do modo professor.',
  'letras: "nome" é falado nas teclas; "fala" é falado quando a letra aparece sozinha (nome + exemplo).',
  'palavras: palavras e siglas que a voz lê mal (ex.: IFCE).',
  'Para corrigir: troque o texto entre aspas e salve. O comando "npm run pronuncia" só acrescenta o que falta; nunca apaga correções.',
  'Também dá para corrigir dentro do app: modo professor → Gravações → Editar fala.',
];

const antiga: Partial<Tabela> = existsSync(CAMINHO) ? JSON.parse(readFileSync(CAMINHO, 'utf8')) : {};
const silabas: Record<string, Entrada> = { ...(antiga.silabas ?? {}) };

// Sílabas que são palavras de uma sílaba só (SOL, PÃO, LEI): a voz lê a própria palavra.
// Só contam palavras de aulas de prática (nas revisões há listas de sílabas soltas, como QUE e CHA).
const monossilabos = new Set<string>();
for (const a of conteudo.aulas) {
  const ehRevisao = (a.tipo ?? []).some((t) => /FECHAMENTO|LEITURA/.test(maiusculas(t)));
  if (ehRevisao) continue;
  for (const p of palavrasDaAula(a)) {
    const m = maiusculas(p);
    if (m.length >= 3 && silabar(m).length === 1 && !/^(RR|SS)/.test(m)) monossilabos.add(m);
  }
}

let novas = 0;
for (const s of silabasDoConteudo(conteudo)) {
  if (s in silabas) continue;
  novas++;
  if (monossilabos.has(s)) silabas[s] = s.toLowerCase();
  else if (silabaTemVariante(s)) silabas[s] = { aberta: falaAutomaticaDaSilaba(s, 'aberta'), fechada: falaAutomaticaDaSilaba(s, 'fechada') };
  else silabas[s] = falaAutomaticaDaSilaba(s, 'aberta');
}

const letras: Tabela['letras'] = { ...(antiga.letras ?? {}) };
for (const [letra, nome] of Object.entries(NOMES_DAS_LETRAS)) {
  if (letra in letras) continue;
  const ex = EXEMPLOS[letra] ? `de ${EXEMPLOS[letra]}` : EXEMPLOS_ESPECIAIS[letra];
  letras[letra] = { nome, fala: ex ? `${nome}, ${ex}` : nome };
}

const palavras: Record<string, string> = {
  IFCE: 'í éfe cê é',
  'WI-FI': 'uai fai',
  KG: 'quilo',
  KM: 'quilômetro',
  ML: 'mililitro',
  QTD: 'quantidade',
  ...(antiga.palavras ?? {}),
};

const ordenar = <T,>(o: Record<string, T>) =>
  Object.fromEntries(Object.entries(o).sort(([a], [b]) => a.localeCompare(b, 'pt-BR')));
const tabela: Tabela = { _leia_me: LEIA_ME, silabas: ordenar(silabas), letras, palavras: ordenar(palavras) };
writeFileSync(CAMINHO, JSON.stringify(tabela, null, 2) + '\n');
console.log(`Tabela salva: ${Object.keys(silabas).length} sílabas (${novas} novas), ${Object.keys(letras).length} letras.`);

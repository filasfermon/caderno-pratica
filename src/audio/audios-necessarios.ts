// QUAIS ÁUDIOS PRONTOS O APP USA: todas as letras e sílabas que ele pode falar.
// Usado pelo script "npm run audios:lista" (gera AUDIOS_PARA_GRAVAR.md) e pelos testes.
// (O app em si não usa este arquivo.)

import type { Conteudo } from '../conteudo/tipos';
import { silabasDoConteudo } from '../conteudo/consulta';
import { atividadesDaAula, aulasDisponiveis } from '../atividades/disponiveis';
import { audiosDaAtividade, audiosDeToque } from '../atividades/audios';
import { criarSorteio } from '../util/aleatorio';
import { arquivoDoItem } from './arquivos';
import { falaDaSilaba, nomeDaLetra, type ItemAudio } from './pronuncia';
import { maiusculas } from '../util/texto';

export interface AudioNecessario {
  /** Caminho dentro de public/audio, ex.: "silabas/pa.mp3". */
  arquivo: string;
  tipo: 'letra' | 'silaba';
  /** Como aparece na tela, ex.: "PA". */
  tela: string;
  /** Como deve ser falado, ex.: "pá" (da tabela de pronúncia, com a vogal aberta). */
  fala: string;
}

/** Sorteios usados para descobrir as letras e sílabas das opções (as erradas variam). */
const SORTEIOS = [1, 2, 3];

export function itensDeLetrasESilabas(c: Conteudo, sorteios = SORTEIOS): ItemAudio[] {
  const aulas = aulasDisponiveis(c);
  const itens: ItemAudio[] = silabasDoConteudo({ ...c, aulas }).map((s) => ({ categoria: 'silaba', texto: s }));
  for (const aula of aulas)
    for (const k of sorteios)
      for (const at of atividadesDaAula(c, aula, criarSorteio(aula.aula * 100 + k))) itens.push(...audiosDaAtividade(at), ...audiosDeToque(at));
  return itens.filter((x) => arquivoDoItem(x) !== null);
}

/** A lista de áudios prontos de letras e sílabas, sem repetição: letras primeiro, depois sílabas. */
export function audiosNecessarios(c: Conteudo): AudioNecessario[] {
  const porArquivo = new Map<string, AudioNecessario>();
  for (const item of itensDeLetrasESilabas(c)) {
    const arquivo = arquivoDoItem(item)!;
    if (porArquivo.has(arquivo)) continue;
    const tela = maiusculas(item.texto.trim());
    const tipo = arquivo.startsWith('letras/') ? 'letra' : 'silaba';
    porArquivo.set(arquivo, { arquivo, tipo, tela, fala: tipo === 'letra' ? nomeDaLetra(tela) : falaDaSilaba(tela) });
  }
  return [...porArquivo.values()].sort((a, b) => (a.tipo === b.tipo ? a.tela.localeCompare(b.tela, 'pt-BR') : a.tipo === 'letra' ? -1 : 1));
}

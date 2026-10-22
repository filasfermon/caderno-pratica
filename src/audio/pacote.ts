// PACOTE DE ÁUDIOS (.zip): o professor grava uma vez e passa para os celulares.
//
// Conteúdo do .zip:
//   indice.json   → lista dos áudios: { chave, texto, arquivo, mime } e as correções de fala
//   audios/...    → os arquivos de áudio
// Ao importar, os áudios vão para a camada (b) "pacote". As gravações feitas no
// próprio aparelho (camada a) continuam valendo primeiro.

import { zipSync, unzipSync, strToU8, strFromU8 } from 'fflate';
import { lerTodos, guardar, esvaziar, type Audio, type Fala } from '../dados/banco';

export interface IndicePacote {
  app: 'caderno-pratica';
  versao: 1;
  criado: string;
  audios: { chave: string; texto: string; arquivo: string; mime: string }[];
  falas: Fala[];
}

function extensao(mime: string): string {
  if (mime.includes('webm')) return 'webm';
  if (mime.includes('ogg')) return 'ogg';
  if (mime.includes('mp4') || mime.includes('aac') || mime.includes('m4a')) return 'm4a';
  if (mime.includes('mpeg')) return 'mp3';
  if (mime.includes('wav')) return 'wav';
  return 'audio';
}

/** Monta o .zip com todas as gravações do aparelho (as do professor têm prioridade sobre as do pacote). */
export async function exportarPacote(): Promise<{ blob: Blob; quantidade: number }> {
  const proprias = await lerTodos<Audio>('gravacoes');
  const doPacote = await lerTodos<Audio>('pacote');
  const porChave = new Map<string, Audio>();
  for (const a of doPacote) porChave.set(a.chave, a);
  for (const a of proprias) porChave.set(a.chave, a);
  const falasPacote = await lerTodos<Fala>('falas_pacote');
  const falasProprias = await lerTodos<Fala>('falas');
  const falas = new Map<string, Fala>();
  for (const f of [...falasPacote, ...falasProprias]) falas.set(f.chave, f);

  const arquivos: Record<string, Uint8Array> = {};
  const indice: IndicePacote = { app: 'caderno-pratica', versao: 1, criado: new Date().toISOString(), audios: [], falas: [...falas.values()] };
  let n = 0;
  for (const a of porChave.values()) {
    n++;
    const nome = `audios/${String(n).padStart(4, '0')}.${extensao(a.mime)}`;
    arquivos[nome] = new Uint8Array(await a.blob.arrayBuffer());
    indice.audios.push({ chave: a.chave, texto: a.texto, arquivo: nome, mime: a.mime });
  }
  arquivos['indice.json'] = strToU8(JSON.stringify(indice, null, 2));
  // Áudio já é comprimido: guardamos sem compressão (mais rápido em celular simples).
  const zip = zipSync(arquivos, { level: 0 });
  return { blob: new Blob([zip], { type: 'application/zip' }), quantidade: indice.audios.length };
}

/** Lê um .zip exportado por outro aparelho e guarda como "pacote". Substitui o pacote anterior. */
export async function importarPacote(arquivo: Blob): Promise<{ audios: number; falas: number }> {
  const dados = unzipSync(new Uint8Array(await arquivo.arrayBuffer()));
  const bruto = dados['indice.json'];
  if (!bruto) throw new Error('Este arquivo não é um pacote do Caderno Prática (falta o indice.json).');
  const indice = JSON.parse(strFromU8(bruto)) as IndicePacote;
  if (indice.app !== 'caderno-pratica' || !Array.isArray(indice.audios)) throw new Error('Pacote em formato desconhecido.');
  await esvaziar('pacote');
  await esvaziar('falas_pacote');
  let audios = 0;
  for (const item of indice.audios) {
    const conteudo = dados[item.arquivo];
    if (!conteudo || typeof item.chave !== 'string') continue;
    const blob = new Blob([conteudo.slice()], { type: item.mime || 'audio/webm' });
    await guardar<Audio>('pacote', { chave: item.chave, texto: item.texto ?? '', blob, mime: item.mime, data: Date.now() });
    audios++;
  }
  let falas = 0;
  for (const f of indice.falas ?? []) {
    if (typeof f.chave === 'string' && typeof f.fala === 'string') {
      await guardar<Fala>('falas_pacote', { chave: f.chave, fala: f.fala });
      falas++;
    }
  }
  return { audios, falas };
}

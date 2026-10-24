// Prepara áudios de letras e sílabas para o app (precisa do ffmpeg instalado).
// Para quem gravou em outro formato (WAV, M4A, OGG...) ou não cortou o silêncio.
//
// Uso:  npm run audios:preparar -- PASTA
//   PASTA tem as subpastas "letras" e/ou "silabas", com arquivos já com o nome da
//   regra (ex.: silabas/pa.wav, letras/c-cedilha.m4a). Veja AUDIOS_PARA_GRAVAR.md.
//
// Cada arquivo vira public/audio/<letras|silabas>/<nome>.mp3:
//   - silêncio do começo e do fim cortado;
//   - volume igualado (média de -20 dB, sem passar de -1 dB no pico);
//   - MP3 mono, 56 kbps, 44,1 kHz.
import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import { basename, extname, join, resolve } from 'node:path';
import type { Conteudo } from '../src/conteudo/tipos';
import { audiosNecessarios } from '../src/audio/audios-necessarios';

const pasta = process.argv[2];
if (!pasta || !existsSync(pasta)) {
  console.error('Uso: npm run audios:preparar -- PASTA   (PASTA com as subpastas "letras" e/ou "silabas")');
  process.exit(1);
}
const raiz = resolve(import.meta.dirname, '..');
const c: Conteudo = JSON.parse(readFileSync(join(raiz, 'conteudo_licoes.json'), 'utf8'));
const usados = new Set(audiosNecessarios(c).map((a) => a.arquivo));

const CORTAR_SILENCIO =
  'silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.03,areverse,' +
  'silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.03,areverse';

/** Volume médio e de pico (em dB) da fala, já sem o silêncio. null = não deu para medir. */
function medir(arquivo: string): { media: number; pico: number } | null {
  // O ffmpeg escreve a medição na saída de erros.
  const r = spawnSync('ffmpeg', ['-hide_banner', '-nostats', '-i', arquivo, '-af', `${CORTAR_SILENCIO},volumedetect`, '-f', 'null', '-'], { encoding: 'utf8' });
  const media = r.stderr.match(/mean_volume:\s*(-?[\d.]+) dB/);
  const pico = r.stderr.match(/max_volume:\s*(-?[\d.]+) dB/);
  return r.status === 0 && media && pico ? { media: Number(media[1]), pico: Number(pico[1]) } : null;
}

let feitos = 0;
for (const tipo of ['letras', 'silabas']) {
  const dir = join(pasta, tipo);
  if (!existsSync(dir)) continue;
  mkdirSync(join(raiz, 'public/audio', tipo), { recursive: true });
  for (const nome of readdirSync(dir).sort()) {
    if (nome.startsWith('.')) continue;
    const base = basename(nome, extname(nome));
    const destino = `${tipo}/${base}.mp3`;
    if (!usados.has(destino)) {
      console.warn(`IGNORADO: ${tipo}/${nome} (o app não usa "${destino}"; confira o nome em AUDIOS_PARA_GRAVAR.md)`);
      continue;
    }
    const entrada = join(dir, nome);
    const volumes = medir(entrada);
    if (!volumes || !isFinite(volumes.media)) {
      console.warn(`IGNORADO: ${tipo}/${nome} (não deu para ler o áudio, ou ele é só silêncio)`);
      continue;
    }
    const ganho = Math.min(-20 - volumes.media, -1 - volumes.pico);
    const saida = join(raiz, 'public/audio', destino);
    try {
      execFileSync('ffmpeg', [
        '-hide_banner', '-loglevel', 'error', '-y', '-i', entrada,
        '-af', `${CORTAR_SILENCIO},volume=${ganho.toFixed(2)}dB`,
        '-ac', '1', '-ar', '44100', '-c:a', 'libmp3lame', '-b:a', '56k',
        saida,
      ]);
    } catch {
      rmSync(saida, { force: true });
      console.warn(`ERRO: ${tipo}/${nome} (o ffmpeg não conseguiu converter)`);
      continue;
    }
    console.log(`ok: public/audio/${destino}`);
    feitos++;
  }
}
console.log(`${feitos} áudio(s) preparado(s). Depois rode: npm run audios:lista`);

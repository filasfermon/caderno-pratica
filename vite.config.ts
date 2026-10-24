// Configuração do Vite (o programa que monta o app).
// - BASE_PATH: caminho do site. Padrão "/" (Cloudflare Pages e computador).
//   No GitHub Pages é "/NOME-DO-REPOSITORIO/" (o workflow de publicação preenche sozinho).
// - O arquivo conteudo_licoes.json fica na raiz do repositório e é copiado
//   para o site publicado. O app o lê quando abre.
// - Os áudios prontos de letras e sílabas ficam em public/audio/letras e
//   public/audio/silabas. A lista dos que existem (audio/lista.json) é montada
//   aqui, sozinha: basta pôr o arquivo .mp3 na pasta e publicar.
import { defineConfig, type Plugin } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const ARQUIVO_CONTEUDO = 'conteudo_licoes.json';
const base = process.env.BASE_PATH || '/';

/** Serve o conteudo_licoes.json no modo de desenvolvimento e o copia para a pasta final. */
function conteudoDaRaiz(): Plugin {
  const caminho = resolve(import.meta.dirname, ARQUIVO_CONTEUDO);
  return {
    name: 'conteudo-da-raiz',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url && req.url.split('?')[0].endsWith('/' + ARQUIVO_CONTEUDO)) {
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(readFileSync(caminho));
          return;
        }
        next();
      });
    },
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: ARQUIVO_CONTEUDO, source: readFileSync(caminho) });
    },
  };
}

const PASTA_AUDIO = resolve(import.meta.dirname, 'public/audio');
// Regra dos nomes dos áudios prontos (a mesma de src/audio/arquivos.ts; um teste confere):
// minúsculas, sem acento, acentos como "-agudo", "-til"...
const NOME_DE_ARQUIVO_VALIDO = /^[a-z]+(-(agudo|circunflexo|til|crase|cedilha))*\.mp3$/;

/** Os arquivos de áudio prontos que existem (ex.: ["letras/p.mp3", "silabas/pa.mp3"]). */
function listarAudios(avisar: (m: string) => void = () => undefined): string[] {
  const lista: string[] = [];
  for (const pasta of ['letras', 'silabas']) {
    const dir = resolve(PASTA_AUDIO, pasta);
    if (!existsSync(dir)) continue;
    for (const nome of readdirSync(dir).sort()) {
      if (nome.startsWith('.')) continue;
      if (NOME_DE_ARQUIVO_VALIDO.test(nome)) lista.push(`${pasta}/${nome}`);
      else avisar(`public/audio/${pasta}/${nome}: nome fora da regra (veja o README); o arquivo não será usado.`);
    }
  }
  return lista;
}

/** Serve e publica audio/lista.json com os áudios prontos que existem. */
function listaDeAudios(): Plugin {
  return {
    name: 'lista-de-audios',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url && req.url.split('?')[0].endsWith('/audio/lista.json')) {
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(JSON.stringify(listarAudios()));
          return;
        }
        next();
      });
    },
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: 'audio/lista.json', source: JSON.stringify(listarAudios((m) => this.warn(m))) });
    },
  };
}

export default defineConfig({
  base,
  build: { target: 'es2020' },
  plugins: [
    conteudoDaRaiz(),
    listaDeAudios(),
    VitePWA({
      registerType: 'prompt',
      injectRegister: false,
      includeAssets: ['fonts/*.woff2', 'icones/*.png', 'favicon.svg'],
      manifest: {
        name: 'Caderno Prática',
        short_name: 'Caderno Prática',
        description: 'Revisão e reforço do Caderno de Alfabetização. Funciona sem internet.',
        lang: 'pt-BR',
        dir: 'ltr',
        start_url: '.',
        scope: '.',
        display: 'standalone',
        orientation: 'portrait',
        theme_color: '#E05C1A',
        background_color: '#FFF8EE',
        categories: ['education'],
        icons: [
          { src: 'icones/icone-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'icones/icone-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'icones/icone-maskable-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
          { src: 'icones/icone-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Os áudios prontos (mp3) também entram: o app fala letras e sílabas sem internet.
        globPatterns: ['**/*.{js,css,html,woff2,png,svg,json,txt,mp3}'],
        navigateFallback: 'index.html',
        cleanupOutdatedCaches: true,
        // Na primeira visita o app já passa a funcionar sem internet (sem precisar recarregar).
        clientsClaim: true,
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
      },
    }),
  ],
});

// Configuração do Vite (o programa que monta o app).
// - BASE_PATH: caminho do site. Padrão "/" (Cloudflare Pages e computador).
//   No GitHub Pages é "/NOME-DO-REPOSITORIO/" (o workflow de publicação preenche sozinho).
// - VITE_FIREBASE_*: dados do projeto Firebase (veja .env.example). Sem eles, o app
//   funciona só com "ENTRAR SEM CONTA".
// - O arquivo conteudo_licoes.json fica na raiz do repositório e é copiado
//   para o site publicado. O app o lê quando abre.
import { defineConfig, loadEnv, type Plugin } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import { readFileSync } from 'node:fs';
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

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  const comFirebase = !!(env.VITE_FIREBASE_API_KEY && env.VITE_FIREBASE_PROJECT_ID);
  return {
    base,
    // O Firebase (cerca de 600 KB) fica num arquivo à parte, carregado só por quem usa a conta Google.
    build: { target: 'es2020', chunkSizeWarningLimit: 700 },
    plugins: [
      conteudoDaRaiz(),
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
          globPatterns: ['**/*.{js,css,html,woff2,png,svg,json,txt}'],
          // O Firebase só vai para o aparelho quando a conta Google está configurada.
          globIgnores: comFirebase ? [] : ['**/firebase-*.js'],
          navigateFallback: 'index.html',
          // As páginas de login do Firebase (/__/auth/...) nunca vêm do cache do app.
          navigateFallbackDenylist: [/^\/__\//, /\/__\/(auth|firebase)\//],
          cleanupOutdatedCaches: true,
          // Na primeira visita o app já passa a funcionar sem internet (sem precisar recarregar).
          clientsClaim: true,
          maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
        },
      }),
    ],
  };
});

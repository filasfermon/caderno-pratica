// Gera os ícones do app (PNG 192 e 512, normais e "maskable") a partir de um desenho simples.
// Uso: npm run icones   (precisa do Chromium do Playwright instalado)
import { chromium } from '@playwright/test';
import { readFileSync, existsSync } from 'node:fs';

const fonte = readFileSync(new URL('../src/fontes/atkinson-hyperlegible-latin-700-normal.woff2', import.meta.url)).toString('base64');
const caminhoChromium = process.env.CHROMIUM_PATH ?? (existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined);

function desenho(tamanho: number, maskable: boolean): string {
  // No ícone "maskable" o desenho fica dentro da área segura (80% do centro).
  const escala = maskable ? 0.72 : 0.92;
  const raio = maskable ? 0 : tamanho * 0.2;
  return `<!doctype html><html><head><style>
  @font-face { font-family: A; src: url(data:font/woff2;base64,${fonte}) format('woff2'); font-weight: 700; }
  html,body { margin:0; background: transparent; }
  .f { width:${tamanho}px; height:${tamanho}px; background:#E05C1A; border-radius:${raio}px; display:grid; place-items:center; }
  .c { width:${tamanho * escala}px; height:${tamanho * escala}px; display:flex; flex-direction:column; align-items:center; justify-content:center; }
  .t { font-family:A; font-weight:700; color:#fff; font-size:${tamanho * escala * 0.5}px; line-height:1; letter-spacing:-0.02em; }
  .l { width:${tamanho * escala * 0.62}px; height:${Math.max(4, tamanho * escala * 0.055)}px; background:#fff; border-radius:999px; margin-top:${tamanho * escala * 0.06}px; }
  .l2 { width:${tamanho * escala * 0.42}px; opacity:.75; }
  </style></head><body><div class="f"><div class="c"><div class="t">Aa</div><div class="l"></div><div class="l l2"></div></div></div></body></html>`;
}

const navegador = await chromium.launch({ executablePath: caminhoChromium });
const pagina = await navegador.newPage();
for (const tamanho of [192, 512]) {
  for (const maskable of [false, true]) {
    await pagina.setViewportSize({ width: tamanho, height: tamanho });
    await pagina.setContent(desenho(tamanho, maskable));
    await pagina.evaluate(() => document.fonts.ready);
    const nome = `public/icones/icone-${maskable ? 'maskable-' : ''}${tamanho}.png`;
    await pagina.screenshot({ path: nome, omitBackground: !maskable });
    console.log('Ícone salvo:', nome);
  }
}
await navegador.close();

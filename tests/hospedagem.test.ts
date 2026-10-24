// Site estático e sem registro de dados: o código não usa armazenamento, cookies nem
// microfone; os cabeçalhos da Cloudflare bloqueiam o microfone e não liberam sites de fora.
import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

function arquivosDe(pasta: string): string[] {
  return readdirSync(pasta).flatMap((n) => {
    const p = join(pasta, n);
    return statSync(p).isDirectory() ? arquivosDe(p) : [p];
  });
}
const codigo = arquivosDe('src').filter((p) => p.endsWith('.ts'));
const ler = (p: string) => readFileSync(p, 'utf8');

describe('nenhum dado guardado, nenhum microfone', () => {
  it('o código não usa localStorage, sessionStorage, IndexedDB nem cookies (só para apagar dados de versões antigas)', () => {
    const usos = codigo.filter((p) => !p.endsWith('apagar-antigos.ts') && /localStorage|sessionStorage|indexedDB|document\.cookie/.test(ler(p)));
    expect(usos).toEqual([]);
    // E o arquivo que apaga só remove: nunca grava.
    expect(ler('src/dados/apagar-antigos.ts')).not.toMatch(/setItem|\.put\(|\.add\(|open\(/);
  });

  it('o código não pede o microfone nem grava', () => {
    expect(codigo.filter((p) => /getUserMedia|MediaRecorder|mediaDevices/.test(ler(p)))).toEqual([]);
  });

  it('sem Firebase, sem conta e sem dependências no app publicado', () => {
    const pacote = JSON.parse(ler('package.json'));
    expect(pacote.dependencies ?? {}).toEqual({});
    expect(codigo.filter((p) => /firebase|signIn|firestore/i.test(ler(p)))).toEqual([]);
  });
});

describe('Cloudflare Pages (public/_headers)', () => {
  const cabecalhos = ler('public/_headers');
  it('segurança: microfone e câmera bloqueados; nada de sites de fora', () => {
    expect(cabecalhos).toContain('Permissions-Policy: microphone=(), camera=()');
    expect(cabecalhos).toContain('X-Content-Type-Options: nosniff');
    expect(cabecalhos).toContain('Strict-Transport-Security');
    const csp = cabecalhos.match(/Content-Security-Policy: (.*)/)![1];
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).not.toMatch(/https?:/);
  });
  it('cache do PWA: o service worker e a página sempre conferidos; arquivos com impressão digital por 1 ano', () => {
    expect(cabecalhos).toMatch(/\/sw\.js\n\s+Cache-Control: no-cache/);
    expect(cabecalhos).toMatch(/\/index\.html\n\s+Cache-Control: no-cache/);
    expect(cabecalhos).toMatch(/\/assets\/\*\n\s+Cache-Control: public, max-age=31536000, immutable/);
    expect(cabecalhos).toMatch(/\/audio\/\*\n\s+Cache-Control: no-cache/);
  });
  it('caminho base configurável (BASE_PATH; "/" na Cloudflare)', () => {
    expect(ler('vite.config.ts')).toContain("const base = process.env.BASE_PATH || '/';");
  });
});

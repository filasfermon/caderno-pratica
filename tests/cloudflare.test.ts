// Correção 6: a Pages Function que repassa /__/auth/* para o domínio firebaseapp.com.
import { afterEach, describe, expect, it, vi } from 'vitest';
// @ts-expect-error arquivo JavaScript da Cloudflare (sem tipos)
import { repassarParaFirebase } from '../cloudflare/proxy-firebase.js';
import { readFileSync } from 'node:fs';

afterEach(() => vi.unstubAllGlobals());

describe('login no mesmo domínio do app (Cloudflare Pages)', () => {
  it('repassa /__/auth/handler para SEU-PROJETO.firebaseapp.com, com a mesma consulta', async () => {
    const chamado = vi.fn(async () => new Response('ok', { status: 200, headers: { 'content-type': 'text/html' } }));
    vi.stubGlobal('fetch', chamado);
    const r = await repassarParaFirebase({
      request: new Request('https://caderno.pages.dev/__/auth/handler?apiKey=x&authType=signInViaRedirect'),
      env: { FIREBASE_AUTH_HOST: 'meu-projeto.firebaseapp.com' },
    });
    expect(r.status).toBe(200);
    expect(chamado).toHaveBeenCalledWith('https://meu-projeto.firebaseapp.com/__/auth/handler?apiKey=x&authType=signInViaRedirect', expect.anything());
  });

  it('sem FIREBASE_AUTH_HOST, usa o VITE_FIREBASE_PROJECT_ID; sem nada, avisa', async () => {
    const chamado = vi.fn(async () => new Response('ok'));
    vi.stubGlobal('fetch', chamado);
    await repassarParaFirebase({ request: new Request('https://a.pages.dev/__/firebase/init.json'), env: { VITE_FIREBASE_PROJECT_ID: 'p1' } });
    expect(chamado).toHaveBeenCalledWith('https://p1.firebaseapp.com/__/firebase/init.json', expect.anything());
    const r = await repassarParaFirebase({ request: new Request('https://a.pages.dev/__/auth/handler'), env: {} });
    expect(r.status).toBe(500);
  });

  it('_headers: segurança, microfone permitido e cache certo do PWA', () => {
    const h = readFileSync(new URL('../public/_headers', import.meta.url), 'utf8');
    expect(h).toMatch(/X-Content-Type-Options: nosniff/);
    expect(h).toMatch(/Permissions-Policy: microphone=\(self\)/);
    expect(h).toMatch(/\/sw\.js\s+Cache-Control: no-cache/);
    expect(h).toMatch(/\/assets\/\*\s+Cache-Control: public, max-age=31536000, immutable/);
  });

  it('regras do Firestore: cada pessoa só nos próprios dados', () => {
    const r = readFileSync(new URL('../firestore.rules', import.meta.url), 'utf8');
    expect(r).toMatch(/match \/users\/\{uid\}/);
    expect(r).toMatch(/request\.auth\.uid == uid/);
  });
});

// Cloudflare Pages Function: repassa /__/auth/* e /__/firebase/* para o domínio
// firebaseapp.com do projeto. Assim o login do Google acontece no MESMO domínio do app
// (authDomain = domínio do app), como o Firebase recomenda para navegadores que
// bloqueiam o armazenamento de terceiros (Safari/iPhone, Chrome novo, app instalado).
//
// Variáveis no projeto da Cloudflare Pages (Settings → Variables and secrets):
//   FIREBASE_AUTH_HOST = SEU-PROJETO.firebaseapp.com   (ou só VITE_FIREBASE_PROJECT_ID)

export async function repassarParaFirebase(context) {
  const { request, env } = context;
  const host = env.FIREBASE_AUTH_HOST || (env.VITE_FIREBASE_PROJECT_ID ? `${env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com` : '');
  if (!host) return new Response('Firebase não configurado (FIREBASE_AUTH_HOST).', { status: 500 });
  const origem = new URL(request.url);
  const destino = new URL(origem.pathname + origem.search, `https://${host}`);
  const cabecalhos = new Headers(request.headers);
  cabecalhos.set('Host', host);
  const resposta = await fetch(destino.toString(), {
    method: request.method,
    headers: cabecalhos,
    body: ['GET', 'HEAD'].includes(request.method) ? undefined : request.body,
    redirect: 'manual',
  });
  return new Response(resposta.body, { status: resposta.status, statusText: resposta.statusText, headers: resposta.headers });
}

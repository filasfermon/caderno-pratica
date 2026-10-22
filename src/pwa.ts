// Service worker: guarda o app no aparelho para funcionar sem internet
// e avisa quando há uma nova versão.

import { registerSW } from 'virtual:pwa-register';
import { el } from './util/dom';

export function registrarServiceWorker(): void {
  if (!('serviceWorker' in navigator)) return;
  const atualizar = registerSW({
    immediate: true,
    onNeedRefresh() {
      if (document.querySelector('.nova-versao')) return;
      const botao = el('button', { type: 'button', class: 'botao' }, 'ATUALIZAR');
      const aviso = el('div', { class: 'nova-versao', role: 'status' }, el('span', { style: { flex: '1' } }, 'NOVA VERSÃO DISPONÍVEL.'), botao);
      botao.addEventListener('click', () => {
        aviso.remove();
        void atualizar(true);
      });
      document.body.append(aviso);
    },
  });
}

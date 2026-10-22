// Início do app: carrega o conteúdo, aplica as configurações e liga as telas.

import './estilo.css';
import { el } from './util/dom';
import { definirConteudo, mostrarTela, raiz } from './app';
import type { Conteudo } from './conteudo/tipos';
import { aplicarConfigNaTela } from './dados/config';
import { carregarCorrecoes } from './audio/pronuncia';
import { telaInicio } from './telas/inicio';
import { telaAulasDaUnidade, telaPartes, telaUnidades } from './telas/escolher';
import { telaAula } from './telas/aula';
import { telaProgresso } from './telas/progresso';
import { telaProfessor, pararGravacaoDoProfessor } from './telas/professor';
import { registrarServiceWorker } from './pwa';

function rotear(): void {
  pararGravacaoDoProfessor();
  const caminho = location.hash.replace(/^#\/?/, '').split('?')[0];
  const partes = caminho.split('/').filter(Boolean);
  const [secao, a, b] = partes;
  if (secao === 'escolher' && a === 'parte') return telaUnidades(Number(b));
  if (secao === 'escolher' && a === 'unidade') return telaAulasDaUnidade(Number(b));
  if (secao === 'escolher') return telaPartes();
  if (secao === 'aula') return telaAula(Number(a));
  if (secao === 'progresso') return telaProgresso();
  if (secao === 'professor') return telaProfessor(partes.slice(1));
  return telaInicio();
}

async function iniciar(): Promise<void> {
  aplicarConfigNaTela();
  raiz().replaceChildren(el('p', { class: 'carregando' }, 'CARREGANDO...'));
  try {
    // O conteúdo vem sempre do arquivo conteudo_licoes.json (nada fixo no código).
    const resposta = await fetch(`${import.meta.env.BASE_URL}conteudo_licoes.json`);
    if (!resposta.ok) throw new Error(`HTTP ${resposta.status}`);
    definirConteudo((await resposta.json()) as Conteudo);
  } catch {
    mostrarTela(
      'Erro',
      el('p', { class: 'aviso', style: { marginTop: '40px' } }, 'NÃO FOI POSSÍVEL ABRIR AS AULAS. CONECTE À INTERNET E ABRA O APLICATIVO DE NOVO.'),
    );
    return;
  }
  await carregarCorrecoes().catch(() => undefined);
  window.addEventListener('hashchange', rotear);
  rotear();
}

registrarServiceWorker();
void iniciar();

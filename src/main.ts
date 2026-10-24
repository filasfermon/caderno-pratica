// Início do app: carrega o conteúdo e liga as telas.
// O app não tem conta nem cadastro e não guarda nenhum dado no aparelho.

import './estilo.css';
import { el } from './util/dom';
import { definirConteudo, mostrarTela, obterConteudo, raiz } from './app';
import type { Conteudo } from './conteudo/tipos';
import { telaAulasDaUnidade, telaPartes, telaUnidades } from './telas/escolher';
import { telaAula } from './telas/aula';
import { registrarServiceWorker } from './pwa';
import { prepararAulasDisponiveis } from './atividades/disponiveis';
import { apagarDadosDeVersoesAntigas } from './dados/apagar-antigos';

function rotear(): void {
  const caminho = location.hash.replace(/^#\/?/, '').split('?')[0];
  const [secao, a, b] = caminho.split('/').filter(Boolean);
  if (secao === 'escolher' && a === 'parte') return telaUnidades(Number(b));
  if (secao === 'escolher' && a === 'unidade') return telaAulasDaUnidade(Number(b));
  if (secao === 'aula') return telaAula(Number(a));
  // Tela inicial = ESCOLHER A AULA (endereços antigos, como #/progresso e #/professor, também vêm para cá).
  return telaPartes();
}

async function iniciar(): Promise<void> {
  apagarDadosDeVersoesAntigas();
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
  window.addEventListener('hashchange', rotear);
  rotear();
  prepararAulasDisponiveis(obterConteudo());
}

registrarServiceWorker();
void iniciar();

// Abertura da aula, a SESSÃO de atividades (uma por tela) e a tela final.
//
// Retorno ao estudante:
//  - Acerto: som suave, ✓ verde grande e uma frase curta ("Isso mesmo.").
//  - 1º erro: "Vamos tentar de novo." e o modelo é repetido.
//  - 2º erro: a resposta certa aparece destacada, é lida e a sessão segue.
//  Nunca há cronômetro, vidas, placar ou contagem de erros.

import { el, esperar } from '../util/dom';
import { icones } from '../ui/icones';
import { anunciar, botaoOuvir, irPara, mostrarTela, obterConteudo, telaAtual, textoPaginas, topo } from '../app';
import { aulaPorNumero, formatarParaAula } from '../conteudo/consulta';
import { montarSessao, type Sessao } from '../atividades/sessao';
import type { Atividade } from '../atividades/tipos';
import { ehSoDeOuvir } from '../atividades/tipos';
import { montarAtividade } from '../atividades/telas/indice';
import type { Contexto, Controle } from '../atividades/telas/contrato';
import {
  FRASES_ACERTO,
  FRASES_FIM,
  FRASE_DEMONSTRACAO,
  FRASE_RESPOSTA,
  FRASE_SUA_VEZ,
  FRASE_TENTAR_DE_NOVO,
  instrucaoDe,
} from '../atividades/rotulos';
import { falar, falarEmSequencia, pararFala } from '../audio/voz';
import { somDeAcerto } from '../audio/sons';
import { config, animacoesLigadas, opcoesDoConteudo } from '../dados/config';
import { aulaDisponivel } from '../atividades/disponiveis';
import {
  iniciarSessao,
  jaViuTipo,
  marcarResultado,
  marcarTipoVisto,
  progresso,
  terminarSessao,
} from '../dados/progresso';
import { criarSorteio, sortearUm, type Sorteio } from '../util/aleatorio';
import type { Aula } from '../conteudo/tipos';
import { falaDaAbertura } from '../atividades/audios';

const MENSAGEM_SEM_CONTEUDO = 'Esta aula é feita só no caderno, com o professor. Escolha outra aula para praticar.';

// ---------- Abertura ----------

export function telaAula(numero: number): void {
  const c = obterConteudo();
  const aula = aulaPorNumero(c, numero);
  if (!aula) {
    mostrarTela('Aula', topo({ titulo: 'AULA', voltar: '#/escolher' }), el('p', { class: 'aviso' }, 'ESSA AULA NÃO EXISTE NO CADERNO.'));
    return;
  }
  if (!aulaDisponivel(c, aula, opcoesDoConteudo())) {
    // Aula da lista de exclusão ou sem atividades de reconhecimento: não há o que praticar no app.
    mostrarTela(
      `Aula ${aula.aula}`,
      topo({ titulo: `AULA ${aula.aula}`, voltar: '#/escolher' }),
      el('p', { class: 'aviso', 'data-aula-indisponivel': '' }, MENSAGEM_SEM_CONTEUDO.toLocaleUpperCase('pt-BR')),
      el('a', { class: 'botao principal', href: '#/escolher' }, 'ESCOLHER OUTRA AULA'),
    );
    anunciar(MENSAGEM_SEM_CONTEUDO);
    return;
  }
  const sorteio = criarSorteio();
  const objetivo = aula.objetivo ? formatarParaAula(aula.objetivo, aula) : '';
  const fala = [falaDaAbertura(aula)];
  const comecar = el('button', { type: 'button', class: 'botao principal', 'data-comecar': '' }, icones.seguir(34), 'COMEÇAR');
  comecar.addEventListener('click', () => {
    iniciarSessao(aula.aula);
    rodarSessao(montarSessao(c, aula, progresso(), sorteio, config().atividadesPorSessao, opcoesDoConteudo()), sorteio);
  });
  mostrarTela(
    `Aula ${aula.aula}`,
    topo({ titulo: `AULA ${aula.aula}`, voltar: `#/escolher/unidade/${aula.unidade}` }),
    el(
      'section',
      { class: 'abertura' },
      el('div', { class: 'numero-aula', 'aria-hidden': 'true' }, `AULA ${aula.aula}`),
      el('div', { class: 'paginas' }, icones.livro(30), `CADERNO: ${textoPaginas(aula.paginas)}`),
      objetivo ? el('p', { class: 'objetivo' }, objetivo.toLocaleUpperCase('pt-BR')) : null,
      el('div', { style: { display: 'flex', justifyContent: 'center' } }, botaoOuvir(() => fala)),
      comecar,
    ),
  );
  anunciar(fala);
}

// ---------- Sessão ----------
//
// Navegação livre: cada bolinha leva direto à sua atividade; VOLTAR e AVANÇAR andam
// uma de cada vez; TERMINAR encerra quando quiser. Pular ou voltar NÃO conta como erro:
// só a resposta dada entra no progresso e na repetição espaçada.

interface EstadoAtividade {
  feita: boolean;
  /** O que o estudante respondeu (para mostrar quando ele voltar a esta atividade). */
  resposta?: string;
  /** certo = acertou; mostrada = o app mostrou a resposta depois do 2º erro; ouvida = só de ouvir/ler/falar. */
  resultado?: 'certo' | 'mostrada' | 'ouvida';
}

function rodarSessao(sessao: Sessao, sorteio: Sorteio): void {
  const { aula, atividades } = sessao;
  const estados: EstadoAtividade[] = atividades.map(() => ({ feita: false }));
  let indice = 0;
  let visita = 0; // muda a cada tela de atividade: tarefas antigas param sozinhas
  // Tipo de atividade cuja instrução acabou de ser falada: se o próximo item for do
  // mesmo tipo, a instrução não é repetida (só o som ou a palavra do novo item).
  let tipoInstruido: string | null = null;
  let falaDaNavegacao: string | null = null;

  const terminar = el('button', { type: 'button', class: 'botao-icone contorno', 'data-terminar': '' }, icones.fechar(26), el('span', {}, 'TERMINAR'));
  const bolinhas = el('ol', { class: 'bolinhas' });
  const navBolinhas = el('nav', { 'aria-label': 'Atividades da sessão' }, bolinhas);
  const textoInstrucao = el('p', { id: 'instrucao' });
  const ouvirInstrucao = el('button', { type: 'button', class: 'botao-ouvir', 'aria-label': 'Ouvir a instrução de novo' }, icones.altoFalante(34));
  const selo = el('span', { class: 'selo-revisao', hidden: true }, 'REVISÃO');
  const faixa = el('div', { class: 'demonstracao-faixa', hidden: true }, 'VEJA COMO SE FAZ');
  const area = el('div', { class: 'area' });
  const mensagem = el('p', { class: 'mensagem-retorno', 'aria-live': 'assertive' });
  const refazer = el('div', { class: 'refazer', hidden: true });
  const voltar = el('button', { type: 'button', class: 'botao navegar', 'data-voltar': '' }, el('span', { 'aria-hidden': 'true' }, '◀'), 'VOLTAR');
  const avancar = el('button', { type: 'button', class: 'botao navegar', 'data-avancar': '' }, 'AVANÇAR', el('span', { 'aria-hidden': 'true' }, '▶'));
  const rodape = el('div', { class: 'rodape navegacao' }, voltar, avancar);
  const corpo = el(
    'section',
    { class: 'sessao', 'data-sessao': '' },
    el('header', { class: 'topo' }, terminar, el('span', { class: 'titulo-sessao' }, `AULA ${aula.aula}`)),
    navBolinhas,
    el('h1', { class: 'visualmente-oculto' }, `Aula ${aula.aula}: prática`),
    selo,
    faixa,
    el('div', { class: 'instrucao' }, ouvirInstrucao, textoInstrucao),
    refazer,
    area,
    mensagem,
    rodape,
  );
  const minhaTela = mostrarTela(`Aula ${aula.aula}`, corpo);
  const viva = () => telaAtual() === minhaTela;
  const feitas = () => estados.filter((e) => e.feita).length;

  const encerrar = () => {
    if (!viva()) return;
    visita++;
    pararFala();
    if (feitas() > 0) terminarSessao(aula.aula);
    telaFim(aula, feitas());
  };
  const irPara = (i: number, fala?: string) => {
    if (!viva()) return;
    visita++;
    if (i >= atividades.length) return encerrar();
    indice = Math.max(0, i);
    falaDaNavegacao = fala ?? null;
    void mostrarAtividade();
  };
  terminar.addEventListener('click', encerrar);
  voltar.addEventListener('click', () => indice > 0 && irPara(indice - 1, 'Voltar.'));
  avancar.addEventListener('click', () => irPara(indice + 1, 'Avançar.'));

  const desenharBolinhas = () => {
    bolinhas.replaceChildren(
      ...atividades.map((_, i) => {
        const atual = i === indice;
        const feita = estados[i].feita;
        const rotulo = `Atividade ${i + 1} de ${atividades.length}${feita ? ', feita' : ''}`;
        const botao = el(
          'button',
          {
            type: 'button',
            class: `bolinha${atual ? ' atual' : ''}${feita ? ' feita' : ''}`,
            'aria-label': rotulo,
            'aria-current': atual ? 'step' : undefined,
            'data-bolinha': i,
          },
          el('span', { class: 'ponto', 'aria-hidden': 'true' }, feita ? '✓' : ''),
        );
        botao.addEventListener('click', () => i !== indice && irPara(i));
        return el('li', {}, botao);
      }),
    );
  };

  const mostrarAtividade = async () => {
    if (!viva()) return;
    const minhaVisita = visita;
    const at = atividades[indice];
    desenharBolinhas();
    mensagem.textContent = '';
    mensagem.className = 'mensagem-retorno';
    refazer.hidden = true;
    selo.hidden = !at.revisao;
    corpo.dataset.tipo = at.tipo;
    corpo.dataset.indice = String(indice);
    corpo.dataset.feita = estados[indice].feita ? 'sim' : 'nao';
    voltar.disabled = indice === 0;
    avancar.classList.remove('principal');
    const instrucao = instrucaoDe(at);
    textoInstrucao.textContent = instrucao;
    // O alto-falante sempre fala a instrução completa.
    ouvirInstrucao.onclick = () => void falar({ categoria: 'instrucao', texto: instrucao });
    window.scrollTo(0, 0);

    if (!jaViuTipo(at.tipo)) {
      await demonstrar(at, area, faixa, sorteio, () => viva() && visita === minhaVisita);
      if (!viva() || visita !== minhaVisita) return;
      marcarTipoVisto(at.tipo);
      tipoInstruido = at.tipo; // a demonstração já falou a instrução
    }
    const estado = estados[indice];
    if (estado.feita && estado.resultado !== 'ouvida') mostrarRespostaDada(at, estado);
    else executar(at, instrucao);
  };

  /** Volta a uma atividade já respondida: mostra a resposta dada e oferece FAZER DE NOVO. */
  const mostrarRespostaDada = (at: Atividade, estado: EstadoAtividade) => {
    area.replaceChildren();
    const minhaVisita = visita;
    let silencio = true;
    const ctx: Contexto = {
      area,
      sorteio,
      emDemonstracao: () => false,
      falar: (item, opcoes) => (silencio ? Promise.resolve() : falar(item, opcoes)),
      acertou: () => undefined,
      errou: () => undefined,
      errouParcial: () => undefined,
      concluir: () => undefined,
    };
    const controle = montarAtividade(at, ctx);
    void Promise.resolve(controle.mostrarResposta?.()).then(() => {
      silencio = false;
    });
    controle.travar?.();
    const certo = estado.resultado === 'certo';
    const texto = certo
      ? `✓ VOCÊ JÁ FEZ ESTA ATIVIDADE${estado.resposta ? `: ${estado.resposta}` : ''}.`
      : `VOCÊ RESPONDEU${estado.resposta ? `: ${estado.resposta}` : ''}. A RESPOSTA CERTA ESTÁ DESTACADA.`;
    const botao = el('button', { type: 'button', class: 'botao principal', 'data-refazer': '' }, 'FAZER DE NOVO');
    botao.addEventListener('click', () => {
      if (visita !== minhaVisita) return;
      visita++;
      refazer.hidden = true;
      executar(at, instrucaoDe(at));
    });
    refazer.replaceChildren(el('p', { class: 'resposta-dada' }, texto), botao);
    refazer.hidden = false;
    avancar.classList.add('principal');
    void falarEmSequencia([...(falaDaNavegacao ? [{ categoria: 'retorno' as const, texto: falaDaNavegacao }] : []), { categoria: 'retorno', texto: 'Você já fez esta atividade.' }]);
    falaDaNavegacao = null;
  };

  const executar = (at: Atividade, instrucao: string) => {
    area.replaceChildren();
    mensagem.textContent = '';
    // Esta atividade continua "valendo" enquanto a tela e a visita forem as mesmas.
    const minhaVisita = visita;
    const meuIndice = indice;
    const vale = () => viva() && visita === minhaVisita;
    let tentativas = 0;
    let teveErro = false;
    let terminado = false;
    let controle: Controle = {};
    const registrar = (resultado: EstadoAtividade['resultado'], resposta?: string) => {
      estados[meuIndice] = { feita: true, resultado, resposta };
      corpo.dataset.feita = 'sim';
      desenharBolinhas();
    };
    // Depois do retorno (acerto ou resposta mostrada), o próximo item começa logo.
    const seguirSozinho = () => {
      if (vale()) irPara(meuIndice + 1);
    };
    const ctx: Contexto = {
      area,
      sorteio,
      emDemonstracao: () => false,
      falar: (item, opcoes) => falar(item, opcoes),
      acertou: (resposta) => {
        if (terminado) return;
        terminado = true;
        controle.travar?.();
        marcarResultado(at.chave, at.aula, !teveErro);
        registrar('certo', resposta);
        somDeAcerto();
        mostrarSinalDeCerto();
        const frase = sortearUm(FRASES_ACERTO, sorteio);
        mensagem.textContent = frase.toLocaleUpperCase('pt-BR');
        mensagem.className = 'mensagem-retorno certo';
        void (async () => {
          await falar({ categoria: 'retorno', texto: frase });
          if (!vale()) return;
          await controle.aoAcertar?.();
          seguirSozinho();
        })();
      },
      errou: (resposta) => {
        if (terminado) return;
        tentativas++;
        teveErro = true;
        if (tentativas === 1) {
          mensagem.textContent = FRASE_TENTAR_DE_NOVO.toLocaleUpperCase('pt-BR');
          void (async () => {
            await falar({ categoria: 'retorno', texto: FRASE_TENTAR_DE_NOVO });
            if (!vale() || terminado) return;
            controle.reiniciar?.();
            await controle.modelo?.();
          })();
        } else {
          terminado = true;
          controle.travar?.();
          marcarResultado(at.chave, at.aula, false);
          registrar('mostrada', resposta);
          mensagem.textContent = FRASE_RESPOSTA.toLocaleUpperCase('pt-BR');
          void (async () => {
            await falar({ categoria: 'retorno', texto: FRASE_RESPOSTA });
            if (!vale()) return;
            await controle.mostrarResposta?.();
            seguirSozinho();
          })();
        }
      },
      errouParcial: () => {
        teveErro = true;
        mensagem.textContent = FRASE_TENTAR_DE_NOVO.toLocaleUpperCase('pt-BR');
        void falar({ categoria: 'retorno', texto: FRASE_TENTAR_DE_NOVO });
      },
      concluir: () => {
        if (terminado) return;
        terminado = true;
        marcarResultado(at.chave, at.aula, true);
        registrar('ouvida');
        // Só ouvir, ler e falar: o estudante decide quando seguir (AVANÇAR fica em destaque).
        avancar.classList.add('principal');
        avancar.focus({ preventScroll: true });
      },
    };
    controle = montarAtividade(at, ctx);
    const repetirInstrucao = tipoInstruido !== at.tipo;
    tipoInstruido = at.tipo;
    const antes = falaDaNavegacao ? [{ categoria: 'retorno' as const, texto: falaDaNavegacao }] : [];
    falaDaNavegacao = null;
    void (async () => {
      const ok = await falarEmSequencia([...antes, ...(repetirInstrucao ? [{ categoria: 'instrucao' as const, texto: instrucao }] : [])]);
      if (!vale() || terminado) return;
      if (ok || ehSoDeOuvir(at)) await controle.modelo?.();
    })();
    // Conheça, Leia e Diga: depois de um tempo, a atividade conta como feita mesmo sem tocar em nada.
    if (ehSoDeOuvir(at)) setTimeout(() => vale() && !terminado && ctx.concluir(), 8000);
  };

  void mostrarAtividade();
}

function mostrarSinalDeCerto(): void {
  const sinal = el('div', { class: 'retorno', 'aria-hidden': 'true' }, el('div', { class: 'sinal-certo' }, icones.certo(110)));
  document.body.append(sinal);
  setTimeout(() => sinal.remove(), 1100);
}

// ---------- Demonstração animada (primeira vez de cada tipo) ----------

async function demonstrar(at: Atividade, area: HTMLElement, faixa: HTMLElement, sorteio: Sorteio, viva: () => boolean): Promise<void> {
  area.replaceChildren();
  faixa.hidden = false;
  const corpo = area.closest('[data-sessao]') as HTMLElement;
  corpo.dataset.demo = 'sim';
  const bloqueio = el('div', { class: 'bloqueio', 'aria-hidden': 'true' });
  const mao = el('div', { class: 'mao-demo', 'aria-hidden': 'true' }, icones.mao(64));
  let pular = false;
  const botaoPular = el('button', { type: 'button', class: 'pular-demo', 'data-pular-demo': '' }, 'PULAR');
  botaoPular.addEventListener('click', () => {
    pular = true;
    pararFala();
  });
  mao.style.left = `${window.innerWidth / 2}px`;
  mao.style.top = `${window.innerHeight + 20}px`;
  document.body.append(bloqueio, mao);
  faixa.append(botaoPular);
  const continuar = () => viva() && !pular;
  const ctxDemo: Contexto = {
    area,
    sorteio,
    emDemonstracao: () => true,
    falar: (item, opcoes) => falar(item, opcoes),
    acertou: () => {
      somDeAcerto();
      mostrarSinalDeCerto();
    },
    errou: () => undefined,
    errouParcial: () => undefined,
    concluir: () => undefined,
  };
  try {
    const controle = montarAtividade(at, ctxDemo);
    await falar({ categoria: 'retorno', texto: FRASE_DEMONSTRACAO });
    if (!continuar()) return;
    await falar({ categoria: 'instrucao', texto: instrucaoDe(at) });
    if (!continuar()) return;
    corpo.dataset.demo = 'modelo';
    if (at.tipo !== 'troco' && at.tipo !== 'leia') await controle.modelo?.();
    let k = 0;
    for (const passo of controle.passosDemo?.() ?? []) {
      corpo.dataset.demo = `passo-${++k}`;
      if (!continuar()) return;
      const alvo = passo();
      if (!alvo) continue;
      alvo.scrollIntoView({ block: 'center', behavior: 'auto' });
      await esperar(80);
      const r = alvo.getBoundingClientRect();
      mao.style.left = `${r.left + r.width / 2 - 22}px`;
      mao.style.top = `${r.top + r.height / 2 - 6}px`;
      await esperar(animacoesLigadas() ? 650 : 200);
      mao.classList.add('toque');
      alvo.click();
      await esperar(200);
      mao.classList.remove('toque');
      await esperar(250);
    }
    if (!continuar()) return;
    corpo.dataset.demo = 'fim';
    await esperar(200);
    await falar({ categoria: 'retorno', texto: FRASE_SUA_VEZ });
  } finally {
    bloqueio.remove();
    mao.remove();
    botaoPular.remove();
    faixa.hidden = true;
    delete corpo.dataset.demo;
    area.replaceChildren();
    window.scrollTo(0, 0);
  }
}

// ---------- Fim da sessão ----------

/** Tela final: mostra quantas atividades foram feitas (nunca quantas faltaram). */
function telaFim(aula: Aula, praticadas: number): void {
  const incentivo = praticadas > 0 ? FRASES_FIM[Math.floor(Math.random() * FRASES_FIM.length)] : 'Até a próxima prática.';
  const frase = praticadas === 1 ? 'Você praticou 1 atividade.' : `Você praticou ${praticadas} atividades.`;
  const fala = praticadas > 0 ? `${frase} ${incentivo}` : incentivo;
  const denovo = el('button', { type: 'button', class: 'botao principal', 'data-praticar-de-novo': '' }, 'PRATICAR DE NOVO');
  denovo.addEventListener('click', () => irPara(`#/aula/${aula.aula}?${Date.now()}`));
  mostrarTela(
    'Fim da prática',
    el(
      'section',
      { class: 'fim', 'data-fim': '' },
      el('div', { class: 'estrela', 'aria-hidden': 'true' }, icones.estrela(96)),
      el('h1', { class: 'grande' }, praticadas > 0 ? frase.toLocaleUpperCase('pt-BR') : 'ATÉ A PRÓXIMA.'),
      praticadas > 0 ? el('p', { class: 'objetivo', style: { fontSize: '1.3rem', margin: '0' } }, incentivo.toLocaleUpperCase('pt-BR')) : null,
      el('div', { style: { display: 'flex', justifyContent: 'center' } }, botaoOuvir(() => fala)),
      el('div', { class: 'pilha' }, denovo, el('a', { class: 'botao', href: `#/escolher/unidade/${aula.unidade}` }, icones.voltar(28), 'VOLTAR')),
    ),
  );
  anunciar(fala);
}

// MODO PROFESSOR (protegido por PIN de 4 números).
// - Gravações: ouvir a voz atual, gravar a própria voz, ouvir, regravar, apagar, editar a fala.
// - Pacote: exportar todas as gravações num .zip e importar um .zip.
// - Configurações: tamanho do texto, velocidade da voz, vogal aberta/fechada, animações.
// - Progresso do estudante: apagar (começar de novo).

import { el } from '../util/dom';
import { icones } from '../ui/icones';
import { irPara, mostrarTela, obterConteudo, topo } from '../app';
import { lerLocal, gravarLocal } from '../dados/local';
import { config, mudarConfig, type TamanhoTexto } from '../dados/config';
import { esquecerDemonstracoes, progresso, zerarProgresso } from '../dados/progresso';
import { apagar, esvaziar, guardar, listarChaves, type Audio, type Fala } from '../dados/banco';
import { audiosDaAula, audiosDoApp } from '../atividades/audios';
import { chaveDoItem, correcaoDe, definirCorrecaoLocal, carregarCorrecoes, textoParaFala, type ItemAudio } from '../audio/pronuncia';
import { falar, pararFala, tocarAudio, vozesPortugues } from '../audio/voz';
import { comecarGravacao, podeGravar, type GravadorAtivo } from '../audio/gravador';
import { exportarPacote, importarPacote } from '../audio/pacote';

// ---------- PIN ----------

let liberado = false;

async function resumo(texto: string): Promise<string> {
  try {
    const dados = new TextEncoder().encode('caderno-pratica:' + texto);
    const hash = await crypto.subtle.digest('SHA-256', dados);
    return [...new Uint8Array(hash)].map((b) => b.toString(16).padStart(2, '0')).join('');
  } catch {
    // Sem criptografia disponível (endereço sem https): um resumo simples basta para um PIN local.
    let h = 0;
    for (const c of 'caderno-pratica:' + texto) h = (h * 31 + c.charCodeAt(0)) | 0;
    return 'simples-' + h;
  }
}

function campoPin(id: string, rotulo: string): { campo: HTMLElement; entrada: HTMLInputElement } {
  const entrada = el('input', { id, type: 'password', inputmode: 'numeric', pattern: '[0-9]*', maxlength: 4, autocomplete: 'off' }) as HTMLInputElement;
  return { campo: el('label', { class: 'campo', for: id }, rotulo, entrada), entrada };
}

function telaPin(): void {
  const temPin = lerLocal<string | null>('pin', null) !== null;
  const aviso = el('p', { class: 'aviso', 'aria-live': 'polite', hidden: true });
  const p1 = campoPin('pin1', temPin ? 'PIN DO PROFESSOR (4 NÚMEROS)' : 'CRIE UM PIN DE 4 NÚMEROS');
  const p2 = campoPin('pin2', 'REPITA O PIN');
  const form = el(
    'form',
    { class: 'pin' },
    temPin ? null : el('p', {}, 'Primeiro uso: crie um PIN. Ele protege as configurações e as gravações. Anote o PIN em lugar seguro.'),
    p1.campo,
    temPin ? null : p2.campo,
    el('button', { type: 'submit', class: 'botao principal' }, icones.cadeado(28), 'ENTRAR'),
    aviso,
  );
  const mostrarAviso = (t: string) => {
    aviso.hidden = false;
    aviso.textContent = t;
  };
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const v = p1.entrada.value;
    if (!/^\d{4}$/.test(v)) return mostrarAviso('O PIN TEM 4 NÚMEROS.');
    if (!temPin) {
      if (v !== p2.entrada.value) return mostrarAviso('OS DOIS PINS ESTÃO DIFERENTES.');
      gravarLocal('pin', await resumo(v));
      liberado = true;
      return telaMenu();
    }
    if ((await resumo(v)) === lerLocal('pin', '')) {
      liberado = true;
      telaMenu();
    } else {
      p1.entrada.value = '';
      mostrarAviso('PIN ERRADO. TENTE DE NOVO.');
    }
  });
  mostrarTela('Professor', topo({ titulo: 'PROFESSOR', voltar: '#/' }), el('div', { class: 'professor' }, form));
  p1.entrada.focus();
}

// ---------- Menu ----------

function telaMenu(): void {
  const item = (rota: string, icone: SVGSVGElement, texto: string) => el('a', { class: 'botao', href: rota, style: { justifyContent: 'flex-start' } }, icone, texto);
  const sair = el('button', { type: 'button', class: 'botao' }, icones.fechar(26), 'SAIR DO MODO PROFESSOR');
  sair.addEventListener('click', () => {
    liberado = false;
    irPara('#/');
  });
  mostrarTela(
    'Professor',
    topo({ titulo: 'MODO PROFESSOR', voltar: '#/' }),
    el(
      'nav',
      { class: 'professor pilha', 'aria-label': 'Menu do professor' },
      item('#/professor/gravacoes', icones.microfone(28), 'GRAVAÇÕES E PRONÚNCIA'),
      item('#/professor/pacote', icones.pacote(28), 'PACOTE DE ÁUDIOS (.ZIP)'),
      item('#/professor/configuracoes', icones.engrenagem(28), 'CONFIGURAÇÕES'),
      item('#/professor/estudante', icones.estrela(28), 'PROGRESSO DO ESTUDANTE'),
      item('#/professor/pin', icones.cadeado(28), 'TROCAR O PIN'),
      sair,
    ),
  );
}

// ---------- Gravações ----------

let gravadorAtivo: GravadorAtivo | null = null;

function rotuloOrigem(origem: string): string {
  return origem === 'professor' ? 'SUA GRAVAÇÃO' : origem === 'pacote' ? 'DO PACOTE' : 'VOZ DO APARELHO';
}

function linhaDeGravacao(item: ItemAudio, chavesProprias: Set<string>, chavesPacote: Set<string>): HTMLElement {
  const chave = chaveDoItem(item);
  const origem = el('span', { class: 'origem' });
  const fala = el('p', { class: 'fala' });
  const atualizar = () => {
    const o = chavesProprias.has(chave) ? 'professor' : chavesPacote.has(chave) ? 'pacote' : 'voz';
    origem.textContent = rotuloOrigem(o);
    origem.className = `origem ${o}`;
    fala.textContent = `A voz do aparelho lê: "${textoParaFala(item)}"`;
    apagarBtn.hidden = !chavesProprias.has(chave);
  };
  const ouvir = el('button', { type: 'button', class: 'botao' }, icones.altoFalante(22), 'OUVIR');
  ouvir.addEventListener('click', () => void falar(item));
  const gravar = el('button', { type: 'button', class: 'botao', hidden: !podeGravar() }, icones.microfone(22), 'GRAVAR');
  gravar.addEventListener('click', async () => {
    if (gravadorAtivo && gravar.classList.contains('gravando')) {
      const g = gravadorAtivo;
      gravadorAtivo = null;
      const r = await g.parar();
      gravar.classList.remove('gravando');
      gravar.replaceChildren(icones.microfone(22), 'REGRAVAR');
      await guardar<Audio>('gravacoes', { chave, texto: item.texto, blob: r.blob, mime: r.mime, data: Date.now() });
      chavesProprias.add(chave);
      atualizar();
      void tocarAudio(r.blob);
      return;
    }
    if (gravadorAtivo) return; // outra gravação em andamento
    try {
      pararFala();
      gravadorAtivo = await comecarGravacao();
      gravar.classList.add('gravando');
      gravar.replaceChildren(icones.parar(22), 'PARAR');
    } catch {
      fala.textContent = 'Não foi possível usar o microfone. Verifique a permissão do navegador.';
    }
  });
  const apagarBtn = el('button', { type: 'button', class: 'botao' }, icones.lixeira(22), 'APAGAR');
  apagarBtn.addEventListener('click', async () => {
    await apagar('gravacoes', chave);
    chavesProprias.delete(chave);
    gravar.replaceChildren(icones.microfone(22), 'GRAVAR');
    atualizar();
  });
  const editar = el('button', { type: 'button', class: 'botao' }, 'EDITAR FALA');
  const editor = el('div', { class: 'campo', hidden: true });
  editar.addEventListener('click', () => {
    if (!editor.hidden) {
      editor.hidden = true;
      return;
    }
    const id = `fala-${Math.random().toString(36).slice(2)}`;
    const entrada = el('input', { type: 'text', id, value: correcaoDe(chave) ?? textoParaFala(item) }) as HTMLInputElement;
    const salvar = el('button', { type: 'button', class: 'botao' }, 'SALVAR');
    const restaurar = el('button', { type: 'button', class: 'botao' }, 'VOLTAR AO PADRÃO');
    const testar = el('button', { type: 'button', class: 'botao' }, icones.altoFalante(22), 'TESTAR');
    salvar.addEventListener('click', async () => {
      const t = entrada.value.trim();
      if (!t) return;
      await guardar<Fala>('falas', { chave, fala: t });
      definirCorrecaoLocal(chave, t);
      atualizar();
      editor.hidden = true;
    });
    restaurar.addEventListener('click', async () => {
      await apagar('falas', chave);
      definirCorrecaoLocal(chave, null);
      entrada.value = textoParaFala(item);
      atualizar();
    });
    testar.addEventListener('click', () => {
      definirCorrecaoLocal(chave, entrada.value.trim() || null);
      void falar(item, { soVozDoAparelho: true });
      void carregarCorrecoes();
    });
    editor.replaceChildren(
      el('label', { for: id }, 'TEXTO QUE A VOZ DO APARELHO VAI LER (a tela continua igual):'),
      entrada,
      el('div', { class: 'acoes' }, testar, salvar, restaurar),
    );
    editor.hidden = false;
  });
  const linha = el(
    'li',
    { class: 'item-gravacao' },
    el('div', { class: 'cabeca' }, el('span', { class: 'texto' }, item.texto), origem),
    fala,
    el('div', { class: 'acoes' }, ouvir, gravar, apagarBtn, editar),
    editor,
  );
  if (chavesProprias.has(chave)) gravar.replaceChildren(icones.microfone(22), 'REGRAVAR');
  atualizar();
  return linha;
}

const NOMES_CATEGORIA: Record<string, string> = {
  todas: 'TUDO',
  silaba: 'SÍLABAS E LETRAS',
  palavra: 'PALAVRAS',
  frase: 'FRASES E CONTAS',
};

async function telaGravacoes(filtroAula: string, filtroTipo: string): Promise<void> {
  const c = obterConteudo();
  const seletorAula = el('select', { id: 'filtro-aula' }) as HTMLSelectElement;
  seletorAula.append(el('option', { value: 'app' }, 'INSTRUÇÕES E FRASES DO APP'));
  for (const a of c.aulas) seletorAula.append(el('option', { value: String(a.aula) }, `AULA ${a.aula} (${a.paginas})`));
  seletorAula.value = filtroAula;
  const seletorTipo = el('select', { id: 'filtro-tipo' }) as HTMLSelectElement;
  for (const [v, t] of Object.entries(NOMES_CATEGORIA)) seletorTipo.append(el('option', { value: v }, t));
  seletorTipo.value = filtroTipo;
  const recarregar = () => irPara(`#/professor/gravacoes/${seletorAula.value}/${seletorTipo.value}`);
  seletorAula.addEventListener('change', recarregar);
  seletorTipo.addEventListener('change', recarregar);

  const aula = c.aulas.find((a) => String(a.aula) === filtroAula);
  let itens = filtroAula === 'app' || !aula ? audiosDoApp() : audiosDaAula(c, aula);
  if (filtroTipo === 'silaba') itens = itens.filter((x) => x.categoria === 'silaba' || x.categoria === 'letra');
  else if (filtroTipo === 'palavra') itens = itens.filter((x) => x.categoria === 'palavra' || x.categoria === 'numero');
  else if (filtroTipo === 'frase') itens = itens.filter((x) => ['frase', 'conta', 'hora', 'instrucao', 'retorno'].includes(x.categoria));

  const proprias = new Set(await listarChaves('gravacoes'));
  const pacote = new Set(await listarChaves('pacote'));
  const lista = el('ul', { class: 'itens-gravacao' });
  const POR_VEZ = 40;
  let mostrados = 0;
  const mais = el('button', { type: 'button', class: 'botao' }, 'MOSTRAR MAIS');
  const mostrarMais = () => {
    for (const it of itens.slice(mostrados, mostrados + POR_VEZ)) lista.append(linhaDeGravacao(it, proprias, pacote));
    mostrados += POR_VEZ;
    mais.hidden = mostrados >= itens.length;
  };
  mais.addEventListener('click', mostrarMais);
  mostrarMais();
  mostrarTela(
    'Gravações',
    topo({ titulo: 'GRAVAÇÕES', voltar: '#/professor' }),
    el(
      'div',
      { class: 'professor' },
      el('p', {}, 'Escolha a aula. Para cada item: ouça a voz atual, grave a sua voz (toque em GRAVAR, fale, toque em PARAR) ou corrija o texto que a voz do aparelho lê.'),
      podeGravar() ? null : el('p', { class: 'aviso' }, 'Este navegador não permite gravar. Use o Chrome atualizado.'),
      el('label', { class: 'campo', for: 'filtro-aula' }, 'AULA', seletorAula),
      el('label', { class: 'campo', for: 'filtro-tipo' }, 'MOSTRAR', seletorTipo),
      el('p', { class: 'etiqueta' }, `${itens.length} ITENS`),
      lista,
      mais,
    ),
  );
}

// ---------- Pacote ----------

function telaPacote(): void {
  const msg = el('p', { class: 'aviso', 'aria-live': 'polite', hidden: true });
  const mostrar = (t: string) => {
    msg.hidden = false;
    msg.textContent = t;
  };
  const exportar = el('button', { type: 'button', class: 'botao principal' }, icones.pacote(28), 'EXPORTAR GRAVAÇÕES (.ZIP)');
  exportar.addEventListener('click', async () => {
    mostrar('PREPARANDO O PACOTE...');
    try {
      const { blob, quantidade } = await exportarPacote();
      if (!quantidade) return mostrar('AINDA NÃO HÁ GRAVAÇÕES NESTE APARELHO.');
      const data = new Date().toISOString().slice(0, 10);
      const link = el('a', { href: URL.createObjectURL(blob), download: `caderno-pratica-audios-${data}.zip` });
      document.body.append(link);
      link.click();
      link.remove();
      mostrar(`PACOTE PRONTO: ${quantidade} ÁUDIOS. O ARQUIVO FOI PARA A PASTA DE DOWNLOADS.`);
    } catch (e) {
      mostrar('NÃO FOI POSSÍVEL EXPORTAR: ' + (e as Error).message);
    }
  });
  const entrada = el('input', { type: 'file', accept: '.zip,application/zip', id: 'arquivo-pacote', class: 'visualmente-oculto' }) as HTMLInputElement;
  entrada.addEventListener('change', async () => {
    const arquivo = entrada.files?.[0];
    if (!arquivo) return;
    mostrar('IMPORTANDO...');
    try {
      const r = await importarPacote(arquivo);
      await carregarCorrecoes();
      mostrar(`PACOTE IMPORTADO: ${r.audios} ÁUDIOS E ${r.falas} CORREÇÕES DE FALA.`);
    } catch (e) {
      mostrar('NÃO FOI POSSÍVEL IMPORTAR: ' + (e as Error).message);
    }
    entrada.value = '';
  });
  const importar = el('label', { class: 'botao', for: 'arquivo-pacote' }, icones.pacote(28), 'IMPORTAR PACOTE (.ZIP)');
  const apagarPacote = el('button', { type: 'button', class: 'botao' }, icones.lixeira(24), 'APAGAR O PACOTE IMPORTADO');
  apagarPacote.addEventListener('click', async () => {
    await esvaziar('pacote');
    await esvaziar('falas_pacote');
    await carregarCorrecoes();
    mostrar('PACOTE APAGADO. AS SUAS GRAVAÇÕES CONTINUAM.');
  });
  mostrarTela(
    'Pacote de áudios',
    topo({ titulo: 'PACOTE DE ÁUDIOS', voltar: '#/professor' }),
    el(
      'div',
      { class: 'professor' },
      el('p', {}, 'Grave os áudios uma vez no seu celular. Depois exporte o pacote e passe o arquivo .zip para o celular de cada estudante (WhatsApp, Bluetooth ou cabo). No celular do estudante, entre no modo professor e importe o pacote.'),
      exportar,
      entrada,
      importar,
      apagarPacote,
      msg,
    ),
  );
}

// ---------- Configurações ----------

function grupoDeEscolha<T extends string>(titulo: string, nome: string, opcoes: [T, string][], atual: T, aoMudar: (v: T) => void): HTMLElement {
  const grupo = el('fieldset', { class: 'escolha-grupo' }, el('legend', {}, titulo));
  for (const [valor, rotulo] of opcoes) {
    const entrada = el('input', { type: 'radio', name: nome, value: valor, checked: valor === atual }) as HTMLInputElement;
    entrada.addEventListener('change', () => entrada.checked && aoMudar(valor));
    grupo.append(el('label', {}, entrada, rotulo));
  }
  return grupo;
}

function telaConfiguracoes(): void {
  const c = config();
  const exemplo = () => void falar({ categoria: 'silaba', texto: 'PE' }).then(() => falar({ categoria: 'silaba', texto: 'PO' }));
  const velocidade = el('input', { type: 'range', id: 'velocidade', min: 0.6, max: 1.2, step: 0.05, value: c.velocidade }) as HTMLInputElement;
  const valorVelocidade = el('output', { for: 'velocidade' }, c.velocidade.toFixed(2).replace('.', ','));
  velocidade.addEventListener('input', () => {
    valorVelocidade.textContent = Number(velocidade.value).toFixed(2).replace('.', ',');
  });
  velocidade.addEventListener('change', () => {
    mudarConfig({ velocidade: Number(velocidade.value) });
    void falar({ categoria: 'instrucao', texto: 'Escute e toque a sílaba certa.' });
  });
  const vozes = el('select', { id: 'voz' }) as HTMLSelectElement;
  vozes.append(el('option', { value: '' }, 'AUTOMÁTICA (A MELHOR EM PORTUGUÊS)'));
  for (const v of vozesPortugues()) vozes.append(el('option', { value: v.name }, `${v.name} (${v.lang})${v.localService ? '' : ' — precisa de internet'}`));
  vozes.value = c.voz;
  vozes.addEventListener('change', () => {
    mudarConfig({ voz: vozes.value });
    void falar({ categoria: 'instrucao', texto: 'Escute e toque a sílaba certa.' });
  });
  const animacoes = el('input', { type: 'checkbox', checked: c.animacoes }) as HTMLInputElement;
  animacoes.addEventListener('change', () => mudarConfig({ animacoes: animacoes.checked }));
  const quantidade = el('select', { id: 'quantidade' }) as HTMLSelectElement;
  for (let n = 8; n <= 12; n++) quantidade.append(el('option', { value: n }, `${n} ATIVIDADES`));
  quantidade.value = String(c.atividadesPorSessao);
  quantidade.addEventListener('change', () => mudarConfig({ atividadesPorSessao: Number(quantidade.value) }));
  const demos = el('button', { type: 'button', class: 'botao' }, 'MOSTRAR AS DEMONSTRAÇÕES DE NOVO');
  demos.addEventListener('click', () => {
    esquecerDemonstracoes();
    demos.textContent = 'PRONTO: AS DEMONSTRAÇÕES VÃO APARECER DE NOVO';
  });
  mostrarTela(
    'Configurações',
    topo({ titulo: 'CONFIGURAÇÕES', voltar: '#/professor' }),
    el(
      'div',
      { class: 'professor' },
      grupoDeEscolha<TamanhoTexto>('TAMANHO DO TEXTO', 'tamanho', [['normal', 'NORMAL'], ['grande', 'GRANDE'], ['muito-grande', 'MUITO GRANDE']], c.tamanhoTexto, (v) => mudarConfig({ tamanhoTexto: v })),
      el('label', { class: 'campo', for: 'velocidade' }, el('span', {}, 'VELOCIDADE DA VOZ: ', valorVelocidade, ' (padrão 0,85)'), velocidade),
      grupoDeEscolha('VOGAL E NAS SÍLABAS (PE, LE, TE...)', 'vogalE', [['aberta', 'ABERTA (É): pé, lé, té'], ['fechada', 'FECHADA (Ê): pê, lê, tê']], c.vogalE, (v) => {
        mudarConfig({ vogalE: v });
        exemplo();
      }),
      grupoDeEscolha('VOGAL O NAS SÍLABAS (PO, LO, TO...)', 'vogalO', [['aberta', 'ABERTA (Ó): pó, ló, tó'], ['fechada', 'FECHADA (Ô): pô, lô, tô']], c.vogalO, (v) => {
        mudarConfig({ vogalO: v });
        exemplo();
      }),
      el('label', { class: 'campo', for: 'voz' }, 'VOZ DO APARELHO', vozes),
      el('label', { class: 'campo', for: 'quantidade' }, 'ATIVIDADES POR SESSÃO', quantidade),
      el('fieldset', { class: 'escolha-grupo' }, el('legend', {}, 'ANIMAÇÕES'), el('label', {}, animacoes, 'MOSTRAR ANIMAÇÕES')),
      demos,
    ),
  );
}

// ---------- Progresso do estudante ----------

function telaEstudante(): void {
  const p = progresso();
  const praticadas = Object.keys(p.aulas).length;
  const msg = el('p', { class: 'aviso', 'aria-live': 'polite', hidden: true });
  const apagarBtn = el('button', { type: 'button', class: 'botao' }, icones.lixeira(24), 'APAGAR O PROGRESSO DO ESTUDANTE');
  let confirmar = false;
  apagarBtn.addEventListener('click', () => {
    if (!confirmar) {
      confirmar = true;
      apagarBtn.replaceChildren(icones.lixeira(24), 'TEM CERTEZA? TOQUE DE NOVO PARA APAGAR');
      return;
    }
    zerarProgresso();
    msg.hidden = false;
    msg.textContent = 'PROGRESSO APAGADO. O ESTUDANTE COMEÇA DO ZERO NESTE APARELHO.';
    apagarBtn.disabled = true;
  });
  mostrarTela(
    'Progresso do estudante',
    topo({ titulo: 'PROGRESSO DO ESTUDANTE', voltar: '#/professor' }),
    el(
      'div',
      { class: 'professor' },
      el('p', {}, `Aulas praticadas: ${praticadas}. Sessões feitas: ${p.sessoes}. Itens em revisão: ${Object.keys(p.itens).length}.`),
      el('p', {}, 'Use quando o celular passar para outro estudante ou para começar de novo. As gravações e as configurações não são apagadas.'),
      apagarBtn,
      msg,
    ),
  );
}

// ---------- Trocar PIN ----------

function telaTrocarPin(): void {
  const aviso = el('p', { class: 'aviso', 'aria-live': 'polite', hidden: true });
  const p1 = campoPin('novo1', 'NOVO PIN (4 NÚMEROS)');
  const p2 = campoPin('novo2', 'REPITA O NOVO PIN');
  const form = el('form', { class: 'pin' }, p1.campo, p2.campo, el('button', { type: 'submit', class: 'botao principal' }, 'SALVAR O NOVO PIN'), aviso);
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    aviso.hidden = false;
    if (!/^\d{4}$/.test(p1.entrada.value)) return void (aviso.textContent = 'O PIN TEM 4 NÚMEROS.');
    if (p1.entrada.value !== p2.entrada.value) return void (aviso.textContent = 'OS DOIS PINS ESTÃO DIFERENTES.');
    gravarLocal('pin', await resumo(p1.entrada.value));
    aviso.textContent = 'PIN TROCADO.';
  });
  mostrarTela('Trocar PIN', topo({ titulo: 'TROCAR O PIN', voltar: '#/professor' }), el('div', { class: 'professor' }, form));
}

// ---------- Rotas do modo professor ----------

export function telaProfessor(partes: string[]): void {
  if (!liberado) return telaPin();
  if (gravadorAtivo) {
    gravadorAtivo.cancelar();
    gravadorAtivo = null;
  }
  const [secao, a, b] = partes;
  switch (secao) {
    case 'gravacoes':
      void telaGravacoes(a ?? String(progresso().ultimaAula ?? 'app'), b ?? 'todas');
      return;
    case 'pacote':
      return telaPacote();
    case 'configuracoes':
      return telaConfiguracoes();
    case 'estudante':
      return telaEstudante();
    case 'pin':
      return telaTrocarPin();
    default:
      return telaMenu();
  }
}

/** Usado ao trocar de tela: desliga o microfone do professor, se estiver gravando. */
export function pararGravacaoDoProfessor(): void {
  gravadorAtivo?.cancelar();
  gravadorAtivo = null;
}


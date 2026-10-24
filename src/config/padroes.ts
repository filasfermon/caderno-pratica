// VALORES FIXOS DO APP
//
// O app é igual para todo mundo: não há conta, modo professor nem configuração
// guardada no aparelho. O que antes era configuração agora é um valor fixo aqui.
// Para mudar, troque o valor, salve e publique de novo (o GitHub Pages publica sozinho).

/**
 * Velocidade da voz do celular. 1 = ritmo normal da fala.
 * Valores entre 0.9 e 1.2 soam naturais. Os áudios prontos (public/audio)
 * tocam sempre na velocidade em que foram gravados.
 */
export const VELOCIDADE_DA_VOZ = 1.0;

/**
 * Como a voz do celular lê o E e o O nas sílabas soltas:
 *   'aberta'  → PE = "pé", PO = "pó" (mais perto da fala do Ceará);
 *   'fechada' → PE = "pê", PO = "pô".
 */
export const VOGAL_NAS_SILABAS: 'aberta' | 'fechada' = 'aberta';

/**
 * Atividades de números e dinheiro (conte, contas, pague, troco, o dinheiro dá?,
 * que horas são) nas aulas que as tiverem. false = essas atividades (e as aulas
 * que só têm isso) não aparecem.
 */
export const MOSTRAR_NUMEROS_E_DINHEIRO = true;

/** Quantas atividades cada prática tem (de 8 a 12). */
export const ATIVIDADES_POR_PRATICA = 10;

/**
 * Velocidade do botão da tartaruga (MAIS DEVAGAR), ao lado de cada alto-falante.
 * Toca o mesmo áudio uma vez mais devagar (voz do celular e áudios prontos). Não fica guardado.
 */
export const VELOCIDADE_MAIS_DEVAGAR = 0.8;

/** "Ouça e fale": quanto tempo o app espera o estudante falar, em milissegundos (cerca de 3 s). */
export const PAUSA_PARA_FALAR_MS = 3000;

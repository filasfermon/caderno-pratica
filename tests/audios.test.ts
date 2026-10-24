// Áudios prontos de letras e sílabas (public/audio): nomes de arquivo, quando são usados
// e se toda letra e sílaba do conteúdo tem arquivo ou está na lista para gravar.
import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { arquivoDoItem, NOME_DE_ARQUIVO_VALIDO, nomeDeArquivo } from '../src/audio/arquivos';
import { audiosNecessarios, itensDeLetrasESilabas } from '../src/audio/audios-necessarios';
import { conteudo } from './apoio';

const necessarios = audiosNecessarios(conteudo);

describe('nomes de arquivo', () => {
  it('minúsculas, sem acento; cada acento vira uma palavra no fim', () => {
    expect(nomeDeArquivo('PA')).toBe('pa');
    expect(nomeDeArquivo('LHA')).toBe('lha');
    expect(nomeDeArquivo('PÉ')).toBe('pe-agudo');
    expect(nomeDeArquivo('VÔ')).toBe('vo-circunflexo');
    expect(nomeDeArquivo('PÃO')).toBe('pao-til');
    expect(nomeDeArquivo('ÇA')).toBe('ca-cedilha');
    expect(nomeDeArquivo('Ç')).toBe('c-cedilha');
    expect(nomeDeArquivo('ÇÃO')).toBe('cao-cedilha-til');
  });

  it('a publicação (vite.config.ts) usa a mesma regra de nomes do app', () => {
    expect(readFileSync('vite.config.ts', 'utf8')).toContain(`const NOME_DE_ARQUIVO_VALIDO = ${NOME_DE_ARQUIVO_VALIDO.source.replace(/^/, '/')}/;`);
  });

  it('todo áudio usado tem nome dentro da regra, e nenhum nome se repete', () => {
    const vistos = new Set<string>();
    for (const a of necessarios) {
      expect(a.arquivo.split('/')[1], a.tela).toMatch(NOME_DE_ARQUIVO_VALIDO);
      expect(vistos.has(a.arquivo), a.arquivo).toBe(false);
      vistos.add(a.arquivo);
    }
  });
});

describe('quando o app usa o áudio pronto', () => {
  it('letras e sílabas soltas: sim; palavras, frases, números e instruções: não (voz do celular)', () => {
    expect(arquivoDoItem({ categoria: 'silaba', texto: 'NHO' })).toBe('silabas/nho.mp3');
    expect(arquivoDoItem({ categoria: 'letra', texto: 'P' })).toBe('letras/p.mp3');
    expect(arquivoDoItem({ categoria: 'tecla', texto: 'P' })).toBe('letras/p.mp3');
    expect(arquivoDoItem({ categoria: 'tecla', texto: 'PA' })).toBe('silabas/pa.mp3');
    expect(arquivoDoItem({ categoria: 'tecla', texto: 'CH' })).toBeNull(); // "cê agá": voz do celular
    expect(arquivoDoItem({ categoria: 'letra', texto: 'P p' })).toBeNull();
    expect(arquivoDoItem({ categoria: 'palavra', texto: 'PATO' })).toBeNull();
    expect(arquivoDoItem({ categoria: 'frase', texto: 'O PATO NADA.' })).toBeNull();
    expect(arquivoDoItem({ categoria: 'instrucao', texto: 'Qual é a sílaba?' })).toBeNull();
    expect(arquivoDoItem({ categoria: 'numero', texto: '3' })).toBeNull();
  });

  it('o texto de cada áudio vem da tabela de pronúncia, com a vogal aberta', () => {
    const pe = necessarios.find((a) => a.arquivo === 'silabas/pe.mp3');
    expect(pe?.fala).toBe('pé');
    expect(necessarios.find((a) => a.arquivo === 'letras/p.mp3')?.fala).toBe('pê');
  });
});

describe('toda letra e sílaba do conteúdo tem áudio ou está na lista para gravar', () => {
  const lista = existsSync('AUDIOS_PARA_GRAVAR.md') ? readFileSync('AUDIOS_PARA_GRAVAR.md', 'utf8') : '';
  const naLista = (arquivo: string) => {
    const [pasta, nome] = arquivo.split('/');
    return lista.includes(`| \`${nome}\` | \`public/audio/${pasta}\` |`);
  };

  it('cada áudio usado: arquivo em public/audio ou linha em AUDIOS_PARA_GRAVAR.md (se faltar, rode npm run audios:lista)', () => {
    const faltando = necessarios.filter((a) => !existsSync(`public/audio/${a.arquivo}`) && !naLista(a.arquivo)).map((a) => a.arquivo);
    expect(faltando).toEqual([]);
  });

  it('a lista cobre também as letras e sílabas de outros sorteios das atividades', () => {
    const conhecidos = new Set(necessarios.map((a) => a.arquivo));
    const fora = new Set<string>();
    for (const item of itensDeLetrasESilabas(conteudo, [7, 8])) if (!conhecidos.has(arquivoDoItem(item)!)) fora.add(item.texto);
    expect([...fora]).toEqual([]);
  });

  it('cobre as letras e as sílabas das aulas das vogais e das consoantes', () => {
    for (const f of ['letras/a.mp3', 'letras/e.mp3', 'letras/p.mp3', 'silabas/pa.mp3', 'silabas/lha.mp3', 'silabas/que.mp3']) expect(necessarios.map((a) => a.arquivo)).toContain(f);
  });
});

// Gera AUDIOS_PARA_GRAVAR.md: a lista das letras e sílabas que ainda não têm
// áudio pronto em public/audio, com o nome de arquivo de cada uma.
// Uso: npm run audios:lista   (rode de novo depois de pôr áudios na pasta ou trocar o conteúdo)
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import type { Conteudo } from '../src/conteudo/tipos';
import { audiosNecessarios, type AudioNecessario } from '../src/audio/audios-necessarios';

const raiz = new URL('..', import.meta.url);
const c: Conteudo = JSON.parse(readFileSync(new URL('conteudo_licoes.json', raiz), 'utf8'));
const todos = audiosNecessarios(c);
const existe = (a: AudioNecessario) => existsSync(new URL(`public/audio/${a.arquivo}`, raiz));
const faltam = todos.filter((a) => !existe(a));
const letras = faltam.filter((a) => a.tipo === 'letra');
const silabas = faltam.filter((a) => a.tipo === 'silaba');

const tabela = (lista: AudioNecessario[]) =>
  lista.length === 0
    ? 'Nenhum: todos já têm áudio. ✓\n'
    : ['| Na tela | Como falar | Nome do arquivo | Pasta |', '|---|---|---|---|', ...lista.map((a) => `| **${a.tela}** | ${a.fala} | \`${a.arquivo.split('/')[1]}\` | \`public/audio/${a.arquivo.split('/')[0]}\` |`)].join('\n') + '\n';

const texto = `# Áudios para gravar (letras e sílabas)

O app **já funciona** com a voz do celular. Mas a voz do celular lê mal letras e sílabas
soltas (LHA, NHO, QUE, PE...) e muda de um celular para outro. Cada letra ou sílaba que
ganhar um áudio gravado passa a soar **igual em todos os celulares**, também sem internet.

- Ao todo o app usa **${todos.length} áudios**: ${todos.filter((a) => a.tipo === 'letra').length} letras e ${todos.filter((a) => a.tipo === 'silaba').length} sílabas.
- **Faltam ${faltam.length}** (${letras.length} letras e ${silabas.length} sílabas), listados no fim desta página.
- Pode gravar aos poucos: o que ainda não tiver áudio continua com a voz do celular.

## Como gravar no computador (com o Audacity, que é gratuito)

1. Baixe e instale o **Audacity**: <https://www.audacityteam.org> (Windows, Mac ou Linux).
2. Use um microfone (o do fone de ouvido serve) num lugar **quieto**, a um palmo da boca.
3. Abra o Audacity. Na barra de cima, onde aparecem os canais de gravação, escolha **1 (Mono)**.
4. Clique no botão vermelho **● Gravar**, espere um segundo, fale a sílaba **uma vez**,
   com voz clara e no ritmo normal da conversa, espere um segundo e clique em **■ Parar**.
   Fale como está na coluna **Como falar** (ex.: PE se fala *pé*, com a vogal aberta).
5. **Cortar o silêncio:** com o mouse, selecione só o pedaço da fala (deixe um pouquinho
   de folga antes e depois) e clique em **Editar → Remover especial → Aparar áudio**
   (*Edit → Remove Special → Trim Audio*).
6. **Igualar o volume:** aperte **Ctrl + A** (no Mac, **Cmd + A**) e clique em
   **Efeito → Volume e compressão → Normalizar** (*Effect → Volume and Compression → Normalize*).
   Deixe **-1,0 dB** e clique em **Aplicar**.
7. **Salvar:** clique em **Arquivo → Exportar áudio** (*File → Export Audio*).
   - Formato: **MP3**
   - Canais: **Mono**
   - Modo da taxa de bits: **Constante**, qualidade **64 kbps** (pode ser de 48 a 64)
   - Nome do arquivo: **exatamente** o da coluna *Nome do arquivo* (ex.: \`pa.mp3\`)
8. Faça o mesmo para as outras linhas. Dica: depois de exportar, apague a gravação
   (Ctrl + A e a tecla Delete) e grave a próxima.

## Como pôr os áudios no app

1. No GitHub, abra o repositório e entre na pasta **public/audio/silabas**
   (para as letras, **public/audio/letras**).
2. Clique em **Add file → Upload files**, arraste os arquivos \`.mp3\` e clique em
   **Commit changes** (na branch **main**).
3. A publicação é automática. Em alguns minutos o app já usa os áudios novos.
   Nos celulares aparece **NOVA VERSÃO DISPONÍVEL → ATUALIZAR**.
4. **Para trocar um áudio** (por exemplo, por uma gravação melhor): envie um arquivo com
   **o mesmo nome**. Ele substitui o anterior.

## Regra dos nomes de arquivo

- Tudo em **minúsculas** e **sem acento**: PA → \`pa.mp3\`, LHA → \`lha.mp3\`.
- Cada acento vira uma palavra no fim, depois de um tracinho: **agudo** (´), **circunflexo** (^),
  **til** (~), **crase** (\`), **cedilha** (ç).
  Exemplos: PÉ → \`pe-agudo.mp3\` · VÔ → \`vo-circunflexo.mp3\` · PÃO → \`pao-til.mp3\` ·
  ÇA → \`ca-cedilha.mp3\` · Ç (letra) → \`c-cedilha.mp3\`.
- **Letras** vão em \`public/audio/letras\` e são ditas **pelo nome** (P → *pê*).
  **Sílabas** vão em \`public/audio/silabas\`.
- Um arquivo com nome fora da regra é ignorado (a voz do celular continua falando).

## Letras que faltam (${letras.length})

${tabela(letras)}
## Sílabas que faltam (${silabas.length})

${tabela(silabas)}
---
Esta lista é feita pelo comando \`npm run audios:lista\` (quem cuida do código roda de novo
depois de pôr áudios na pasta ou de trocar o \`conteudo_licoes.json\`).
`;

writeFileSync(new URL('AUDIOS_PARA_GRAVAR.md', raiz), texto);
console.log(`AUDIOS_PARA_GRAVAR.md: faltam ${faltam.length} de ${todos.length} áudios (${letras.length} letras, ${silabas.length} sílabas).`);

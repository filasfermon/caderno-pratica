# Caderno Prática

Aplicativo para **revisar e reforçar** as aulas do *Caderno de Alfabetização · Volume 1*.
O estudante estuda a aula no caderno com o professor e, depois, pratica **a mesma aula**
sozinho, no celular. Tudo é falado em voz alta. Funciona **sem internet** depois da
primeira vez.

**O app é igual para qualquer pessoa: abre o link e usa.**

- **Sem conta, sem cadastro, sem senha** e sem modo professor.
- **Não guarda nenhum dado no aparelho**: nem progresso, nem nome, nem configuração,
  nem gravação. Não usa `localStorage`, `sessionStorage`, IndexedDB nem cookies.
- **Nunca pede o microfone** e não grava nada.
- A única coisa guardada no celular é o **cache dos arquivos do próprio app** (do service
  worker), para ele abrir sem internet. Esse cache é igual para todo mundo e não tem
  dado de ninguém.
- Sem anúncios e sem coleta de dados.
- Tamanho: **0,41 MB** sem os áudios de letras e sílabas (veja a seção 4).

---

## 1. Endereço e instalação no celular

**Endereço do app:** <https://filasfermon.github.io/caderno-pratica/> (GitHub Pages,
publicado sozinho a cada mudança na branch `main`).

Também está pronto para a **Cloudflare Pages** (opcional, endereço como
`https://caderno-pratica.pages.dev`). O passo a passo, para quem não é programador, está em
[`PUBLICAR_NA_CLOUDFLARE.md`](PUBLICAR_NA_CLOUDFLARE.md).

**Instalar no Android (Chrome):**

1. Abra o endereço acima no **Chrome**, com internet.
2. Espere a tela **ESCOLHER A AULA** aparecer (o app se guarda sozinho no celular).
3. Toque nos **três pontinhos ⋮** no canto de cima.
4. Toque em **"Instalar app"** (ou **"Adicionar à tela inicial"**).
5. Confirme. O ícone laranja **"Caderno Prática"** aparece na tela do celular.

**Instalar no iPhone (Safari):** abra o endereço no **Safari** → botão **Compartilhar**
(quadrado com seta para cima) → **Adicionar à Tela de Início** → **Adicionar**.

Pronto: a partir daí o app abre mesmo sem internet.

> Dica: se aparecer na parte de baixo a faixa **"NOVA VERSÃO DISPONÍVEL"**,
> toque em **ATUALIZAR** (precisa de internet só nesse momento).

---

## 2. Como o estudante usa (5 passos)

1. **Toque no ícone laranja.** O app abre direto em **ESCOLHER A AULA**, em letras grandes.
2. **Escolha a aula**: toque na **Parte**, depois na **Unidade** e na **Aula** — ou digite o
   número da aula que está no caderno e toque em **IR**. Qualquer aula abre, mesmo sem ter
   feito as anteriores.
3. **Escute a voz** e toque em **SÓ ESTA AULA** (o normal) ou **ESTA AULA + REVISÃO**.
4. **Faça as atividades**, uma por tela. Depois de um acerto, a próxima começa sozinha.
   - As **bolinhas** no alto levam a qualquer atividade (a atual é maior; as feitas têm ✓).
   - **◀ VOLTAR** e **AVANÇAR ▶** andam uma de cada vez. Pular não conta como erro.
   - O **alto-falante** 🔊 repete a fala; a **tartaruga** 🐢 repete a mesma fala uma vez mais devagar.
   - O que o estudante **errar volta uma vez no fim** da mesma prática (com o selo **DE NOVO**).
5. Toque em **TERMINAR** quando quiser. A tela final mostra quantas atividades foram feitas.
   Ao sair, **nada fica guardado**.

Quando o estudante erra, o app **não diz "errado"**: a voz diz *"Vamos tentar de novo"*
e repete o modelo. Se errar de novo, o app mostra a resposta certa, lê em voz alta e segue.
Não há cronômetro, pontos, vidas nem ranking.

**Ouça e fale** (letras, sílabas e palavras): o app fala o modelo; a tela mostra
**AGORA FALE VOCÊ** por cerca de 3 segundos (um aviso calmo, sem números); o app fala o
modelo de novo, para o estudante comparar de ouvido. Depois: **OUVIR DE NOVO** e **SEGUIR**.
Nada é gravado.

---

## 3. Privacidade: o que o app não faz

| O app… | Como é garantido |
|---|---|
| não tem conta, login, cadastro nem modo professor | não há essas telas no código |
| não guarda progresso, histórico nem configuração | o código não usa `localStorage`, `sessionStorage`, IndexedDB nem cookies (teste `tests/hospedagem.test.ts`) |
| nunca pede o microfone | o código não usa `getUserMedia` nem `MediaRecorder`; na Cloudflare, o cabeçalho `Permissions-Policy: microphone=()` bloqueia o microfone |
| não fala com outros sites | a política de segurança (CSP) só libera o próprio site |
| não deixa dado para trás | ao abrir, apaga o que sobrou de versões antigas do app (progresso, PIN, gravações), só as chaves deste app |

O teste de ponta a ponta `e2e/privacidade.spec.ts` percorre a tela inicial, a escolha da
aula e uma prática inteira e confere, no fim, que `localStorage`, `sessionStorage`,
IndexedDB e cookies estão **vazios** e que o app **nunca pediu o microfone**.

---

## 4. Áudios de letras e sílabas

A voz do celular lê bem palavras e frases, mas lê mal **letras e sílabas soltas**
(LHA, NHO, QUE, GUE, PE...) e muda de um celular para outro. Por isso o app aceita
**áudios prontos**, iguais em todos os celulares:

- `public/audio/letras/NOME.mp3` — a letra dita **pelo nome** (P → *pê*);
- `public/audio/silabas/NOME.mp3` — a sílaba (PA → *pá*, com a vogal aberta).

**Ordem de uso no app:**

- letras e sílabas: o **áudio pronto**; se faltar algum (ou se ele falhar), a **voz do celular**;
- palavras, frases, números e instruções: sempre a **voz do celular**.

Os áudios entram no cache do app (funcionam **sem internet**). A lista dos que existem
(`audio/lista.json`) é montada **sozinha** na publicação: basta pôr o arquivo na pasta.

### De onde vêm os áudios (voz e licença)

**Ainda não há áudios na pasta: ficou a lista para gravar.** A ideia era gerar os 300
áudios (37 letras e 263 sílabas) uma vez, com uma voz neural em português do Brasil que
rode sem internet (como o Piper). Mas o ambiente em que este trabalho foi feito **não
consegue baixar as vozes**: a rede bloqueia o Hugging Face e o GitHub Releases, que é de
onde vêm os modelos de voz, e nenhum pacote do npm ou do PyPI traz uma voz pt-BR dentro.
Sem poder baixar a voz, também não foi possível **conferir a licença** dela.

Por isso, como pedido, **não foi usada nenhuma voz robótica**. Ficou pronto:

- a estrutura do app (pastas, lista automática, cache, ordem de uso, testes);
- o arquivo [`AUDIOS_PARA_GRAVAR.md`](AUDIOS_PARA_GRAVAR.md), com **todas as letras e
  sílabas**, o nome de arquivo de cada uma, como falar cada uma e o passo a passo para
  gravar no computador com o **Audacity** (gratuito) e pôr os arquivos na pasta;
- enquanto isso, o app funciona normalmente com a voz do celular.

Se no futuro os áudios forem gerados com uma voz sintética, registre aqui o nome da voz e
a licença (só use uma voz cuja licença permita uso e distribuição gratuitos, e nunca um
serviço online cujos termos proíbam esse uso). Gravações humanas feitas pela equipe não
têm esse problema.

### Como trocar um áudio (por exemplo, por uma gravação humana)

Basta **substituir o arquivo na pasta** por outro com **o mesmo nome**:

1. Grave e salve em **MP3 mono, de 48 a 64 kbps**, com o silêncio do começo e do fim
   cortado e o volume igualado (o passo a passo com o Audacity está em
   [`AUDIOS_PARA_GRAVAR.md`](AUDIOS_PARA_GRAVAR.md)).
2. No GitHub, abra `public/audio/silabas` (ou `public/audio/letras`), clique em
   **Add file → Upload files**, envie o arquivo e clique em **Commit changes**.
3. A publicação é automática; nos celulares aparece **NOVA VERSÃO DISPONÍVEL → ATUALIZAR**.

### Regra dos nomes de arquivo

- Tudo em **minúsculas** e **sem acento**: PA → `pa.mp3`, LHA → `lha.mp3`, QUE → `que.mp3`.
- Cada acento vira uma palavra no fim, depois de um tracinho, na ordem em que aparece:
  **agudo** (´), **circunflexo** (^), **til** (~), **crase** (\`), **cedilha** (ç).
  Exemplos: PÉ → `pe-agudo.mp3` · VÔ → `vo-circunflexo.mp3` · PÃO → `pao-til.mp3` ·
  ÇA → `ca-cedilha.mp3` · Ç (letra) → `c-cedilha.mp3`.
- Um arquivo com nome fora da regra é ignorado (a publicação avisa e a voz do celular continua).

### Para quem cuida do código

- `npm run audios:lista` — refaz o `AUDIOS_PARA_GRAVAR.md` (rode depois de pôr áudios na
  pasta ou de trocar o `conteudo_licoes.json`).
- `npm run audios:preparar -- PASTA` — converte gravações em qualquer formato (WAV, M4A...)
  que estejam em `PASTA/letras` e `PASTA/silabas`: corta o silêncio, iguala o volume e salva
  em MP3 mono de 56 kbps em `public/audio` (precisa do **ffmpeg**).
- Os testes conferem que **toda letra e sílaba do conteúdo** tem o arquivo ou está na lista
  para gravar. Se um conteúdo novo trouxer sílabas novas, a publicação para com esse aviso:
  rode `npm run audios:lista` e envie de novo.

---

## 5. Valores fixos e lista de exclusão

Não há configurações no app. O que antes era configuração do professor agora é um
**valor fixo** no arquivo comentado **`src/config/padroes.ts`**:

| Valor | Padrão | O que faz |
|---|---|---|
| `VELOCIDADE_DA_VOZ` | `1.0` | velocidade da voz do celular (ritmo normal) |
| `VOGAL_NAS_SILABAS` | `'aberta'` | PE = *pé*, PO = *pó* (ou `'fechada'`: *pê*, *pô*) |
| `MOSTRAR_NUMEROS_E_DINHEIRO` | `true` | atividades de números e dinheiro nas aulas que as tiverem |
| `ATIVIDADES_POR_PRATICA` | `10` | atividades em cada prática (de 8 a 12) |
| `VELOCIDADE_MAIS_DEVAGAR` | `0.8` | velocidade do botão da tartaruga |
| `PAUSA_PARA_FALAR_MS` | `3000` | quanto tempo o "Ouça e fale" espera o estudante falar |

Para mudar, troque o valor, salve e publique de novo.

As aulas que **não aparecem** no app (caligrafia e coordenação motora) ficam na lista de
exclusão comentada **`src/config/aulas_excluidas.ts`** (`PARTES_EXCLUIDAS` e `AULAS_EXCLUIDAS`).
Hoje ela tira a **Parte 1 inteira**. Aulas sem nenhuma atividade de ouvir, ler ou falar
também somem sozinhas.

---

## 6. Como atualizar o conteúdo (trocar o `conteudo_licoes.json`)

Todo o conteúdo do app (aulas, páginas, sílabas, palavras, frases, contas...) vem do
arquivo **`conteudo_licoes.json`**, na raiz deste repositório. Nada está fixo no código.

Para uma versão nova do caderno (por exemplo, com outra numeração de páginas):

1. No GitHub, abra o repositório, clique em `conteudo_licoes.json` e no lápis ✏ (editar),
   ou use **Add file → Upload files** e envie o arquivo novo **com o mesmo nome**.
2. Salve (**Commit changes**) na branch **main**.
3. A publicação roda sozinha (aba **Actions**). Em poucos minutos o app novo está no ar.
4. Nos celulares, aparece **"NOVA VERSÃO DISPONÍVEL" → ATUALIZAR**.

Se o conteúdo novo trouxer **sílabas novas**, os testes automáticos avisam (a publicação
para com a mensagem *"toda sílaba do conteúdo tem entrada"*). Quem cuida do código roda
`npm run pronuncia` para acrescentar as sílabas novas à tabela de pronúncia
(nada do que já foi corrigido à mão é apagado) e envia de novo.

### A tabela de pronúncia

Fica em `src/dados/pronuncia.json` e explica a si mesma (campo `_leia_me`). É usada pela
voz do celular e diz como falar cada letra e sílaba (também na lista de áudios para gravar):

- `silabas`: `"PA": "pá"` → a tela mostra **PA**, a voz lê *pá*. Sílabas com E ou O
  têm as duas formas: `{"aberta": "pé", "fechada": "pê"}` (o app usa a aberta).
- `letras`: `"nome"` (lido nas teclas e no "Ouça e fale": *pê*) e `"fala"` (lido pela voz do
  celular quando a letra aparece sozinha: *pê, de pai*). O áudio pronto da letra é só o nome.
- `palavras`: siglas e palavras que a voz lê mal (`"IFCE": "í éfe cê é"`).

---

## 7. Para quem cuida do código

Pilha: **Vite + TypeScript** (sem framework e **sem nenhuma dependência** no app publicado),
PWA com `vite-plugin-pwa`. O código está comentado em português.

```bash
npm install            # instala as ferramentas
npm run dev            # abre o app em modo de desenvolvimento (http://localhost:5173)
npm test               # Vitest: progressão, exclusões, atividades, voz, áudios, hospedagem
npm run test:e2e       # Playwright: sem internet, privacidade, navegação, voz, áudios...
npm run build          # gera o site na pasta dist/
npm run audios:lista   # refaz o AUDIOS_PARA_GRAVAR.md
npm run audios:preparar -- PASTA   # converte gravações para public/audio (precisa do ffmpeg)
npm run pronuncia      # completa a tabela de pronúncia com sílabas novas do conteúdo
npm run relatorio      # lista o que do conteúdo não aparece por causa da regra de progressão
npm run icones         # gera de novo os ícones PNG
```

Mapa rápido:

| Pasta / arquivo | O que tem |
|---|---|
| `src/config/padroes.ts` | **valores fixos** (voz, vogal, números e dinheiro...) |
| `src/config/aulas_excluidas.ts` | **lista de exclusão** (partes e aulas que não aparecem) |
| `src/conteudo/progressao.ts` | **validador da regra de progressão** |
| `src/conteudo/silabas.ts` | divisão silábica |
| `src/atividades/gerar.ts` | geração das 21 atividades a partir de cada aula |
| `src/atividades/disponiveis.ts` | quais aulas e atividades aparecem |
| `src/atividades/sessao.ts` | a prática (só esta aula, ou 70% aula + 30% revisão sorteada) |
| `src/atividades/rotulos.ts` | instruções curtas faladas |
| `src/audio/voz.ts` | a voz: áudio pronto (letras e sílabas) ou voz do celular |
| `src/audio/arquivos.ts` | áudios prontos: regra dos nomes e quando são usados |
| `src/atividades/telas/` | telas das atividades |
| `src/telas/` | escolher a aula (tela inicial) e aula/prática |
| `src/dados/apagar-antigos.ts` | apaga dados de versões antigas do app |
| `public/_headers` | cabeçalhos de segurança e cache (Cloudflare) |
| `public/audio/` | áudios prontos de letras e sílabas |
| `.github/workflows/publicar.yml` | publicação no GitHub Pages |

O caminho do site é a variável `BASE_PATH` (padrão `/`, usado na Cloudflare e no computador).
No GitHub Pages (`/NOME-DO-REPOSITORIO/`) ele é preenchido sozinho pelo workflow.

---

## 8. Decisões tomadas

Quando o pedido não definia algo, escolhi o mais simples e confiável.

### Simplificação (app igual para todos, sem registro de dados)

- **A tela inicial é a própria escolha da aula** (título ESCOLHER A AULA em letras grandes,
  alto-falante e tartaruga, busca pelo número e as Partes). Assim o estudante chega à aula
  com um toque a menos. Endereços antigos (`#/progresso`, `#/professor`, `#/escolher`) levam
  para ela.
- **Dados de versões antigas são apagados ao abrir** (progresso, PIN, configurações e
  gravações), para não ficar registro de ninguém. Só as chaves `caderno-pratica:` e o banco
  `caderno-pratica` são apagados: no GitHub Pages, outros sites do mesmo endereço podem usar
  o mesmo armazenamento.
- **Demonstração:** aparece na primeira vez de cada tipo de atividade desde que o app foi
  aberto (fica só na memória). Se o estudante tocar **PULAR** antes de a instrução ser dita,
  a instrução é dita em seguida.
- **Valores que eram configuração** (tamanho do texto, voz escolhida, animações) ficaram
  fixos: texto normal (com letras grandes nas telas principais), a melhor voz pt-BR do
  celular, e animações que seguem o "reduzir movimento" do próprio celular.
- **Erros que voltam no fim:** voltam uma vez, iguais (mesmas opções), com o selo **DE NOVO**.
  Errar de novo na volta não faz voltar outra vez. Errar um par no "Ligue" também conta.
- **Revisão (ESTA AULA + REVISÃO):** cerca de 30% da prática é sorteada das 15 aulas
  anteriores mais próximas que têm atividades, sem memória de erros.
- **Ouça e fale:** existe para as letras (ditas pelo nome), as sílabas e até 4 palavras
  simples de cada aula; no máximo 2 por prática (nas aulas do começo, com pouco conteúdo,
  pode haver mais); nas aulas das vogais e "Aprenda", o da letra vem primeiro. **OUVIR DE
  NOVO** repete a volta inteira (ouça, fale você, ouça de novo). O aviso AGORA FALE VOCÊ é
  só visual (um balão de fala que "respira", sem números), como pedido.
- **Mais devagar (tartaruga):** ao lado de todo alto-falante (instrução da tela, OUVIR DE
  NOVO das atividades). Toca a mesma fala uma vez a 0,8: na voz do celular muda a velocidade
  da fala; no áudio pronto, a velocidade do arquivo (o tom da voz é mantido).
- **Áudio pronto tocado da memória:** cada arquivo é lido inteiro (do cache, sem internet) e
  tocado da memória, porque o iPhone não toca áudio "aos pedaços" direto do cache do app.
  Nada disso é guardado.
- **Letra no áudio pronto = só o nome** ("pê"); a voz do celular, sem o arquivo, continua
  dizendo o nome com um exemplo ("pê, de pai") quando a letra aparece sozinha.

### Decisões anteriores (continuam valendo)

**Conteúdo e progressão**
- O validador confere **tudo o que aparece escrito na atividade**: sílabas, palavras,
  frases, opções erradas (distratores), teclas, contas, preços. O que não passa **não é mostrado**.
- A regra vale para o **conteúdo de leitura**. Os textos da interface (VOLTAR, AVANÇAR,
  as instruções, "PREÇO", "SEM VALOR" nas notas) não seguem a progressão, porque são
  **sempre lidos em voz alta** e acompanhados de ícones — como os comandos do caderno, que o professor lê.
- Botões **SIM / NÃO** do "O dinheiro dá?" só mostram as palavras quando elas já foram
  ensinadas; antes disso, aparecem só os desenhos de mão para cima / mão para baixo (e a voz explica).
- Palavras de leitura global (como HOJE antes do H) **aparecem para ler**, mas **não** entram
  na atividade de escrever letra por letra enquanto as letras não forem ensinadas.
- Até a Parte 5 tudo fica em MAIÚSCULAS, **menos nas aulas de minúsculas** ("AS MESMAS LETRAS"),
  em que o texto fica como no caderno (é o assunto da aula), e na atividade Maiúscula/minúscula.
- Os distratores vêm do próprio conteúdo (sílabas e palavras desta aula e das anteriores),
  preferindo a mesma família (PA → PE, PO).
- "Complete a frase" com resposta `null`: vale a opção que deixa a frase igual a uma
  frase dos textos da aula; se nenhuma deixar, o item não é usado (veja a seção 7).
- Os pares do "Ligue" são descobertos sozinhos (iguais; maiúscula ↔ minúscula; palavra ↔ "LU + PA";
  número ↔ preço). Os 21 itens "ligar" do caderno foram todos ligados certo.
- **Aulas sem atividade de reconhecimento** (e as da lista de exclusão) **não aparecem**
  na lista nem na revisão. Se alguém abrir uma delas pelo número, o app
  diz: *"Esta aula é feita só no caderno, com o professor. Escolha outra aula para praticar."*
- Aulas com pouco conteúdo no começo do caderno (aulas 8 a 10, só vogais) repetem as
  atividades de responder para completar a prática (as de só ouvir, ler e falar não se repetem).

**Atividades**
- Nas atividades de **escolher** (escute e toque, complete...), as opções **não falam** ao
  serem tocadas (falar entregaria a resposta); há sempre o botão **OUVIR DE NOVO**.
  Em todas as outras telas, sílabas, palavras e frases tocadas são lidas.
- "Quantas sílabas?": o estudante escolhe **1, 2, 3 ou 4** (só palavras de até 4 sílabas).
- "Escreva a palavra": nas Partes 3 (Unidades 5 a 7) as teclas são **sílabas**; da Parte 4
  em diante, **letras** — só as letras da palavra mais algumas já ensinadas (8 a 12 teclas),
  em ordem alfabética, para caber grande na tela. **ÃO** é uma tecla só. Itens de ditado
  com mais de uma palavra ("O PAI LEU") não entram na escrita.
- "Ligue": em cada item, depois de 2 tentativas erradas, o app mostra o par certo.
- "Pague com notas": qualquer combinação certa vale; o total juntado aparece na tela.
- "Troco": as moedas e notas aparecem uma a uma, **contando a partir do preço** até o
  valor pago (como no caixa). Os valores vêm das contas de diminuir com R$ do caderno.
- "O dinheiro dá?": como o caderno não traz "dinheiro na mão", o app usa o preço de
  **outro produto da mesma aula** como dinheiro na mão (valores do próprio conteúdo).
- "Conte": acima de 20, as dezenas aparecem em "pacotes de 10".
- Demonstração animada (uma mão que toca na resposta) na **primeira vez** de cada tipo
  de atividade **desde que o app foi aberto**, com a faixa **VEJA COMO SE FAZ** (expressão
  do caderno) e botão **PULAR**. Como nada é guardado, ela volta quando o app é aberto de novo.

**Voz**
- Vogal **aberta** (pé, pó) nas sílabas, mais próxima da fala do Ceará (`src/config/padroes.ts`).
- O texto mandado para a voz vai sempre em minúsculas (a voz às vezes soletra palavras em MAIÚSCULAS).
- Instruções curtas ("Escute e toque a letra.", "Qual é a sílaba?", "Forme a palavra.");
  a instrução não se repete em atividades seguidas do mesmo tipo; no máximo 250 ms entre falas.

**Outros**
- Os endereços usam `#` (ex.: `#/aula/23`), que funcionam no GitHub Pages e sem internet.

---

## 9. O que falta no conteúdo (conferência do `conteudo_licoes.json`)

O `conteudo_licoes.json` **não foi alterado** (ele será substituído no futuro).
Li o arquivo inteiro e conferi se tudo o que o app precisa tem de onde sair:

- **Aulas que não aparecem no app:**
  - aulas 1 a 6 (Parte 1, pela lista de exclusão);
  - sem atividade de reconhecimento: 7, 12, 20, 35, 55, 57, 58, 82, 136, 145, 150.
  - Se `MOSTRAR_NUMEROS_E_DINHEIRO` for `false` (em `src/config/padroes.ts`), somem também:
    17, 32, 46, 47, 53, 54, 67, 68, 81, 88, 97, 106, 117, 126, 140, 144 (só têm números,
    contas, dinheiro ou horas).
  - A aula 7 traz as vogais **antes** de elas aparecerem em `letras_conhecidas` — pela regra
    de progressão, o app não as mostra nessa aula (as vogais aparecem a partir da aula 8).
  - Aula 82 ("O troco") e aula 145 ("A conta de luz") **não têm contas nem dados**.
    O troco é praticado com as contas de diminuir com R$ das aulas 81, 88, 140 e 144.
- **Não existe campo "dinheiro na mão"** para "O dinheiro dá?" (veja as decisões).
- **Produtos** só nas aulas 54, 88 e 106; **horas** só na aula 97 (4 horários).
- **"Complete a frase" sem resposta e sem frase igual nos textos** (não usados):
  aula 51 "____ PANO."; aula 52 "EU LEVO A ____ ."; aula 86 "EU VOU ____ RIO.";
  aula 89 "A ____ DA AULA."; aula 135 "NO SÁBADO, EU TOMO ____ ." e "NO ____ TEM ARROZ.";
  aula 138 "Eu trabalho no IFCE ____" e "Que alegria ____".
  Para usá-los, basta preencher `"resposta"` no JSON.
- A **Parte 6** quase não tem sílabas e palavras soltas; as sessões dela são feitas de
  textos (Leia, Ordene), contas e revisão.
- `letras_conhecidas` a partir da aula 124 começa com uma vírgula (`",ABC..."`); o app ignora.
- Todas as contas do JSON foram recalculadas pelos testes e **estão certas**.
- Todas as divisões silábicas do caderno (campo `formar` e os `"LU + PA"`) batem com o silabador do app.

---

## 10. O que falta fazer

1. **Juntar este trabalho na `main`** (aceitar o *pull request* da branch
   `claude/determined-brown-2nhf40`). O GitHub Pages publica sozinho.
2. **Áudios de letras e sílabas:** gravar os que estão em
   [`AUDIOS_PARA_GRAVAR.md`](AUDIOS_PARA_GRAVAR.md) (pode ser aos poucos) e pôr na pasta.
3. **(Opcional) Cloudflare Pages:** seguir [`PUBLICAR_NA_CLOUDFLARE.md`](PUBLICAR_NA_CLOUDFLARE.md).

### O que testar no celular (Android/Chrome e iPhone/Safari, com o app instalado)

1. O app abre direto em **ESCOLHER A AULA**, sem pedir conta nem nada.
2. Abra uma aula pela busca (ex.: **23**) e outra por Parte → Unidade → Aula.
3. Numa prática: as bolinhas, **VOLTAR**, **AVANÇAR** e **TERMINAR**; erre uma atividade e
   confira que ela volta no fim com o selo **DE NOVO**.
4. **Ouça e fale:** o app fala, mostra **AGORA FALE VOCÊ** por uns 3 segundos, fala de novo;
   depois **OUVIR DE NOVO** e **SEGUIR**. O celular **nunca** pergunta sobre o microfone.
5. **Tartaruga:** toca a mesma fala mais devagar; o alto-falante seguinte volta ao normal.
6. **Modo avião:** feche e abra o app pelo ícone; tudo funciona.
7. Feche o app e abra de novo: ele começa do zero (nada foi guardado).
8. Depois de pôr áudios de sílabas na pasta: as sílabas soam iguais nos dois celulares,
   também no modo avião.

---

## 11. Limitações conhecidas

- **Sem áudios prontos ainda:** até as letras e sílabas serem gravadas, elas são lidas pela
  voz do celular, que pode soar estranha em sílabas soltas (LHA, NHA, QUE...) e muda de um
  celular para outro.
- A qualidade da voz depende do celular. Se o celular não tiver voz em português, o app
  funciona em silêncio (os áudios prontos, quando existirem, tocam mesmo assim).
  (No Android: Configurações → Idioma → Saída de texto para fala → Google → instalar *Português (Brasil)*.)
- O botão da tartaruga depende da voz do celular aceitar a velocidade 0,8; algumas vozes
  mudam pouco a velocidade.
- O destaque palavra por palavra (karaokê) usa os avisos da própria voz; quando o celular
  não manda esses avisos, o destaque segue pelo relógio e pode ficar um pouco adiantado ou atrasado.
- **Nada é lembrado:** ao fechar o app, a prática recomeça do zero (é o combinado). O
  professor acompanha o progresso no caderno.
- A demonstração volta a aparecer cada vez que o app é aberto (não há como lembrar sem
  guardar dados); o botão **PULAR** encerra na hora.
- Os testes automáticos rodam no Chromium; **o Safari (iPhone) não foi testado
  automaticamente** neste ambiente. Confira no iPhone o roteiro da seção 10.
- O histórico de commits foi organizado por etapa, por correção e por parte.

---

## 12. Testes e notas de qualidade

| Verificação | Resultado |
|---|---|
| Vitest (9 arquivos, 69 testes) | ✅ todos passam |
| — validador de progressão em **todas** as atividades de **todas** as aulas e nas práticas com revisão | ✅ 0 problemas |
| — exclusões, tipos obrigatórios, "Ouça e fale", práticas de 8 a 12, revisão sem memória | ✅ |
| — áudios: regra dos nomes, quando o arquivo é usado, toda letra e sílaba tem arquivo ou está na lista | ✅ |
| — hospedagem e privacidade: sem armazenamento, cookies, microfone ou dependências; `_headers` | ✅ |
| Playwright (12 testes): aula 23 inteira **sem internet**; **privacidade** (armazenamentos e cookies vazios, microfone nunca pedido); bolinhas, VOLTAR/AVANÇAR, refazer e TERMINAR; voz a 1,0 sem pausas longas; acesso livre e SÓ ESTA AULA; áudio pronto no lugar da voz do celular e volta para a voz do celular se o arquivo falhar; "Ouça e fale"; tartaruga a 0,8; erro que volta no fim; tela inicial em letras grandes; demonstração e retorno gentil ao erro | ✅ todos passam |
| Lighthouse 11 (celular): início, Parte, Unidade, aula 23, aula indisponível | **PWA 100 · Acessibilidade 100 · Boas práticas 100 · Desempenho 100** |
| axe-core (WCAG 2 A/AA) em 52 telas: início, escolhas, aula indisponível, os 21 tipos de atividade (antes e depois de responder), demonstração, erro, AGORA FALE VOCÊ, resposta dada, DE NOVO, fim | ✅ 0 violações |
| Tamanho do app publicado | **0,41 MB** sem os áudios; com os 300 áudios, estimativa de **1,3 a 1,9 MB** (cerca de 3 a 5 KB por letra ou sílaba em MP3 de 56 kbps) |

Telas testadas em 360 × 640 (Android pequeno), em retrato.

---

## Créditos

- Fonte **Atkinson Hyperlegible** (Braille Institute), licença SIL Open Font License 1.1
  (`src/fontes/LICENCA-OFL.txt`).
- Atividades inspiradas no modelo do aplicativo Silabando, adaptadas para adultos.

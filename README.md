# Caderno Prática

Aplicativo para **revisar e reforçar** as aulas do *Caderno de Alfabetização · Volume 1*.
O estudante estuda a aula no caderno com o professor e, depois, pratica **a mesma aula**
sozinho, em casa, no celular. Tudo é falado em voz alta. Funciona **sem internet**
depois da primeira vez.

- Sem senha do estudante, sem anúncios, sem coleta de dados.
- Sem conta, tudo fica guardado só no celular. Quem quiser pode **entrar com a conta
  Google**: o progresso fica guardado na conta e aparece em qualquer celular
  (as gravações de voz continuam só no celular e no pacote .zip).
- Tamanho: menos de 0,5 MB (sem os áudios gravados; com a conta Google ligada, cerca de 1,1 MB).

> **Novidades (6 correções):** só atividades de ouvir, ler e falar · voz em ritmo natural ·
> bolinhas que navegam (VOLTAR, AVANÇAR, TERMINAR) · qualquer aula abre livremente ·
> gravação de voz confiável · ENTRAR COM GOOGLE e publicação na Cloudflare.
> Detalhes na seção 6.

---

## 1. Endereço e instalação no celular

**Endereço do app:** <https://filasfermon.github.io/caderno-pratica/> (GitHub Pages, sem conta Google).
Com a Cloudflare configurada, o endereço principal passa a ser o da Cloudflare
(ex.: `https://caderno-pratica.pages.dev`), com **ENTRAR COM GOOGLE** — veja
[`CONFIGURAR_FIREBASE_E_CLOUDFLARE.md`](CONFIGURAR_FIREBASE_E_CLOUDFLARE.md).

**Instalar no Android (Chrome):**

1. Abra o endereço acima no **Chrome**, com internet.
2. Espere a tela inicial aparecer (o app se guarda sozinho no celular).
3. Toque nos **três pontinhos ⋮** no canto de cima.
4. Toque em **"Adicionar à tela inicial"** (ou **"Instalar app"**).
5. Confirme. O ícone laranja **"Caderno Prática"** aparece na tela do celular.

Pronto: a partir daí o app abre mesmo sem internet.

**Instalar no iPhone (Safari):** abra o endereço no **Safari** → botão **Compartilhar**
(quadrado com seta para cima) → **Adicionar à Tela de Início** → **Adicionar**.

> Dica: se aparecer na parte de baixo a faixa **"NOVA VERSÃO DISPONÍVEL"**,
> toque em **ATUALIZAR** (precisa de internet só nesse momento).

---

## 2. Como o estudante usa (5 passos)

1. **Toque no ícone laranja** do Caderno Prática. Na primeira vez (se a conta Google
   estiver configurada), escolha **ENTRAR COM GOOGLE** ou **ENTRAR SEM CONTA**.
2. **Toque em CONTINUAR** para voltar à última aula. Ou toque em **ESCOLHER A AULA**
   e procure o número da aula que está no caderno (dá para digitar só o número).
   **Qualquer aula abre**, mesmo sem ter feito as anteriores.
3. **Escute a voz** e escolha **SÓ ESTA AULA** (o normal) ou **ESTA AULA + REVISÃO**.
   O botão laranja com alto-falante 🔊 repete a fala.
4. **Faça as atividades**, uma por tela. Depois de um acerto, a próxima começa sozinha.
   As **bolinhas** no alto levam a qualquer atividade (a atual é maior; as feitas têm ✓).
   **◀ VOLTAR** e **AVANÇAR ▶** andam uma de cada vez. Pular não conta como erro.
5. Toque em **TERMINAR** quando quiser. A tela final mostra quantas atividades foram feitas.
   Em **MEU PROGRESSO**, o estudante mostra ao professor as aulas que já praticou (✓).

Quando o estudante erra, o app **não diz "errado"**: a voz diz *"Vamos tentar de novo"*
e repete o modelo. Se errar de novo, o app mostra a resposta certa, lê em voz alta e segue.
Não há cronômetro, pontos, vidas nem ranking.

---

## 3. O professor: gravar a própria voz e passar para os celulares

O app fala com a voz do celular. Ela é boa para palavras e frases, mas às vezes
erra sílabas soltas. Por isso o professor pode **gravar a própria voz uma vez** e
**passar o pacote de áudios** para os celulares dos estudantes.

### Entrar no modo professor

1. Na tela inicial, toque na **engrenagem ⚙** (canto de cima).
2. Na primeira vez, **crie um PIN de 4 números** (anote em lugar seguro).
   Nas outras vezes, digite o PIN.

### Gravar

1. Toque em **GRAVAÇÕES E PRONÚNCIA**.
2. Escolha a **AULA** (e, se quiser, só **SÍLABAS E LETRAS**, **PALAVRAS** ou **FRASES**).
   A primeira opção da lista traz as **instruções e frases do app** ("Escute e toque a letra.", "Muito bem"...).
3. Em cada item:
   - **OUVIR**: ouve a voz que o estudante vai ouvir agora.
   - **GRAVAR** → fale → **PARAR** (botão vermelho, com ponto piscando e contador; para
     sozinho em 15 segundos): grava a sua voz. O app guarda e toca a gravação uma vez;
     **OUVIR DE NOVO** toca outra vez.
   - **GRAVAR DE NOVO**: grava outra vez. **APAGAR**: volta para a voz do celular.
   - **EDITAR FALA**: muda só o texto que a voz do celular lê (a tela continua igual).
     Exemplo: a tela mostra **PE** e a voz lê *"pé"*; dá para trocar por *"pê"*.
4. A etiqueta de cada item mostra de onde vem a voz: **SUA GRAVAÇÃO**, **DO PACOTE** ou **VOZ DO APARELHO**.

Dica: grave num lugar quieto, com o celular a um palmo da boca, falando devagar e claro.

### Passar para os celulares dos estudantes

1. No seu celular: modo professor → **PACOTE DE ÁUDIOS** → **EXPORTAR GRAVAÇÕES (.ZIP)**.
   O arquivo `caderno-pratica-audios-AAAA-MM-DD.zip` vai para a pasta **Downloads**.
2. Mande o arquivo para o celular do estudante (WhatsApp, Bluetooth ou cabo).
3. No celular do estudante: modo professor → **PACOTE DE ÁUDIOS** → **IMPORTAR PACOTE (.ZIP)**
   e escolha o arquivo.
4. Pronto. O pacote novo substitui o anterior. As correções de fala também vão no pacote.

A ordem das vozes é: **gravação feita no próprio celular** → **pacote importado** → **voz do celular**.

### Configurações (só no modo professor)

- **Tamanho do texto:** normal, grande ou muito grande.
- **Velocidade da voz do aparelho:** de 0,9 a 1,2; o padrão é **1,0** (ritmo normal).
  As gravações sempre tocam na velocidade em que foram gravadas.
- **Mostrar atividades de números e dinheiro:** ligada por padrão. Desligada, some tudo
  de números, contas, dinheiro e horas (e as aulas que só têm isso).
- **Vogal E e vogal O nas sílabas:** aberta (*pé, pó*) ou fechada (*pê, pô*).
- **Voz do aparelho:** automática (a melhor em português do Brasil) ou outra.
- **Atividades por sessão:** de 8 a 12 (padrão 10).
- **Animações:** ligar ou desligar.
- **Mostrar as demonstrações de novo.**
- **Progresso do estudante → Apagar o progresso:** para começar de novo ou passar o celular a outro estudante.
- **Trocar o PIN.**

---

## 4. Como atualizar o conteúdo (trocar o `conteudo_licoes.json`)

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

Fica em `src/dados/pronuncia.json` e explica a si mesma (campo `_leia_me`):

- `silabas`: `"PA": "pá"` → a tela mostra **PA**, a voz lê *pá*. Sílabas com E ou O
  têm as duas formas: `{"aberta": "pé", "fechada": "pê"}`.
- `letras`: `"nome"` (lido nas teclas: *pê*) e `"fala"` (lido quando a letra aparece
  sozinha: *pê, de pai* — nunca o "som" da consoante isolada).
- `palavras`: siglas e palavras que a voz lê mal (`"IFCE": "í éfe cê é"`).

As correções feitas no modo professor (**EDITAR FALA**) valem por cima da tabela.

---

## 5. Para quem cuida do código

Pilha: **Vite + TypeScript** (sem framework), PWA com `vite-plugin-pwa`, `.zip` com `fflate`,
conta Google com **Firebase** (Auth + Firestore, SDK modular, carregado à parte).
O código está comentado em português.

```bash
npm install          # instala as dependências
npm run dev          # abre o app em modo de desenvolvimento (http://localhost:5173)
npm test             # testes Vitest (progressão, exclusões, atividades, voz, conta, Cloudflare...)
npm run test:e2e     # testes Playwright (aula 23 sem internet, navegação, voz, gravação, professor)
npm run test:e2e:firebase  # testes da conta Google com os emuladores do Firebase (precisa de Java 11+)
npm run build        # gera o site na pasta dist/
npm run pronuncia    # completa a tabela de pronúncia com sílabas novas do conteúdo
npm run relatorio    # lista o que do conteúdo não aparece por causa da regra de progressão
npm run icones       # gera de novo os ícones PNG
```

Mapa rápido:

| Pasta / arquivo | O que tem |
|---|---|
| `src/config/aulas_excluidas.ts` | **lista de exclusão** (partes e aulas que não aparecem no app) |
| `src/conteudo/progressao.ts` | **validador da regra de progressão** |
| `src/conteudo/silabas.ts` | divisão silábica |
| `src/atividades/gerar.ts` | geração das 21 atividades a partir de cada aula |
| `src/atividades/disponiveis.ts` | quais aulas e atividades aparecem (exclusões, números e dinheiro) |
| `src/atividades/sessao.ts` | sessão (só esta aula, ou 70% aula + 30% revisão) |
| `src/atividades/rotulos.ts` | instruções curtas faladas |
| `src/dados/progresso.ts` | progresso e repetição espaçada (Leitner) |
| `src/audio/gravador.ts`, `src/ui/painel-gravacao.ts` | gravação (máquina de estados) e o painel GRAVAR/PARAR/OUVIR DE NOVO |
| `src/audio/` | voz, pronúncia, gravação, pacote .zip |
| `src/conta/` | conta Google (Firebase), juntar e sincronizar o progresso |
| `src/atividades/telas/` | telas das atividades |
| `src/telas/` | entrada, início, escolher aula, aula/sessão, progresso, professor |
| `functions/__/auth`, `cloudflare/` | repasse do login para o Firebase (Cloudflare Pages Functions) |
| `public/_headers` | cabeçalhos de segurança e cache (Cloudflare) |
| `firestore.rules`, `firebase.json` | regras do Firestore e configuração dos emuladores |
| `.env.example` | variáveis do Firebase (copie para `.env`) |
| `.github/workflows/publicar.yml` | publicação no GitHub Pages |

O caminho do site é a variável `BASE_PATH` (padrão `/`, usado na Cloudflare e no computador).
No GitHub Pages (`/NOME-DO-REPOSITORIO/`) ele é preenchido sozinho pelo workflow.

**Conta Google no computador:** copie `.env.example` para `.env` e preencha com os dados
do Firebase. Sem o `.env`, o app funciona só com ENTRAR SEM CONTA (sem nenhum erro).
O passo a passo dos sites do Firebase e da Cloudflare está em
[`CONFIGURAR_FIREBASE_E_CLOUDFLARE.md`](CONFIGURAR_FIREBASE_E_CLOUDFLARE.md).

**Para tirar uma aula ou parte do app**, edite `src/config/aulas_excluidas.ts`
(`PARTES_EXCLUIDAS` e `AULAS_EXCLUIDAS`). Aulas excluídas não aparecem na lista, no
MEU PROGRESSO nem na revisão.

---

## 6. Decisões tomadas

Quando o pedido não definia algo, escolhi o mais simples, acessível e didático.

### As seis correções

**1. Só atividades de reconhecimento (ouvir, ler e falar)**
- A lista de exclusão fica em `src/config/aulas_excluidas.ts`, comentada. Hoje ela tira a
  **Parte 1 inteira** (Unidade 1 "Meu caderno, meu nome" e Unidade 2 "Preparar a mão":
  caligrafia, nome, traços), que é feita no caderno.
- Também somem as aulas que ficam **sem nenhuma atividade de reconhecimento** (veja a seção 7).
- Saiu o tipo "tutorial" (toque no botão laranja), que não era de ouvir, ler ou falar.
  Os outros tipos continuam: todos têm ouvir, ler ou falar.
- Tipos novos: **"Escute e toque a letra certa"** (2 a 4 letras; as erradas são as mais
  parecidas no som, como A/E, E/I, O/U, P/B, T/D, F/V, M/N) e **"Veja a letra e diga o nome
  dela"** (letra grande, voz do modelo e GRAVAR para o estudante; o nome é o da tabela de
  pronúncia: *pê*, *efe*...).
- Nas aulas das vogais (Unidades 3 e 4) e nas aulas "Aprenda" de cada consoante, a sessão
  **sempre** começa com: escute e toque a letra, escute e toque a sílaba, e diga o nome da letra.
  Nas vogais, as "sílabas" são as próprias vogais e os encontros do caderno (AI, EU, OI...).
- Chave **MOSTRAR ATIVIDADES DE NÚMEROS E DINHEIRO** (modo professor → configurações),
  ligada por padrão. Desligada, saem: conte, faça a conta, pague, troco, o dinheiro dá?,
  que horas são, e os itens só de números ("escute e toque o número", ligar preços...).
  Aulas que só têm isso também somem.

**2. Voz em ritmo natural**
- Voz do aparelho a **1,0** (antes 0,85). No modo professor, de **0,9 a 1,2**, com 1,0 no meio.
  Quem tinha 0,85 salvo passa para 1,0.
- Gravações (do professor, do pacote ou do estudante) tocam **sempre na velocidade original**.
- No máximo **250 ms** entre uma fala e outra na mesma tela. Depois do "Muito bem!" (ou
  da resposta mostrada), a próxima atividade começa sozinha, sem tocar em nada.
- Instruções curtas: *"Escute e toque a letra."*, *"Qual é a sílaba?"*, *"Forme a palavra."*,
  *"Complete a palavra."*, *"Quantas sílabas?"*... (lista em `src/atividades/rotulos.ts`).
- Duas ou mais atividades seguidas do mesmo tipo: a instrução é dita só na primeira; nas
  outras, só o som ou a palavra novos. A instrução volta quando o tipo muda ou quando o
  estudante toca no alto-falante 🔊.

**3. Bolinhas que navegam**
- Cada bolinha é um botão de **44 × 44 px** com o rótulo "Atividade 3 de 10" (e ", feita").
  A atual é maior; as respondidas têm ✓.
- **◀ VOLTAR** e **AVANÇAR ▶** grandes, que falam "Voltar." e "Avançar." ao serem tocados.
- Voltar a uma atividade respondida mostra a resposta dada (*"✓ VOCÊ JÁ FEZ ESTA ATIVIDADE: PA."*,
  ou a resposta certa destacada) e o botão **FAZER DE NOVO**. As de só ouvir e ler apenas abrem de novo.
- Pular não é erro. Só a resposta dada entra no progresso e na repetição espaçada.
  Refazer conta como uma resposta nova (a repetição espaçada usa a mais recente).
- **TERMINAR** a qualquer momento. A tela final diz só *"VOCÊ PRATICOU N ATIVIDADES."*
  (ou *"ATÉ A PRÓXIMA."* se nada foi feito) — nunca quantas faltaram.

**4. Qualquer aula abre**
- Nenhuma aula depende de outra. A regra de progressão só filtra o que cada aula mostra.
- Na abertura da aula: **SÓ ESTA AULA** (padrão, botão laranja) e **ESTA AULA + REVISÃO**
  (70% desta aula, 30% de revisão das anteriores).

**5. Gravação confiável**
- Estados: parado → pedindo permissão → gravando → processando → pronto (ou erro).
- Formato: o primeiro que o navegador aceitar entre `audio/webm;codecs=opus`, `audio/webm`
  e `audio/mp4` (iPhone). O arquivo só é montado quando a gravação para; depois, o
  microfone é desligado (some o aviso de microfone do celular).
- Ao parar: guarda no aparelho (IndexedDB), toca uma vez sozinha e deixa **OUVIR DE NOVO**.
  A gravação do estudante fica guardada por item (some ao apagar o progresso).
- Gravando: botão vermelho **PARAR**, ponto vermelho piscando, contador de segundos,
  limite de **15 segundos** (para sozinho).
- Sem microfone ou permissão negada: o app diz e escreve *"Para gravar, permita o uso do
  microfone."* e mostra **TENTAR DE NOVO**. A atividade nunca trava (dá para avançar).

**6. Conta Google e Cloudflare**
- Tela de entrada (só quando o Firebase está configurado): **ENTRAR COM GOOGLE** (com o
  "G" do Google e uma frase falada) e **ENTRAR SEM CONTA**. A escolha fica guardada.
- Sem conta: tudo só no celular. Na tela inicial, o botão ENTRAR COM GOOGLE continua lá:
  o progresso do celular vai junto para a conta. **SAIR DA CONTA** volta para sem conta
  (o progresso continua no celular).
- Login: janela do Google (`signInWithPopup`); se ela for bloqueada, ou no app instalado
  (tela cheia, onde a janela costuma falhar, principalmente no iPhone), vai para a página
  do Google (`signInWithRedirect`) e volta sozinho. A sessão fica guardada no aparelho e
  vale sem internet.
- O `authDomain` é o **endereço do próprio app**; uma Pages Function
  (`functions/__/auth/[[caminho]].js`) repassa `/__/auth/*` e `/__/firebase/*` para
  `SEU-PROJETO.firebaseapp.com`. Assim o login funciona no Safari e no Chrome, que bloqueiam
  dados de outros sites.
- Progresso no Firestore em `users/{uid}` (campos `progresso`, `atualizadoEm`, `versao`).
  O Firestore guarda uma cópia no aparelho: sem internet, tudo funciona e as mudanças vão
  quando a conexão volta. As regras (`firestore.rules`) só deixam cada pessoa ler e gravar
  o próprio documento.
- **Juntar** o progresso do celular com o da conta: nada se perde. Aulas e itens dos dois
  lados ficam; o mesmo item nos dois lados fica com o mais praticado; o número de sessões é
  o maior; a última aula vem do lado mais recente.
- Gravações de voz, PIN e configurações **não** vão para a conta (sem Firebase Storage).
- Os dados do Firebase vêm só de variáveis de ambiente (`VITE_FIREBASE_*`, veja `.env.example`).
  Sem elas, o app não carrega o Firebase e funciona só com ENTRAR SEM CONTA. O código do
  Firebase (cerca de 180 KB comprimido) fica num arquivo à parte, baixado só quando configurado.
- Cloudflare Pages: build `npm run build`, saída `dist`, caminho `/` (variável `BASE_PATH`).
  `public/_headers` traz os cabeçalhos de segurança (CSP, HSTS, `Permissions-Policy` com o
  microfone só para o app, COOP que permite a janela do Google) e o cache do PWA (o service
  worker e a página sempre conferidos; arquivos com impressão digital guardados por 1 ano).
  O GitHub Pages continua funcionando como antes (sem conta Google).

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
  na lista, no MEU PROGRESSO nem na revisão. Se alguém abrir uma delas pelo número, o app
  diz: *"Esta aula é feita só no caderno, com o professor. Escolha outra aula para praticar."*
- Aulas com pouco conteúdo no começo do caderno (aulas 8 a 10, só vogais) repetem as
  atividades de responder para completar a sessão (as de só ouvir e ler não se repetem).

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
  de atividade, com a faixa **VEJA COMO SE FAZ** (expressão do caderno) e botão **PULAR**.

**Voz**
- Vogal **aberta** (pé, pó) é o padrão nas sílabas, mais próxima da fala do Ceará; o professor pode trocar.
- O texto mandado para a voz vai sempre em minúsculas (a voz às vezes soletra palavras em MAIÚSCULAS).

**Repetição espaçada (Leitner, por item)**
- Cada item tem uma caixa de 1 a 5. Acertou de primeira → sobe uma caixa; errou → caixa 1.
  Caixa 1 volta na próxima sessão; 2 → em 2 sessões; 3 → 4; 4 → 8; 5 → 16.
- A revisão (cerca de 30% da sessão) pega primeiro os itens vencidos (os errados antes)
  e completa com itens das aulas anteriores mais próximas.

**Outros**
- "Restaurar o progresso do estudante" = **apagar o progresso** (começar do zero), com confirmação.
- PIN guardado como resumo criptográfico (SHA-256), só no aparelho (nunca vai para a conta Google).
- Os endereços usam `#` (ex.: `#/aula/23`), que funcionam no GitHub Pages e sem internet.

---

## 7. O que falta no conteúdo (conferência do `conteudo_licoes.json`)

O `conteudo_licoes.json` **não foi alterado** nestas correções (ele será substituído).
Li o arquivo inteiro e conferi se tudo o que o app precisa tem de onde sair:

- **Aulas que não aparecem no app:**
  - aulas 1 a 6 (Parte 1, pela lista de exclusão);
  - sem atividade de reconhecimento: 7, 12, 20, 35, 55, 57, 58, 82, 136, 145, 150.
  - Com a chave de números e dinheiro **desligada**, somem também: 17, 32, 46, 47, 53, 54,
    67, 68, 81, 88, 97, 106, 117, 126, 140, 144 (só têm números, contas, dinheiro ou horas).
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

## 8. O que falta fazer

1. **Juntar este trabalho na `main`** (aceitar o *pull request* da branch
   `claude/determined-brown-2nhf40`). O GitHub Pages publica sozinho.
2. **Para ter o ENTRAR COM GOOGLE:** seguir
   [`CONFIGURAR_FIREBASE_E_CLOUDFLARE.md`](CONFIGURAR_FIREBASE_E_CLOUDFLARE.md)
   (criar o projeto no Firebase, ligar o login com Google e o Firestore, publicar as regras,
   criar o projeto na Cloudflare Pages com as variáveis, autorizar o endereço, restringir a
   chave e testar).
3. **Testar no celular** a gravação (roteiro abaixo) e o login.

### Roteiro de teste manual da gravação

Faça no **Android (Chrome)** e no **iPhone (Safari)**, com o app instalado na tela inicial:

1. Abra a **aula 8** → **SÓ ESTA AULA** → vá até **"Diga o nome da letra."** (use as bolinhas).
2. Toque **GRAVAR**. Na primeira vez o celular pergunta se pode usar o microfone:
   toque **Permitir**.
3. Confira: o botão fica **vermelho** escrito **PARAR**, com um **ponto piscando** e o
   contador **0:01, 0:02...**
4. Diga o nome da letra e toque **PARAR**. A sua voz **toca sozinha uma vez**, inteira,
   sem cortar o começo nem o fim, na velocidade normal.
5. Toque **OUVIR DE NOVO**: toca outra vez. Toque **MODELO**: ouve a voz do modelo.
6. Toque **GRAVAR DE NOVO** e **não** toque PARAR: em **15 segundos** a gravação para sozinha e toca.
7. Saia da aula, volte para a mesma atividade: **OUVIR DE NOVO** ainda toca (ficou guardada).
8. Confira que o aviso de microfone do celular (o ponto verde/laranja no alto da tela)
   **some** depois de PARAR.
9. Nas configurações do navegador, **bloqueie o microfone** para o app e toque GRAVAR:
   o app diz e mostra *"Para gravar, permita o uso do microfone."* e o botão **TENTAR DE NOVO**;
   **AVANÇAR** continua funcionando. Libere o microfone de novo e toque TENTAR DE NOVO.
10. No **modo professor** → GRAVAÇÕES → aula 23: grave uma sílaba, toque **OUVIR**, depois
    exporte o pacote e importe em outro celular: a gravação toca lá também.

---

## 9. Limitações conhecidas

- A qualidade da voz depende do celular. Se o celular não tiver voz em português, o app
  funciona em silêncio — por isso o pacote de áudios do professor é importante.
  (No Android: Configurações → Idioma → Saída de texto para fala → Google → instalar *Português (Brasil)*.)
- Sílabas com LH e NH sozinhas (LHA, NHA) costumam soar estranhas na voz sintetizada: vale gravar.
- O destaque palavra por palavra (karaokê) usa os avisos da própria voz; quando o celular
  não manda esses avisos, o destaque segue pelo relógio e pode ficar um pouco adiantado ou atrasado.
- A pausa de no máximo 250 ms entre falas vale para o app; a voz do aparelho pode levar um
  instante a mais para começar a primeira fala (no Android, às vezes meio segundo).
- Gravar voz precisa da permissão do microfone. No iPhone, só funciona no Safari (ou no app
  instalado pelo Safari) com iOS 14.5 ou mais novo.
- **Testes automáticos no Safari (WebKit) não rodaram:** o ambiente de testes só tem o
  Chromium. Por isso o roteiro manual acima deve ser feito no iPhone. O formato `audio/mp4`
  (o do iPhone) é conferido por teste unitário.
- **Sem conta**, o progresso fica só naquele celular: se o app for desinstalado ou os dados do
  navegador forem apagados, o progresso e as gravações se perdem (o pacote .zip do professor
  serve de cópia dos áudios). **Com a conta Google**, o progresso volta ao entrar de novo;
  as gravações, não.
- Ao juntar o progresso de dois celulares que praticaram o mesmo item sem internet, fica o
  registro do celular que praticou mais vezes (a soma exata das duas práticas não é feita).
- O teste automático do login usa o emulador do Firebase com uma conta simulada: a janela
  real do Google (que precisa de `apis.google.com`) não é aberta nos testes. A janela, o
  redirecionamento e a volta para o app instalado devem ser conferidos no passo 8 do
  `CONFIGURAR_FIREBASE_E_CLOUDFLARE.md`. A troca de janela para redirecionamento é
  conferida por teste unitário.
- A tela MEU PROGRESSO confere todas as aulas ao abrir; em celulares muito simples ela pode
  levar meio segundo na primeira vez (o app adianta esse trabalho quando o celular está parado).
- O histórico de commits foi organizado por etapa e por correção (Correção 1 a 6).

---

## 10. Testes e notas de qualidade

| Verificação | Resultado |
|---|---|
| Vitest (10 arquivos, 67 testes) | ✅ todos passam |
| — validador de progressão em **todas** as atividades de **todas** as aulas e em sessões com revisão | ✅ 0 problemas |
| — exclusões (Parte 1, aulas sem reconhecimento, fora da revisão), tipos obrigatórios nas vogais e no "Aprenda", chave de números | ✅ |
| — voz a 1,0 (0,9 a 1,2), instruções curtas, formatos de gravação | ✅ |
| — juntar progressos, popup → redirect, repasse da Cloudflare, app sem Firebase | ✅ |
| Playwright (8 testes): aula 23 inteira **sem internet**; bolinhas, VOLTAR/AVANÇAR, refazer e TERMINAR; ritmo da voz (voz de teste que mede pausas e velocidade); acesso livre e SÓ ESTA AULA; gravação com microfone simulado (duração > 0, salva, toca, para em 15 s); microfone negado; professor grava, exporta e outro aparelho importa | ✅ todos passam |
| Playwright com os emuladores do Firebase (3 testes): ENTRAR SEM CONTA; entrar com Google depois levando o progresso; progresso na nuvem; **sem internet** depois do login e envio quando a conexão volta; outro aparelho com a mesma conta; SAIR DA CONTA; regras do Firestore (outra pessoa e sem login: negado) | ✅ todos passam |
| Lighthouse 11 (celular): início, escolher, parte, aula 23, professor, tela de entrada (com Firebase) | **PWA 100 · Acessibilidade 100 · Boas práticas 100 · Desempenho 98 a 100** |
| Lighthouse: MEU PROGRESSO | PWA 100 · Acessibilidade 100 · Boas práticas 100 · Desempenho 83 |
| axe-core (WCAG 2 A/AA) em 61 telas: entrada, início, escolher, aula indisponível, professor (gravando e gravado), os 21 tipos de atividade (antes e depois de responder), "diga a letra" gravando, resposta dada, fim | ✅ 0 violações |
| Tamanho do app publicado (sem áudios) | 0,46 MB sem conta Google; 1,07 MB com (limite: 2 MB) |

Telas testadas em 360 × 640 (Android pequeno), em retrato, nos três tamanhos de texto.

---

## Créditos

- Fonte **Atkinson Hyperlegible** (Braille Institute), licença SIL Open Font License 1.1
  (`src/fontes/LICENCA-OFL.txt`).
- Atividades inspiradas no modelo do aplicativo Silabando, adaptadas para adultos.

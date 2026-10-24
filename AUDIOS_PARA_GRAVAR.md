# Áudios para gravar (letras e sílabas)

O app **já funciona** com a voz do celular. Mas a voz do celular lê mal letras e sílabas
soltas (LHA, NHO, QUE, PE...) e muda de um celular para outro. Cada letra ou sílaba que
ganhar um áudio gravado passa a soar **igual em todos os celulares**, também sem internet.

- Ao todo o app usa **300 áudios**: 37 letras e 263 sílabas.
- **Faltam 300** (37 letras e 263 sílabas), listados no fim desta página.
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
   - Nome do arquivo: **exatamente** o da coluna *Nome do arquivo* (ex.: `pa.mp3`)
8. Faça o mesmo para as outras linhas. Dica: depois de exportar, apague a gravação
   (Ctrl + A e a tecla Delete) e grave a próxima.

## Como pôr os áudios no app

1. No GitHub, abra o repositório e entre na pasta **public/audio/silabas**
   (para as letras, **public/audio/letras**).
2. Clique em **Add file → Upload files**, arraste os arquivos `.mp3` e clique em
   **Commit changes** (na branch **main**).
3. A publicação é automática. Em alguns minutos o app já usa os áudios novos.
   Nos celulares aparece **NOVA VERSÃO DISPONÍVEL → ATUALIZAR**.
4. **Para trocar um áudio** (por exemplo, por uma gravação melhor): envie um arquivo com
   **o mesmo nome**. Ele substitui o anterior.

## Regra dos nomes de arquivo

- Tudo em **minúsculas** e **sem acento**: PA → `pa.mp3`, LHA → `lha.mp3`.
- Cada acento vira uma palavra no fim, depois de um tracinho: **agudo** (´), **circunflexo** (^),
  **til** (~), **crase** (`), **cedilha** (ç).
  Exemplos: PÉ → `pe-agudo.mp3` · VÔ → `vo-circunflexo.mp3` · PÃO → `pao-til.mp3` ·
  ÇA → `ca-cedilha.mp3` · Ç (letra) → `c-cedilha.mp3`.
- **Letras** vão em `public/audio/letras` e são ditas **pelo nome** (P → *pê*).
  **Sílabas** vão em `public/audio/silabas`.
- Um arquivo com nome fora da regra é ignorado (a voz do celular continua falando).

## Letras que faltam (37)

| Na tela | Como falar | Nome do arquivo | Pasta |
|---|---|---|---|
| **A** | á | `a.mp3` | `public/audio/letras` |
| **Á** | á com acento agudo | `a-agudo.mp3` | `public/audio/letras` |
| **Â** | â com acento circunflexo | `a-circunflexo.mp3` | `public/audio/letras` |
| **Ã** | ã, com til | `a-til.mp3` | `public/audio/letras` |
| **B** | bê | `b.mp3` | `public/audio/letras` |
| **C** | cê | `c.mp3` | `public/audio/letras` |
| **Ç** | cê cedilha | `c-cedilha.mp3` | `public/audio/letras` |
| **D** | dê | `d.mp3` | `public/audio/letras` |
| **E** | é | `e.mp3` | `public/audio/letras` |
| **É** | é com acento agudo | `e-agudo.mp3` | `public/audio/letras` |
| **Ê** | ê com acento circunflexo | `e-circunflexo.mp3` | `public/audio/letras` |
| **F** | éfe | `f.mp3` | `public/audio/letras` |
| **G** | gê | `g.mp3` | `public/audio/letras` |
| **H** | agá | `h.mp3` | `public/audio/letras` |
| **I** | í | `i.mp3` | `public/audio/letras` |
| **Í** | í com acento agudo | `i-agudo.mp3` | `public/audio/letras` |
| **J** | jóta | `j.mp3` | `public/audio/letras` |
| **K** | cá | `k.mp3` | `public/audio/letras` |
| **L** | éle | `l.mp3` | `public/audio/letras` |
| **M** | ême | `m.mp3` | `public/audio/letras` |
| **N** | ene | `n.mp3` | `public/audio/letras` |
| **O** | ó | `o.mp3` | `public/audio/letras` |
| **Ó** | ó com acento agudo | `o-agudo.mp3` | `public/audio/letras` |
| **Ô** | ô com acento circunflexo | `o-circunflexo.mp3` | `public/audio/letras` |
| **Õ** | õ, com til | `o-til.mp3` | `public/audio/letras` |
| **P** | pê | `p.mp3` | `public/audio/letras` |
| **Q** | quê | `q.mp3` | `public/audio/letras` |
| **R** | érre | `r.mp3` | `public/audio/letras` |
| **S** | ésse | `s.mp3` | `public/audio/letras` |
| **T** | tê | `t.mp3` | `public/audio/letras` |
| **U** | ú | `u.mp3` | `public/audio/letras` |
| **Ú** | ú com acento agudo | `u-agudo.mp3` | `public/audio/letras` |
| **V** | vê | `v.mp3` | `public/audio/letras` |
| **W** | dáblio | `w.mp3` | `public/audio/letras` |
| **X** | xis | `x.mp3` | `public/audio/letras` |
| **Y** | ípsilon | `y.mp3` | `public/audio/letras` |
| **Z** | zê | `z.mp3` | `public/audio/letras` |

## Sílabas que faltam (263)

| Na tela | Como falar | Nome do arquivo | Pasta |
|---|---|---|---|
| **A** | á | `a.mp3` | `public/audio/silabas` |
| **AI** | ai | `ai.mp3` | `public/audio/silabas` |
| **AL** | ál | `al.mp3` | `public/audio/silabas` |
| **AM** | ã | `am.mp3` | `public/audio/silabas` |
| **AN** | ã | `an.mp3` | `public/audio/silabas` |
| **ÃO** | ão | `ao-til.mp3` | `public/audio/silabas` |
| **AR** | ár | `ar.mp3` | `public/audio/silabas` |
| **AS** | ás | `as.mp3` | `public/audio/silabas` |
| **AU** | au | `au.mp3` | `public/audio/silabas` |
| **BA** | bá | `ba.mp3` | `public/audio/silabas` |
| **BÃO** | bão | `bao-til.mp3` | `public/audio/silabas` |
| **BAR** | bár | `bar.mp3` | `public/audio/silabas` |
| **BE** | bé | `be.mp3` | `public/audio/silabas` |
| **BI** | bí | `bi.mp3` | `public/audio/silabas` |
| **BLA** | blá | `bla.mp3` | `public/audio/silabas` |
| **BLU** | blú | `blu.mp3` | `public/audio/silabas` |
| **BO** | bó | `bo.mp3` | `public/audio/silabas` |
| **BRA** | brá | `bra.mp3` | `public/audio/silabas` |
| **BU** | bú | `bu.mp3` | `public/audio/silabas` |
| **CA** | cá | `ca.mp3` | `public/audio/silabas` |
| **ÇA** | sá | `ca-cedilha.mp3` | `public/audio/silabas` |
| **CAI** | cai | `cai.mp3` | `public/audio/silabas` |
| **CAL** | cál | `cal.mp3` | `public/audio/silabas` |
| **CAM** | cã | `cam.mp3` | `public/audio/silabas` |
| **CAR** | cár | `car.mp3` | `public/audio/silabas` |
| **CE** | cé | `ce.mp3` | `public/audio/silabas` |
| **CÊ** | cê | `ce-circunflexo.mp3` | `public/audio/silabas` |
| **CHA** | chá | `cha.mp3` | `public/audio/silabas` |
| **CHÃO** | chão | `chao-til.mp3` | `public/audio/silabas` |
| **CHE** | ché | `che.mp3` | `public/audio/silabas` |
| **CHEI** | chei | `chei.mp3` | `public/audio/silabas` |
| **CHI** | chí | `chi.mp3` | `public/audio/silabas` |
| **CHO** | chó | `cho.mp3` | `public/audio/silabas` |
| **CHU** | chú | `chu.mp3` | `public/audio/silabas` |
| **CI** | cí | `ci.mp3` | `public/audio/silabas` |
| **CLA** | clá | `cla.mp3` | `public/audio/silabas` |
| **CLE** | clé | `cle.mp3` | `public/audio/silabas` |
| **CLI** | clí | `cli.mp3` | `public/audio/silabas` |
| **CO** | có | `co.mp3` | `public/audio/silabas` |
| **ÇO** | só | `co-cedilha.mp3` | `public/audio/silabas` |
| **COM** | com | `com.mp3` | `public/audio/silabas` |
| **COR** | cór | `cor.mp3` | `public/audio/silabas` |
| **CRE** | cré | `cre.mp3` | `public/audio/silabas` |
| **CU** | cú | `cu.mp3` | `public/audio/silabas` |
| **ÇU** | sú | `cu-cedilha.mp3` | `public/audio/silabas` |
| **DA** | dá | `da.mp3` | `public/audio/silabas` |
| **DE** | dé | `de.mp3` | `public/audio/silabas` |
| **DEI** | dei | `dei.mp3` | `public/audio/silabas` |
| **DI** | dí | `di.mp3` | `public/audio/silabas` |
| **DO** | dó | `do.mp3` | `public/audio/silabas` |
| **DRA** | drá | `dra.mp3` | `public/audio/silabas` |
| **DRI** | drí | `dri.mp3` | `public/audio/silabas` |
| **DU** | dú | `du.mp3` | `public/audio/silabas` |
| **E** | é | `e.mp3` | `public/audio/silabas` |
| **EI** | ei | `ei.mp3` | `public/audio/silabas` |
| **EL** | él | `el.mp3` | `public/audio/silabas` |
| **EM** | em | `em.mp3` | `public/audio/silabas` |
| **EN** | em | `en.mp3` | `public/audio/silabas` |
| **ER** | ér | `er.mp3` | `public/audio/silabas` |
| **ES** | és | `es.mp3` | `public/audio/silabas` |
| **EU** | eu | `eu.mp3` | `public/audio/silabas` |
| **FA** | fá | `fa.mp3` | `public/audio/silabas` |
| **FAI** | fai | `fai.mp3` | `public/audio/silabas` |
| **FE** | fé | `fe.mp3` | `public/audio/silabas` |
| **FÉ** | fé | `fe-agudo.mp3` | `public/audio/silabas` |
| **FEI** | fei | `fei.mp3` | `public/audio/silabas` |
| **FER** | fér | `fer.mp3` | `public/audio/silabas` |
| **FES** | fés | `fes.mp3` | `public/audio/silabas` |
| **FI** | fí | `fi.mp3` | `public/audio/silabas` |
| **FLA** | flá | `fla.mp3` | `public/audio/silabas` |
| **FLI** | flí | `fli.mp3` | `public/audio/silabas` |
| **FLO** | fló | `flo.mp3` | `public/audio/silabas` |
| **FLOR** | flor | `flor.mp3` | `public/audio/silabas` |
| **FO** | fó | `fo.mp3` | `public/audio/silabas` |
| **FOR** | fór | `for.mp3` | `public/audio/silabas` |
| **FRO** | fró | `fro.mp3` | `public/audio/silabas` |
| **FRU** | frú | `fru.mp3` | `public/audio/silabas` |
| **FU** | fú | `fu.mp3` | `public/audio/silabas` |
| **GA** | gá | `ga.mp3` | `public/audio/silabas` |
| **GAR** | gár | `gar.mp3` | `public/audio/silabas` |
| **GE** | gé | `ge.mp3` | `public/audio/silabas` |
| **GI** | gí | `gi.mp3` | `public/audio/silabas` |
| **GLO** | gló | `glo.mp3` | `public/audio/silabas` |
| **GO** | gó | `go.mp3` | `public/audio/silabas` |
| **GOU** | gou | `gou.mp3` | `public/audio/silabas` |
| **GRA** | grá | `gra.mp3` | `public/audio/silabas` |
| **GRAN** | grã | `gran.mp3` | `public/audio/silabas` |
| **GU** | gú | `gu.mp3` | `public/audio/silabas` |
| **GUA** | guá | `gua.mp3` | `public/audio/silabas` |
| **GUE** | gué | `gue.mp3` | `public/audio/silabas` |
| **GUEI** | guei | `guei.mp3` | `public/audio/silabas` |
| **GUI** | guí | `gui.mp3` | `public/audio/silabas` |
| **HA** | á | `ha.mp3` | `public/audio/silabas` |
| **HE** | é | `he.mp3` | `public/audio/silabas` |
| **HI** | í | `hi.mp3` | `public/audio/silabas` |
| **HO** | ó | `ho.mp3` | `public/audio/silabas` |
| **HU** | ú | `hu.mp3` | `public/audio/silabas` |
| **I** | í | `i.mp3` | `public/audio/silabas` |
| **Í** | í | `i-agudo.mp3` | `public/audio/silabas` |
| **IA** | iá | `ia.mp3` | `public/audio/silabas` |
| **IE** | ié | `ie.mp3` | `public/audio/silabas` |
| **IL** | íl | `il.mp3` | `public/audio/silabas` |
| **IM** | im | `im.mp3` | `public/audio/silabas` |
| **IN** | im | `in.mp3` | `public/audio/silabas` |
| **IO** | ió | `io.mp3` | `public/audio/silabas` |
| **IR** | ír | `ir.mp3` | `public/audio/silabas` |
| **IS** | ís | `is.mp3` | `public/audio/silabas` |
| **JA** | já | `ja.mp3` | `public/audio/silabas` |
| **JÁ** | já | `ja-agudo.mp3` | `public/audio/silabas` |
| **JÃO** | jão | `jao-til.mp3` | `public/audio/silabas` |
| **JE** | jé | `je.mp3` | `public/audio/silabas` |
| **JEI** | jei | `jei.mp3` | `public/audio/silabas` |
| **JI** | jí | `ji.mp3` | `public/audio/silabas` |
| **JO** | jó | `jo.mp3` | `public/audio/silabas` |
| **JOI** | jói | `joi.mp3` | `public/audio/silabas` |
| **JU** | jú | `ju.mp3` | `public/audio/silabas` |
| **KA** | cá | `ka.mp3` | `public/audio/silabas` |
| **LA** | lá | `la.mp3` | `public/audio/silabas` |
| **LÃO** | lão | `lao-til.mp3` | `public/audio/silabas` |
| **LE** | lé | `le.mp3` | `public/audio/silabas` |
| **LEI** | lei | `lei.mp3` | `public/audio/silabas` |
| **LHA** | lhá | `lha.mp3` | `public/audio/silabas` |
| **LHE** | lhé | `lhe.mp3` | `public/audio/silabas` |
| **LHI** | lhí | `lhi.mp3` | `public/audio/silabas` |
| **LHO** | lhó | `lho.mp3` | `public/audio/silabas` |
| **LHU** | lhú | `lhu.mp3` | `public/audio/silabas` |
| **LI** | lí | `li.mp3` | `public/audio/silabas` |
| **LIM** | lim | `lim.mp3` | `public/audio/silabas` |
| **LIS** | lís | `lis.mp3` | `public/audio/silabas` |
| **LO** | ló | `lo.mp3` | `public/audio/silabas` |
| **LU** | lú | `lu.mp3` | `public/audio/silabas` |
| **MA** | má | `ma.mp3` | `public/audio/silabas` |
| **MÃO** | mão | `mao-til.mp3` | `public/audio/silabas` |
| **MAR** | mar | `mar.mp3` | `public/audio/silabas` |
| **MAS** | mas | `mas.mp3` | `public/audio/silabas` |
| **ME** | mé | `me.mp3` | `public/audio/silabas` |
| **MÉ** | mé | `me-agudo.mp3` | `public/audio/silabas` |
| **MEI** | mei | `mei.mp3` | `public/audio/silabas` |
| **MEL** | mel | `mel.mp3` | `public/audio/silabas` |
| **MI** | mí | `mi.mp3` | `public/audio/silabas` |
| **MO** | mó | `mo.mp3` | `public/audio/silabas` |
| **MOR** | mór | `mor.mp3` | `public/audio/silabas` |
| **MU** | mú | `mu.mp3` | `public/audio/silabas` |
| **NA** | ná | `na.mp3` | `public/audio/silabas` |
| **NÃO** | não | `nao-til.mp3` | `public/audio/silabas` |
| **NE** | né | `ne.mp3` | `public/audio/silabas` |
| **NHA** | nhá | `nha.mp3` | `public/audio/silabas` |
| **NHÃO** | nhão | `nhao-til.mp3` | `public/audio/silabas` |
| **NHE** | nhé | `nhe.mp3` | `public/audio/silabas` |
| **NHEI** | nhei | `nhei.mp3` | `public/audio/silabas` |
| **NHI** | nhí | `nhi.mp3` | `public/audio/silabas` |
| **NHO** | nhó | `nho.mp3` | `public/audio/silabas` |
| **NHU** | nhú | `nhu.mp3` | `public/audio/silabas` |
| **NI** | ní | `ni.mp3` | `public/audio/silabas` |
| **NO** | nó | `no.mp3` | `public/audio/silabas` |
| **NOI** | nói | `noi.mp3` | `public/audio/silabas` |
| **NU** | nú | `nu.mp3` | `public/audio/silabas` |
| **O** | ó | `o.mp3` | `public/audio/silabas` |
| **OI** | ói | `oi.mp3` | `public/audio/silabas` |
| **OL** | ól | `ol.mp3` | `public/audio/silabas` |
| **OM** | om | `om.mp3` | `public/audio/silabas` |
| **ON** | om | `on.mp3` | `public/audio/silabas` |
| **OR** | ór | `or.mp3` | `public/audio/silabas` |
| **OS** | ós | `os.mp3` | `public/audio/silabas` |
| **OU** | ou | `ou.mp3` | `public/audio/silabas` |
| **PA** | pá | `pa.mp3` | `public/audio/silabas` |
| **PAI** | pai | `pai.mp3` | `public/audio/silabas` |
| **PÃO** | pão | `pao-til.mp3` | `public/audio/silabas` |
| **PAS** | pás | `pas.mp3` | `public/audio/silabas` |
| **PE** | pé | `pe.mp3` | `public/audio/silabas` |
| **PÉ** | pé | `pe-agudo.mp3` | `public/audio/silabas` |
| **PEI** | pei | `pei.mp3` | `public/audio/silabas` |
| **PI** | pí | `pi.mp3` | `public/audio/silabas` |
| **PLA** | plá | `pla.mp3` | `public/audio/silabas` |
| **PLAN** | plã | `plan.mp3` | `public/audio/silabas` |
| **PO** | pó | `po.mp3` | `public/audio/silabas` |
| **POI** | pói | `poi.mp3` | `public/audio/silabas` |
| **PON** | pom | `pon.mp3` | `public/audio/silabas` |
| **POR** | pór | `por.mp3` | `public/audio/silabas` |
| **POU** | pou | `pou.mp3` | `public/audio/silabas` |
| **PRA** | prá | `pra.mp3` | `public/audio/silabas` |
| **PRE** | pré | `pre.mp3` | `public/audio/silabas` |
| **PU** | pú | `pu.mp3` | `public/audio/silabas` |
| **QU** | qu | `qu.mp3` | `public/audio/silabas` |
| **QUA** | quá | `qua.mp3` | `public/audio/silabas` |
| **QUE** | qué | `que.mp3` | `public/audio/silabas` |
| **QUEI** | quei | `quei.mp3` | `public/audio/silabas` |
| **QUI** | quí | `qui.mp3` | `public/audio/silabas` |
| **RA** | rá | `ra.mp3` | `public/audio/silabas` |
| **RE** | ré | `re.mp3` | `public/audio/silabas` |
| **REI** | rei | `rei.mp3` | `public/audio/silabas` |
| **RI** | rí | `ri.mp3` | `public/audio/silabas` |
| **RO** | ró | `ro.mp3` | `public/audio/silabas` |
| **ROU** | rou | `rou.mp3` | `public/audio/silabas` |
| **RRA** | rá | `rra.mp3` | `public/audio/silabas` |
| **RRE** | ré | `rre.mp3` | `public/audio/silabas` |
| **RRI** | rí | `rri.mp3` | `public/audio/silabas` |
| **RRO** | ró | `rro.mp3` | `public/audio/silabas` |
| **RRU** | rú | `rru.mp3` | `public/audio/silabas` |
| **RU** | rú | `ru.mp3` | `public/audio/silabas` |
| **SA** | sá | `sa.mp3` | `public/audio/silabas` |
| **SÁ** | sá | `sa-agudo.mp3` | `public/audio/silabas` |
| **SAI** | sai | `sai.mp3` | `public/audio/silabas` |
| **SE** | sé | `se.mp3` | `public/audio/silabas` |
| **SEI** | sei | `sei.mp3` | `public/audio/silabas` |
| **SI** | sí | `si.mp3` | `public/audio/silabas` |
| **SO** | só | `so.mp3` | `public/audio/silabas` |
| **SOL** | sol | `sol.mp3` | `public/audio/silabas` |
| **SON** | som | `son.mp3` | `public/audio/silabas` |
| **SOU** | sou | `sou.mp3` | `public/audio/silabas` |
| **SSA** | sá | `ssa.mp3` | `public/audio/silabas` |
| **SSE** | sé | `sse.mp3` | `public/audio/silabas` |
| **SSI** | sí | `ssi.mp3` | `public/audio/silabas` |
| **SSO** | só | `sso.mp3` | `public/audio/silabas` |
| **SSU** | sú | `ssu.mp3` | `public/audio/silabas` |
| **SU** | sú | `su.mp3` | `public/audio/silabas` |
| **TA** | tá | `ta.mp3` | `public/audio/silabas` |
| **TAR** | tár | `tar.mp3` | `public/audio/silabas` |
| **TE** | té | `te.mp3` | `public/audio/silabas` |
| **TEM** | tem | `tem.mp3` | `public/audio/silabas` |
| **TER** | tér | `ter.mp3` | `public/audio/silabas` |
| **TI** | tí | `ti.mp3` | `public/audio/silabas` |
| **TO** | tó | `to.mp3` | `public/audio/silabas` |
| **TOR** | tór | `tor.mp3` | `public/audio/silabas` |
| **TOS** | tós | `tos.mp3` | `public/audio/silabas` |
| **TRA** | trá | `tra.mp3` | `public/audio/silabas` |
| **TRE** | tré | `tre.mp3` | `public/audio/silabas` |
| **TRÊS** | três | `tres-circunflexo.mp3` | `public/audio/silabas` |
| **TU** | tú | `tu.mp3` | `public/audio/silabas` |
| **U** | ú | `u.mp3` | `public/audio/silabas` |
| **UA** | uá | `ua.mp3` | `public/audio/silabas` |
| **UE** | ué | `ue.mp3` | `public/audio/silabas` |
| **UI** | ui | `ui.mp3` | `public/audio/silabas` |
| **UL** | úl | `ul.mp3` | `public/audio/silabas` |
| **UM** | um | `um.mp3` | `public/audio/silabas` |
| **UN** | um | `un.mp3` | `public/audio/silabas` |
| **UO** | uó | `uo.mp3` | `public/audio/silabas` |
| **UR** | úr | `ur.mp3` | `public/audio/silabas` |
| **US** | ús | `us.mp3` | `public/audio/silabas` |
| **VA** | vá | `va.mp3` | `public/audio/silabas` |
| **VAS** | vás | `vas.mp3` | `public/audio/silabas` |
| **VE** | vé | `ve.mp3` | `public/audio/silabas` |
| **VEI** | vei | `vei.mp3` | `public/audio/silabas` |
| **VEN** | vem | `ven.mp3` | `public/audio/silabas` |
| **VI** | ví | `vi.mp3` | `public/audio/silabas` |
| **VO** | vó | `vo.mp3` | `public/audio/silabas` |
| **VÓ** | vó | `vo-agudo.mp3` | `public/audio/silabas` |
| **VÔ** | vô | `vo-circunflexo.mp3` | `public/audio/silabas` |
| **VRO** | vró | `vro.mp3` | `public/audio/silabas` |
| **VU** | vú | `vu.mp3` | `public/audio/silabas` |
| **WIL** | uíl | `wil.mp3` | `public/audio/silabas` |
| **XA** | xá | `xa.mp3` | `public/audio/silabas` |
| **XE** | xé | `xe.mp3` | `public/audio/silabas` |
| **XI** | xí | `xi.mp3` | `public/audio/silabas` |
| **XO** | xó | `xo.mp3` | `public/audio/silabas` |
| **XU** | xú | `xu.mp3` | `public/audio/silabas` |
| **YA** | iá | `ya.mp3` | `public/audio/silabas` |
| **ZA** | zá | `za.mp3` | `public/audio/silabas` |
| **ZE** | zé | `ze.mp3` | `public/audio/silabas` |
| **ZEI** | zei | `zei.mp3` | `public/audio/silabas` |
| **ZI** | zí | `zi.mp3` | `public/audio/silabas` |
| **ZO** | zó | `zo.mp3` | `public/audio/silabas` |
| **ZU** | zú | `zu.mp3` | `public/audio/silabas` |

---
Esta lista é feita pelo comando `npm run audios:lista` (quem cuida do código roda de novo
depois de pôr áudios na pasta ou de trocar o `conteudo_licoes.json`).

# Implementacny plan

## Ciel

Vytvorit staticku aplikaciu na ucenie strojopisu s viacerymi profilmi, fyzickymi modelmi klavesnic, jednym pevnym US English rozlozenim a vizualnym navodom prstov vychadzajucim z defaultnej polohy ruk.

Projekt musi byt priebezne udrziavany v spustitelnom stave. Pri vycerpani tokenov alebo preruseni prace musi byt jasne, co funguje, kde sme skoncili a aky je dalsi krok.

## Technologicke rozhodnutia

Pouzit uplne standardne technologie bez build procesu:

- HTML
- CSS
- vanilla JavaScript
- Bootstrap 5 cez CDN
- Bootstrap Icons cez CDN
- js-cookie cez CDN

Volitelne neskor:

- Chart.js cez CDN na grafy pokroku

Ziadny bundler, ziadny framework, ziadny npm workflow v prvej verzii.

## Loop pristup

Kazdy implementacny loop ma rovnaku strukturu:

1. Vybrat maly ciel, ktory dava pouzivatelovi viditelnu hodnotu.
2. Upravit alebo doplnit kod.
3. Overit aplikaciu v browseri alebo aspon cez staticky server.
4. Ulozit spustitelny checkpoint.
5. Aktualizovat `docs/PROGRESS.md`.
6. Aktualizovat `docs/ARCHITECTURE.md`, ak sa zmenil princip alebo datovy model.
7. Zapisat dalsi odporucany krok.

Definition of done pre kazdy loop:

- aplikacia sa otvori bez fatalnej JS chyby,
- hlavna obrazovka je pouzitelna,
- nedokoncene casti maju fallback alebo su skryte,
- dokumentacia hovori pravdu o aktualnom stave.

## Checkpoint pravidla

Po kazdom loope:

- ak je git repozitar dostupny, spravit commit so zmysluplnym nazvom,
- nikdy necommitovat rozbitu medzi-verziu,
- ked sa loop neda dokoncit, zapisat dovod do `docs/PROGRESS.md`,
- ak sa blizi limit kontextu, priorita je stabilizovat spustitelnu verziu a zapisat stav.

Odporucany format commitov:

```text
checkpoint: static app shell
checkpoint: profile storage
checkpoint: keyboard renderer
checkpoint: typing engine basics
```

## Praca pri limite tokenov

Ak sa zacne blizit limit kontextu:

1. Zastavit rozsirovanie scope.
2. Dokoncit alebo vypnut rozpracovanu funkcionalitu tak, aby aplikacia isla spustit.
3. Zapisat presny stav do `docs/PROGRESS.md`.
4. Zapisat nedokoncene rozhodnutia a dalsi krok.
5. Ak je kod spustitelny, spravit checkpoint commit.

Minimalny zapis pred prerusenim:

```text
## Checkpoint YYYY-MM-DD HH:MM

Funguje:
- ...

Rozpracovane:
- ...

Najblizsi dalsi krok:
- ...

Rizika:
- ...
```

## Agentova strategia

Projekt je dostatocne maly na jedneho hlavneho implementacneho agenta, ale oplati sa pouzit silnejsich agentov na izolovane casti, kde je vysoka pravdepodobnost chyb.

### Hlavny implementacny agent

Pouzitie:

- celkova koordinacia,
- rozhodnutia o architekture,
- pisanie hlavneho kodu,
- udrziavanie dokumentacie,
- kontrola spustitelnosti.

Sila:

- silny coding agent s dobrym kontextom celeho projektu.

### UI/UX review agent

Pouzitie po loopoch:

- vizualna klavesnica,
- obrys ruk,
- responzivita,
- citatelnost,
- ergonomia cvicenia.

Sila:

- silny frontend/design review agent.

Tento agent nema robit velke refaktory. Ma hladat konkretne problemy: prekryvy textu, zle mierky, nezrozumitelne stavy, neergonomicke ovladanie.

### Data model review agent

Pouzitie po zavedeni:

- fyzicke modely klavesnic,
- US keyboard layout,
- mapovanie klavesov na prsty,
- oddelenie `code`, labelu a generovaneho znaku.

Sila:

- silny JS/data modelling agent.

Tento agent ma hladat nekonzistencie, nie navrhovat velku platformu.

### QA smoke test agent

Pouzitie po kazdom vacsom loope:

- otvorit aplikaciu,
- prejst zakladny tok,
- overit konzolu,
- skontrolovat, ze profil, vyber layoutu a typing flow nefunguju iba v idealnom pripade.

Sila:

- stredny az silny browser QA agent.

### Kedy agentov nepouzivat

Nepouzivat dalsich agentov na kazdy drobny edit. Overhead sa oplati az ked existuje funkcny kus:

- po prvom UI shelle,
- po profile storage,
- po keyboard rendereri,
- po typing engine,
- po hand-guide vizualizacii.

## Navrhovane implementacne loopy

### Loop 0: Projektova kostra

Vystup:

- `index.html`
- `assets/css/app.css`
- `assets/js/app.js`
- zakladny Bootstrap layout
- aplikacia sa otvori

DoD:

- stranka sa nacita,
- nie je fatalna JS chyba,
- `docs/PROGRESS.md` obsahuje prvy technicky checkpoint.

### Loop 1: Profily a cookies

Vystup:

- predstavenie pouzivatela,
- vytvorenie profilu,
- vyber existujuceho profilu,
- ulozenie do cookies cez js-cookie,
- fallback sprava, ked cookies nie su povolene.

DoD:

- profil prezije reload, ak su cookies povolene,
- aplikacia vie existovat aj bez cookies v session pamati,
- dokumentacia popisuje tvar ulozenych dat.

### Loop 2: Nastavenia klavesnice a pevny US layout

Vystup:

- vyber fyzickej klavesnice:
  - MacBook Air
  - Dell XPS 2018
- pevne rozlozenie US English bez pouzivatelskeho vyberu

DoD:

- vybrane nastavenia sa ulozia k profilu,
- existuje jasne oddelenie fyzickeho modelu a US labelov.

### Loop 3: Renderovanie klavesnice

Vystup:

- vizualna klavesnica z datoveho modelu,
- labely podla pevneho US layoutu,
- aktivny klaves sa vie zvyraznit.

DoD:

- oba fyzicke modely sa daju prepnut,
- layout nekolabuje na desktop sirke,
- rozdiel medzi fyzickym modelom klavesnice a US labelmi je dokumentovany.

### Loop 4: Typing engine

Vystup:

- riadok znakov na pisanie,
- aktualny znak,
- spravne a nespravne zadania,
- zakladna presnost a pocet chyb.

DoD:

- vstup z fyzickej klavesnice posuva cvicenie,
- chyba sa vizualne zobrazi,
- cvicenie ide resetovat.

### Loop 5: Prsty a defaultna poloha ruk

Vystup:

- mapovanie klavesov na prsty,
- home-row defaultna poloha,
- zvyraznenie odporucaneho prsta a cieloveho klavesu,
- kazdy prst ma byt viditelny na svojom vychodzom home pismene.

DoD:

- pre kazdy generovany znak existuje cielovy klaves a prst,
- ked mapovanie chyba, aplikacia nespadne a pouzije fallback.

### Loop 6: Obrys ruk a pohyb

Vystup:

- jednoduchy CSS/SVG obrys ruk,
- animacia z defaultnej pozicie prsta na cielovy klaves,
- kratke naznacenie stlacenia klavesu,
- jasne odlisena lava a prava ruka.

DoD:

- pohyb vychadza vzdy z defaultnej polohy,
- neaktivne prsty ostavaju na svojich home klavesoch,
- UI ostava citatelne,
- animacia nerusi samotne pisanie.

### Loop 7: Lekcie a progres

Vystup:

- viac typov lekcii:
  - riadky klavesnice,
  - kombinacie vsetkych pismen,
  - jednoduche slova,
  - dlhsie slova,
  - frazy,
  - cisla a znamienka,
  - zmysluplne vety,
- jednoduche ukladanie poslednej lekcie a zakladneho progresu,
- volitelne zakladne grafy.

DoD:

- typing strip ostava iba v jednom horizontalnom riadku,
- aktualny znak sa automaticky udrziava vo viditelnom strede riadku,
- cookies nie su pretazene velkymi statistikami,
- vacsie statistiky su oddelene ako buduci kandidat na localStorage.

### Loop 8: Polish a QA

Vystup:

- responzivne doladenie,
- klavesnicova dostupnost,
- kontrast,
- zakladny smoke test checklist.

DoD:

- aplikacia je pouzitelna na beznom notebook displeji,
- hlavne workflowy su zdokumentovane,
- dalsie rozsirienia maju backlog.

## Backlog

- localStorage pre vacsie statistiky,
- import/export profilov,
- pokrocile lekcie po pismenkach,
- diktaty/slova/vety,
- zvukovy feedback,
- viac fyzickych klavesnic,
- editor vlastnych lekcii.

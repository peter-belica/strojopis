# Progress

## Checkpoint 2026-06-28 21:25

Funguje:

- Git repozitar existuje.
- Workspace bol prazdny.
- Bola pripravena dokumentacna kostra projektu.

Pridane subory:

- `README.md`
- `docs/IMPLEMENTATION_PLAN.md`
- `docs/ARCHITECTURE.md`
- `docs/PROGRESS.md`

Rozpracovane:

- Implementacia aplikacie este nezacala.

Najblizsi dalsi krok:

- Loop 0: vytvorit staticku aplikacnu kostru s `index.html`, `assets/css/app.css` a `assets/js/app.js`.

Rizika:

- Zatial neexistuje spustitelna aplikacia. Prvy implementacny loop musi tento stav napravit.

## Checkpoint 2026-06-28 21:35

Funguje:

- Loop 0 bol implementovany.
- Existuje spustitelna staticka aplikacia v `index.html`.
- Pridany je zakladny Bootstrap layout.
- Pouzivatel vie zadat meno alebo prezyvku.
- Aplikacia testuje dostupnost cookies.
- Aktivny profil sa uklada do cookie `strojopis_active_profile`, ak su cookies povolene.
- Pouzivatel vie vybrat fyzicku klavesnicu:
  - MacBook Air
  - Dell XPS 2018
- Pouzivatel vie vybrat jazykovu sadu:
  - slovencina
  - cestina
  - US English
  - British English
  - spanielcina
- Zobrazuje sa jednoduchy riadok znakov a nahlad klavesnice.
- Spravne stlacenie aktualneho znaku posunie kurzor v cviceni.

Pridane subory:

- `index.html`
- `assets/css/app.css`
- `assets/js/app.js`

Rozpracovane:

- Profily zatial podporuju iba jeden aktivny profil.
- Klavesnica je zatial staticky nahlad, nie datovy model fyzickych klavesnic.
- Jazykova sada sa vybera, ale este neprepisuje realne labely klaves.
- Obrys ruk je zatial iba staticky vizualny placeholder.

Najblizsi dalsi krok:

- Loop 1: rozdelit storage a profilovu logiku do modulov, pridat zoznam viacerych profilov ulozenych v cookies a fallback pre session pamat.

Rizika:

- CDN kniznice vyzaduju internet pri prvom nacitani.
- Cookie ulozisko nie je vhodne na vacsie statistiky.

## Checkpoint 2026-06-28 21:55

Funguje:

- Loop 1 bol implementovany.
- Profilova a storage logika je oddelena do `assets/js/profiles.js` a `assets/js/storage.js`.
- Aplikacia podporuje viac profilov.
- Profily sa ukladaju cez cookie index `strojopis_profiles_index`, aktivny profil cez `strojopis_active_profile_id` a jednotlive profily cez `strojopis_profile_<id>`.
- Ked cookies nie su dostupne, storage pouzije runtime pamat do obnovy stranky.
- Existuje migracia stareho Loop 0 profilu z cookie `strojopis_active_profile`.
- UI ma select na prepnutie aktivneho profilu.

Overene:

- V in-app browseri bol vytvoreny test profil.
- Po reloade zostal aktivny profil zachovany.

Rozpracovane:

- Mazanie profilov zatial nie je v UI.
- Profily zatial neobsahuju statistiky cvicenia.

## Checkpoint 2026-06-28 22:00

Funguje:

- Loop 2 bol implementovany.
- Fyzicke modely klavesnic su v `assets/js/keyboard-models.js`.
- Jazykove layouty su v `assets/js/keyboard-layouts.js`.
- Dostupne fyzicke klavesnice:
  - MacBook Air
  - Dell XPS 2018
- Dostupne jazykove sady:
  - slovencina
  - cestina
  - US English
  - British English
  - spanielcina
- Vyber klavesnice a jazyka sa uklada do aktivneho profilu.
- Vizualna klavesnica sa renderuje z fyzickeho modelu a labelov jazykoveho layoutu.

Overene:

- `node --check` presiel pre vsetky JS moduly.
- HTTP server vracia `index.html`, `app.js` a profilovy modul s kodom 200.
- V in-app browseri sa po prepnutiach zachovali nastavenia `Dell XPS 2018` a `British English` aj po reloade.

Rozpracovane:

- Layouty su zatial zjednodusene labely, nie kompletne mapovanie znakov s modifikatormi.
- Typing engine je stale placeholder v `app.js`.
- Obrys ruk je stale staticky placeholder.

Najblizsi dalsi krok:

- Loop 3: dopracovat renderovanie klavesnice ako plnohodnotny komponent, zlepsit rozdiely medzi fyzickymi modelmi, pridat robustne zvyraznenie aktualneho cieloveho klavesu podla `KeyboardEvent.code`.

Rizika:

- Pri realnych narodnych layoutoch bude treba rozhodnut, ci cielovy znak mapujeme podla fyzickeho `code`, `event.key`, alebo kombinacie oboch.

## Checkpoint 2026-06-28 22:20

Funguje:

- Plan bol upraveny na pevny US English layout.
- Ostatne jazykove sady boli vyhodene z UI aj z `keyboard-layouts.js`.
- Profilovy default `languageLayout` je `en-us`.
- Stare profily sa pri dalsom ulozeni budu drzat pevneho `en-us` layoutu.

Rozhodnutie:

- MVP nema riesit slovencinu, cestinu, britsku anglictinu ani spanielcinu.
- Pri typing engine sa pouziva kombinacia `event.key` a `event.code`, ale iba pre US home-row znaky.

## Checkpoint 2026-06-28 22:25

Funguje:

- Loop 3 bol implementovany.
- Vizualna klavesnica sa renderuje z fyzickeho modelu a pevnych US labelov.
- Aktivny cielovy klaves sa zvyraznuje podla `KeyboardEvent.code`, nie podla textoveho labelu.
- Home-row klavesy maju samostatny vizualny stav.
- Obrysy ruk boli opravene:
  - lava a prava ruka su odlisne,
  - ruky su priehladne,
  - ruky su overlay nad klavesnicou,
  - defaultne sedia nad home-row oblastou lavej a pravej ruky.

Rozpracovane:

- Hand-guide je zatial CSS/HTML overlay, nie samostatny `hand-guide.js` modul.
- Presne pozicie prstov nad jednotlivymi klavesmi budu doladene v dalsom hand-guide loope.

## Checkpoint 2026-06-28 22:30

Funguje:

- Loop 4 bol implementovany.
- Typing engine bol presunuty do `assets/js/typing-engine.js`.
- Cvicenie sleduje:
  - aktualny znak,
  - spravne zadania,
  - chybne zadania,
  - pocet pokus,
  - pocet chyb,
  - presnost.
- Riadok znakov zobrazuje stavy `current`, `done` a `error`.
- Reset vynuluje cvicenie aj metriky.

Overene:

- `node --check` presiel pre upravene JS moduly.
- In-app browser po reloade potvrdil:
  - jazykovy select uz neexistuje,
  - UI ukazuje `US English`,
  - aktivny klaves startuje na `KeyA`,
  - lava a prava ruka maju rozdielne transformacie,
  - obrysy ruk maju priehladnost `0.38`,
  - spravny vstup `a` posunie cvicenie na `KeyS`,
  - chybny vstup zvysi pocet chyb a upravi presnost.

Najblizsi dalsi krok:

- Loop 5: pridat mapovanie klavesov na konkretne prsty a zvyraznovat odporucany prst pre aktualny cielovy klaves.

Rizika:

- Aktuala kontrola znaku je prisna: znak aj fyzicky `code` musia sediet. To je dobre pre US layout, ale bude potrebne prehodnotit, ak sa v buducnosti vratia ine layouty.

## Checkpoint 2026-06-28 22:45

Funguje:

- Loop 5 a zaciatok Loop 6 boli implementovane pre hand-guide.
- Pridany je modul `assets/js/hand-guide.js`.
- Kazdy prst ma vlastny transparentny element s `data-finger`.
- Prsty sedia na spravnych home klavesoch:
  - lavy malicek na `A`,
  - lavy prstennik na `S`,
  - lavy prostrednik na `D`,
  - lavy ukazovak na `F`,
  - pravy ukazovak na `J`,
  - pravy prostrednik na `K`,
  - pravy prstennik na `L`,
  - pravy malicek na `;`.
- Aktivny prst sa animuje z home pozicie na cielovy klaves a naznaci stlacenie.
- Cvicenie bolo rozsirene o horny riadok, aby bol pohyb prstov viditelny:
  - `Q/W/E/R`
  - `U/I/O/P`

Overene:

- `node --check` presiel pre `app.js`, `typing-engine.js` a `hand-guide.js`.
- In-app browser po reloade potvrdil:
  - prvy aktivny klaves je `KeyQ`,
  - aktivny prst je `left-pinky`,
  - home pozicia laveho malicka je stred `KeyA`,
  - cielova pozicia laveho malicka je stred `KeyQ`,
  - po stlaceni `q` sa cvicenie posunie na `KeyA`,
  - po stlaceni `a` sa cvicenie posunie na `KeyW` a aktivny je `left-ring`.

Rozpracovane:

- Obrys dlani je zatial jednoduchy CSS tvar.
- Animacia je nekonecna pulzujuca slucka pre aktualny ciel; neskor moze byt naviazana na konkretny keydown event.

Najblizsi dalsi krok:

- Dokoncit Loop 6 vizualnym doladenim: presnejsi tvar dlani, jemnejsi press efekt a kontrola mobile/desktop layoutu.

## Checkpoint 2026-06-28 22:15

Funguje:

- Loop 7 bol zacaty.
- Pridany je modul `assets/js/lessons.js`.
- Typing engine uz nepouziva jeden pevny zoznam znakov, ale aktivnu lekciu.
- UI ma select `Lekcia`.
- Lekcie su rozdelene do postupnosti:
  - home row,
  - upper row,
  - lower row,
  - all letters,
  - simple words,
  - word flow,
  - short phrases,
  - numbers and signs,
  - sentences.
- Riadok znakov na pisanie je uz jeden horizontalny riadok s posuvom, nie zalamovana mriezka.
- Aktualny token sa po renderi posunie do viditelnej oblasti.
- Medzera sa zobrazuje ako sirsi token `space`.

Princip lekcii:

- Najprv sa postupne pridavaju fyzicke riadky klavesnice.
- Po prejdeni pismen sa pridaju jednoduche slova.
- Slova prechadzaju do fraz.
- Cisla a znamienka su samostatna faza po pismenach.
- Posledna faza su jednoduche zmysluplne vety s cislami a interpunkciou.

Rozpracovane:

- Posledna aktivna lekcia sa este neuklada do profilu.
- Progres lekcii este nie je zamknuty/odomykany podla presnosti.
- Lekcie zatial nemaju automaticke odporucanie dalsieho kroku.

Overene:

- `node --check` presiel pre `app.js`, `typing-engine.js`, `lessons.js` a `hand-guide.js`.
- HTTP server vracia `index.html` aj `assets/js/lessons.js`.
- In-app browser po reloade potvrdil:
  - existuje 9 lekcii,
  - typing strip ma `display: flex`,
  - tokeny v home-row lekcii maju jeden riadok,
  - sentence lekcia ma medzery, cislo, ciarku a bodku,
  - sentence lekcia ma horizontalny overflow,
  - sentence lekcia ma stale iba jeden vizualny riadok.

Najblizsi dalsi krok:

- Ukladat poslednu aktivnu lekciu k profilu a pridat minimalne pravidlo odporucania dalsiej lekcie po dokonceni aktualnej s dobrou presnostou.

## Checkpoint 2026-07-06

Funguje:

- Lekcie su presunute z `assets/js/lessons.js` do externych JSON konfiguracii v `content/courses/`.
- Pridane su dva kurzy:
  - `cs-cz`: cestina a ceska klavesnice,
  - `en-gb`: English UK a EN-GB keyboard.
- Jazykove layouty su presunute do `content/keyboard-layouts/`.
- Layout obsahuje aj `charMap`, teda mapovanie pisaneho znaku na fyzicky `KeyboardEvent.code` a pripadne modifikatory `shift` alebo `altGraph`.
- `typing-engine.js` uz neimportuje konkretny zoznam lekcii. Lekcie dostava cez `setLessons`.
- `app.js` pri starte nacita katalog kurzov, aktivny kurz, keyboard layout a nasledne normalizuje lekcie.
- UI ma znovu select `Jazykova sada`, ktory prepina cely kurz aj vizualny layout klavesnice.

Pridane subory:

- `assets/js/lesson-loader.js`
- `content/courses/index.json`
- `content/courses/cs-cz.json`
- `content/courses/en-gb.json`
- `content/keyboard-layouts/cs-cz.json`
- `content/keyboard-layouts/en-gb.json`

Overene:

- `python3 -m json.tool` presiel pre vsetky nove JSON konfiguracie.
- HTTP/fetch test cez lokalny server nacital a normalizoval oba kurzy:
  - `cs-cz`: 16 lekcii,
  - `en-gb`: 16 lekcii.

Rizika:

- Niektore ceske znaky skladane cez mrtve klavesy maju v `charMap` prazdny `code`, preto sa pri nich kontroluje hlavne vysledny znak.
- EN-GB symboly sa mozu medzi OS a fyzickymi klavesnicami mierne lisit. Layout je oddeleny, aby sa dal upravit bez zmeny aplikacneho kodu.

## 2026-10-13 – Nová grafika a prepínateľné vedenie prstov

- Nové rozhranie „Prst po prste“: svetlý podklad, zelené akcenty, kompaktnejšie nastavenia a samostatná tréningová plocha.
- Farebné zóny klávesnice sa zhodujú s prstami na ilustráciách oboch rúk. Aktívny prst spája s cieľovým klávesom čiarkovaná krivka.
- Žiak ešte pred stlačením vidí znak, meno prsta, fyzický kláves a štyri nasledujúce znaky.
- Prepínač „Vedenie prstov“ vypína ruky, spojnicu, pokyn aj farebné zóny a zvýraznenie klávesu. Voľba sa ukladá cez existujúci storage modul do `strojopis_finger_guide` (spoločná pre prehliadač).
- Doplnené mapovanie medzerníka na palec, zátvoriek na malíček a zobrazenie opačného Shiftu pre veľké písmená. Zložené znaky bez fyzického mapovania majú vysvetlenie namiesto vymysleného prsta.
- Písanie medzier neposúva stránku; ovládanie formulárov a klávesové skratky sú oddelené od tréningu. Zmena nastavenia myšou umožňuje pokračovať v písaní.
- Rozloženie sa prispôsobuje menším obrazovkám, spojnica sa prepočíta pri zmene veľkosti. Rešpektuje sa obmedzenie animácií v nastaveniach systému.

Overenie tejto úpravy:

- `node --check` pre `app.js` a `hand-guide.js`; `git diff --check` bez problémov.
- V prehliadači overený správny postup `a → s → d → f → medzerník`, chyba bez postupu na ďalší znak a aktualizácia metrík.
- Vypnutie odstráni aktívne klávesy a ruky; nastavenie prežije obnovenie stránky.
- Lekcia veľkých písmen: `L` zvýrazní `KeyL`, pravý prstenník, `ShiftLeft` a ľavý malíček. `Shift+l` posunie cvičenie.
- Pri šírke 390 px stránka nepresahuje obrazovku; spojnica po zmene veľkosti zostáva medzi správnym prstom a klávesom.
- Konzola prehliadača bez chýb. Náhľad uložený v `docs/preview-prst-po-prste.jpg`.

## Checkpoint 2026-10-15 – Audit a základy

- Aktivovaný trvalý cieľ podľa `AUTONOMOUS_DEVELOPMENT.md`; počiatočné úpravy sú zaznamenané v `INITIAL_STATE.md` a zachované.
- Pôvodná aplikácia overená v Codex prehliadači: správny posun prvého znaku, konzola bez chýb. Audit našiel nezavedené znaky v skorých lekciách.
- Zavedené npm, Vite, Vitest, TypeScript s postupnou kontrolou JavaScriptu a Playwright. Podporované prostredie sa overí podľa skutočnej verzie binárky, nie len názvu cesty.
- Nové verzované lokálne úložisko s pamäťovým režimom, kontrolou údajov, ochranou novšieho formátu a overeným migračným zápisom. Cookies už nie sú bežným úložiskom.
- Implementované ukončenie tréningu, metriky a prevzatie výsledku presne raz. Samotné otvorenie lekcie výsledok nevytvára.
- `tsc --noEmit` a prvé produkčné zostavenie prešli. Chybové vetvy a migráciu ešte treba doložiť testami.

## Checkpoint 2026-10-15 – Obsah a ovládanie

- Pripravených a jazykovo prečítaných 240 pôvodných viet, po 30 na každú kombináciu jazyka a úrovne.
- Validátor kontroluje počty slov, duplicity, identifikátory, jazyk, náročnosť, témy a znaky; prešiel bez chýb.
- Lekcie majú explicitne zavádzané znaky, nezávislé od náročnosti viet. Základná medzera je zavedená od prvej lekcie pre oddelenie skupín klávesov.
- Rozhranie obsahuje posuvník, voľný tréning, výsledok, pokračovanie, pamäťový režim a potvrdenie mazania.
- Ďalší krok: automatizované testy pravidiel a používateľských postupov nad produkčným `dist/`, oprava zistených problémov a finálna dokumentácia.

## Checkpoint 2026-10-15 – Dokončený tréning a finálne overenie

Funguje:

- Miestne profily s potvrdeným mazaním, individuálnym vedením prstov, náročnosťou a fyzickou klávesnicou.
- Samostatné miesto a progres každého kurzu; otvorenie lekcie nevytvára výsledok. Dokončenie sa zaznamená raz, s počtami, presnosťou a aktívnym časom.
- História posledných 100 výsledkov a súhrny najlepšieho a posledného výsledku; opakovanie a pokračovanie.
- `localStorage` po výslovnom vyžiadaní zapamätania, pamäťový režim a pravdivé chyby. Ochrana poškodeného alebo novšieho formátu, migrácia starých cookies až po overenom zápise.
- 240 viet a štyri úrovne v češtine a britskej angličtine. Postupné lekcie filtrujú presné naučené znaky; voľný tréning ponúka všetky úrovne hneď.
- Zložené znaky rozhodujú podľa výsledného textu. Neznáme fyzické mapovanie nemá vymyslený prst. Opravené sú súbehy pri rýchlom prepínaní kurzov a zachytávanie bežných skratiek.

Overenie:

- Skutočne použitý podporovaný Node.js 22.16.0; cesta označená Homebrew `node@24` smerovala na 25.2.1, preto sa nepoužila ako dôkaz verzie.
- Čisté `npm ci` s uloženým lockfile prešlo v oddelenom dočasnom priečinku. Audit inštalácie: 0 známych zraniteľností.
- `npm run typecheck`, `npm test` (45/45), `npm run validate:content` (240 viet), `npm run build` a `npm run test:e2e` (33/33, tri prehliadače) úspešné.
- Produkčný build bol overený v Chromium, Firefoxe a WebKite, vrátane JSON, šírok 390/768/1366, klávesnicového postupu, migrácie a zlyhaní úložiska.
- Natívne ovládanie v Codex prehliadači potvrdilo posun, chybu bez postupu a metriky. Bez chýb konzoly. Aktuálna ukážka zostáva na porte 4173.
- Kompletné dôkazy, hranice ručného overenia a snímky sú v `VALIDATION.md` a `docs/screenshots/`.

Otvorené problémy:

- Žiadna povinná podmienka lokálneho zadania. Súbežné editovanie viacerých kariet, synchronizácia a úplná matica fyzických klávesníc sú mimo tejto verzie.
- Verejné publikovanie a GitHub workflow koordinuje súbežná práca; jeho súbory, README odkazy a Git stav boli zachované. Tento checkpoint sám nepotvrdzuje stav verejného nasadenia.

Ďalší krok:

- Lokálna implementácia je pripravená na používanie. Prípadné ďalšie zmeny overiť piatimi príkazmi z README; nezamieňať lokálne overenie s kontrolou hostingu.

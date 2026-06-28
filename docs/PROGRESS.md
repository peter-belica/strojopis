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

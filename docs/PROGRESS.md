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

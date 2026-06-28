# Architektura

## Zakladny princip

Aplikacia je staticka webova aplikacia bez build procesu. Knihnice sa tahaju cez CDN. Kod ma byt rozdeleny na male JS moduly, ale stale jednoducho citatelny.

## Aktualna struktura

```text
index.html
assets/
  css/
    app.css
  js/
    app.js
    storage.js
    profiles.js
    keyboard-models.js
    keyboard-layouts.js
docs/
  IMPLEMENTATION_PLAN.md
  PROGRESS.md
  ARCHITECTURE.md
```

Aktualna verzia uz ma oddelenu profilovu, storage a keyboard konfiguraciu. Typing engine a hand-guide su zatial sucastou jednoducheho `app.js` flow alebo statickeho placeholderu.

## Cielova struktura

```text
index.html
assets/
  css/
    app.css
  js/
    app.js
    storage.js
    profiles.js
    keyboard-models.js
    keyboard-layouts.js
    typing-engine.js
    hand-guide.js
docs/
  IMPLEMENTATION_PLAN.md
  PROGRESS.md
  ARCHITECTURE.md
```

## Moduly

### `app.js`

Aktualne je hlavny orchestrator UI:

- inicializaciu,
- napojenie event listenerov,
- prepojenie profilov, storage, klavesnice a layoutov,
- render profiloveho selectu,
- render jednoducheho typing stripu,
- render vizualnej klavesnice.

Docasne stale obsahuje placeholder typing flow. Ten sa ma v dalsom loope presunut do `typing-engine.js`.

### `storage.js`

Zodpoveda za:

- detekciu cookies,
- citanie a zapis JSON dat cez js-cookie,
- fallback na runtime pamat, ked cookies nie su dostupne.

Fallback runtime pamat prezije iba aktualne otvorenu stranku. Po reloade bez cookies sa data stratia.

### `profiles.js`

Zodpoveda za:

- vytvaranie profilu,
- zoznam profilov,
- aktivny profil,
- ulozenie nastaveni profilu.

Aktualne cookie kluce:

```text
strojopis_profiles_index
strojopis_active_profile_id
strojopis_profile_<id>
```

Profil obsahuje:

```js
{
  id: "peter",
  name: "Peter",
  keyboardModel: "macbook-air",
  languageLayout: "sk",
  createdAt: "...",
  updatedAt: "..."
}
```

Existuje aj jednorazova migracia zo stareho Loop 0 kluca `strojopis_active_profile`.

### `keyboard-models.js`

Fyzicky tvar klavesnice. Rovnaky fyzicky model sa moze pouzit s viacerymi jazykovymi layoutmi.

Aktualne modely:

- MacBook Air
- Dell XPS 2018

Model obsahuje riadky fyzickych `KeyboardEvent.code` hodnot:

```js
{
  id: "macbook-air",
  name: "MacBook Air",
  rows: [
    ["KeyQ", "KeyW", "KeyE"]
  ]
}
```

### `keyboard-layouts.js`

Mapovanie fyzickych `KeyboardEvent.code` hodnot na zobrazene znaky pre konkretny jazyk.

Aktualne layouty:

- slovencina
- cestina
- US English
- British English
- spanielcina

Layout obsahuje labely pre nahlad klavesnice:

```js
{
  id: "sk",
  name: "Slovencina",
  labels: {
    KeyA: "a",
    KeyS: "s"
  }
}
```

Poznamka: layouty su zatial zakladne UI labely, nie plne presne systemove mapovanie vsetkych modifikatorov.

### `typing-engine.js`

Zatial neexistuje ako samostatny subor. Minimalny typing placeholder je v `app.js`.

Zodpoveda za:

- generovanie cvicenia,
- spracovanie `keydown`,
- posun aktualnej pozicie,
- pocitanie chyb a presnosti,
- reset cvicenia.

### `hand-guide.js`

Zatial neexistuje ako samostatny subor. Obrys ruk je zatial staticky CSS placeholder.

Zodpoveda za:

- mapovanie klavesu na prst,
- urcenie home-row pozicie prsta,
- zvyraznenie cieloveho klavesu,
- instrukciu pre vizualizaciu pohybu ruky.

## Dolezite datove oddelenie

Treba striktne oddelit:

- `KeyboardEvent.code` - fyzicka klavesa, napriklad `KeyA`,
- label klavesu - co je napisane na vizualnej klavese,
- generovany znak - co ma pouzivatel napisat,
- prst - ktorym prstom sa ma klavesa stlacit.

Toto oddelenie je klucove, pretoze fyzicka klavesnica a jazykove rozlozenie su nezavisle veci.

## Cookies

Cookies maju malu kapacitu. V prvej verzii sa do nich maju ukladat iba:

- zoznam profilov,
- meno profilu,
- aktivny profil,
- vybrana fyzicka klavesnica,
- vybrany jazykovy layout,
- zakladne posledne nastavenia.

Vacsie statistiky nepatria do cookies. Ak budu potrebne, pouzit neskor `localStorage`.

## UI obrazovky

Minimalne obrazovky:

- profilova obrazovka,
- nastavenia profilu,
- cvicenie.

Cvicenie obsahuje:

- riadok znakov,
- aktualny znak,
- vizualnu klavesnicu,
- obrys ruk,
- odporucany prst,
- zakladne metriky.

## Chybove pravidla

Aplikacia nesmie spadnut, ked:

- cookies nie su povolene,
- profil nie je ulozeny,
- chyba mapovanie klavesu,
- layout nema label pre konkretny `code`,
- pouzivatel stlaci nepodporovanu klavesu.

V takych pripadoch ma pouzit fallback a pokracovat.

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
docs/
  IMPLEMENTATION_PLAN.md
  PROGRESS.md
  ARCHITECTURE.md
```

Aktualna verzia ma zatial jednu JS entrypoint vrstvu v `app.js`. Dalsie loopy ju budu rozdelovat na mensie moduly.

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

Aktualne obsahuje celu zakladnu logiku aplikacie:

- inicializaciu,
- cookie test,
- aktivny profil,
- nastavenia klavesnice a jazyka,
- render jednoduchej klavesnice,
- placeholder typing flow.

Cielovo bude `app.js` hlavny orchestrator UI:

- inicializacia aplikacie,
- prepinanie obrazoviek,
- napojenie event listenerov,
- prepojenie profilov, klavesnice a typing engine.

### `storage.js`

Zatial neexistuje ako samostatny subor. Cookie helper je v `app.js`.

Zodpoveda za:

- detekciu cookies,
- citanie a zapis JSON dat cez js-cookie,
- fallback na runtime pamat, ked cookies nie su dostupne.

### `profiles.js`

Zatial neexistuje ako samostatny subor. Zakladny aktivny profil je v `app.js`.

Zodpoveda za:

- vytvaranie profilu,
- zoznam profilov,
- aktivny profil,
- ulozenie nastaveni profilu.

### `keyboard-models.js`

Zatial neexistuje ako samostatny subor. Nahlad klavesnice je docasne definovany v `app.js`.

Fyzicky tvar klavesnice. Rovnaky fyzicky model sa moze pouzit s viacerymi jazykovymi layoutmi.

Priklad:

```js
{
  id: "macbook-air",
  name: "MacBook Air",
  rows: [
    [
      { code: "KeyQ", width: 1 },
      { code: "KeyW", width: 1 }
    ]
  ]
}
```

### `keyboard-layouts.js`

Zatial neexistuje ako samostatny subor. Vyber layoutu existuje v UI, ale labely klaves este nie su skutocne premapovane.

Mapovanie fyzickych `KeyboardEvent.code` hodnot na zobrazene znaky pre konkretny jazyk.

Priklad:

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

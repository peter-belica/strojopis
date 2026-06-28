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
    typing-engine.js
    hand-guide.js
docs/
  IMPLEMENTATION_PLAN.md
  PROGRESS.md
  ARCHITECTURE.md
```

Aktualna verzia uz ma oddelenu profilovu, storage, keyboard konfiguraciu, typing engine a hand-guide modul.

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
- prepojenie profilov, storage, klavesnice, US layoutu a typing engine,
- render profiloveho selectu,
- render typing stripu so stavmi,
- render vizualnej klavesnice,
- vyvolanie hand-guide aktualizacie po kazdom renderi klavesnice.

Typing stav je uz presunuty do `typing-engine.js`.

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
  languageLayout: "en-us",
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

Mapovanie fyzickych `KeyboardEvent.code` hodnot na zobrazene znaky pre pevny US English layout.

Aktualny layout:

- US English

Layout obsahuje labely pre nahlad klavesnice:

```js
{
  id: "en-us",
  name: "US English",
  labels: {
    KeyA: "A",
    KeyS: "S"
  }
}
```

Poznamka: ostatne jazykove layouty boli z MVP vyhodene. Ak sa vratia neskor, maju byt riesene ako novy scope.

### `typing-engine.js`

Zodpoveda za:

- cvicenie pre US layout s home-row a hornym radom,
- spracovanie `keydown`,
- posun aktualnej pozicie,
- pocitanie chyb a presnosti,
- reset cvicenia.

### `hand-guide.js`

Zodpoveda za:

- mapovanie klavesu na prst,
- urcenie home-row pozicie prsta,
- zvyraznenie cieloveho klavesu,
- vypocet stredov home a cielovej klavesy z DOM,
- nastavenie CSS premennych pre animaciu prsta.

Aktualny princip:

- kazdy prst ma vlastny element s `data-finger`,
- vsetky prsty su priehladne a sedia na svojej home klavese,
- aktivny prst dostane `--finger-x`, `--finger-y`, `--target-x`, `--target-y`,
- CSS animacia ho posunie z home klavesy na cielovu klavesu, naznaci stlacenie a vrati ho naspat.

Home pozicie:

```text
left-pinky  -> A
left-ring   -> S
left-middle -> D
left-index  -> F
right-index -> J
right-middle-> K
right-ring  -> L
right-pinky -> ;
```

## Dolezite datove oddelenie

Treba striktne oddelit:

- `KeyboardEvent.code` - fyzicka klavesa, napriklad `KeyA`,
- label klavesu - co je napisane na vizualnej klavese v US layoute,
- generovany znak - co ma pouzivatel napisat,
- prst - ktorym prstom sa ma klavesa stlacit.

Toto oddelenie ostava klucove aj pri jednom US layoute, pretoze fyzicka klavesnica a znak z cvicenia stale nie su to iste.

## Cookies

Cookies maju malu kapacitu. V prvej verzii sa do nich maju ukladat iba:

- zoznam profilov,
- meno profilu,
- aktivny profil,
- vybrana fyzicka klavesnica,
- pevny layout marker `en-us`,
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

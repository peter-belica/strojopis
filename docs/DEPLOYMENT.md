# Repozitár, build a verejný web

- Zdrojový kód a dokumentácia: [peter-belica/strojopis](https://github.com/peter-belica/strojopis), vetva `main`.
- Použiteľná aplikácia: [Prst po prste](https://peter-belica.github.io/strojopis/).
- Hotové statické súbory: [vetva gh-pages](https://github.com/peter-belica/strojopis/tree/gh-pages).
- Kontroly a publikovanie: [GitHub Actions](https://github.com/peter-belica/strojopis/actions/workflows/pages.yml).

## Princíp

GitHub zobrazuje súbory repozitára. GitHub Pages z hotových súborov poskytuje web, ktorý sa po kliknutí na odkaz otvorí priamo v prehliadači. Návštevník nepotrebuje nič inštalovať ani zostavovať.

Build znamená zostavenie: Vite spojí a optimalizuje zdrojový kód do priečinka `dist/` a pribalí verzovaný obsah kurzov. Relatívna základná cesta `./` umožňuje fungovanie aj pod adresou `/strojopis/`. Node.js je potrebný iba pri vývoji a zostavení; hotový web podáva statický hosting.

GitHub Actions automatizuje tento postup po každom pushi do `main`:

1. Nainštaluje presné závislosti z `package-lock.json` cez `npm ci`.
2. Overí typy a jednotkové testy.
3. Overí obsah, vytvorí produkčný build cez `npm run build` a cez Playwright overí používateľské postupy nad týmto buildom v prehliadačoch Chromium, Firefox a WebKit.
4. Uloží celý build do vetvy `gh-pages`; správa commitu odkazuje na zdrojový commit. Túto vetvu netreba ručne upravovať.
5. Nahrá rovnaký build ako artefakt a publikuje ho na GitHub Pages.

Pri chybe kontroly sa nový web nepublikuje. Pull request (PR, návrh zmeny) spúšťa kontroly a zostavenie bez publikovania. Workflow, teda automatický postup, možno spustiť aj ručne cez **Actions → Verify, build and publish → Run workflow**.

CI/CD znamená priebežnú integráciu a doručovanie: každá zmena sa najprv overí a až úspešný výsledok sa sprístupní návštevníkom. `npm` je správca balíčkov pre Node.js; `npm ci` používa presné verzie uložené v lockfile.

## Nastavenie hostingu

V repozitári je potrebné mať **Settings → Pages → Build and deployment → Source: GitHub Actions**. Publikovací workflow používa krátkodobý vstavaný `GITHUB_TOKEN`; vlastný trvalý token ani ďalšia platená služba nie sú potrebné. Na zápis zostavených súborov má build job oprávnenie `contents: write`; deploy job má iba `pages: write` a `id-token: write`.

Hlavná vetva obsahuje zdroje a dokumentáciu, nie závislosti `node_modules/` ani miestny priečinok `dist/`. Build je napriek tomu súčasťou toho istého Git repozitára vo vetve `gh-pages`. Obe histórie pred migráciou, pôvodné lokálne checkpointy aj úvodný GitHub commit, zostávajú zachované.

## Lokálne spustenie a build

```sh
git clone https://github.com/peter-belica/strojopis.git
cd strojopis
npm ci
npm run dev
```

Produkčnú verziu over:

```sh
npm run build
npm run preview
```

Na samostatný statický hosting stačí preniesť celý obsah `dist/`, vrátane `assets/` a `content/`. Sťahovanie buildu z GitHubu nahrádza otvorenie živého webu iba pri vlastnom hostingu. Otváranie `index.html` cez `file://` nie je podporované, pretože prehliadač obmedzuje moduly a načítavanie kurzov.

## Overenie nasadenia

Úspech potvrdzuje zelený workflow, commit v `gh-pages` a otvorenie verejnej adresy. Pri kontrole treba overiť aj načítanie oboch jazykových kurzov pod `/strojopis/` a vytvorenie miestneho profilu. Konkrétny výsledok prvého nasadenia je zaznamenaný nižšie po jeho dokončení.

## Potvrdené nasadenie – 16. októbra 2026

- Zdrojový commit: [`57069b8`](https://github.com/peter-belica/strojopis/commit/57069b80c9c48042cf52f4917e522386974cc4f2).
- [Automatické overenie a publikovanie](https://github.com/peter-belica/strojopis/actions/runs/38856678711) skončilo úspešne. Prešlo `npm ci`, typová kontrola, 45 jednotkových testov, validácia 240 viet, produkčné zostavenie a testy celých postupov v troch prehliadačoch.
- Statické súbory sú commitnuté vo vetve `gh-pages`. Následné zmeny v `main` prechádzajú tým istým overením a publikovaním.
- Verejná stránka vracia HTTP 200, teda úspešnú odpoveď webového servera, a používa HTTPS, šifrované spojenie.
- Priamo na verejnej adrese bolo overené načítanie anglického a českého kurzu pod `/strojopis/`, vytvorenie dočasného profilu, správny posun po napísaní `asdf` a český voľný tréning viet. Konzola bola bez chýb a varovaní. Opätovné otvorenie obnovilo čistý stav bez dočasného profilu, keďže zapamätanie nebolo zapnuté.
- Kontrolovaná odpoveď na načítanie HTML neobsahovala `Set-Cookie`. Toto je konkrétne technické pozorovanie; nepredstavuje audit prevádzkových záznamov poskytovateľa hostingu.
- [Snímka skutočne nasadeného webu](screenshots/live-deployment.jpg).

Dokumentácia lokálneho vývoja a jeho podrobného overenia zostáva v [VALIDATION.md](VALIDATION.md). Neúspešný prvý beh počas súbežného dokončovania vývoja nepublikoval web; nasledujúce overené verzie boli publikované automaticky.

# Knižnice a komerčné použitie

Projekt používa len závislosti s overenou bezplatnou licenciou povoľujúcou komerčné použitie. Pravidlo platí aj pre budúce fonty, obrázky a modely. Povinnosti pri distribúcii, napríklad zachovanie autorských oznámení, zostávajú v platnosti.

## Ruky

Výpočet pohybu používa **Fullik 1.3.3**, licencia **MIT**. Tá povoľuje aj predaj a komerčné použitie pri zachovaní licencie a autorských oznámení. Oficiálny zdroj: https://github.com/lo-th/fullik, commit `3f22da98a0fa0051416b20077af5142aec3dfc2e`. Súbor `assets/vendor/fullik/provenance.json` obsahuje kontrolné súčty SHA-256; prevzatý JavaScript ani licencia neboli upravené. Keďže pôvodný balík nie je v registri npm, používa sa pripnutá lokálna kópia oficiálneho modulu. Žiadne načítavanie knižnice z cudzieho servera počas tréningu.

Licencia je v `assets/vendor/fullik/LICENSE` a v distribučnom `THIRD_PARTY_NOTICES.txt`, ktorý sa kopíruje aj do produkčného zostavenia. Zachované sú oznámenia z modulu aj licenčného súboru výrobcu. Lokálny súbor typových deklarácií nie je súčasťou prevzatého kódu.

Ruky sú vlastná vektorová kresba nad kĺbovým modelom: zápästie a štyri body na každom prste. Články majú nemenné dĺžky v troch rozmeroch; pri ohnutí sa skracuje iba ich priemet na klávesnicu. Fullik vypočíta polohy kĺbov. Pri väčšom dosahu sa posúva dlaň, pri kombináciách sa môže aj natočiť. Široké klávesy majú dostupný kontaktný bod vo vnútri klávesu, nie povinne v jeho strede. Proporcie sú štylizované pre výučbu, nejde o medicínsky model.

Pri návrhu sa posúdili aj [Three.js CCDIKSolver](https://threejs.org/docs/pages/CCDIKSolver.html) a [štruktúra bodov MediaPipe Hand Landmarker](https://developers.google.com/edge/mediapipe/solutions/vision/hand_landmarker). Ich kód ani naučené modely sa do aplikácie nepridávajú. Fullik poskytuje potrebný výpočet bez celého trojrozmerného renderovacieho systému. Externý obrázok, platený model ani font sa kvôli rukám nepoužíva.

## Existujúce vývojové závislosti

Kontrola `package-lock.json` k 19. októbru 2026 zahŕňa 84 balíkov vrátane nepriamych a platformových variantov:

| Licencia | Počet záznamov | Použitie |
| --- | ---: | --- |
| MIT | 44 | Zostavenie a testy |
| Apache-2.0 | 26 | TypeScript, Playwright a súvisiace balíky |
| MPL-2.0 | 12 | Lightning CSS a jeho platformové varianty |
| ISC | 1 | Vývojová závislosť |
| BSD-3-Clause | 1 | Vývojová závislosť |

MPL-2.0 je tiež bezplatná licencia povoľujúca komerčné použitie; pri distribúcii jej kódu má podmienky pre príslušné zdrojové súbory. V tomto projekte ide o nástroj na spracovanie CSS pri zostavení, jeho program sa neposiela návštevníkovi. [Výklad správcu licencie Mozilla, najmä otázky 5 a 8](https://www.mozilla.org/en-US/MPL/2.0/FAQ/).

Fonty sa vyberajú zo systémových fontov zariadenia; projekt neposkytuje stiahnuteľné fontové súbory.

`npm run validate:licenses` kontroluje licenčné identifikátory všetkých balíkov v lockfile, licenciu Fullik, nezmenenosť prevzatých súborov a prítomnosť distribučného oznámenia. Je súčasťou každého `npm run build`. Pri novej knižnici je stále potrebné skontrolovať konkrétne podmienky a prípadné licencie pribalených grafických podkladov.

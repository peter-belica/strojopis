# Zadanie autonómneho vývoja aplikácie Strojopis

Cieľom je dokončiť prvú lokálne spustiteľnú a otestovanú verziu existujúcej aplikácie „Prst po prste“. Používateľ si vytvorí miestny profil, vyberie kurz a náročnosť textu, precvičuje písanie a po ďalšom otvorení pokračuje v poslednej lekcii. Aplikácia funguje bez aplikačného servera a bez účtu u poskytovateľa.

Toto je zadanie na spustenie vývoja, nie potvrdenie dokončenej implementácie. Východiskový stav bol preskúmaný 15. októbra 2026.

## Prednosť požiadaviek

Pri implementácii dodrž aktuálne pokyny používateľa a platné `AGENTS.md`. Toto zadanie nahrádza staršie produktové a technologické požiadavky v projektovej dokumentácii tam, kde si odporujú: najmä cookies ako hlavné úložisko, zákaz vývojového zostavenia a historické obmedzenie na americké rozloženie klávesnice.

Na začiatku prečítaj `README.md`, `docs/ARCHITECTURE.md`, `docs/IMPLEMENTATION_PLAN.md`, posledné záznamy `docs/PROGRESS.md` a skutočný kód. Dokumentácia môže byť zastaraná; opis súčasného správania over podľa implementácie a v prehliadači.

## Východiskový stav a rozsah

- Existuje statické rozhranie v HTML (štruktúra stránky), CSS (vzhľad) a JavaScripte rozdelenom na moduly.
- Existujú profily, fyzické modely klávesnic, výber lekcie, vyhodnocovanie vstupu a prepínateľná pomôcka pre prsty.
- Kurzy a jazykové rozloženia sú samostatné súbory JSON (textový formát štruktúrovaných údajov). Katalóg aktuálne obsahuje češtinu `cs-cz` a britskú angličtinu `en-gb`.
- `assets/js/storage.js` používa `js-cookie`; `index.html` ho načítava zo služby jsDelivr. Náhrada lokálnym úložiskom je súčasťou práce.
- Typing engine po poslednom znaku aktuálne opakuje lekciu. Doplň jasné dokončenie a zaznamenanie výsledku.
- Existujú necommitnuté úpravy aj nové súbory. Najprv zaznamenaj počiatočný stav Gitu a zachovaj ich; nič nehromadne nevracaj ani nemaž.

Rozhranie zostáva slovenské. Pre prvú verziu vygeneruj nové vety pre oba existujúce jazyky kurzov. Tento jazykový rozsah vychádza z aktuálneho projektu; nový slovenský kurz ani ďalšie rozloženia nie sú podmienkou dokončenia tohto zadania.

Výsledkom je lokálne predvediteľná verzia a statické súbory pripravené na hosting. Pri tejto práci sa nevyžaduje verejné publikovanie. Server, ktorý iba podáva statické súbory, je v rozsahu; databáza, serverové účty, synchronizácia medzi zariadeniami, platby a generovanie textov cez externú službu počas používania sú mimo rozsahu.

## Architektúra a výber technológií

Zachovaj existujúci vizuálny smer a použiteľné moduly. Preferuj webové štandardy a malé množstvo stabilných, udržiavaných závislostí. Nová knižnica musí riešiť konkrétny problém a mať stručne zdokumentovaný dôvod použitia.

Odporúčaný základ pre túto veľkosť aplikácie:

| Oblasť | Voľba a dôvod |
| --- | --- |
| Rozhranie | Existujúce HTML, CSS a JavaScript moduly; priebežné úpravy sú menšie než prepis celej aplikácie. |
| Kontrola údajov v kóde | TypeScript na kontrolu typov; existujúci JavaScript možno najprv kontrolovať cez `checkJs` a typové komentáre JSDoc. Nové zložitejšie moduly môžu byť v TypeScripte. |
| Vývoj a zostavenie | Vite: lokálny vývojový server a zostavenie statických súborov. Produkčné používanie nepotrebuje Node.js server. |
| Testy pravidiel aplikácie | Vitest: nezávislé testy výpočtov, migrácií, výberu textov a dokončenia lekcie. |
| Testy v prehliadači | Playwright: overenie celého používateľského postupu vrátane opätovného otvorenia stránky. |
| Ukladanie | Natívne `localStorage` za malým modulom, ktorý možno testovať a neskôr vymeniť. |
| Obsah | Verzované JSON súbory v repozitári s automatickou kontrolou obsahu a stabilnými identifikátormi. |

React ani iný framework nie je pre tento rozsah povinný. Ak z auditu vyplynie podstatná výhoda zmeny, zapíš porovnanie prínosu a ceny a rozhodni samostatne. Nepridávaj serverový framework ani univerzálnu platformu kvôli hypotetickému budúcemu rozšíreniu.

Over kompatibilné stabilné verzie vo vydaniach a oficiálnej dokumentácii. Použi jedného správcu balíčkov a ulož jeho lockfile, teda súbor presných verzií závislostí. Závislosti a ostatné zdroje potrebné pri používaní podávaj z rovnakého pôvodu ako aplikáciu; odstráň externé načítavanie skriptov, fontov a ikon.

Oddeľ tieto zodpovednosti, bez povinného hromadného presúvania súborov:

1. **Rozhranie:** zobrazenie stavu, formuláre, posuvník a dostupnosť ovládania.
2. **Pravidlá tréningu:** vstup, pozícia, chyby, dokončenie a výsledok; bez prístupu k stránke alebo úložisku.
3. **Obsah a výber textu:** kurzy, úrovne náročnosti, načítanie a validácia textov.
4. **Profil a progres:** nastavenia používateľa, naposledy vybraná lekcia a súhrny výsledkov.
5. **Perzistencia:** čítanie, zápis, verzovanie a migrácie uloženého formátu.
6. **Klávesnica a prsty:** fyzický kláves, výsledný znak, modifikátory a grafická pomôcka.

Fyzické rozloženie, jazyk textu a náročnosť viet sú samostatné pojmy. Nevymýšľaj fyzický kláves ani odporúčaný prst pre znak, ktorého mapovanie nie je známe.

## Funkčné požiadavky

### Lokálny profil a pokračovanie

- Používateľ môže vytvoriť profil s prezývkou, prepínať profily a vymazať konkrétny profil aj všetky údaje aplikácie. Mazanie potvrď v rozhraní a obmedz ho na vlastné kľúče aplikácie.
- Prezývka nemusí byť skutočné meno. Nepýtaj e-mail, dátum narodenia ani skutočný vek.
- Ku každému profilu ukladaj fyzickú klávesnicu, kurz, úroveň textu a nastavenie vedenia prstov. Historickú spoločnú voľbu vedenia prstov možno použiť ako migračnú predvolenú hodnotu.
- Poslednú lekciu a progres ukladaj osobitne podľa kurzu, aby prepnutie jazyka nestratilo miesto v inom kurze.
- Po opätovnom otvorení obnov aktívny profil, jeho nastavenia a poslednú vybranú lekciu. Prvá verzia nemusí obnovovať rozpracované cvičenie na presnom znaku.
- Ukladaj dokončené lekcie, počet dokončených pokusov, najlepší výsledok a posledný výsledok. Výsledok obsahuje aspoň počet pokusov o znak, počet chýb, presnosť a čas dokončenia.
- Definuj presný výpočet metrík. Ak pridáš WPM (words per minute, slová za minútu), vysvetli konvenciu piatich znakov na jedno štandardné slovo a meranie aktívneho času.
- Históriu jednotlivých výsledkov obmedz najviac na 100 posledných záznamov na profil; staršie súhrny môžu zostať agregované. Neukladaj záznam každého stlačenia klávesu.

### Ukladanie a ochrana údajov

- Nahradiť cookies natívnym `localStorage`. Nepridávať analytiku, reklamu, sledovacie identifikátory ani odosielanie profilov a výsledkov mimo zariadenia.
- Ukladať len údaje potrebné na používateľom vyžiadané zapamätanie tréningu. Pred prvým trvalým uložením jasne vysvetliť účel a umožniť používanie bez zapamätania v pamäti otvorenej stránky. Ovládanie tejto funkcie nenazývať všeobecným právnym súhlasom.
- Zobraziť stručné informácie o uložených údajoch, ich vymazaní a tom, že vymazanie údajov prehliadača alebo zmena zariadenia odstráni prístup k miestnemu progresu. Lokálne profily nie sú chránené prihlasovaním a môžu byť dostupné ďalším používateľom rovnakého profilu prehliadača.
- Formát má `schemaVersion`; pri načítaní over štruktúru, platnosť identifikátorov a rozsahy hodnôt. Staršie podporované verzie migruj. Novšiu neznámu verziu neprepisuj starším formátom.
- Zachytiť nedostupné úložisko, chybu pri čítaní alebo zápise, vyčerpanú kapacitu aj poškodený JSON. Aplikácia ďalej funguje v pamäti a pravdivo oznámi, že zmeny po zatvorení nezostanú uložené. Nezobrazovať takúto správu ako výzvu na súhlas s cookies.
- Existujúce vlastné cookies jednorazovo preniesť, ak používateľ využije zapamätanie a údaje sú platné. Odstrániť ich až po overenom úspešnom zápise a načítaní nového záznamu. Pri chybe ponechať pôvodné údaje. Po úspešnej migrácii už cookies nepoužívať; knižnicu `js-cookie` odstrániť.
- Zápisy súhrnov robiť pri významných udalostiach; pri každom stlačení klávesu nezapisovať celú históriu.

**Právny princíp:** článok 5 ods. 3 smernice ePrivacy sa týka aj iných úložísk než cookies. Výnimka pre údaje nevyhnutné na výslovne vyžiadanú službu závisí od účelu a konkrétneho použitia. Tento návrh obmedzuje ukladanie na funkciu zapamätania tréningu; samotný názov technológie nie je dôkazom výnimky. Pred verejným nasadením posúď každý uložený údaj podľa príslušnej vnútroštátnej úpravy. Zhrnutie účelov a rozsahu overenia zapíš do dokumentácie. Pozri [usmernenia Európskeho výboru pre ochranu údajov, najmä odseky 1 a 4 a poznámku 4](https://www.edpb.europa.eu/system/files/documents/2024-10/edpb_guidelines_202302_technical_scope_art_53_eprivacydirective_v2_en_0.pdf).

### Náročnosť viet a obsah

Použi jeden prístupný posuvník so štyrmi krokmi. Zobraz názov vybranej úrovne a krátku ukážku. Každý profil si môže zvoliť ľubovoľnú úroveň bez zisťovania veku; vekové pásma sú orientačné označenie obsahu, nie meranie schopností dieťaťa.

| Úroveň | Orientačné publikum | Pravidlá obsahu | Česká ukážka |
| --- | --- | --- | --- |
| 1 Veľmi jednoduché | 6–8 rokov | Krátke vety, bežné konkrétne slová, približne 3–7 slov na vetu. | Malý pes běží domů. |
| 2 Jednoduché | 8–12 rokov | Bežné príbehy, škola a príroda, približne 6–12 slov na vetu. | Po škole jsme na zahradě zasadili malé rajče. |
| 3 Stredne náročné | 12–16 rokov | Pestrejšia slovná zásoba, súvetia a neutrálne vysvetlenia, približne 10–20 slov na vetu. | Když jsme porovnali oba návrhy, našli jsme řešení, které šetří čas. |
| 4 Náročné | Dospelí | Dlhšie vety a bežné abstraktné témy, približne 12–30 slov na vetu. | Při plánování společného projektu je užitečné nejprve stanovit cíle, rozdělit odpovědnost a domluvit způsob průběžného hodnocení výsledků. |

- Pre každý existujúci jazyk a každú zo štyroch úrovní priprav aspoň 30 rôznych, jazykovo skontrolovaných viet: spolu minimálne 240 viet pre dva jazyky.
- Vety vygeneruj pri vývoji a ulož do repozitára. Pri používaní aplikácia iba vyberá z pripravenej sady; nepotrebuje externý model ani platenú službu.
- Použi pôvodné, zmysluplné texty. Detské témy majú byť primerané veku; dospelá úroveň označuje jazykovú náročnosť.
- Vety majú prirodzenú gramatiku a interpunkciu. Automaticky over jedinečné identifikátory, neprázdny text, duplicity, platné jazykové identifikátory a úrovne; jazykovú správnosť navyše prečítaj.
- Odporúčané metadáta: `id`, `language`, `difficulty`, `text`, `topics`. Technické počty znakov a slov môže validátor odvodiť, aby nevznikli dva nezávislé zdroje pravdy.
- Postupné lekcie klávesov zachovaj. Čitateľská náročnosť a už naučené klávesy sú dve samostatné osi: výber textu v postupnom kurze nesmie zaviesť neprebrané znaky. Zohľadni aj medzeru, veľké písmená a interpunkciu.
- Ak pre obmedzené klávesy neexistuje vhodná veta, zobraz dostupné cvičenie slov alebo klávesov a krátke vysvetlenie. Nevydávaj nezmyselnú kombináciu slov za vetu ani nezaraďuj nepodporovaný znak.
- Pridaj voľný tréning viet bez pedagogického obmedzenia na prebrané klávesy, stále podľa zvoleného jazyka a úrovne. Tak možno vyskúšať všetky úrovne hneď.
- Pri zmene posuvníka nemeň rozpracovaný text uprostred písania. Novú úroveň použi pri ďalšom cvičení; používateľ môže aktuálne cvičenie vedome reštartovať.
- Ak sada obsahuje viac vhodných textov, neopakuj bezprostredne predchádzajúci text. Výber textu musí byť testovateľný.

### Priebeh cvičenia a použiteľnosť

- Zachovať aktuálny znak, zvýraznenie chyby, presnosť, mapu klávesnice a zapínateľné vedenie prstov.
- Správny vstup posunie cvičenie, nesprávny zvýši počet chýb a nechá používateľa na rovnakom znaku. Výpočet presnosti musí byť konzistentný s týmto pravidlom.
- Na konci zobraziť výsledok a voľbu opakovať alebo pokračovať. Dokončenie zapísať presne raz; samotné otvorenie lekcie nie je dokončenie.
- Národné znaky a vstup cez mŕtve klávesy alebo skladanie znakov správne vyhodnocovať podľa výsledného znaku. Pomocné udalosti a samotné modifikátory nezapočítavať ako chyby. Pre chýbajúce fyzické mapovanie použiť vysvetlenie bez zavádzajúceho prsta.
- Tréning nesmie zachytávať písanie do prezývky, ovládanie posuvníka ani bežné skratky prehliadača.
- Všetky ovládacie prvky musia mať zrozumiteľné názvy, ovládanie klávesnicou a viditeľné zameranie. Výsledok sa nesmie rozlišovať iba farbou; rešpektovať obmedzenie animácií.
- Over rozloženie aspoň pri šírkach 390, 768 a 1366 pixelov. Celá stránka nesmie vodorovne pretekať; samotný riadok cvičenia alebo klávesnica môžu mať účelový vnútorný posuv.
- Desktop s fyzickou klávesnicou je hlavné použitie. Menšia obrazovka musí zostať čitateľná; samostatná dotyková výučba nie je podmienkou tejto verzie.

## Dokumentácia výsledku

Aktualizuj existujúce dokumenty, aby opisovali skutočnú výslednú implementáciu:

- `README.md`: účel, požiadavky na prostredie, presné spustenie, kontrolné príkazy a návod na predvedenie.
- `docs/ARCHITECTURE.md`: zodpovednosti modulov, tok vstupu a údajov, uložený formát a jeho verzovanie, migrácia cookies, účely lokálneho ukladania a rozšírenie obsahu. Pri rozhodnutiach krátko vysvetli princíp, prínos a obmedzenie; vysvetli použité skratky.
- `docs/IMPLEMENTATION_PLAN.md`: aktuálne míľniky s overiteľnými podmienkami namiesto zastaraných požiadaviek na cookies a pevný americký layout.
- `docs/PROGRESS.md`: po každom míľniku stručne doplň zmenu, výsledok overenia, otvorené problémy a presný ďalší krok. Historické záznamy ponechaj ako históriu.
- `docs/VALIDATION.md`: záverečné výsledky príkazov a testovaných postupov, prehliadače, známe obmedzenia a prípadné neoverené podmienky.

## Míľniky a samostatné rozhodovanie

1. **Audit a plán:** zaznamenaj počiatočný stav, spusti existujúcu aplikáciu, over základný postup a doplň aktuálny plán a architektonické rozhodnutia.
2. **Spoľahlivé základy:** zaveď vývojové nástroje, lokálne zdroje, typovú kontrolu, `localStorage`, migráciu a odolnosť proti chybám úložiska.
3. **Obsah a ovládanie:** priprav korpus viet, validáciu, štyri úrovne posuvníka a oddelenie od postupných lekcií klávesov.
4. **Dokončený tréning:** doplň výsledok, progres, pokračovanie po opätovnom otvorení a izoláciu profilov aj kurzov.
5. **Overenie a odovzdanie:** oprav zistené chyby, over produkčné zostavenie v prehliadači, dokonči dokumentáciu a priprav lokálnu ukážku.

Po míľniku over jeho výsledok, zaznamenaj dôkazy a pokračuj samostatne ďalším. Bežné technické rozhodnutia rob podľa tohto zadania; rozhodnutie stručne zapíš. Nepýtaj sa na potvrdenie každého kroku a neukončuj prácu po vytvorení samotnej kostry alebo plánu.

Pri zlyhaní testu najprv zisti príčinu a oprav implementáciu alebo nesprávny test. Neoslabuj kritériá len preto, aby test prešiel. Pred dokončením prever vlastné zmeny aj proti pôvodným funkciám aplikácie.

Ak je skutočne potrebný chýbajúci údaj alebo oprávnenie prostredia, pomenuj konkrétnu prekážku a potrebný vstup; pokračuj ostatnými nezávislými časťami. Nemôžeš obchádzať oprávnenia. Verejné publikovanie, platené služby, zdieľanie alebo odosielanie údajov nie sú súčasťou tohto lokálneho zadania.

Pri prerušení zapíš do `docs/PROGRESS.md` posledný stabilný stav, výsledky kontrol a ďalší krok. Po obnovení nadviaž na tento stav. Commituj len vlastné overené zmeny; nezahrň do commitu nesúvisiace pôvodné úpravy používateľa.

## Overiteľná definícia dokončenia

Implementácia je hotová až po splnení všetkých nasledujúcich podmienok:

- [ ] Čistá inštalácia podľa README funguje s uloženým lockfile a zdokumentovanou podporovanou verziou Node.js.
- [ ] Existujú a úspešne prejdú `npm run typecheck`, `npm test`, `npm run validate:content`, `npm run build` a `npm run test:e2e`. E2E znamená end-to-end, teda test celého používateľského postupu.
- [ ] Testy pravidiel pokrývajú poškodené a neplatné dáta, migrovaný formát, zlyhanie zápisu, dokončenie presne raz, metriky a výber viet podľa jazyka, náročnosti a dostupných znakov.
- [ ] V prehliadači prejde vytvorenie dvoch profilov, ich prepínanie, rozdielne nastavenia, dokončenie lekcie, opätovné otvorenie a obnovenie poslednej lekcie aj progresu správneho profilu a kurzu.
- [ ] Posuvník má štyri dostupné úrovne, nastavenie sa ukladá k profilu a všetky úrovne sa dajú predviesť vo voľnom tréningu.
- [ ] Obsahuje aspoň 30 rôznych viet na úroveň a jazyk, spolu minimálne 240, a kontrola obsahu prejde bez nevyriešených chýb.
- [ ] Je overená úspešná migrácia starých cookies aj neúspešný zápis, pri ktorom pôvodné údaje zostanú zachované.
- [ ] Nový profil nevytvára cookies; aplikácia ani jej zdroje neposielajú požiadavky na cudzie domény. Over aj cookies a sieťové požiadavky hostingu, ak neskôr pribudne nasadenie.
- [ ] Pri nedostupnom úložisku funguje tréning v pamäti a rozhranie pravdivo vysvetlí obmedzenie. Je otestované vymazanie jedného profilu aj všetkých vlastných údajov bez zásahu do cudzích kľúčov.
- [ ] Produkčné zostavenie bolo overené aspoň v Chromium, Firefoxe a WebKite, vrátane načítania JSON súborov. Testy netestujú iba vývojový server.
- [ ] V automatizovanom teste funguje národný zložený znak aj modifikátory. Test syntetickej udalosti nie je dôkazom správnosti všetkých fyzických klávesnic; dostupné ručné overenie a jeho rozsah sú zapísané.
- [ ] Pri uvedených šírkach zostáva rozhranie použiteľné, ovládanie funguje klávesnicou a pri hlavných postupoch nevznikajú neošetrené chyby v konzole.
- [ ] Aplikácia obsluhovaná lokálnym statickým serverom funguje aj bez prístupu na internet, pretože nepotrebuje externé zdroje. Inštalácia závislostí môže internet vyžadovať; inštalovateľný offline režim po vypnutí servera nie je v rozsahu.
- [ ] Dokumentácia zodpovedá kódu a záverečný záznam obsahuje konkrétne výsledky overenia. Nesplnená alebo neoverená povinná podmienka znamená nedokončenú prácu, ktorú treba výslovne uviesť.

## Príkaz na spustenie

V prostredí Codex s podporou Goals použi:

```text
/goal Dokonči existujúcu aplikáciu Strojopis podľa docs/AUTONOMOUS_DEVELOPMENT.md až po splnenie celej overiteľnej definície dokončenia. Najprv preskúmaj aktuálny projekt a zachovaj rozpracované zmeny. Samostatne pokračuj cez všetky míľniky, priebežne aktualizuj dokumentáciu a opravuj zistené chyby. Výsledkom má byť funkčná lokálna ukážka a overené statické zostavenie bez backendu, s lokálnym progresom a štyrmi úrovňami textov. Dokončenie dolož testami a záverečným záznamom v docs/VALIDATION.md. Ak ďalší postup závisí od chýbajúceho vstupu alebo oprávnenia, uveď konkrétnu prekážku a pokračuj nezávislými časťami.
```

Goal je trvalý cieľ chatu s podmienkami dokončenia. Umožňuje nadväzovanie medzi pracovnými krokmi; vykonávanie zostáva podriadené limitom, oprávneniam a ovládaniu používateľom. Pozri [oficiálny návod OpenAI na Goals](https://developers.openai.com/cookbook/examples/codex/using_goals_in_codex).

Ak prostredie príkaz `/goal` nepodporuje, použi rovnaký text ako bežné zadanie bez tohto prefixu. Po prerušení možno nadviazať pokynom „Pokračuj podľa zadania a posledného checkpointu v docs/PROGRESS.md“.

## Referencie k nástrojom

- [Vite a jeho statické zostavenie](https://vite.dev/guide/)
- [Kontrola JavaScriptu pomocou TypeScriptu](https://www.typescriptlang.org/tsconfig/checkJs.html) a [typové komentáre JSDoc](https://www.typescriptlang.org/docs/handbook/jsdoc-supported-types.html)
- [Vitest](https://vitest.dev/guide/)
- [Playwright](https://playwright.dev/docs/intro)
- [Odporúčania OpenAI pre dlhšie vývojové zadania a overiteľné míľniky](https://developers.openai.com/blog/run-long-horizon-tasks-with-codex)

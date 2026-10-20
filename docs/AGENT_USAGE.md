# Meranie práce agentov

Práca bola rozdelená na integráciu, klávesnice a mapovania, rozhranie, dlhšie cvičenia, pohyb rúk a nezávislé testy. Živé míľniky boli oznamované v hlavnom chate. `agent-tasks.json` určuje hranice úloh; `agent-usage.csv` obsahuje jeden riadok za úlohu, aj za koordinátora.

## Zdroj a reprodukcia

`npm run report:agents` spustí `scripts/agent-report.py`. Skript číta lokálne súbory Codex `sessions/**/*.jsonl`, vyberá presné ID hlavného chatu a jeho priamych podagentov. Číta iba metadáta, čas a udalosti `token_count`; text rozhovorov sa do výstupu nedostáva. JSONL znamená textové JSON záznamy, každý na samostatnom riadku. CSV je tabuľkový textový formát.

Spotreba úlohy je súčet rozdielov po sebe idúcich kumulatívnych počítadiel v jej časovom intervale. Predchádzajúca práca hlavného chatu sa odpočíta. Opakovaná snímka nemení výsledok. Ak počítadlo klesne, samostatné kladné úseky sa spočítajú a riadok upozorní na reset. Testy zahŕňajú hranice intervalu, duplicity, reset a chýbajúce údaje: `npm run test:report`.

- `input_tokens`: zaznamenaný vstup vrátane kontextu a výsledkov nástrojov, aj pri jeho opakovanom použití.
- `cached_input_tokens`: časť vstupu načítaná z cache, teda vyrovnávacej pamäte.
- `cache_write_input_tokens`: zaznamenané zápisy cache, ak ich zdroj poskytol.
- `output_tokens`: zaznamenaný výstup modelu.
- `reasoning_output_tokens`: vykázané uvažovanie modelu.
- `total_tokens`: priamo vykázaný súčet zo zdroja. Rozpisové polia sa k nemu znova nepripočítavajú.

`measured` označuje dokončenú úlohu so zaznamenanými počítadlami; `partial_snapshot` priebežnú snímku. `measured_through_utc` označuje posledný zahrnutý záznam. Časy sú strojové časové značky UTC; miestny čas projektu je Europe/Prague. Bez zdrojových záznamov alebo konkrétneho počítadla sa zapíše **nedostupné**, nie nula ani odhad.

Koordinátor má vždy `partial_snapshot`: súbor vzniká ešte počas jeho práce a nezahŕňa modelovú aktivitu po poslednej snímke ani záverečnú odpoveď. Po jej doručení sa report dá znovu vytvoriť. Posledné počítadlá podagentov sú rovnako údaje poskytnuté prostredím, nie fakturačný audit. Skript nesčíta rôzne riadky do neovereného fakturačného celku. Hodnoty môžu zahŕňať cache a opakovaný kontext, preto nie sú počtom jedinečných slov ani cenou v eurách.

Model a reasoning sa čítajú zo skutočného `turn_context`, nie iba z plánovaného priradenia. Špecialisti použili GPT-6.1 Sol s `medium` alebo `high`; koordinátor zachoval nastavenie existujúceho chatu `xhigh`. Reasoning znamená úroveň úsilia venovaného uvažovaniu.

Jeden riadok je celá pridelená úloha. Prerušené doplnkové kontroly a následné pokračovanie rovnakého zadania zostávajú v jej spotrebe. Samostatné tokeny za jednotlivý shellový príkaz sa nevymýšľajú: model môže pripraviť viac volaní a spoločne vyhodnotiť ich výstupy. Skript nepristupuje k účtu ani k fakturácii, nevyžaduje API kľúč a neposiela záznamy mimo zariadenia.

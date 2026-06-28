# Strojopis

Staticka webova aplikacia na ucenie strojopisu. Cielom je mat vzdy spustitelnu verziu bez build procesu: `index.html`, CSS a vanilla JS moduly, kniznice cez CDN.

## Aktualny stav

Projekt ma prvu spustitelnu staticku kostru. Implementacia ide v kratkych loopoch, kde kazdy loop konci:

- spustitelnou verziou aplikacie,
- zapisom do `docs/PROGRESS.md`,
- pripadnou aktualizaciou principialnej dokumentacie,
- jasnym dalsim krokom.

## Dokumentacia

- `docs/IMPLEMENTATION_PLAN.md` - hlavny plan implementacie a loop pristup.
- `docs/PROGRESS.md` - priebezny log prace a checkpointy.
- `docs/ARCHITECTURE.md` - kratka principialna dokumentacia k modulom a datovym modelom.

## Spustenie

Spustit lokalny staticky server:

```bash
python3 -m http.server 8000
```

a otvorit:

```text
http://localhost:8000
```

# Východiskový stav – 15. októbra 2026

Práca nadväzuje na aktuálny lokálny checkout, bez resetu a bez nového worktree.
Pred implementáciou boli modifikované: `assets/css/app.css`, `assets/js/app.js`,
`hand-guide.js`, `keyboard-layouts.js`, `lessons.js`, `profiles.js`, `typing-engine.js`,
`docs/ARCHITECTURE.md`, `docs/PROGRESS.md` a `index.html`.
Nesledované boli `assets/js/lesson-loader.js`, `content/`, zadanie autonómneho vývoja
a `docs/preview-prst-po-prste.jpg`. Tieto práce sa zachovávajú a ďalej rozvíjajú.
Počiatočný patch je počas práce aj v `/private/tmp/strojopis-initial.patch`.

Pôvodná verzia bola otvorená na `http://127.0.0.1:8000` v Codex prehliadači.
Stlačenie `a` posunulo pozíciu z 1 na 2, bez chýb v konzole.
Prvá lekcia však obsahovala nezavedené veľké písmeno a bodku;
ukladanie používalo externý js-cookie a tréning sa po dokončení opakoval.

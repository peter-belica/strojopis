# Fyzické klávesnice a systémové rozloženia

Klávesnica má tri nezávislé voľby: fyzický model, národné rozloženie a operačný systém. Jazyk cvičenia je ďalšia samostatná voľba. Rovnaký znak sa podľa systému píše iným fyzickým klávesom: britské `@` je na macOS Shift + 2, vo Windows Shift + kláves apostrofu. Preto sa správnosť textu naďalej hodnotí výsledným znakom; mapa iba vedie prsty.

## Kontrakt modulov

`getKeyboardModel(id)` vracia `keys`, `rows`, `width`, `height`, `variant`. Súradnice sú normalizované na rozstup bežného písmenového klávesu; nejde o rozmery v milimetroch. `rows` zachováva kompatibilitu a obsahuje každý kláves práve raz. `getKeyGeometry(modelOrId, code)` vracia geometriu alebo `null`.

- `macbook-air`: referenčný MacBook Air M3, ISO, 79 zobrazených klávesov; plná výška funkčného radu, Touch ID a obrátené T šípok.
- `macbook-air-ansi`: rovnaký základ, ANSI, 78 klávesov.
- `dell-xps-2018`, `dell-xps-2018-ansi`: zachovaný Dell, rozlíšený nízkym funkčným radom, Insert/Delete, Ctrl a Page Up/Down nad bočnými šípkami. Referenčná rodina je XPS 13 9370; rozmery sú schémou, nie výkresom výrobcu. Samostatné tlačidlo napájania mimo bloku nie je vykreslené.

ISO (International Organization for Standardization, Medzinárodná organizácia pre normalizáciu) označuje variant s vysokým zalomeným Enterom a dodatočným klávesom pri ľavom Shifte. ANSI (American National Standards Institute, Americký národný normalizačný inštitút) má vodorovný Enter a dlhší ľavý Shift. Pri `shape: 'iso-enter'` je rámček 1,5 × 2 jednotky a ľavý dolný zárez má šírku 1/6 rámčeka. `pressX/pressY` určujú skutočný bod stlačenia v spodnom stĺpiku. Touch ID je vizuálny prvok; aplikácia mu nepripisuje dostupnú udalosť prehliadača.

`loadKeyboardLayout(locale='en-gb', platform='mac', variant='iso')` načíta lokálny JSON (textový formát štruktúrovaných údajov) zo systémového podpriečinka a vyrieši fyzický variant. Podporované sú `sk-sk`, `cs-cz`, `es-es` zo Španielska, štandardné `en-us`, britské `en-gb`, platformy `mac` a `windows`. Verejné pole `KEYBOARD_LOCALES` a `KEYBOARD_PLATFORMS` poskytujú dvojice `id/name`. Vrátené rozloženie je úplne vyriešené; interné `variants` sa pri ISO nevracajú.

Každá známa položka `charMap` obsahuje `steps`: fyzické kroky v poradí. `code` zostáva prvým krokom pre starší kód. `shift/altGraph` sú kompatibilné metadáta prvého kroku; presné vedenie používa `steps[].modifiers`. Shift sa volí na opačnej ruke. Na macOS sa Option reprezentuje fyzickým `AltLeft` alebo `AltRight`, vo Windows je AltGr (alternate graphic, alternatívna znaková vrstva) pravý `AltRight`. Voľba strany Option je pedagogická; obe strany majú pri týchto zdrojoch rovnakú znakovú funkciu.

Mŕtvy kláves zatiaľ nevytvorí výsledný znak: napríklad `ď` v češtine a slovenčine je Shift + Equal s `dead: true`, potom KeyD. `Á` je Equal s `dead: true`, potom Shift na opačnej ruke + KeyA. Shift + číslica sa za veľké národné písmeno nevymýšľa. Priame kombinácie majú prednosť pred dlhšími postupmi. Neznáme znaky sa do mapy nedopĺňajú odhadom. Windows US je štandardné US, nie US International; nemá domyslené mŕtve klávesy pre `á`.

Pri ANSI sa mapa vytvorila znovu bez `IntlBackslash`; ak znak existuje na inom overenom klávese, použije sa táto alternatíva. Inak zostane neznámy. Napríklad španielske Windows `<` a `>` nemajú v ANSI profile tento ISO kláves k dispozícii. Mac US na ISO má `§` pod Escape a spätný apostrof pri ľavom Shifte, zatiaľ čo ANSI má spätný apostrof pod Escape. Zmena modelu teda musí znovu načítať vyriešené rozloženie.

## Overenie a pôvod

Overené 19. októbra 2026:

- Všetkých päť macOS zdrojov sa čítalo priamo zo systémového `AppleKeyboardLayouts.bundle` na macOS 26.6.2, zostavenie 25G83: `com.apple.keylayout.Slovak`, `Czech`, `Spanish-ISO`, `US`, `British`. Názvy `Czech-QWERTY`, `Slovak-QWERTY`, `British-PC`, `USInternational-PC` ani druhý španielsky zdroj sa nezamieňali za tieto voľby.
- Extrakcia použila read-only Carbon `TISCreateInputSourceList`, `kTISPropertyUnicodeKeyLayoutData`, `UCKeyTranslate`, modifikačné stavy 0, Shift, Option, Shift + Option a skutočné natívne tabuľky zloženia. Pre druhý krok sa skúšal základný a Shift stav. Za dokončený jednopísmenový výstup sa prijal iba postup, po ktorom nasledujúci obyčajný kláves už dával svoj normálny znak; súkromné bity stavu mŕtveho klávesu sa neinterpretovali. API znamená rozhranie na volanie funkcií programu.
- Číselné typy sa potvrdili lokálnym SDK (Software Development Kit, vývojová súprava) `Gestalt.h` aj priamym `KBGetLayoutType`: **40 = ANSI, 41 = ISO**. Finálne dáta boli extrahované s týmito typmi. Typ 0 nie je v konečných dátach použitý.
- Natívne tabuľky a fyzické pozície na ISO vyžadujú most medzi kódmi 0x0A a 0x32. Pre ISO ide natívny 0x0A na `Backquote`, 0x32 na `IntlBackslash`; pre ANSI 0x32 na `Backquote` a dodatočný ISO kláves sa vynechá. Rovnakú opravu pri `UCKeyTranslate` dokumentuje primárny [zdrojový kód SDL](https://github.com/libsdl-org/SDL/blob/main/src/video/cocoa/SDL_cocoakeyboard.m); SDL je Simple DirectMedia Layer, knižnica pre vstup a multimédiá. Pre ostatné písmenové pozície je použitá štandardná fyzická tabuľka Carbon.
- Windows mapy boli odvodené z oficiálnych HTML tabuliek Microsoftu: základ, Shift, AltGr, Shift + AltGr; zloženia zo zoznamov `DeadKey`. Základ pre druhý krok sa vyhľadal v tom istom profile. Podporuje sa bežný český/slovenský QWERTZ, nie voliteľné QWERTY varianty.

Primárne podklady:

- [Apple: identifikácia národného a fyzického variantu](https://support.apple.com/en-us/102743), [M3 Air: 78/79 klávesov, plná výška funkčných klávesov a obrátené T](https://support.apple.com/en-us/118551).
- [Apple: pravidlá UCKeyTranslate](https://developer.apple.com/documentation/coreservices/1390584-uckeytranslate).
- Microsoft: [Slovak 0000041B](https://learn.microsoft.com/en-us/globalization/keyboards/kbdsl.html), [Czech 00000405](https://learn.microsoft.com/en-us/globalization/keyboards/kbdcz.html), [Spanish 0000040A](https://learn.microsoft.com/en-us/globalization/keyboards/kbdsp.html), [US 00000409](https://learn.microsoft.com/en-us/globalization/keyboards/kbdus_7.html), [United Kingdom 00000809](https://learn.microsoft.com/en-us/globalization/keyboards/kbduk.html). Čísla sú KLID, identifikátory rozloženia Windows.
- [Dell XPS 13 9370: oficiálna príručka](https://dl.dell.com/topicspdf/xps-13-9370-laptop_Setup-Guide_en-us.pdf).

Automatické testy overujú všetkých 20 kombinácií systému, jazyka a geometrie; unikátne postupy, skutočnú existenciu všetkých klávesov/modifikátorov, konkrétne nezávislé očakávania a hranice geometrie. Neuskutočnilo sa fyzické stláčanie kombinácií na piatich národných klávesniciach ani na zariadení s Windows. Natívny preklad a dokumentované tabuľky sú overenie dát; nie sú náhradou hardvérového testu v každom prehliadači. Vlastné premapovania klávesov alebo ďalšie varianty operačného systému zostávajú mimo profilu.

Pôvodné koreňové `content/keyboard-layouts/cs-cz.json` a `en-gb.json` zostávajú kompatibilnými historickými dátami kurzov a validátora. Nové runtime mapy sú v `mac/` a `windows/`; aplikácia ich vyberá cez loader. Historické neznáme `ď/Á` sa tým nemenia spätne v legacy teste, nové runtime profily už obsahujú overené kroky.

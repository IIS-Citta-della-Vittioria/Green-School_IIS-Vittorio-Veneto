# Green School - IIS Citta della Vittoria

Sito statico espositivo del progetto Green School.
Stack: HTML, CSS, JavaScript vanilla.
Pubblicazione consigliata: GitHub Pages (gratuito).

## 1) Obiettivo del sito
Questo repository e stato organizzato per:
- comunicare in modo istituzionale ma energico il progetto Green School;
- valorizzare annualita, risultati e team;
- consentire passaggio consegne semplice da un anno scolastico al successivo.

## 2) Struttura cartelle
- index.html: homepage con hero video e overview progetto
- pages/: pagine tematiche (progetto, edizione corrente, news, partecipa, contatti)
- archive/: indice archivio e schede annuali
- archivio/: pagine storiche gia presenti (legacy)
- css/style.css: design system globale
- js/main.js: menu mobile, reveal on scroll, contatori
- assets/: immagini, video, materiali media

## 3) Flusso annuale di aggiornamento (procedura consigliata)
A inizio anno scolastico:
1. Duplica archive/2025-2026.html in nuova pagina, ad esempio archive/2026-2027.html.
2. Aggiorna titolo annata, cronoprogramma, progetti e nominativi Energy Team.
3. In archive/index.html aggiungi la card della nuova annualita.
4. In pages/edizione-corrente.html aggiorna contenuti con l'annata corrente.
5. In homepage index.html aggiorna call to action e indicatori (metriche).

Durante l'anno:
1. Verifica periodicamente pages/news.html (la sezione energia e aggiornata automaticamente dal workflow).
2. Inserisci foto/video in assets/ e collega i contenuti nelle pagine.
3. Mantieni coerenza nel tono (formale, chiaro, orientato ai risultati).

A fine anno:
1. Consolida risultati e team nella scheda annuale definitiva.
2. Verifica accessibilita minima (contrasto, tastiera, testi alternativi immagini).
3. Archivia e prepara la nuova scheda per l'anno successivo.

## 4) Inserimento logo scuola
Quando avrai caricato il logo:
1. Metti il file in assets/images/ (esempio: logo-scuola.png).
2. Inserisci il logo nella navbar sostituendo o affiancando il testo brand.
3. Mantieni altezza contenuta (circa 36-44px desktop, 30-36px mobile).

## 5) Gestione video homepage
Attualmente la home usa una sorgente video esterna (terra dallo spazio) per velocita di avvio progetto.
Per usare un file locale:
1. Inserisci il file in assets/videos/ (esempio: earth-loop.mp4).
2. In index.html sostituisci la source video con:
   <source src="assets/videos/earth-loop.mp4" type="video/mp4">
3. Mantieni il file ottimizzato (H.264, 1080p max, bitrate contenuto).

## 6) Accessibilita implementata
- skip link iniziale
- navigazione da tastiera con focus visibile
- struttura semantica (header, nav, main, section, footer)
- rispetto prefers-reduced-motion
- contrasto elevato per testi principali

Controlli da fare ad ogni rilascio:
1. Navigazione solo tastiera su tutte le pagine.
2. Verifica responsive su mobile, tablet, desktop.
3. Test testo su sfondi con contrasto sufficiente.

## 7) Avvio locale
Opzione semplice:
- Apri la cartella in VS Code e usa estensione Live Server.

Opzione Python:
- Da terminale nella cartella progetto:
  python -m http.server 8080
- Apri: http://localhost:8080

## 8) Setup GitHub da zero
Se non hai repository:
1. Crea account GitHub (se non lo hai).
2. Crea nuovo repository pubblico, esempio: green-school-site.
3. Copia URL HTTPS del repository.
4. Da terminale nella cartella progetto esegui:
   git init
   git add .
   git commit -m "Initial Green School site"
   git branch -M main
   git remote add origin https://github.com/TUO-USERNAME/green-school-site.git
   git push -u origin main

## 9) Attivare GitHub Pages
1. Apri il repository su GitHub.
2. Vai in Settings > Pages.
3. In Build and deployment scegli:
   - Source: Deploy from a branch
   - Branch: main
   - Folder: / (root)
4. Salva.
5. Attendi il deploy (1-3 minuti).
6. URL finale tipico:
   https://TUO-USERNAME.github.io/green-school-site/

## 10) Aggiornamento contenuti e pubblicazione
Ogni volta che modifichi il sito:
1. git add .
2. git commit -m "Aggiornamento contenuti Green School"
3. git push

GitHub Pages pubblichera automaticamente la nuova versione.

## 10-bis) News automatiche giornaliere (energia rinnovabile)
Il progetto include un sistema automatico che aggiorna `data/news.json` una volta al giorno.

Componenti:
1. `scripts/update_news_feed.py`: aggrega feed RSS di settore.
2. `.github/workflows/update-news.yml`: esecuzione giornaliera e commit automatico del JSON.
3. `pages/news.html`: render dinamico delle notizie.

Fonti preconfigurate (modificabili nello script):
1. QualEnergia
2. UN Climate News
3. IEA News
4. PV Magazine

Manutenzione:
1. Se una fonte smette di funzionare, aggiornare URL nel file `scripts/update_news_feed.py`.
2. Per test manuale, avviare il workflow da GitHub Actions (`workflow_dispatch`).
3. Se il feed e vuoto, la pagina News mostra fallback automatico senza rompere il layout.

## 11) Linee editoriali consigliate
- tono formale, preciso, orientato all'azione;
- periodi chiari, non troppo lunghi;
- evidenziare obiettivi, indicatori, risultati;
- evitare linguaggio promozionale eccessivo.

## 12) Fonti ispirative contenuti iniziali
I testi iniziali sono bozza redazionale e si ispirano a temi di:
- educazione alla sostenibilita
- transizione energetica
- obiettivi di sviluppo sostenibile (SDG)

Sostituire progressivamente con dati ufficiali interni approvati.

## 13) Note operative per il passaggio consegne
Per il referente dell'anno successivo:
1. Leggere questo README integralmente.
2. Aggiornare prima pages/edizione-corrente.html e archive/index.html.
3. Verificare tutti i link del menu.
4. Eseguire commit piccolo e frequente con messaggi chiari.
5. Pubblicare solo dopo approvazione finale contenuti.

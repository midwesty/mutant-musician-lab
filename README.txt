Mutant Musician Lab MVP

How to run:
1) Put the whole folder on your computer.
2) Serve it from a simple local web server. Do not double-click index.html because JSON fetches may be blocked by your browser.
3) Example:
   - If you have Python installed:
     - open a terminal in this folder
     - run: python -m http.server 8000
     - open: http://localhost:8000
4) The game saves to localStorage in your browser.

MVP features included:
- starter kit selection
- full custom embryo creation
- multiple musicians at once
- real-time need decay while closed
- life stages over about 3 real days
- role system
- genre, vice, trait, and mutation generation
- gigs on real timers
- DNA archive and rebirth clones
- optional archive DNA splicing during creation
- inventory and shop
- death, freezing, revival kit
- battle JSON export/import
- practice system
- built-in cheat terminal

Asset notes:
- SVG backgrounds are already included as placeholders.
- Audio file paths are wired into the code, but missing files gracefully fall back to simple beeps.
- You can replace SVGs or add your own audio files later without changing the code as long as you keep the same filenames or update data/audioMap.json.

Suggested test flow:
1) Pick a starter kit.
2) Open Lab and create 2 or 3 more embryos.
3) Use Cheats to age one to adult.
4) Buy items from Shop and use them from Inventory.
5) Send the adult to a gig.
6) Open DNA Archive and rebirth a clone.
7) Open Battle / Practice and export/import JSON.

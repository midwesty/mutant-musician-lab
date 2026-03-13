Mutant Musician Lab v2

How to run
1) Put the whole folder on your computer.
2) Serve it from a simple local web server. Do not double-click index.html because JSON fetches may be blocked by your browser.
3) Example:
   - open a terminal in this folder
   - run: python -m http.server 8000
   - open: http://localhost:8000

What changed in this package
- genealogy panel now uses a more visual family-tree style DNA layout
- bands now exist as their own objects with combined aggregate stats
- five local save slots in Settings
- shared-room studio upgrade panel added for the MVP structure
- portrait-first responsive layout retained
- existing dirty handheld / grungy sticker visual direction kept
- CSS idle/pulse/critical animation toggles added

Notes
- Audio paths are wired, but missing files fall back to beeps.
- Save data is stored in localStorage per save slot.
- The first run lets you incubate up to 3 starter embryos at once.
- Real-time need decay continues while the browser is closed.

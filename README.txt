DEAF COMMUNITY LETTER GAMES
===========================

What you get:
- index.html         -> main game page (mobile responsive)
- style.css          -> styles (touch-friendly)
- game.js            -> game logic for both modes (well commented)
- assets/letters/    -> placeholder SVG letter images (A.svg ... J.svg) - replace with your own
- placeholder.svg    -> fallback image if a letter image is missing
- words.json         -> list of target words for the 'Collect Letters' mode (edit this to add your own words)

Features:
1) Guess the Letter (multiple choice):
   - Shows an image (from /assets/letters/LETTER.svg) and 4 letter choices.
   - Correct answer briefly highlights green then loads next round.
   - Useful for matching sign images to letters (upload your handshape images as LETTER.svg files).

2) Collect Letters (Make Words):
   - Shows slots for a target word. Tap letters from the pool to fill slots.
   - Tap a filled slot to remove the letter and return it to the pool.
   - Word list is in words.json; edit it to control which words appear.

How to add your own images:
- Replace files in /assets/letters/ with your images named exactly like this:
  A.svg, B.svg, C.svg, ... (or .png/.jpg; SVG is recommended for crispness)
- If you have images for only certain letters, the game limits the Guess mode to the first 10 letters (A-J) to avoid missing-files errors. You can edit game.js to expand that range after adding more images.

Running locally:
- Open index.html in a browser or use VS Code + Live Server for best experience.
- The game is fully client-side (no backend required).

Notes & next steps (ideas you can ask me to add):
- Add sound cues (visual + audio) for correct/incorrect answers.
- Let players upload images via an admin page and map them to letters.
- Add score saving using localStorage or server-side storage (I can add a Node backend if you want).
- Improve accessibility: add ARIA labels and keyboard control for all interactive elements.

Comments in code:
- game.js and index.html include comments explaining where to customize behavior and how to replace images.

Have fun! If you want, I can:
- Convert the letter images into a nicer UI with thumbnails and progress tracking.
- Add a scoring system, levels, and a simple leaderboard saved to localStorage.
- Create an "upload images" admin page so you can add your own images from your phone.

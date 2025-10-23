// game.js - Two modes: Guess the Letter & Collect Letters to Make Words
// Replace or add your own letter images under /assets/letters with filenames A.svg, B.svg, ...

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
// Sample words for collect mode. You can edit /words.json or change this array.
let WORDS = ['CAT','DOG','BREAD','HAND','SIGN','DEAF','HELLO','TREE','FAMILY'];

// Try to load words.json (optional). If present it should contain either an array of words
// or an object with a `words` array. This runs in the browser; failures are ignored and
// the built-in WORDS are used as a fallback.
window.__wordsLoadedPromise = fetch('words.json')
  .then(r=>{ if(!r.ok) throw new Error('no file'); return r.json(); })
  .then(data=>{
    if(Array.isArray(data)) WORDS = data.map(w=>String(w).toUpperCase());
    else if(data && Array.isArray(data.words)) WORDS = data.words.map(w=>String(w).toUpperCase());
    console.info('Loaded words.json —', WORDS.length, 'words');
  })
  .catch(()=>{ console.info('words.json not found or invalid — using built-in words'); });

// Utility to pick random items
function pick(arr,n){ const copy = arr.slice(); const out=[]; for(let i=0;i<n;i++){ if(copy.length===0) break; const idx=Math.floor(Math.random()*copy.length); out.push(copy.splice(idx,1)[0]); } return out; }

// Elements
const area = document.getElementById('game-area');
const btnBack = document.getElementById('btn-back');
const status = document.getElementById('status');

btnBack.addEventListener('click', ()=>{ showMenu(); });

document.getElementById('mode-guess').addEventListener('click', ()=> startGuessMode());
document.getElementById('mode-collect').addEventListener('click', ()=> startCollectMode());

function showMenu(){ area.innerHTML=''; status.innerText='Choose a mode above to start playing.'; }

// -------- Guess Mode --------
async function startGuessMode(){
  area.innerHTML = '';
  status.innerText = 'Guess the letter that matches the image.';
  const card = document.createElement('div'); card.className='card';
  const imgWrap = document.createElement('div');
  imgWrap.className='letter-img';
  const img = document.createElement('img'); img.alt='letter image'; img.style.width='100%';
  imgWrap.appendChild(img);
  card.appendChild(imgWrap);
  const choices = document.createElement('div'); choices.className='choices';
  card.appendChild(choices);
  area.appendChild(card);

  // Load a round
  async function newRound(){
    choices.innerHTML='';
    // pick a random correct letter from available set (we'll limit to first 10 sample images to avoid missing files)
    const pool = LETTERS.slice(0,10); // adjust as you add images
    const correct = pick(pool,1)[0];
    // build image path (user should replace assets/letters/LETTER.svg with their own images)
    img.src = '/assets/letters/' + correct + '.jpg';
    img.onerror = ()=>{
      img.src = '/assets/letters/placeholder.svg';
    }
    // create 4 choices (1 correct + 3 random)
    const opts = [correct].concat(pick(pool.filter(x=>x!==correct),3));
    // shuffle
    for(let i=opts.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [opts[i],opts[j]]=[opts[j],opts[i]]; }
    opts.forEach(o=>{
      const b = document.createElement('button'); b.className='choice'; b.innerText=o; b.setAttribute('aria-label','Choose '+o);
      b.addEventListener('click', ()=>{
        if(b.classList.contains('disabled')) return;
        if(o===correct){ b.classList.add('correct'); status.innerText='Correct! Loading next...'; setTimeout(newRound,900); }
        else{ b.classList.add('wrong'); status.innerText='Try again.'; b.classList.add('disabled'); }
      });
      choices.appendChild(b);
    });
  }
  newRound();
}

// -------- Collect Mode (Make Words) --------
async function startCollectMode(){
  // ensure words.json (if present) has been loaded before picking a target
  if(window.__wordsLoadedPromise) await window.__wordsLoadedPromise;
  area.innerHTML=''; status.innerText='Collect letters to form the target word.';
  const wrapper = document.createElement('div'); wrapper.className='card';
  const hint = document.createElement('div'); hint.className='word-hint'; hint.innerHTML='<strong>Form this word:</strong>';
  wrapper.appendChild(hint);
  const slots = document.createElement('div'); slots.className='slots'; wrapper.appendChild(slots);
  const poolWrap = document.createElement('div'); poolWrap.className='letters-pool'; wrapper.appendChild(poolWrap);
  area.appendChild(wrapper);

  // choose a target word
  const target = pick(WORDS,1)[0];
  // display the hint as the actual target letters (spaced) so users can see the word to form
  const hintText = document.createElement('div'); hintText.className='hint-text';
  hintText.style.letterSpacing = '6px'; hintText.style.marginTop = '8px';
  hintText.innerText = target.split('').join(' ');
  hint.appendChild(hintText);
  // build pool: letters of word + random extras
  const letters = target.split('');
  const extras = pick(LETTERS.filter(l=>!letters.includes(l)), Math.max(3, letters.length));
  const pool = letters.concat(extras);
  // shuffle
  for(let i=pool.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [pool[i],pool[j]]=[pool[j],pool[i]]; }

  // create empty slots
  slots.innerHTML='';
  for(let i=0;i<target.length;i++){
    const s = document.createElement('div'); s.className='slot'; s.dataset.index = i; s.dataset.letter=''; s.innerText='';
    slots.appendChild(s);
  }

  // create pool buttons (touch friendly)
  poolWrap.innerHTML='';
  // helper to try multiple extensions then fallback to placeholder
  function setLetterImgSrc(img, letter){
    const exts = ['.jpg','.png','.svg'];
    let i = 0;
    function tryNext(){
      if(i>=exts.length){
        // all attempts failed: replace the image element with a text fallback
        const span = document.createElement('span');
        span.className = 'letter-fallback';
        span.innerText = letter;
        span.style.display = 'inline-block';
        span.style.width = img.style.width || '40px';
        span.style.height = img.style.height || '40px';
        span.style.textAlign = 'center';
        span.style.lineHeight = img.style.height || '40px';
        if(img.parentNode) img.parentNode.replaceChild(span, img);
        console.warn('Letter image not found for', letter, '— using text fallback.');
        return;
      }
      img.onerror = tryNext;
      img.src = '/assets/letters/' + letter + exts[i];
      i++;
    }
    tryNext();
  }

  pool.forEach(l=>{
    const b = document.createElement('button'); b.className='letter-btn'; b.draggable = false; b.dataset.letter = l;
    b.setAttribute('aria-label','Pick letter '+l);
  // create an image inside the button
  const bi = document.createElement('img'); bi.alt = l; bi.style.width='40px'; bi.style.height='40px'; bi.style.objectFit='contain';
  b.appendChild(bi);
  setLetterImgSrc(bi, l);

    b.addEventListener('click', ()=>{
      // find first empty slot
      const empty = Array.from(slots.children).find(x=>!x.dataset.letter);
      if(!empty) return;
  // insert an image into the slot
  const si = document.createElement('img'); si.alt = l; si.style.width='48px'; si.style.height='48px'; si.style.objectFit='contain';
  empty.innerHTML = '';
  empty.appendChild(si);
  setLetterImgSrc(si, l);
  empty.dataset.letter = l;
      b.disabled = true; b.classList.add('used');
      checkComplete();
    });
    poolWrap.appendChild(b);
  });

  // allow tapping on slot to remove letter
  slots.addEventListener('click', (e)=>{
    const s = e.target.closest('.slot'); if(!s) return;
    const L = s.dataset.letter; if(!L) return;
    // enable the first used button matching this letter (we store letter in dataset)
    const btn = Array.from(poolWrap.querySelectorAll('.letter-btn')).find(x=>x.dataset.letter===L && x.disabled);
    if(btn){ btn.disabled = false; btn.classList.remove('used'); }
    s.innerHTML=''; s.dataset.letter='';
    status.innerText='';
  });

  function checkComplete(){
    const formed = Array.from(slots.children).map(s=>s.dataset.letter||'').join('');
    if(formed.length === target.length && formed === target){
      status.innerText = 'Well done! You formed the word: '+target;
      // reveal the full word in the hint area
      hintText.innerText = target.split('').join(' ');
      // celebrate: simple animation
      slots.style.transition='transform 0.35s'; slots.style.transform='scale(1.05)';
      setTimeout(()=>{ slots.style.transform=''; },800);
    } else if(formed.length === target.length){
      status.innerText = 'Not quite — check the letters and try again.';
    }
  }
}

// Start with menu
showMenu();

// Accessibility: allow keyboard navigation to menu buttons
document.addEventListener('keydown', (e)=>{
  if(e.key==='Escape') showMenu();
});

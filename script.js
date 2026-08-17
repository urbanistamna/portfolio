// ---- a couple of tiny synthesized tones for the gallery cards' open/close, no audio
// files needed, just short Web Audio blips. Browsers block audio playback until a real
// user gesture happens, so the AudioContext is created lazily on the page's very first
// pointerdown/keydown, then reused for every hover/click/keyboard open after that. ----
let audioCtx = null;
function unlockAudio(){
  if(audioCtx) return;
  try{
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }catch(err){ /* Web Audio not supported here, sounds just won't play */ }
}
document.addEventListener('pointerdown', unlockAudio, {once:true});
document.addEventListener('keydown', unlockAudio, {once:true});

function playTone(freq, duration, volume){
  if(!audioCtx) return;
  if(audioCtx.state === 'suspended') audioCtx.resume();
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = 'sine';
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0, audioCtx.currentTime);
  gain.gain.linearRampToValueAtTime(volume, audioCtx.currentTime + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
  osc.connect(gain).connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + duration + 0.02);
}

// simple open/close tone for the Reflections cards, same two-note pattern already
// used for the Work/Recognition cards elsewhere on the site (see playTone(720,...)
// on open / playTone(420,...) on close) - keeps the whole site's sound language
// consistent instead of introducing a one-off "realistic" effect just for these.
function playPageFlip(isOpening){
  playTone(isOpening ? 720 : 420, isOpening ? 0.12 : 0.1, isOpening ? 0.05 : 0.035);
}

// hover blip on the index tabs next to the headshot (The Work / In Conversation /
// Visual Practice / Art Studio / Reflections / etc.), mouse/trackpad only, same
// alternating-pitch trick used on the map tiles and Recognition circles elsewhere.
(function(){
  const indexBlocks = document.querySelectorAll('.index-block');
  if(!indexBlocks.length) return;
  if(!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  let indexToneToggle = false;
  indexBlocks.forEach(block => {
    block.addEventListener('mouseenter', () => {
      indexToneToggle = !indexToneToggle;
      playTone(indexToneToggle ? 600 : 540, 0.08, 0.028);
    });
  });
})();

const svgNS = "http://www.w3.org/2000/svg";
const svgEl = document.getElementById('scene');
const wrapEl = document.getElementById('streetWrap');
const buildingsG = document.getElementById('buildings');
const treesG = document.getElementById('trees');
const lightsG = document.getElementById('lights');
const popup = document.getElementById('popup');

// ---- timeline data kept here for when you're ready to reuse it your new way ----
const stops = [
  {x:40,  y:360, year:"1997", title:"Home, Sialkot", desc:"Where it all began, family roots.", color:"var(--sandstone)"},
  {x:240, y:360, year:"2019", title:"[ populate this stop ]", desc:"Add what happened here.", color:"var(--sage)"},
  {x:440, y:280, year:"2021", title:"[ populate this stop ]", desc:"Add what happened here.", color:"var(--blush)"},
  {x:640, y:350, year:"2023", title:"LSE, London", desc:"First international trip, new ideas, new possibilities.", color:"var(--blush)"},
  {x:840, y:270, year:"2024", title:"Europe begins", desc:"New cities, discovering life in a different rhythm.", color:"var(--teal)"},
  {x:960, y:340, year:"Now",  title:"New collaborations", desc:"New cities, new dreams, the map keeps expanding.", color:"var(--terracotta)"}
];
// Stop dots, year labels, and their click-popup behavior have been removed for now,
// tell me the new approach and I'll wire this data into it.

// ---- paper-plane cursor that points the direction the mouse is actually moving ----
// Set at the body level so it's the default everywhere, but clickable elements (buttons,
// links, etc.) keep their own local cursor:pointer, meaning the hand cursor still shows
// on hover over anything clickable, same as normal web behavior.
function planeCursorURL(angleDeg){
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='30' height='30' viewBox='0 0 30 30'><g transform='rotate(${angleDeg} 15 15)'><path d='M2 14 L28 3 L15 27 L12 16 Z' fill='%23F8F4EC' stroke='%232B2B2B' stroke-width='1.4' stroke-linejoin='round'/><path d='M12 16 L15 27 L20 18 Z' fill='%23D3D1C7' stroke='%232B2B2B' stroke-width='1'/></g></svg>`;
  return `url("data:image/svg+xml;utf8,${svg}") 15 15, auto`;
}
document.body.style.cursor = planeCursorURL(0);
let lastMouseX = null, lastMouseY = null, lastCursorAngle = 0;
document.addEventListener('mousemove', (e) => {
  if(lastMouseX !== null){
    const dx = e.clientX - lastMouseX, dy = e.clientY - lastMouseY;
    if(Math.hypot(dx, dy) > 3){
      // artwork's drawn "nose" naturally points up-right (~ -43deg); rotate relative to that
      const moveAngle = Math.atan2(dy, dx) * 180 / Math.PI;
      const snapped = Math.round((moveAngle + 43) / 15) * 15;
      if(snapped !== lastCursorAngle){
        document.body.style.cursor = planeCursorURL(snapped);
        lastCursorAngle = snapped;
      }
    }
  }
  lastMouseX = e.clientX; lastMouseY = e.clientY;
});

// ---- menu button(s): toggle a small icon dropdown anchored underneath. Wired to both
// the hero header's menu button and the sticky nav's menu button (they're separate DOM
// nodes since the sticky nav lives fixed at the top independent of the hero).
function wireMenuToggle(btn, drop){
  if(!btn || !drop) return;
  function toggle(e){
    if(e) e.stopPropagation();
    const isOpen = drop.classList.toggle('open');
    btn.classList.toggle('open', isOpen);
    btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  }
  function close(){
    drop.classList.remove('open');
    btn.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
  }
  btn.addEventListener('click', toggle);
  document.addEventListener('click', (e) => {
    if(!drop.contains(e.target) && e.target !== btn) close();
  });
  document.addEventListener('keydown', (e) => {
    if(e.key === 'Escape') close();
  });
}
wireMenuToggle(document.getElementById('navOpen'), document.getElementById('socialDrop'));
wireMenuToggle(document.getElementById('navOpenSticky'), document.getElementById('socialDropSticky'));

// ---- headshot sizing: aligns the photo's top edge with the first tab's top edge and
// its bottom edge with the last tab's bottom edge - NOT the padded column around them.
// The tabs (.intro-tabs-col, .index-list, .index-block) are never touched by this;
// only .intro-photo-wrap gets inline margin-top/height/width, computed from where the
// actual tab list sits. Photo keeps its true aspect ratio throughout - no extra crop,
// just an in-flow offset + resize to land in the right spot. Skipped on mobile, where
// the layout stacks instead. ----
(function(){
  const introSplit = document.querySelector('.intro-split');
  const photoWrap = document.querySelector('.intro-photo-wrap');
  const photoImg = document.querySelector('.intro-photo');
  const indexList = document.querySelector('.index-list');
  if(!introSplit || !photoWrap || !photoImg || !indexList) return;

  function sizeHeadshot(){
    if(window.innerWidth <= 640){
      photoWrap.style.width = '';
      photoWrap.style.height = '';
      photoWrap.style.marginTop = '';
      return;
    }
    if(!photoImg.naturalWidth || !photoImg.naturalHeight) return; // not loaded yet

    const splitRect = introSplit.getBoundingClientRect();
    const listRect = indexList.getBoundingClientRect();
    const offsetTop = listRect.top - splitRect.top;
    const targetHeight = listRect.height;
    if(targetHeight < 40) return; // tabs haven't laid out yet, try again later

    const ratio = photoImg.naturalWidth / photoImg.naturalHeight;
    const targetWidth = Math.round(targetHeight * ratio);

    photoWrap.style.marginTop = Math.round(offsetTop) + 'px';
    photoWrap.style.height = Math.round(targetHeight) + 'px';
    photoWrap.style.width = targetWidth + 'px';
  }

  if(photoImg.complete && photoImg.naturalWidth > 0){
    sizeHeadshot();
  } else {
    photoImg.addEventListener('load', sizeHeadshot, {once:true});
  }
  window.addEventListener('load', sizeHeadshot);

  // the tabs use the same webfonts as the rest of the page, which load asynchronously -
  // measuring before they swap in locks the photo to a position/size based on the
  // fallback font's metrics, then the tabs silently reflow once the real font arrives.
  // Re-measure once fonts are actually ready, same fix used for the bird-caption
  // bubbles and the role-marquee width elsewhere on this page.
  if(document.fonts && document.fonts.ready){
    document.fonts.ready.then(() => requestAnimationFrame(sizeHeadshot));
  }

  let headshotResizeTimer = null;
  window.addEventListener('resize', () => {
    clearTimeout(headshotResizeTimer);
    headshotResizeTimer = setTimeout(sizeHeadshot, 120);
  });
})();

// ---- sticky frosted-glass nav: fades in once the big hero has scrolled past,
// and its label updates to whichever section is currently in view ----
const scrollNavEl = document.getElementById('scrollNav');
const scrollNavLabelEl = document.getElementById('scrollNavLabel');
const heroHeaderEl = document.querySelector('.hero-header');
if(scrollNavEl && heroHeaderEl){
  const updateNavVisibility = () => {
    const pastHero = heroHeaderEl.getBoundingClientRect().bottom < 0;
    scrollNavEl.classList.toggle('visible', pastHero);
  };
  window.addEventListener('scroll', updateNavVisibility, {passive:true});
  updateNavVisibility();
}
if(scrollNavLabelEl){
  const scrollNavTagEl = document.getElementById('scrollNavTag');
  const labelInner = scrollNavLabelEl.querySelector('.scroll-nav-label-inner') || scrollNavLabelEl;
  const sectionLabels = {
    work:"The Work", "in-conversation":"In Conversation",
    "visual-practice":"Visual Practice", studio:"Art Studio",
    "talk-books":"Reflections", reflections:"Reflections", about:"The Journey"
  };
  const spySections = Object.keys(sectionLabels)
    .map(id => document.getElementById(id))
    .filter(Boolean);

  // Which section (if any) is currently "active" is decided by scroll position rather than
  // IntersectionObserver here, because we also need a clean "before any of these sections"
  // state, the header shows plain "amna azeem" through the hero and the tab list, and only
  // starts tagging + bouncing once you've actually reached Selected Work.
  function updateSectionTag(){
    if(!spySections.length) return;
    const nearBottom = (window.innerHeight + window.scrollY) >= (document.documentElement.scrollHeight - 4);
    let current = null;
    if(nearBottom){
      // short trailing sections (like this one) can end before the trigger line ever
      // reaches them if the page runs out of scroll room first, hitting true bottom
      // should always mean "the last tracked section," regardless of its height.
      current = spySections[spySections.length - 1];
    } else {
      const triggerY = window.innerHeight * 0.45;
      for(const sec of spySections){
        if(sec.getBoundingClientRect().top <= triggerY) current = sec;
      }
    }
    if(current){
      scrollNavTagEl.classList.add('active');
      const next = sectionLabels[current.id];
      if(labelInner.textContent !== next){
        labelInner.textContent = next;
        labelInner.classList.remove('pulse');
        void labelInner.offsetWidth; // restart the animation
        labelInner.classList.add('pulse');
      }
    } else {
      scrollNavTagEl.classList.remove('active');
    }
  }
  window.addEventListener('scroll', updateSectionTag, {passive:true});
  window.addEventListener('resize', updateSectionTag, {passive:true});
  updateSectionTag();
}

// ---- size the role ticker's width to match "Geospatial Storyteller" (the longest phrase) ----
function sizeRoleTicker(){
  const viewportEl = document.getElementById('roleViewport');
  if(!viewportEl) return;
  const spans = viewportEl.querySelectorAll('.role-marquee-track span');
  if(spans.length < 2) return;
  viewportEl.style.width = spans[1].getBoundingClientRect().width + 'px';
}
if(document.getElementById('roleViewport')){
  window.addEventListener('load', sizeRoleTicker);
  window.addEventListener('resize', sizeRoleTicker);
  sizeRoleTicker();
  if(document.fonts && document.fonts.ready){
    document.fonts.ready.then(() => requestAnimationFrame(sizeRoleTicker));
  }
}


// ---- scroll-reveal for teaser sections: works on every page ----
const revealTargets = document.querySelectorAll('[data-reveal]');
if(revealTargets.length){
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        entry.target.classList.add('revealed');
        revealObserver.unobserve(entry.target);
      }
    });
  }, {threshold:0.15});
  revealTargets.forEach(el => revealObserver.observe(el));
}

// ---- typewriter caption under the satellite/aerial montage: types itself out one
// character at a time the first time it scrolls into view, with a short synthesized
// "key click" per character (reuses the same Web Audio setup as the gallery tones,
// so it's silent until the very first pointerdown/keydown unlocks audio). ----
const typewriterEl = document.querySelector('[data-typewriter]');
if(typewriterEl){
  const fullText = typewriterEl.getAttribute('data-typewriter') || '';
  const typewriterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(!entry.isIntersecting) return;
      typewriterObserver.unobserve(entry.target);
      let i = 0;
      (function typeNext(){
        if(i >= fullText.length) return;
        typewriterEl.textContent += fullText[i];
        i++;
        const delay = 38 + Math.random() * 55;
        setTimeout(typeNext, delay);
      })();
    });
  }, {threshold:0.6});
  typewriterObserver.observe(typewriterEl);
}



// ---- Work section: clicking a gallery card unfolds its details IN PLACE, the card
// itself widens and grows a photos+text panel underneath its cover image, right there in
// the scroll track (siblings just shift over, same as a natural flex-row reflow). Only one
// card is open at a time; clicking an open card, its own close button, or another card all
// resolve correctly. ----
// Turns "Org One, Org Two" into a URL-safe filename stem: logos/org-one.png
function slugify(name){
  return name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

// data-org can hold one or several organizations, comma-separated (e.g.
// "City Council, Placeholder Studio"), each one renders as a small logo only (no name
// text), sitting in its own row next to the tags. By default it guesses a filename from
// the org name (auto-slugified), but real logo files rarely match that guess exactly,
// so data-org-logos (same comma order, exact filename including extension, e.g.
// "imobyl.png, Mobilitylab.png") overrides the guess whenever you provide it. Files load
// from the top-level "logos" folder (sibling of "images/"). Falls back to a dashed
// placeholder holding the org's initials if that file isn't there. Optional
// data-org-links (same comma order) makes each logo clickable, opening the org's site.
// Shared by both the Work gallery and the Recognition gallery below it.
function buildLogosMarkup(orgString, linksString, logoFilesString){
  const names = (orgString || '').split(',').map(n => n.trim()).filter(Boolean);
  if(!names.length) return '';
  const links = (linksString || '').split(',').map(l => l.trim());
  const files = (logoFilesString || '').split(',').map(f => f.trim());
  return names.map((name, i) => {
    const initials = name.split(/\s+/).map(w => w[0]).join('').slice(0, 3).toUpperCase();
    const file = files[i] || `${slugify(name)}.png`;
    const inner = `
        <img class="work-detail-logo-img" src="logos/${file}" alt="${name}" loading="lazy">
        <span class="work-detail-logo-fallback" aria-hidden="true">${initials}</span>`;
    const href = links[i];
    return href
      ? `<a class="work-detail-logo" href="${href}" target="_blank" rel="noopener noreferrer" aria-label="${name}">${inner}</a>`
      : `<span class="work-detail-logo" aria-label="${name}">${inner}</span>`;
  }).join('');
}

// photos fan out at alternating tilts so a multi-photo project reads as a little
// scattered stack rather than a rigid row, same visual language as the gallery cards.
// Shared by both the Work gallery and the Recognition gallery below it.
const PHOTO_TILTS = ['-3deg', '4deg', '-5deg', '2deg'];

// Equal-size polaroid-style thumbnails in a plain row (washi tape, same tilted language
// as the rest of the site, just no overlapping stack). Same {folder}/{base}-{n}.jpg
// convention throughout, folder defaults to "images" (the Work gallery); the Recognition
// gallery passes "images/Recognition" instead. Photos default to .jpg, but data-photo-ext
// can override specific ones, e.g. data-photo-ext="4:gif" makes photo #4 load as a .gif
// instead, useful when one of the four is an animated gif rather than a still.
function buildPhotosMarkup(base, count, extOverrides, folder){
  const total = Math.max(1, count);
  const dir = folder || 'images';
  const overrides = {};
  (extOverrides || '').split(',').forEach(pair => {
    const [num, ext] = pair.split(':').map(p => p && p.trim());
    if(num && ext) overrides[num] = ext;
  });
  let html = '';
  for(let i = 0; i < total; i++){
    const ext = overrides[String(i + 1)] || 'jpg';
    const src = base ? `${dir}/${base}-${i+1}.${ext}` : '';
    html += `
      <div class="work-detail-photo" style="--tilt:${PHOTO_TILTS[i % PHOTO_TILTS.length]}">
        <span class="work-detail-photo-tape" aria-hidden="true"></span>
        <div class="work-detail-photo-inner">
          <img class="work-detail-photo-img" src="${src}" alt="" loading="lazy">
          <span class="work-detail-photo-fallback" aria-hidden="true">Photo${total > 1 ? ' ' + (i+1) : ''}</span>
        </div>
      </div>`;
  }
  return html;
}

// Escapes text, turns [label](https://...) into a real link, and turns blank-line-
// separated paragraphs into spaced breaks (a lone newline becomes a single line
// break). Shared by every gallery's short description text.
function renderLinkedText(text){
  if(!text) return '';
  const escaped = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const linked = escaped.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
  return linked.replace(/\n\s*\n/g, '<br><br>').replace(/\n/g, '<br>');
}

// The "Read more" pill, styled via .work-detail-readmore everywhere; extraClass adds
// each gallery's own class alongside it for any gallery-specific spacing tweaks.
function buildReadMoreLink(href, extraClass){
  if(!href) return '';
  const cls = extraClass ? `${extraClass} work-detail-readmore` : 'work-detail-readmore';
  return `<a class="${cls}" href="${href}" target="_blank" rel="noopener noreferrer">Read more</a>`;
}

const galleryCards = document.querySelectorAll('.work-gallery-card[data-project-trigger]');

// "View Project" hint tag, clipped onto the bottom-right corner of each card's cover
// image. Injected here rather than baked into every card's HTML so it stays in one
// place and automatically covers any new cards added later. Visibility is pure CSS
// (:hover), touch devices simply never trigger :hover so it stays hidden there and
// they rely on the tap-to-open behavior they already have.
// Shared "view" eye icon for both hint tags below - thick lens-shaped outline with
// a solid pupil and a small highlight dot, mirroring the reference icon. Uses
// currentColor for the outline/pupil so it inherits var(--paper) from the hint's
// own CSS, and the highlight dot is punched out in the tint layer's dark tone so
// it reads as a contrast dot against the light pupil rather than a plain circle.
const EYE_ICON_SVG = `
  <svg viewBox="0 0 24 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M1 8C1 8 5.2 1.2 12 1.2C18.8 1.2 23 8 23 8C23 8 18.8 14.8 12 14.8C5.2 14.8 1 8 1 8Z"
      stroke="currentColor" stroke-width="2.1" stroke-linejoin="round"/>
    <circle cx="12" cy="8" r="4" fill="currentColor"/>
    <circle cx="10.4" cy="6.5" r="1.15" fill="rgba(43,43,43,0.85)"/>
  </svg>
`;

galleryCards.forEach(card => {
  const imgWrap = card.querySelector('.work-gallery-img');
  if(!imgWrap) return;
  const hint = document.createElement('span');
  hint.className = 'work-gallery-hint';
  hint.setAttribute('aria-label', 'View project');
  hint.innerHTML = `<span class="hint-glass-icon">${EYE_ICON_SVG}</span>`;
  imgWrap.appendChild(hint);
});
if(galleryCards.length){
  let activeCard = null;
  const workGalleryWrap = document.getElementById('workGalleryWrap');

  // Every gallery card and detail photo references an actual file under images/, built
  // from that card's data-img-base (e.g. "P1" → images/P1.jpg for the gallery thumbnail,
  // images/P1-1.jpg / P1-2.jpg / ... for the unfolded panel's multiple photos). File type
  // defaults to .jpg but can be overridden per-card with data-img-ext (e.g. "png"), and a
  // <video> element (for an actual .mp4) is wired separately since it needs its own
  // <source>, not just a swapped src. If a file isn't there yet,
  // onerror swaps in the dashed-border placeholder instead of a broken image icon, so this
  // works today with zero images and keeps working as you add them.
  galleryCards.forEach(card => {
    const base = card.dataset.imgBase;
    const ext = card.dataset.imgExt || 'jpg';
    if(!base) return;
    const media = card.querySelector('.work-gallery-photo');
    if(!media) return;

    if(media.tagName === 'VIDEO'){
      const source = document.createElement('source');
      source.src = `images/${base}.mp4`;
      source.type = 'video/mp4';
      media.appendChild(source);
      media.addEventListener('error', () => {
        media.closest('.work-gallery-img').classList.add('no-image');
      }, {once:true});
    } else {
      media.alt = card.dataset.title || '';
      media.addEventListener('load', () => {
        media.closest('.work-gallery-img').classList.add('img-loaded');
      }, {once:true});
      media.addEventListener('error', () => {
        media.closest('.work-gallery-img').classList.add('no-image');
      }, {once:true});
      media.src = `images/${base}.${ext}`;
      if(media.complete && media.naturalWidth > 0){
        media.closest('.work-gallery-img').classList.add('img-loaded');
      }
    }
  });

  // the embedded dashboard preview and the "In Conversation" photo blobs get the same
  // shimmer-while-loading treatment, they just aren't wired up in the loop above since
  // they aren't part of galleryCards' data-img-base pattern
  document.querySelectorAll('.work-gallery-embed iframe').forEach(frame => {
    frame.addEventListener('load', () => {
      frame.closest('.work-gallery-embed').classList.add('img-loaded');
    }, {once:true});
  });
  document.querySelectorAll('.dialogues-blob-front img').forEach(img => {
    if(img.complete && img.naturalWidth > 0){
      img.closest('.dialogues-blob-front').classList.add('img-loaded');
    } else {
      img.addEventListener('load', () => {
        img.closest('.dialogues-blob-front').classList.add('img-loaded');
      }, {once:true});
    }
  });

  // ---- "In Conversation" photo grid: same soft blip the gallery cards use, this time
  // on hover only (mouse/trackpad devices, never touch, matching the canHover pattern
  // used elsewhere) plus a quick alternating pitch so a row of photos doesn't sound
  // identical as the cursor moves across it. Corners rounding on hover is pure CSS. ----
  const dialoguesHoverCanPlay = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if(dialoguesHoverCanPlay){
    let dialoguesToneToggle = false;
    document.querySelectorAll('.dialogues-photo, .dialogues-hero').forEach(el => {
      el.addEventListener('mouseenter', () => {
        dialoguesToneToggle = !dialoguesToneToggle;
        playTone(dialoguesToneToggle ? 640 : 580, 0.09, 0.03);
      });
    });
  }

  // ---- autoplaying video thumbnails are the actual cause of the stutter during the card's
  // own width transition (the browser's decoding/painting new frames at the same time it's
  // animating layout), so pause the video for just the 0.45s the card is resizing, then hand
  // control back once it settles. ----
  galleryCards.forEach(card => {
    const video = card.querySelector('video.work-gallery-photo');
    if(!video) return;

    const pauseForTransition = (e) => {
      if(e.target !== card || e.propertyName !== 'width') return;
      video.pause();
    };
    const resumeAfterTransition = (e) => {
      if(e.target !== card || e.propertyName !== 'width') return;
      video.play().catch(() => {});
    };
    card.addEventListener('transitionstart', pauseForTransition);
    card.addEventListener('transitionend', resumeAfterTransition);
    card.addEventListener('transitioncancel', resumeAfterTransition);
  });

// Turns a 2-letter ISO country code into its flag emoji (AT -> 🇦🇹) by mapping each
// letter to its regional-indicator symbol.
function flagEmoji(code){
  if(!code || code.length !== 2) return '';
  const cc = code.trim().toUpperCase();
  return String.fromCodePoint(...[...cc].map(c => 0x1F1E6 + (c.charCodeAt(0) - 65)));
}

// data-location can hold one or several places, separated by ";". Each place is
// "City|CC" (CC = 2-letter country code) e.g. data-location="Salzburg|AT; Olomouc|CZ",
// renders as its own small pill with a flag instead of spelling out the country, so
// multi-country projects don't need long "City, Country" text eating up space. Older
// plain "City, Country" values (no "|") still work, they just render without a flag.
// Shared by both the Work gallery and the Recognition gallery below it.
function buildLocationMarkup(locationString){
  const places = (locationString || '').split(';').map(p => p.trim()).filter(Boolean);
  return places.map(place => {
    const [cityPart, ccPart] = place.split('|').map(p => p && p.trim());
    const flag = ccPart ? flagEmoji(ccPart) : '';
    const label = flag ? `${cityPart} ${flag}` : (cityPart || place);
    return `<span class="work-detail-tag work-detail-location">${label}</span>`;
  }).join('');
}

// Turns "Org One, Org Two" into a URL-safe filename stem: logos/org-one.png
// (moved to global scope above so the Recognition gallery can reuse it too)

  // Lets data-desc use simple [label](url) markdown-style links instead of raw HTML, so
  // the attribute stays easy to read/edit without worrying about nested quotes. Escapes
  // stray HTML in the source text first, then turns the [..](..) pairs into real links.
  function renderDesc(text){
    if(!text) return '';
    const escaped = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return escaped.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
  }

  // Optional "Read more" pill, sitting opposite the title on the header row. Only shows
  // up when a card provides data-link (the project's full write-up / external page).
  function buildReadMoreMarkup(href){
    if(!href) return '';
    return `<a class="work-detail-readmore" href="${href}" target="_blank" rel="noopener noreferrer">Read more</a>`;
  }

  // Content is built once per card, the first time it's opened, then just toggled after
  // that, no need to rebuild the same project's markup on every click.
  function ensureDetailContent(card){
    const detail = card.querySelector('.work-gallery-detail');
    if(!detail || detail.dataset.built) return detail;

    detail.innerHTML = `
      <div class="work-gallery-detail-inner">
        <div class="work-detail-header">
          <div class="work-detail-title-row">
            <div class="work-detail-title">${card.dataset.title || ''}</div>
            <div class="work-detail-title-row-actions">
              ${buildReadMoreMarkup(card.dataset.link)}
              <button class="work-gallery-detail-close" aria-label="Close">&times;</button>
            </div>
          </div>
          <div class="work-detail-tags">
            <span class="work-detail-tag work-detail-year">${card.dataset.year || ''}</span>
            ${buildLocationMarkup(card.dataset.location)}
            ${buildLogosMarkup(card.dataset.org, card.dataset.orgLinks, card.dataset.orgLogos)}
          </div>
        </div>
        <div class="work-detail-photos">${buildPhotosMarkup(card.dataset.imgBase, parseInt(card.dataset.photos, 10) || 1, card.dataset.photoExt)}</div>
        <div class="work-detail-desc">${renderDesc(card.dataset.desc)}</div>
      </div>`;
    detail.querySelectorAll('.work-detail-photo-img').forEach(img => {
      img.addEventListener('error', () => img.closest('.work-detail-photo-inner').classList.add('no-image'), {once:true});
    });
    detail.querySelectorAll('.work-detail-logo-img').forEach(img => {
      img.addEventListener('error', () => img.closest('.work-detail-logo').classList.add('no-image'), {once:true});
    });

    detail.querySelector('.work-gallery-detail-close').addEventListener('click', (e) => {
      e.stopPropagation();
      closeCard(card);
    });

    detail.dataset.built = 'true';
    return detail;
  }

  function openCard(card, opts){
    opts = opts || {};
    if(activeCard && activeCard !== card) closeCard(activeCard);

    playTone(720, 0.12, 0.05);

    const detail = ensureDetailContent(card);
    card.classList.add('is-expanded');
    card.setAttribute('aria-expanded', 'true');
    detail.hidden = false;
    void detail.offsetWidth; // force a reflow so the next class add actually transitions
    detail.classList.add('open');
    activeCard = card;

    // the edge fade looks great on small cards, but if it's the first/last card that's
    // now expanded, that same fade would wash out text the person is trying to read,
    // so switch it off only for that specific case (see .edge-card-expanded in style.css)
    if(card === galleryCards[0] || card === galleryCards[galleryCards.length - 1]){
      workGalleryWrap.classList.add('edge-card-expanded');
    }

    // hovering a card open shouldn't yank the page around, only auto-scroll for a
    // real click/keyboard activation.
    if(!opts.skipScroll){
      requestAnimationFrame(() => {
        card.scrollIntoView({behavior:'smooth', inline:'nearest', block:'nearest'});
      });
    }
  }

  function closeCard(card){
    playTone(420, 0.1, 0.035);
    const detail = card.querySelector('.work-gallery-detail');
    card.classList.remove('is-expanded');
    card.setAttribute('aria-expanded', 'false');
    if(detail){
      detail.classList.remove('open');
      // guard against a stale listener firing after a fast close→reopen: only hide if
      // the card is still actually closed by the time the transition finishes
      detail.addEventListener('transitionend', () => {
        if(!card.classList.contains('is-expanded')) detail.hidden = true;
      }, {once:true});
    }
    if(activeCard === card) activeCard = null;
    workGalleryWrap.classList.remove('edge-card-expanded');
  }

  // Opens only via the "View Project" button now, not by clicking anywhere on the
  // card - hover alone gives plenty of feedback (color reveal, lift, the button
  // itself appearing), so a click on the photo shouldn't also double as "open". This
  // only applies on devices that actually get the hover/button treatment in the first
  // place (mouse/trackpad); touch devices never see the button at all (no :hover), so
  // they keep the simpler "tap the card to open" behavior they always had.
  const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  galleryCards.forEach(card => {
    card.addEventListener('click', (e) => {
      if(e.target.closest('.work-gallery-detail-close')) return; // handled separately

      if(card.classList.contains('is-expanded')){
        // while expanded, only clicking the upper cover photo (or the close button,
        // handled above) should collapse it back, clicks anywhere in the text/photos/
        // links below shouldn't close the card out from under someone reading it
        if(e.target.closest('.work-gallery-img')) closeCard(card);
        return;
      }
      if(canHover){
        if(e.target.closest('.work-gallery-hint')) openCard(card);
      } else {
        openCard(card);
      }
    });
    card.addEventListener('keydown', (e) => {
      if(e.key === 'Enter' || e.key === ' '){
        e.preventDefault();
        if(card.classList.contains('is-expanded')) closeCard(card);
        else openCard(card);
      }
    });
  });

  // hover blip, mouse/trackpad only, same alternating-pitch trick used on the map
  // tiles / recognition circles / "In Conversation" grid elsewhere on the site - this
  // got dropped when hover stopped triggering the open/close tone directly, so it's
  // back as its own listener, separate from the click-driven open/close tones above.
  if(canHover){
    let workToneToggle = false;
    galleryCards.forEach(card => {
      card.addEventListener('mouseenter', () => {
        if(card.classList.contains('is-expanded')) return;
        workToneToggle = !workToneToggle;
        playTone(workToneToggle ? 600 : 540, 0.08, 0.028);
      });
    });
  }

  // The gallery only natively scrolls when the swipe/drag actually starts on the strip
  // itself, easy to miss on a full-bleed row, especially by a few px above or below the
  // cards. This extends that same swipe-to-scroll behavior into a margin just above and
  // below the gallery, without touching how scrolling works when you start right on it.
  (function extendGallerySwipeZone(){
    const EXTRA = 48; // px of extra hit-zone above/below the gallery's own bounding box
    let dragging = false, dragDecided = false, isHorizontal = false;
    let startX = 0, startY = 0, startScroll = 0, pointerId = null;

    function inExtendedZone(x, y){
      const r = workGalleryWrap.getBoundingClientRect();
      return x >= r.left && x <= r.right && y >= r.top - EXTRA && y <= r.bottom + EXTRA;
    }

    document.addEventListener('pointerdown', (e) => {
      if(e.pointerType === 'mouse' && e.button !== 0) return;
      if(workGalleryWrap.contains(e.target)) return; // native handling already covers this
      if(!inExtendedZone(e.clientX, e.clientY)) return;
      dragging = true; dragDecided = false; isHorizontal = false;
      startX = e.clientX; startY = e.clientY;
      startScroll = workGalleryWrap.scrollLeft;
      pointerId = e.pointerId;
    });

    document.addEventListener('pointermove', (e) => {
      if(!dragging || e.pointerId !== pointerId) return;
      const dx = e.clientX - startX, dy = e.clientY - startY;
      if(!dragDecided){
        if(Math.abs(dx) < 6 && Math.abs(dy) < 6) return; // not enough movement to decide yet
        dragDecided = true;
        // only take over if the gesture is clearly more horizontal than vertical,
        // otherwise this was a normal vertical page scroll that happened to start nearby
        isHorizontal = Math.abs(dx) > Math.abs(dy);
        if(!isHorizontal){ dragging = false; return; }
        document.body.style.userSelect = 'none';
      }
      if(!isHorizontal) return;
      workGalleryWrap.scrollLeft = startScroll - dx;
      e.preventDefault();
    }, {passive:false});

    function endDrag(e){
      if(!dragging || (pointerId !== null && e.pointerId !== pointerId)) return;
      dragging = false; dragDecided = false; isHorizontal = false; pointerId = null;
      document.body.style.userSelect = '';
    }
    document.addEventListener('pointerup', endDrag);
    document.addEventListener('pointercancel', endDrag);
  })();
}

// ---- Recognition gallery: same "click a card to unfold more photos + the fuller story"
// idea as the Work gallery above, kept as its own small self-contained block since these
// cards carry far fewer fields (no orgs/logos/locations) than a full project entry. ----
const recognitionCards = document.querySelectorAll('.recognition-card[data-recognition-trigger]');
if(recognitionCards.length){
  let activeRecCard = null;
  const recognitionGalleryWrap = document.getElementById('recognitionGalleryWrap');

  // "View Honour" hint tag, same frosted-glass treatment as the Work gallery's "View
  // Project" tag. Appended to the card itself rather than inside .recognition-photo-
  // frame, since the frame is circular with overflow:hidden - a corner-anchored tag
  // placed inside it would get clipped by the circular mask. The card is the same
  // width/height as the frame when closed, so anchoring to the card's own corner lands
  // in the same visual spot without the clipping problem.
  recognitionCards.forEach(card => {
    const hint = document.createElement('span');
    hint.className = 'recognition-hint';
    hint.setAttribute('aria-label', 'View honour');
    hint.innerHTML = `<span class="hint-glass-icon">${EYE_ICON_SVG}</span>`;
    card.appendChild(hint);
  });

  // main face photo, same images/{base}.jpg convention as the Work gallery cards; falls
  // back to the dashed placeholder pattern if the file isn't there yet
  recognitionCards.forEach(card => {
    const base = card.dataset.imgBase;
    const photo = card.querySelector('.recognition-photo');
    if(!base || !photo) return;
    photo.alt = card.dataset.title || '';
    photo.src = `images/Recognition/${base}.jpg`;
    photo.addEventListener('error', () => {
      photo.closest('.recognition-photo-frame').classList.add('no-image');
    }, {once:true});
  });

  function renderRecDesc(text){ return renderLinkedText(text); }
  function buildRecLink(href){ return buildReadMoreLink(href, 'recognition-detail-readmore'); }

  function ensureRecDetail(card){
    const detail = card.querySelector('.recognition-detail');
    if(!detail || detail.dataset.built) return detail;

    // data-photos is the number of polaroids shown on expand, full stop, separate from
    // the circle's own main photo (which loads independently as {base}.jpg above)
    const extraPhotos = parseInt(card.dataset.photos, 10) || 0;
    const logos = buildLogosMarkup(card.dataset.org, card.dataset.orgLinks, card.dataset.orgLogos);
    detail.innerHTML = `
      <div class="recognition-detail-inner">
        <div class="recognition-detail-title-row">
          <div class="recognition-detail-title">${card.dataset.title || ''}</div>
          ${buildRecLink(card.dataset.link)}
          <button class="recognition-detail-close work-gallery-detail-close" aria-label="Close">&times;</button>
        </div>
        <div class="recognition-detail-tags-row">
          <span class="work-detail-tag work-detail-year">${card.dataset.year || ''}</span>
          ${buildLocationMarkup(card.dataset.location)}
          ${logos}
        </div>
        ${extraPhotos ? `<div class="work-detail-photos recognition-detail-photos">${buildPhotosMarkup(card.dataset.imgBase, extraPhotos, card.dataset.photoExt, 'images/Recognition')}</div>` : ''}
        <div class="recognition-detail-desc">${renderRecDesc(card.dataset.desc)}</div>
      </div>`;
    detail.querySelectorAll('.work-detail-photo-img').forEach(img => {
      img.addEventListener('error', () => img.closest('.work-detail-photo-inner').classList.add('no-image'), {once:true});
    });
    detail.querySelectorAll('.work-detail-logo-img').forEach(img => {
      img.addEventListener('error', () => img.closest('.work-detail-logo').classList.add('no-image'), {once:true});
    });
    detail.querySelector('.recognition-detail-close').addEventListener('click', (e) => {
      e.stopPropagation();
      closeRecCard(card);
    });
    detail.dataset.built = 'true';
    return detail;
  }

  function openRecCard(card){
    if(activeRecCard && activeRecCard !== card) closeRecCard(activeRecCard);
    playTone(720, 0.12, 0.05);
    const detail = ensureRecDetail(card);
    card.classList.add('is-expanded');
    card.setAttribute('aria-expanded', 'true');
    detail.hidden = false;
    void detail.offsetWidth; // force reflow so the transition actually runs
    detail.classList.add('open');
    activeRecCard = card;

    // the edge fade + widening card look great everywhere except the very first/last
    // circle, where the opened card would otherwise sit flush against the mask's fade
    // zone and read as cut off, give the track extra room on that side only
    if(card === recognitionCards[0] || card === recognitionCards[recognitionCards.length - 1]){
      recognitionGalleryWrap.classList.add('edge-card-expanded');
    }

    // center it in view (not just "nearest"), the fade mask lives at the viewport edges,
    // so any card that ends up scrolled near either edge needs real room, not a nudge
    requestAnimationFrame(() => {
      card.scrollIntoView({behavior:'smooth', inline:'center', block:'nearest'});
    });
  }

  function closeRecCard(card){
    playTone(420, 0.1, 0.035);
    const detail = card.querySelector('.recognition-detail');
    card.classList.remove('is-expanded');
    card.setAttribute('aria-expanded', 'false');
    if(detail){
      detail.classList.remove('open');
      detail.addEventListener('transitionend', () => {
        if(!card.classList.contains('is-expanded')) detail.hidden = true;
      }, {once:true});
    }
    if(activeRecCard === card) activeRecCard = null;
    recognitionGalleryWrap.classList.remove('edge-card-expanded');
  }

  // Opens only via the "View Honour" button now (mouse/trackpad), same reasoning as
  // the Work gallery above - touch devices never see the button (no :hover), so they
  // keep tapping the circle directly to open, exactly as before.
  const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  recognitionCards.forEach(card => {
    card.addEventListener('click', (e) => {
      if(e.target.closest('.recognition-detail-close')) return;
      if(e.target.closest('a')) return; // let the Read more/logo links behave normally

      if(card.classList.contains('is-expanded')){
        // closing still just needs a click back on the circle itself
        if(e.target.closest('.recognition-photo-frame')) closeRecCard(card);
        return;
      }
      if(canHover){
        if(e.target.closest('.recognition-hint')) openRecCard(card);
      } else if(e.target.closest('.recognition-photo-frame')){
        openRecCard(card);
      }
    });
    card.addEventListener('keydown', (e) => {
      if(e.key === 'Enter' || e.key === ' '){
        e.preventDefault();
        card.classList.contains('is-expanded') ? closeRecCard(card) : openRecCard(card);
      }
      if(e.key === 'Escape' && card.classList.contains('is-expanded')) closeRecCard(card);
    });
  });

  // hover blip on the circular photos themselves, mouse/trackpad only, same
  // alternating-pitch trick used on the map tiles and "In Conversation" grid -
  // separate from the open/close tones above, which only fire on an actual click.
  if(canHover){
    let recToneToggle = false;
    recognitionCards.forEach(card => {
      const frame = card.querySelector('.recognition-photo-frame');
      if(!frame) return;
      frame.addEventListener('mouseenter', () => {
        recToneToggle = !recToneToggle;
        playTone(recToneToggle ? 600 : 540, 0.08, 0.028);
      });
    });
  }
}

// ---- everything below only runs on pages that actually have the illustration ----
if(svgEl){

// ---- city drawing helpers ----
const buildingColors = ["var(--sandstone)","var(--terracotta)","var(--sage)","var(--blush)"];
let colorCursor = 0;
function nextColor(){ return buildingColors[(colorCursor++) % buildingColors.length]; }
function rand(min,max){ return min + Math.random()*(max-min); }

function building(x, y, w, h, color){
  const top = y - h;
  const rect = document.createElementNS(svgNS,"rect");
  rect.setAttribute("x",x); rect.setAttribute("y",top); rect.setAttribute("width",w); rect.setAttribute("height",h);
  rect.setAttribute("fill",color); rect.setAttribute("stroke","var(--charcoal)"); rect.setAttribute("stroke-width","0.75");
  buildingsG.appendChild(rect);
  const cols = Math.max(2, Math.floor(w/22)), rows = Math.max(2, Math.floor(h/24));
  const padX = (w - (cols*10 + (cols-1)*8)) / 2, padY = 14;
  for(let r=0;r<rows;r++) for(let c=0;c<cols;c++){
    const wy = top + padY + r*20;
    if(wy > y-16) continue;
    const win = document.createElementNS(svgNS,"rect");
    win.setAttribute("x", x+padX+c*18); win.setAttribute("y", wy);
    win.setAttribute("width",8); win.setAttribute("height",10);
    win.setAttribute("class","win");
    win.style.animationDelay=(Math.random()*4).toFixed(2)+"s";
    win.style.animationDuration=(3+Math.random()*3).toFixed(2)+"s";
    buildingsG.appendChild(win);
  }
}
function streetlight(x, y){
  const pole = document.createElementNS(svgNS,"rect");
  pole.setAttribute("x",x-2); pole.setAttribute("y",y-24); pole.setAttribute("width",4); pole.setAttribute("height",24);
  pole.setAttribute("fill","var(--charcoal)"); lightsG.appendChild(pole);
  const lamp = document.createElementNS(svgNS,"circle");
  lamp.setAttribute("cx",x); lamp.setAttribute("cy",y-27); lamp.setAttribute("r",5);
  lamp.setAttribute("fill","var(--win-lit)"); lamp.setAttribute("class","lamp");
  lightsG.appendChild(lamp);
}
function tree(x, y, color){
  const trunk = document.createElementNS(svgNS,"rect");
  trunk.setAttribute("x",x-2); trunk.setAttribute("y",y-15); trunk.setAttribute("width",4); trunk.setAttribute("height",15);
  trunk.setAttribute("fill","var(--terracotta)"); treesG.appendChild(trunk);
  const canopy = document.createElementNS(svgNS,"circle");
  canopy.setAttribute("cx",x); canopy.setAttribute("cy",y-23); canopy.setAttribute("r",12);
  canopy.setAttribute("fill",color); canopy.setAttribute("stroke","var(--charcoal)"); canopy.setAttribute("stroke-width","0.5");
  treesG.appendChild(canopy);
}

// ---- the five stretches, hand-placed per your spec ----
// stretch 1 (1997 → 2019): 3 adjoining buildings, alternating height/width, 2 trees (fixed overlap)
building(70,  360, 42, 112, nextColor());
building(114, 360, 54, 150, nextColor());
building(170, 360, 40, 122, nextColor());
tree(62,  360, "var(--sage)");
tree(218, 360, "var(--teal)");

// stretch 2 (2019 → 2021): 2 adjoining buildings, varying height, trees + one streetlight
building(290, 280, 56, 128, nextColor());
building(348, 280, 48, 158, nextColor());
tree(282, 280, "var(--teal)");
tree(398, 280, "var(--sage)");
streetlight(435, 280);
streetlight(190, 360);
streetlight(700, 270);
streetlight(900, 340);
streetlight(510, 350);

// stretch 3 (2021 → 2023): 2 adjoining buildings, varying height, trees close to them
building(480, 350, 44, 118, nextColor());
building(526, 350, 52, 144, nextColor());
building(580, 350, 32, 102, nextColor());
tree(466, 350, "var(--sage)");
tree(624, 350, "var(--teal)");

// stretch 4 (2023 → 2024): 3 adjoining buildings, alternating height/width, trees
building(680, 270, 40, 116, nextColor());
building(722, 270, 54, 148, nextColor());
building(778, 270, 40, 122, nextColor());
tree(672, 270, "var(--teal)");
tree(822, 270, "var(--sage)");

// stretch 5 (2024 → Now): shorter stretch, 2 buildings matching the same size range, 1 tree
building(868, 340, 44, 118, nextColor());
building(914, 340, 40, 140, nextColor());
tree(860, 340, "var(--sage)");

// (no extra stray streetlights, only the one placed above, in stretch 2)

// ---- pedestrian, cyclist, and bus, actually moving along the whole road ----
const ambientG = document.getElementById('ambient');
const roadD = document.getElementById('roadPath').getAttribute('d');
function ambientFigure(iconSVG, dur, begin){
  const g = document.createElementNS(svgNS,"g");
  g.innerHTML = iconSVG;
  const anim = document.createElementNS(svgNS,"animateMotion");
  anim.setAttribute("path", roadD);
  anim.setAttribute("dur", dur);
  anim.setAttribute("begin", begin);
  anim.setAttribute("repeatCount", "indefinite");
  anim.setAttribute("rotate", "auto");
  g.appendChild(anim);
  ambientG.appendChild(g);
}
const pedestrianSVG = `<circle cx="0" cy="-10" r="3.5" fill="var(--charcoal)"></circle><line x1="0" y1="-6" x2="0" y2="3" stroke="var(--charcoal)" stroke-width="2"></line><line x1="0" y1="3" x2="-3.5" y2="10" stroke="var(--charcoal)" stroke-width="2"></line><line x1="0" y1="3" x2="3.5" y2="10" stroke="var(--charcoal)" stroke-width="2"></line>`;
const cyclistSVG = `<circle cx="-7" cy="4" r="5.5" fill="none" stroke="var(--sage)" stroke-width="1.4"></circle><circle cx="7" cy="4" r="5.5" fill="none" stroke="var(--sage)" stroke-width="1.4"></circle><path d="M-7 4 L0 -4 L7 4 M0 -4 L0 0" fill="none" stroke="var(--sage)" stroke-width="1.4"></path><circle cx="0" cy="-9" r="3.2" fill="var(--charcoal)"></circle>`;
const busSVG = `<rect x="-15" y="-8" width="30" height="16" rx="3" fill="var(--teal)"></rect><rect x="-12" y="-5.5" width="6.5" height="6" rx="1.3" fill="var(--paper)"></rect><rect x="-3.25" y="-5.5" width="6.5" height="6" rx="1.3" fill="var(--paper)"></rect><rect x="5.5" y="-5.5" width="6.5" height="6" rx="1.3" fill="var(--paper)"></rect><circle cx="-7" cy="9" r="3" fill="var(--charcoal)"></circle><circle cx="7" cy="9" r="3" fill="var(--charcoal)"></circle>`;
ambientFigure(pedestrianSVG, "24s", "0s");
ambientFigure(cyclistSVG, "18s", "3s");
ambientFigure(busSVG, "32s", "7s");

// ---- ambient street sounds, soft synthesized cues (same tiny Web Audio blips as the
// gallery cards, via playTone/unlockAudio near the top of this file) for the pedestrian,
// cyclist, and bus, one per lap of the road. Gated to only play while the street
// illustration is actually scrolled into view, so it stays quiet everywhere else on the
// page. No audio files involved. ----
let streetSceneVisible = false;
if(wrapEl && 'IntersectionObserver' in window){
  const streetSceneObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => { streetSceneVisible = entry.isIntersecting; });
  }, {threshold: 0.3});
  streetSceneObserver.observe(wrapEl);
}

function scheduleAmbientSound(durSeconds, beginSeconds, playFn){
  setTimeout(() => {
    playFn();
    setInterval(playFn, durSeconds * 1000);
  }, beginSeconds * 1000);
}

function playPedestrianStep(){
  if(!streetSceneVisible) return;
  playTone(520, 0.05, 0.018);
  setTimeout(() => playTone(470, 0.05, 0.018), 130);
}
function playCyclistBell(){
  if(!streetSceneVisible) return;
  playTone(1050, 0.07, 0.022);
}
function playBusHum(){
  if(!streetSceneVisible) return;
  playTone(140, 0.4, 0.03);
}

scheduleAmbientSound(24, 0, playPedestrianStep);
scheduleAmbientSound(18, 3, playCyclistBell);
scheduleAmbientSound(32, 7, playBusHum);

// ---- popup helper kept for reuse once you describe the new approach ----

function openPopup(i){
  const s = stops[i];
  document.getElementById('pYear').textContent = s.year;
  document.getElementById('pTitle').textContent = s.title;
  document.getElementById('pDesc').textContent = s.desc;
  const svgRect = svgEl.getBoundingClientRect();
  const wrapRect = wrapEl.getBoundingClientRect();
  const vb = svgEl.viewBox.baseVal;
  const scaleX = svgRect.width / vb.width, scaleY = svgRect.height / vb.height;
  const px = svgRect.left + (s.x - vb.x)*scaleX - wrapRect.left;
  const py = svgRect.top + (s.y - vb.y)*scaleY - wrapRect.top;
  popup.classList.add('show');
  const pw = popup.offsetWidth, ph = popup.offsetHeight;
  const placeBelow = s.y < 200;
  let left = px - pw/2;
  left = Math.max(4, Math.min(left, wrapRect.width - pw - 4));
  let top = placeBelow ? py + 20 : py - ph - 20;
  popup.style.left = left + "px"; popup.style.top = top + "px";
}
document.getElementById('popupClose').addEventListener('click', () => popup.classList.remove('show'));

// ---- fit each bird speech-bubble's rounded rect exactly to its text (German/English unchanged) ----
// Urdu is a special case: width hugs its text with no side padding, height matches the others.
function fitBirdBubbles(){
  const padX = 8, padY = 5;
  document.querySelectorAll('.bird-bubble').forEach(g => {
    const text = g.querySelector('text');
    const rect = g.querySelector('rect');
    const bbox = text.getBBox();
    rect.setAttribute('x', bbox.x - padX);
    rect.setAttribute('y', bbox.y - padY);
    rect.setAttribute('width', bbox.width + padX*2);
    rect.setAttribute('height', bbox.height + padY*2);
  });

  const deRect = document.querySelector('.bird-bubble-de rect');
  const urG = document.querySelector('.bird-bubble-ur');
  if(deRect && urG){
    const urRect = urG.querySelector('rect');
    const urBbox = urG.querySelector('text').getBBox();
    const matchHeight = parseFloat(deRect.getAttribute('height'));
    const centerY = urBbox.y + urBbox.height/2;
    urRect.setAttribute('x', urBbox.x);
    urRect.setAttribute('width', urBbox.width);
    urRect.setAttribute('y', centerY - matchHeight/2);
    urRect.setAttribute('height', matchHeight);
  }
}
fitBirdBubbles();
if(document.fonts && document.fonts.ready){
  document.fonts.ready.then(() => requestAnimationFrame(fitBirdBubbles));
}

} // end of illustration-only guard

// ---- Cartographic Work: masonry grid + lightbox. Clicking any map tile opens it full
// size in an overlay; prev/next step through the grid's tiles in DOM order so it works
// regardless of which one was opened first. Same soft open/close tones as the gallery
// cards, plus the alternating hover blip used on the "In Conversation" photo grid. ----
(function(){
  const mapTiles = Array.from(document.querySelectorAll('.map-tile'));
  if(!mapTiles.length) return;

  const lightbox = document.getElementById('mapLightbox');
  const lightboxImg = document.getElementById('mapLightboxImg');
  const lightboxCount = document.getElementById('mapLightboxCount');
  const btnClose = document.getElementById('mapLightboxClose');
  const btnPrev = document.getElementById('mapLightboxPrev');
  const btnNext = document.getElementById('mapLightboxNext');

  let currentIndex = -1;

  function showIndex(i){
    currentIndex = (i + mapTiles.length) % mapTiles.length;
    const tile = mapTiles[currentIndex];
    lightboxImg.src = tile.dataset.mapSrc;
    lightboxImg.alt = tile.getAttribute('aria-label') || '';
    lightboxCount.textContent = `${currentIndex + 1} / ${mapTiles.length}`;
  }

  function openLightbox(i){
    showIndex(i);
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    playTone(720, 0.12, 0.05);
  }

  function closeLightbox(){
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    currentIndex = -1;
    playTone(420, 0.1, 0.035);
  }

  mapTiles.forEach((tile, i) => {
    tile.addEventListener('click', () => openLightbox(i));
  });

  btnClose.addEventListener('click', closeLightbox);
  btnNext.addEventListener('click', () => { showIndex(currentIndex + 1); playTone(640, 0.07, 0.03); });
  btnPrev.addEventListener('click', () => { showIndex(currentIndex - 1); playTone(640, 0.07, 0.03); });

  lightbox.addEventListener('click', (e) => {
    if(e.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', (e) => {
    if(currentIndex === -1) return;
    if(e.key === 'Escape') closeLightbox();
    else if(e.key === 'ArrowRight'){ showIndex(currentIndex + 1); playTone(640, 0.07, 0.03); }
    else if(e.key === 'ArrowLeft'){ showIndex(currentIndex - 1); playTone(640, 0.07, 0.03); }
  });

  // hover blip on the grid tiles themselves, mouse/trackpad only, same alternating-pitch
  // trick as the "In Conversation" photo grid so scanning across the row doesn't repeat
  // the exact same note every time.
  if(window.matchMedia('(hover: hover) and (pointer: fine)').matches){
    let mapToneToggle = false;
    mapTiles.forEach(tile => {
      tile.addEventListener('mouseenter', () => {
        mapToneToggle = !mapToneToggle;
        playTone(mapToneToggle ? 600 : 540, 0.08, 0.028);
      });
    });
  }

  // ---- Balancing the masonry gallery (M11 is untouched by any of this - it lives
  // outside #mapGrid entirely). Plain CSS multi-column fills one column completely
  // before starting the next, so with only 10 tiles the last column or two often end up
  // much shorter, leaving a ragged gap along the bottom. This instead builds N column
  // wrapper divs and always drops the next tile into whichever column currently sums
  // shortest, using each tile's real width/height attributes to predict its rendered
  // height at the current column width (no need to wait for images to load). Re-runs on
  // resize since column count (4/3/2) and available width both change at the site's
  // breakpoints. ----
  const mapGridEl = document.getElementById('mapGrid');
  const galleryTiles = mapGridEl
    ? Array.from(mapGridEl.children).filter(el => el.classList.contains('map-tile'))
    : [];

  function getMapColumnCount(){
    const w = window.innerWidth;
    if(w <= 640) return 2;
    if(w <= 900) return 3;
    return 4;
  }

  function estimateTileHeight(tile, colWidth){
    const img = tile.querySelector('img');
    const w = parseFloat(img && img.getAttribute('width')) || 1;
    const h = parseFloat(img && img.getAttribute('height')) || 1;
    return colWidth * (h / w);
  }

  function layoutMapMasonry(){
    if(!mapGridEl || !galleryTiles.length) return;
    const cols = getMapColumnCount();
    const gap = window.innerWidth <= 640 ? 8 : 10;
    const totalWidth = mapGridEl.clientWidth || mapGridEl.parentElement.clientWidth || 0;
    if(totalWidth < 20) return; // not laid out yet
    const colWidth = (totalWidth - gap * (cols - 1)) / cols;

    const colEls = [];
    const colHeights = [];
    for(let i = 0; i < cols; i++){
      const colDiv = document.createElement('div');
      colDiv.className = 'map-col';
      colEls.push(colDiv);
      colHeights.push(0);
    }

    galleryTiles.forEach(tile => {
      let shortest = 0;
      for(let i = 1; i < cols; i++){
        if(colHeights[i] < colHeights[shortest]) shortest = i;
      }
      colEls[shortest].appendChild(tile);
      colHeights[shortest] += estimateTileHeight(tile, colWidth) + gap;
    });

    mapGridEl.innerHTML = '';
    colEls.forEach(c => mapGridEl.appendChild(c));
  }

  layoutMapMasonry();
  window.addEventListener('load', layoutMapMasonry);

  let mapResizeTimer = null;
  window.addEventListener('resize', () => {
    clearTimeout(mapResizeTimer);
    mapResizeTimer = setTimeout(layoutMapMasonry, 150);
  });
})();

// ---- Creative Studio film strip: lightbox + hover blip, same pattern as the map
// gallery's but a fully separate instance (own IDs/classes) so nothing here can touch
// that one. No masonry balancing needed since this is a single scrolling row, not a
// multi-column layout - any frame count just works. ----
(function(){
  const filmTiles = Array.from(document.querySelectorAll('.filmstrip-frame'));
  if(!filmTiles.length) return;

  // graceful placeholder for art that hasn't been uploaded yet (see .no-image /
  // .img-loaded in style.css), same load/error pattern used by the Work gallery and
  // dialogues photos elsewhere on the page.
  filmTiles.forEach(tile => {
    const img = tile.querySelector('img');
    if(!img) return;
    if(img.complete && img.naturalWidth > 0){
      tile.classList.add('img-loaded');
    } else {
      img.addEventListener('load', () => tile.classList.add('img-loaded'), {once:true});
      img.addEventListener('error', () => tile.classList.add('no-image'), {once:true});
    }
  });

  const lightbox = document.getElementById('artLightbox');
  const lightboxImg = document.getElementById('artLightboxImg');
  const lightboxCount = document.getElementById('artLightboxCount');
  const btnClose = document.getElementById('artLightboxClose');
  const btnPrev = document.getElementById('artLightboxPrev');
  const btnNext = document.getElementById('artLightboxNext');

  let currentIndex = -1;

  function showIndex(i){
    currentIndex = (i + filmTiles.length) % filmTiles.length;
    const tile = filmTiles[currentIndex];
    lightboxImg.src = tile.dataset.artSrc;
    lightboxImg.alt = tile.getAttribute('aria-label') || '';
    lightboxCount.textContent = `${currentIndex + 1} / ${filmTiles.length}`;
  }

  function openLightbox(i){
    showIndex(i);
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    playTone(720, 0.12, 0.05);
  }

  function closeLightbox(){
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    currentIndex = -1;
    playTone(420, 0.1, 0.035);
  }

  filmTiles.forEach((tile, i) => {
    tile.addEventListener('click', () => {
      if(tile.classList.contains('no-image')) return; // nothing to show yet
      openLightbox(i);
    });
  });

  btnClose.addEventListener('click', closeLightbox);
  btnNext.addEventListener('click', () => { showIndex(currentIndex + 1); playTone(640, 0.07, 0.03); });
  btnPrev.addEventListener('click', () => { showIndex(currentIndex - 1); playTone(640, 0.07, 0.03); });

  lightbox.addEventListener('click', (e) => {
    if(e.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', (e) => {
    if(currentIndex === -1) return;
    if(e.key === 'Escape') closeLightbox();
    else if(e.key === 'ArrowRight'){ showIndex(currentIndex + 1); playTone(640, 0.07, 0.03); }
    else if(e.key === 'ArrowLeft'){ showIndex(currentIndex - 1); playTone(640, 0.07, 0.03); }
  });

  if(window.matchMedia('(hover: hover) and (pointer: fine)').matches){
    let filmToneToggle = false;
    filmTiles.forEach(tile => {
      tile.addEventListener('mouseenter', () => {
        filmToneToggle = !filmToneToggle;
        playTone(filmToneToggle ? 600 : 540, 0.08, 0.028);
      });
    });
  }
})();

// ---- Reflections flip-cards: click/tap or Enter/Space toggles is-flipped, same
// pattern as the Work/Recognition cards above, with the same simple open/close tone
// those cards already use (see playPageFlip near the top of this file). Hover no
// longer flips the card (see style.css) - hovering the front face just lifts the
// sepia tint to reveal the photo's true colors, and the actual page-turn is reserved
// for a deliberate click/tap so the interaction reads as "open this" rather than
// something that fires by accident while scrolling past. ----
(function(){
  const reflectionCards = document.querySelectorAll('.reflection-card[data-reflection-flip]');
  reflectionCards.forEach(card => {
    card.addEventListener('click', () => {
      const flipped = card.classList.toggle('is-flipped');
      card.setAttribute('aria-pressed', flipped ? 'true' : 'false');
      playPageFlip(flipped);
    });
    card.addEventListener('keydown', (e) => {
      if(e.key === 'Enter' || e.key === ' '){
        e.preventDefault();
        const flipped = card.classList.toggle('is-flipped');
        card.setAttribute('aria-pressed', flipped ? 'true' : 'false');
        playPageFlip(flipped);
      }
    });
  });

  // hover blip on mouse/trackpad only, same alternating-pitch trick as the map tiles
  // and the "In Conversation" grid elsewhere on the site, so this reads consistently
  // with the rest of the page's hover language (color reveal + corner change + a
  // small sound, all together).
  if(window.matchMedia('(hover: hover) and (pointer: fine)').matches){
    let reflectionToneToggle = false;
    reflectionCards.forEach(card => {
      card.addEventListener('mouseenter', () => {
        if(card.classList.contains('is-flipped')) return;
        reflectionToneToggle = !reflectionToneToggle;
        playTone(reflectionToneToggle ? 660 : 600, 0.07, 0.025);
      });
    });
  }

  // ---- one-time "demo flip" instead of any persistent label: the very first time
  // the Reflections grid scrolls into view, the first card flips itself open for a
  // moment and flips back, teaching the interaction visually rather than via a UI
  // hint that would otherwise sit on every card forever. Runs once per page load,
  // and skipped entirely for anyone who prefers reduced motion. ----
  const firstCard = reflectionCards[0];
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(firstCard && !prefersReducedMotion){
    const grid = document.querySelector('.reflections-grid');
    if(grid){
      const demoObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if(!entry.isIntersecting) return;
          demoObserver.disconnect();
          setTimeout(() => {
            firstCard.classList.add('is-flipped');
            firstCard.setAttribute('aria-pressed', 'true');
            setTimeout(() => {
              firstCard.classList.remove('is-flipped');
              firstCard.setAttribute('aria-pressed', 'false');
            }, 1300);
          }, 500);
        });
      }, {threshold:0.5});
      demoObserver.observe(grid);
    }
  }
})();

// ---- Bookshelf ("Let's talk books"): hovering a spine previews its book, sliding to
// sit underneath it. Clicking a spine pins that book open so it stays put even after
// your mouse leaves - a small subtle x inside the book (not a floating badge) unpins
// and closes it. While pinned, hovering other spines doesn't change the preview; you
// have to close or click a different spine first. One page is always a photo with its
// title overlaid, the other is the musing text - which side gets the photo alternates
// per spine via data-photo-side. ----
(function(){
  const spines = document.querySelectorAll('[data-book-trigger]');
  const wrap = document.getElementById('bookshelfWrap');
  const stage = document.getElementById('bookStage');
  if(!spines.length || !wrap || !stage) return;
  const open = document.getElementById('bookOpen');
  const closeBtn = document.getElementById('bookOpenClose');
  const pageLeft = document.getElementById('bookPageLeft');
  const pageRight = document.getElementById('bookPageRight');
  let pinned = false;
  let hideTimer = null;

  function photoPageHTML(spine){
    const img = spine.dataset.img || '';
    const title = spine.dataset.title || '';
    return '<img class="book-page-photo" src="' + img + '" alt="' + title + '">';
  }

  function textPageHTML(spine){
    const subtitle = spine.dataset.subtitle || '';
    const text = spine.dataset.text || '';
    return '<div class="book-page-text-wrap">' +
      '<p class="book-page-title">' + subtitle + '</p>' +
      '<p class="book-page-text">' + text + '</p>' +
      '</div>';
  }

  function positionUnderSpine(spine){
    const stageRect = stage.getBoundingClientRect();
    const spineRect = spine.getBoundingClientRect();
    const spineCenter = (spineRect.left - stageRect.left) + spineRect.width / 2;
    const openWidth = open.offsetWidth;
    const maxLeft = Math.max(0, stage.clientWidth - openWidth);
    const left = Math.min(Math.max(0, spineCenter - openWidth / 2), maxLeft);
    open.style.left = left + 'px';
  }

  // .book-stage reserves no space at all by default (height:0 in CSS) - it only
  // grows to match the open book's actual rendered height while a book is
  // showing, and shrinks back to 0 once it's fully closed. Without this the
  // stage sat at a fixed height at all times, leaving a large empty gap under
  // the shelf even with no book open.
  function syncStageHeight(isOpen){
    if(isOpen){
      stage.classList.add('has-open');
      stage.style.height = open.offsetHeight + 'px';
    } else {
      stage.style.height = '0px';
      stage.classList.remove('has-open');
    }
  }

  function showBook(spine){
    clearTimeout(hideTimer);
    spines.forEach(s => s.classList.remove('is-active'));
    spine.classList.add('is-active');

    const photoOnLeft = spine.dataset.photoSide !== 'right';
    pageLeft.innerHTML = photoOnLeft ? photoPageHTML(spine) : textPageHTML(spine);
    pageRight.innerHTML = photoOnLeft ? textPageHTML(spine) : photoPageHTML(spine);

    open.hidden = false;
    positionUnderSpine(spine);
    syncStageHeight(true);
    // fade/scale in on the next frame so the hidden->visible change above has
    // already taken effect and the transition actually has something to animate
    requestAnimationFrame(() => open.classList.add('is-open'));
  }

  // Closing fades the book out smoothly instead of yanking it away instantly:
  // the .is-open class drives the CSS opacity/transform transition, and only
  // once that finishes do we set hidden=true so it's properly removed from
  // layout and the accessibility tree. The stage collapses in parallel.
  function closeBook(){
    pinned = false;
    open.classList.remove('is-pinned', 'is-open');
    spines.forEach(s => s.classList.remove('is-active'));
    syncStageHeight(false);
    clearTimeout(hideTimer);
    hideTimer = window.setTimeout(() => { open.hidden = true; }, 220);
  }

  spines.forEach(spine => {
    spine.addEventListener('mouseenter', () => { if(!pinned) showBook(spine); });
    spine.addEventListener('focus', () => { if(!pinned) showBook(spine); });
    spine.addEventListener('click', () => { pinned = true; showBook(spine); open.classList.add('is-pinned'); });
  });
  wrap.addEventListener('mouseleave', () => { if(!pinned) closeBook(); });
  wrap.addEventListener('focusout', (e) => {
    if(!pinned && !wrap.contains(e.relatedTarget)) closeBook();
  });
  if(closeBtn){
    closeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      closeBook();
    });
  }
  document.addEventListener('keydown', (e) => {
    if(e.key === 'Escape' && !open.hidden) closeBook();
  });
  window.addEventListener('resize', () => { if(!open.hidden) syncStageHeight(true); });
})();


// ---- Bookshelf spine type-fitting: scales each standing spine's title/author
// type to that spine's own rendered width, then — if the label still doesn't
// fit the spine's height — fixes it in this order: (1) bump the author onto
// its own line so the title has the column to itself, (2) shrink the title's
// font size a little at a time, (3) only as a last resort, wrap the title
// itself across two lines. Runs after fonts/layout settle and again on
// resize/orientation change. ----
(function(){
  const spines = document.querySelectorAll('.book-spine[data-book-trigger]:not(.book-spine--flat)');
  if(!spines.length) return;

  const MIN_TITLE_FONT = 6.5;

  function fitSpine(spine){
    const label = spine.querySelector('.book-spine-label');
    const titleEl = spine.querySelector('.book-spine-title');
    if(!label || !titleEl) return;

    // remember the untouched title text so repeated runs (e.g. on resize) don't
    // compound an earlier <br> insertion or font-size override
    if(titleEl.dataset.fullTitle === undefined){
      titleEl.dataset.fullTitle = titleEl.textContent;
    }
    titleEl.textContent = titleEl.dataset.fullTitle;
    titleEl.style.fontSize = '';
    spine.classList.remove('book-spine--wide', 'book-spine--narrow', 'book-spine--title-wrap', 'book-spine--author-line');

    const width = spine.getBoundingClientRect().width;
    if(width >= 44){
      spine.classList.add('book-spine--wide');
    } else if(width <= 30){
      spine.classList.add('book-spine--narrow');
    }

    // let the font-size from the width class settle, then work through the
    // fallbacks above until the label actually fits the spine's height
    requestAnimationFrame(() => {
      const available = spine.clientHeight - 10;
      if(label.scrollHeight <= available) return;

      // 1) author onto its own line - title no longer has to share the column
      spine.classList.add('book-spine--author-line');
      if(label.scrollHeight <= available) return;

      // 2) title alone still doesn't fit on one line - shrink it gradually
      let fontSize = parseFloat(window.getComputedStyle(titleEl).fontSize);
      while(label.scrollHeight > available && fontSize > MIN_TITLE_FONT){
        fontSize -= 0.5;
        titleEl.style.fontSize = fontSize + 'px';
      }
      if(label.scrollHeight <= available) return;

      // 3) last resort - wrap the title itself across two lines at the middle word.
      // Skipped for spines forced onto a single line (book-spine--force-inline) -
      // for those, shrinking is as far as this goes; wrapping would break the
      // one-line layout that was specifically asked for.
      if(spine.classList.contains('book-spine--force-inline')) return;
      const words = titleEl.dataset.fullTitle.trim().split(/\s+/);
      if(words.length > 1){
        const mid = Math.ceil(words.length / 2);
        titleEl.innerHTML = words.slice(0, mid).join(' ') + '<br>' + words.slice(mid).join(' ');
        spine.classList.add('book-spine--title-wrap');
      }
    });
  }

  function fitAllSpines(){
    spines.forEach(fitSpine);
  }

  if(document.fonts && document.fonts.ready){
    document.fonts.ready.then(fitAllSpines);
  } else {
    fitAllSpines();
  }
  window.addEventListener('resize', fitAllSpines);
})();

// ---- page loader: shown immediately in markup so there's never a blank flash,
// removed once the window has actually finished loading (images, fonts, iframes
// included), with a small minimum-visible time so it never just flickers on fast
// connections. ----
(function(){
  const loader = document.getElementById('pageLoader');
  if(!loader) return;
  const shownAt = Date.now();
  const MIN_VISIBLE_MS = 700;

  function hideLoader(){
    const elapsed = Date.now() - shownAt;
    const wait = Math.max(0, MIN_VISIBLE_MS - elapsed);
    setTimeout(() => {
      loader.classList.add('is-hidden');
      loader.addEventListener('transitionend', () => loader.remove(), {once:true});
    }, wait);
  }

  if(document.readyState === 'complete'){
    hideLoader();
  } else {
    window.addEventListener('load', hideLoader);
  }
})();

// ---- solid "follower" circle cursor for a specific set of interactive sections
// (Work gallery cards, Recognition circles, Map tiles, Filmstrip frames, Book
// spines, Reflection cards, and the lightbox close/nav buttons). This is a real DOM
// dot, not a static per-element cursor image like the plane/hand system above -
// it's positioned via CSS custom properties on every mousemove and swaps to that
// section's own palette color on mouseenter. The plane/hand cursor system is left
// completely alone: this only hides the *native* cursor on the specific element
// being hovered (via that element's own inline style, not document.body), for the
// exact duration the dot is standing in for it, so nothing else on the page is
// affected. Skipped entirely on touch devices, which never show a cursor anyway. ----
(function(){
  if(!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  const dot = document.createElement('div');
  dot.className = 'custom-cursor-dot';
  const dotInner = document.createElement('div');
  dotInner.className = 'dot-inner';
  dot.appendChild(dotInner);
  document.body.appendChild(dot);

  // one entry per section: its selector and the palette color its dot should use.
  // same color everywhere right now, kept as a lookup per selector (rather than
  // one shared constant) in case you want per-section colors back later.
  const cursorGroups = [
    // most-specific/nested selectors go first: matching is done via closest()
    // walking up from the actual hovered element, and stops at the first group
    // that matches, so a close button living *inside* a gallery card must be
    // checked before that card's own (broader) selector, or the card's rule
    // would always win first and the button would never be reached.
    // every "×" close button on the site, consolidated into one group so they're
    // all guaranteed to behave identically - .work-gallery-detail-close covers
    // both the Work and Recognition detail panels (the Recognition one carries
    // that class alongside its own), .popup-close is the header/nav popup,
    // .book-open-close is the bookshelf panel, and the two lightboxes.
    { selector: '.popup-close, .work-gallery-detail-close, .book-open-close, .map-lightbox-close, .art-lightbox-close', color: 'rgba(26,26,26,0.55)' },
    { selector: '.work-gallery-hint, .recognition-hint', color: 'rgba(26,26,26,0.55)' },
    { selector: '.work-gallery-card', color: 'rgba(26,26,26,0.55)' },
    { selector: '.recognition-card', color: 'rgba(26,26,26,0.55)' },
    { selector: '.map-tile', color: 'rgba(26,26,26,0.55)' },
    { selector: '.filmstrip-frame', color: 'rgba(26,26,26,0.55)' },
    { selector: '.book-spine[data-book-trigger]', color: 'rgba(26,26,26,0.55)' },
    { selector: '.reflection-card[data-reflection-flip]', color: 'rgba(26,26,26,0.55)' },
    { selector: '.map-lightbox-nav, .art-lightbox-nav', color: 'rgba(26,26,26,0.55)' },
    { selector: '.dialogues-blob', color: 'rgba(26,26,26,0.55)' },
    { selector: '.popup-close, .work-gallery-detail-close, .book-open-close, .map-lightbox-close, .art-lightbox-close', color: 'rgba(26,26,26,0.55)' },
    { selector: '.pill--static', color: 'rgba(26,26,26,0.55)', outline: true }
  ];

  // Driven by live mouse position + event.target rather than mouseenter/mouseleave
  // bound once to each element at page load. That earlier approach broke around the
  // Work section's expand/collapse: opening or closing a project card triggers a big
  // reflow (the detail panel gets injected/hidden, the card resizes), which could
  // leave a stale element's cursor stuck at "none" or fire enter/leave out of order,
  // showing the dot and the native hand cursor at once. Re-checking the real element
  // under the pointer on every move sidesteps that entirely - there's no listener to
  // go stale, so it self-corrects the instant the mouse moves again after any DOM
  // change, however the layout shifted.
  let lastX = 0, lastY = 0, lastTarget = null, rafPending = false, currentMatchEl = null;

  function clearCurrentMatch(){
    if(currentMatchEl){ currentMatchEl.style.cursor = ''; currentMatchEl = null; }
    dot.classList.remove('is-visible');
  }

  function syncHoverState(target){
    // real <a> links (the "Read more" links, and any inline link inside a
    // project description) sit *inside* cards like .work-gallery-card that are
    // tracked further down this list. Since matching climbs up the DOM tree
    // looking for the nearest tracked ancestor, without this check it would
    // find the card before recognizing the link itself is a distinct clickable
    // thing that should stay pure hand-cursor, no circle. None of the tracked
    // groups below are themselves <a> tags, so it's always safe to bail out
    // early whenever the hovered element is - or sits inside - a real link.
    if(target && target.closest && target.closest('a')){
      clearCurrentMatch();
      return;
    }
    let matchEl = null, matchGroup = null;
    if(target && target.closest){
      for(const group of cursorGroups){
        const found = target.closest(group.selector);
        if(found){ matchEl = found; matchGroup = group; break; }
      }
    }
    if(matchEl){
      if(currentMatchEl !== matchEl){
        if(currentMatchEl) currentMatchEl.style.cursor = '';
        currentMatchEl = matchEl;
        currentMatchEl.style.cursor = 'none';
      }
      dotInner.style.backgroundColor = matchGroup.outline ? 'transparent' : matchGroup.color;
      dotInner.classList.toggle('is-outline', !!matchGroup.outline);
      dot.classList.add('is-visible');
    } else {
      clearCurrentMatch();
    }
  }

  document.addEventListener('mousemove', (e) => {
    lastX = e.clientX; lastY = e.clientY; lastTarget = e.target;
    if(rafPending) return;
    rafPending = true;
    requestAnimationFrame(() => {
      dot.style.setProperty('--x', lastX + 'px');
      dot.style.setProperty('--y', lastY + 'px');
      syncHoverState(lastTarget);
      rafPending = false;
    });
  });

  // if the mouse leaves the window entirely, don't leave the dot (or a stray
  // cursor:none) stuck on whatever it was last over
  document.addEventListener('mouseleave', clearCurrentMatch);
})();

// ---- magnifying loupe for the three big standalone photos: headshot, the
// Copenhagen break photo, and the Creative Studio quote photo. A real DOM
// circle follows the mouse and shows an actually-magnified crop of the same
// photo inside it (via a scaled CSS background-image, not a duplicated <img>
// element), so it reflects the real photo pixel-for-pixel rather than an
// approximation. Skipped entirely on touch devices - there's no hover there to
// drive a "follow the cursor" effect, so the images just behave normally. ----
(function(){
  if(!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  const targets = [
    { container: '.intro-photo-wrap', img: '.intro-photo' },
    { container: '.work-break-photo', img: 'img' },
    { container: '.studio-quote-photo', img: 'img' },
    { container: '.map-feature-photo-wrap', img: '.map-feature-photo' },
    { container: '.talkbooks-photo-wrap', img: '.talkbooks-photo' }
  ];
  const SCALE = 2.4;
  const LENS_SIZE = 78;

  targets.forEach(({container, img}) => {
    const wrap = document.querySelector(container);
    if(!wrap) return;
    const photo = wrap.querySelector(img);
    if(!photo) return;

    wrap.setAttribute('data-magnify', '');
    const lens = document.createElement('div');
    lens.className = 'magnify-lens';
    lens.style.backgroundImage = `url("${photo.currentSrc || photo.src}")`;
    wrap.appendChild(lens);

    // in case the photo is still loading when this runs (lazy-loaded images),
    // pick up its real src once it's actually available rather than baking in
    // an empty background-image
    if(!photo.currentSrc && !photo.complete){
      photo.addEventListener('load', () => {
        lens.style.backgroundImage = `url("${photo.currentSrc || photo.src}")`;
      }, {once:true});
    }

    wrap.addEventListener('mousemove', (e) => {
      const rect = wrap.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      lens.classList.add('is-visible');
      lens.style.left = (x - LENS_SIZE / 2) + 'px';
      lens.style.top = (y - LENS_SIZE / 2) + 'px';
      lens.style.backgroundSize = (rect.width * SCALE) + 'px ' + (rect.height * SCALE) + 'px';
      lens.style.backgroundPosition =
        (-(x * SCALE - LENS_SIZE / 2)) + 'px ' + (-(y * SCALE - LENS_SIZE / 2)) + 'px';
    });
    wrap.addEventListener('mouseleave', () => {
      lens.classList.remove('is-visible');
    });
  });
})();

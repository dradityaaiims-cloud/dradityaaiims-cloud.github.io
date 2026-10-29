// Boba, the assistant dog from the simulators, adapted for the hub: greets, helps pick a simulator,
// comments on the section in view, naps when idle. Rule-based, no network.
import { SYSTEMS, SIMS } from './sims.js';

const KEY = 'hub-boba-quiet';
const SECTION_TIPS = {
  simulators: 'Every simulator runs in your browser. Nothing to install, and nothing you do leaves your computer.',
  about: 'That is my human. He builds these between shifts. I supervise.',
  cite: 'Teaching with one of these? Cite the version you used. Each one has its own DOI.',
  feedback: 'Found a mistake? Tell him. He fixes things fast, and I get a treat for every bug report.',
};
const PETS = ['Woof!', 'That is the spot.', 'More pets, please.', 'I could get used to this.', 'Good human.'];
const TOPICS = { Respiratory: 'Breathing and the airway', Cardiovascular: 'The heart and pressures' };

export function initBoba() {
  let quiet = false; try { quiet = localStorage.getItem(KEY) === '1'; } catch { /* private mode */ }
  const seen = new Set();
  let hideTimer = null, lastActive = Date.now(), asleep = false, pets = 0;

  const root = document.createElement('div'); root.className = 'boba';
  root.innerHTML = `
    <div class="boba-bubble" role="status" aria-live="polite" hidden>
      <button class="boba-x" aria-label="Close">Close</button>
      <p class="boba-text"></p>
      <div class="boba-btns"></div>
    </div>
    <button class="boba-dog" aria-label="Boba, the assistant dog. Press for help." title="Click me. Double click for zoomies.">
      <img src="assets/boba.webp" alt="" width="120" height="120" draggable="false" />
      <span class="boba-zzz" aria-hidden="true">z z z</span>
    </button>`;
  document.body.append(root);
  const bubble = root.querySelector('.boba-bubble'), text = root.querySelector('.boba-text'), btns = root.querySelector('.boba-btns');
  const dog = root.querySelector('.boba-dog');

  const anim = (cls, ms) => { dog.classList.remove('wag', 'hop', 'zoom'); void dog.offsetWidth; dog.classList.add(cls); setTimeout(() => dog.classList.remove(cls), ms); };
  const go = (id) => { close(); document.getElementById(id).scrollIntoView({ behavior: 'smooth' }); };

  // choices: [label, fn] pairs, or [label, href] to open a link
  function say(msg, choices = menu(), autoHide = 0) {
    text.textContent = msg; btns.replaceChildren();
    for (const [label, act] of choices) {
      const b = document.createElement(typeof act === 'string' ? 'a' : 'button');
      b.textContent = label;
      if (typeof act === 'string') Object.assign(b, { href: act, target: '_blank', rel: 'noopener noreferrer' });
      else b.onclick = (e) => { e.stopPropagation(); act(); };
      btns.append(b);
    }
    bubble.hidden = false; anim('wag', 900);
    clearTimeout(hideTimer); if (autoHide) hideTimer = setTimeout(close, autoHide);
  }
  function close() { bubble.hidden = true; clearTimeout(hideTimer); }

  const menu = () => [
    ['Help me pick a simulator', pick],
    ['How do I cite one?', () => go('cite')],
    ['Send feedback', () => go('feedback')],
    [quiet ? 'Unmute' : 'Hush', toggleQuiet],
  ];
  function pick() {
    say('What do you want to practise?', [...SYSTEMS.map((s) => [TOPICS[s] || s, () => suggest(s)]), ['Back', () => say('What can I help with?')]]);
  }
  function suggest(system) {
    const list = SIMS.filter((s) => s.system === system);
    say(`Good choice. Try ${list.length > 1 ? 'one of these' : 'this one'}. Each opens in a new tab.`, [...list.map((s) => [s.name, s.url]), ['Something else', pick]]);
  }
  function toggleQuiet() {
    quiet = !quiet; try { localStorage.setItem(KEY, quiet ? '1' : '0'); } catch { /* */ }
    say(quiet ? 'Okay, I will stay quiet. Click me any time.' : 'Yay! I will chime in as you scroll.', menu(), 4000);
  }

  dog.addEventListener('click', () => {
    lastActive = Date.now();
    if (asleep) { asleep = false; dog.classList.remove('nap'); return say('Woof! I am awake. What can I help with?'); }
    if (!bubble.hidden) return close();
    pets++; anim('hop', 500);
    say(pets > 1 && pets % 3 === 0 ? PETS[(pets / 3) % PETS.length] : 'What can I help with?');
  });
  dog.addEventListener('dblclick', () => { anim('zoom', 1400); say('Zoomies!', [], 2500); });
  root.querySelector('.boba-x').onclick = close;
  for (const ev of ['scroll', 'pointerdown', 'keydown']) addEventListener(ev, () => { lastActive = Date.now(); }, { passive: true });

  // one comment per section, the first time it scrolls into view
  const io = new IntersectionObserver((entries) => entries.forEach((e) => {
    const id = e.target.id;
    if (!e.isIntersecting || seen.has(id) || quiet || asleep || !bubble.hidden) return;
    seen.add(id); say(SECTION_TIPS[id], menu(), 9000);
  }), { threshold: 0.35 });
  Object.keys(SECTION_TIPS).forEach((id) => io.observe(document.getElementById(id)));

  // nap after three idle minutes; small idle antics otherwise
  setInterval(() => {
    if (!asleep && Date.now() - lastActive > 180e3) { asleep = true; close(); dog.classList.add('nap'); return; }
    if (!asleep && bubble.hidden && Math.random() < 0.15) anim(Math.random() < 0.6 ? 'wag' : 'hop', 900);
  }, 5000);

  setTimeout(() => { if (!quiet) say("Hi, I'm Boba! I can help you find the right simulator.", menu(), 14000); }, 2000);
}

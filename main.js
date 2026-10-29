import { SYSTEMS, SIMS, apa } from './sims.js';
import { initBoba } from './boba.js';

const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const ext = (href, text) => `<a class="link" href="${esc(href)}" target="_blank" rel="noopener noreferrer">${esc(text)}</a>`;

document.getElementById('sim-list').innerHTML = SYSTEMS.map((sys) => `
  <h3 class="label system">${esc(sys)}</h3>
  ${SIMS.filter((s) => s.system === sys).map((s) => `
  <article class="sim reveal">
    <a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer" tabindex="-1" aria-hidden="true"><img src="${esc(s.thumb)}" alt="" width="1440" height="900" loading="lazy" /></a>
    <div>
      <h4>${esc(s.name)}</h4>
      <p class="meta">Version ${esc(s.version)}</p>
      <p>${esc(s.blurb)}</p>
      <p class="sim-links">${ext(s.url, 'Open the simulator')} ${ext(s.repo, 'Source code')} ${ext('https://doi.org/' + s.doi, 'DOI ' + s.doi)}</p>
    </div>
  </article>`).join('')}`).join('');

document.getElementById('cite-list').innerHTML = SIMS.map((s) => `<li>${esc(apa(s))}</li>`).join('');

// Newest simulator stands in the hero.
const newest = SIMS[SIMS.length - 1];
const hero = document.getElementById('hero-img');
hero.src = newest.thumb;
hero.alt = `Screenshot of ${newest.name}`;

// Email split so it is not plain text in the page source (same as the simulators).
document.getElementById('mail-text').textContent = `${'draditya.aiims'}@${'gmail.com'}`;
document.getElementById('mail').href = `mailto:${'draditya.aiims'}@${'gmail.com'}?subject=${encodeURIComponent('Simulator feedback')}&body=${encodeURIComponent('Simulator:\nWhat I expected:\nWhat happened:\nBrowser and device:\n')}`;

const nav = document.getElementById('nav');
addEventListener('scroll', () => nav.classList.toggle('compact', scrollY > 40), { passive: true });

const btn = nav.querySelector('.menu-btn');
btn.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  btn.setAttribute('aria-expanded', open);
});
nav.querySelectorAll('nav a').forEach((a) => a.addEventListener('click', () => {
  nav.classList.remove('open');
  btn.setAttribute('aria-expanded', 'false');
}));

const io = new IntersectionObserver((entries) => entries.forEach((e) => {
  if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
}), { rootMargin: '0px 0px -8% 0px' });
document.querySelectorAll('.reveal').forEach((el) => io.observe(el));

initBoba();

const root = document.documentElement;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const motionButtons = document.querySelectorAll('.motion-toggle');
let motionPaused = reducedMotion.matches;
let explicitMotion = false;
try {
  const savedMotion = localStorage.getItem('rbs-motion') || sessionStorage.getItem('rbs-motion');
  if (savedMotion === 'paused' || savedMotion === 'enabled') {
    motionPaused = savedMotion === 'paused';
    explicitMotion = true;
  }
} catch {}
function setMotion(paused) {
  motionPaused = paused;
  root.classList.toggle('motion-off', paused);
  root.classList.toggle('motion-enabled', !paused);
  motionButtons.forEach(button => {
    button.setAttribute('aria-pressed', String(!paused));
    button.setAttribute('aria-label', paused ? 'Enable animations' : 'Pause animations');
    button.title = paused && reducedMotion.matches
      ? 'Your browser requests reduced motion. Enable animations for this website.'
      : 'Remember this animation setting for this website.';
    button.querySelector('.motion-label').textContent = paused ? 'Enable animations' : 'Animations on';
  });
}
setMotion(motionPaused);
motionButtons.forEach(button => button.addEventListener('click', () => {
  explicitMotion = true;
  setMotion(!motionPaused);
  const preference = motionPaused ? 'paused' : 'enabled';
  try { localStorage.setItem('rbs-motion', preference); } catch {}
  try { sessionStorage.setItem('rbs-motion', preference); } catch {}
}));
reducedMotion.addEventListener('change', event => {
  if (!explicitMotion) setMotion(event.matches);
});

const menuButton = document.querySelector('.menu-toggle');
const mobileNav = document.querySelector('#mobile-nav');
function closeMenu() {
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Open navigation');
  mobileNav.hidden = true;
}
menuButton.addEventListener('click', () => {
  const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
  mobileNav.hidden = isOpen;
  menuButton.setAttribute('aria-expanded', String(!isOpen));
  menuButton.setAttribute('aria-label', isOpen ? 'Open navigation' : 'Close navigation');
});
mobileNav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });
window.matchMedia('(min-width: 801px)').addEventListener('change', event => { if (event.matches) closeMenu(); });

const progress = document.querySelector('.scroll-progress');
let scrollScheduled = false;
function updateProgress() {
  const range = root.scrollHeight - window.innerHeight;
  progress.style.transform = 'scaleX(' + (range > 0 ? window.scrollY / range : 0) + ')';
  scrollScheduled = false;
}
window.addEventListener('scroll', () => {
  if (!scrollScheduled) { requestAnimationFrame(updateProgress); scrollScheduled = true; }
}, { passive: true });
window.addEventListener('resize', updateProgress);
updateProgress();

const heroArt = document.querySelector('.hero-art');
heroArt.addEventListener('pointermove', event => {
  if (motionPaused || event.pointerType !== 'mouse') return;
  const box = heroArt.getBoundingClientRect();
  heroArt.style.setProperty('--tilt-x', ((event.clientX - box.left) / box.width - .5) * 9 + 'deg');
  heroArt.style.setProperty('--tilt-y', -((event.clientY - box.top) / box.height - .5) * 9 + 'deg');
});
heroArt.addEventListener('pointerleave', () => {
  heroArt.style.setProperty('--tilt-x', '0deg');
  heroArt.style.setProperty('--tilt-y', '0deg');
});

const dialog = document.querySelector('#booking-dialog');
const serviceChoice = document.querySelector('#service-choice');
const message = document.querySelector('#booking-message');
const status = document.querySelector('#copy-status');
let returnFocus = null;
function draftMessage() {
  message.value = 'Hi Rabie! I’d like to ask about ' + serviceChoice.value.toLowerCase() + '. Could you let me know your price and next available appointments? Thank you!';
  status.textContent = 'No message is sent automatically.';
}
document.querySelectorAll('[data-book]').forEach(button => button.addEventListener('click', () => {
  returnFocus = button;
  closeMenu();
  serviceChoice.value = button.dataset.service || 'Help choosing a look';
  draftMessage();
  dialog.showModal();
}));
serviceChoice.addEventListener('change', draftMessage);
message.addEventListener('input', () => { status.textContent = 'No message is sent automatically.'; });
document.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => {
  const rect = dialog.getBoundingClientRect();
  if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) dialog.close();
});
dialog.addEventListener('close', () => {
  const target = returnFocus && returnFocus.getClientRects().length ? returnFocus : menuButton;
  target.focus();
});
document.querySelector('#copy-message').addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(message.value);
    status.textContent = 'Message copied. Open Instagram and paste it into a message to Rabie.';
  } catch {
    message.focus();
    message.select();
    status.textContent = 'Select and copy the message, then paste it into Instagram.';
  }
});

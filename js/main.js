/* ===================================================
   SPLASH + AUDIO
   Los navegadores bloquean el autoplay con sonido.
   La solucion: la musica arranca cuando Sandra toca
   el boton del splash, que cuenta como interaccion.
=================================================== */
const splash    = document.getElementById('splash');
const splashBtn = document.getElementById('splashBtn');
const bgMusic   = document.getElementById('bgMusic');
const musicBar  = document.getElementById('musicBar');
const musicToggle = document.getElementById('musicToggle');
const musicIcon   = document.getElementById('musicIcon');

splashBtn.addEventListener('click', () => {
  // Iniciar musica
  bgMusic.volume = 0;
  bgMusic.play().then(() => {
    fadeInAudio(bgMusic, 0.55, 2500); // fade in suave en 2.5 s
  }).catch(() => {
    // Si el navegador bloquea de todas formas, mostramos el control igualmente
  });

  // Ocultar splash
  splash.classList.add('hidden');

  // Mostrar barra de musica
  setTimeout(() => musicBar.classList.remove('hidden'), 900);
});

// Fade in de audio
function fadeInAudio(audio, targetVol, duration) {
  const steps    = 40;
  const interval = duration / steps;
  const step     = targetVol / steps;
  let current    = 0;
  const timer = setInterval(() => {
    current += step;
    if (current >= targetVol) {
      audio.volume = targetVol;
      clearInterval(timer);
    } else {
      audio.volume = current;
    }
  }, interval);
}

// Play / Pause toggle
musicToggle.addEventListener('click', () => {
  if (bgMusic.paused) {
    bgMusic.play();
    musicIcon.innerHTML = '&#9646;&#9646;';
    musicToggle.setAttribute('aria-label', 'Pausar musica');
  } else {
    bgMusic.pause();
    musicIcon.innerHTML = '&#9654;';
    musicToggle.setAttribute('aria-label', 'Reproducir musica');
  }
});

/* ===================================================
   SCROLL-REVEAL
=================================================== */
const revealEls = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      revealObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.1 });
revealEls.forEach(el => revealObserver.observe(el));

/* ===================================================
   HEART CONFETTI
=================================================== */
const canvas = document.getElementById('confetti-canvas');
const ctx    = canvas.getContext('2d');
let particles = [];
let animId    = null;

function resizeCanvas() {
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

const COLORS = ['#F2A7BB','#E8CC7A','#C9A84C','#E8D5F5','#F9DCC4'];

function createParticle() {
  return {
    x:     Math.random() * canvas.width,
    y:     -20,
    vy:    1.5 + Math.random() * 2.5,
    vx:    (Math.random() - .5) * 1.5,
    rot:   Math.random() * 360,
    rotV:  (Math.random() - .5) * 4,
    size:  14 + Math.random() * 18,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    char:  '\u2764',
    alpha: 1
  };
}

function launchConfetti() {
  particles = [];
  for (let i = 0; i < 110; i++) {
    const p = createParticle();
    p.y = -20 - Math.random() * 400;
    particles.push(p);
  }
  if (animId) cancelAnimationFrame(animId);
  animateConfetti();
}

function animateConfetti() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach(p => {
    p.x   += p.vx;
    p.y   += p.vy;
    p.rot += p.rotV;
    if (p.y > canvas.height - 80) p.alpha -= .022;

    ctx.save();
    ctx.globalAlpha = Math.max(0, p.alpha);
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot * Math.PI / 180);
    ctx.font = `${p.size}px serif`;
    ctx.fillStyle = p.color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(p.char, 0, 0);
    ctx.restore();
  });
  particles = particles.filter(p => p.alpha > 0);
  if (particles.length > 0) {
    animId = requestAnimationFrame(animateConfetti);
  } else {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
}

/* ===================================================
   SURPRISE BUTTON
=================================================== */
const btnSorpresa = document.getElementById('btnSorpresa');
const hiddenMsg   = document.getElementById('hiddenMsg');

btnSorpresa.addEventListener('click', () => {
  hiddenMsg.classList.add('show');
  launchConfetti();
  btnSorpresa.textContent = '\u2764 Te amo, Sandra \u2764';
});

/* ===================================================
   CAROUSEL
=================================================== */
const track   = document.getElementById('track');
const dotsEl  = document.querySelectorAll('.dot');
const slides  = track.children;
let current   = 0;
let autoTimer = null;

function goTo(i) {
  current = (i + slides.length) % slides.length;
  track.style.transform = `translateX(-${current * 100}%)`;
  dotsEl.forEach((d, idx) => d.classList.toggle('active', idx === current));
}

function startAutoplay() {
  clearInterval(autoTimer);
  autoTimer = setInterval(() => goTo(current + 1), 4500);
}

document.getElementById('prevBtn').addEventListener('click', () => {
  goTo(current - 1); startAutoplay();
});
document.getElementById('nextBtn').addEventListener('click', () => {
  goTo(current + 1); startAutoplay();
});
dotsEl.forEach(d => d.addEventListener('click', () => {
  goTo(+d.dataset.i); startAutoplay();
}));

startAutoplay();

// Touch / swipe
let touchStartX = 0;
let touchStartY = 0;

track.addEventListener('touchstart', e => {
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
}, { passive: true });

track.addEventListener('touchend', e => {
  const dx = e.changedTouches[0].clientX - touchStartX;
  const dy = e.changedTouches[0].clientY - touchStartY;
  if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
    goTo(dx < 0 ? current + 1 : current - 1);
    startAutoplay();
  }
}, { passive: true });

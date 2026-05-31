/* ═══════════════════════════════════════════════════════
   CORE TALENT · script.js
   Interacciones, animaciones y funcionalidades JS
═══════════════════════════════════════════════════════ */

'use strict';

/* ── Navbar scroll ────────────────────────────────────── */
const mainNav   = document.getElementById('mainNav');
const backTop   = document.getElementById('backTop');

window.addEventListener('scroll', () => {
  const scrollY = window.scrollY;

  // Navbar estilo
  if (scrollY > 60) {
    mainNav.classList.add('scrolled');
  } else {
    mainNav.classList.remove('scrolled');
  }

  // Botón volver arriba
  if (scrollY > 400) {
    backTop.classList.add('visible');
  } else {
    backTop.classList.remove('visible');
  }
}, { passive: true });

// Volver arriba
backTop?.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

/* ── Active nav link on scroll ───────────────────────── */
const sections = document.querySelectorAll('section[id], div[id]');
const navLinks = document.querySelectorAll('.navbar-nav .nav-link');

const observerNav = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(link => link.classList.remove('active'));
      const active = document.querySelector(`.navbar-nav .nav-link[href="#${entry.target.id}"]`);
      if (active) active.classList.add('active');
    }
  });
}, { threshold: 0.4 });

sections.forEach(s => observerNav.observe(s));

/* ── Animate on scroll ───────────────────────────────── */
const animElements = document.querySelectorAll('[data-animate]');

const observerAnim = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el    = entry.target;
      const delay = parseInt(el.dataset.delay || '0');
      setTimeout(() => {
        el.classList.add('in-view');
      }, delay);
      observerAnim.unobserve(el);
    }
  });
}, { threshold: 0.15 });

animElements.forEach(el => observerAnim.observe(el));

/* ── Counter animation ───────────────────────────────── */
const counters = document.querySelectorAll('[data-count]');
let countersStarted = false;

function startCounters() {
  if (countersStarted) return;
  countersStarted = true;
  counters.forEach(el => {
    const target   = parseInt(el.dataset.count);
    const duration = 2000;
    const step     = target / (duration / 16);
    let current    = 0;
    const timer = setInterval(() => {
      current += step;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      el.textContent = Math.floor(current);
    }, 16);
  });
}

// Trigger cuando el hero entra en viewport
const heroSection = document.getElementById('inicio');
if (heroSection) {
  const observerHero = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) startCounters();
    });
  }, { threshold: 0.3 });
  observerHero.observe(heroSection);
}

/* ── Smooth scroll para links internos ───────────────── */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const targetId = this.getAttribute('href');
    if (targetId === '#') return;
    const target = document.querySelector(targetId);
    if (!target) return;
    e.preventDefault();

    // Cerrar navbar mobile si está abierta
    const navCollapse = document.getElementById('navMenu');
    if (navCollapse && navCollapse.classList.contains('show')) {
      const bsCollapse = bootstrap.Collapse.getOrCreateInstance(navCollapse);
      bsCollapse.hide();
    }

    const offset = mainNav ? mainNav.offsetHeight : 0;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

/* ── CV Upload drag & drop ───────────────────────────── */
const uploadZone = document.getElementById('cvUploadZone');
const fileInput  = document.getElementById('cvFileInput');

if (uploadZone && fileInput) {
  ['dragenter', 'dragover'].forEach(evt => {
    uploadZone.addEventListener(evt, (e) => {
      e.preventDefault();
      uploadZone.classList.add('dragover');
    });
  });

  ['dragleave', 'drop'].forEach(evt => {
    uploadZone.addEventListener(evt, (e) => {
      e.preventDefault();
      uploadZone.classList.remove('dragover');
    });
  });

  uploadZone.addEventListener('drop', (e) => {
    const files = e.dataTransfer.files;
    if (files.length > 0) handleFile(files[0]);
  });

  fileInput.addEventListener('change', () => {
    if (fileInput.files.length > 0) handleFile(fileInput.files[0]);
  });
}

function handleFile(file) {
  const allowed = ['application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

  if (!allowed.includes(file.type)) {
    showToast('Solo se permiten archivos PDF, DOC o DOCX.', 'error');
    return;
  }
  if (file.size > 5 * 1024 * 1024) {
    showToast('El archivo no puede superar los 5MB.', 'error');
    return;
  }

  // Actualizar UI de la zona de carga
  const icon = uploadZone.querySelector('.cv-upload-icon');
  const text = uploadZone.querySelector('.cv-upload-text');
  const sub  = uploadZone.querySelector('.cv-upload-sub');
  if (icon) { icon.classList.remove('bi-cloud-upload-fill'); icon.classList.add('bi-file-earmark-check-fill'); icon.style.color = '#159BA8'; }
  if (text) text.textContent = file.name;
  if (sub)  sub.textContent  = `${(file.size / 1024).toFixed(0)} KB`;
  uploadZone.style.borderColor = '#159BA8';
  uploadZone.style.background  = 'rgba(21,155,168,.06)';
}

/* ── Form submissions ────────────────────────────────── */
function submitCV() {
  const inputs = document.querySelectorAll('.cv-form-card .ct-input');
  let valid = true;

  inputs.forEach(input => {
    if (input.hasAttribute('placeholder') &&
        input.getAttribute('placeholder').includes('*') &&
        !input.value.trim()) {
      input.style.borderColor = '#ef4444';
      valid = false;
    } else {
      input.style.borderColor = '';
    }
  });

  if (!valid) {
    showToast('Por favor completá los campos requeridos.', 'error');
    return;
  }

  showToast('¡Tu CV fue enviado con éxito! Nos pondremos en contacto contigo.', 'success');

  // Reset form
  inputs.forEach(input => {
    if (input.tagName === 'SELECT') input.selectedIndex = 0;
    else input.value = '';
    input.style.borderColor = '';
  });

  // Reset upload zone
  const icon = document.querySelector('.cv-upload-icon');
  const text = document.querySelector('.cv-upload-text');
  const sub  = document.querySelector('.cv-upload-sub');
  if (icon) { icon.classList.add('bi-cloud-upload-fill'); icon.classList.remove('bi-file-earmark-check-fill'); icon.style.color = ''; }
  if (text) text.textContent = 'Arrastrá tu CV aquí';
  if (sub)  sub.textContent  = 'PDF, DOC o DOCX · Máx. 5MB';
  if (uploadZone) { uploadZone.style.borderColor = ''; uploadZone.style.background = ''; }
}

function submitContact() {
  const inputs = document.querySelectorAll('.contact-form-card .ct-input');
  let valid = true;

  inputs.forEach(input => {
    const ph = input.getAttribute('placeholder') || '';
    if (ph.includes('*') && !input.value.trim()) {
      input.style.borderColor = '#ef4444';
      valid = false;
    } else {
      input.style.borderColor = '';
    }
  });

  if (!valid) {
    showToast('Por favor completá los campos requeridos.', 'error');
    return;
  }

  showToast('¡Mensaje enviado con éxito! Nos contactaremos a la brevedad.', 'success');
  inputs.forEach(input => {
    if (input.tagName === 'SELECT') input.selectedIndex = 0;
    else input.value = '';
    input.style.borderColor = '';
  });
}

/* ── Toast utility ───────────────────────────────────── */
function showToast(message, type = 'success') {
  const toastEl  = document.getElementById('ctToast');
  const toastMsg = document.getElementById('toastMsg');
  if (!toastEl || !toastMsg) return;

  toastMsg.textContent = message;
  toastEl.className = 'toast align-items-center text-white border-0';
  toastEl.classList.add(type === 'error' ? 'bg-danger' : 'bg-teal');

  const toast = new bootstrap.Toast(toastEl, { delay: 4000 });
  toast.show();
}

/* ── Hover effect on service cards ───────────────────── */
document.querySelectorAll('.service-card:not(.service-card-featured)').forEach(card => {
  card.addEventListener('mouseenter', function () {
    this.querySelector('.service-icon-wrap').style.background = 'var(--teal)';
    this.querySelector('.service-icon-wrap').style.color = 'var(--white)';
  });
  card.addEventListener('mouseleave', function () {
    this.querySelector('.service-icon-wrap').style.background = '';
    this.querySelector('.service-icon-wrap').style.color = '';
  });
});

/* ── Parallax suave en hero ───────────────────────────── */
const heroPattern = document.querySelector('.hero-pattern');
if (heroPattern) {
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    heroPattern.style.transform = `translateY(${scrollY * 0.15}px)`;
  }, { passive: true });
}

/* ── Input border animation ───────────────────────────── */
document.querySelectorAll('.ct-input').forEach(input => {
  input.addEventListener('focus', () => {
    input.style.borderColor = 'var(--teal)';
  });
  input.addEventListener('blur', () => {
    if (!input.style.borderColor.includes('ef4444')) {
      input.style.borderColor = '';
    }
  });
});

/* ── Team photo placeholder hover ────────────────────── */
document.querySelectorAll('.team-card').forEach(card => {
  card.addEventListener('mouseenter', () => {
    const placeholder = card.querySelector('.team-photo-placeholder');
    if (placeholder) {
      placeholder.style.background = 'linear-gradient(145deg, #d6dde6, #c5cfd9)';
    }
  });
  card.addEventListener('mouseleave', () => {
    const placeholder = card.querySelector('.team-photo-placeholder');
    if (placeholder) {
      placeholder.style.background = '';
    }
  });
});

/* ── Init ─────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  // Añadir clases de delay a los data-animate con data-delay
  document.querySelectorAll('[data-animate][data-delay]').forEach(el => {
    el.style.transitionDelay = `${el.dataset.delay}ms`;
  });

  console.log('%cCore Talent · Consultora', 'color:#159BA8;font-size:18px;font-weight:bold;');
  console.log('%cCapacitación y Desarrollo Organizacional · NOA', 'color:#062B5B;font-size:12px;');
});

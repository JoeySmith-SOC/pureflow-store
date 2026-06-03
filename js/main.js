// PureFlow — Main JS

// Nav scroll effect
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav?.classList.toggle('scrolled', window.scrollY > 40);
});

// Mobile nav toggle
const navToggle = document.getElementById('navToggle');
const navLinks = document.querySelector('.nav-links');
const navCta = document.querySelector('.nav-cta');
navToggle?.addEventListener('click', () => {
  const open = navLinks?.style.display === 'flex';
  if (navLinks) navLinks.style.display = open ? 'none' : 'flex';
  if (navLinks) navLinks.style.flexDirection = 'column';
  if (navLinks) navLinks.style.position = open ? '' : 'absolute';
  if (navLinks) navLinks.style.top = open ? '' : '68px';
  if (navLinks) navLinks.style.left = open ? '' : '0';
  if (navLinks) navLinks.style.right = open ? '' : '0';
  if (navLinks) navLinks.style.background = open ? '' : 'var(--navy)';
  if (navLinks) navLinks.style.padding = open ? '' : '20px';
  if (navLinks) navLinks.style.gap = open ? '' : '16px';
  if (navLinks) navLinks.style.borderBottom = open ? '' : '1px solid rgba(255,255,255,0.08)';
});

// Scroll-triggered fade-up animations
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), i * 80);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.product-card, .stat-item, .cert-item, .contaminant, .why-step').forEach(el => {
  el.classList.add('fade-up');
  observer.observe(el);
});

// Newsletter form
const nlForm = document.getElementById('nlForm');
nlForm?.addEventListener('submit', (e) => {
  e.preventDefault();
  const btn = nlForm.querySelector('button');
  btn.textContent = '✓ Subscribed!';
  btn.style.background = 'var(--green)';
  nlForm.querySelector('input').value = '';
  setTimeout(() => {
    btn.textContent = 'Subscribe';
    btn.style.background = '';
  }, 3000);
});

// Contact form (pages/contact.html)
const contactForm = document.getElementById('contactForm');
contactForm?.addEventListener('submit', (e) => {
  e.preventDefault();
  const success = document.getElementById('formSuccess');
  if (success) {
    success.classList.add('show');
    contactForm.reset();
    setTimeout(() => success.classList.remove('show'), 5000);
  }
});

// Smooth anchor links
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', (e) => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

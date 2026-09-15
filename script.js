/* =========================================================
   NOIR — Modern Dining
   script.js
   Organized by feature: preloader, nav, mobile menu, hero parallax,
   scroll reveal, stat counters, menu data + filtering,
   reservation form, gallery, custom cursor.
========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  initPreloader();
  initNav();
  initMobileMenu();
  initHeroParallax();
  initScrollReveal();
  initStatCounters();
  initMenu();
  initReservationForm();
  initCustomCursor();
});

/* ---------------------------------------------------------
   Preloader
--------------------------------------------------------- */
function initPreloader() {
  const preloader = document.getElementById('preloader');
  if (!preloader) return;

  document.body.classList.add('is-loading');
  const MIN_DISPLAY_MS = 1100;
  const start = Date.now();

  const hide = () => {
    const elapsed = Date.now() - start;
    const wait = Math.max(MIN_DISPLAY_MS - elapsed, 0);
    setTimeout(() => {
      preloader.classList.add('is-hidden');
      document.body.classList.remove('is-loading');
    }, wait);
  };

  if (document.readyState === 'complete') {
    hide();
  } else {
    window.addEventListener('load', hide);
  }
}

/* ---------------------------------------------------------
   Navbar: solid-on-scroll + smooth scrolling for in-page links
--------------------------------------------------------- */
function initNav() {
  const nav = document.getElementById('nav');
  if (!nav) return;

  const SCROLL_THRESHOLD = 40;
  let ticking = false;

  const updateNav = () => {
    nav.classList.toggle('is-scrolled', window.scrollY > SCROLL_THRESHOLD);
    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateNav);
      ticking = true;
    }
  }, { passive: true });

  updateNav();

  // Smooth scroll for all in-page anchor links (nav, mobile menu, hero, footer)
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      if (targetId.length < 2) return;
      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();
      const navHeight = document.getElementById('nav').offsetHeight;
      const top = target.getBoundingClientRect().top + window.scrollY - (navHeight - 8);
      window.scrollTo({ top, behavior: 'smooth' });

      closeMobileMenu();
    });
  });
}

/* ---------------------------------------------------------
   Mobile menu
--------------------------------------------------------- */
function closeMobileMenu() {
  const menu = document.getElementById('mobileMenu');
  const burger = document.getElementById('navBurger');
  if (!menu || !burger) return;
  menu.classList.remove('is-open');
  burger.setAttribute('aria-expanded', 'false');
  document.body.classList.remove('is-loading');
}

function initMobileMenu() {
  const burger = document.getElementById('navBurger');
  const menu = document.getElementById('mobileMenu');
  if (!burger || !menu) return;

  burger.addEventListener('click', () => {
    const isOpen = menu.classList.toggle('is-open');
    burger.setAttribute('aria-expanded', String(isOpen));
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });
}

/* ---------------------------------------------------------
   Hero: subtle parallax on mouse move + scroll
--------------------------------------------------------- */
function initHeroParallax() {
  const media = document.getElementById('heroMedia');
  const img = media ? media.querySelector('.hero__img') : null;
  if (!media || !img) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (window.matchMedia('(pointer: coarse)').matches) return; // skip on touch

  let mouseX = 0;
  let mouseY = 0;
  let scrollOffset = 0;

  window.addEventListener('mousemove', (e) => {
    const { innerWidth, innerHeight } = window;
    mouseX = (e.clientX / innerWidth - 0.5) * 18;
    mouseY = (e.clientY / innerHeight - 0.5) * 18;
  }, { passive: true });

  window.addEventListener('scroll', () => {
    scrollOffset = Math.min(window.scrollY * 0.12, 80);
  }, { passive: true });

  const render = () => {
    img.style.transform = `scale(1.06) translate(${mouseX}px, ${mouseY + scrollOffset}px)`;
    requestAnimationFrame(render);
  };
  requestAnimationFrame(render);
}

/* ---------------------------------------------------------
   Scroll reveal via IntersectionObserver
--------------------------------------------------------- */
function initScrollReveal() {
  const targets = document.querySelectorAll('.fade-in');
  if (!targets.length) return;

  if (!('IntersectionObserver' in window)) {
    targets.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

  targets.forEach((el) => observer.observe(el));
}

/* ---------------------------------------------------------
   About stats: count up when visible
--------------------------------------------------------- */
function initStatCounters() {
  const nums = document.querySelectorAll('.stat__num');
  if (!nums.length) return;

  const animateCount = (el) => {
    const target = parseInt(el.dataset.count, 10) || 0;
    const duration = 1200;
    const start = performance.now();

    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target);
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  if (!('IntersectionObserver' in window)) {
    nums.forEach(animateCount);
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  nums.forEach((el) => observer.observe(el));
}

/* ---------------------------------------------------------
   Full menu: data + rendering + filtering
--------------------------------------------------------- */
const menuItems = [
  { name: 'Charred Octopus', description: 'Smoked paprika, potato purée, lemon oil', price: '₸ 6,900', category: 'starters' },
  { name: 'Beef Tartare', description: 'Hand-cut tenderloin, capers, egg yolk, crostini', price: '₸ 5,800', category: 'starters' },
  { name: 'Burrata & Ash', description: 'Roasted beets, hazelnut, aged balsamic', price: '₸ 5,200', category: 'starters' },
  { name: 'Scallop Crudo', description: 'Yuzu, chili oil, crispy shallot', price: '₸ 6,400', category: 'starters' },

  { name: 'Embered Beef', description: 'Charred beef tenderloin, smoked jus', price: '₸ 12,900', category: 'mains' },
  { name: 'Black Garlic Cod', description: 'Miso glaze, seasonal vegetables', price: '₸ 9,800', category: 'mains' },
  { name: 'Truffle Risotto', description: 'Wild mushrooms, parmesan, truffle oil', price: '₸ 8,500', category: 'mains' },
  { name: 'Lamb Rack', description: 'Rosemary crust, charred eggplant, jus', price: '₸ 11,600', category: 'mains' },
  { name: 'Duck Breast', description: 'Cherry gastrique, root vegetables', price: '₸ 10,200', category: 'mains' },

  { name: 'Dark Chocolate', description: '70% cacao, sea salt, vanilla', price: '₸ 4,500', category: 'desserts' },
  { name: 'Burnt Basque Cheesecake', description: 'Caramelized top, berry compote', price: '₸ 4,200', category: 'desserts' },
  { name: 'Smoked Vanilla Panna Cotta', description: 'Espresso crumble, orange zest', price: '₸ 3,900', category: 'desserts' },

  { name: 'Old Fashioned NOIR', description: 'Smoked bourbon, bitters, orange oil', price: '₸ 4,800', category: 'drinks' },
  { name: 'Natural Wine, by glass', description: 'Rotating selection, ask your server', price: '₸ 3,600', category: 'drinks' },
  { name: 'Yuzu Spritz', description: 'Gin, yuzu, soda, thyme', price: '₸ 4,100', category: 'drinks' },
  { name: 'Still / Sparkling Water', description: '750ml', price: '₸ 1,500', category: 'drinks' },
];

function renderMenuItems(items) {
  const list = document.getElementById('menuList');
  if (!list) return;

  list.innerHTML = items.map((item, i) => `
    <article class="menu__item" data-category="${item.category}" style="animation-delay:${Math.min(i, 8) * 0.04}s">
      <div class="menu__item-main">
        <h3>${item.name}</h3>
        <p>${item.description}</p>
      </div>
      <span class="menu__item-price">${item.price}</span>
    </article>
  `).join('');
}

function initMenu() {
  renderMenuItems(menuItems);

  const filters = document.querySelectorAll('.menu__filter');
  if (!filters.length) return;

  filters.forEach((btn) => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;

      filters.forEach((b) => {
        b.classList.toggle('is-active', b === btn);
        b.setAttribute('aria-selected', String(b === btn));
      });

      const filtered = filter === 'all'
        ? menuItems
        : menuItems.filter((item) => item.category === filter);

      renderMenuItems(filtered);
    });
  });
}

/* ---------------------------------------------------------
   Reservation form: client-side validation, no network calls
--------------------------------------------------------- */
function initReservationForm() {
  const form = document.getElementById('reservationForm');
  const success = document.getElementById('reservationSuccess');
  if (!form || !success) return;

  const fields = {
    resName: { validate: (v) => v.trim().length >= 2, message: 'Please enter your name.' },
    resEmail: { validate: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()), message: 'Please enter a valid email.' },
    resDate: { validate: (v) => v.trim().length > 0, message: 'Please choose a date.' },
    resTime: { validate: (v) => v.trim().length > 0, message: 'Please choose a time.' },
    resGuests: { validate: (v) => v.trim().length > 0, message: 'Please select a party size.' },
  };

  const showError = (id, message) => {
    const input = document.getElementById(id);
    const errorEl = document.getElementById(`err-${id}`);
    input.closest('.field').classList.add('has-error');
    errorEl.textContent = message;
  };

  const clearError = (id) => {
    const input = document.getElementById(id);
    const errorEl = document.getElementById(`err-${id}`);
    input.closest('.field').classList.remove('has-error');
    errorEl.textContent = '';
  };

  Object.keys(fields).forEach((id) => {
    const input = document.getElementById(id);
    input.addEventListener('input', () => clearError(id));
    input.addEventListener('change', () => clearError(id));
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let isValid = true;

    Object.entries(fields).forEach(([id, rule]) => {
      const input = document.getElementById(id);
      if (!rule.validate(input.value)) {
        showError(id, rule.message);
        isValid = false;
      } else {
        clearError(id);
      }
    });

    if (!isValid) {
      const firstError = form.querySelector('.has-error input, .has-error select');
      if (firstError) firstError.focus();
      return;
    }

    // No backend — simulate a successful request.
    form.reset();
    form.hidden = true;
    success.hidden = false;
    requestAnimationFrame(() => success.classList.add('is-visible'));
  });
}

/* ---------------------------------------------------------
   Custom cursor (desktop / fine-pointer only)
--------------------------------------------------------- */
function initCustomCursor() {
  if (window.matchMedia('(pointer: coarse)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const dot = document.getElementById('cursorDot');
  if (!dot) return;

  document.body.classList.add('has-custom-cursor');

  window.addEventListener('mousemove', (e) => {
    dot.style.left = `${e.clientX}px`;
    dot.style.top = `${e.clientY}px`;
  }, { passive: true });

  const interactiveSelectors = 'a, button, .sig-card, .gallery__item, input, select';
  document.querySelectorAll(interactiveSelectors).forEach((el) => {
    el.addEventListener('mouseenter', () => dot.classList.add('is-active'));
    el.addEventListener('mouseleave', () => dot.classList.remove('is-active'));
  });
}

/* ═══════════════════════════════════════════════════
   CAKE BEAUTIES — Website JavaScript
   Handles: Navbar · Gallery · FAQ · Scroll · Mobile
═══════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ─── DOM REFS ─── */
  const navbar     = document.getElementById('navbar');
  const hamburger  = document.getElementById('hamburger');
  const navLinks   = document.getElementById('navLinks');
  const galleryGrid = document.getElementById('galleryGrid');
  const filterBtns = document.querySelectorAll('.filter-btn');
  const faqItems   = document.querySelectorAll('.faq-item');
  const scrollTopBtn = document.getElementById('scrollTop');
  const revealEls  = document.querySelectorAll('.reveal');

  /* ══════════════════════════════════════════════
     1. NAVBAR — transparent → solid on scroll
  ══════════════════════════════════════════════ */
  let lastScrollY = 0;

  function handleNavbar() {
    const scrollY = window.scrollY;
    if (scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
    lastScrollY = scrollY;
  }

  window.addEventListener('scroll', handleNavbar, { passive: true });
  handleNavbar();

  /* ══════════════════════════════════════════════
     2. MOBILE HAMBURGER MENU
  ══════════════════════════════════════════════ */
  function toggleMenu() {
    const isOpen = navLinks.classList.toggle('open');
    hamburger.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  }

  function closeMenu() {
    navLinks.classList.remove('open');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  if (hamburger) hamburger.addEventListener('click', toggleMenu);

  /* Close menu when a nav link is clicked */
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  /* Close menu on outside click */
  document.addEventListener('click', (e) => {
    if (navLinks.classList.contains('open') &&
        !navLinks.contains(e.target) &&
        !hamburger.contains(e.target)) {
      closeMenu();
    }
  });

  /* Close on resize if desktop */
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) closeMenu();
  });

  /* ══════════════════════════════════════════════
     3. GALLERY FILTER SYSTEM
  ══════════════════════════════════════════════ */
  function filterGallery(filter) {
    const cards = galleryGrid ? galleryGrid.querySelectorAll('.gallery-card') : [];

    cards.forEach((card, i) => {
      const category = card.getAttribute('data-category') || '';
      const show = filter === 'all' || category === filter;

      if (show) {
        card.classList.remove('hidden');
        card.style.animationDelay = `${i * 0.05}s`;
        /* Trigger re-paint for animation */
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            card.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
            card.style.opacity = '';
            card.style.transform = '';
          });
        });
      } else {
        card.classList.add('hidden');
        card.style.opacity = '';
        card.style.transform = '';
      }
    });
  }

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.getAttribute('data-filter');
      filterGallery(filter);
    });
  });

  /* ══════════════════════════════════════════════
     4. FAQ ACCORDION
  ══════════════════════════════════════════════ */
  faqItems.forEach(item => {
    const btn = item.querySelector('.faq-question');
    if (!btn) return;

    btn.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');

      /* Close all others */
      faqItems.forEach(other => {
        if (other !== item) {
          other.classList.remove('open');
          const otherBtn = other.querySelector('.faq-question');
          if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
        }
      });

      /* Toggle current */
      item.classList.toggle('open', !isOpen);
      btn.setAttribute('aria-expanded', !isOpen);
    });
  });

  /* ══════════════════════════════════════════════
     5. SCROLL REVEAL (Intersection Observer)
  ══════════════════════════════════════════════ */
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    revealEls.forEach(el => revealObserver.observe(el));
  } else {
    /* Fallback for old browsers */
    revealEls.forEach(el => el.classList.add('visible'));
  }

  /* ══════════════════════════════════════════════
     6. SCROLL-TO-TOP BUTTON
  ══════════════════════════════════════════════ */
  function handleScrollTop() {
    if (scrollTopBtn) {
      if (window.scrollY > 500) {
        scrollTopBtn.classList.add('visible');
      } else {
        scrollTopBtn.classList.remove('visible');
      }
    }
  }

  window.addEventListener('scroll', handleScrollTop, { passive: true });

  if (scrollTopBtn) {
    scrollTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ══════════════════════════════════════════════
     7. SMOOTH ANCHOR SCROLL (for nav links)
  ══════════════════════════════════════════════ */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const id = anchor.getAttribute('href').slice(1);
      if (!id) return;
      const target = document.getElementById(id);
      if (!target) return;

      e.preventDefault();
      closeMenu();

      const navHeight = navbar ? navbar.offsetHeight : 0;
      const targetTop = target.getBoundingClientRect().top + window.scrollY - navHeight - 16;

      window.scrollTo({ top: targetTop, behavior: 'smooth' });
    });
  });

  /* ══════════════════════════════════════════════
     8. ANIMATED STAT COUNTER (hero section)
  ══════════════════════════════════════════════ */
  function animateCounters() {
    const counters = document.querySelectorAll('.hstat strong');
    counters.forEach(counter => {
      const text = counter.textContent.trim();
      const numMatch = text.match(/\d+/);
      if (!numMatch) return;

      const target = parseInt(numMatch[0], 10);
      const prefix = text.replace(/\d+.*/, '');
      const suffix = text.replace(/.*\d+/, '');
      let current = 0;
      const step = Math.max(1, Math.floor(target / 60));
      const interval = setInterval(() => {
        current = Math.min(current + step, target);
        counter.textContent = prefix + current + suffix;
        if (current >= target) clearInterval(interval);
      }, 25);
    });
  }

  /* Trigger counter on hero visibility */
  const heroSection = document.getElementById('hero');
  if (heroSection && 'IntersectionObserver' in window) {
    const heroObserver = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setTimeout(animateCounters, 600);
          heroObserver.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    heroObserver.observe(heroSection);
  }

  /* ══════════════════════════════════════════════
     9. TRUST BAR — pause on hover
  ══════════════════════════════════════════════ */
  const trustTrack = document.querySelector('.trust-track');
  if (trustTrack) {
    trustTrack.addEventListener('mouseenter', () => {
      trustTrack.style.animationPlayState = 'paused';
    });
    trustTrack.addEventListener('mouseleave', () => {
      trustTrack.style.animationPlayState = 'running';
    });
  }

  /* ══════════════════════════════════════════════
     10. GALLERY CARD — keyboard accessibility
  ══════════════════════════════════════════════ */
  document.querySelectorAll('.gallery-card').forEach(card => {
    card.setAttribute('tabindex', '0');
    card.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        const cta = card.querySelector('.gc-cta');
        if (cta) cta.click();
      }
    });
  });

  /* ══════════════════════════════════════════════
     11. ACTIVE NAV LINK on scroll (highlight)
  ══════════════════════════════════════════════ */
  const sections = document.querySelectorAll('section[id]');
  const navLinksAll = document.querySelectorAll('.nav-link');

  function highlightNav() {
    let current = '';
    const scrollY = window.scrollY + (navbar ? navbar.offsetHeight : 0) + 80;

    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        current = section.id;
      }
    });

    navLinksAll.forEach(link => {
      const href = link.getAttribute('href').replace('#', '');
      link.style.color = href === current ? 'var(--golden-dark)' : '';
      link.style.background = href === current ? 'var(--golden-light)' : '';
    });
  }

  window.addEventListener('scroll', highlightNav, { passive: true });

  /* ══════════════════════════════════════════════
     12. WHATSAPP FLOAT — hide when form visible
  ══════════════════════════════════════════════ */
  const waFloat = document.querySelector('.whatsapp-float');
  const ctaBanner = document.getElementById('inquiry-form');

  if (waFloat && ctaBanner && 'IntersectionObserver' in window) {
    const waObserver = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          waFloat.style.transform = 'scale(0)';
          waFloat.style.opacity = '0';
        } else {
          waFloat.style.transform = '';
          waFloat.style.opacity = '';
        }
      },
      { threshold: 0.5 }
    );
    waObserver.observe(ctaBanner);
  }

  /* ══════════════════════════════════════════════
     13. GALLERY card stagger on page load
  ══════════════════════════════════════════════ */
  const galleryCards = document.querySelectorAll('.gallery-card');
  galleryCards.forEach((card, i) => {
    card.style.transitionDelay = `${i * 0.04}s`;
  });

  /* ═══════════════════ INIT ═══════════════════ */
  console.log('🎂 Cake Beauties website loaded. Premium custom cakes for every celebration.');

})();

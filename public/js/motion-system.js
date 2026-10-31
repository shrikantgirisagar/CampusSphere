// public/js/motion-system.js
// CampusSphere Motion System powered by vendored Motion 14.2.0 (window.Motion)

(function () {
  const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (isReduced) {
    console.info('[Motion] prefers-reduced-motion active: decorative motion disabled.');
    return;
  }

  function initMotion() {
    const Motion = window.Motion;
    if (!Motion) return;

    const { animate, inView, stagger } = Motion;
    const EASE_OUT = [0.22, 1, 0.36, 1];

    // 1. Hero Headline: per-word fade-in-blur rise
    const heroTitle = document.getElementById('homeHeroTitle');
    if (heroTitle && !heroTitle.dataset.animated) {
      heroTitle.dataset.animated = 'true';
      const words = heroTitle.querySelectorAll('cs-word, .brand-sphere');
      if (words.length > 0) {
        animate(
          words,
          {
            opacity: [0, 1],
            transform: ['translateY(16px)', 'translateY(0px)'],
            filter: ['blur(6px)', 'blur(0px)']
          },
          {
            duration: 0.65,
            delay: stagger(0.08),
            easing: EASE_OUT
          }
        );
      }
    }

    // 2. Section Reveals with Staggered Children
    const featureGrid = document.querySelector('.features-card-grid, .feature-grid');
    if (featureGrid) {
      inView(featureGrid, () => {
        const cards = featureGrid.querySelectorAll('.feature-card');
        animate(
          cards,
          {
            opacity: [0, 1],
            transform: ['translateY(24px)', 'translateY(0px)']
          },
          {
            duration: 0.52,
            delay: stagger(0.08),
            easing: EASE_OUT
          }
        );
      }, { margin: '-10% 0px' });
    }

    // 3. Animated Count-Ups for Stats
    const statsSection = document.getElementById('students-faculty-count') || document.querySelector('.stats-section');
    if (statsSection) {
      inView(statsSection, () => {
        const countEls = statsSection.querySelectorAll('#homeStudentCountVal, #homeFacultyCountVal, .stat-number');
        countEls.forEach((el) => {
          if (el.dataset.counted) return;
          el.dataset.counted = 'true';
          const target = parseInt(el.textContent.replace(/,/g, ''), 10);
          if (isNaN(target) || target <= 0) return;

          let start = 0;
          const duration = 1200;
          const startTime = performance.now();

          function step(now) {
            const progress = Math.min((now - startTime) / duration, 1);
            const current = Math.round(start + (target - start) * (1 - Math.pow(1 - progress, 3)));
            el.textContent = current.toLocaleString();
            if (progress < 1) {
              requestAnimationFrame(step);
            } else {
              el.textContent = target.toLocaleString();
            }
          }
          requestAnimationFrame(step);
        });
      }, { margin: '-10% 0px' });
    }

    // 4. Fine-Pointer Only: Magnetic Primary CTA & Subtle Card Tilt (Max 4 deg)
    if (window.matchMedia('(pointer: fine)').matches) {
      // Magnetic CTA
      const primaryBtns = document.querySelectorAll('.hero-primary-btn, .home-hero-actions .primary-btn');
      primaryBtns.forEach((btn) => {
        btn.addEventListener('mousemove', (e) => {
          const rect = btn.getBoundingClientRect();
          const x = e.clientX - (rect.left + rect.width / 2);
          const y = e.clientY - (rect.top + rect.height / 2);
          btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
        });
        btn.addEventListener('mouseleave', () => {
          btn.style.transform = 'translate(0px, 0px)';
          btn.style.transition = 'transform 0.28s cubic-bezier(0.22, 1, 0.36, 1)';
        });
        btn.addEventListener('mouseenter', () => {
          btn.style.transition = 'none';
        });
      });

      // Subtle Card Tilt (Max 4 deg)
      const tiltCards = document.querySelectorAll('.feature-card');
      tiltCards.forEach((card) => {
        card.addEventListener('mousemove', (e) => {
          const rect = card.getBoundingClientRect();
          const x = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
          const y = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
          const rotateX = -y * 3.5;
          const rotateY = x * 3.5;
          card.style.transform = `perspective(800px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg)`;
        });
        card.addEventListener('mouseleave', () => {
          card.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg)';
          card.style.transition = 'transform 0.28s cubic-bezier(0.22, 1, 0.36, 1)';
        });
        card.addEventListener('mouseenter', () => {
          card.style.transition = 'none';
        });
      });
    }
  }

  // SPA View Transition Helper
  window.CampusSphereTransitionView = function (updateCallback) {
    if (document.startViewTransition && !isReduced) {
      return document.startViewTransition(updateCallback);
    }
    updateCallback();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMotion);
  } else {
    initMotion();
  }
})();

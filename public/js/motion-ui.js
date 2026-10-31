// public/js/motion-ui.js
// CampusSphere Motion and Transitions (Phase 3)
// Powered by vendored Motion 14.2.0 (window.Motion)

(function () {
  'use strict';

  const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Consistent editorial easing family: cubic-bezier(0.22, 1, 0.36, 1)
  const EASE = [0.22, 1, 0.36, 1];

  function initMotion() {
    if (prefersReduced) {
      // Respect prefers-reduced-motion: reveal all immediately with no animation
      document.querySelectorAll('.reveal-item').forEach(el => {
        el.classList.add('is-revealed');
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
      document.querySelectorAll('fx-word, cs-word').forEach(el => {
        el.style.opacity = '1';
        el.style.transform = 'none';
        el.style.filter = 'none';
      });
      return;
    }

    const Motion = window.Motion;

    // 1. Hero Headline: per-word fade-in-blur rise
    // (blur 12px -> 0, opacity 0 -> 1, y 16px -> 0), staggered by 0.05s
    const heroTitle = document.getElementById('homeHeroTitle');
    if (heroTitle && !heroTitle.dataset.motionDone) {
      heroTitle.dataset.motionDone = 'true';
      const words = heroTitle.querySelectorAll('fx-word, cs-word, .brand-sphere');
      if (words.length > 0) {
        if (Motion && typeof Motion.animate === 'function') {
          Motion.animate(
            words,
            {
              opacity: [0, 1],
              transform: ['translateY(16px)', 'translateY(0px)'],
              filter: ['blur(12px)', 'blur(0px)']
            },
            {
              duration: 0.5,
              delay: typeof Motion.stagger === 'function' ? Motion.stagger(0.05) : 0.05,
              easing: EASE
            }
          );
        } else {
          // Fallback if Motion is missing
          words.forEach((w) => {
            w.style.opacity = '1';
            w.style.transform = 'none';
            w.style.filter = 'none';
          });
        }
      }
    }

    // 2. Staggered reveals for .reveal-item
    const revealItems = document.querySelectorAll('.reveal-item');
    if (revealItems.length > 0) {
      if (Motion && typeof Motion.inView === 'function') {
        const sections = document.querySelectorAll('section, .home-section, .feature-grid, .institution-header, .stats-section');
        sections.forEach((sec) => {
          const items = sec.querySelectorAll('.reveal-item');
          if (items.length > 0) {
            Motion.inView(sec, () => {
              items.forEach(it => it.classList.add('is-revealed'));
              Motion.animate(
                items,
                {
                  opacity: [0, 1],
                  transform: ['translateY(20px)', 'translateY(0px)']
                },
                {
                  duration: 0.45,
                  delay: typeof Motion.stagger === 'function' ? Motion.stagger(0.06) : 0.06,
                  easing: EASE
                }
              );
            }, { margin: '-8% 0px' });
          }
        });
      } else {
        // Fallback: standard IntersectionObserver
        const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-revealed');
              entry.target.style.opacity = '1';
              entry.target.style.transform = 'none';
              observer.unobserve(entry.target);
            }
          });
        }, { threshold: 0.1 });
        revealItems.forEach(item => observer.observe(item));
      }
    }

    // 3. Magnetic button wrapper on .hero-primary-btn
    // Intensity 0.6, bounds 12px, damped return, on (pointer: fine) devices only
    if (window.matchMedia('(pointer: fine)').matches) {
      const primaryButtons = document.querySelectorAll('.hero-primary-btn, .home-hero-actions .primary-btn');
      primaryButtons.forEach((btn) => {
        let isHovered = false;

        btn.addEventListener('mouseenter', () => {
          isHovered = true;
          btn.style.transition = 'none';
        });

        btn.addEventListener('mousemove', (e) => {
          if (!isHovered) return;
          const rect = btn.getBoundingClientRect();
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;
          const relX = (e.clientX - centerX) * 0.6;
          const relY = (e.clientY - centerY) * 0.6;

          // Clamp to strict 12px bounds
          const clampedX = Math.max(-12, Math.min(12, relX));
          const clampedY = Math.max(-12, Math.min(12, relY));

          btn.style.transform = `translate(${clampedX.toFixed(2)}px, ${clampedY.toFixed(2)}px)`;
        });

        btn.addEventListener('mouseleave', () => {
          isHovered = false;
          // Damped return
          btn.style.transition = 'transform 0.35s cubic-bezier(0.22, 1, 0.36, 1)';
          btn.style.transform = 'translate(0px, 0px)';
        });
      });

      // Subtle feature card hover tilt (<= 3 deg)
      const featureCards = document.querySelectorAll('.feature-card');
      featureCards.forEach((card) => {
        card.addEventListener('mousemove', (e) => {
          const rect = card.getBoundingClientRect();
          const x = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
          const y = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
          const rotX = -y * 2.8;
          const rotY = x * 2.8;
          card.style.transform = `perspective(800px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) translateY(-2px)`;
        });

        card.addEventListener('mouseleave', () => {
          card.style.transition = 'transform 0.3s cubic-bezier(0.22, 1, 0.36, 1)';
          card.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) translateY(0px)';
        });

        card.addEventListener('mouseenter', () => {
          card.style.transition = 'none';
        });
      });
    }

    // 4. Animated Stats Counter
    const statsSection = document.getElementById('students-faculty-count') || document.querySelector('.stats-section');
    if (statsSection) {
      const runCounter = () => {
        const counters = statsSection.querySelectorAll('#homeStudentCountVal, #homeFacultyCountVal, .stat-number');
        counters.forEach(el => {
          if (el.dataset.animatedCounter) return;
          el.dataset.animatedCounter = 'true';
          const target = parseInt(el.textContent.replace(/,/g, ''), 10);
          if (isNaN(target) || target <= 0) return;

          let start = 0;
          const duration = 1100;
          const startStamp = performance.now();

          function step(now) {
            const progress = Math.min((now - startStamp) / duration, 1);
            // Ease out cubic
            const factor = 1 - Math.pow(1 - progress, 3);
            const val = Math.round(start + (target - start) * factor);
            el.textContent = val.toLocaleString();
            if (progress < 1) {
              requestAnimationFrame(step);
            } else {
              el.textContent = target.toLocaleString();
            }
          }
          requestAnimationFrame(step);
        });
      };

      if (Motion && typeof Motion.inView === 'function') {
        Motion.inView(statsSection, runCounter, { margin: '-10% 0px' });
      } else {
        const obs = new IntersectionObserver((entries) => {
          if (entries[0] && entries[0].isIntersecting) {
            runCounter();
            obs.disconnect();
          }
        }, { threshold: 0.1 });
        obs.observe(statsSection);
      }
    }
  }

  // View Transitions API integration
  window.CampusSphereTransitionView = function (updateCallback) {
    if (document.startViewTransition && !prefersReduced) {
      return document.startViewTransition(updateCallback);
    }
    return Promise.resolve(updateCallback());
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMotion);
  } else {
    initMotion();
  }
})();

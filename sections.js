/* Progressive enhancement: the resting page is always visible. */
(() => {
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  if (preference.matches || !('IntersectionObserver' in window) || !Element.prototype.animate) return;

  const settings = new Map();
  const animations = new Map();
  const seen = new WeakSet();
  const add = (selector, step = 0, distance = 24, duration = 650) => {
    document.querySelectorAll(selector).forEach((element, index) => {
      settings.set(element, {delay: index * step, distance, duration});
      element.dataset.sectionMotion = '';
    });
  };
  add('.hero-copy > *', 65, 20);
  add('.hero-photo', 0, 12, 850);
  add('.collections .section-heading');
  add('.collection', 80);
  add('.shortlist-section .section-heading, .catalog-intro, .tools, .advanced-filters', 60, 16);
  add('.guide-intro');
  add('.guide-list > button', 80);
  add('.closing > *', 65);
  add('.footer-top, .footer-bottom', 60, 8);

  const cancel = element => {
    animations.get(element)?.cancel();
    animations.delete(element);
  };
  const markSeen = element => {
    seen.add(element);
    element.dataset.sectionRevealed = 'true';
    observer.unobserve(element);
  };
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      const element = entry.target;
      if (!entry.isIntersecting || seen.has(element)) continue;
      markSeen(element);
      if (preference.matches || element.contains(document.activeElement)) continue;
      const {delay, distance, duration} = settings.get(element);
      const animation = element.animate([
        {opacity: .85, transform: `translateY(${distance}px)`},
        {opacity: 1, transform: 'none'}
      ], {duration, delay, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'backwards'});
      animations.set(element, animation);
      animation.finished.then(() => {
        if (animations.get(element) === animation) animations.delete(element);
      }).catch(() => {});
    }
  }, {threshold: .12, rootMargin: '0px 0px -5% 0px'});

  for (const element of settings.keys()) {
    if (element.getBoundingClientRect().bottom <= 0) markSeen(element);
    else observer.observe(element);
  }
  const releaseInteraction = event => {
    for (const element of settings.keys()) {
      if (element.contains(event.target)) {
        markSeen(element);
        cancel(element);
      }
    }
  };
  document.addEventListener('focusin', releaseInteraction);
  document.addEventListener('pointerdown', releaseInteraction, {passive: true});
  const stop = () => {
    observer.disconnect();
    for (const element of settings.keys()) {
      seen.add(element);
      cancel(element);
    }
    document.removeEventListener('focusin', releaseInteraction);
    document.removeEventListener('pointerdown', releaseInteraction);
  };
  preference.addEventListener('change', () => { if (preference.matches) stop(); });
  addEventListener('pagehide', stop, {once: true});
})();

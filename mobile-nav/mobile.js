(() => {
  // Derive mobile.html path relative to this script
  const scriptUrl = document.currentScript.src;
  const mobileUrl = new URL('mobile.html', scriptUrl).href;

  fetch(mobileUrl)
    .then(response => response.text())
    .then(htmlString => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlString, 'text/html');
      const mobileNav = doc.querySelector('nav');
      const placeholder = document.getElementById('mobile-nav-placeholder');

      if (mobileNav && placeholder) {
        placeholder.innerHTML = mobileNav.outerHTML;

        // Toggle open/close menu
        const mobileMenuBtn = document.getElementById('mobile-menu-btn');
        const injectedMobileNav = placeholder.querySelector('nav');

        if (mobileMenuBtn && injectedMobileNav) {
          mobileMenuBtn.addEventListener('click', () => {
            injectedMobileNav.classList.toggle('open');
          });

          document.addEventListener('click', event => {
            const inside = injectedMobileNav.contains(event.target);
            const onBtn = mobileMenuBtn.contains(event.target);
            if (!inside && !onBtn && injectedMobileNav.classList.contains('open')) {
              injectedMobileNav.classList.remove('open');
            }
          });
        } else {
          console.error('Menu button or injected nav not found.');
        }

        // Handle dropdowns
        placeholder.querySelectorAll('.mobile-dropdown-trigger').forEach(trigger => {
          trigger.addEventListener('click', e => {
            e.preventDefault();
            const parent = trigger.closest('.dropdown');
            if (parent) parent.classList.toggle('active');
          });
        });
      } else {
        console.error('Mobile nav or placeholder not found.');
      }
    })
    .catch(error => console.error('Error loading mobile nav:', error));
})();

(() => {
  // Function to find the correct path to mobile.html by trying different depths
  async function loadMobileNavigation() {
    const possiblePaths = [
      './mobile-nav/mobile.html',        // Same level
      '../mobile-nav/mobile.html',       // One level up
      '../../mobile-nav/mobile.html',    // Two levels up
      '../../../mobile-nav/mobile.html', // Three levels up
      '../../../../mobile-nav/mobile.html' // Four levels up (just in case)
    ];
    
    for (const path of possiblePaths) {
      try {
        const response = await fetch(path);
        
        if (response.ok) {
          const htmlString = await response.text();
          const parser = new DOMParser();
          const doc = parser.parseFromString(htmlString, 'text/html');
          const mobileNav = doc.querySelector('nav');
          const placeholder = document.getElementById('mobile-nav-placeholder');
          
          if (mobileNav && placeholder) {
            placeholder.innerHTML = mobileNav.outerHTML;
            
            // Calculate the correct base path for links
            const basePath = path.replace('mobile-nav/mobile.html', '');
            
            // Fix all relative links
            placeholder.querySelectorAll("a").forEach(link => {
              const href = link.getAttribute("href");
              if (href && href.startsWith("../")) {
                const newHref = href.replace("../", basePath);
                link.setAttribute("href", newHref);
              }
            });
            
            // Fix image paths
            placeholder.querySelectorAll("img").forEach(img => {
              const src = img.getAttribute("src");
              if (src && src.startsWith("../")) {
                const newSrc = src.replace("../", basePath);
                img.setAttribute("src", newSrc);
              }
            });
            
            // Setup mobile navigation functionality
            setupMobileNavigation(placeholder);
            
            return; // Success! Exit the function
          }
        }
      } catch (error) {
        // Suppressed error logging
      }
    }
    
    // If we get here, none of the paths worked
    const placeholder = document.getElementById('mobile-nav-placeholder');
    if (placeholder) {
      placeholder.innerHTML = '<p style="color: red;">Mobile navigation could not be loaded</p>';
    }
  }
  
  // Function to setup mobile navigation functionality
  function setupMobileNavigation(placeholder) {
    // Toggle open/close menu
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const injectedMobileNav = placeholder.querySelector('nav');
    
    if (mobileMenuBtn && injectedMobileNav) {
      // Remove any existing event listeners by cloning the button
      const newMobileMenuBtn = mobileMenuBtn.cloneNode(true);
      mobileMenuBtn.parentNode.replaceChild(newMobileMenuBtn, mobileMenuBtn);
      
      newMobileMenuBtn.addEventListener('click', () => {
        injectedMobileNav.classList.toggle('open');
      });
      
      // Close menu when clicking outside
      document.addEventListener('click', event => {
        const inside = injectedMobileNav.contains(event.target);
        const onBtn = newMobileMenuBtn.contains(event.target);
        if (!inside && !onBtn && injectedMobileNav.classList.contains('open')) {
          injectedMobileNav.classList.remove('open');
        }
      });
    }
    
    // Handle dropdowns
    placeholder.querySelectorAll('.mobile-dropdown-trigger').forEach(trigger => {
      trigger.addEventListener('click', e => {
        e.preventDefault();
        const parent = trigger.closest('.dropdown');
        if (parent) {
          parent.classList.toggle('active');
        }
      });
    });
  }
  
  // Check if the placeholder exists before trying to load
  if (document.getElementById('mobile-nav-placeholder')) {
    loadMobileNavigation();
  }
})();

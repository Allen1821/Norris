fetch("/mobile-nav/mobile.html")
  .then(response => response.text())
  .then(htmlString => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, "text/html");
    const mobileNav = doc.querySelector("nav");
    const placeholder = document.getElementById("mobile-nav-placeholder");
    
    if (mobileNav && placeholder) {
      placeholder.innerHTML = mobileNav.outerHTML;
      
      // Attach mobile menu button toggle (if needed)
      const mobileMenuBtn = document.getElementById("mobile-menu-btn");
      const injectedMobileNav = document.querySelector(".mobile-nav");
      if (mobileMenuBtn && injectedMobileNav) {
        mobileMenuBtn.addEventListener("click", () => {
          injectedMobileNav.classList.toggle("open");
        });
      } else {
        console.error("Mobile menu button or navigation element not found.");
      }
      
      // Now attach event listeners to the dropdown triggers
      const dropdownTriggers = document.querySelectorAll(".mobile-nav .mobile-dropdown-trigger");
      dropdownTriggers.forEach(trigger => {
        trigger.addEventListener("click", (e) => {
          e.preventDefault();
          // Toggle the 'active' class on the closest dropdown container
          const parentDropdown = trigger.closest(".dropdown");
          if (parentDropdown) {
            parentDropdown.classList.toggle("active");
          }
        });
      });
      
    } else {
      console.error("Mobile nav or placeholder element not found.");
    }
  })
  .catch(error => console.error("Error loading mobile navigation:", error));

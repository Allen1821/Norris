(() => {
    const path = window.location.pathname;
    const isRoot = path === "/" || path.endsWith("/index.html");
    const pathPrefix = isRoot ? "" : "../";
  
    fetch(`${pathPrefix}mobile-nav/mobile.html`)
      .then(response => response.text())
      .then(htmlString => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlString, "text/html");
        const mobileNav = doc.querySelector("nav");
        const placeholder = document.getElementById("mobile-nav-placeholder");
  
        if (mobileNav && placeholder) {
          placeholder.innerHTML = mobileNav.outerHTML;
  
          //  Fix relative links on root page
          if (pathPrefix === "") {
            document.querySelectorAll("#mobile-nav-placeholder a").forEach(link => {
              const href = link.getAttribute("href");
              if (href && href.startsWith("../")) {
                link.setAttribute("href", href.replace("../", ""));
              }
            });
  
            document.querySelectorAll("#mobile-nav-placeholder img").forEach(img => {
              const src = img.getAttribute("src");
              if (src && src.startsWith("../")) {
                img.setAttribute("src", src.replace("../", ""));
              }
            });
          }
  
          const mobileMenuBtn = document.getElementById("mobile-menu-btn");
          const injectedMobileNav = document.querySelector(".mobile-nav");
  
          if (mobileMenuBtn && injectedMobileNav) {
            // Toggle open/close
            mobileMenuBtn.addEventListener("click", () => {
              injectedMobileNav.classList.toggle("open");
            });
  
            // Click outside to close
            document.addEventListener("click", (event) => {
              const isClickInsideMenu = injectedMobileNav.contains(event.target);
              const isClickOnButton = mobileMenuBtn.contains(event.target);
  
              if (!isClickInsideMenu && !isClickOnButton && injectedMobileNav.classList.contains("open")) {
                injectedMobileNav.classList.remove("open");
              }
            });
          } else {
            console.error("Mobile menu button or navigation element not found.");
          }
  
          // 🔽 Handle dropdowns
          const dropdownTriggers = document.querySelectorAll(".mobile-nav .mobile-dropdown-trigger");
          dropdownTriggers.forEach(trigger => {
            trigger.addEventListener("click", (e) => {
              e.preventDefault();
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
  })();
  
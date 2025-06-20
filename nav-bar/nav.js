(() => {
  // Function to find the correct path to nav.html by trying different depths
  async function loadNavigation() {
    const possiblePaths = [
      './nav-bar/nav.html',        // Same level
      '../nav-bar/nav.html',       // One level up
      '../../nav-bar/nav.html',    // Two levels up
      '../../../nav-bar/nav.html', // Three levels up
      '../../../../nav-bar/nav.html' // Four levels up (just in case)
    ];
    
    for (const path of possiblePaths) {
      try {
        const response = await fetch(path);
        
        if (response.ok) {
          const htmlString = await response.text();
          const nav = new DOMParser()
            .parseFromString(htmlString, "text/html")
            .querySelector("nav");
          
          if (nav) {
            document.getElementById("nav-placeholder").innerHTML = nav.outerHTML;
            
            // Calculate the correct base path for links
            const basePath = path.replace('nav-bar/nav.html', '');
            
            // Fix all relative links
            document.querySelectorAll("#nav-placeholder a").forEach(link => {
              const href = link.getAttribute("href");
              if (href && href.startsWith("../")) {
                const newHref = href.replace("../", basePath);
                link.setAttribute("href", newHref);
              }
            });
            
            // Fix image paths
            document.querySelectorAll("#nav-placeholder img").forEach(img => {
              const src = img.getAttribute("src");
              if (src && src.startsWith("../")) {
                const newSrc = src.replace("../", basePath);
                img.setAttribute("src", newSrc);
              }
            });
            
            return; // Success! Exit the function
          }
        }
      } catch (error) {
        // Suppressed error log
      }
    }
    
    // If we get here, none of the paths worked
    document.getElementById("nav-placeholder").innerHTML = 
      '<p style="color: red;">Navigation could not be loaded</p>';
  }
  
  // Check if the placeholder exists before trying to load
  if (document.getElementById("nav-placeholder")) {
    loadNavigation();
  }
})();

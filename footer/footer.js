(() => {
  // Function to find the correct path to footer.html by trying different depths
  async function loadFooter() {
    const possiblePaths = [
      './footer/footer.html',        // Same level
      '../footer/footer.html',       // One level up
      '../../footer/footer.html',    // Two levels up
      '../../../footer/footer.html', // Three levels up
      '../../../../footer/footer.html' // Four levels up (just in case)
    ];
    
    for (const path of possiblePaths) {
      try {
        const response = await fetch(path);
        
        if (response.ok) {
          const htmlString = await response.text();
          const footer = new DOMParser()
            .parseFromString(htmlString, "text/html")
            .querySelector("footer");
          
          if (footer) {
            document.getElementById("footer-placeholder").innerHTML = footer.outerHTML;
            
            // Calculate the correct base path for links
            const basePath = path.replace('footer/footer.html', '');
            
            // Fix all relative links
            document.querySelectorAll("#footer-placeholder a").forEach(link => {
              const href = link.getAttribute("href");
              if (href && href.startsWith("../")) {
                const newHref = href.replace("../", basePath);
                link.setAttribute("href", newHref);
              }
            });
            
            // Fix image paths
            document.querySelectorAll("#footer-placeholder img").forEach(img => {
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
    document.getElementById("footer-placeholder").innerHTML = 
      '<p style="color: red;">Footer could not be loaded</p>';
  }
  
  // Check if the placeholder exists before trying to load
  if (document.getElementById("footer-placeholder")) {
    loadFooter();
  }
})();
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
    
    for (let i = 0; i < possiblePaths.length; i++) {
      const path = possiblePaths[i];
      try {
        const response = await fetch(path);
        
        if (response.ok) {
          const htmlString = await response.text();
          const footer = new DOMParser()
            .parseFromString(htmlString, 'text/html')
            .querySelector('footer');
          
          if (footer) {
            document.getElementById('footer-placeholder').innerHTML = footer.outerHTML;
            
            // Calculate the depth level based on which path worked
            const depthLevel = i; // 0 = same level, 1 = one up, 2 = two up, etc.
            
            // Fix all relative links in footer
            document.querySelectorAll("#footer-placeholder a").forEach(link => {
              const href = link.getAttribute("href");
              if (href && href.startsWith("../")) {
                const originalLevels = (href.match(/\.\.\//g) || []).length;
                const cleanPath = href.replace(/^(\.\.\/)+/, '');
                const neededLevels = originalLevels - depthLevel;
                const newHref = neededLevels > 0
                  ? '../'.repeat(neededLevels) + cleanPath
                  : cleanPath;
                link.setAttribute("href", newHref);
              }
            });
            
            // Fix image paths in footer
            document.querySelectorAll("#footer-placeholder img").forEach(img => {
              const src = img.getAttribute("src");
              if (src && src.startsWith("../")) {
                const originalLevels = (src.match(/\.\.\//g) || []).length;
                const cleanPath = src.replace(/^(\.\.\/)+/, '');
                const neededLevels = originalLevels - depthLevel;
                const newSrc = neededLevels > 0
                  ? '../'.repeat(neededLevels) + cleanPath
                  : cleanPath;
                img.setAttribute("src", newSrc);
              }
            });
            
            return; // Success! Exit the function
          }
        }
      } catch (error) {
        // Suppressed error logging
      }
    }
    
    // If we get here, none of the paths worked
    const placeholder = document.getElementById('footer-placeholder');
    if (placeholder) {
      placeholder.innerHTML = '<p style="color: red;">Footer could not be loaded</p>';
    }
  }
  
  // Check if the placeholder exists before trying to load
  if (document.getElementById('footer-placeholder')) {
    loadFooter();
  }
})();

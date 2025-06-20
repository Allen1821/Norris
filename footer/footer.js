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
        console.log('Trying to load footer from:', path);
        const response = await fetch(path);
        
        if (response.ok) {
          const htmlString = await response.text();
          const footer = new DOMParser()
            .parseFromString(htmlString, 'text/html')
            .querySelector('footer');
          
          if (footer) {
            console.log('Successfully loaded footer from:', path);
            document.getElementById('footer-placeholder').innerHTML = footer.outerHTML;
            
            // Calculate the correct base path for links
            const basePath = path.replace('nav-bar/footer.html', '');
            
            // Fix all relative links in footer
            document.querySelectorAll("#footer-placeholder a").forEach(link => {
              const href = link.getAttribute("href");
              if (href && href.startsWith("../")) {
                const newHref = href.replace("../", basePath);
                link.setAttribute("href", newHref);
              }
            });
            
            // Fix image paths in footer
            document.querySelectorAll("#footer-placeholder img").forEach(img => {
              const src = img.getAttribute("src");
              if (src && src.startsWith("../")) {
                const newSrc = src.replace("../", basePath);
                img.setAttribute("src", newSrc);
              }
            });
            
            console.log('Footer links and images updated successfully');
            return; // Success! Exit the function
          }
        }
      } catch (error) {
        console.log('Failed to load footer from:', path);
      }
    }
    
    // If we get here, none of the paths worked
    console.error('Could not load footer from any path');
    const placeholder = document.getElementById('footer-placeholder');
    if (placeholder) {
      placeholder.innerHTML = '<p style="color: red;">Footer could not be loaded</p>';
    }
  }
  
  // Check if the placeholder exists before trying to load
  if (document.getElementById('footer-placeholder')) {
    loadFooter();
  } else {
    console.error('footer-placeholder element not found in the page');
  }
})();
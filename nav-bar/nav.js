(() => {
  // Derive nav.html path relative to this script
  const scriptUrl = document.currentScript.src;
  const navUrl = new URL('nav.html', scriptUrl).href;

  fetch(navUrl)
    .then(response => response.text())
    .then(htmlString => {
      const nav = new DOMParser()
        .parseFromString(htmlString, 'text/html')
        .querySelector('nav');

      if (nav) {
        document.getElementById('nav-placeholder').innerHTML = nav.outerHTML;
      } else {
        console.error('Navigation element not found in fetched HTML.');
      }
    })
    .catch(error => console.error('Error loading navigation:', error));
})();

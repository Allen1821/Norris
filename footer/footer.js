(() => {
  // Derive footer.html path relative to this script
  const scriptUrl = document.currentScript.src;
  const footerUrl = new URL('footer.html', scriptUrl).href;

  fetch(footerUrl)
    .then(response => response.text())
    .then(htmlString => {
      const footer = new DOMParser()
        .parseFromString(htmlString, 'text/html')
        .querySelector('footer');

      if (footer) {
        document.getElementById('footer-placeholder').innerHTML = footer.outerHTML;
      } else {
        console.error('Footer element not found in fetched HTML.');
      }
    })
    .catch(error => console.error('Error loading footer:', error));
})();

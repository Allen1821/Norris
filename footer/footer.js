const pathPrefix = (window.location.pathname === "/" || window.location.pathname.endsWith("index.html"))
  ? ""
  : "../";

fetch(`${pathPrefix}footer/footer.html`)
  .then(response => response.text())
  .then(htmlString => {
    const footer = new DOMParser()
      .parseFromString(htmlString, "text/html")
      .querySelector("footer");
    if (footer) {
      document.getElementById("footer-placeholder").innerHTML = footer.outerHTML;
    } else {
      console.error("Footer element not found in the fetched HTML.");
    }
  })
  .catch(error => console.error("Error loading footer:", error));

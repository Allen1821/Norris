(() => {
    const path = window.location.pathname;
    const isRoot = path === "/" || path.endsWith("/index.html");
    const pathPrefix = isRoot ? "" : "../";
  
    fetch(`${pathPrefix}footer/footer.html`)
      .then(response => response.text())
      .then(htmlString => {
        const footer = new DOMParser()
          .parseFromString(htmlString, "text/html")
          .querySelector("footer");
  
        if (footer) {
          document.getElementById("footer-placeholder").innerHTML = footer.outerHTML;
  
          if (pathPrefix === "") {
            document.querySelectorAll("#footer-placeholder a").forEach(link => {
              const href = link.getAttribute("href");
              if (href && href.startsWith("../")) {
                link.setAttribute("href", href.replace("../", ""));
              }
            });
  
            document.querySelectorAll("#footer-placeholder img").forEach(img => {
              const src = img.getAttribute("src");
              if (src && src.startsWith("../")) {
                img.setAttribute("src", src.replace("../", ""));
              }
            });
          }
        } else {
          console.error("Footer element not found in the fetched HTML.");
        }
      })
      .catch(error => console.error("Error loading footer:", error));
  })();
  
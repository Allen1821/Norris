(() => {
    const path = window.location.pathname;
    const isRoot = path === "/" || path.endsWith("/index.html");
    const pathPrefix = isRoot ? "" : "../";
  
    fetch(`${pathPrefix}nav-bar/nav.html`)
      .then(response => response.text())
      .then(htmlString => {
        const nav = new DOMParser()
          .parseFromString(htmlString, "text/html")
          .querySelector("nav");
  
        if (nav) {
          document.getElementById("nav-placeholder").innerHTML = nav.outerHTML;
  
          // ✅ Fix relative links on index.html
          if (pathPrefix === "") {
            document.querySelectorAll("#nav-placeholder a").forEach(link => {
              const href = link.getAttribute("href");
              if (href && href.startsWith("../")) {
                link.setAttribute("href", href.replace("../", ""));
              }
            });
  
            // ✅ Fix image paths inside nav (if any)
            document.querySelectorAll("#nav-placeholder img").forEach(img => {
              const src = img.getAttribute("src");
              if (src && src.startsWith("../")) {
                img.setAttribute("src", src.replace("../", ""));
              }
            });
          }
        } else {
          console.error("Navigation element not found in fetched HTML.");
        }
      })
      .catch(error => console.error("Error loading navigation:", error));
  })();
  
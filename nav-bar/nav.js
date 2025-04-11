fetch("/nav-bar/nav.html")
  .then(response => response.text())
  .then(htmlString => {
    const nav = new DOMParser()
      .parseFromString(htmlString, "text/html")
      .querySelector("nav");
    document.getElementById("nav-placeholder").innerHTML = nav.outerHTML;
  });

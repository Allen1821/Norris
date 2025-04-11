fetch("../footer/footer.html")
  .then(response => response.text())
  .then(htmlString => {
    const footer = new DOMParser()
      .parseFromString(htmlString, "text/html")
      .querySelector("footer");
    document.getElementById("footer-placeholder").innerHTML = footer.outerHTML;
  });

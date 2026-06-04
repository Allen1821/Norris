document.addEventListener("DOMContentLoaded", () => {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.18 });

  document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));

  const zoomImages = document.querySelectorAll(".story-media img, .showcase-primary img, .showcase-feature img");

  if (!zoomImages.length) {
    return;
  }

  const viewer = document.createElement("div");
  viewer.className = "metal-image-viewer";
  viewer.setAttribute("role", "dialog");
  viewer.setAttribute("aria-modal", "true");
  viewer.setAttribute("aria-hidden", "true");
  viewer.hidden = true;
  viewer.innerHTML = `
    <button type="button" class="metal-image-viewer-close" aria-label="Close enlarged image">
      <i class="fas fa-times" aria-hidden="true"></i>
    </button>
    <figure class="metal-image-viewer-frame">
      <img src="" alt="">
      <figcaption></figcaption>
    </figure>
  `;
  document.body.appendChild(viewer);

  const viewerImage = viewer.querySelector("img");
  const viewerCaption = viewer.querySelector("figcaption");
  const closeButton = viewer.querySelector(".metal-image-viewer-close");

  function openViewer(image) {
    viewerImage.src = image.currentSrc || image.src;
    viewerImage.alt = image.alt || "";
    viewerCaption.textContent = image.alt || "";
    viewer.hidden = false;
    viewer.setAttribute("aria-hidden", "false");
    viewer.classList.add("is-open");
    document.body.classList.add("metal-image-viewer-open");

    requestAnimationFrame(() => {
      closeButton.focus();
    });
  }

  function closeViewer() {
    viewer.classList.remove("is-open");
    viewer.setAttribute("aria-hidden", "true");
    document.body.classList.remove("metal-image-viewer-open");

    window.setTimeout(() => {
      viewer.hidden = true;
      viewerImage.src = "";
      viewerCaption.textContent = "";
    }, 180);
  }

  zoomImages.forEach((image) => {
    const zoomTarget = image.closest(".story-media, .showcase-primary, .showcase-feature");

    if (!zoomTarget) {
      return;
    }

    zoomTarget.classList.add("is-zoomable");
    zoomTarget.setAttribute("tabindex", "0");
    zoomTarget.setAttribute("role", "button");
    zoomTarget.setAttribute("aria-label", `Enlarge image: ${image.alt || "facility image"}`);

    zoomTarget.addEventListener("click", () => openViewer(image));
    zoomTarget.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openViewer(image);
      }
    });
  });

  closeButton.addEventListener("click", closeViewer);

  viewer.addEventListener("click", (event) => {
    if (event.target === viewer) {
      closeViewer();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !viewer.hidden) {
      closeViewer();
    }
  });
});

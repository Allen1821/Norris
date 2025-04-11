// Enhanced JavaScript for Norris Precision Manufacturing
(function() {
  /* ============================================================
     Header Scroll Effect
  ============================================================ */
  function handleHeaderScroll() {
    const header = document.querySelector('header');
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }
  window.addEventListener('scroll', handleHeaderScroll);



  /* ============================================================
     Smooth Scrolling for Anchor Links
  ============================================================ */
  function setupSmoothScrolling() {
    const anchors = document.querySelectorAll('a[href^="#"]');
    anchors.forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          const headerHeight = document.querySelector('header').offsetHeight;
          const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;
          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
        }
      });
    });
  }

  /* ============================================================
     Handle Page Load with Hash in URL
  ============================================================ */
  function handleHashOnLoad() {
    if (window.location.hash) {
      setTimeout(() => {
        const headerHeight = document.querySelector('header').offsetHeight;
        const targetElement = document.querySelector(window.location.hash);
        if (targetElement) {
          const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;
          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
        }
      }, 100);
    }
  }

  /* ============================================================
     Gallery Image Viewer Functionality
  ============================================================ */
  let images = [];
  let imgUrl;
  let fullSizeImageOpen = false;

  function changeArrows() {
    const currentIndex = images.findIndex(item => item === imgUrl);
    const arrows = document.getElementsByClassName('arrow');

    if (currentIndex === 0) {
      arrows[0].classList.add('disabled');
      arrows[2].classList.add('disabled');
    } else if (currentIndex === images.length - 1) {
      arrows[1].classList.add('disabled');
      arrows[3].classList.add('disabled');
    } else {
      Array.from(arrows).forEach(arrow => arrow.classList.remove('disabled'));
    }
  }

  function showFullSizeImage(event) {
    imgUrl = event.target.src.replace('_thumbnail', '');
    const fullSizeImage = document.getElementById('fullSizeImage');
    const imageContainer = document.querySelector('.image-container');

    fullSizeImage.src = imgUrl;
    fullSizeImage.alt = event.target.alt;

    // Display and animate the image container
    imageContainer.style.display = 'flex';
    setTimeout(() => {
      imageContainer.classList.add('active');
    }, 10);

    // Adjust layout for mobile devices
    if (window.innerWidth <= 768) {
      imageContainer.style.flexDirection = 'column';
    }

    document.body.classList.add('stop-scroll');

    // Collect all gallery images
    images = Array.from(document.getElementsByClassName('galleryImg'))
      .map(item => item.currentSrc.replace('_thumbnail', ''));

    fullSizeImageOpen = true;
    changeArrows();

    // Add loading indication
    fullSizeImage.classList.add('loading');
    fullSizeImage.onload = () => {
      fullSizeImage.classList.remove('loading');
    };
  }

  function hideFullSizeImage() {
    const imageContainer = document.querySelector('.image-container');
    imageContainer.classList.remove('active');

    // Wait for transition to complete
    setTimeout(() => {
      imageContainer.style.display = 'none';
      document.body.classList.remove('stop-scroll');
    }, 300);

    fullSizeImageOpen = false;
  }

  function prevImg(event) {
    if (event) event.stopPropagation();
    const currentIndex = images.findIndex(item => item === imgUrl);
    if (currentIndex > 0) {
      const prevImgUrl = images[currentIndex - 1];
      imgUrl = prevImgUrl;

      const fullSizeImage = document.getElementById('fullSizeImage');
      fullSizeImage.classList.add('loading');
      fullSizeImage.src = prevImgUrl;
      fullSizeImage.onload = () => {
        fullSizeImage.classList.remove('loading');
      };

      changeArrows();
    }
  }

  function nextImg(event) {
    if (event) event.stopPropagation();
    const currentIndex = images.findIndex(item => item === imgUrl);
    if (currentIndex < images.length - 1) {
      const nextImgUrl = images[currentIndex + 1];
      imgUrl = nextImgUrl;

      const fullSizeImage = document.getElementById('fullSizeImage');
      fullSizeImage.classList.add('loading');
      fullSizeImage.src = nextImgUrl;
      fullSizeImage.onload = () => {
        fullSizeImage.classList.remove('loading');
      };

      changeArrows();
    }
  }

  // Keyboard navigation for gallery
  document.addEventListener('keyup', (event) => {
    if (fullSizeImageOpen) {
      if (event.key === "ArrowLeft") {
        prevImg();
      }
      if (event.key === "ArrowRight") {
        nextImg();
      }
      if (event.key === "Escape") {
        hideFullSizeImage();
      }
    }
  });

  /* ============================================================
     Scroll Animation on Elements
  ============================================================ */
  function animateOnScroll() {
    const elements = document.querySelectorAll('.img-row-item, .vid-section, .section-title');

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animated');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });

    elements.forEach(element => {
      observer.observe(element);
    });
  }

  /* ============================================================
     Initialization on DOMContentLoaded
  ============================================================ */
  document.addEventListener('DOMContentLoaded', function() {
    setupSmoothScrolling();
    handleHashOnLoad();
    animateOnScroll();
  });

  /* ============================================================
     Expose Gallery Functions (if needed globally)
     You might attach these to window if required.
  ============================================================ */
  window.showFullSizeImage = showFullSizeImage;
  window.hideFullSizeImage = hideFullSizeImage;
  window.prevImg = prevImg;
  window.nextImg = nextImg;

})();

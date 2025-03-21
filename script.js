// Enhanced JavaScript for Norris Precision Manufacturing

// Mobile navigation handling
const showSidenav = () => {
  document.getElementById('sidenav').style.display = 'flex';
  document.getElementById('sidenav').classList.add('active');
  document.getElementsByTagName('body')[0].classList.add('stop-scroll');

  const sidenavBg = document.getElementsByClassName('sidenav-bg')[0];
  sidenavBg.style.display = 'block';
  // Use setTimeout to ensure the transition works
  setTimeout(() => {
    sidenavBg.classList.add('active');
  }, 10);
};

const closeSidenav = () => {
  const sidenav = document.getElementById('sidenav');
  const sidenavBg = document.getElementsByClassName('sidenav-bg')[0];

  sidenavBg.classList.remove('active');
  sidenav.classList.remove('active');

  // Wait for transitions to complete before hiding elements
  setTimeout(() => {
    sidenav.style.display = 'none';
    sidenavBg.style.display = 'none';
    document.getElementsByTagName('body')[0].classList.remove('stop-scroll');
  }, 300);
};

// Gallery image viewer functionality
let images = [];
let imgUrl;
let fullSizeImageOpen = false;

// Update navigation arrows based on current image position
const changeArrows = () => {
  const currentIndex = images.findIndex(item => item === imgUrl);
  const arrows = document.getElementsByClassName('arrow');

  if (currentIndex === 0) {
    arrows[0].classList.add('disabled');
    arrows[2].classList.add('disabled');
  } else if (currentIndex === images.length - 1) {
    arrows[1].classList.add('disabled');
    arrows[3].classList.add('disabled');
  } else {
    // Enable all arrows
    for (let i = 0; i < arrows.length; i++) {
      arrows[i].classList.remove('disabled');
    }
  }
};

// Show full-size image viewer
const showFullSizeImage = (event) => {
  imgUrl = event.target.src.replace('_thumbnail', '');
  const fullSizeImage = document.getElementById('fullSizeImage');
  const imageContainer = document.getElementsByClassName('image-container')[0];

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

  document.getElementsByTagName('body')[0].classList.add('stop-scroll');

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
};

// Hide full-size image viewer
const hideFullSizeImage = () => {
  const imageContainer = document.getElementsByClassName('image-container')[0];
  imageContainer.classList.remove('active');

  // Wait for transition to complete
  setTimeout(() => {
    imageContainer.style.display = 'none';
    document.getElementsByTagName('body')[0].classList.remove('stop-scroll');
  }, 300);

  fullSizeImageOpen = false;
};

// Navigate to previous image
const prevImg = (event) => {
  if (event) event.stopPropagation();

  const currentIndex = images.findIndex(item => item === imgUrl);
  if (currentIndex > 0) {
    const prevImg = images[currentIndex - 1];
    imgUrl = prevImg;

    const fullSizeImage = document.getElementById('fullSizeImage');
    fullSizeImage.classList.add('loading');
    fullSizeImage.src = prevImg;

    fullSizeImage.onload = () => {
      fullSizeImage.classList.remove('loading');
    };

    changeArrows();
  }
};

// Navigate to next image
const nextImg = (event) => {
  if (event) event.stopPropagation();

  const currentIndex = images.findIndex(item => item === imgUrl);
  if (currentIndex < images.length - 1) {
    const nextImg = images[currentIndex + 1];
    imgUrl = nextImg;

    const fullSizeImage = document.getElementById('fullSizeImage');
    fullSizeImage.classList.add('loading');
    fullSizeImage.src = nextImg;

    fullSizeImage.onload = () => {
      fullSizeImage.classList.remove('loading');
    };

    changeArrows();
  }
};

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

// Smooth scrolling for anchor links with header offset
document.addEventListener('DOMContentLoaded', () => {
  const anchors = document.querySelectorAll('a[href^="#"]');
  anchors.forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();

      const targetId = this.getAttribute('href');
      if (targetId === '#') return;

      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        const headerHeight = document.getElementsByTagName('header')[0].offsetHeight;
        const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;

        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
});

// Handle page load with hash in URL
window.onload = function () {
  if (window.location.hash) {
    setTimeout(() => {
      const headerHeight = document.getElementsByTagName('header')[0].offsetHeight;
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

  // Initialize animations for elements
  animateOnScroll();
};

// Add scroll animation for elements
const animateOnScroll = () => {
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
};

// Add header shrink effect on scroll
window.addEventListener('scroll', () => {
  const header = document.getElementsByTagName('header')[0];
  if (window.scrollY > 50) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
});

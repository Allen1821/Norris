let images = [];
let imgUrl;
let fullSizeImageOpen = false;
let isMobile = window.innerWidth <= 768;

// Check for mobile device on resize
window.addEventListener('resize', function() {
  isMobile = window.innerWidth <= 768;
  if (fullSizeImageOpen) {
    adjustFullSizeImageForDevice();
  }
});

// Show full size image when a product image is clicked
function showFullSizeImage(event) {
  event.stopPropagation();
  const clickedImg = event.target;
  
  // Get the high-resolution URL from data-hires; fallback to thumbnail src if not provided
  const highResUrl = clickedImg.getAttribute('data-hires') || clickedImg.src;
  imgUrl = highResUrl;
  
  const fullSizeImage = document.getElementById('fullSizeImage');
  fullSizeImage.src = imgUrl;
  fullSizeImage.classList.remove('enlarged');
  
  const imageContainer = document.querySelector('.image-container');
  imageContainer.style.display = 'flex';
  
  document.body.classList.add('stop-scroll');
  
  // Build the images array for navigation
  images = Array.from(document.querySelectorAll('.galleryImg')).map(item =>
    item.getAttribute('data-hires') || item.src
  );
  
  fullSizeImageOpen = true;
  adjustFullSizeImageForDevice();
  changeArrows();
}

// Adjust the full size image and controls based on device type
function adjustFullSizeImageForDevice() {
  const imageWrapper = document.querySelector('.image-wrapper');
  const leftArrow = document.querySelector('.left-arrow');
  const rightArrow = document.querySelector('.right-arrow');
  const closeBtn = document.querySelector('.close-btn');
  
  if (isMobile) {
    // Mobile-specific adjustments
    imageWrapper.style.width = '95%';
    imageWrapper.style.height = '70%';
    
    // Reposition arrows for better touch access
    leftArrow.style.left = '5px';
    leftArrow.style.width = '40px';
    leftArrow.style.height = '40px';
    leftArrow.style.fontSize = '20px';
    
    rightArrow.style.right = '5px';
    rightArrow.style.width = '40px';
    rightArrow.style.height = '40px';
    rightArrow.style.fontSize = '20px';
    
    // Position close button for better touch access
    closeBtn.style.top = '10px';
    closeBtn.style.right = '10px';
    closeBtn.style.fontSize = '36px';
    closeBtn.style.padding = '10px';
  } else {
    // Desktop layout
    imageWrapper.style.width = '90%';
    imageWrapper.style.height = '90%';
    
    leftArrow.style.left = '20px';
    leftArrow.style.width = '50px';
    leftArrow.style.height = '50px';
    leftArrow.style.fontSize = '24px';
    
    rightArrow.style.right = '20px';
    rightArrow.style.width = '50px';
    rightArrow.style.height = '50px';
    rightArrow.style.fontSize = '24px';
    
    closeBtn.style.top = '20px';
    closeBtn.style.right = '30px';
    closeBtn.style.fontSize = '40px';
    closeBtn.style.padding = '0';
  }
}

// Toggle image size when clicking on the image itself
function toggleImageSize(event) {
  event.stopPropagation();
  const fullSizeImage = document.getElementById('fullSizeImage');
  fullSizeImage.classList.toggle('enlarged');
}

// Hide the full size image viewer
function hideFullSizeImage(event) {
  if (event) event.stopPropagation();
  document.querySelector('.image-container').style.display = 'none';
  document.body.classList.remove('stop-scroll');
  fullSizeImageOpen = false;
}

// Navigate to the previous image
function prevImg(event) {
  event.stopPropagation();
  const currentIndex = images.findIndex(item => item === imgUrl);
  if (currentIndex > 0) {
    imgUrl = images[currentIndex - 1];
    document.getElementById('fullSizeImage').src = imgUrl;
    changeArrows();
  }
}

// Navigate to the next image
function nextImg(event) {
  event.stopPropagation();
  const currentIndex = images.findIndex(item => item === imgUrl);
  if (currentIndex < images.length - 1) {
    imgUrl = images[currentIndex + 1];
    document.getElementById('fullSizeImage').src = imgUrl;
    changeArrows();
  }
}

// Update the state of navigation arrows based on the current image
function changeArrows() {
  const currentIndex = images.findIndex(item => item === imgUrl);
  const leftArrow = document.querySelector('.left-arrow');
  const rightArrow = document.querySelector('.right-arrow');
  
  if (currentIndex === 0) {
    leftArrow.classList.add('disabled');
  } else {
    leftArrow.classList.remove('disabled');
  }
  
  if (currentIndex === images.length - 1) {
    rightArrow.classList.add('disabled');
  } else {
    rightArrow.classList.remove('disabled');
  }
  
  // Update image counter if it exists
  const imageCounter = document.getElementById('imageCounter');
  if (imageCounter) {
    imageCounter.textContent = `${currentIndex + 1} / ${images.length}`;
  }
}

// Add swipe gesture support for mobile
let touchStartX = 0;
let touchEndX = 0;

function handleTouchStart(event) {
  touchStartX = event.touches[0].clientX;
}

function handleTouchMove(event) {
  touchEndX = event.touches[0].clientX;
}

function handleTouchEnd() {
  if (!fullSizeImageOpen) return;
  
  const swipeThreshold = 75; // Minimum distance for a swipe
  const swipeDistance = touchEndX - touchStartX;
  
  if (swipeDistance > swipeThreshold) {
    // Swipe right - show previous image
    prevImg(new Event('swipe'));
  } else if (swipeDistance < -swipeThreshold) {
    // Swipe left - show next image
    nextImg(new Event('swipe'));
  }
  
  // Reset values
  touchStartX = 0;
  touchEndX = 0;
}

// Keyboard navigation for the image viewer
document.addEventListener('keyup', function(e) {
  if (fullSizeImageOpen) {
    if (e.key === "Escape") {
      hideFullSizeImage();
    } else if (e.key === "ArrowLeft") {
      prevImg(e);
    } else if (e.key === "ArrowRight") {
      nextImg(e);
    }
  }
});

// Initialize gallery and event listeners when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Create image counter element
  const imageWrapper = document.querySelector('.image-wrapper');
  const imageCounter = document.createElement('div');
  imageCounter.id = 'imageCounter';
  imageCounter.style.position = 'absolute';
  imageCounter.style.bottom = '15px';
  imageCounter.style.left = '50%';
  imageCounter.style.transform = 'translateX(-50%)';
  imageCounter.style.color = 'white';
  imageCounter.style.background = 'rgba(0, 0, 0, 0.5)';
  imageCounter.style.padding = '5px 10px';
  imageCounter.style.borderRadius = '15px';
  imageCounter.style.fontSize = '14px';
  imageWrapper.appendChild(imageCounter);
  
  // Attach click event listeners to all product images
  const productImages = document.querySelectorAll('.galleryImg');
  productImages.forEach(img => {
    img.addEventListener('click', showFullSizeImage);
  });
  
  // Add event listener for image resizing
  const fullSizeImage = document.getElementById('fullSizeImage');
  fullSizeImage.addEventListener('click', toggleImageSize);
  
  // Add touch event listeners for swipe support
  document.addEventListener('touchstart', handleTouchStart, false);
  document.addEventListener('touchmove', handleTouchMove, false);
  document.addEventListener('touchend', handleTouchEnd, false);
});
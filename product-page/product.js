let images = [];
let imgUrl;
let fullSizeImageOpen = false;

// Show full size image when a product image is clicked.
function showFullSizeImage(event) {
  event.stopPropagation();
  const clickedImg = event.target;
  // Get the high-resolution URL from data-hires; fallback to thumbnail src if not provided.
  const highResUrl = clickedImg.getAttribute('data-hires') || clickedImg.src;
  imgUrl = highResUrl;
  document.getElementById('fullSizeImage').src = imgUrl;
  document.querySelector('.image-container').style.display = 'flex';
  if (window.innerWidth <= 768) {
    document.querySelector('.image-container').style.flexDirection = 'column';
  }
  document.body.classList.add('stop-scroll');
  // Build the images array for navigation.
  images = Array.from(document.querySelectorAll('.galleryImg')).map(item =>
    item.getAttribute('data-hires') || item.src
  );
  fullSizeImageOpen = true;
  changeArrows();
}

// Hide the full size image viewer.
function hideFullSizeImage(event) {
  if (event) event.stopPropagation();
  document.querySelector('.image-container').style.display = 'none';
  document.body.classList.remove('stop-scroll');
  fullSizeImageOpen = false;
}

// Navigate to the previous image.
function prevImg(event) {
  event.stopPropagation();
  const currentIndex = images.findIndex(item => item === imgUrl);
  if (currentIndex > 0) {
    imgUrl = images[currentIndex - 1];
    document.getElementById('fullSizeImage').src = imgUrl;
    changeArrows();
  }
}

// Navigate to the next image.
function nextImg(event) {
  event.stopPropagation();
  const currentIndex = images.findIndex(item => item === imgUrl);
  if (currentIndex < images.length - 1) {
    imgUrl = images[currentIndex + 1];
    document.getElementById('fullSizeImage').src = imgUrl;
    changeArrows();
  }
}

// Update the state of navigation arrows based on the current image.
function changeArrows() {
  const currentIndex = images.findIndex(item => item === imgUrl);
  if (currentIndex === 0) {
    document.querySelectorAll('.left-arrow').forEach(arrow => arrow.classList.add('disabled'));
  } else {
    document.querySelectorAll('.left-arrow').forEach(arrow => arrow.classList.remove('disabled'));
  }
  if (currentIndex === images.length - 1) {
    document.querySelectorAll('.right-arrow').forEach(arrow => arrow.classList.add('disabled'));
  } else {
    document.querySelectorAll('.right-arrow').forEach(arrow => arrow.classList.remove('disabled'));
  }
}

// Keyboard navigation for the image viewer.
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

// Attach click event listeners to all product images when the DOM is loaded.
document.addEventListener('DOMContentLoaded', function() {
  const productImages = document.querySelectorAll('.galleryImg');
  productImages.forEach(img => {
    img.addEventListener('click', showFullSizeImage);
  });
});

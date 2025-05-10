// Enhanced PDF.js implementation with zoom functionality and high quality rendering
document.addEventListener('DOMContentLoaded', () => {
    // grab the thumbnail container
    const thumbContainer = document.getElementById('pdf-preview');
    if (!thumbContainer) {
      console.error('No element with id="pdf-preview" found.');
      return;
    }
  
    // read the URL from the HTML attribute
    const pdfUrl = thumbContainer.getAttribute('data-pdf-url');
    if (!pdfUrl) {
      console.error('Missing data-pdf-url on #pdf-preview');
      return;
    }
  
    // now load the PDF
    pdfjsLib.getDocument({
      url: pdfUrl,
      cMapUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/cmaps/',
      cMapPacked: true
    }).promise
    .then(/* … */)
    .catch(err => {
      console.error('Error loading PDF:', err);
      // …
    });
  });
  
// 1. PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = 
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';

let pdfDoc = null,
    currentPage = 1,
    pageRendering = false,
    pageNumPending = null,
    renderTask = null,
    scale = 1.5,
    modalScale = 1.5; // Default scale for modal view

// 2. Create two canvases
const thumbContainer = document.getElementById('pdf-preview');
const thumbCanvas    = document.createElement('canvas');
const thumbCtx       = thumbCanvas.getContext('2d');
thumbContainer.appendChild(thumbCanvas);

const modalContainer = document.getElementById('modal-pdf-preview');
const modalCanvas    = document.createElement('canvas');
const modalCtx       = modalCanvas.getContext('2d');
modalContainer.appendChild(modalCanvas);

// 3. Controls — thumbnail
const prevBtn           = document.getElementById('prev-page');
const nextBtn           = document.getElementById('next-page');
const currentPageDisplay= document.getElementById('current-page');
const totalPagesDisplay = document.getElementById('total-pages');

//    Controls — modal
const modalPrevBtn           = document.getElementById('modal-prev-page');
const modalNextBtn           = document.getElementById('modal-next-page');
const modalCurrentPageDisplay= document.getElementById('modal-current-page');
const modalTotalPagesDisplay = document.getElementById('modal-total-pages');

// 4. Enhanced render helper with high quality and zoom support
function renderPage(num, canvas, ctx, pageNumEl, totalPagesEl, prevEl, nextEl, isModal = false) {
  // Cancel any in-flight render
  if (renderTask) renderTask.cancel();
  pageRendering = true;
  pageNumEl.textContent = num;

  // Get page
  pdfDoc.getPage(num).then(page => {
    // Get original viewport at scale 1
    const originalVp = page.getViewport({scale: 1});
    
    // Different scaling logic for modal vs. thumbnail
    let targetScale;
    
    if (isModal) {
      // For modal: use the current zoom level (modalScale)
      targetScale = modalScale;
      
      // Calculate container dimensions
      const modalContainer = canvas.parentElement;
      const containerWidth = modalContainer.clientWidth - 40; // Accounting for padding
      
      // If first render or reset, fit to container
      if (modalScale === 1.5) {
        const viewportHeight = window.innerHeight * 0.75;
        const viewportWidth = containerWidth;
        
        // Calculate both scale options
        const scaleByHeight = viewportHeight / originalVp.height;
        const scaleByWidth = viewportWidth / originalVp.width;
        
        // Use the smaller scale to ensure full visibility
        targetScale = Math.min(scaleByHeight, scaleByWidth);
        modalScale = targetScale; // Save the initial fit scale
      }
    } else {
      // For thumbnail: fit to container width
      const containerW = canvas.parentElement.clientWidth;
      targetScale = (containerW / originalVp.width) * 0.95;
    }
    
    // Get the viewport with our calculated scale
    const vp = page.getViewport({scale: targetScale});
    
    // Set canvas dimensions
    canvas.width = vp.width;
    canvas.height = vp.height;
    
    // Set high-quality rendering
    const outputScale = window.devicePixelRatio || 1;
    
    // Scale canvas for high DPI displays
    canvas.style.width = Math.floor(vp.width) + 'px';
    canvas.style.height = Math.floor(vp.height) + 'px';
    canvas.width = Math.floor(vp.width * outputScale);
    canvas.height = Math.floor(vp.height * outputScale);
    
    // Scale context to match
    ctx.scale(outputScale, outputScale);

    // Render the page with high quality
    const renderContext = {
      canvasContext: ctx,
      viewport: vp,
      enableWebGL: true,
      renderInteractiveForms: true,
      quality: 1.0
    };
    
    renderTask = page.render(renderContext);
    return renderTask.promise;
  }).then(() => {
    pageRendering = false;
    if (pageNumPending !== null) {
      // Render pending page
      renderPage(pageNumPending, canvas, ctx, pageNumEl, totalPagesEl, prevEl, nextEl, isModal);
      pageNumPending = null;
    }
  }).catch(error => {
    console.error('Error rendering PDF page:', error);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = '16px Arial';
    ctx.fillText('Error loading PDF page', 20, 50);
  });

  prevEl.disabled = num <= 1;
  nextEl.disabled = num >= pdfDoc.numPages;
}

function queueRenderPage(num, canvas, ctx, pageNumEl, totalPagesEl, prevEl, nextEl, isModal = false) {
  if (pageRendering) pageNumPending = num;
  else renderPage(num, canvas, ctx, pageNumEl, totalPagesEl, prevEl, nextEl, isModal);
}

// 5. Load PDF with error handling
document.addEventListener('DOMContentLoaded', () => {
  
    // grab the URL from your HTML
  const thumbContainer = document.getElementById('pdf-preview');
  const pdfUrl = thumbContainer.dataset.pdfUrl;
  
  // Show loading indicator
  thumbCtx.font = '16px Arial';
  thumbCtx.fillText('Loading PDF...', 20, 50);
  
  pdfjsLib.getDocument({
    url: pdfUrl,
    cMapUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/cmaps/',
    cMapPacked: true
  }).promise
    .then(pdf => {
      pdfDoc = pdf;
      totalPagesDisplay.textContent = pdf.numPages;
      modalTotalPagesDisplay.textContent = pdf.numPages;
      renderPage(currentPage, thumbCanvas, thumbCtx,
                 currentPageDisplay, totalPagesDisplay, prevBtn, nextBtn);
    })
    .catch(err => {
      console.error('Error loading PDF:', err);
      thumbCtx.clearRect(0, 0, thumbCanvas.width, thumbCanvas.height);
      thumbCtx.font = '16px Arial';
      thumbCtx.fillText('Error loading PDF', 20, 50);
    });
});

// 6. Thumbnail controls
prevBtn.addEventListener('click', () => {
  if (currentPage > 1) {
    currentPage--;
    queueRenderPage(currentPage, thumbCanvas, thumbCtx,
                    currentPageDisplay, totalPagesDisplay, prevBtn, nextBtn);
  }
});

nextBtn.addEventListener('click', () => {
  if (currentPage < pdfDoc.numPages) {
    currentPage++;
    queueRenderPage(currentPage, thumbCanvas, thumbCtx,
                    currentPageDisplay, totalPagesDisplay, prevBtn, nextBtn);
  }
});

// 7. Modal controls with zoom
// 7.1 Page navigation
modalPrevBtn.addEventListener('click', () => {
  if (currentPage > 1) {
    currentPage--;
    queueRenderPage(currentPage, modalCanvas, modalCtx,
                    modalCurrentPageDisplay, modalTotalPagesDisplay,
                    modalPrevBtn, modalNextBtn, true);
  }
});

modalNextBtn.addEventListener('click', () => {
  if (currentPage < pdfDoc.numPages) {
    currentPage++;
    queueRenderPage(currentPage, modalCanvas, modalCtx,
                    modalCurrentPageDisplay, modalTotalPagesDisplay,
                    modalPrevBtn, modalNextBtn, true);
  }
});

// 7.2 Zoom controls
function createZoomControls() {
  const zoomControls = document.createElement('div');
  zoomControls.className = 'zoom-controls';
  
  const zoomOutBtn = document.createElement('button');
  zoomOutBtn.className = 'zoom-btn';
  zoomOutBtn.innerHTML = '<i class="fas fa-search-minus"></i>';
  zoomOutBtn.title = 'Zoom Out';
  
  const zoomResetBtn = document.createElement('button');
  zoomResetBtn.className = 'zoom-btn';
  zoomResetBtn.innerHTML = '<i class="fas fa-sync-alt"></i>';
  zoomResetBtn.title = 'Reset Zoom';
  
  const zoomInBtn = document.createElement('button');
  zoomInBtn.className = 'zoom-btn';
  zoomInBtn.innerHTML = '<i class="fas fa-search-plus"></i>';
  zoomInBtn.title = 'Zoom In';
  
  zoomControls.appendChild(zoomOutBtn);
  zoomControls.appendChild(zoomResetBtn);
  zoomControls.appendChild(zoomInBtn);
  
  document.querySelector('.modal-controls').appendChild(zoomControls);
  
  // Zoom events
  zoomInBtn.addEventListener('click', () => {
    if (modalScale < 4) {
      modalScale *= 1.25;
      queueRenderPage(currentPage, modalCanvas, modalCtx,
                      modalCurrentPageDisplay, modalTotalPagesDisplay,
                      modalPrevBtn, modalNextBtn, true);
    }
  });
  
  zoomOutBtn.addEventListener('click', () => {
    if (modalScale > 0.5) {
      modalScale *= 0.8;
      queueRenderPage(currentPage, modalCanvas, modalCtx,
                      modalCurrentPageDisplay, modalTotalPagesDisplay,
                      modalPrevBtn, modalNextBtn, true);
    }
  });
  
  zoomResetBtn.addEventListener('click', () => {
    // Reset to fit-to-container scale
    modalScale = 1.5; // This will trigger the auto-fit in renderPage
    queueRenderPage(currentPage, modalCanvas, modalCtx,
                    modalCurrentPageDisplay, modalTotalPagesDisplay,
                    modalPrevBtn, modalNextBtn, true);
  });
}

// Create zoom controls on page load
document.addEventListener('DOMContentLoaded', createZoomControls);

// 8. Open/close modal with improved interaction
const thumbWrapper = document.querySelector('.clickable-preview');
const pdfModal = document.getElementById('pdf-modal');
const closeBtn = document.querySelector('.close-modal');

thumbWrapper.addEventListener('click', () => {
  pdfModal.style.display = 'flex';
  // Reset zoom scale for new modal open
  modalScale = 1.5;
  // Pass isModal=true flag to render properly for the modal
  queueRenderPage(currentPage, modalCanvas, modalCtx,
                  modalCurrentPageDisplay, modalTotalPagesDisplay,
                  modalPrevBtn, modalNextBtn, true);
  
  // Prevent body scrolling when modal is open
  document.body.style.overflow = 'hidden';
});

closeBtn.addEventListener('click', () => {
  pdfModal.style.display = 'none';
  // Re-enable body scrolling
  document.body.style.overflow = '';
});

// Close on click outside modal content
pdfModal.addEventListener('click', (e) => {
  if (e.target === pdfModal) {
    pdfModal.style.display = 'none';
    document.body.style.overflow = '';
  }
});

// Handle window resize to refit PDF in modal
window.addEventListener('resize', () => {
  if (pdfModal.style.display === 'flex') {
    // Only reset scale if it's close to default (user hasn't zoomed much)
    if (Math.abs(modalScale - 1.5) < 0.1) {
      modalScale = 1.5;
    }
    queueRenderPage(currentPage, modalCanvas, modalCtx,
                    modalCurrentPageDisplay, modalTotalPagesDisplay,
                    modalPrevBtn, modalNextBtn, true);
  }
});

// 9. Add keyboard navigation support
document.addEventListener('keydown', (e) => {
  if (pdfModal.style.display === 'flex') {
    switch(e.key) {
      case 'Escape':
        pdfModal.style.display = 'none';
        document.body.style.overflow = '';
        break;
      case 'ArrowLeft':
        if (currentPage > 1) {
          currentPage--;
          queueRenderPage(currentPage, modalCanvas, modalCtx,
                          modalCurrentPageDisplay, modalTotalPagesDisplay,
                          modalPrevBtn, modalNextBtn, true);
        }
        break;
      case 'ArrowRight':
        if (currentPage < pdfDoc.numPages) {
          currentPage++;
          queueRenderPage(currentPage, modalCanvas, modalCtx,
                          modalCurrentPageDisplay, modalTotalPagesDisplay,
                          modalPrevBtn, modalNextBtn, true);
        }
        break;
      case '+':
        if (modalScale < 4) {
          modalScale *= 1.25;
          queueRenderPage(currentPage, modalCanvas, modalCtx,
                          modalCurrentPageDisplay, modalTotalPagesDisplay,
                          modalPrevBtn, modalNextBtn, true);
        }
        break;
      case '-':
        if (modalScale > 0.5) {
          modalScale *= 0.8;
          queueRenderPage(currentPage, modalCanvas, modalCtx,
                          modalCurrentPageDisplay, modalTotalPagesDisplay,
                          modalPrevBtn, modalNextBtn, true);
        }
        break;
      case '0':
        modalScale = 1.5;
        queueRenderPage(currentPage, modalCanvas, modalCtx,
                        modalCurrentPageDisplay, modalTotalPagesDisplay,
                        modalPrevBtn, modalNextBtn, true);
        break;
    }
  }
});



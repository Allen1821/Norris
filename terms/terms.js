document.addEventListener('DOMContentLoaded', () => {
  const fileItems         = document.querySelectorAll('.terms-file-item');
  const termsFrame        = document.getElementById('terms-frame');
  const downloadBtn       = document.getElementById('download-pdf');
  const fallbackDownload  = document.getElementById('fallback-download');
  const pdfTitle          = document.querySelector('.pdf-title');
  const pdfLoading        = document.getElementById('pdf-loading');
  const prevPageBtn       = document.getElementById('prev-page');
  const nextPageBtn       = document.getElementById('next-page');
  const currentPageEl     = document.getElementById('current-page');
  const totalPagesEl      = document.getElementById('total-pages');
  const pdfNavigation     = document.querySelector('.pdf-navigation');
  
  let activePdfUrl        = '../certifications/terms-conditions.pdf';
  let currentPage         = 1;
  let totalPages          = 1;
  let pdfDoc              = null;
  let pageRendering       = false;
  let pageNumPending      = null;
  let canvas              = null;
  let ctx                 = null;
  let scale               = 1.0;
  let pixelRatio          = window.devicePixelRatio || 1;
  
  // Detect if we should use PDF.js or iframe
  const isMobile = window.matchMedia('(max-width: 768px)').matches;
  const isTablet = window.matchMedia('(max-width: 1024px)').matches && !isMobile;
  const useAdvancedRenderer = isMobile || isTablet;
  
  // Initialize the PDF.js worker if we need it
  if (useAdvancedRenderer) {
    window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';
  }
  
  // Create a canvas element for PDF rendering
  function setupCanvas() {
    if (!canvas) {
      termsFrame.style.display = 'none';
      
      canvas = document.createElement('canvas');
      canvas.id = 'pdf-canvas';
      canvas.style.width = '100%';
      canvas.style.maxWidth = '100%';
      canvas.style.height = 'auto';
      canvas.style.display = 'block';
      
      const pdfContainer = document.querySelector('.pdf-container');
      pdfContainer.appendChild(canvas);
      
      ctx = canvas.getContext('2d', { alpha: false, antialias: true });
    }
    
    return canvas;
  }
  
  // Show PDF directly in iframe (for desktop)
  function showPdfInIframe(pdfUrl) {
    const absoluteUrl = getAbsoluteUrl(pdfUrl);
    
    // Hide the PDF.js canvas if it exists
    if (canvas) {
      canvas.style.display = 'none';
    }
    
    // Show the iframe
    termsFrame.style.display = 'block';
    termsFrame.src = absoluteUrl;
    
    // Hide loading spinner after a short delay
    setTimeout(() => {
      pdfLoading.style.display = 'none';
    }, 1000);
    
    // Hide navigation controls for iframe view
    pdfNavigation.style.display = 'none';
  }
  
  // Render a specific PDF page with PDF.js
  function renderPage(pageNum) {
  pageRendering = true;
  pdfLoading.style.display = 'flex';
  pdfDoc.getPage(pageNum).then(page => {
    const viewport     = page.getViewport({ scale: 1.0 });
    const parent       = canvas.parentElement;
    const containerW   = parent.clientWidth;
    const isMobile     = window.matchMedia('(max-width: 768px)').matches;

    // fit to width…
    let initialScale = containerW / viewport.width;
    scale = initialScale;

    // …but on mobile ensure it's never too small:
    if (isMobile && initialScale < 1.5) {
      scale = 1.5;
    }

    const scaledViewport = page.getViewport({ scale });
    // …rest of your existing canvas setup/render code…
    canvas.height = scaledViewport.height * pixelRatio;
    canvas.width  = scaledViewport.width  * pixelRatio;
    canvas.style.height = `${scaledViewport.height}px`;
    canvas.style.width  = `${scaledViewport.width}px`;
    ctx.scale(pixelRatio, pixelRatio);

    page.render({
      canvasContext: ctx,
      viewport:      scaledViewport,
      enableWebGL:   true,
      renderInteractiveForms: true
    }).promise.then(() => {
      pageRendering = false;
      pdfLoading.style.display = 'none';
      currentPageEl.textContent = pageNum;
      if (pageNumPending !== null) {
        renderPage(pageNumPending);
        pageNumPending = null;
      }
    });
  });
}
  
  // Queue new page rendering if there's already a rendering in progress
  function queueRenderPage(pageNum) {
    if (pageRendering) {
      pageNumPending = pageNum;
    } else {
      renderPage(pageNum);
    }
  }
  
  // Go to previous page
  function onPrevPage() {
    if (currentPage <= 1) return;
    currentPage--;
    queueRenderPage(currentPage);
  }
  
  // Go to next page
  function onNextPage() {
    if (currentPage >= totalPages) return;
    currentPage++;
    queueRenderPage(currentPage);
  }
  
  // Set up button events for PDF.js navigation
  prevPageBtn.addEventListener('click', onPrevPage);
  nextPageBtn.addEventListener('click', onNextPage);
  
  // Load and render PDF with PDF.js
  function loadAndRenderPdf(pdfUrl) {
    const absoluteUrl = getAbsoluteUrl(pdfUrl);
    pdfLoading.style.display = 'flex';
    
    // Set up canvas for PDF display
    setupCanvas();
    
    // Show navigation controls for PDF.js view
    pdfNavigation.style.display = 'flex';
    
    // Clean any previous PDF content and reset page counter
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    
    currentPage = 1;
    
    // Load and initialize PDF document
    const loadingTask = window.pdfjsLib.getDocument({
      url: absoluteUrl,
      cMapUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdfjs-dist/3.4.120/cmaps/',
      cMapPacked: true,
      enableXfa: true
    });
    loadingTask.promise.then(function(pdf) {
      pdfDoc = pdf;
      totalPages = pdf.numPages;
      
      // Update page counter
      totalPagesEl.textContent = totalPages;
      currentPageEl.textContent = currentPage;
      
      // Initial render of the first page
      renderPage(currentPage);
    }).catch(function(error) {
      console.error('Error loading PDF:', error);
      pdfLoading.style.display = 'none';
      document.querySelector('.pdf-fallback').style.display = 'flex';
    });
  }
  
  // Main function to load PDF based on device type
  function loadPdf(pdfUrl) {
    if (useAdvancedRenderer) {
      // Mobile/tablet: Use PDF.js
      loadAndRenderPdf(pdfUrl);
    } else {
      // Desktop: Use iframe
      showPdfInIframe(pdfUrl);
    }
  }
  
  // Utility to resolve a relative URL to absolute
  function getAbsoluteUrl(url) {
    const a = document.createElement('a');
    a.href = url;
    return a.href;
  }
  
  // Function to handle hash-based navigation
  function handleHashNavigation() {
    const hash = window.location.hash;
    
    if (hash === '#quality' || hash === '#quality-clauses-item') {
      // Click the quality clauses item
      const qualityItem = document.getElementById('quality-clauses-item');
      if (qualityItem) {
        qualityItem.click();
      }
    } else {
      // Default to terms and conditions - but also load the PDF
      const termsItem = document.getElementById('terms-conditions-item');
      if (termsItem) {
        termsItem.click();
      } else {
        // Fallback: Load the default PDF directly if the item doesn't exist yet
        loadPdf(activePdfUrl);
      }
    }
  }
  
  // Sidebar click → swap PDF
  fileItems.forEach(item => {
    item.addEventListener('click', () => {
      fileItems.forEach(el => el.classList.remove('active'));
      item.classList.add('active');

      activePdfUrl = item.getAttribute('data-pdf');
      pdfTitle.textContent = item.textContent.trim();
      
      // Load the new PDF
      loadPdf(activePdfUrl);
    });
  });

  // Initialize with hash check - do this after setting up click handlers
  handleHashNavigation();
  
  // If no hash or hash doesn't match, ensure default PDF loads
  setTimeout(() => {
    if (!document.querySelector('.terms-file-item.active')) {
      document.getElementById('terms-conditions-item').click();
    }
  }, 100);
  
  // Listen for hash changes (if user manually changes URL)
  window.addEventListener('hashchange', handleHashNavigation);

  // Download buttons
  downloadBtn.addEventListener('click', () => {
    window.open(getAbsoluteUrl(activePdfUrl), '_blank');
  });
  fallbackDownload.addEventListener('click', () => {
    window.open(getAbsoluteUrl(activePdfUrl), '_blank');
  });
  
  // Add keyboard navigation for PDF.js mode
  document.addEventListener('keydown', (e) => {
    if (!useAdvancedRenderer) return;
    
    if (e.key === 'ArrowLeft') {
      onPrevPage();
    } else if (e.key === 'ArrowRight') {
      onNextPage();
    }
  });
  
  // Add touch gestures for mobile
  let touchStartX = 0;
  let touchEndX = 0;
  
  document.querySelector('.pdf-container').addEventListener('touchstart', (e) => {
    if (!useAdvancedRenderer) return;
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });
  
  document.querySelector('.pdf-container').addEventListener('touchend', (e) => {
    if (!useAdvancedRenderer) return;
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  }, { passive: true });
  
  function handleSwipe() {
    const swipeThreshold = 50;
    
    if (touchEndX < touchStartX - swipeThreshold) {
      // Swiped left, go to next page
      onNextPage();
    }
    
    if (touchEndX > touchStartX + swipeThreshold) {
      // Swiped right, go to previous page
      onPrevPage();
    }
  }
  
  // Handle window resize
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      // Check if we need to switch between iframe and PDF.js
      const wasMobile = useAdvancedRenderer;
      const newIsMobile = window.matchMedia('(max-width: 768px)').matches;
      const newIsTablet = window.matchMedia('(max-width: 1024px)').matches && !newIsMobile;
      const newUseAdvancedRenderer = newIsMobile || newIsTablet;
      
      // Update pixel ratio which may have changed (e.g., rotated device)
      pixelRatio = window.devicePixelRatio || 1;
      
      // If renderer type changed, reload the PDF
      if (wasMobile !== newUseAdvancedRenderer) {
        loadPdf(activePdfUrl);
      } else if (newUseAdvancedRenderer && pdfDoc) {
        // If still using PDF.js, just re-render the current page
        // Reset context to clear any transformations
        if (ctx) {
          ctx.setTransform(1, 0, 0, 1, 0, 0);
        }
        renderPage(currentPage);
      }
    }, 250);
  });
});
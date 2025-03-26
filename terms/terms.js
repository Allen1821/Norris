

    document.addEventListener('DOMContentLoaded', () => {
      const fileItems = document.querySelectorAll('.terms-file-item');
      const termsFrame = document.getElementById('terms-frame');

      fileItems.forEach(item => {
        item.addEventListener('click', () => {
          // Remove active class from all items
          fileItems.forEach(el => el.classList.remove('active'));
          
          // Add active class to clicked item
          item.classList.add('active');
          
          // Change PDF source
          const pdfFile = item.getAttribute('data-pdf');
          termsFrame.src = pdfFile;
        });
      });
    });


  document.addEventListener('DOMContentLoaded', function() {
    // Check if there's a hash in the URL
    if (window.location.hash === '#quality-clauses-item') {
      // Find the corresponding div
      const qcItem = document.getElementById('quality-clauses-item');
      if (qcItem) {
        // Simulate a click to load the PDF
        qcItem.click();
      }
    }
  });



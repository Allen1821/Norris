document.addEventListener('DOMContentLoaded', function() {
    const tabs = document.querySelectorAll('.equipment-tab');
    const categories = document.querySelectorAll('.equipment-category');
    

    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const categoryToShow = this.getAttribute('data-category');
            

            // Update active tab
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');

            // Show/hide categories
            categories.forEach(category => {
                const categoryTags = category.getAttribute('data-category-tag');
                // Check if the category's tag list contains the selected category or if 'all' is selected
                if (categoryToShow === 'all' || (categoryTags && categoryTags.split(' ').includes(categoryToShow))) {
                    // Use a fade-in effect or simple block display
                    category.style.opacity = '0';
                    category.style.display = 'block';
                    setTimeout(() => { category.style.opacity = '1'; }, 10); // Small delay for transition
                    category.classList.add('active'); // Add active class if needed for other styles/logic
                } else {
                    category.style.display = 'none';
                    category.classList.remove('active');
                }
            });
        });  document.querySelector('.equipment-tab[data-category="all"]').click();
    });

    // Initially show 'all' categories associated with the default active tab
    const initialCategory = document.querySelector('.equipment-tab.active').getAttribute('data-category');
    categories.forEach(category => {
         const categoryTags = category.getAttribute('data-category-tag');
         // Ensure the first category (usually 'horizontal' if 'all' is default) is displayed correctly
         if (category.id === 'horizontal-machines' && initialCategory === 'all') {
             category.style.display = 'block';
             category.classList.add('active');
         } else if (initialCategory !== 'all' && categoryTags && categoryTags.split(' ').includes(initialCategory)) {
              category.style.display = 'block';
             category.classList.add('active');
         }
         else if (initialCategory === 'all' && categoryTags && categoryTags.split(' ').includes('all')) {
             // Keep showing all if the 'all' tab is active by default.
             // This logic might need refinement based on desired initial view.
             // For now, default HTML structure handles the first 'active' category.
         }
         else {
             // Hide categories not matching the initial active tab unless it's 'all'
             if (initialCategory !== 'all') {
                category.style.display = 'none';
                category.classList.remove('active');
             } else if (!category.classList.contains('active')) { // Hide if not the very first one when 'all' is selected
                 category.style.display = 'none';
             }
         }
     });
});

// LIGHTBOX BEHAVIOR
const modal = document.getElementById('image-modal');
const modalImg = document.getElementById('modal-img');
const caption = document.getElementById('modal-caption');
const closeBtn = modal.querySelector('.modal-close');

document.querySelectorAll('.machine-image img').forEach(img => {
img.style.cursor = 'pointer';
img.addEventListener('click', () => {
modal.style.display = 'block';
modalImg.src = img.src;
caption.textContent = img.alt || '';
});
});

closeBtn.addEventListener('click', () => {
modal.style.display = 'none';
});

// also hide when clicking outside the image
modal.addEventListener('click', e => {
if (e.target === modal) modal.style.display = 'none';
});
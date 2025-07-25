function toggleJobDetails(button) {
  const detailsSection = button.closest('.position-card').querySelector('.job-details-expanded');
  
  if (detailsSection.style.display === 'none' || detailsSection.style.display === '') {
    detailsSection.style.display = 'block';
    button.textContent = 'Hide Details';
    button.style.background = 'var(--accent-blue)';
    button.style.color = 'var(--white)';
  } else {
    detailsSection.style.display = 'none';
    button.textContent = 'View Full Details';
    button.style.background = 'transparent';
    button.style.color = 'var(--accent-blue)';
  }
}
// Royal Child Theme - Global JavaScript
console.log('Royal Child Theme Loaded');

// Cart functionality
class Cart {
  constructor() {
    this.cartCount = document.querySelector('.cart-count');
    this.init();
  }

  init() {
    // Add any cart related initialization here
  }

  updateCount(count) {
    if (this.cartCount) {
      this.cartCount.textContent = count;
      this.cartCount.classList.toggle('hidden', count === 0);
    }
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new Cart();
  
  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href !== '#') {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  });
});

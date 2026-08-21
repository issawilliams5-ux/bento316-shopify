/* ==========================================================================
   RoyalChild Theme - Global JavaScript
   Premium Christian Streetwear | Shopify OS 2.0
   ========================================================================== */

(function() {
  'use strict';

  // --------------------------------------------------------------------------
  // Cart State Management
  // --------------------------------------------------------------------------
  
  class CartState {
    constructor() {
      this.cart = null;
      this.isOpen = false;
      this.init();
    }

    init() {
      this.fetchCart();
      this.bindEvents();
    }

    async fetchCart() {
      try {
        const response = await fetch(window.routes.cart_url);
        const data = await response.json();
        this.cart = data;
        this.updateCartCount();
        this.updateCartDrawer();
      } catch (error) {
        console.error('Error fetching cart:', error);
      }
    }

    bindEvents() {
      document.addEventListener('cart:updated', () => this.fetchCart());
      document.addEventListener('cart:open', () => this.open());
      document.addEventListener('cart:close', () => this.close());
      
      // Header cart icon click
      const cartBtn = document.querySelector('[data-cart-icon]');
      if (cartBtn) {
        cartBtn.addEventListener('click', () => {
          if (this.isOpen) {
            this.close();
          } else {
            this.open();
          }
        });
      }
    }

    open() {
      this.isOpen = true;
      document.body.classList.add('cart-drawer-open');
      document.dispatchEvent(new CustomEvent('cart:opened'));
    }

    close() {
      this.isOpen = false;
      document.body.classList.remove('cart-drawer-open');
      document.dispatchEvent(new CustomEvent('cart:closed'));
    }

    updateCartCount() {
      const countElements = document.querySelectorAll('[data-cart-count]');
      const itemCount = this.cart ? this.cart.item_count : 0;
      
      countElements.forEach(el => {
        el.textContent = itemCount;
        el.setAttribute('aria-label', `${itemCount} item${itemCount !== 1 ? 's' : ''} in cart`);
      });
    }

    updateCartDrawer() {
      const drawer = document.querySelector('[data-cart-drawer]');
      if (!drawer) return;

      // Dispatch event for cart drawer to handle rendering
      document.dispatchEvent(new CustomEvent('cart:refresh', { detail: this.cart }));
    }

    async addItem(variantId, quantity = 1) {
      try {
        const response = await fetch(window.routes.cart_add_url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            items: [{
              id: variantId,
              quantity: quantity
            }]
          })
        });

        const data = await response.json();
        
        if (response.ok) {
          this.cart = data;
          this.updateCartCount();
          this.updateCartDrawer();
          this.open();
          document.dispatchEvent(new CustomEvent('cart:item-added', { detail: data }));
        } else {
          throw new Error(data.description || window.cartStrings.error);
        }
      } catch (error) {
        console.error('Error adding to cart:', error);
        document.dispatchEvent(new CustomEvent('cart:error', { detail: error.message }));
      }
    }

    async updateItem(line, quantity) {
      try {
        const response = await fetch(window.routes.cart_change_url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            line: line,
            quantity: quantity
          })
        });

        const data = await response.json();
        
        if (response.ok) {
          this.cart = data;
          this.updateCartCount();
          this.updateCartDrawer();
          document.dispatchEvent(new CustomEvent('cart:item-updated', { detail: data }));
        } else {
          throw new Error(data.description || window.cartStrings.error);
        }
      } catch (error) {
        console.error('Error updating cart item:', error);
        document.dispatchEvent(new CustomEvent('cart:error', { detail: error.message }));
      }
    }

    async removeItem(line) {
      await this.updateItem(line, 0);
    }
  }

  // --------------------------------------------------------------------------
  // Mobile Navigation
  // --------------------------------------------------------------------------
  
  class MobileNav {
    constructor() {
      this.isOpen = false;
      this.drawer = null;
      this.toggle = null;
      this.init();
    }

    init() {
      this.drawer = document.querySelector('[data-mobile-nav-drawer]');
      this.toggle = document.querySelector('[data-mobile-nav-toggle]');
      
      if (!this.drawer || !this.toggle) return;

      this.bindEvents();
    }

    bindEvents() {
      this.toggle.addEventListener('click', () => this.toggle());
      
      // Close on escape key
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.isOpen) {
          this.close();
        }
      });

      // Close when clicking overlay
      const overlay = this.drawer.querySelector('.mobile-nav-overlay');
      if (overlay) {
        overlay.addEventListener('click', () => this.close());
      }
    }

    toggle() {
      if (this.isOpen) {
        this.close();
      } else {
        this.open();
      }
    }

    open() {
      this.isOpen = true;
      this.toggle.setAttribute('aria-expanded', 'true');
      this.toggle.setAttribute('aria-label', 'Close menu');
      document.body.classList.add('mobile-nav-open');
      document.dispatchEvent(new CustomEvent('mobile-nav:opened'));
    }

    close() {
      this.isOpen = false;
      this.toggle.setAttribute('aria-expanded', 'false');
      this.toggle.setAttribute('aria-label', 'Open menu');
      document.body.classList.remove('mobile-nav-open');
      document.dispatchEvent(new CustomEvent('mobile-nav:closed'));
    }
  }

  // --------------------------------------------------------------------------
  // Search Modal
  // --------------------------------------------------------------------------
  
  class SearchModal {
    constructor() {
      this.isOpen = false;
      this.modal = null;
      this.input = null;
      this.resultsContainer = null;
      this.init();
    }

    init() {
      this.modal = document.querySelector('[data-search-modal]');
      const toggleBtns = document.querySelectorAll('[data-search-toggle]');
      
      if (!this.modal) return;

      this.input = this.modal.querySelector('input[type="search"]');
      this.resultsContainer = this.modal.querySelector('[data-search-results]');

      toggleBtns.forEach(btn => {
        btn.addEventListener('click', () => this.open());
      });

      this.bindEvents();
    }

    bindEvents() {
      // Close on escape
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.isOpen) {
          this.close();
        }
      });

      // Close on overlay click
      const overlay = this.modal.querySelector('.search-modal-overlay');
      if (overlay) {
        overlay.addEventListener('click', () => this.close());
      }

      // Predictive search
      if (this.input) {
        let debounceTimer;
        this.input.addEventListener('input', (e) => {
          clearTimeout(debounceTimer);
          const query = e.target.value.trim();
          
          if (query.length >= 2) {
            debounceTimer = setTimeout(() => this.performPredictiveSearch(query), 300);
          } else {
            this.clearResults();
          }
        });
      }
    }

    open() {
      this.isOpen = true;
      document.body.classList.add('search-modal-open');
      if (this.input) {
        this.input.focus();
      }
      document.dispatchEvent(new CustomEvent('search:opened'));
    }

    close() {
      this.isOpen = false;
      document.body.classList.remove('search-modal-open');
      if (this.input) {
        this.input.value = '';
      }
      this.clearResults();
      document.dispatchEvent(new CustomEvent('search:closed'));
    }

    async performPredictiveSearch(query) {
      try {
        const url = `${window.routes.predictive_search_url}?q=${encodeURIComponent(query)}&resources[type]=product,collection,page,article&resources[limit]=10`;
        const response = await fetch(url);
        const data = await response.json();
        this.renderResults(data);
      } catch (error) {
        console.error('Predictive search error:', error);
      }
    }

    renderResults(data) {
      if (!this.resultsContainer) return;

      let html = '';

      // Products
      if (data.resources.products && data.resources.products.length > 0) {
        html += '<div class="search-results-section"><h4>Products</h4><ul class="search-results-list">';
        data.resources.products.forEach(product => {
          html += `
            <li class="search-result-item">
              <a href="${product.url}" class="search-result-link">
                ${product.featured_media && product.featured_media.preview_image 
                  ? `<img src="${product.featured_media.preview_image.url}" alt="${product.title}" width="60" height="60" loading="lazy">` 
                  : ''}
                <span class="search-result-title">${product.title}</span>
                <span class="search-result-price">${this.formatMoney(product.price)}</span>
              </a>
            </li>
          `;
        });
        html += '</ul></div>';
      }

      // Collections
      if (data.resources.collections && data.resources.collections.length > 0) {
        html += '<div class="search-results-section"><h4>Collections</h4><ul class="search-results-list">';
        data.resources.collections.forEach(collection => {
          html += `
            <li class="search-result-item">
              <a href="${collection.url}" class="search-result-link">
                ${collection.image 
                  ? `<img src="${collection.image}" alt="${collection.title}" width="60" height="60" loading="lazy">` 
                  : ''}
                <span class="search-result-title">${collection.title}</span>
              </a>
            </li>
          `;
        });
        html += '</ul></div>';
      }

      this.resultsContainer.innerHTML = html || '<p class="search-no-results">No results found</p>';
    }

    clearResults() {
      if (this.resultsContainer) {
        this.resultsContainer.innerHTML = '';
      }
    }

    formatMoney(cents) {
      const amount = (cents / 100).toFixed(2);
      return `$${amount}`;
    }
  }

  // --------------------------------------------------------------------------
  // Sticky Header
  // --------------------------------------------------------------------------
  
  class StickyHeader {
    constructor() {
      this.header = null;
      this.lastScrollY = 0;
      this.init();
    }

    init() {
      this.header = document.querySelector('[data-header-wrapper]');
      if (!this.header) return;

      this.bindEvents();
      this.checkScroll();
    }

    bindEvents() {
      window.addEventListener('scroll', () => this.onScroll(), { passive: true });
    }

    onScroll() {
      this.checkScroll();
    }

    checkScroll() {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > 100) {
        this.header.classList.add('scrolled');
      } else {
        this.header.classList.remove('scrolled');
      }
      
      this.lastScrollY = currentScrollY;
    }
  }

  // --------------------------------------------------------------------------
  // Wishlist (LocalStorage-based)
  // --------------------------------------------------------------------------
  
  class Wishlist {
    constructor() {
      this.items = this.getItems();
      this.init();
    }

    init() {
      this.bindEvents();
      this.updateWishlistUI();
    }

    getItems() {
      const stored = localStorage.getItem('royalchild-wishlist');
      return stored ? JSON.parse(stored) : [];
    }

    saveItems() {
      localStorage.setItem('royalchild-wishlist', JSON.stringify(this.items));
      this.updateWishlistUI();
    }

    bindEvents() {
      // Wishlist toggle buttons
      document.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-wishlist-toggle]');
        if (btn) {
          const productId = btn.getAttribute('data-product-id');
          this.toggle(productId);
        }
      });

      // Listen for wishlist open events
      document.addEventListener('wishlist:open', () => this.openModal());
    }

    toggle(productId) {
      const index = this.items.indexOf(productId);
      
      if (index > -1) {
        this.items.splice(index, 1);
        document.dispatchEvent(new CustomEvent('wishlist:item-removed', { detail: { productId } }));
      } else {
        this.items.push(productId);
        document.dispatchEvent(new CustomEvent('wishlist:item-added', { detail: { productId } }));
      }
      
      this.saveItems();
    }

    isInWishlist(productId) {
      return this.items.includes(productId);
    }

    updateWishlistUI() {
      document.querySelectorAll('[data-wishlist-toggle]').forEach(btn => {
        const productId = btn.getAttribute('data-product-id');
        const isInList = this.isInWishlist(productId);
        
        btn.classList.toggle('active', isInList);
        btn.setAttribute('aria-pressed', isInList);
      });

      // Update header wishlist count
      const countEl = document.querySelector('[data-wishlist-count]');
      if (countEl) {
        countEl.textContent = this.items.length;
      }
    }

    openModal() {
      document.dispatchEvent(new CustomEvent('wishlist:modal-open', { detail: { items: this.items } }));
    }

    getItems() {
      const stored = localStorage.getItem('royalchild-wishlist');
      return stored ? JSON.parse(stored) : [];
    }
  }

  // --------------------------------------------------------------------------
  // Initialize Components
  // --------------------------------------------------------------------------
  
  function initializeComponents() {
    window.cartState = new CartState();
    window.mobileNav = new MobileNav();
    window.searchModal = new SearchModal();
    window.stickyHeader = new StickyHeader();
    window.wishlist = new Wishlist();

    // Announce to screen readers that page has loaded
    document.dispatchEvent(new CustomEvent('theme:loaded'));
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeComponents);
  } else {
    initializeComponents();
  }

  // Handle Shopify Theme Editor reloads
  document.addEventListener('shopify:section:load', (event) => {
    // Reinitialize components as needed
    if (event.detail.sectionId.includes('header')) {
      window.stickyHeader = new StickyHeader();
    }
  });

})();

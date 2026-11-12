/**
 * Darbar Flavors Spices - Shop Page Controller
 * Category Filtering, Live Search, Sorting, and Dynamic Product Cards
 * Optimized for high performance catalog of 95+ authentic products
 */

const ShopController = {
  currentCategory: 'all',
  currentSort: 'featured',
  searchQuery: '',
  maxPrice: 3500,
  visibleLimit: 24, // Display 24 items initially for lightning speed

  init() {
    this.parseURLParams();
    this.setupFilters();
    this.renderProducts();
  },

  parseURLParams() {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.has('category')) {
        const cat = params.get('category').trim();
        if (cat) this.currentCategory = cat;
      }
      if (params.has('search')) {
        this.searchQuery = params.get('search').trim().toLowerCase();
        const searchBox = document.querySelector('#shopSearchInput');
        if (searchBox) searchBox.value = this.searchQuery;
      }
    } catch (e) {
      this.currentCategory = 'all';
    }
  },

  setupFilters() {
    // Category click
    document.querySelectorAll('[data-filter-category]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelectorAll('[data-filter-category]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentCategory = btn.getAttribute('data-filter-category') || 'all';
        this.visibleLimit = 24; // Reset limit when switching category
        this.renderProducts();
      });
    });

    // Mark active from URL safely
    try {
      const cleanCat = (this.currentCategory || 'all').replace(/[^a-zA-Z0-9_-]/g, '');
      const activeCatBtn = document.querySelector(`[data-filter-category="${cleanCat}"]`);
      if (activeCatBtn) {
        document.querySelectorAll('[data-filter-category]').forEach(b => b.classList.remove('active'));
        activeCatBtn.classList.add('active');
      }
    } catch (e) {}

    // Sort select
    const sortSelect = document.querySelector('#shopSortSelect');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        this.currentSort = e.target.value;
        this.renderProducts();
      });
    }

    // Price range slider
    const priceSlider = document.querySelector('#priceRangeSlider');
    const priceDisplay = document.querySelector('#priceRangeDisplay');
    if (priceSlider && priceDisplay) {
      priceSlider.addEventListener('input', (e) => {
        this.maxPrice = parseInt(e.target.value, 10);
        priceDisplay.textContent = `Rs. ${this.maxPrice.toLocaleString()}`;
        this.renderProducts();
      });
    }

    // In-page search input
    const shopSearch = document.querySelector('#shopSearchInput');
    if (shopSearch) {
      shopSearch.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.trim().toLowerCase();
        this.visibleLimit = 24;
        this.renderProducts();
      });
    }
  },

  getFilteredProducts() {
    if (typeof DARBAR_PRODUCTS === 'undefined') return [];

    return DARBAR_PRODUCTS.filter(product => {
      // Category filter
      if (this.currentCategory !== 'all' && product.category !== this.currentCategory) {
        return false;
      }
      // Price filter (based on default base price)
      if (product.defaultPrice > this.maxPrice) {
        return false;
      }
      // Search query
      if (this.searchQuery) {
        const titleMatch = product.title.toLowerCase().includes(this.searchQuery);
        const urduMatch = product.urduTitle.toLowerCase().includes(this.searchQuery);
        const catMatch = product.categoryName.toLowerCase().includes(this.searchQuery);
        if (!titleMatch && !urduMatch && !catMatch) return false;
      }
      return true;
    }).sort((a, b) => {
      if (this.currentSort === 'price-low') {
        return a.defaultPrice - b.defaultPrice;
      }
      if (this.currentSort === 'price-high') {
        return b.defaultPrice - a.defaultPrice;
      }
      if (this.currentSort === 'rating') {
        return b.rating - a.rating;
      }
      return 0; // default / featured
    });
  },

  renderProducts() {
    const grid = document.querySelector('#shopProductsGrid');
    const countEl = document.querySelector('#shopResultCount');
    if (!grid) return;

    const filtered = this.getFilteredProducts();
    const visibleCount = Math.min(this.visibleLimit, filtered.length);

    if (countEl) {
      countEl.textContent = `Showing ${visibleCount} of ${filtered.length} authentic spices`;
    }

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; background: #fff; border-radius: 12px; border: 1px solid #EAE6DF;">
          <i class="fa-solid fa-mortar-pestle" style="font-size: 3rem; color: #C5A059; margin-bottom: 14px;"></i>
          <h3>No Spices Found!</h3>
          <p style="color: #666; margin-top: 6px;">Try adjusting your filters or price range to explore our catalog.</p>
          <button class="btn btn-primary btn-sm" style="margin-top: 16px;" onclick="ShopController.resetFilters()">
            View All Spices
          </button>
        </div>
      `;
      return;
    }

    const itemsToDisplay = filtered.slice(0, this.visibleLimit);
    let html = itemsToDisplay.map(p => this.createProductCardHTML(p)).join('');

    // If there are more items to load
    if (this.visibleLimit < filtered.length) {
      html += `
        <div style="grid-column: 1 / -1; text-align: center; margin-top: 36px;">
          <button type="button" class="btn btn-primary" onclick="ShopController.loadMore()" style="padding: 12px 32px; font-size: 0.95rem;">
            <i class="fa-solid fa-rotate"></i> Load More Spices (${filtered.length - this.visibleLimit} remaining)
          </button>
        </div>
      `;
    }

    grid.innerHTML = html;
    if (typeof DarbarApp !== 'undefined' && DarbarApp.updateWishlistButtons) {
      DarbarApp.updateWishlistButtons();
    }
  },

  loadMore() {
    this.visibleLimit += 24;
    this.renderProducts();
  },

  createProductCardHTML(product) {
    const isUrdu = (typeof DarbarApp !== 'undefined' && DarbarApp.currentLang === 'ur');
    const isAvailable = product.inStock !== false;
    const defaultOpt = (product.weightOptions && product.weightOptions[0]) || { weight: '100g', price: product.defaultPrice, originalPrice: product.defaultOriginalPrice };
    const badgeHTML = product.badge ? `<div class="product-badge">${product.badge}</div>` : '';

    const stockBadge = isAvailable
      ? `<span class="stock-indicator in-stock ${isUrdu ? 'font-urdu' : ''}"><i class="fa-solid fa-circle-check"></i> ${isUrdu ? 'دستیاب ہے' : 'In Stock'}</span>`
      : `<span class="stock-indicator out-of-stock ${isUrdu ? 'font-urdu' : ''}"><i class="fa-solid fa-circle-xmark"></i> ${isUrdu ? 'آؤٹ آف اسٹاک' : 'Out of Stock'}</span>`;
    const outOfStockRibbon = !isAvailable
      ? `<div class="out-of-stock-ribbon ${isUrdu ? 'font-urdu' : ''}">${isUrdu ? 'اسٹاک ختم' : 'Out of Stock'}</div>`
      : '';

    const pillsHTML = (product.weightOptions || [defaultOpt]).map((opt, idx) => `
      <button type="button" class="weight-pill ${idx === 0 ? 'active' : ''}" 
        onclick="ShopController.selectCardWeight('${product.id}', '${opt.weight}', ${opt.price}, ${opt.originalPrice}, this)">
        ${opt.weight}
      </button>
    `).join('');

    const cardTitle = isUrdu
      ? `<a href="product-detail.html?id=${product.id}" class="font-urdu" style="font-size: 1.15rem; font-weight: 700; line-height: 1.5; color: inherit;">${product.urduTitle || product.title}</a>`
      : `<a href="product-detail.html?id=${product.id}" style="color: inherit;">${product.title}</a>`;

    const catName = (typeof DarbarApp !== 'undefined')
      ? DarbarApp.getCategoryTitle(product.category)
      : product.categoryName;

    const btnText = isUrdu ? 'ٹوکری میں ڈالیں' : 'Add to Cart';
    const reviewsWord = isUrdu ? 'آراء' : 'reviews';

    const addCartBtn = isAvailable
      ? `<button class="btn-add-cart" onclick="ShopController.addCardToCart('${product.id}')">
          <i class="fa-solid fa-cart-plus"></i> ${btnText}
        </button>`
      : `<button class="btn-add-cart is-disabled" disabled title="${isUrdu ? 'یہ مصالحہ فی الوقت دستیاب نہیں ہے' : 'Currently Out of Stock'}">
          <i class="fa-solid fa-ban"></i> ${isUrdu ? 'آؤٹ آف اسٹاک' : 'Out of Stock'}
        </button>`;

    return `
      <div class="product-card ${!isAvailable ? 'is-out-of-stock' : ''}" id="card-${product.id}" data-selected-weight="${defaultOpt.weight}" data-selected-price="${defaultOpt.price}">
        ${badgeHTML}
        ${outOfStockRibbon}
        <button class="product-wishlist-btn" data-wishlist-id="${product.id}" onclick="DarbarApp.toggleWishlist('${product.id}')" title="Wishlist">
          <i class="fa-regular fa-heart"></i>
        </button>
        <div class="product-image-box">
          <a href="product-detail.html?id=${product.id}">
            <img src="${product.image}" alt="${product.title}" loading="lazy">
          </a>
        </div>
        <div class="product-content">
          <div class="product-category-meta">${catName}</div>
          <h4 class="product-title" style="min-height: 44px; display: flex; align-items: center;">
            ${cardTitle}
          </h4>
          
          <div class="product-stock-status-row">
            ${stockBadge}
            <div class="product-rating" style="margin-bottom: 0;">
              <i class="fa-solid fa-star"></i>
              <span style="font-weight: 700; color: #111;">${product.rating}</span>
              <span style="font-size: 0.82rem; color: #666;">(${product.reviewsCount} ${reviewsWord})</span>
            </div>
          </div>

          <div class="weight-selector-pills">
            ${pillsHTML}
          </div>

          <div class="product-price-row">
            <span class="current-price card-price-display">Rs. ${defaultOpt.price}</span>
            <span class="original-price card-old-price-display">Rs. ${defaultOpt.originalPrice}</span>
          </div>

          <div class="product-actions-row">
            ${addCartBtn}
            <button class="btn-quick-wa" onclick="ShopController.orderCardWhatsApp('${product.id}')" title="Order via WhatsApp" style="${!isAvailable ? 'background: #E67E22;' : ''}">
              <i class="fa-brands fa-whatsapp"></i>
            </button>
          </div>
        </div>
      </div>
    `;
  },

  selectCardWeight(productId, weight, price, originalPrice, btnEl) {
    const card = document.getElementById(`card-${productId}`);
    if (!card) return;

    card.querySelectorAll('.weight-pill').forEach(b => b.classList.remove('active'));
    btnEl.classList.add('active');

    card.setAttribute('data-selected-weight', weight);
    card.setAttribute('data-selected-price', price);

    const priceEl = card.querySelector('.card-price-display');
    const oldPriceEl = card.querySelector('.card-old-price-display');
    if (priceEl) priceEl.textContent = `Rs. ${price}`;
    if (oldPriceEl) oldPriceEl.textContent = `Rs. ${originalPrice}`;
  },

  addCardToCart(productId) {
    const card = document.getElementById(`card-${productId}`);
    if (!card) return;
    const weight = card.getAttribute('data-selected-weight');
    DarbarApp.addToCart(productId, weight, 1);
  },

  orderCardWhatsApp(productId) {
    const card = document.getElementById(`card-${productId}`);
    if (!card) return;
    const weight = card.getAttribute('data-selected-weight');
    DarbarApp.orderSingleItemWhatsApp(productId, weight);
  },

  resetFilters() {
    this.currentCategory = 'all';
    this.searchQuery = '';
    this.maxPrice = 3500;
    this.visibleLimit = 24;
    const searchBox = document.querySelector('#shopSearchInput');
    if (searchBox) searchBox.value = '';
    const slider = document.querySelector('#priceRangeSlider');
    if (slider) slider.value = 3500;
    const display = document.querySelector('#priceRangeDisplay');
    if (display) display.textContent = 'Rs. 3,500';
    document.querySelectorAll('[data-filter-category]').forEach(b => b.classList.remove('active'));
    const allBtn = document.querySelector('[data-filter-category="all"]');
    if (allBtn) allBtn.classList.add('active');
    this.renderProducts();
  }
};

document.addEventListener('DOMContentLoaded', () => {
  if (document.querySelector('#shopProductsGrid')) {
    ShopController.init();
  }
});

/**
 * Darbar Flavors Spices - Single Product Detail Controller
 */

const ProductDetailController = {
  product: null,
  selectedWeight: '',
  selectedPrice: 0,
  selectedOriginalPrice: 0,
  quantity: 1,

  init() {
    const params = new URLSearchParams(window.location.search);
    const productId = params.get('id') || 'bombay-biryani-masala';
    this.product = DARBAR_PRODUCTS.find(p => p.id === productId) || DARBAR_PRODUCTS[0];

    // Set default selection
    const defaultOpt = this.product.weightOptions[0];
    this.selectedWeight = defaultOpt.weight;
    this.selectedPrice = defaultOpt.price;
    this.selectedOriginalPrice = defaultOpt.originalPrice;

    this.renderProductDetails();
    this.setupTabs();
    this.renderRelatedProducts();
  },

  renderProductDetails() {
    const isUrdu = (typeof DarbarApp !== 'undefined' && DarbarApp.currentLang === 'ur') || localStorage.getItem('darbar_lang') === 'ur';

    // Title & Meta
    document.title = isUrdu
      ? `${this.product.urduTitle || this.product.title} | Darbar Flavors Spices`
      : `${this.product.title} | Darbar Flavors Spices`;

    const titleEl = document.getElementById('detailTitle');
    const urduTitleEl = document.getElementById('detailUrduTitle');
    const categoryEl = document.getElementById('detailCategory');
    const badgeEl = document.getElementById('detailBadge');
    const ratingEl = document.getElementById('detailRating');
    const reviewsEl = document.getElementById('detailReviewsCount');
    const shortDescEl = document.getElementById('detailShortDesc');
    const breadcrumbCurrent = document.getElementById('breadcrumbCurrent');

    const displayTitle = isUrdu ? (this.product.urduTitle || this.product.title) : this.product.title;
    const catTitle = (typeof DarbarApp !== 'undefined' && DarbarApp.getCategoryTitle)
      ? DarbarApp.getCategoryTitle(this.product.category)
      : (isUrdu ? (this.product.urduCategory || this.product.categoryName) : (this.product.categoryName || this.product.category));

    if (titleEl) {
      titleEl.textContent = displayTitle;
      if (isUrdu) {
        titleEl.classList.add('font-urdu');
      } else {
        titleEl.classList.remove('font-urdu');
      }
    }

    // Hide subtitle to maintain pure English or pure Urdu mode
    if (urduTitleEl) {
      urduTitleEl.style.display = 'none';
    }

    if (categoryEl) categoryEl.textContent = catTitle;
    if (breadcrumbCurrent) {
      breadcrumbCurrent.textContent = displayTitle;
      if (isUrdu) breadcrumbCurrent.classList.add('font-urdu');
      else breadcrumbCurrent.classList.remove('font-urdu');
    }
    if (shortDescEl) {
      shortDescEl.textContent = isUrdu ? (this.product.urduShortDesc || this.product.shortDesc) : this.product.shortDesc;
      if (isUrdu) shortDescEl.classList.add('font-urdu');
      else shortDescEl.classList.remove('font-urdu');
    }

    if (badgeEl) {
      if (this.product.badge) {
        badgeEl.textContent = this.product.badge;
        badgeEl.style.display = 'inline-block';
      } else {
        badgeEl.style.display = 'none';
      }
    }

    // Stock Availability Status
    const stockEl = document.getElementById('detailStockStatus');
    const isAvailable = this.product.inStock !== false;
    if (stockEl) {
      if (isAvailable) {
        stockEl.className = 'stock-indicator in-stock' + (isUrdu ? ' font-urdu' : '');
        stockEl.innerHTML = `<i class="fa-solid fa-circle-check"></i> <span>${isUrdu ? 'دستیاب ہے (ان اسٹاک)' : 'In Stock (Available)'}</span>`;
      } else {
        stockEl.className = 'stock-indicator out-of-stock' + (isUrdu ? ' font-urdu' : '');
        stockEl.innerHTML = `<i class="fa-solid fa-circle-xmark"></i> <span>${isUrdu ? 'ختم شدہ (آؤٹ آف اسٹاک)' : 'Out of Stock (Unavailable)'}</span>`;
      }
    }

    const addBtn = document.getElementById('detailAddToCartBtn');
    if (addBtn) {
      if (isAvailable) {
        addBtn.disabled = false;
        addBtn.classList.remove('is-disabled');
        addBtn.innerHTML = `<i class="fa-solid fa-cart-plus"></i> ${isUrdu ? 'ٹوکری میں شامل کریں' : 'Add to Cart'}`;
      } else {
        addBtn.disabled = true;
        addBtn.classList.add('is-disabled');
        addBtn.innerHTML = `<i class="fa-solid fa-ban"></i> ${isUrdu ? 'آؤٹ آف اسٹاک (فی الوقت ختم ہے)' : 'Out of Stock'}`;
      }
    }

    if (ratingEl) ratingEl.textContent = this.product.rating;
    if (reviewsEl) reviewsEl.textContent = isUrdu ? `(${this.product.reviewsCount} تصدیق شدہ جائزے)` : `(${this.product.reviewsCount} verified reviews)`;

    // Gallery
    const mainImg = document.getElementById('detailMainImage');
    const thumbsContainer = document.getElementById('detailThumbnails');
    if (mainImg) mainImg.src = this.product.image;

    if (thumbsContainer && this.product.gallery) {
      thumbsContainer.innerHTML = this.product.gallery.map((imgUrl, idx) => `
        <div class="detail-thumb ${idx === 0 ? 'active' : ''}" onclick="ProductDetailController.switchImage('${imgUrl}', this)">
          <img src="${imgUrl}" alt="${this.product.title}">
        </div>
      `).join('');
    }

    // Weight Selector
    const weightContainer = document.getElementById('detailWeightButtons');
    if (weightContainer) {
      weightContainer.innerHTML = this.product.weightOptions.map((opt, idx) => `
        <button type="button" class="weight-option-btn ${idx === 0 ? 'active' : ''}" 
          onclick="ProductDetailController.selectWeight('${opt.weight}', ${opt.price}, ${opt.originalPrice}, this)">
          ${opt.weight} (Rs. ${opt.price})
        </button>
      `).join('');
    }

    this.updatePriceDisplay();

    // Tab contents
    const descTab = document.getElementById('tabDescription');
    const ingTab = document.getElementById('tabIngredients');
    const recipeTab = document.getElementById('tabRecipe');

    if (descTab) {
      descTab.innerHTML = `
        <p style="font-size: 1.05rem; margin-bottom: 16px;">${this.product.description}</p>
        <div class="font-urdu" style="font-size: 1.15rem; color: #8B0000; line-height: 1.9; background: #FAF7F0; padding: 18px; border-radius: 8px; border-right: 4px solid #C5A059;">
          ${this.product.urduShortDesc}
        </div>
      `;
    }

    if (ingTab) {
      ingTab.innerHTML = `
        <h4 style="margin-bottom: 10px;">خالص اجزاء (100% Pure Natural Ingredients):</h4>
        <p style="font-size: 1rem; color: #4B5563;">${this.product.ingredients}</p>
        <div style="margin-top: 18px; display: flex; gap: 16px; flex-wrap: wrap;">
          <span style="background: #E8F5E9; color: #2E7D32; font-weight: 600; padding: 4px 12px; border-radius: 4px; font-size: 0.85rem;">✓ کوئی کیمیکل نہیں</span>
          <span style="background: #E8F5E9; color: #2E7D32; font-weight: 600; padding: 4px 12px; border-radius: 4px; font-size: 0.85rem;">✓ کوئی مصنوعی رنگ نہیں</span>
          <span style="background: #E8F5E9; color: #2E7D32; font-weight: 600; padding: 4px 12px; border-radius: 4px; font-size: 0.85rem;">✓ اپنی چکی سے تازہ پسا ہوا</span>
        </div>
      `;
    }

    if (recipeTab) {
      recipeTab.innerHTML = `
        <h4 style="margin-bottom: 10px;">پکانے کا شاہی طریقہ اور ترکیب:</h4>
        <p style="font-size: 1.02rem; line-height: 1.8; color: #374151;">${this.product.recipeMethod}</p>
        <div style="margin-top: 18px; padding: 14px; background: #FFF8E7; border-left: 4px solid #C5A059; border-radius: 6px;">
          <strong>نوٹ:</strong> بہترین ذائقے کے لیے تازہ پسی ہوئی ادرک، لہسن اور دیسی گھی کا استعمال کریں۔
        </div>
      `;
    }

    // Set wishlist button
    const wishBtn = document.getElementById('detailWishlistBtn');
    if (wishBtn) {
      wishBtn.setAttribute('data-wishlist-id', this.product.id);
      wishBtn.onclick = () => DarbarApp.toggleWishlist(this.product.id);
    }
  },

  switchImage(imgUrl, thumbEl) {
    const mainImg = document.getElementById('detailMainImage');
    if (mainImg) mainImg.src = imgUrl;
    document.querySelectorAll('.detail-thumb').forEach(t => t.classList.remove('active'));
    if (thumbEl) thumbEl.classList.add('active');
  },

  selectWeight(weight, price, originalPrice, btnEl) {
    this.selectedWeight = weight;
    this.selectedPrice = price;
    this.selectedOriginalPrice = originalPrice;

    document.querySelectorAll('.weight-option-btn').forEach(b => b.classList.remove('active'));
    if (btnEl) btnEl.classList.add('active');

    this.updatePriceDisplay();
  },

  updatePriceDisplay() {
    const priceEl = document.getElementById('detailPrice');
    const oldPriceEl = document.getElementById('detailOldPrice');
    const savingBadge = document.getElementById('detailSavingBadge');

    const totalCurrent = this.selectedPrice * this.quantity;
    const totalOld = this.selectedOriginalPrice * this.quantity;

    if (priceEl) priceEl.textContent = `Rs. ${totalCurrent.toLocaleString()}`;
    if (oldPriceEl) oldPriceEl.textContent = `Rs. ${totalOld.toLocaleString()}`;

    if (savingBadge && this.selectedOriginalPrice > this.selectedPrice) {
      const discount = Math.round(((this.selectedOriginalPrice - this.selectedPrice) / this.selectedOriginalPrice) * 100);
      savingBadge.textContent = `${discount}% OFF`;
      savingBadge.style.display = 'inline-block';
    }
  },

  changeQty(change) {
    this.quantity = Math.max(1, this.quantity + change);
    const qtyDisplay = document.getElementById('detailQtyDisplay');
    if (qtyDisplay) qtyDisplay.textContent = this.quantity;
    this.updatePriceDisplay();
  },

  addToCart() {
    DarbarApp.addToCart(this.product.id, this.selectedWeight, this.quantity);
  },

  orderWhatsApp() {
    const total = this.selectedPrice * this.quantity;
    const message = encodeURIComponent(
      `السلام علیکم Darbar Flavors Spices!\n\n` +
      `میں آپ کی ویب سائٹ سے یہ آرڈر کرنا چاہتا ہوں:\n` +
      `📌 *پروڈکٹ:* ${this.product.title}\n` +
      `🏷️ *اردو نام:* ${this.product.urduTitle}\n` +
      `⚖️ *پیک وزن:* ${this.selectedWeight}\n` +
      `🔢 *تعداد:* ${this.quantity}\n` +
      `💰 *کل قیمت:* Rs. ${total.toLocaleString()}\n\n` +
      `براہ کرم میرا آرڈر بک کریں اور ڈلیوری کی معلومات فراہم کریں۔ شکریہ!`
    );

    const url = `https://wa.me/${STORE_CONFIG.whatsappNumber.replace('+', '')}?text=${message}`;
    window.open(url, '_blank');
  },

  setupTabs() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const targetTab = btn.getAttribute('data-tab');
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));

        btn.classList.add('active');
        const activePane = document.getElementById(targetTab);
        if (activePane) activePane.classList.add('active');
      });
    });
  },

  renderRelatedProducts() {
    const relatedContainer = document.getElementById('relatedProductsGrid');
    if (!relatedContainer) return;

    const isUrdu = (typeof DarbarApp !== 'undefined' && DarbarApp.currentLang === 'ur') || localStorage.getItem('darbar_lang') === 'ur';

    // Same category or featured, excluding current
    const related = DARBAR_PRODUCTS
      .filter(p => p.id !== this.product.id && (p.category === this.product.category || p.isFeatured))
      .slice(0, 4);

    relatedContainer.innerHTML = related.map(p => {
      const isAvailable = p.inStock !== false;
      const displayTitle = isUrdu ? (p.urduTitle || p.title) : p.title;
      const catTitle = (typeof DarbarApp !== 'undefined' && DarbarApp.getCategoryTitle)
        ? DarbarApp.getCategoryTitle(p.category)
        : (isUrdu ? (p.urduCategory || p.categoryName) : (p.categoryName || p.category));
      const btnText = isUrdu ? 'تفصیل دیکھیں' : 'View Details';
      const stockBadge = isAvailable
        ? `<span class="stock-indicator in-stock ${isUrdu ? 'font-urdu' : ''}"><i class="fa-solid fa-circle-check"></i> ${isUrdu ? 'دستیاب ہے' : 'In Stock'}</span>`
        : `<span class="stock-indicator out-of-stock ${isUrdu ? 'font-urdu' : ''}"><i class="fa-solid fa-circle-xmark"></i> ${isUrdu ? 'آؤٹ آف اسٹاک' : 'Out of Stock'}</span>`;
      const ribbonHTML = !isAvailable
        ? `<div class="out-of-stock-ribbon ${isUrdu ? 'font-urdu' : ''}">${isUrdu ? 'اسٹاک ختم' : 'Out of Stock'}</div>`
        : '';

      return `
      <div class="product-card ${!isAvailable ? 'is-out-of-stock' : ''}">
        ${ribbonHTML}
        <div class="product-image-box">
          <a href="product-detail.html?id=${p.id}">
            <img src="${p.image}" alt="${displayTitle}">
          </a>
        </div>
        <div class="product-content">
          <div class="product-category-meta">${catTitle}</div>
          <h4 class="product-title ${isUrdu ? 'font-urdu' : ''}">
            <a href="product-detail.html?id=${p.id}">${displayTitle}</a>
          </h4>
          <div class="product-stock-status-row" style="margin-bottom: 6px;">
            ${stockBadge}
          </div>
          <div class="product-price-row">
            <span class="current-price">Rs. ${p.defaultPrice}</span>
            <span class="original-price">Rs. ${p.defaultOriginalPrice}</span>
          </div>
          <a href="product-detail.html?id=${p.id}" class="btn btn-primary btn-sm btn-block">
            ${btnText}
          </a>
        </div>
      </div>
    `;
    }).join('');
  }
};

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('detailTitle')) {
    ProductDetailController.init();
  }
});

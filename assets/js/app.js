/**
 * Darbar Flavors Spices - Global Application Core
 * Handles Cart, Wishlist, Drawer, Live Search, Toasts & WhatsApp integration
 * Bulletproof storage wrapper for seamless local file:// & live server operation
 */

// Bulletproof Safe Storage Wrapper
const SafeStorage = {
  memoryFallback: {},
  getItem(key) {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(key);
      }
    } catch (e) {}
    return this.memoryFallback[key] || null;
  },
  setItem(key, value) {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
        return;
      }
    } catch (e) {}
    this.memoryFallback[key] = String(value);
  },
  getJSON(key, defaultVal = []) {
    try {
      const data = this.getItem(key);
      return data ? JSON.parse(data) : defaultVal;
    } catch (e) {
      return defaultVal;
    }
  },
  setJSON(key, value) {
    try {
      this.setItem(key, JSON.stringify(value));
    } catch (e) {}
  }
};

// Global State
const DarbarApp = {
  cart: [],
  wishlist: [],
  currentLang: 'en',

  init() {
    this.loadState();
    this.initLanguage();
    this.setupUI();
    this.setupCartDrawer();
    this.setupSearch();
    this.setupMobileMenu();
    this.updateCounters();
  },

  initLanguage() {
    try {
      const saved = localStorage.getItem('darbar_lang');
      this.currentLang = saved || 'en';
    } catch (e) {
      this.currentLang = 'en';
    }
    this.applyLanguage();
  },

  toggleLanguage() {
    this.currentLang = this.currentLang === 'en' ? 'ur' : 'en';
    try {
      localStorage.setItem('darbar_lang', this.currentLang);
    } catch (e) {}
    this.applyLanguage();
    this.showToast(this.currentLang === 'en' ? 'Switched to English' : 'اردو زبان منتخب کر لی گئی');
  },

  CATEGORY_MAP: {
    en: {
      'special-masalay': 'Cooking Recipes',
      'fries-masalay': 'Fries & Snacks',
      'spice-powders': 'Pure Ground Powders',
      'chaat-masalay': 'Royal Chaat Masalay',
      'sauces': 'Gourmet Sauces & Mayos',
      'deals': 'Mega Saver Deals'
    },
    ur: {
      'special-masalay': 'پکوان ریسیپیز',
      'fries-masalay': 'فرائز و چپس سیزننگز',
      'spice-powders': 'خالص پسے مصالحے',
      'chaat-masalay': 'شاہی چاٹ مصالحہ جات',
      'sauces': 'اسپیشل ساسز اور مایو',
      'deals': 'شاہی بچت پیکجز'
    }
  },

  getCategoryTitle(cat) {
    const isUrdu = this.currentLang === 'ur';
    const dict = isUrdu ? this.CATEGORY_MAP.ur : this.CATEGORY_MAP.en;
    return dict[cat] || (isUrdu ? 'مصالحہ جات' : 'Spices');
  },

  applyLanguage() {
    const isUrdu = this.currentLang === 'ur';
    document.documentElement.lang = isUrdu ? 'ur' : 'en';

    const label = document.getElementById('langSwitchLabel');
    if (label) {
      label.textContent = isUrdu ? 'English' : 'اردو (Urdu)';
    }

    document.querySelectorAll('[data-lang-en]').forEach(el => {
      const enText = el.getAttribute('data-lang-en');
      const urText = el.getAttribute('data-lang-ur');
      if (isUrdu && urText) {
        el.textContent = urText;
      } else if (!isUrdu && enText) {
        el.textContent = enText;
      }
    });

    // Update search inputs
    const searchInputs = document.querySelectorAll('.site-search-input');
    searchInputs.forEach(input => {
      input.placeholder = isUrdu 
        ? 'خالص مصالحے تلاش کریں (مثلاً: بریانی، قورمہ، ہلدی، نہاری...)' 
        : 'Search authentic spices (e.g. Biryani, Korma, Haldi, Nihari...)';
    });

    // Re-render home page featured grid if present
    if (typeof window.renderFeaturedProducts === 'function') {
      window.renderFeaturedProducts();
    }

    // Re-render shop page grid if present
    if (typeof window.ShopController !== 'undefined' && typeof window.ShopController.renderProducts === 'function') {
      window.ShopController.renderProducts();
    }

    // Re-render product detail if present
    if (typeof window.ProductDetailController !== 'undefined' && typeof window.ProductDetailController.renderProductDetails === 'function' && window.ProductDetailController.product) {
      window.ProductDetailController.renderProductDetails();
      window.ProductDetailController.renderRelatedProducts();
    }

    // Update cart drawer texts
    this.renderCartDrawer();
  },

  loadState() {
    this.cart = SafeStorage.getJSON('darbar_cart', []);
    this.wishlist = SafeStorage.getJSON('darbar_wishlist', []);
  },

  saveCart() {
    SafeStorage.setJSON('darbar_cart', this.cart);
    this.updateCounters();
    this.renderCartDrawer();
  },

  saveWishlist() {
    SafeStorage.setJSON('darbar_wishlist', this.wishlist);
    this.updateCounters();
  },

  // Toast Notification
  showToast(message, type = 'success') {
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    const icon = type === 'success' ? 'fa-solid fa-circle-check' : 'fa-solid fa-circle-exclamation';
    toast.innerHTML = `<i class="${icon}"></i> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.remove();
    }, 3000);
  },

  // Cart Functions
  addToCart(productId, weight, qty = 1, customPrice = null) {
    const product = DARBAR_PRODUCTS.find(p => p.id === productId);
    if (!product) return;

    if (product.inStock === false) {
      const isUrdu = this.currentLang === 'ur';
      this.showToast(isUrdu 
        ? `معذرت! "${product.urduTitle || product.title}" فی الوقت آؤٹ آف اسٹاک ہے۔` 
        : `Sorry! "${product.title}" is currently Out of Stock.`, 'error');
      return;
    }

    // Find price for the selected weight
    let weightOpt = (product.weightOptions && product.weightOptions.find(w => w.weight === weight)) || 
                    (product.weightOptions && product.weightOptions[0]);

    if (!weightOpt) {
      const basePrice = product.defaultPrice || 200;
      let calculatedPrice = basePrice;
      if (weight && weight.includes('250g')) calculatedPrice = Math.round(basePrice * 2.4);
      else if (weight && weight.includes('500g')) calculatedPrice = Math.round(basePrice * 4.6);
      else if (weight && weight.includes('1kg')) calculatedPrice = Math.round(basePrice * 9.0);
      weightOpt = { weight: weight || '100g', price: customPrice || calculatedPrice, originalPrice: Math.round(calculatedPrice * 1.2) };
    } else if (customPrice) {
      weightOpt = { ...weightOpt, price: customPrice };
    }

    const itemKey = `${productId}_${weightOpt.weight}`;

    const existingIndex = this.cart.findIndex(item => item.key === itemKey);
    if (existingIndex > -1) {
      this.cart[existingIndex].quantity += qty;
    } else {
      this.cart.push({
        key: itemKey,
        id: product.id,
        title: product.title,
        urduTitle: product.urduTitle,
        image: product.image,
        weight: weightOpt.weight,
        price: weightOpt.price,
        originalPrice: weightOpt.originalPrice,
        quantity: qty
      });
    }

    this.saveCart();
    this.showToast(`${product.title} (${weightOpt.weight}) added to cart!`);
    this.openCartDrawer();
  },

  updateQuantity(itemKey, change) {
    const item = this.cart.find(i => i.key === itemKey);
    if (!item) return;

    item.quantity += change;
    if (item.quantity <= 0) {
      this.cart = this.cart.filter(i => i.key !== itemKey);
    }
    this.saveCart();
  },

  removeFromCart(itemKey) {
    const item = this.cart.find(i => i.key === itemKey);
    if (item) {
      this.cart = this.cart.filter(i => i.key !== itemKey);
      this.saveCart();
      this.showToast(`${item.title} removed from cart!`, 'error');
    }
  },

  getCartTotal() {
    return this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  },

  getCartCount() {
    return this.cart.reduce((sum, item) => sum + item.quantity, 0);
  },

  // Wishlist Functions
  toggleWishlist(productId) {
    const index = this.wishlist.indexOf(productId);
    const product = DARBAR_PRODUCTS.find(p => p.id === productId);
    const prodName = product ? product.title : 'Item';

    if (index > -1) {
      this.wishlist.splice(index, 1);
      this.showToast(`${prodName} removed from wishlist`, 'error');
    } else {
      this.wishlist.push(productId);
      this.showToast(`${prodName} added to wishlist!`);
    }

    this.saveWishlist();
    this.updateWishlistButtons();
  },

  updateWishlistButtons() {
    document.querySelectorAll('[data-wishlist-id]').forEach(btn => {
      const id = btn.getAttribute('data-wishlist-id');
      if (this.wishlist.includes(id)) {
        btn.classList.add('active');
        btn.innerHTML = '<i class="fa-solid fa-heart" style="color: #B22222;"></i>';
      } else {
        btn.classList.remove('active');
        btn.innerHTML = '<i class="fa-regular fa-heart"></i>';
      }
    });
  },

  // Update Header / Mobile Badges
  updateCounters() {
    const cartCount = this.getCartCount();
    const cartTotal = this.getCartTotal();
    const wishlistCount = this.wishlist.length;

    document.querySelectorAll('.cart-badge-count').forEach(el => {
      el.textContent = cartCount;
      el.style.display = cartCount > 0 ? 'flex' : 'none';
    });

    document.querySelectorAll('.header-cart-total').forEach(el => {
      el.textContent = `Rs. ${cartTotal.toLocaleString()}`;
    });

    document.querySelectorAll('.wishlist-badge-count').forEach(el => {
      el.textContent = wishlistCount;
      el.style.display = wishlistCount > 0 ? 'flex' : 'none';
    });
  },

  // Cart Drawer UI
  setupCartDrawer() {
    // Delegated click listener so ANY .open-cart-drawer element anywhere (including mobile bottom bar) always works
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.open-cart-drawer');
      if (btn) {
        e.preventDefault();
        this.openCartDrawer();
      }
    });

    const closeBtn = document.querySelector('.close-drawer-btn');
    const overlay = document.querySelector('.cart-drawer-overlay');

    if (closeBtn) closeBtn.addEventListener('click', () => this.closeCartDrawer());
    if (overlay) overlay.addEventListener('click', () => this.closeCartDrawer());

    this.renderCartDrawer();
  },

  openCartDrawer() {
    const drawer = document.querySelector('.cart-drawer');
    const overlay = document.querySelector('.cart-drawer-overlay');
    if (drawer && overlay) {
      this.renderCartDrawer();
      drawer.classList.add('active');
      overlay.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  },

  closeCartDrawer() {
    const drawer = document.querySelector('.cart-drawer');
    const overlay = document.querySelector('.cart-drawer-overlay');
    if (drawer && overlay) {
      drawer.classList.remove('active');
      overlay.classList.remove('active');
      document.body.style.overflow = '';
    }
  },

  renderCartDrawer() {
    const itemsContainer = document.querySelector('.cart-drawer-items');
    const subtotalEl = document.querySelector('.drawer-subtotal-amount');
    const freeShippingText = document.querySelector('.free-shipping-text');
    const freeShippingFill = document.querySelector('.free-shipping-fill');
    const shippingEl = document.querySelector('.drawer-shipping-amount');
    const grandTotalEl = document.querySelector('.drawer-grandtotal-amount');

    if (!itemsContainer) return;

    if (this.cart.length === 0) {
      itemsContainer.innerHTML = `
        <div class="cart-empty-message">
          <i class="fa-solid fa-basket-shopping"></i>
          <h4>Your cart is empty</h4>
          <p style="font-size: 0.88rem; margin-top: 6px; color: #666;">Explore our pure spices and start shopping!</p>
          <a href="shop.html" class="btn btn-primary btn-sm" style="margin-top: 16px;">
            <i class="fa-solid fa-bag-shopping"></i> Start Shopping
          </a>
        </div>
      `;
      if (subtotalEl) subtotalEl.textContent = 'Rs. 0';
      if (shippingEl) shippingEl.textContent = 'Free';
      if (grandTotalEl) grandTotalEl.textContent = 'Rs. 0';
      if (freeShippingFill) freeShippingFill.style.width = '0%';
      return;
    }

    const subtotal = this.getCartTotal();

    if (subtotalEl) subtotalEl.textContent = `Rs. ${subtotal.toLocaleString()}`;
    if (shippingEl) shippingEl.textContent = 'Discuss on WhatsApp';
    if (grandTotalEl) grandTotalEl.textContent = `Rs. ${subtotal.toLocaleString()}`;

    // Render items list
    itemsContainer.innerHTML = this.cart.map(item => `
      <div class="cart-item-row" data-key="${item.key}">
        <img src="${item.image}" alt="${item.title}" class="cart-item-img" onerror="this.onerror=null; this.src='assets/images/logo.png';">
        <div class="cart-item-details">
          <div class="cart-item-title">${item.title}</div>
          <div class="cart-item-weight font-urdu">${item.urduTitle || ''} • ${item.weight}</div>
          <div class="cart-item-price">Rs. ${item.price.toLocaleString()}</div>
          <div class="cart-qty-control">
            <button class="qty-btn" onclick="DarbarApp.updateQuantity('${item.key}', -1)">-</button>
            <span class="qty-num">${item.quantity}</span>
            <button class="qty-btn" onclick="DarbarApp.updateQuantity('${item.key}', 1)">+</button>
          </div>
        </div>
        <button class="remove-cart-item-btn" onclick="DarbarApp.removeFromCart('${item.key}')" title="Remove Item">
          <i class="fa-solid fa-trash-can"></i>
        </button>
      </div>
    `).join('');
  },

  // Setup Live Search
  setupSearch() {
    const searchInputs = document.querySelectorAll('.site-search-input');
    const resultsContainers = document.querySelectorAll('.search-results-dropdown');

    searchInputs.forEach(input => {
      input.addEventListener('input', (e) => {
        const query = e.target.value.trim().toLowerCase();
        const dropdown = input.closest('.header-search') ? input.closest('.header-search').querySelector('.search-results-dropdown') : null;

        if (!dropdown) return;

        if (query.length < 2) {
          dropdown.style.display = 'none';
          return;
        }

        const matches = DARBAR_PRODUCTS.filter(p => 
          p.title.toLowerCase().includes(query) ||
          p.urduTitle.includes(query) ||
          p.categoryName.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query)
        ).slice(0, 6);

        if (matches.length === 0) {
          dropdown.innerHTML = `
            <div style="padding: 16px; text-align: center; color: #9E9E9E; font-size: 0.85rem;">
              No spices found matching "${query}"
            </div>
          `;
          dropdown.style.display = 'block';
          return;
        }

        dropdown.innerHTML = matches.map(p => `
          <a href="product-detail.html?id=${p.id}" class="search-result-item">
            <img src="${p.image}" alt="${p.title}">
            <div class="search-result-info">
              <h5>${p.title}</h5>
              <div class="font-urdu" style="color: #B22222; font-size: 0.78rem;">${p.urduTitle}</div>
              <span>Rs. ${p.defaultPrice}</span>
            </div>
          </a>
        `).join('');
        dropdown.style.display = 'block';
      });
    });

    // Close on click outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.header-search')) {
        resultsContainers.forEach(d => d.style.display = 'none');
      }
    });
  },

  // Mobile Menu
  setupMobileMenu() {
    const toggleBtn = document.querySelector('.mobile-toggle-btn');
    const drawer = document.querySelector('.mobile-nav-drawer');
    const closeBtn = document.querySelector('.close-mobile-drawer-btn');
    const overlay = document.querySelector('.cart-drawer-overlay');

    if (toggleBtn && drawer) {
      toggleBtn.addEventListener('click', () => {
        drawer.classList.add('active');
        if (overlay) overlay.classList.add('active');
      });
    }

    if (closeBtn && drawer) {
      closeBtn.addEventListener('click', () => {
        drawer.classList.remove('active');
        if (overlay) overlay.classList.remove('active');
      });
    }
  },

  // Direct WhatsApp Quick Order for a single item
  orderSingleItemWhatsApp(productId, weight) {
    const product = DARBAR_PRODUCTS.find(p => p.id === productId);
    if (!product) return;
    const opt = (product.weightOptions && product.weightOptions.find(w => w.weight === weight)) || 
                (product.weightOptions && product.weightOptions[0]) || 
                { weight: '100g', price: product.defaultPrice };

    const isOut = product.inStock === false;
    const message = encodeURIComponent(
      isOut
        ? `السلام علیکم Darbar Flavors Spices!\n\n` +
          `میں اس مصالحے کی دستیابی کے بارے میں معلوم کرنا چاہتا ہوں جو ویب سائٹ پر فی الوقت آؤٹ آف اسٹاک دکھائی دے رہا ہے:\n` +
          `📌 *پروڈکٹ:* ${product.title} (${product.urduTitle || ''})\n` +
          `⚖️ *وزن:* ${opt.weight}\n\n` +
          `کیا یہ مصالحہ جلد دستیاب ہو جائے گا؟ براہ کرم رہنمائی فرمائیں۔ شکریہ!`
        : `السلام علیکم Darbar Flavors Spices!\n\n` +
          `میں یہ مصالحہ واٹس ایپ پر آرڈر کرنا چاہتا ہوں:\n` +
          `📌 *پروڈکٹ:* ${product.title} (${product.urduTitle || ''})\n` +
          `⚖️ *وزن:* ${opt.weight}\n` +
          `💰 *قیمت:* Rs. ${opt.price}\n\n` +
          `براہ کرم ڈلیوری کی تفصیلات اور آرڈر تصدیق فرما دیں۔ شکریہ!`
    );

    const waUrl = `https://wa.me/${STORE_CONFIG.whatsappNumber.replace('+', '')}?text=${message}`;
    window.open(waUrl, '_blank');
  },

  // Direct WhatsApp Full Cart Order
  orderCartOnWhatsApp() {
    if (this.cart.length === 0) {
      this.showToast('Your cart is empty! / آپ کا کارٹ خالی ہے', 'error');
      return;
    }

    const subtotal = this.getCartTotal();

    const itemsSummary = this.cart.map((item, idx) => 
      `${idx + 1}. *${item.title}* (${item.urduTitle || ''})\n   - وزن: ${item.weight} | تعداد: ${item.quantity}\n   - قیمت: Rs. ${(item.price * item.quantity).toLocaleString()}`
    ).join('\n\n');

    const message = 
      `السلام علیکم Darbar Flavors Spices!\n\n` +
      `میں اپنی کارٹ کا آرڈر براہِ راست واٹس ایپ پر بُک کرنا چاہتا ہوں:\n\n` +
      `🛒 *آرڈر آئٹمز کی تفصیل (Items List):*\n` +
      `${itemsSummary}\n\n` +
      `──────────────────────\n` +
      `💰 *کل رقم (Total Amount):* Rs. ${subtotal.toLocaleString()}\n` +
      `📦 *ترسیل و ڈلیوری:* دکاندار سے براہِ راست واٹس ایپ پر طے ہوگی\n` +
      `──────────────────────\n\n` +
      `براہ کرم میرا آرڈر کنفرم فرما دیں۔ شکریہ!`;

    const config = (typeof DarbarData !== 'undefined' && DarbarData.getStoreConfig) 
      ? DarbarData.getStoreConfig() 
      : (typeof STORE_CONFIG !== 'undefined' ? STORE_CONFIG : {});
    const waNumber = (config.whatsappNumber || '+923102465004').replace(/[^0-9]/g, '');
    const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');
  },

  setupUI() {
    this.updateWishlistButtons();
    this.syncStoreInfoDOM();
    this.renderTestimonials();
  },

  syncStoreInfoDOM() {
    const config = (typeof DarbarData !== 'undefined' && DarbarData.getStoreConfig) 
      ? DarbarData.getStoreConfig() 
      : (typeof STORE_CONFIG !== 'undefined' ? STORE_CONFIG : {});

    const phone = config.phoneDisplay || '+92 310 2465004';
    const waNumber = (config.whatsappNumber || '+923102465004').replace(/[^0-9]/g, '');
    const email = config.email || 'darbar.flavours03@gmail.com';
    const address = config.address || 'Murad Khan Rd, Lyari Town, Karachi, Sindh 72500';
    const mapsUrl = config.mapsUrl || 'https://maps.google.com/maps?q=Darbar%2BFlavour%2Band%2Bspices%2BMurad%2BKhan%2BRd%2C%2B%D9%84%DB%8C%D8%A7%D8%B1%DB%8C%2B%D9%B9%D8%A7%D8%A4%D9%86%2C%2B72500%2C%2B%D8%B3%D9%86%D8%AF%DA%BE%2C%2BPK&sll=24.85600548,67.00295892';

    // Phone / WhatsApp text & links
    document.querySelectorAll('.header-support-pill .phone').forEach(el => el.textContent = phone);
    document.querySelectorAll('a[href*="wa.me"]').forEach(link => {
      try {
        const url = new URL(link.href);
        const text = url.searchParams.get('text');
        link.href = text ? `https://wa.me/${waNumber}?text=${encodeURIComponent(text)}` : `https://wa.me/${waNumber}`;
      } catch (e) {}
    });

    // Email links & text
    document.querySelectorAll('a[href^="mailto:"]').forEach(link => {
      link.href = `mailto:${email}`;
      if (link.textContent.includes('@')) link.textContent = email;
    });

    // Address link & text
    document.querySelectorAll('.footer-contact-item a[href*="maps.google.com"]').forEach(link => {
      link.href = mapsUrl;
      link.textContent = address;
    });
  },

  renderTestimonials() {
    const grid = document.getElementById('testimonialsGrid') || document.querySelector('.testimonials-grid');
    if (!grid || typeof DarbarData === 'undefined') return;

    const reviews = DarbarData.getReviews();
    if (!reviews || reviews.length === 0) return;

    grid.innerHTML = reviews.map(rev => {
      const stars = Array.from({ length: 5 }, (_, i) => 
        `<i class="fa-solid fa-star" style="color: ${i < rev.rating ? '#F59E0B' : '#D1D5DB'}; margin-right: 2px;"></i>`
      ).join('');

      return `
        <div class="testimonial-card">
          <div class="test-stars">
            ${stars}
          </div>
          <div class="test-urdu-quote font-urdu">
            "${rev.text}"
          </div>
          <div class="test-author">
            <div class="test-avatar">${rev.avatar || (rev.name ? rev.name.charAt(0) : 'د')}</div>
            <div class="test-author-info">
              <h5 class="font-urdu">${rev.name}</h5>
              <span>${rev.city}</span>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  DarbarApp.init();
});

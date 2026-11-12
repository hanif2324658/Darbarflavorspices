/**
 * DARBAR FLAVORS SPICES - MASTER ADMIN DASHBOARD CONTROLLER
 * Full Management: Products CRUD, Pricing/Rates, Real Reviews, Store Settings & Order Processing
 */

const DarbarAdmin = {
  activeTab: 'products',
  productSearchQuery: '',
  productCategoryFilter: 'all',
  orderStatusFilter: 'all',
  orderSearchQuery: '',

  presetImages: {
    biryani: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=700&auto=format&fit=crop&q=80',
    qorma: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=700&auto=format&fit=crop&q=80',
    karahi: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=700&auto=format&fit=crop&q=80',
    nehari: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=700&auto=format&fit=crop&q=80',
    haleem: 'https://images.unsplash.com/photo-1645177628172-a94c1f96e6db?w=700&auto=format&fit=crop&q=80',
    tikka: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=700&auto=format&fit=crop&q=80',
    broast: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=700&auto=format&fit=crop&q=80',
    fish: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=700&auto=format&fit=crop&q=80',
    haldi: 'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=700&auto=format&fit=crop&q=80',
    mirch: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=700&auto=format&fit=crop&q=80',
    chaat: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=700&auto=format&fit=crop&q=80',
    fries: 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?w=700&auto=format&fit=crop&q=80',
    sauces: 'https://images.unsplash.com/photo-1472476443507-c7a5948772fc?w=700&auto=format&fit=crop&q=80'
  },

  init() {
    if (!this.checkAuth()) {
      return;
    }
    this.ensureInitialData();
    this.renderMetrics();
    this.renderProductsTable();
    this.renderOrdersTable();
    this.renderReviews();
    this.loadStoreSettings();
    this.renderInventoryTable();
    this.setupEventListeners();
  },

  checkAuth() {
    const isAuth = sessionStorage.getItem('darbar_admin_auth') === 'true';
    const gate = document.getElementById('adminLoginGate');
    const dash = document.getElementById('adminDashboardWrapper');

    if (isAuth) {
      if (gate) gate.style.display = 'none';
      if (dash) dash.style.display = 'block';
      return true;
    } else {
      if (gate) gate.style.display = 'flex';
      if (dash) dash.style.display = 'none';
      return false;
    }
  },

  handleLoginSubmit(e) {
    if (e && e.preventDefault) e.preventDefault();
    const user = (document.getElementById('loginUsername') ? document.getElementById('loginUsername').value : '').trim().toLowerCase();
    const pass = (document.getElementById('loginPassword') ? document.getElementById('loginPassword').value : '').trim();
    const errBox = document.getElementById('adminLoginError');
    const errText = document.getElementById('adminLoginErrorText');

    const cfg = (typeof DarbarData !== 'undefined') ? DarbarData.getStoreConfig() : {};
    const customPin = (typeof localStorage !== 'undefined') ? localStorage.getItem('darbar_custom_pin') : null;
    const activePin = (cfg && cfg.adminPin) ? cfg.adminPin : (customPin || 'darbar2026');
    const validEmails = ['admin', 'darbar', 'darbar.flavours03@gmail.com'];

    const userValid = validEmails.some(val => user.includes(val)) || user === '';
    const passValid = (pass === activePin);

    if (userValid && passValid) {
      sessionStorage.setItem('darbar_admin_auth', 'true');
      if (errBox) errBox.style.display = 'none';
      this.checkAuth();
      this.ensureInitialData();
      this.renderMetrics();
      this.renderProductsTable();
      this.renderOrdersTable();
      this.renderReviews();
      this.loadStoreSettings();
      this.renderInventoryTable();
      this.setupEventListeners();
      if (typeof DarbarApp !== 'undefined') {
        DarbarApp.showToast('خوش آمدید! ایڈمن پورٹل میں کامیابی سے لاگ ان ہو گئے۔');
      }
    } else {
      if (errBox) {
        errBox.style.display = 'block';
        if (errText) errText.textContent = 'غلط یوزر نام یا سیکیورٹی پن! براہ کرم درست معلومات درج کریں۔';
      }
    }
  },

  togglePasswordVisibility() {
    const passInput = document.getElementById('loginPassword');
    const icon = document.getElementById('togglePasswordIcon');
    if (!passInput) return;
    if (passInput.type === 'password') {
      passInput.type = 'text';
      if (icon) icon.className = 'fa-regular fa-eye-slash';
    } else {
      passInput.type = 'password';
      if (icon) icon.className = 'fa-regular fa-eye';
    }
  },

  logout() {
    if (confirm('کیا آپ ایڈمن پورٹل سے لاگ آؤٹ کرنا چاہتے ہیں؟ (Sign out from Admin?)')) {
      sessionStorage.removeItem('darbar_admin_auth');
      window.location.reload();
    }
  },

  // Ensure sample orders exist if empty
  ensureInitialData() {
    const orders = (typeof SafeStorage !== 'undefined') 
      ? SafeStorage.getJSON('darbar_orders', []) 
      : [];
    if (!orders || orders.length === 0) {
      this.generateDemoOrders(false);
    }
  },

  renderMetrics() {
    const products = (typeof DarbarData !== 'undefined') ? DarbarData.getProducts() : DARBAR_PRODUCTS;
    const orders = this.getOrders();
    const reviews = (typeof DarbarData !== 'undefined') ? DarbarData.getReviews() : [];

    const totalSales = orders.reduce((sum, o) => sum + (o.total || 0), 0);

    const elProducts = document.getElementById('metricTotalProducts');
    const elOrders = document.getElementById('metricTotalOrders');
    const elReviews = document.getElementById('metricTotalReviews');
    const elSales = document.getElementById('metricTotalSales');

    if (elProducts) elProducts.textContent = products.length;
    if (elOrders) elOrders.textContent = orders.length;
    if (elReviews) elReviews.textContent = reviews.length;
    if (elSales) elSales.textContent = `Rs. ${totalSales.toLocaleString()}`;
  },

  // ==============================================================
  // TAB 1: PRODUCTS CRUD
  // ==============================================================
  renderProductsTable() {
    const tbody = document.getElementById('productsTableBody');
    if (!tbody || typeof DarbarData === 'undefined') return;

    let products = DarbarData.getProducts();

    // Category filter
    if (this.productCategoryFilter !== 'all') {
      products = products.filter(p => p.category === this.productCategoryFilter);
    }

    // Search query
    if (this.productSearchQuery) {
      const q = this.productSearchQuery.toLowerCase();
      products = products.filter(p => 
        (p.title && p.title.toLowerCase().includes(q)) ||
        (p.urduTitle && p.urduTitle.toLowerCase().includes(q)) ||
        (p.categoryName && p.categoryName.toLowerCase().includes(q))
      );
    }

    if (products.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center; padding: 40px; color: #888;">
            <i class="fa-solid fa-box-open" style="font-size: 2.5rem; color: #CCC; margin-bottom: 12px; display: block;"></i>
            No spice items found matching "${this.productSearchQuery || this.productCategoryFilter}".
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = products.map(product => {
      const weightsHTML = (product.weightOptions || []).map(w => 
        `<span style="background: #EFECE6; padding: 2px 7px; border-radius: 4px; font-size: 0.76rem; display: inline-block; margin: 2px;">
          ${w.weight}: <strong>Rs. ${w.price}</strong>
        </span>`
      ).join('');

      const badgeHTML = product.badge ? `<span style="background: var(--admin-gold); color: #000; font-size: 0.7rem; font-weight: 700; padding: 2px 6px; border-radius: 4px; margin-left: 6px;">${product.badge}</span>` : '';

      return `
        <tr>
          <td>
            <img src="${product.image}" alt="${product.title}" style="width: 52px; height: 52px; border-radius: 8px; object-fit: cover; border: 1.5px solid #DDD;" onerror="this.src='assets/images/logo.png'">
          </td>
          <td>
            <div style="font-weight: 700; font-size: 0.95rem; color: #111;">
              ${product.title} ${badgeHTML}
            </div>
            <div class="font-urdu" style="color: var(--admin-red); font-size: 0.92rem; margin-top: 2px;">
              ${product.urduTitle || ''}
            </div>
          </td>
          <td>
            <span style="font-size: 0.82rem; font-weight: 600; color: #4B5563;">${product.categoryName || product.category}</span>
          </td>
          <td>
            <strong style="font-size: 1.05rem; color: #111;">Rs. ${product.defaultPrice || (product.weightOptions && product.weightOptions[0] ? product.weightOptions[0].price : 0)}</strong>
            ${product.defaultOriginalPrice ? `<div style="font-size: 0.78rem; text-decoration: line-through; color: #888;">Rs. ${product.defaultOriginalPrice}</div>` : ''}
          </td>
          <td style="max-width: 260px;">
            <div style="display: flex; flex-wrap: wrap; gap: 4px;">
              ${weightsHTML || '<span style="color: #999; font-size: 0.8rem;">Standard Pack</span>'}
            </div>
          </td>
          <td>
            <span class="status-badge ${product.inStock !== false ? 'status-delivered' : 'status-cancelled'}">
              ${product.inStock !== false ? 'In Stock' : 'Out of Stock'}
            </span>
          </td>
          <td>
            <div style="display: flex; gap: 8px;">
              <button class="action-icon-btn" onclick="DarbarAdmin.openEditProductModal('${product.id}')" title="Edit Spice (ترمیم کریں)">
                <i class="fa-solid fa-pen-to-square"></i>
              </button>
              <button class="action-icon-btn btn-delete" onclick="DarbarAdmin.deleteProduct('${product.id}')" title="Delete Spice (ڈیلیٹ کریں)">
                <i class="fa-solid fa-trash-can"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  },

  openAddProductModal() {
    const modal = document.getElementById('adminProductModal');
    const form = document.getElementById('productForm');
    const titleEl = document.getElementById('productModalTitle');
    if (!modal || !form) return;

    form.reset();
    document.getElementById('editProductId').value = '';
    document.getElementById('productInStock').checked = true;
    document.getElementById('productIsFeatured').checked = true;
    const defaultImg = this.presetImages.biryani;
    document.getElementById('productImage').value = defaultImg;
    this.updateImagePreview(defaultImg);
    if (titleEl) titleEl.innerHTML = '<i class="fa-solid fa-plus" style="color: var(--admin-gold);"></i> Add New Spice Item (نیا مصالحہ شامل کریں)';

    modal.classList.add('active');
  },

  openEditProductModal(id) {
    const product = DarbarData.getProductById(id);
    if (!product) return;

    const modal = document.getElementById('adminProductModal');
    const titleEl = document.getElementById('productModalTitle');
    if (!modal) return;

    document.getElementById('editProductId').value = product.id;
    document.getElementById('productTitleEn').value = product.title || '';
    document.getElementById('productTitleUr').value = product.urduTitle || '';
    document.getElementById('productCategory').value = product.category || 'special-masalay';
    document.getElementById('productBadge').value = product.badge || '';
    document.getElementById('productDefaultPrice').value = product.defaultPrice || '';
    document.getElementById('productOriginalPrice').value = product.defaultOriginalPrice || '';
    document.getElementById('productImage').value = product.image || '';
    this.updateImagePreview(product.image || '');
    document.getElementById('productShortDesc').value = product.shortDesc || product.urduShortDesc || '';
    document.getElementById('productInStock').checked = product.inStock !== false;
    document.getElementById('productIsFeatured').checked = Boolean(product.isFeatured);

    // Populate weight inputs
    const weights = product.weightOptions || [];
    const w100 = weights.find(w => w.weight.includes('100g'));
    const w250 = weights.find(w => w.weight.includes('250g'));
    const w500 = weights.find(w => w.weight.includes('500g'));
    const w1000 = weights.find(w => w.weight.includes('1kg') || w.weight.includes('1000g'));

    document.getElementById('weightRate100').value = w100 ? w100.price : (product.defaultPrice || '');
    document.getElementById('weightRate250').value = w250 ? w250.price : Math.round((product.defaultPrice || 200) * 2.3);
    document.getElementById('weightRate500').value = w500 ? w500.price : Math.round((product.defaultPrice || 200) * 4.3);
    document.getElementById('weightRate1000').value = w1000 ? w1000.price : Math.round((product.defaultPrice || 200) * 8.2);

    if (titleEl) titleEl.innerHTML = `<i class="fa-solid fa-pen-to-square" style="color: var(--admin-gold);"></i> Edit Spice: ${product.title}`;

    modal.classList.add('active');
  },

  closeProductModal() {
    const modal = document.getElementById('adminProductModal');
    if (modal) modal.classList.remove('active');
  },

  updateImagePreview(url) {
    const preview = document.getElementById('productImagePreview');
    if (preview) {
      preview.src = url || 'assets/images/logo.png';
    }
  },

  setPresetImage(type) {
    const input = document.getElementById('productImage');
    if (input && this.presetImages[type]) {
      input.value = this.presetImages[type];
      this.updateImagePreview(this.presetImages[type]);
    }
  },

  handleImageFileUpload(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      if (typeof DarbarApp !== 'undefined') {
        DarbarApp.showToast('فائل کا سائز 5MB سے کم ہونا چاہیے!', 'error');
      }
      return;
    }

    const reader = new FileReader();
    reader.onload = (loadEvt) => {
      const dataUrl = loadEvt.target.result;
      const input = document.getElementById('productImage');
      if (input) input.value = dataUrl;
      this.updateImagePreview(dataUrl);
      const statusText = document.getElementById('uploadStatusText');
      if (statusText) statusText.textContent = `✔ ${file.name} تیار ہے!`;
      if (typeof DarbarApp !== 'undefined') {
        DarbarApp.showToast('تصویر کامیابی سے لوڈ ہو گئی!');
      }
    };
    reader.readAsDataURL(file);
  },

  handleProductFormSubmit(e) {
    e.preventDefault();
    const editId = document.getElementById('editProductId').value;
    const titleEn = document.getElementById('productTitleEn').value.trim();
    const titleUr = document.getElementById('productTitleUr').value.trim();
    const category = document.getElementById('productCategory').value;
    const badge = document.getElementById('productBadge').value.trim();
    const basePrice = parseInt(document.getElementById('productDefaultPrice').value, 10) || 200;
    const originalPrice = parseInt(document.getElementById('productOriginalPrice').value, 10) || Math.round(basePrice * 1.2);
    const image = document.getElementById('productImage').value.trim() || this.presetImages.biryani;
    const shortDesc = document.getElementById('productShortDesc').value.trim();
    const inStock = document.getElementById('productInStock').checked;
    const isFeatured = document.getElementById('productIsFeatured').checked;

    // Category Name lookup
    const catNames = {
      'special-masalay': 'Recipes Cooking',
      'fries-masalay': 'Fries & Snacks',
      'spice-powders': 'Pure Ground Powders',
      'chaat-masalay': 'Royal Chaat Masalay',
      'sauces': 'Gourmet Sauces & Mayos',
      'deals': 'Mega Saver Deals'
    };

    // Weight variations array
    const r100 = parseInt(document.getElementById('weightRate100').value, 10) || basePrice;
    const r250 = parseInt(document.getElementById('weightRate250').value, 10) || Math.round(basePrice * 2.3);
    const r500 = parseInt(document.getElementById('weightRate500').value, 10) || Math.round(basePrice * 4.3);
    const r1000 = parseInt(document.getElementById('weightRate1000').value, 10) || Math.round(basePrice * 8.2);

    const weightOptions = [
      { weight: '100g Pouch', price: r100, originalPrice: Math.round(r100 * 1.2) },
      { weight: '250g Jar', price: r250, originalPrice: Math.round(r250 * 1.2) },
      { weight: '500g Commercial', price: r500, originalPrice: Math.round(r500 * 1.2) },
      { weight: '1kg Bulk Pack', price: r1000, originalPrice: Math.round(r1000 * 1.2) }
    ];

    const productPayload = {
      title: titleEn,
      urduTitle: titleUr,
      category: category,
      categoryName: catNames[category] || 'Spices',
      badge: badge,
      defaultPrice: basePrice,
      defaultOriginalPrice: originalPrice,
      weightOptions: weightOptions,
      image: image,
      gallery: [image],
      shortDesc: shortDesc || `Authentic freshly-milled ${titleEn} crafted by Darbar Flavors Spices.`,
      urduShortDesc: shortDesc || 'دربار فلیورز کی اصل اور روایتی تیاری۔ 100% خالص اور ملاوٹ سے پاک۔',
      inStock: inStock,
      isFeatured: isFeatured,
      rating: 4.8,
      reviewsCount: 32
    };

    if (editId) {
      DarbarData.updateProduct(editId, productPayload);
      if (typeof DarbarApp !== 'undefined') {
        DarbarApp.showToast(`مصالحہ "${titleEn}" کامیابی سے اپ ڈیٹ ہو گیا!`);
      }
    } else {
      DarbarData.addProduct(productPayload);
      if (typeof DarbarApp !== 'undefined') {
        DarbarApp.showToast(`نیا مصالحہ "${titleEn}" کامیابی سے شامل ہو گیا!`);
      }
    }

    this.closeProductModal();
    this.renderProductsTable();
    this.renderMetrics();
    this.renderInventoryTable();

    // Auto sync to Firebase
    const cfg = DarbarData.getStoreConfig();
    if (cfg && cfg.cloudSyncUrl) {
      this.pushToCloud(false);
    }
  },

  deleteProduct(id) {
    const product = DarbarData.getProductById(id);
    const title = product ? product.title : id;
    if (!confirm(`کیا آپ واقعی "${title}" کو کیٹلاگ سے حذف (Delete) کرنا چاہتے ہیں؟`)) return;

    DarbarData.deleteProduct(id);
    this.renderProductsTable();
    this.renderMetrics();
    this.renderInventoryTable();

    // Auto sync to Firebase
    const cfg = DarbarData.getStoreConfig();
    if (cfg && cfg.cloudSyncUrl) {
      this.pushToCloud(false);
    }

    if (typeof DarbarApp !== 'undefined') {
      DarbarApp.showToast(`مصالحہ "${title}" ڈیلیٹ کر دیا گیا۔`);
    }
  },

  exportProductsJSON() {
    const products = DarbarData.getProducts();
    const blob = new Blob([JSON.stringify(products, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `darbar_products_${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    if (typeof DarbarApp !== 'undefined') {
      DarbarApp.showToast('کیٹلاگ ڈیٹا کی فائل ڈاؤن لوڈ ہو گئی!');
    }
  },

  resetCatalogToFactory() {
    if (!confirm('کیا آپ تمام ترامیم ختم کر کے اصل 92 مصالحہ جات کو بحال (Reset) کرنا چاہتے ہیں؟')) return;
    DarbarData.resetAll();
    this.renderProductsTable();
    this.renderMetrics();
    this.renderReviews();
    this.loadStoreSettings();
    this.renderInventoryTable();
    if (typeof DarbarApp !== 'undefined') {
      DarbarApp.showToast('کیٹلاگ فیکٹری سیٹنگ پر بحال ہو گیا!');
    }
  },

  // ==============================================================
  // TAB 3: CUSTOMER REVIEWS CRUD
  // ==============================================================
  renderReviews() {
    const container = document.getElementById('adminReviewsGrid');
    if (!container || typeof DarbarData === 'undefined') return;

    const reviews = DarbarData.getReviews();

    if (reviews.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #888;">
          No customer reviews yet. Click "Add Customer Review" to publish authentic feedback.
        </div>
      `;
      return;
    }

    container.innerHTML = reviews.map(rev => {
      const stars = Array.from({ length: 5 }, (_, i) => 
        `<i class="fa-solid fa-star" style="color: ${i < rev.rating ? '#F59E0B' : '#D1D5DB'}; margin-right: 2px;"></i>`
      ).join('');

      return `
        <div class="review-admin-card">
          <div>
            <div class="review-admin-stars">
              ${stars}
            </div>
            <div class="review-admin-text font-urdu">
              "${rev.text}"
            </div>
          </div>
          <div class="review-admin-author">
            <div>
              <div style="font-weight: 700; color: #111;">${rev.name}</div>
              <div style="font-size: 0.8rem; color: #777;">${rev.city}</div>
            </div>
            <div style="display: flex; gap: 6px;">
              <button class="action-icon-btn" onclick="DarbarAdmin.openEditReviewModal('${rev.id}')" title="Edit Review">
                <i class="fa-solid fa-pen"></i>
              </button>
              <button class="action-icon-btn btn-delete" onclick="DarbarAdmin.deleteReview('${rev.id}')" title="Delete Review">
                <i class="fa-solid fa-trash-can"></i>
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  },

  openAddReviewModal() {
    const modal = document.getElementById('adminReviewModal');
    const form = document.getElementById('reviewForm');
    const titleEl = document.getElementById('reviewModalTitle');
    if (!modal || !form) return;

    form.reset();
    document.getElementById('editReviewId').value = '';
    document.getElementById('reviewRating').value = '5';
    if (titleEl) titleEl.innerHTML = '<i class="fa-solid fa-comment-dots" style="color: var(--admin-gold);"></i> Add Real Customer Review';

    modal.classList.add('active');
  },

  openEditReviewModal(id) {
    const reviews = DarbarData.getReviews();
    const rev = reviews.find(r => r.id === id);
    if (!rev) return;

    const modal = document.getElementById('adminReviewModal');
    const titleEl = document.getElementById('reviewModalTitle');
    if (!modal) return;

    document.getElementById('editReviewId').value = rev.id;
    document.getElementById('reviewAuthor').value = rev.name || '';
    document.getElementById('reviewCity').value = rev.city || '';
    document.getElementById('reviewRating').value = String(rev.rating || 5);
    document.getElementById('reviewText').value = rev.text || '';

    if (titleEl) titleEl.innerHTML = `<i class="fa-solid fa-pen" style="color: var(--admin-gold);"></i> Edit Customer Review`;

    modal.classList.add('active');
  },

  closeReviewModal() {
    const modal = document.getElementById('adminReviewModal');
    if (modal) modal.classList.remove('active');
  },

  handleReviewFormSubmit(e) {
    e.preventDefault();
    const editId = document.getElementById('editReviewId').value;
    const author = document.getElementById('reviewAuthor').value.trim();
    const city = document.getElementById('reviewCity').value.trim();
    const rating = parseInt(document.getElementById('reviewRating').value, 10) || 5;
    const text = document.getElementById('reviewText').value.trim();

    const reviewPayload = {
      name: author,
      city: city,
      rating: rating,
      text: text,
      avatar: author.charAt(0)
    };

    if (editId) {
      DarbarData.updateReview(editId, reviewPayload);
      if (typeof DarbarApp !== 'undefined') {
        DarbarApp.showToast(`ریویو کامیابی سے اپ ڈیٹ ہو گیا!`);
      }
    } else {
      DarbarData.addReview(reviewPayload);
      if (typeof DarbarApp !== 'undefined') {
        DarbarApp.showToast(`نیا کسٹمر ریویو کامیابی سے شامل ہو گیا!`);
      }
    }

    this.closeReviewModal();
    this.renderReviews();
    this.renderMetrics();
  },

  deleteReview(id) {
    if (!confirm('کیا آپ واقعی یہ ریویو ڈیلیٹ کرنا چاہتے ہیں؟')) return;
    DarbarData.deleteReview(id);
    this.renderReviews();
    this.renderMetrics();
    if (typeof DarbarApp !== 'undefined') {
      DarbarApp.showToast('ریویو حذف کر دیا گیا۔');
    }
  },

  // ==============================================================
  // TAB 4: STORE SETTINGS & LOCATION
  // ==============================================================
  loadStoreSettings() {
    if (typeof DarbarData === 'undefined') return;
    const cfg = DarbarData.getStoreConfig();

    const elBrandEn = document.getElementById('storeBrandName');
    const elBrandUr = document.getElementById('storeBrandUrdu');
    const elAddress = document.getElementById('storeAddress');
    const elMaps = document.getElementById('storeMapsUrl');
    const elEmail = document.getElementById('storeEmail');
    const elPhone = document.getElementById('storePhoneDisplay');
    const elWa = document.getElementById('storeWhatsapp');
    const elPin = document.getElementById('adminPinCode');
    const elCloudUrl = document.getElementById('cloudSyncUrl');
    const elCloudKey = document.getElementById('cloudApiKey');

    if (elBrandEn) elBrandEn.value = cfg.brandName || 'Darbar Flavors Spices';
    if (elBrandUr) elBrandUr.value = cfg.brandUrdu || 'دربار فلیورز اسپائسز';
    if (elAddress) elAddress.value = cfg.address || 'Murad Khan Rd, Lyari Town, Karachi, Sindh 72500';
    if (elMaps) elMaps.value = cfg.mapsUrl || 'https://maps.google.com/maps?q=Darbar%2BFlavour%2Band%2Bspices%2BMurad%2BKhan%2BRd%2C%2B%D9%84%DB%8C%D8%A7%D8%B1%DB%8C%2B%D9%B9%D8%A7%D8%A4%D9%86%2C%2B72500%2C%2B%D8%B3%D9%86%D8%AF%DA%BE%2C%2BPK&sll=24.85600548,67.00295892';
    if (elEmail) elEmail.value = cfg.email || 'darbar.flavours03@gmail.com';
    if (elPhone) elPhone.value = cfg.phoneDisplay || '+92 310 2465004';
    if (elWa) elWa.value = cfg.whatsappNumber || '+923102465004';
    if (elPin) elPin.value = '••••••••';
    if (elCloudUrl) elCloudUrl.value = cfg.cloudSyncUrl || '';
    if (elCloudKey) elCloudKey.value = cfg.cloudApiKey || '';
  },

  saveStoreSettings(e) {
    if (e && e.preventDefault) e.preventDefault();

    const existingCfg = (typeof DarbarData !== 'undefined') ? DarbarData.getStoreConfig() : {};
    const customPin = (typeof localStorage !== 'undefined') ? localStorage.getItem('darbar_custom_pin') : null;
    const activePin = (existingCfg && existingCfg.adminPin) ? existingCfg.adminPin : (customPin || 'darbar2026');

    const newCfg = {
      brandName: document.getElementById('storeBrandName').value.trim(),
      brandUrdu: document.getElementById('storeBrandUrdu').value.trim(),
      address: document.getElementById('storeAddress').value.trim(),
      mapsUrl: document.getElementById('storeMapsUrl').value.trim(),
      email: document.getElementById('storeEmail').value.trim(),
      phoneDisplay: document.getElementById('storePhoneDisplay').value.trim(),
      whatsappNumber: document.getElementById('storeWhatsapp').value.trim(),
      adminPin: activePin,
      cloudSyncUrl: document.getElementById('cloudSyncUrl') ? document.getElementById('cloudSyncUrl').value.trim() : '',
      cloudApiKey: document.getElementById('cloudApiKey') ? document.getElementById('cloudApiKey').value.trim() : ''
    };

    DarbarData.saveStoreConfig(newCfg);
    if (typeof DarbarApp !== 'undefined' && DarbarApp.syncStoreInfoDOM) {
      DarbarApp.syncStoreInfoDOM();
    }
    if (newCfg.cloudSyncUrl) {
      this.pushToCloud(false);
    }
    if (typeof DarbarApp !== 'undefined') {
      DarbarApp.showToast('دکان کی معلومات و کلاؤڈ سیٹنگز محفوظ ہو گئیں!');
    }
  },

  // ==============================================================
  // CHANGE SECURITY PIN CONTROLLER (سیکیورٹی پن تبدیل کرنے کا مکمل نظام)
  // ==============================================================
  openChangePinModal() {
    const modal = document.getElementById('adminChangePinModal');
    if (!modal) return;
    const alertBox = document.getElementById('changePinAlert');
    if (alertBox) alertBox.style.display = 'none';
    const cur = document.getElementById('modalCurrentPin');
    const np = document.getElementById('modalNewPin');
    const cp = document.getElementById('modalConfirmPin');
    if (cur) cur.value = '';
    if (np) np.value = '';
    if (cp) cp.value = '';
    modal.classList.add('active');
  },

  closeChangePinModal() {
    const modal = document.getElementById('adminChangePinModal');
    if (modal) modal.classList.remove('active');
  },

  toggleFieldVisibility(fieldId, iconId) {
    const input = document.getElementById(fieldId);
    const icon = document.getElementById(iconId);
    if (!input) return;
    if (input.type === 'password') {
      input.type = 'text';
      if (icon) icon.className = 'fa-regular fa-eye-slash';
    } else {
      input.type = 'password';
      if (icon) icon.className = 'fa-regular fa-eye';
    }
  },

  async handleChangePinSubmit(e) {
    if (e && e.preventDefault) e.preventDefault();
    const curPin = (document.getElementById('modalCurrentPin') ? document.getElementById('modalCurrentPin').value : '').trim();
    const newPin = (document.getElementById('modalNewPin') ? document.getElementById('modalNewPin').value : '').trim();
    const confirmPin = (document.getElementById('modalConfirmPin') ? document.getElementById('modalConfirmPin').value : '').trim();
    const alertBox = document.getElementById('changePinAlert');

    const showAlert = (msg, isSuccess = false) => {
      if (!alertBox) return;
      alertBox.style.display = 'block';
      alertBox.style.background = isSuccess ? 'rgba(46, 204, 113, 0.15)' : 'rgba(231, 76, 60, 0.15)';
      alertBox.style.border = isSuccess ? '1px solid #2ECC71' : '1px solid #E74C3C';
      alertBox.style.color = isSuccess ? '#2ECC71' : '#E74C3C';
      alertBox.innerHTML = `${isSuccess ? '<i class="fa-solid fa-circle-check"></i>' : '<i class="fa-solid fa-circle-exclamation"></i>'} ${msg}`;
    };

    const cfg = (typeof DarbarData !== 'undefined') ? DarbarData.getStoreConfig() : {};
    const customPin = (typeof localStorage !== 'undefined') ? localStorage.getItem('darbar_custom_pin') : null;
    const activePin = (cfg && cfg.adminPin) ? cfg.adminPin : (customPin || 'darbar2026');

    if (curPin !== activePin) {
      showAlert('موجودہ سیکیورٹی پن غلط ہے! براہ کرم درست پن درج کریں۔', false);
      return;
    }

    if (!newPin || newPin.length < 4) {
      showAlert('نیا سیکیورٹی پن کم از کم 4 ہندسوں یا حروف پر مشتمل ہونا چاہیے۔', false);
      return;
    }

    if (newPin !== confirmPin) {
      showAlert('نیا پن اور تصدیقی پن آپس میں نہیں ملتے! دوبارہ چیک کریں۔', false);
      return;
    }

    // Save new PIN locally and into store configuration
    cfg.adminPin = newPin;
    DarbarData.saveStoreConfig(cfg);
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem('darbar_custom_pin', newPin);
      } catch (err) {}
    }

    const pinInput = document.getElementById('adminPinCode');
    if (pinInput) pinInput.value = '••••••••';

    // Auto sync new PIN to Firebase Realtime Database
    if (cfg && cfg.cloudSyncUrl) {
      await this.pushToCloud(false);
    }

    showAlert('سیکیورٹی پن کامیابی سے تبدیل ہو گیا ہے! کلاؤڈ ڈیٹا بیس پر بھی اپڈیٹ ہو گیا۔', true);

    setTimeout(() => {
      this.closeChangePinModal();
      if (typeof DarbarApp !== 'undefined') {
        DarbarApp.showToast('🎉 نیا سیکیورٹی پن محفوظ ہو گیا۔ آئندہ اس نئے پن سے لاگ ان کریں۔');
      }
    }, 1200);
  },

  async pushToCloud(notify = true) {
    const cfg = DarbarData.getStoreConfig();
    const url = document.getElementById('cloudSyncUrl') ? document.getElementById('cloudSyncUrl').value.trim() : cfg.cloudSyncUrl;
    const apiKey = document.getElementById('cloudApiKey') ? document.getElementById('cloudApiKey').value.trim() : cfg.cloudApiKey;

    if (!url) {
      if (notify) alert('براہ کرم کلاؤڈ اینڈ پوائنٹ کا URL درج فرمائیں۔ (Please enter your Cloud API URL)');
      return;
    }

    const payload = {
      products: DarbarData.getProducts(),
      reviews: DarbarData.getReviews(),
      storeConfig: cfg,
      updatedAt: new Date().toISOString()
    };

    try {
      let pushUrl = url;
      // Normalize Firebase URL: ensure .json suffix
      if (pushUrl.includes('firebaseio.com')) {
        const urlObj = new URL(pushUrl);
        if (!urlObj.pathname.endsWith('.json')) {
          urlObj.pathname = urlObj.pathname.replace(/\/$/, '') + '/darbar_store.json';
        }
        if (apiKey && !urlObj.searchParams.has('auth')) {
          urlObj.searchParams.set('auth', apiKey);
        }
        pushUrl = urlObj.toString();
      }

      const headers = { 'Content-Type': 'application/json' };
      if (apiKey && !pushUrl.includes('firebaseio.com')) {
        headers['X-Master-Key'] = apiKey;
        headers['Authorization'] = `Bearer ${apiKey}`;
      }

      const res = await fetch(pushUrl, {
        method: 'PUT',
        headers: headers,
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const badge = document.getElementById('cloudStatusBadge');
        if (badge) {
          badge.textContent = 'Cloud / Firebase Synced Live';
          badge.className = 'status-badge status-delivered';
        }
        if (notify && typeof DarbarApp !== 'undefined') {
          DarbarApp.showToast('✨ فائر بیس / کلاؤڈ پر تمام تبدیلیاں سیکنڈوں میں لائیو لاگو ہو گئیں!');
        }
      } else {
        throw new Error('Server responded with status ' + res.status);
      }
    } catch (err) {
      console.warn('Cloud sync note:', err);
      if (notify) {
        alert('کلاؤڈ سنک اطلاع: ڈیٹا لوکل محفوظ ہو چکا ہے!\nفائر بیس / کلاؤڈ پر بھیجنے کے لیے انٹرنیٹ کنکشن اور درست اینڈ پوائنٹ URL چیک فرمائیں۔\n' + err.message);
      }
    }
  },

  // ==============================================================
  // TAB 2: ORDERS MANAGEMENT
  // ==============================================================
  getOrders() {
    return (typeof SafeStorage !== 'undefined')
      ? SafeStorage.getJSON('darbar_orders', [])
      : [];
  },

  saveOrders(orders) {
    if (typeof SafeStorage !== 'undefined') {
      SafeStorage.setJSON('darbar_orders', orders);
    }
    this.renderMetrics();
    this.renderOrdersTable();
  },

  renderOrdersTable() {
    const tbody = document.getElementById('ordersTableBody');
    if (!tbody) return;

    let orders = this.getOrders();

    if (this.orderStatusFilter !== 'all') {
      orders = orders.filter(o => o.status && o.status.toLowerCase() === this.orderStatusFilter.toLowerCase());
    }

    if (this.orderSearchQuery) {
      const q = this.orderSearchQuery.toLowerCase();
      orders = orders.filter(o =>
        (o.orderId && o.orderId.toLowerCase().includes(q)) ||
        (o.customer.fullName && o.customer.fullName.toLowerCase().includes(q)) ||
        (o.customer.phone && o.customer.phone.includes(q)) ||
        (o.customer.city && o.customer.city.toLowerCase().includes(q))
      );
    }

    if (orders.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center; padding: 40px; color: #888;">
            <i class="fa-solid fa-receipt" style="font-size: 2rem; color: #CCC; margin-bottom: 8px; display: block;"></i>
            No orders found matching filters.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = orders.map(order => {
      const itemsList = order.items.map(item => 
        `<div>• <strong>${item.title}</strong> (${item.weight}) × ${item.quantity} = Rs. ${(item.price * item.quantity).toLocaleString()}</div>`
      ).join('');

      const cleanPhone = (order.customer.whatsapp || order.customer.phone || '').replace(/[^0-9]/g, '');
      const waLink = `https://wa.me/${cleanPhone}?text=Hello%20${encodeURIComponent(order.customer.fullName)},%20regarding%20your%20Darbar%20Flavors%20Spices%20order%20%23${order.orderId}`;

      const statusOptions = ['Pending', 'Confirmed', 'Dispatched', 'Delivered', 'Cancelled'].map(st => 
        `<option value="${st}" ${order.status === st ? 'selected' : ''}>${st}</option>`
      ).join('');

      return `
        <tr>
          <td>
            <div style="font-weight: 700; color: var(--admin-red); font-size: 0.95rem;">#${order.orderId}</div>
            <div style="font-size: 0.76rem; color: #777; margin-top: 2px;">${order.date || 'Today'}</div>
          </td>
          <td>
            <div style="font-weight: 700; color: #111;">${order.customer.fullName}</div>
            <div style="font-size: 0.82rem; color: #555;">${order.customer.city}</div>
            <div style="font-size: 0.78rem; color: #777; max-width: 220px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${order.customer.address}</div>
          </td>
          <td>
            <div style="font-size: 0.85rem; font-weight: 600;">${order.customer.phone}</div>
            <a href="${waLink}" target="_blank" class="btn-wa-chat" style="margin-top: 4px;">
              <i class="fa-brands fa-whatsapp"></i> Chat
            </a>
          </td>
          <td style="font-size: 0.84rem; line-height: 1.5; max-width: 280px;">
            ${itemsList}
          </td>
          <td>
            <strong style="font-size: 1rem; color: #111;">Rs. ${order.total.toLocaleString()}</strong>
            <div style="font-size: 0.75rem; color: #666; margin-top: 2px;">${order.paymentMethod}</div>
          </td>
          <td>
            <select class="status-select" onchange="DarbarAdmin.updateOrderStatus('${order.orderId}', this.value)">
              ${statusOptions}
            </select>
          </td>
          <td>
            <div style="display: flex; gap: 6px; align-items: center;">
              <button class="btn-receipt-action" onclick="DarbarAdmin.openInvoiceModal('${order.orderId}')" title="رسید و سلپ بنائیں (Generate B&W Receipt Slip)">
                <i class="fa-solid fa-receipt"></i> رسید / سلپ
              </button>
              <button class="action-icon-btn btn-delete" onclick="DarbarAdmin.deleteOrder('${order.orderId}')" title="Delete Order">
                <i class="fa-solid fa-trash-can"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  },

  updateOrderStatus(orderId, newStatus) {
    const orders = this.getOrders();
    const order = orders.find(o => o.orderId === orderId);
    if (order) {
      order.status = newStatus;
      this.saveOrders(orders);
      if (typeof DarbarApp !== 'undefined') {
        DarbarApp.showToast(`Order #${orderId} status updated to "${newStatus}"!`);
      }
    }
  },

  deleteOrder(orderId) {
    if (!confirm(`Are you sure you want to delete order #${orderId}?`)) return;
    let orders = this.getOrders();
    orders = orders.filter(o => o.orderId !== orderId);
    this.saveOrders(orders);
    if (typeof DarbarApp !== 'undefined') {
      DarbarApp.showToast(`Order #${orderId} deleted.`);
    }
  },

  generateDemoOrders(notify = true) {
    const demoOrders = [
      {
        orderId: 'DFS-74829',
        customer: {
          fullName: 'Tariq Mehmood',
          phone: '03001234567',
          whatsapp: '03001234567',
          city: 'Lahore',
          address: 'House #42-B, Sector C, Bahria Town',
          notes: 'Please deliver after 2 PM'
        },
        items: [
          { title: 'Special Degi Biryani Masala', urduTitle: 'اسپیشل دیگی بریانی مصالحہ', weight: '250g Jar', price: 506, quantity: 2 },
          { title: 'Pure Turmeric Powder', urduTitle: 'خالص ہلدی پاؤڈر', weight: '100g Pouch', price: 180, quantity: 1 }
        ],
        subtotal: 1192,
        shipping: 200,
        total: 1392,
        paymentMethod: 'Cash on Delivery',
        status: 'Confirmed',
        date: 'Today, 11:30 AM'
      },
      {
        orderId: 'DFS-91834',
        customer: {
          fullName: 'Sobia Farooq',
          phone: '03219876543',
          whatsapp: '03219876543',
          city: 'Karachi',
          address: 'Flat 402, Al-Razi Heights, Gulshan-e-Iqbal Block 13',
          notes: 'Ring the bell twice'
        },
        items: [
          { title: 'Royal Dawat Deal', urduTitle: 'شاہی دعوت پیکیج (5 مصالحے)', weight: 'Pack of 5 (100g each)', price: 899, quantity: 1 },
          { title: 'Special Delhi Nehari Masala', urduTitle: 'اسپیشل دہلی نہاری مصالحہ', weight: '100g Pouch', price: 240, quantity: 2 },
          { title: 'Peri Peri Fries Seasoning', urduTitle: 'پیری پیری فرائز مصالحہ', weight: '100g Pouch', price: 200, quantity: 1 }
        ],
        subtotal: 1579,
        shipping: 200,
        total: 1779,
        paymentMethod: 'Bank Transfer / JazzCash',
        status: 'Pending',
        date: 'Today, 09:15 AM'
      },
      {
        orderId: 'DFS-63012',
        customer: {
          fullName: 'Malik Zeeshan',
          phone: '03335551234',
          whatsapp: '03335551234',
          city: 'Islamabad',
          address: 'Street 14, F-10/2, Near Markaz',
          notes: 'Urgent delivery required'
        },
        items: [
          { title: 'Kitchen Essentials Daily Rashan Deal', urduTitle: 'کچن راشن ڈیل', weight: '250g Each (Total 1kg)', price: 1399, quantity: 2 }
        ],
        subtotal: 2798,
        shipping: 0,
        total: 2798,
        paymentMethod: 'Cash on Delivery',
        status: 'Dispatched',
        date: 'Yesterday, 04:45 PM'
      }
    ];

    if (typeof SafeStorage !== 'undefined') {
      SafeStorage.setJSON('darbar_orders', demoOrders);
    }
    this.renderMetrics();
    this.renderOrdersTable();
    if (notify && typeof DarbarApp !== 'undefined') {
      DarbarApp.showToast('Sample test orders generated successfully!');
    }
  },

  openInvoiceModal(orderId) {
    const orders = this.getOrders();
    const order = orders.find(o => o.orderId === orderId);
    if (!order) return;

    const modalBody = document.getElementById('invoiceModalContent');
    const modalOverlay = document.getElementById('adminInvoiceModal');
    if (!modalBody || !modalOverlay) return;

    const cfg = DarbarData.getStoreConfig();
    const brandName = cfg.brandName || 'DARBAR FLAVORS SPICES';
    const brandUrdu = cfg.brandUrdu || 'دربار فلیورز اسپائسز';
    const storeAddress = cfg.address || 'Murad Khan Rd, Lyari Town, Karachi, Sindh 72500';
    const storePhone = cfg.phoneDisplay || '+92 310 2465004';
    const storeEmail = cfg.email || 'darbar.flavours03@gmail.com';

    let totalItems = 0;
    let totalQty = 0;

    const itemsRows = order.items.map((item, idx) => {
      totalItems += 1;
      totalQty += (item.quantity || 1);
      const rowTotal = item.price * item.quantity;
      return `
        <tr>
          <td style="text-align: center; font-weight: 700;">${idx + 1}</td>
          <td>
            <div style="font-weight: 800; font-size: 0.9rem; color: #000;">${item.title}</div>
            <div style="font-size: 0.82rem; color: #333;" class="font-urdu">${item.urduTitle || ''}</div>
          </td>
          <td>${item.weight}</td>
          <td style="text-align: right;">Rs. ${item.price.toLocaleString()}</td>
          <td style="text-align: center; font-weight: 700;">${item.quantity}</td>
          <td style="text-align: right; font-weight: 800;">Rs. ${rowTotal.toLocaleString()}</td>
        </tr>
      `;
    }).join('');

    modalBody.innerHTML = `
      <!-- TOP ACTION TOOLBAR (Hidden in Print & Screenshot) -->
      <div class="receipt-toolbar receipt-no-print">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-weight: 800; color: #111; font-size: 0.95rem;">
            <i class="fa-solid fa-receipt" style="color: var(--admin-gold);"></i> آرڈر سلپ و رسید (#${order.orderId})
          </span>
          <span style="background: #000; color: #FFF; padding: 2px 8px; border-radius: 4px; font-size: 0.72rem; font-weight: 700; letter-spacing: 0.5px;">B&amp;W PRINT READY</span>
        </div>
        <div class="receipt-actions-group">
          <!-- Print & Save as PDF -->
          <button type="button" class="btn-tool btn-tool-primary" onclick="DarbarAdmin.printReceipt()" style="background: #000; color: #FFF; border-color: #000; font-weight: 700;" title="پرنٹ کریں یا پی ڈی ایف محفوظ کریں">
            <i class="fa-solid fa-print"></i> پرنٹ / PDF
          </button>

          <!-- Download as Image (PNG) -->
          <button type="button" class="btn-tool btn-tool-secondary" onclick="DarbarAdmin.downloadReceiptImage('${order.orderId}')" style="background: #F3F4F6; color: #111; border: 1.5px solid #000; font-weight: 700;" title="سلپ کی تصویر ڈاؤن لوڈ کریں">
            <i class="fa-solid fa-image"></i> تصویر ڈاؤن لوڈ کریں (PNG)
          </button>

          <!-- Send Directly on WhatsApp -->
          <button type="button" class="btn-tool btn-tool-success" onclick="DarbarAdmin.sendReceiptToWhatsApp('${order.orderId}')" style="background: #25D366; color: #FFF; border: none; font-weight: 700;" title="گاہک کے واٹس ایپ پر سلپ بھیجیں">
            <i class="fa-brands fa-whatsapp"></i> واٹس ایپ پر بھیجیں
          </button>

          <!-- Close Modal -->
          <button type="button" class="btn-tool btn-tool-secondary" onclick="DarbarAdmin.closeInvoiceModal()" style="border-color: #DDD;">
            <i class="fa-solid fa-xmark"></i> بند کریں
          </button>
        </div>
      </div>

      <!-- ============================================================== -->
      <!-- OFFICIAL BLACK & WHITE RECEIPT / CASH MEMO SLIP -->
      <!-- ============================================================== -->
      <div id="darbarReceiptSlip" class="receipt-slip-container">
        
        <!-- HEADER (Logo, Brand Title, Slip Type) -->
        <div class="receipt-slip-header">
          <img src="assets/images/logo.png" alt="Darbar Logo" class="receipt-slip-logo" onerror="this.style.display='none'">
          <h1 class="receipt-brand-title">${brandName}</h1>
          <div class="receipt-brand-urdu">${brandUrdu}</div>
          <div style="font-size: 0.75rem; letter-spacing: 1px; color: #333; margin-top: 2px;">
            100% PURE FRESHLY-MILLED ORGANIC SPICES • TRADITIONAL TASTE
          </div>
          <div>
            <span class="receipt-type-banner">OFFICIAL SALES MEMO &amp; CASH RECEIPT / کیش سلپ</span>
          </div>
        </div>

        <!-- ORDER & CUSTOMER METADATA -->
        <div class="receipt-meta-grid">
          <div class="receipt-meta-box">
            <div><strong>RECEIPT NO:</strong> #${order.orderId}</div>
            <div><strong>DATE &amp; TIME:</strong> ${order.date || 'Today'}</div>
            <div><strong>PAYMENT:</strong> ${order.paymentMethod || 'Cash on Delivery'}</div>
            <div><strong>STATUS:</strong> ${order.status || 'Confirmed'}</div>
          </div>
          <div class="receipt-meta-box" style="text-align: right;">
            <div><strong>CUSTOMER:</strong> ${order.customer.fullName}</div>
            <div><strong>CONTACT:</strong> ${order.customer.phone}</div>
            <div><strong>CITY:</strong> ${order.customer.city}</div>
            <div><strong>ADDRESS:</strong> ${order.customer.address}</div>
          </div>
        </div>

        <!-- ITEMS BREAKDOWN TABLE (Black & White Table) -->
        <table class="receipt-table">
          <thead>
            <tr>
              <th style="width: 32px; text-align: center;">#</th>
              <th>ITEM DESCRIPTION (تفصیل مصالحہ جات)</th>
              <th>PACK WEIGHT</th>
              <th style="text-align: right;">RATE</th>
              <th style="text-align: center;">QTY</th>
              <th style="text-align: right;">AMOUNT (RS.)</th>
            </tr>
          </thead>
          <tbody>
            ${itemsRows}
          </tbody>
        </table>

        <!-- TOTALS & CALCULATION -->
        <div class="receipt-calculation">
          <table class="receipt-calc-table">
            <tr>
              <td>Subtotal (خام رقم):</td>
              <td style="text-align: right; font-weight: 700;">Rs. ${order.subtotal.toLocaleString()}</td>
            </tr>
            <tr>
              <td>Delivery / Courier:</td>
              <td style="text-align: right;">${order.shipping === 0 ? 'مفت (Free Deal)' : 'Rs. ' + order.shipping}</td>
            </tr>
            <tr class="receipt-total-row">
              <td>GRAND TOTAL (کل رقم):</td>
              <td style="text-align: right;">Rs. ${order.total.toLocaleString()}</td>
            </tr>
            <tr>
              <td colspan="2" style="text-align: right; font-size: 0.78rem; padding-top: 4px; color: #444;">
                Total Items: ${totalItems} | Total Quantity: ${totalQty} Units
              </td>
            </tr>
          </table>
        </div>

        <!-- FOOTER (Store Address, Phone, Barcode, Thank You) -->
        <div class="receipt-footer-section">
          <div class="receipt-barcode">|||| | ||||| || |||||| |||| | |||||</div>
          <div style="font-size: 0.8rem; letter-spacing: 2px; font-weight: 700; margin-bottom: 8px;">*${order.orderId}*</div>
          
          <div style="font-weight: 800; font-size: 0.95rem; margin-bottom: 2px;">
            دربار فلیورز اینڈ اسپائسز — DARBAR FLAVORS &amp; SPICES
          </div>
          <div>📍 <strong>دکان کا پتہ:</strong> ${storeAddress}</div>
          <div>📞 <strong>ہیلپ لائن و واٹس ایپ:</strong> ${storePhone} | ✉️ <strong>ای میل:</strong> ${storeEmail}</div>
          
          <div style="margin-top: 8px; font-weight: 700; font-size: 0.88rem;" class="font-urdu">
            ✨ اپنی چکی سے پسا ہوا 100% اصلی، اوریجنل و آرگینک مصالحہ جات!
          </div>
          <div style="font-size: 0.78rem; color: #333; margin-top: 4px;">
            خالص و روایتی ذائقے کا انتخاب کرنے کا شکریہ! — Thank you for choosing Darbar Flavors Spices!
          </div>
          <div style="font-size: 0.72rem; color: #555; margin-top: 4px;">
            کسی بھی استفسار یا معلومات کی صورت میں اس رسید نمبر کے ساتھ واٹس ایپ پر رابطہ فرمائیں۔
          </div>
        </div>

      </div>
    `;

    modalOverlay.classList.add('active');
  },

  printReceipt() {
    window.print();
  },

  downloadReceiptImage(orderId) {
    const slipEl = document.getElementById('darbarReceiptSlip');
    if (!slipEl) return;

    if (typeof html2canvas === 'undefined') {
      alert('تصویر تیار کرنے والا ٹول لوڈ ہو رہا ہے، براہ کرم ایک لمحہ بعد دوبارہ کلک فرمائیں۔');
      return;
    }

    if (typeof DarbarApp !== 'undefined') {
      DarbarApp.showToast('سلپ کی تصویر تیار ہو رہی ہے...', 'info');
    }

    html2canvas(slipEl, {
      scale: 2, // 2x crisp print resolution
      useCORS: true,
      backgroundColor: '#ffffff'
    }).then(canvas => {
      const link = document.createElement('a');
      link.download = `Darbar_Receipt_${orderId}.png`;
      link.href = canvas.toDataURL('image/png');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      if (typeof DarbarApp !== 'undefined') {
        DarbarApp.showToast(`سلپ کی تصویر ڈاؤن لوڈ ہو گئی! (${orderId})`);
      }
    }).catch(err => {
      console.error('Image capture error:', err);
      alert('تصویر ڈاؤن لوڈ کرنے میں مسئلہ پیش آیا۔ آپ "پرنٹ / PDF" کا بٹن استعمال کر سکتے ہیں۔');
    });
  },

  sendReceiptToWhatsApp(orderId) {
    const orders = this.getOrders();
    const order = orders.find(o => o.orderId === orderId);
    if (!order) return;

    const cleanPhone = (order.customer.whatsapp || order.customer.phone || '').replace(/[^0-9]/g, '');
    const phoneWithCountry = cleanPhone.startsWith('92') ? cleanPhone : ('92' + cleanPhone.replace(/^0/, ''));

    const itemsSummary = order.items.map((item, idx) => 
      `${idx + 1}. *${item.title}* (${item.urduTitle || ''})\n   - پیک: ${item.weight} | تعداد: ${item.quantity}\n   - قیمت: Rs. ${(item.price * item.quantity).toLocaleString()}`
    ).join('\n\n');

    const message = 
      `*🧾 DARBAR FLAVORS SPICES - OFFICIAL RECEIPT*\n` +
      `*دربار فلیورز اسپائسز - آفیشل سیلز انوائس و کیش سلپ*\n` +
      `──────────────────────\n` +
      `📌 *آرڈر نمبر:* #${order.orderId}\n` +
      `📅 *تاریخ:* ${order.date || 'Today'}\n` +
      `👤 *گاہک کا نام:* ${order.customer.fullName}\n` +
      `📞 *فون نمبر:* ${order.customer.phone}\n` +
      `📍 *پتہ:* ${order.customer.city} (${order.customer.address})\n` +
      `──────────────────────\n` +
      `*🛒 منگوائی گئی اشیاء (Ordered Items):*\n\n` +
      `${itemsSummary}\n\n` +
      `──────────────────────\n` +
      `💰 *کل رقم (Grand Total):* Rs. ${order.total.toLocaleString()}\n` +
      `📦 *ڈلیوری:* ${order.shipping === 0 ? 'مفت (Free Deal)' : 'Rs. ' + order.shipping}\n` +
      `💵 *طریقہ ادائیگی:* ${order.paymentMethod}\n` +
      `──────────────────────\n` +
      `📍 *دکان کا پتہ:* Murad Khan Rd, Lyari Town, Karachi, Sindh 72500\n` +
      `📞 *ہیلپ لائن:* +92 310 2465004\n` +
      `✨ *خالص و روایتی ذائقے کا انتخاب کرنے کا شکریہ!*`;

    const waUrl = `https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');
  },

  closeInvoiceModal() {
    const modal = document.getElementById('adminInvoiceModal');
    if (modal) modal.classList.remove('active');
  },

  exportToCSV() {
    const orders = this.getOrders();
    if (orders.length === 0) {
      alert('No orders available to export.');
      return;
    }

    let csv = 'Order ID,Date,Customer Name,Phone,WhatsApp,City,Address,Total,Payment Method,Status\n';
    orders.forEach(o => {
      csv += `"${o.orderId}","${o.date || ''}","${o.customer.fullName}","${o.customer.phone}","${o.customer.whatsapp || ''}","${o.customer.city}","${o.customer.address.replace(/"/g, '""')}","${o.total}","${o.paymentMethod}","${o.status}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `darbar_orders_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  // ==============================================================
  // TAB 5: INVENTORY QUICK STATUS
  // ==============================================================
  renderInventoryTable() {
    const tbody = document.getElementById('inventoryTableBody');
    if (!tbody || typeof DarbarData === 'undefined') return;

    const products = DarbarData.getProducts();

    tbody.innerHTML = products.map(product => {
      const isAvailable = product.inStock !== false;
      return `
        <tr>
          <td>
            <img src="${product.image}" style="width: 48px; height: 48px; border-radius: 8px; object-fit: cover; border: 1px solid #DDD;">
          </td>
          <td>
            <strong>${product.title}</strong>
            <div class="font-urdu" style="color: #888; font-size: 0.85rem;">${product.urduTitle || ''}</div>
          </td>
          <td>${product.categoryName}</td>
          <td><strong>Rs. ${product.defaultPrice}</strong></td>
          <td>
            <span class="status-badge ${isAvailable ? 'status-delivered' : 'status-cancelled'}">
              ${isAvailable ? 'In Stock' : 'Out of Stock'}
            </span>
          </td>
          <td>
            <button class="btn-tool ${isAvailable ? 'btn-tool-secondary' : 'btn-tool-primary'}" onclick="DarbarAdmin.toggleStock('${product.id}')">
              ${isAvailable ? 'Mark Out of Stock' : 'Mark In Stock'}
            </button>
          </td>
        </tr>
      `;
    }).join('');
  },

  toggleStock(productId) {
    const product = DarbarData.getProductById(productId);
    if (!product) return;
    const newStatus = product.inStock === false ? true : false;
    DarbarData.updateProduct(productId, { inStock: newStatus });
    this.renderInventoryTable();
    this.renderProductsTable();

    // Auto sync to Firebase
    const cfg = DarbarData.getStoreConfig();
    if (cfg && cfg.cloudSyncUrl) {
      this.pushToCloud(false);
    }

    if (typeof DarbarApp !== 'undefined') {
      DarbarApp.showToast(`اسٹاک اسٹیٹس اپ ڈیٹ ہو گیا!`);
    }
  },

  // ==============================================================
  // EVENT LISTENERS & TAB CONTROLS
  // ==============================================================
  setupEventListeners() {
    // Tab switching
    document.querySelectorAll('.admin-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.admin-tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const tab = btn.getAttribute('data-tab');
        this.activeTab = tab;

        document.getElementById('productsSection').style.display = tab === 'products' ? 'block' : 'none';
        document.getElementById('ordersSection').style.display = tab === 'orders' ? 'block' : 'none';
        document.getElementById('reviewsSection').style.display = tab === 'reviews' ? 'block' : 'none';
        document.getElementById('storeSection').style.display = tab === 'store' ? 'block' : 'none';
        document.getElementById('inventorySection').style.display = tab === 'inventory' ? 'block' : 'none';
      });
    });

    // Product search
    const prodSearch = document.getElementById('adminProductSearch');
    if (prodSearch) {
      prodSearch.addEventListener('input', (e) => {
        this.productSearchQuery = e.target.value.trim();
        this.renderProductsTable();
      });
    }

    // Product category filter
    const catFilter = document.getElementById('adminCategoryFilter');
    if (catFilter) {
      catFilter.addEventListener('change', (e) => {
        this.productCategoryFilter = e.target.value;
        this.renderProductsTable();
      });
    }

    // Order status filter pills
    document.querySelectorAll('.filter-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        document.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        this.orderStatusFilter = pill.getAttribute('data-filter');
        this.renderOrdersTable();
      });
    });

    // Order search
    const orderSearch = document.getElementById('adminOrderSearch');
    if (orderSearch) {
      orderSearch.addEventListener('input', (e) => {
        this.orderSearchQuery = e.target.value.trim();
        this.renderOrdersTable();
      });
    }

    // Close modals on click outside
    document.querySelectorAll('.admin-modal-overlay').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.classList.remove('active');
        }
      });
    });
  }
};

document.addEventListener('DOMContentLoaded', () => {
  DarbarAdmin.init();
});

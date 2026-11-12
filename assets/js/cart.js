/**
 * Darbar Flavors Spices - Cart Page Controller
 */

const CartController = {
  appliedCoupon: null,
  discountAmount: 0,

  init() {
    this.renderCartTable();
    this.setupCoupon();
  },

  renderCartTable() {
    const tableBody = document.getElementById('cartTableBody');
    const emptyState = document.getElementById('cartEmptyState');
    const cartWrapper = document.getElementById('cartFullWrapper');

    if (!tableBody) return;

    if (DarbarApp.cart.length === 0) {
      if (emptyState) emptyState.style.display = 'block';
      if (cartWrapper) cartWrapper.style.display = 'none';
      return;
    }

    if (emptyState) emptyState.style.display = 'none';
    if (cartWrapper) cartWrapper.style.display = 'block';

    tableBody.innerHTML = DarbarApp.cart.map(item => `
      <tr style="border-bottom: 1px solid #EAE6DF;">
        <td style="padding: 16px; display: flex; align-items: center; gap: 14px;">
          <img src="${item.image}" alt="${item.title}" style="width: 70px; height: 70px; object-fit: cover; border-radius: 8px; border: 1px solid #EAE6DF;">
          <div>
            <h4 style="font-size: 1rem; margin-bottom: 4px;">
              <a href="product-detail.html?id=${item.id}">${item.title}</a>
            </h4>
            <div class="font-urdu" style="color: #B22222; font-size: 0.88rem; margin-bottom: 4px;">${item.urduTitle}</div>
            <span style="font-size: 0.78rem; background: #F3EFE9; padding: 2px 8px; border-radius: 4px; font-weight: 600;">Weight: ${item.weight}</span>
          </div>
        </td>
        <td style="padding: 16px; font-weight: 600;">Rs. ${item.price.toLocaleString()}</td>
        <td style="padding: 16px;">
          <div class="cart-qty-control" style="margin: 0;">
            <button class="qty-btn" onclick="CartController.updateItemQty('${item.key}', -1)">-</button>
            <span class="qty-num">${item.quantity}</span>
            <button class="qty-btn" onclick="CartController.updateItemQty('${item.key}', 1)">+</button>
          </div>
        </td>
        <td style="padding: 16px; font-weight: 700; color: #111;">
          Rs. ${(item.price * item.quantity).toLocaleString()}
        </td>
        <td style="padding: 16px; text-align: center;">
          <button class="remove-cart-item-btn" onclick="CartController.deleteItem('${item.key}')" title="Remove">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </td>
      </tr>
    `).join('');

    this.updateTotals();
  },

  updateItemQty(key, change) {
    DarbarApp.updateQuantity(key, change);
    this.renderCartTable();
  },

  deleteItem(key) {
    DarbarApp.removeFromCart(key);
    this.renderCartTable();
  },

  setupCoupon() {
    const couponBtn = document.getElementById('applyCouponBtn');
    const couponInput = document.getElementById('couponCodeInput');

    if (couponBtn && couponInput) {
      couponBtn.addEventListener('click', () => {
        const code = couponInput.value.trim().toUpperCase();
        if (code === STORE_CONFIG.couponCode) {
          this.appliedCoupon = code;
          DarbarApp.showToast(`Coupon code "${code}" applied successfully! 10% discount added.`);
          this.updateTotals();
        } else {
          DarbarApp.showToast('Invalid coupon code! Please enter a valid discount code.', 'error');
        }
      });
    }
  },

  updateTotals() {
    const subtotal = DarbarApp.getCartTotal();

    if (this.appliedCoupon) {
      this.discountAmount = Math.round((subtotal * (STORE_CONFIG.couponDiscountPercent || 10)) / 100);
      const discountRow = document.getElementById('cartDiscountRow');
      const discountVal = document.getElementById('cartDiscountAmount');
      if (discountRow) discountRow.style.display = 'table-row';
      if (discountVal) discountVal.textContent = `- Rs. ${this.discountAmount.toLocaleString()}`;
    }

    const total = Math.max(0, subtotal - this.discountAmount);

    const subtotalEl = document.getElementById('cartPageSubtotal');
    const shippingEl = document.getElementById('cartPageShipping');
    const totalEl = document.getElementById('cartPageTotal');

    if (subtotalEl) subtotalEl.textContent = `Rs. ${subtotal.toLocaleString()}`;
    if (shippingEl) {
      shippingEl.innerHTML = '<span style="color: #666; font-size: 0.85rem;">Discuss on WhatsApp</span>';
    }
    if (totalEl) totalEl.textContent = `Rs. ${total.toLocaleString()}`;
  },

  // Direct WhatsApp Checkout from Cart Page
  checkoutViaWhatsApp() {
    if (DarbarApp.cart.length === 0) {
      DarbarApp.showToast('Your cart is empty! / آپ کا کارٹ خالی ہے!', 'error');
      return;
    }

    const subtotal = DarbarApp.getCartTotal();
    const finalTotal = Math.max(0, subtotal - this.discountAmount);

    const itemsText = DarbarApp.cart.map((item, index) => 
      `${index + 1}. *${item.title}* (${item.urduTitle || ''}) - ${item.weight} x ${item.quantity} = Rs. ${(item.price * item.quantity).toLocaleString()}`
    ).join('\n');

    const message = encodeURIComponent(
      `السلام علیکم *Darbar Flavors Spices*!\n` +
      `--------------------------------\n` +
      `🛒 *میری کارٹ سے آن لائن آرڈر تفصیلات:*\n` +
      `--------------------------------\n` +
      `${itemsText}\n` +
      `--------------------------------\n` +
      `💵 *کل رقم:* Rs. ${finalTotal.toLocaleString()}\n` +
      (this.discountAmount > 0 ? `🎟️ *ڈسکاؤنٹ رعایت:* - Rs. ${this.discountAmount.toLocaleString()}\n` : '') +
      `🚚 *ترسیل و ڈلیوری:* دکاندار سے براہِ راست واٹس ایپ پر طے ہوگی\n` +
      `--------------------------------\n` +
      `براہ کرم آرڈر تصدیق فرما دیں۔ شکریہ!`
    );

    const waUrl = `https://wa.me/${STORE_CONFIG.whatsappNumber.replace('+', '')}?text=${message}`;
    window.open(waUrl, '_blank');
  }
};

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('cartTableBody')) {
    CartController.init();
  }
});

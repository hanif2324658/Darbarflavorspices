/**
 * Darbar Flavors Spices - Checkout Controller
 * Multi-option checkout with WhatsApp Direct Order & COD Confirmation
 */

const CheckoutController = {
  selectedPayment: 'cod',

  init() {
    this.renderOrderSummary();
    this.setupPaymentSelection();
    this.setupForm();
  },

  renderOrderSummary() {
    const summaryItems = document.getElementById('checkoutSummaryItems');
    const subtotalEl = document.getElementById('checkoutSubtotal');
    const shippingEl = document.getElementById('checkoutShipping');
    const totalEl = document.getElementById('checkoutTotal');

    if (!summaryItems) return;

    if (DarbarApp.cart.length === 0) {
      window.location.href = 'shop.html';
      return;
    }

    const subtotal = DarbarApp.getCartTotal();
    const total = subtotal;

    summaryItems.innerHTML = DarbarApp.cart.map(item => `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; font-size: 0.88rem; padding-bottom: 8px; border-bottom: 1px dashed #E5E7EB;">
        <div>
          <strong>${item.title}</strong> (${item.weight})
          <div style="color: #6B7280; font-size: 0.8rem;">تعداد: ${item.quantity} × Rs. ${item.price}</div>
        </div>
        <div style="font-weight: 700;">Rs. ${(item.price * item.quantity).toLocaleString()}</div>
      </div>
    `).join('');

    if (subtotalEl) subtotalEl.textContent = `Rs. ${subtotal.toLocaleString()}`;
    if (shippingEl) {
      shippingEl.innerHTML = '<span style="color: #666; font-size: 0.85rem;">Discuss on WhatsApp</span>';
    }
    if (totalEl) totalEl.textContent = `Rs. ${total.toLocaleString()}`;
    if (totalEl) totalEl.textContent = `Rs. ${total.toLocaleString()}`;
  },

  setupPaymentSelection() {
    document.querySelectorAll('.payment-method-card').forEach(card => {
      card.addEventListener('click', () => {
        document.querySelectorAll('.payment-method-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        this.selectedPayment = card.getAttribute('data-payment');

        const bankDetails = document.getElementById('bankDetailsBox');
        if (bankDetails) {
          bankDetails.style.display = this.selectedPayment === 'bank' ? 'block' : 'none';
        }
      });
    });
  },

  setupForm() {
    const sameWaCheckbox = document.getElementById('sameAsPhoneCheck');
    const phoneInput = document.getElementById('checkoutPhone');
    const waInput = document.getElementById('checkoutWhatsApp');

    if (sameWaCheckbox && phoneInput && waInput) {
      sameWaCheckbox.addEventListener('change', (e) => {
        if (e.target.checked) {
          waInput.value = phoneInput.value;
          waInput.disabled = true;
        } else {
          waInput.disabled = false;
        }
      });

      phoneInput.addEventListener('input', () => {
        if (sameWaCheckbox.checked) {
          waInput.value = phoneInput.value;
        }
      });
    }
  },

  getFormData() {
    const fullName = document.getElementById('checkoutName').value.trim();
    const phone = document.getElementById('checkoutPhone').value.trim();
    const whatsapp = document.getElementById('checkoutWhatsApp').value.trim() || phone;
    const city = document.getElementById('checkoutCity').value.trim();
    const address = document.getElementById('checkoutAddress').value.trim();
    const notes = document.getElementById('checkoutNotes') ? document.getElementById('checkoutNotes').value.trim() : '';

    if (!fullName) {
      DarbarApp.showToast('Please enter your full name!', 'error');
      return null;
    }
    if (!phone || phone.length < 10) {
      DarbarApp.showToast('Please enter a valid phone number!', 'error');
      return null;
    }
    if (!city) {
      DarbarApp.showToast('Please enter your city!', 'error');
      return null;
    }
    if (!address) {
      DarbarApp.showToast('Please enter your complete delivery address!', 'error');
      return null;
    }

    return { fullName, phone, whatsapp, city, address, notes };
  },

  generateOrderId() {
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    return `DFS-${randomNum}`;
  },

  // WhatsApp Order Submission
  submitViaWhatsApp() {
    const customer = this.getFormData();
    if (!customer) return;

    const orderId = this.generateOrderId();
    const subtotal = DarbarApp.getCartTotal();
    const total = subtotal;

    const itemsSummary = DarbarApp.cart.map((item, idx) => 
      `${idx + 1}. *${item.title}* (${item.urduTitle}) - ${item.weight} x ${item.quantity} = Rs. ${(item.price * item.quantity).toLocaleString()}`
    ).join('\n');

    const paymentText = this.selectedPayment === 'cod' ? 'Cash on Delivery (کیش آن ڈلیوری)' : 'Bank Transfer / JazzCash / Easypaisa';

    const orderReceipt = 
      `👑 *نئی آرڈر رسید - Darbar Flavors Spices* 👑\n` +
      `--------------------------------\n` +
      `🆔 *آرڈر نمبر:* #${orderId}\n` +
      `👤 *گاہک کا نام:* ${customer.fullName}\n` +
      `📞 *رابطہ نمبر:* ${customer.phone}\n` +
      `💬 *واٹس ایپ:* ${customer.whatsapp}\n` +
      `🏙️ *شہر:* ${customer.city}\n` +
      `📍 *پتہ:* ${customer.address}\n` +
      (customer.notes ? `📝 *ہدایات:* ${customer.notes}\n` : '') +
      `--------------------------------\n` +
      `📦 *آرڈر کی گئی اشیاء:* \n${itemsSummary}\n` +
      `--------------------------------\n` +
      `💰 *کل رقم:* Rs. ${total.toLocaleString()}\n` +
      `🚚 *ترسیل و ڈلیوری:* دکاندار سے براہِ راست واٹس ایپ پر طے ہوگی\n` +
      `💳 *طریقہ ادائیگی:* ${paymentText}\n` +
      `--------------------------------\n` +
      `براہ کرم آرڈر کی تصدیق فرمائیں تاکہ پارسل کی تیاری شروع کی جا سکے۔ شکریہ!`;

    // Save order in localStorage
    this.saveOrderLocally(orderId, customer, subtotal, 0, total, paymentText, 'Pending WhatsApp Confirmation');

    // Clear cart
    DarbarApp.cart = [];
    DarbarApp.saveCart();

    // Redirect to WhatsApp
    const waUrl = `https://wa.me/${STORE_CONFIG.whatsappNumber.replace('+', '')}?text=${encodeURIComponent(orderReceipt)}`;
    window.open(waUrl, '_blank');

    // Also navigate customer to success page
    setTimeout(() => {
      window.location.href = `order-success.html?orderId=${orderId}`;
    }, 600);
  },

  // Normal Direct Website Order Submission (COD)
  submitWebsiteOrder() {
    const customer = this.getFormData();
    if (!customer) return;

    const orderId = this.generateOrderId();
    const subtotal = DarbarApp.getCartTotal();
    const total = subtotal;
    const paymentText = this.selectedPayment === 'cod' ? 'Cash on Delivery (کیش آن ڈلیوری)' : 'Bank Transfer';

    this.saveOrderLocally(orderId, customer, subtotal, 0, total, paymentText, 'Order Placed (Processing)');

    // Clear cart
    DarbarApp.cart = [];
    DarbarApp.saveCart();

    window.location.href = `order-success.html?orderId=${orderId}`;
  },

  saveOrderLocally(orderId, customer, subtotal, shipping, total, paymentMethod, status) {
    const orders = (typeof SafeStorage !== 'undefined') 
      ? SafeStorage.getJSON('darbar_orders', []) 
      : [];
    const newOrder = {
      orderId,
      customer,
      items: [...DarbarApp.cart],
      subtotal,
      shipping,
      total,
      paymentMethod,
      status,
      date: new Date().toLocaleDateString('en-PK', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    };
    orders.unshift(newOrder);
    if (typeof SafeStorage !== 'undefined') {
      SafeStorage.setJSON('darbar_orders', orders);
      SafeStorage.setJSON('darbar_last_order', newOrder);
    } else {
      try {
        localStorage.setItem('darbar_orders', JSON.stringify(orders));
        localStorage.setItem('darbar_last_order', JSON.stringify(newOrder));
      } catch (e) {}
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('checkoutSummaryItems')) {
    CheckoutController.init();
  }
});

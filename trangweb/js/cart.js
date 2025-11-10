// cart.js - Quản lý giỏ hàng
document.addEventListener('DOMContentLoaded', function() {
  loadCart();
  updateCartCount();
});

// Load giỏ hàng từ localStorage
function loadCart() {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const cartItemsContainer = document.getElementById('cart-items');
  const cartGiftsContainer = document.getElementById('cart-gifts');

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = `
      <div class="cart-header">
        <h1 class="cart-title">Giỏ hàng của bạn</h1>
      </div>
      <div class="empty-cart">
        <p>Giỏ hàng trống. <a href="index.html">Quay lại mua sắm</a></p>
      </div>
    `;
    return;
  }

  cartItemsContainer.innerHTML = `
    <div class="cart-header">
      <h1 class="cart-title">Giỏ hàng của bạn</h1>
    </div>
  `;
  cartGiftsContainer.innerHTML = '';

  cart.forEach((item, index) => {
    const itemElement = document.createElement('div');
    itemElement.className = 'cart-item';
    itemElement.innerHTML = `
      <img src="${item.image}" alt="${item.name}">
      <div class="cart-item-info">
        <div class="cart-item-title">${item.name}</div>
        <div class="cart-item-code">Mã: ${item.code || 'N/A'}</div>
        <div class="price-wrap">
          <span class="price-current">${formatCurrency(item.price)}</span>
        </div>
        <button class="remove-btn" onclick="removeItem(${index})">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Xóa
        </button>
      </div>
      <div class="cart-item-actions">
        <div class="qty-controls">
          <button class="qty-btn" onclick="changeQuantity(${index}, -1)">-</button>
          <input type="text" class="qty-input" value="${item.quantity}" readonly>
          <button class="qty-btn" onclick="changeQuantity(${index}, 1)">+</button>
        </div>
      </div>
    `;
    cartItemsContainer.appendChild(itemElement);
  });

  // Tính tổng tiền
  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // Thêm phần tổng kết và nút thanh toán
  const checkoutSection = document.createElement('div');
  checkoutSection.innerHTML = `
    <div class="cart-summary" style="
      margin-top: 30px;
      padding: 25px;
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      border-radius: 12px;
      border: 2px solid #dee2e6;
      box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    ">
      <div class="cart-total" style="
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 20px;
        font-weight: 700;
        color: #b50037;
        margin-bottom: 25px;
        padding-bottom: 15px;
        border-bottom: 2px solid #dee2e6;
      ">
        <span>Tổng cộng:</span>
        <span>${formatCurrency(total)}</span>
      </div>
      <div style="text-align: center;">
        <a href="payment.html" class="checkout-btn" style="
          display: inline-block;
          padding: 18px 50px;
          background: linear-gradient(135deg, #b50037 0%, #8b0030 100%);
          color: white;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 700;
          font-size: 18px;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(181, 0, 55, 0.3);
          border: 2px solid #8b0030;
        ">Thanh Toán Ngay</a>
      </div>
    </div>
  `;
  cartItemsContainer.appendChild(checkoutSection);
}

// Thay đổi số lượng
function changeQuantity(index, delta) {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  if (index < 0 || index >= cart.length) return;

  cart[index].quantity += delta;
  if (cart[index].quantity <= 0) {
    cart.splice(index, 1);
  }

  localStorage.setItem('cart', JSON.stringify(cart));
  loadCart();
  updateCartCount();
}

// Xóa item khỏi giỏ hàng
function removeItem(index) {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  if (index < 0 || index >= cart.length) return;

  cart.splice(index, 1);
  localStorage.setItem('cart', JSON.stringify(cart));
  loadCart();
  updateCartCount();
}

// Cập nhật số lượng giỏ hàng trong header
function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartCountEl = document.querySelector('.cart-count');
  if (cartCountEl) {
    cartCountEl.textContent = totalItems;
    cartCountEl.style.display = totalItems > 0 ? 'flex' : 'none';
  }
}

// Format tiền tệ VND
function formatCurrency(amount) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount);
}

// Notification function
function showNotification(message, type = 'success') {
  const notification = document.getElementById('notification');
  notification.textContent = message;
  // Remove previous type classes
  notification.className = 'notification';
  // Add type class
  notification.classList.add(type);
  notification.classList.add('show');
  setTimeout(() => {
    notification.classList.remove('show');
  }, 3000); // Hide after 3 seconds
}

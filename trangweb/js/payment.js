// payment.js - Xử lý trang thanh toán
document.addEventListener('DOMContentLoaded', function() {
  loadOrderSummary();
  setupFormValidation();
  setupPlaceOrder();
});

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

// Load tóm tắt đơn hàng từ localStorage
function loadOrderSummary() {
  // Check if direct checkout from product page
  const urlParams = new URLSearchParams(window.location.search);
  const isDirectCheckout = urlParams.get('direct') === 'true';

  let items = [];
  if (isDirectCheckout) {
    items = JSON.parse(localStorage.getItem('directCheckout')) || [];
  } else {
    items = JSON.parse(localStorage.getItem('cart')) || [];
  }

  const orderItemsContainer = document.getElementById('order-items');
  const totalAmountElement = document.getElementById('total-amount');

  if (items.length === 0) {
    orderItemsContainer.innerHTML = '<p>Giỏ hàng trống. <a href="index.html">Quay lại mua sắm</a></p>';
    totalAmountElement.textContent = '0 VND';
    return;
  }

  let total = 0;
  orderItemsContainer.innerHTML = '';

  items.forEach(item => {
    const itemTotal = item.price * item.quantity;
    total += itemTotal;

    const itemElement = document.createElement('div');
    itemElement.className = 'order-item';
    itemElement.innerHTML = `
      <img src="${item.image}" alt="${item.name}">
      <div class="order-item-details">
        <div class="order-item-title">${item.name}</div>
        <div class="order-item-price">${formatCurrency(item.price)}</div>
        <div class="order-item-quantity">Số lượng: ${item.quantity}</div>
      </div>
    `;
    orderItemsContainer.appendChild(itemElement);
  });

  totalAmountElement.textContent = formatCurrency(total);
}

// Format tiền tệ VND
function formatCurrency(amount) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount);
}

// Setup validation form
function setupFormValidation() {
  const form = document.getElementById('customer-form');
  const inputs = form.querySelectorAll('input[required], textarea[required]');

  inputs.forEach(input => {
    input.addEventListener('blur', function() {
      validateField(this);
    });

    input.addEventListener('input', function() {
      if (this.classList.contains('error')) {
        validateField(this);
      }
    });
  });
}

// Validate một field
function validateField(field) {
  const value = field.value.trim();
  let isValid = true;
  let errorMessage = '';

  switch(field.name) {
    case 'fullname':
      if (!value) {
        isValid = false;
        errorMessage = 'Vui lòng nhập họ và tên';
      } else if (value.length < 2) {
        isValid = false;
        errorMessage = 'Họ và tên phải có ít nhất 2 ký tự';
      }
      break;

    case 'email':
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!value) {
        isValid = false;
        errorMessage = 'Vui lòng nhập email';
      } else if (!emailRegex.test(value)) {
        isValid = false;
        errorMessage = 'Email không hợp lệ';
      }
      break;

    case 'phone':
      const phoneRegex = /^[0-9]{10,11}$/;
      if (!value) {
        isValid = false;
        errorMessage = 'Vui lòng nhập số điện thoại';
      } else if (!phoneRegex.test(value.replace(/\s/g, ''))) {
        isValid = false;
        errorMessage = 'Số điện thoại không hợp lệ (10-11 số)';
      }
      break;

    case 'address':
      if (!value) {
        isValid = false;
        errorMessage = 'Vui lòng nhập địa chỉ giao hàng';
      } else if (value.length < 10) {
        isValid = false;
        errorMessage = 'Địa chỉ phải có ít nhất 10 ký tự';
      }
      break;
  }

  if (!isValid) {
    field.classList.add('error');
    showFieldError(field, errorMessage);
  } else {
    field.classList.remove('error');
    hideFieldError(field);
  }

  return isValid;
}

// Hiển thị lỗi cho field
function showFieldError(field, message) {
  hideFieldError(field); // Xóa lỗi cũ nếu có

  const errorElement = document.createElement('div');
  errorElement.className = 'field-error';
  errorElement.textContent = message;
  errorElement.style.color = 'red';
  errorElement.style.fontSize = '12px';
  errorElement.style.marginTop = '5px';

  field.parentNode.appendChild(errorElement);
}

// Ẩn lỗi cho field
function hideFieldError(field) {
  const existingError = field.parentNode.querySelector('.field-error');
  if (existingError) {
    existingError.remove();
  }
}
  
// Setup nút đặt hàng
function setupPlaceOrder() {
  const placeOrderBtn = document.getElementById('place-order-btn');

  placeOrderBtn.addEventListener('click', function() {
    if (validateAllFields()) {
      processOrder();
    }
  });
}

// Validate tất cả fields
function validateAllFields() {
  const form = document.getElementById('customer-form');
  const inputs = form.querySelectorAll('input[required], textarea[required]');
  let allValid = true;

  inputs.forEach(input => {
    if (!validateField(input)) {
      allValid = false;
    }
  });

  return allValid;
}

// Xử lý đặt hàng
function processOrder() {
  // Check if direct checkout or from cart
  const urlParams = new URLSearchParams(window.location.search);
  const isDirectCheckout = urlParams.get('direct') === 'true';

  let items = [];
  if (isDirectCheckout) {
    items = JSON.parse(localStorage.getItem('directCheckout')) || [];
  } else {
    items = JSON.parse(localStorage.getItem('cart')) || [];
  }

  if (items.length === 0) {
    showNotification('Không có sản phẩm để thanh toán!', 'error');
    return;
  }

  // Thu thập thông tin đơn hàng
  const orderData = {
    customer: {
      fullname: document.getElementById('fullname').value,
      email: document.getElementById('email').value,
      phone: document.getElementById('phone').value,
      address: document.getElementById('address').value
    },
    paymentMethod: document.querySelector('input[name="payment"]:checked').value,
    items: items,
    total: calculateTotal(items),
    orderDate: new Date().toISOString(),
    status: 'pending'
  };

  // Lưu đơn hàng vào localStorage (trong thực tế sẽ gửi lên server)
  const orders = JSON.parse(localStorage.getItem('orders')) || [];
  orders.push(orderData);
  localStorage.setItem('orders', JSON.stringify(orders));

  // Xóa dữ liệu sau khi đặt hàng
  if (isDirectCheckout) {
    localStorage.removeItem('directCheckout');
  } else {
    localStorage.removeItem('cart');
  }

  // Hiển thị thông báo thành công
  showNotification('Đặt hàng thành công! Chúng tôi sẽ liên hệ với bạn sớm.', 'success');
  showOrderSuccess(orderData);
}

// Tính tổng tiền
function calculateTotal(cart) {
  return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

// Hiển thị thông báo đặt hàng thành công
function showOrderSuccess(orderData) {
  const modal = document.createElement('div');
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  `;

  modal.innerHTML = `
    <div style="
      background: white;
      padding: 30px;
      border-radius: 8px;
      max-width: 500px;
      text-align: center;
    ">
      <h2 style="color: #b50037; margin-bottom: 20px;">Đặt Hàng Thành Công!</h2>
      <p>Cảm ơn bạn đã đặt hàng. Chúng tôi sẽ liên hệ với bạn trong thời gian sớm nhất.</p>
      <div style="margin: 20px 0; text-align: left;">
        <p><strong>Mã đơn hàng:</strong> #${Date.now()}</p>
        <p><strong>Tổng tiền:</strong> ${formatCurrency(orderData.total)}</p>
        <p><strong>Phương thức thanh toán:</strong> ${getPaymentMethodName(orderData.paymentMethod)}</p>
      </div>
      <button onclick="window.location.href='index.html'" style="
        padding: 10px 20px;
        background: #b50037;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        margin-right: 10px;
      ">Tiếp Tục Mua Sắm</button>
      <button onclick="this.parentNode.parentNode.remove()" style="
        padding: 10px 20px;
        background: #666;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
      ">Đóng</button>
    </div>
  `;

  document.body.appendChild(modal);
}

// Lấy tên phương thức thanh toán
function getPaymentMethodName(method) {
  const names = {
    cod: 'Thanh toán khi nhận hàng',
    bank: 'Chuyển khoản ngân hàng',
    momo: 'Ví MoMo'
  };
  return names[method] || method;
}

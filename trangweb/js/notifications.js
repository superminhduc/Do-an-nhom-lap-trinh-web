// notifications.js - Push notifications for the website

// Check if browser supports notifications
if ('Notification' in window) {
  // Request permission on page load if not already granted or denied
  if (Notification.permission === 'default') {
    Notification.requestPermission().then(function(permission) {
      console.log('Notification permission:', permission);
    });
  }
}

// Function to show push notification
function showPushNotification(title, body, icon = '/trangweb/image/logo-my-pham-2.png') {
  console.log('Attempting to show push notification:', title, body);
  if (Notification.permission === 'granted') {
    try {
      const notification = new Notification(title, {
        body: body,
        icon: icon,
        badge: icon,
        tag: 'cart-notification' // Group similar notifications
      });
      console.log('Notification created successfully');

      // Auto close after 5 seconds
      setTimeout(() => {
        notification.close();
      }, 5000);

      // Click to focus window
      notification.onclick = function() {
        window.focus();
        notification.close();
      };
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  } else if (Notification.permission === 'default') {
    console.log('Requesting permission again');
    // Request permission again if needed
    Notification.requestPermission().then(function(permission) {
      console.log('Permission result:', permission);
      if (permission === 'granted') {
        showPushNotification(title, body, icon);
      }
    });
  } else {
    console.log('Notification permission denied');
  }
}

// Function to show notification for adding to cart
function notifyAddToCart(productName, quantity) {
  console.log('notifyAddToCart called with:', productName, quantity);
  const title = 'Sản phẩm đã thêm vào giỏ hàng';
  const body = `${quantity} x ${productName} đã được thêm vào giỏ hàng của bạn.`;
  showPushNotification(title, body);
}

// Export functions if using modules (optional)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { showPushNotification, notifyAddToCart };
}

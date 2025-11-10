(function(){
    const toggle = document.querySelector('.categories-toggle');
    const panel = document.getElementById('categories-panel'); // Giả định bạn có element này; nếu không, thay bằng '.toggle-submenu'
    const closeBtn = panel && panel.querySelector('.panel-close');
    const categoriesEl = document.querySelector('.categories');
    const categoriesInner = document.querySelector('.categories-inner');
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'; // Check đăng nhập từ localStorage

    if (!isLoggedIn) return; // Không chạy nếu chưa đăng nhập

    function placePanelUnderToggle() {
        if (!panel || !toggle || !categoriesEl) return;
        // Đảm bảo panel hiển thị để đo kích thước
        panel.style.opacity = '0';
        panel.classList.add('open'); // Tạm mở để đo
        panel.style.display = 'block';

        const catRect = categoriesEl.getBoundingClientRect();
        const toggleRect = toggle.getBoundingClientRect();
        const panelRect = panel.getBoundingClientRect();

        // Tính toán left để canh giữa nút, giới hạn trong vùng .categories
        let left = (toggleRect.left - catRect.left) + (toggleRect.width - panelRect.width) / 2;
        const maxLeft = catRect.width - panelRect.width - 8;
        if (left < 8) left = 8;
        if (left > maxLeft) left = Math.max(8, maxLeft);

        // Top ngay dưới nút (cách 8px)
        let top = toggleRect.bottom - catRect.top + 8;

        panel.style.left = `${Math.round(left)}px`;
        panel.style.top = `${Math.round(top)}px`;

        // Khôi phục trạng thái opacity nếu panel đang mở
        if (!panel.classList.contains('open')) {
            panel.classList.remove('open');
        } else {
            panel.style.opacity = '';
        }
    }

    function openPanel() {
        if (!panel) return;
        placePanelUnderToggle();
        panel.classList.add('open');
        panel.setAttribute('aria-hidden', 'false');
        if (toggle) toggle.setAttribute('aria-expanded', 'true');
    }

    function closePanel() {
        if (!panel) return;
        panel.classList.remove('open');
        panel.setAttribute('aria-hidden', 'true');
        if (toggle) toggle.setAttribute('aria-expanded', 'false');
    }

    // Click để mở/đóng (mobile hoặc khi cần nhấn)
    if (toggle && panel) {
        toggle.addEventListener('click', (e) => {
            e.stopPropagation();
            panel.classList.contains('open') ? closePanel() : openPanel();
        });
    }

    if (closeBtn) closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        closePanel();
    });

    // Đóng panel khi click bên ngoài
    document.addEventListener('click', (e) => {
        if (!panel || !panel.classList.contains('open')) return;
        if (!panel.contains(e.target) && !toggle.contains(e.target) && !categoriesEl.contains(e.target)) closePanel();
    });

    // Hover để mở (chỉ trên thiết bị hỗ trợ hover)
    if (categoriesEl && panel) {
        const canHover = window.matchMedia && window.matchMedia('(hover: hover)').matches;
        if (canHover) {
            categoriesEl.addEventListener('mouseenter', () => openPanel());
            categoriesEl.addEventListener('mouseleave', () => closePanel());

            // Hỗ trợ keyboard: mở khi focus vào categories, đóng khi focus ra ngoài
            categoriesEl.addEventListener('focusin', () => openPanel());
            categoriesEl.addEventListener('focusout', (ev) => {
                const related = ev.relatedTarget;
                if (!categoriesEl.contains(related)) closePanel();
            });
        }
    }

    // Điều chỉnh vị trí khi resize/scroll nếu panel đang mở
    window.addEventListener('resize', () => {
        if (panel && panel.classList.contains('open')) placePanelUnderToggle();
    });
    window.addEventListener('scroll', () => {
        if (panel && panel.classList.contains('open')) placePanelUnderToggle();
    }, true);

    // --- Thêm: Toggle dropdown cho .f-menu-nav trên thiết bị cảm ứng ---
    (function(){
        const fMenuBtn = document.querySelector('.f-menu-nav-btn');
        const fMenuWrap = document.querySelector('.f-menu-nav');

        if (fMenuBtn && fMenuWrap) {
            const canHover = window.matchMedia && window.matchMedia('(hover: hover)').matches;

            // Trên touch devices: toggle .open khi click
            if (!canHover) {
                fMenuBtn.addEventListener('click', function(e){
                    e.preventDefault();
                    e.stopPropagation();
                    fMenuWrap.classList.toggle('open');
                }, {passive: false});

                // Đóng khi click bên ngoài
                document.addEventListener('click', function(ev){
                    if (!fMenuWrap.contains(ev.target)) fMenuWrap.classList.remove('open');
                });
            }

            // Cập nhật ARIA khi focus/blur cho accessibility
            fMenuBtn.addEventListener('focus', () => fMenuWrap.classList.add('open'));
            fMenuBtn.addEventListener('blur', () => setTimeout(() => {
                if (!fMenuWrap.contains(document.activeElement)) fMenuWrap.classList.remove('open');
            }, 10));
        }
    })();

    // --- Thêm: Cập nhật số lượng giỏ hàng trong header (tích hợp với cart) ---
    function updateCartCount() {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        const cartCountEl = document.querySelector('.cart-count');
        if (cartCountEl) {
            cartCountEl.textContent = totalItems;
            cartCountEl.style.display = totalItems > 0 ? 'flex' : 'none';
        }
    }
    // Gọi khi load và sau mỗi thay đổi giỏ hàng
    updateCartCount();
    // Lắng nghe thay đổi localStorage (nếu cần, nhưng localStorage không trigger event tự động)
})();
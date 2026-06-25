document.addEventListener('DOMContentLoaded', () => {
    // --- Navigation Logic ---
    const navItems = document.querySelectorAll('.nav-item');
    const tabPanes = document.querySelectorAll('.tab-pane');
    const headerTitle = document.getElementById('header-title');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();

            // Remove active class from all
            navItems.forEach(nav => nav.classList.remove('active'));
            tabPanes.forEach(tab => tab.classList.remove('active'));

            // Add active class to clicked
            item.classList.add('active');
            const targetId = item.getAttribute('data-target');
            document.getElementById(targetId).classList.add('active');

            // Update title
            headerTitle.textContent = item.getAttribute('data-title');


        });
    });

    // --- Calendar Logic ---
    const monthYearDisplay = document.getElementById('month-year');
    const daysContainer = document.getElementById('calendar-days');
    const prevMonthBtn = document.getElementById('prev-month');
    const nextMonthBtn = document.getElementById('next-month');
    const lunarInfoDisplay = document.getElementById('lunar-info');

    let currentDate = new Date();
    let currentMonth = currentDate.getMonth();
    let currentYear = currentDate.getFullYear();

    const months = ["Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6", "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"];

    // --- Holidays ---
    // Solar holidays: key = "MM-DD"
    const solarHolidays = {
        '01-01': '🎆 Tết Dương lịch',
        '04-30': '🎉 Giải phóng miền Nam',
        '05-01': '🌹 Quốc tế Lao động',
        '09-02': 'Quốc khánh',
    };

    // Lunar holidays: key = "lunar-MM-DD"
    const lunarHolidays = {
        '01-01': '🧧 Tết Nguyên Đán (Mùng 1)',
        '01-02': '🧧 Tết Nguyên Đán (Mùng 2)',
        '01-03': '🧧 Tết Nguyên Đán (Mùng 3)',
        '01-04': '🧧 Tết Nguyên Đán (Mùng 4)',
        '01-05': '🧧 Tết Nguyên Đán (Mùng 5)',
        '03-10': '🏔️ Giỗ Tổ Hùng Vương',
    };

    // Get lunar date string from a solar date, returns "MM-DD" or null
    function getLunarMMDD(year, month, day) {
        try {
            const d = new Date(year, month, day);
            const formatter = new Intl.DateTimeFormat('vi-VN-u-ca-chinese', { day: '2-digit', month: '2-digit' });
            const parts = formatter.formatToParts(d);
            let m = '', dd = '';
            for (const p of parts) {
                if (p.type === 'month') m = p.value.padStart(2, '0');
                if (p.type === 'day') dd = p.value.padStart(2, '0');
            }
            return m && dd ? `${m}-${dd}` : null;
        } catch (e) { return null; }
    }

    function getHoliday(year, month, day) {
        const solarKey = `${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        if (solarHolidays[solarKey]) return solarHolidays[solarKey];
        const lunarKey = getLunarMMDD(year, month, day);
        if (lunarKey && lunarHolidays[lunarKey]) return lunarHolidays[lunarKey];
        return null;
    }

    function renderCalendar() {
        daysContainer.innerHTML = '';
        monthYearDisplay.textContent = `${months[currentMonth]} ${currentYear}`;

        const firstDay = new Date(currentYear, currentMonth, 1).getDay();
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

        // Fill empty slots before first day
        for (let i = 0; i < firstDay; i++) {
            const emptyDiv = document.createElement('div');
            emptyDiv.classList.add('day', 'empty');
            daysContainer.appendChild(emptyDiv);
        }

        const today = new Date();

        for (let i = 1; i <= daysInMonth; i++) {
            const dayDiv = document.createElement('div');
            dayDiv.classList.add('day');
            dayDiv.textContent = i;

            if (i === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear()) {
                dayDiv.classList.add('today');
            }

            // Check for holiday
            const holiday = getHoliday(currentYear, currentMonth, i);
            if (holiday) {
                dayDiv.classList.add('holiday');
                dayDiv.setAttribute('title', holiday);
                const dot = document.createElement('span');
                dot.classList.add('holiday-dot');
                dayDiv.appendChild(dot);
            }

            dayDiv.addEventListener('click', () => {
                document.querySelectorAll('.day').forEach(d => d.classList.remove('selected'));
                dayDiv.classList.add('selected');

                // Sử dụng API Intl của trình duyệt để lấy lịch âm
                let lunarStr = "";
                let holidayName = "";
                try {
                    const dateObj = new Date(currentYear, currentMonth, i);
                    const formatter = new Intl.DateTimeFormat('vi-VN-u-ca-chinese', { day: 'numeric', month: 'numeric' });
                    lunarStr = formatter.format(dateObj);
                } catch (e) {
                    lunarStr = "Không hỗ trợ trên trình duyệt này";
                }
                holidayName = getHoliday(currentYear, currentMonth, i);
                const holidayHTML = holidayName
                    ? `<p class="holiday-label">${holidayName}</p>`
                    : '';
                lunarInfoDisplay.innerHTML = `<p>Ngày dương: ${i}/${currentMonth + 1}/${currentYear}</p><p style="color:var(--secondary-color); margin-top:5px;">Âm lịch: ${lunarStr}</p>${holidayHTML}`;
            });

            daysContainer.appendChild(dayDiv);
        }
    }

    prevMonthBtn.addEventListener('click', () => {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        renderCalendar();
    });

    nextMonthBtn.addEventListener('click', () => {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        renderCalendar();
    });

    renderCalendar();

    // --- Clock Logic ---
    const hourHand = document.getElementById('hour-hand');
    const minHand = document.getElementById('min-hand');
    const secondHand = document.getElementById('second-hand');
    const digitalClock = document.getElementById('digital-clock');
    const currentDateDisplay = document.getElementById('current-date');

    const weekdays = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];

    function updateClock() {
        const now = new Date();

        // Analog
        const seconds = now.getSeconds();
        const secondsDegrees = ((seconds / 60) * 360);
        secondHand.style.transform = `rotate(${secondsDegrees}deg)`;

        const mins = now.getMinutes();
        const minsDegrees = ((mins / 60) * 360) + ((seconds / 60) * 6);
        minHand.style.transform = `rotate(${minsDegrees}deg)`;

        const hours = now.getHours();
        const hoursDegrees = ((hours / 12) * 360) + ((mins / 60) * 30);
        hourHand.style.transform = `rotate(${hoursDegrees}deg)`;

        // Digital
        digitalClock.textContent = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        // Date
        currentDateDisplay.textContent = `${weekdays[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
    }

    setInterval(updateClock, 1000);
    updateClock();

    // --- Diary Logic ---
    const diaryText = document.getElementById('diary-text');
    const photoPreviewContainer = document.getElementById('photo-preview-container');
    const photoPreview = document.getElementById('photo-preview');
    const removePhotoBtn = document.getElementById('remove-photo');
    const saveDiaryBtn = document.getElementById('save-diary');
    const diaryEntries = document.getElementById('diary-entries');
    const diaryPhotoGallery = document.getElementById('diary-photo-gallery');
    const btnCamFront = document.getElementById('btn-cam-front');
    const btnCamRear = document.getElementById('btn-cam-rear');

    const cameraModal = document.getElementById('camera-modal');
    const cameraVideo = document.getElementById('camera-video');
    const cameraCanvas = document.getElementById('camera-canvas');
    const btnCloseCamera = document.getElementById('btn-close-camera');
    const btnCapture = document.getElementById('btn-capture');
    const btnSwitchCamera = document.getElementById('btn-switch-camera');

    let currentPhotoDataUrl = null;
    let currentStream = null;
    let currentFacingMode = 'user';

    diaryPhotoGallery.addEventListener('change', function (e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (event) {
                currentPhotoDataUrl = event.target.result;
                photoPreview.src = currentPhotoDataUrl;
                photoPreviewContainer.style.display = 'inline-block';
            }
            reader.readAsDataURL(file);
        }
    });

    async function openCamera(facingMode) {
        currentFacingMode = facingMode;
        if (currentStream) {
            currentStream.getTracks().forEach(track => track.stop());
        }
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: currentFacingMode }
            });
            currentStream = stream;
            cameraVideo.srcObject = stream;
            cameraModal.style.display = 'flex';
        } catch (err) {
            alert('Không thể truy cập camera. Vui lòng cấp quyền hoặc kiểm tra đường truyền bảo mật (HTTPS/Localhost)!');
            console.error(err);
        }
    }

    function closeCamera() {
        if (currentStream) {
            currentStream.getTracks().forEach(track => track.stop());
            currentStream = null;
        }
        cameraModal.style.display = 'none';
    }

    btnCamFront.addEventListener('click', () => openCamera('user'));
    btnCamRear.addEventListener('click', () => openCamera('environment'));
    btnCloseCamera.addEventListener('click', closeCamera);

    btnSwitchCamera.addEventListener('click', () => {
        openCamera(currentFacingMode === 'user' ? 'environment' : 'user');
    });

    btnCapture.addEventListener('click', () => {
        if (!currentStream) return;
        cameraCanvas.width = cameraVideo.videoWidth;
        cameraCanvas.height = cameraVideo.videoHeight;
        const ctx = cameraCanvas.getContext('2d');
        // Handle mirroring if front camera
        if (currentFacingMode === 'user') {
            ctx.translate(cameraCanvas.width, 0);
            ctx.scale(-1, 1);
        }
        ctx.drawImage(cameraVideo, 0, 0, cameraCanvas.width, cameraCanvas.height);
        currentPhotoDataUrl = cameraCanvas.toDataURL('image/jpeg');
        photoPreview.src = currentPhotoDataUrl;
        photoPreviewContainer.style.display = 'inline-block';
        closeCamera();
    });

    removePhotoBtn.addEventListener('click', () => {
        currentPhotoDataUrl = null;
        diaryPhotoGallery.value = '';
        photoPreviewContainer.style.display = 'none';
    });

    let diaries = JSON.parse(localStorage.getItem('diaries')) || [];
    const diaryDateFilter = document.getElementById('diary-date-filter');

    // Default filter to today
    const todayStr = new Date().toISOString().split('T')[0];
    diaryDateFilter.value = todayStr;

    // Edit Modal Elements
    const editModal = document.getElementById('edit-modal');
    const editTextInput = document.getElementById('edit-text-input');
    const btnCancelEdit = document.getElementById('btn-cancel-edit');
    const btnSaveEdit = document.getElementById('btn-save-edit');
    let editingEntryId = null;

    btnCancelEdit.addEventListener('click', () => {
        editModal.style.display = 'none';
        editingEntryId = null;
    });

    btnSaveEdit.addEventListener('click', () => {
        if (editingEntryId) {
            const entry = diaries.find(d => d.id === editingEntryId);
            if (entry) {
                entry.text = editTextInput.value;
                localStorage.setItem('diaries', JSON.stringify(diaries));
                renderDiaries();
            }
        }
        editModal.style.display = 'none';
        editingEntryId = null;
    });

    function renderDiaries() {
        diaryEntries.innerHTML = '';
        const filterDate = diaryDateFilter.value; // YYYY-MM-DD

        const filtered = diaries.filter(d => {
            if (!filterDate) return true;
            return d.dateStr.startsWith(filterDate);
        });

        filtered.forEach(entry => {
            const entryDiv = document.createElement('div');
            entryDiv.classList.add('diary-entry');

            // Format for display
            const entryDate = new Date(entry.timestamp);
            const displayTime = `${entryDate.getHours().toString().padStart(2, '0')}:${entryDate.getMinutes().toString().padStart(2, '0')} - ${entryDate.getDate()}/${entryDate.getMonth() + 1}/${entryDate.getFullYear()}`;

            let innerHTML = `<div class="date">${displayTime}</div>`;
            if (entry.text) {
                innerHTML += `<div class="text">${entry.text.replace(/\n/g, '<br>')}</div>`;
            }
            if (entry.photo) {
                innerHTML += `<img src="${entry.photo}" alt="Diary Image">`;
            }

            // Action buttons
            innerHTML += `
                <div class="entry-actions">
                    <button class="action-btn edit" data-id="${entry.id}" title="Sửa"><i class="fas fa-edit"></i></button>
                    <button class="action-btn delete" data-id="${entry.id}" title="Xóa"><i class="fas fa-trash"></i></button>
                </div>
            `;
            entryDiv.innerHTML = innerHTML;

            // Bind events
            entryDiv.querySelector('.delete').addEventListener('click', () => {
                if (confirm('Bạn có chắc muốn xóa nhật ký này không?')) {
                    diaries = diaries.filter(d => d.id !== entry.id);
                    localStorage.setItem('diaries', JSON.stringify(diaries));
                    renderDiaries();
                }
            });

            entryDiv.querySelector('.edit').addEventListener('click', () => {
                editingEntryId = entry.id;
                editTextInput.value = entry.text || '';
                editModal.style.display = 'flex';
                editTextInput.focus();
            });

            diaryEntries.appendChild(entryDiv);
        });
    }

    diaryDateFilter.addEventListener('change', renderDiaries);

    saveDiaryBtn.addEventListener('click', () => {
        const text = diaryText.value.trim();
        if (!text && !currentPhotoDataUrl) return;

        const now = new Date();
        const dateIso = now.toISOString().split('T')[0];

        const newEntry = {
            id: Date.now().toString(),
            text: text,
            photo: currentPhotoDataUrl,
            dateStr: dateIso,
            timestamp: now.getTime()
        };

        diaries.unshift(newEntry); // Add to beginning
        localStorage.setItem('diaries', JSON.stringify(diaries));

        // Switch filter to today if we just saved
        if (diaryDateFilter.value !== dateIso) {
            diaryDateFilter.value = dateIso;
        }

        renderDiaries();

        // Reset inputs
        diaryText.value = '';
        removePhotoBtn.click();
    });

    // Initial render
    renderDiaries();



    // --- Settings Logic ---
    const colorBtns = document.querySelectorAll('.color-btn');
    const fontSelect = document.getElementById('font-select');
    const root = document.documentElement;

    // Handle Theme Change
    colorBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all
            colorBtns.forEach(b => b.classList.remove('active'));
            // Add active class to clicked
            btn.classList.add('active');

            // Get colors
            const primary = btn.getAttribute('data-primary');
            const secondary = btn.getAttribute('data-secondary');
            const bg = btn.getAttribute('data-bg');

            // Apply to CSS variables
            root.style.setProperty('--primary-color', primary);
            root.style.setProperty('--secondary-color', secondary);
            root.style.setProperty('--bg-color', bg);

            // Save to localStorage
            localStorage.setItem('theme', JSON.stringify({ primary, secondary, bg }));
        });
    });

    // Handle Font Change
    fontSelect.addEventListener('input', (e) => {
        const font = e.target.value;
        root.style.setProperty('--main-font', font);
        localStorage.setItem('font', font);
    });

    // Load saved settings
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        const { primary, secondary, bg } = JSON.parse(savedTheme);
        root.style.setProperty('--primary-color', primary);
        root.style.setProperty('--secondary-color', secondary);
        root.style.setProperty('--bg-color', bg);

        // Find and activate the correct button
        colorBtns.forEach(b => {
            if (b.getAttribute('data-primary') === primary) {
                colorBtns.forEach(btn => btn.classList.remove('active'));
                b.classList.add('active');
            }
        });
    }

    const savedFont = localStorage.getItem('font');
    if (savedFont) {
        root.style.setProperty('--main-font', savedFont);
        fontSelect.value = savedFont;
    }
});

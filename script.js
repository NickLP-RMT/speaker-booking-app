const GOOGLE_SCRIPT_URL = 'YOUR_GOOGLE_SCRIPT_URL'; // 🔁 เปลี่ยนเป็น URL จาก Google Apps Script ที่คุณ deploy แล้ว

// ====== จัดการฟอร์มจอง (หน้า index.html) ======
document.getElementById('booking-form')?.addEventListener('submit', function (e) {
  e.preventDefault();

  const selectedItems = Array.from(document.querySelectorAll('input[name="items"]:checked'))
    .map(item => item.value)
    .join(', ');

  const formData = {
    action: 'add',
    date: document.getElementById('date').value,
    time: document.getElementById('time').value,
    name: document.getElementById('name').value,
    items: selectedItems,
  };

  fetch(GOOGLE_SCRIPT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData),
  });

  document.getElementById('status-message').textContent = '✅ ส่งคำขอจองเรียบร้อยแล้ว!';
  document.getElementById('booking-form').reset();
});

// ====== โหลดรายการจอง (หน้า bookings.html) ======
async function loadBookings() {
  try {
    const res = await fetch(`${GOOGLE_SCRIPT_URL}?action=read`);
    const data = await res.json();

    const tbody = document.querySelector('#booking-table tbody');
    tbody.innerHTML = '';

    data.forEach((row, index) => {
      const tr = document.createElement('tr');

      tr.innerHTML = `
        <td>${row.date}</td>
        <td>${row.time}</td>
        <td>${row.name}</td>
        <td>${row.items}</td>
        <td><input type="checkbox" ${row.returned === 'TRUE' ? 'checked' : ''} data-index="${index}" class="returned-checkbox" /></td>
        <td><input type="checkbox" ${row.itCheck === 'TRUE' ? 'checked' : ''} data-index="${index}" class="itcheck-checkbox" /></td>
        <td><button data-index="${index}" class="update-btn">อัปเดต</button></td>
      `;
      tbody.appendChild(tr);
    });

    // จัดการปุ่มอัปเดต
    document.querySelectorAll('.update-btn').forEach(button => {
      button.addEventListener('click', async (e) => {
        const index = e.target.dataset.index;
        const returned = document.querySelector(`.returned-checkbox[data-index="${index}"]`).checked;
        const itCheck = document.querySelector(`.itcheck-checkbox[data-index="${index}"]`).checked;

        await fetch(GOOGLE_SCRIPT_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'update',
            rowIndex: parseInt(index) + 2, // +2 เพราะแถว 1 เป็น header และ index เริ่มจาก 0
            returned,
            itCheck,
          }),
        });

        alert('✅ อัปเดตสถานะเรียบร้อยแล้ว');
      });
    });
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการโหลดรายการ:', error);
  }
}

// เรียกใช้เฉพาะตอนเปิดหน้า bookings.html
if (location.pathname.includes('bookings.html')) {
  loadBookings();
}

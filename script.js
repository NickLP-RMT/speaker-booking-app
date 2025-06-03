document.getElementById('booking-form').addEventListener('submit', function (e) {
  e.preventDefault();

  const formData = {
    date: document.getElementById('date').value,
    time: document.getElementById('time').value,
    name: document.getElementById('name').value,
  };

  fetch('YOUR_GOOGLE_SCRIPT_DEPLOYED_URL', {
    method: 'POST',
    mode: 'no-cors', // เพื่อให้ส่งข้อมูลได้โดยไม่ติด CORS
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(formData),
  });

  document.getElementById('status-message').textContent = '✅ ส่งข้อมูลเรียบร้อยแล้ว!';
  document.getElementById('booking-form').reset();
});
// ดึงข้อมูลจาก Google Sheet ผ่าน Apps Script
async function loadBookings() {
  const res = await fetch('YOUR_GOOGLE_SCRIPT_URL?action=read');
  const data = await res.json();

  const tbody = document.querySelector('#booking-table tbody');
  tbody.innerHTML = '';

  data.forEach((row, index) => {
    const tr = document.createElement('tr');

    tr.innerHTML = `
      <td>${row.date}</td>
      <td>${row.time}</td>
      <td>${row.name}</td>
      <td><input type="checkbox" ${row.returned === 'TRUE' ? 'checked' : ''} data-index="${index}" class="returned-checkbox" /></td>
      <td><input type="checkbox" ${row.itCheck === 'TRUE' ? 'checked' : ''} data-index="${index}" class="itcheck-checkbox" /></td>
      <td><button data-index="${index}" class="update-btn">อัปเดต</button></td>
    `;
    tbody.appendChild(tr);
  });

  document.querySelectorAll('.update-btn').forEach(button => {
    button.addEventListener('click', async (e) => {
      const index = e.target.dataset.index;
      const returned = document.querySelector(`.returned-checkbox[data-index="${index}"]`).checked;
      const itCheck = document.querySelector(`.itcheck-checkbox[data-index="${index}"]`).checked;

      await fetch('YOUR_GOOGLE_SCRIPT_URL', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update',
          rowIndex: parseInt(index) + 2, // เนื่องจากแถวแรกคือ header
          returned,
          itCheck,
        }),
      });

      alert('✅ อัปเดตเรียบร้อย');
    });
  });
}

// โหลดข้อมูลเมื่อเปิดหน้า bookings.html
if (location.pathname.includes('bookings.html')) {
  loadBookings();
}

const GOOGLE_SCRIPT_URL = 'YOUR_GOOGLE_SCRIPT_URL';

// ====== 1. จองอุปกรณ์ (index.html) ======
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

// ====== 2. แสดงรายการทั้งหมด (bookings.html) ======
async function loadBookings() {
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
          rowIndex: parseInt(index) + 2,
          returned,
          itCheck,
        }),
      });

      alert('✅ อัปเดตสถานะเรียบร้อยแล้ว');
    });
  });
}

// ====== 3. คืนอุปกรณ์ (return.html) ======
async function setupReturnPage() {
  const input = document.getElementById('searchName');
  const table = document.getElementById('return-table');
  const tbody = table.querySelector('tbody');
  const msg = document.getElementById('return-status-message');

  const res = await fetch(`${GOOGLE_SCRIPT_URL}?action=read`);
  const data = await res.json();

  input.addEventListener('input', () => {
    const keyword = input.value.trim().toLowerCase();
    tbody.innerHTML = '';
    msg.textContent = '';

    if (!keyword) {
      table.style.display = 'none';
      return;
    }

    const filtered = data
      .map((row, index) => ({ ...row, rowIndex: index + 2 }))
      .filter(row =>
        row.name.toLowerCase().includes(keyword) &&
        row.returned !== 'TRUE'
      );

    if (filtered.length === 0) {
      msg.textContent = '❌ ไม่พบรายการที่ยังไม่คืน';
      table.style.display = 'none';
      return;
    }

    filtered.forEach(row => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${row.date}</td>
        <td>${row.time}</td>
        <td>${row.items}</td>
        <td><button class="mark-return-btn" data-row="${row.rowIndex}">คืนแล้ว</button></td>
      `;
      tbody.appendChild(tr);
    });

    table.style.display = '';
    document.querySelectorAll('.mark-return-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const rowIndex = e.target.dataset.row;
        await fetch(GOOGLE_SCRIPT_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'markReturned',
            rowIndex: parseInt(rowIndex),
          }),
        });
        e.target.disabled = true;
        e.target.textContent = '✅ คืนเรียบร้อย';
      });
    });
  });
}

// ====== Routing ตามหน้า ======
if (location.pathname.includes('bookings.html')) {
  loadBookings();
}
if (location.pathname.includes('return.html')) {
  setupReturnPage();
}

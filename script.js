const GOOGLE_SCRIPT_URL = 'YOUR_GOOGLE_SCRIPT_URL'; // ← แก้เป็น Web App URL ของคุณ

// ====== 1. borrow.html (สแกน QR + กรอกเวลาคืน + ผู้ยืม) ======
if (location.pathname.includes('borrow.html')) {
  const scanBtn = document.getElementById('scan-btn');
  const readerDiv = document.getElementById('reader');
  const form = document.getElementById('borrow-form');
  const itemIdInput = document.getElementById('itemId');
  const itemNameInput = document.getElementById('itemName');
  const statusMsg = document.getElementById('status-message');

  // แปลงรหัส QR เป็นชื่ออุปกรณ์ที่มนุษย์อ่านเข้าใจ
  const mapItemName = (id) => {
    if (id.startsWith('speaker')) return 'ลำโพง';
    if (id.startsWith('pointer')) return 'พอยน์เตอร์';
    if (id.startsWith('plug')) return 'ปลั๊กไฟ';
    return 'ไม่ทราบ';
  };

  // เริ่มสแกนเมื่อคลิกปุ่ม
  scanBtn.addEventListener('click', () => {
    readerDiv.style.display = 'block';

    const html5QrCode = new Html5Qrcode("reader");
    html5QrCode.start(
      { facingMode: "environment" },
      { fps: 10, qrbox: 250 },
      (decodedText) => {
        html5QrCode.stop();
        readerDiv.innerHTML = '';

        const itemId = decodedText.trim();
        const itemName = mapItemName(itemId);

        itemIdInput.value = itemId;
        itemNameInput.value = itemName;
        form.style.display = 'block';
        statusMsg.textContent = `✅ พบอุปกรณ์: ${itemName} (${itemId})`;
      },
      (err) => {
        // ignore scan errors
      }
    );
  });

  // เมื่อกด submit
  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().split(':').slice(0, 2).join(':');

    const formData = {
      action: 'borrow',
      date: dateStr,
      time: timeStr,
      itemId: itemIdInput.value,
      itemName: itemNameInput.value,
      returnTime: document.getElementById('returnTime').value,
      borrower: document.getElementById('borrower').value,
    };

    await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    statusMsg.textContent = '✅ บันทึกการยืมเรียบร้อยแล้ว!';
    form.reset();
    form.style.display = 'none';
  });
}

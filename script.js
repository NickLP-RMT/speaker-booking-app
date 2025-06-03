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

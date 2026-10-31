const API = 'http://localhost:5000/api';

document.getElementById('registerForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const department = document.getElementById('department').value.trim();
  const role = document.querySelector('input[name="role"]:checked').value;
  const messageEl = document.getElementById('message');

  messageEl.className = 'form-message';
  messageEl.textContent = '';

  if (password.length < 6) {
    messageEl.className = 'form-message error';
    messageEl.textContent = 'Password must be at least 6 characters.';
    return;
  }

  try {
    const res = await fetch(`${API}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, department, role }),
    });

    const data = await res.json();

    if (!res.ok) {
      messageEl.className = 'form-message error';
      messageEl.textContent = data.msg || 'Registration failed';
      return;
    }

    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));

    messageEl.className = 'form-message success';
    messageEl.textContent = 'Account created! Redirecting...';

    setTimeout(() => {
      window.location.href = 'dashboard.html';
    }, 1000);
  } catch (err) {
    messageEl.className = 'form-message error';
    messageEl.textContent = 'Server error. Please try again.';
  }
});

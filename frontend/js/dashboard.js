const API = 'http://localhost:5000/api';

function getToken() {
  return localStorage.getItem('token');
}

function getUser() {
  try {
    return JSON.parse(localStorage.getItem('user'));
  } catch {
    return null;
  }
}

async function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = 'login.html';
}

function getInitials(name) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function createPersonCard(person, isEmployee) {
  const avatar = document.createElement('div');
  avatar.className = 'person-avatar';
  avatar.textContent = getInitials(person.name);

  const name = document.createElement('div');
  name.className = 'person-name';
  name.textContent = person.name;

  const email = document.createElement('div');
  email.className = 'person-email';
  email.textContent = person.email;

  const info = document.createElement('div');
  info.className = 'person-info';
  info.appendChild(name);
  info.appendChild(email);

  if (person.department) {
    const dept = document.createElement('div');
    dept.className = 'person-department';
    dept.textContent = person.department;
    info.appendChild(dept);
  }

  const card = document.createElement('div');
  card.className = 'person-card';
  card.appendChild(avatar);
  card.appendChild(info);

  if (isEmployee) {
    const actions = document.createElement('div');
    actions.className = 'person-actions';

    const status = document.createElement('span');
    status.className = 'badge ' + (person.approved ? 'badge-approved' : 'badge-pending');
    status.textContent = person.approved ? 'Approved' : 'Pending';
    actions.appendChild(status);

    if (!person.approved) {
      const approveBtn = document.createElement('button');
      approveBtn.className = 'btn btn-success btn-sm';
      approveBtn.textContent = 'Approve';
      approveBtn.addEventListener('click', async () => {
        await approveEmployee(person._id);
      });
      actions.appendChild(approveBtn);
    }

    card.appendChild(actions);
  }

  return card;
}

async function approveEmployee(id) {
  try {
    const res = await fetch(`${API}/users/approve/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': getToken(),
      },
    });
    const data = await res.json();
    if (!res.ok) {
      alert(data.msg || 'Failed to approve');
      return;
    }
    loadEmployeeData();
  } catch (err) {
    alert('Server error');
  }
}

function showMessage(message, type) {
  const banner = document.getElementById('approvalBanner');
  if (type === 'pending') {
    banner.classList.remove('hidden');
  } else {
    banner.classList.add('hidden');
  }
}

async function syncUserSession() {
  const token = getToken();
  if (!token) {
    return null;
  }

  try {
    const res = await fetch(`${API}/auth/me`, {
      headers: { 'x-auth-token': token },
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.msg || 'Session expired');
    }

    localStorage.setItem('user', JSON.stringify(data));
    return data;
  } catch (err) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return null;
  }
}

async function loadDashboard() {
  const token = getToken();
  const persistedUser = getUser();

  if (!token || !persistedUser) {
    window.location.href = 'login.html';
    return;
  }

  const user = (await syncUserSession()) || persistedUser;

  if (!user) {
    window.location.href = 'login.html';
    return;
  }

  document.getElementById('userAvatar').textContent = getInitials(user.name);
  document.getElementById('userName').textContent = user.name;
  document.getElementById('welcomeMsg').textContent = `Welcome, ${user.name}`;
  document.getElementById('statRole').textContent =
    user.role.charAt(0).toUpperCase() + user.role.slice(1);
  document.getElementById('statDept').textContent = user.department || 'General';
  document.getElementById('statStatus').textContent = user.approved
    ? 'Approved'
    : user.role === 'admin'
    ? 'Admin'
    : 'Pending';

  const subtitle = document.getElementById('subtitleMsg');

  document.getElementById('adminSection').classList.add('hidden');
  document.getElementById('employeeSection').classList.add('hidden');

  if (user.role === 'admin') {
    subtitle.textContent = 'You can manage and approve employee accounts.';
    showMessage(null, 'admin');
    document.getElementById('employeeSection').classList.remove('hidden');
    await loadEmployeeData();
  } else {
    if (!user.approved) {
      subtitle.textContent = 'Your account is awaiting approval from an admin.';
      showMessage(null, 'pending');
    } else {
      subtitle.textContent = 'You have been approved. Here are your admin contacts.';
      showMessage(null, 'approved');
      document.getElementById('adminSection').classList.remove('hidden');
      await loadAdminData();
    }
  }
}

async function loadEmployeeData() {
  const listEl = document.getElementById('employeeList');
  listEl.innerHTML = '<div class="loading-state">Loading employees...</div>';

  try {
    const res = await fetch(`${API}/users/employees`, {
      headers: { 'x-auth-token': getToken() },
    });
    const data = await res.json();

    if (!res.ok) {
      listEl.innerHTML = `<div class="empty-state"><p>${data.msg || 'Failed to load'}</p></div>`;
      return;
    }

    if (data.length === 0) {
      listEl.innerHTML = '<div class="empty-state"><div class="empty-icon">👥</div><p>No employees registered yet.</p></div>';
      return;
    }

    listEl.innerHTML = '';
    data.forEach((emp) => {
      listEl.appendChild(createPersonCard(emp, true));
    });
  } catch (err) {
    listEl.innerHTML = '<div class="empty-state"><p>Server error loading employees.</p></div>';
  }
}

async function loadAdminData() {
  const listEl = document.getElementById('adminList');
  listEl.innerHTML = '<div class="loading-state">Loading administrators...</div>';

  try {
    const res = await fetch(`${API}/users/admins`, {
      headers: { 'x-auth-token': getToken() },
    });
    const data = await res.json();

    if (!res.ok) {
      listEl.innerHTML = `<div class="empty-state"><p>${data.msg || 'Failed to load'}</p></div>`;
      return;
    }

    if (data.length === 0) {
      listEl.innerHTML = '<div class="empty-state"><div class="empty-icon">👨‍💼</div><p>No administrators found.</p></div>';
      return;
    }

    listEl.innerHTML = '';
    data.forEach((admin) => {
      listEl.appendChild(createPersonCard(admin, false));
    });
  } catch (err) {
    listEl.innerHTML = '<div class="empty-state"><p>Server error loading admins.</p></div>';
  }
}

document.getElementById('logoutBtn').addEventListener('click', () => {
  logout();
});

loadDashboard();

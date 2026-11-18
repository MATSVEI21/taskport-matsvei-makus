// Logowanie i rejestracja: walidacja pól, komunikat błędu z API, po sukcesie przejście do boards.html
const messageBox = document.getElementById('message');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');

const LOGIN_RE = /^[A-Za-z0-9._-]{3,30}$/;

// Wysyła dane do API; sukces -> boards.html, błąd -> komunikat z API nad formularzem
async function sendAuth(path, payload, button) {
  button.disabled = true;
  try {
    await api(path, 'POST', payload);
    window.location.href = 'boards.html';
  } catch (err) {
    showAlert(messageBox, err.message, 'danger');
    button.disabled = false;
  }
}

loginForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const login = document.getElementById('login');
  const password = document.getElementById('password');
  const okLogin = setInvalid(login, login.value.trim() === '');
  const okPassword = setInvalid(password, password.value === '');
  if (!okLogin || !okPassword) {
    return;
  }
  messageBox.innerHTML = '';
  sendAuth('/auth/login', { login: login.value.trim(), password: password.value },
    loginForm.querySelector('button[type="submit"]'));
});

registerForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const login = document.getElementById('regLogin');
  const firstName = document.getElementById('regFirstName');
  const lastName = document.getElementById('regLastName');
  const password = document.getElementById('regPassword');
  const password2 = document.getElementById('regPassword2');

  const checks = [
    setInvalid(login, !LOGIN_RE.test(login.value.trim())),
    setInvalid(firstName, firstName.value.trim() === ''),
    setInvalid(lastName, lastName.value.trim() === ''),
    setInvalid(password, password.value.length < 8),
    setInvalid(password2, password2.value !== password.value || password2.value === '')
  ];
  if (checks.includes(false)) {
    return;
  }
  messageBox.innerHTML = '';
  sendAuth('/auth/register', {
    login: login.value.trim(),
    firstName: firstName.value.trim(),
    lastName: lastName.value.trim(),
    password: password.value
  }, registerForm.querySelector('button[type="submit"]'));
});

// Błąd znika, gdy użytkownik zaczyna poprawiać pole
for (const input of document.querySelectorAll('input')) {
  input.addEventListener('input', () => setInvalid(input, false));
}

// Komunikat o błędzie znika po przełączeniu zakładki Logowanie / Rejestracja
for (const tab of document.querySelectorAll('[data-bs-toggle="tab"]')) {
  tab.addEventListener('shown.bs.tab', () => {
    messageBox.innerHTML = '';
  });
}

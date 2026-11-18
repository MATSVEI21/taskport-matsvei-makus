// Wspólny kod wszystkich widoków: zapytania do API, nagłówek, komunikaty, potwierdzenia.

// Wspólna funkcja do zapytań API. Przy 401 przenosi na logowanie.
// Przy błędzie rzuca Error z komunikatem z API (pole error) i kodem w err.status.
async function api(path, method = 'GET', body) {
  const res = await fetch('/api' + path, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : {},
    body: body ? JSON.stringify(body) : undefined
  });
  if (res.status === 401 && !window.location.pathname.endsWith('login.html')) {
    window.location.href = 'login.html';
    return new Promise(() => {}); // zatrzymuje dalszy kod – strona i tak przechodzi na logowanie
  }
  let data = null;
  if (res.status !== 204) {
    try {
      data = await res.json();
    } catch (e) {
      data = null;
    }
  }
  if (!res.ok) {
    const err = new Error((data && data.error) || 'Błąd serwera. Spróbuj ponownie.');
    err.status = res.status;
    throw err;
  }
  return data;
}

// Nagłówek: imię zalogowanej osoby i przycisk "Wyloguj"; bez logowania api() przenosi na login.html
async function initHeader() {
  const user = await api('/auth/me');
  document.getElementById('userName').textContent = `${user.firstName} ${user.lastName}`;
  document.getElementById('logoutBtn').addEventListener('click', async () => {
    try {
      await api('/auth/logout', 'POST');
    } finally {
      window.location.href = 'login.html';
    }
  });
  return user;
}

// Komunikat (alert Bootstrapa) w wybranym kontenerze; type: success | danger
function showAlert(container, message, type = 'success') {
  container.innerHTML = '';
  const alert = document.createElement('div');
  alert.className = `alert alert-${type} alert-dismissible fade show`;
  alert.setAttribute('role', type === 'danger' ? 'alert' : 'status');
  alert.append(document.createTextNode(message));
  const close = document.createElement('button');
  close.type = 'button';
  close.className = 'btn-close';
  close.setAttribute('data-bs-dismiss', 'alert');
  close.setAttribute('aria-label', 'Zamknij komunikat');
  alert.append(close);
  container.append(alert);
}

// Okno potwierdzenia (modal #confirmModal); zwraca Promise<boolean>
function confirmDialog(message, okLabel = 'Usuń') {
  return new Promise((resolve) => {
    const el = document.getElementById('confirmModal');
    const modal = bootstrap.Modal.getOrCreateInstance(el);
    const okBtn = document.getElementById('confirmOk');
    document.getElementById('confirmText').textContent = message;
    okBtn.textContent = okLabel;
    let result = false;
    const onOk = () => {
      result = true;
      modal.hide();
    };
    const onHidden = () => {
      okBtn.removeEventListener('click', onOk);
      el.removeEventListener('hidden.bs.modal', onHidden);
      resolve(result);
    };
    okBtn.addEventListener('click', onOk);
    el.addEventListener('hidden.bs.modal', onHidden);
    modal.show();
  });
}

// "2026-10-26" -> "26.10.2026" (także dla "2026-10-26 14:30:00")
function formatDate(value) {
  if (!value) return '';
  const [y, m, d] = String(value).slice(0, 10).split('-');
  return `${d}.${m}.${y}`;
}

// Oznacza pole jako błędne/poprawne (is-invalid + invalid-feedback z Bootstrapa)
function setInvalid(input, invalid) {
  input.classList.toggle('is-invalid', invalid);
  input.setAttribute('aria-invalid', invalid ? 'true' : 'false');
  return !invalid;
}

// Widok tablicy: trzy kolumny, karty zadań, filtry, okno zadania, zmiana statusu, usuwanie
const boardId = Number(new URLSearchParams(window.location.search).get('id'));
if (!Number.isInteger(boardId) || boardId < 1) {
  window.location.href = 'boards.html';
}

const STATUSES = ['todo', 'in_progress', 'done'];
const PRIORITY_LABELS = { high: 'Wysoki', medium: 'Średni', low: 'Niski' };
const STATUS_LABELS = { todo: 'Do zrobienia', in_progress: 'W trakcie', done: 'Gotowe' };
// Przycisk zmiany statusu: dokąd przenosi zadanie z danej kolumny
const NEXT_STATUS = {
  todo: { to: 'in_progress', label: 'Przenieś do: W trakcie' },
  in_progress: { to: 'done', label: 'Przenieś do: Gotowe' },
  done: { to: 'todo', label: 'Otwórz ponownie' }
};

const alertsBox = document.getElementById('alerts');
const filterPriority = document.getElementById('filterPriority');
const filterAssignee = document.getElementById('filterAssignee');
const filterQuery = document.getElementById('filterQuery');
const taskModalEl = document.getElementById('taskModal');
const taskModal = new bootstrap.Modal(taskModalEl);
const taskForm = document.getElementById('taskForm');
const taskTitle = document.getElementById('taskTitle');
const taskDescription = document.getElementById('taskDescription');
const taskStatus = document.getElementById('taskStatus');
const taskPriority = document.getElementById('taskPriority');
const taskDeadline = document.getElementById('taskDeadline');
const taskAssignee = document.getElementById('taskAssignee');
const taskError = document.getElementById('taskError');
let editingId = null; // null = nowe zadanie, liczba = edycja/szczegóły
let loadCounter = 0; // chroni przed nałożeniem się odpowiedzi przy szybkich zmianach filtrów

function todayIso() {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}

// Buduje kartę zadania (textContent: bez wstrzykiwania HTML)
function taskCard(task) {
  const card = document.createElement('article');
  card.className = `card tb-task shadow-sm priority-${task.priority}`;
  const body = document.createElement('div');
  body.className = 'card-body p-3';

  const title = document.createElement('h3');
  title.className = 'h6 fw-bold mb-1';
  title.textContent = task.title;

  const meta = document.createElement('p');
  meta.className = 'mb-1 d-flex flex-wrap align-items-center gap-2 small';
  const badge = document.createElement('span');
  badge.className = `badge tb-badge priority-${task.priority}`;
  badge.textContent = `Priorytet: ${PRIORITY_LABELS[task.priority]}`;
  meta.append(badge);
  if (task.deadline) {
    const deadline = document.createElement('span');
    const overdue = task.status !== 'done' && task.deadline < todayIso();
    deadline.textContent = `Termin: ${formatDate(task.deadline)}${overdue ? ' (po terminie)' : ''}`;
    deadline.className = overdue ? 'tb-overdue' : 'text-muted-tb';
    meta.append(deadline);
  }

  const person = document.createElement('p');
  person.className = 'small text-muted-tb mb-2';
  person.textContent = `Osoba: ${task.assigneeName || 'nieprzypisane'}`;

  const actions = document.createElement('div');
  actions.className = 'd-flex flex-wrap gap-2';
  const next = NEXT_STATUS[task.status];
  const move = document.createElement('button');
  move.type = 'button';
  move.className = 'btn btn-sm btn-outline-primary';
  move.textContent = next.label;
  move.setAttribute('aria-label', `${next.label} – ${task.title}`);
  move.addEventListener('click', () => changeStatus(task, next.to));
  const details = document.createElement('button');
  details.type = 'button';
  details.className = 'btn btn-sm btn-outline-secondary';
  details.textContent = 'Szczegóły';
  details.setAttribute('aria-label', `Szczegóły zadania ${task.title}`);
  details.addEventListener('click', () => openTaskModal(task.id));
  const del = document.createElement('button');
  del.type = 'button';
  del.className = 'btn btn-sm btn-outline-danger';
  del.textContent = 'Usuń';
  del.setAttribute('aria-label', `Usuń zadanie ${task.title}`);
  del.addEventListener('click', () => deleteTask(task));
  actions.append(move, details, del);

  body.append(title, meta, person, actions);
  card.append(body);
  return card;
}

// Pobiera zadania z aktualnymi filtrami (zapytanie przy każdej zmianie) i rysuje kolumny
async function loadTasks() {
  const params = new URLSearchParams();
  if (filterPriority.value) params.set('priority', filterPriority.value);
  if (filterAssignee.value) params.set('assigneeId', filterAssignee.value);
  if (filterQuery.value.trim()) params.set('q', filterQuery.value.trim());
  const query = params.toString() ? `?${params}` : '';
  const thisLoad = ++loadCounter;
  try {
    const tasks = await api(`/boards/${boardId}/tasks${query}`);
    if (thisLoad !== loadCounter) return; // przyszła nowsza odpowiedź
    for (const status of STATUSES) {
      const column = document.getElementById(`col-${status}`);
      const inColumn = tasks.filter((t) => t.status === status);
      column.innerHTML = '';
      document.getElementById(`count-${status}`).textContent = inColumn.length;
      if (inColumn.length === 0) {
        const empty = document.createElement('p');
        empty.className = 'tb-empty mb-0';
        empty.textContent = 'Brak zadań w tej kolumnie.';
        column.append(empty);
      }
      for (const task of inColumn) {
        column.append(taskCard(task));
      }
    }
  } catch (err) {
    showAlert(alertsBox, err.message, 'danger');
  }
}

async function changeStatus(task, status) {
  try {
    await api(`/tasks/${task.id}/status`, 'PATCH', { status });
    showAlert(alertsBox, `Zmieniono status zadania na: ${STATUS_LABELS[status]}.`);
    loadTasks();
  } catch (err) {
    showAlert(alertsBox, err.message, 'danger');
  }
}

async function deleteTask(task) {
  const ok = await confirmDialog(`Czy na pewno usunąć zadanie „${task.title}”?`);
  if (!ok) return;
  try {
    await api(`/tasks/${task.id}`, 'DELETE');
    showAlert(alertsBox, 'Usunięto zadanie.');
    loadTasks();
  } catch (err) {
    showAlert(alertsBox, err.message, 'danger');
  }
}

// Otwiera okno: nowe zadanie (id = null) albo szczegóły i edycja istniejącego
async function openTaskModal(id) {
  editingId = id;
  taskForm.reset();
  for (const el of [taskTitle, taskDescription, taskDeadline]) setInvalid(el, false);
  taskError.innerHTML = '';
  document.getElementById('taskCreated').textContent = '';
  if (id === null) {
    document.getElementById('taskModalTitle').textContent = 'Nowe zadanie';
  } else {
    try {
      const task = await api(`/tasks/${id}`);
      document.getElementById('taskModalTitle').textContent = `Zadanie: ${task.title}`;
      taskTitle.value = task.title;
      taskDescription.value = task.description || '';
      taskStatus.value = task.status;
      taskPriority.value = task.priority;
      taskDeadline.value = task.deadline || '';
      taskAssignee.value = task.assigneeId ? String(task.assigneeId) : '';
      document.getElementById('taskCreated').textContent = `Utworzono: ${formatDate(task.createdAt)}`;
    } catch (err) {
      showAlert(alertsBox, err.message, 'danger');
      loadTasks();
      return;
    }
  }
  taskModal.show();
}

taskForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const title = taskTitle.value.trim();
  const description = taskDescription.value.trim();
  const deadline = taskDeadline.value;
  const okTitle = setInvalid(taskTitle, title.length < 3 || title.length > 100);
  const okDescription = setInvalid(taskDescription, description.length > 2000);
  const okDeadline = setInvalid(taskDeadline,
    deadline !== '' && (!/^\d{4}-\d{2}-\d{2}$/.test(deadline) || Number.isNaN(Date.parse(deadline))));
  if (!okTitle || !okDescription || !okDeadline) return;

  const payload = {
    title,
    description,
    status: taskStatus.value,
    priority: taskPriority.value,
    deadline: deadline || null,
    assigneeId: taskAssignee.value ? Number(taskAssignee.value) : null
  };
  try {
    if (editingId === null) {
      await api('/tasks', 'POST', { ...payload, boardId });
    } else {
      await api(`/tasks/${editingId}`, 'PUT', payload);
    }
    taskModal.hide();
    showAlert(alertsBox, editingId === null ? 'Dodano zadanie.' : 'Zapisano zmiany w zadaniu.');
    loadTasks();
  } catch (err) {
    showAlert(taskError, err.message, 'danger'); // komunikat z API
  }
});

for (const el of [taskTitle, taskDescription, taskDeadline]) {
  el.addEventListener('input', () => setInvalid(el, false));
}
taskModalEl.addEventListener('shown.bs.modal', () => taskTitle.focus());
document.getElementById('newTaskBtn').addEventListener('click', () => openTaskModal(null));

// Filtry: zapytanie do API przy każdej zmianie (pole tekstowe z krótkim opóźnieniem)
let searchTimer = null;
filterPriority.addEventListener('change', loadTasks);
filterAssignee.addEventListener('change', loadTasks);
filterQuery.addEventListener('input', () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(loadTasks, 250);
});
document.getElementById('filters').addEventListener('submit', (e) => e.preventDefault());
document.getElementById('clearFilters').addEventListener('click', () => {
  filterPriority.value = '';
  filterAssignee.value = '';
  filterQuery.value = '';
  loadTasks();
});

// Lista osób do filtra i do okna zadania
function fillPeople(users) {
  for (const user of users) {
    const name = `${user.firstName} ${user.lastName}`;
    for (const select of [filterAssignee, taskAssignee]) {
      const option = document.createElement('option');
      option.value = String(user.id);
      option.textContent = name;
      select.append(option);
    }
  }
}

async function start() {
  await initHeader();
  try {
    const board = await api(`/boards/${boardId}`);
    document.getElementById('boardTitle').textContent = board.name;
    document.getElementById('crumbName').textContent = board.name;
    document.getElementById('boardDescription').textContent = board.description || '';
    document.title = `${board.name} – TaskBoard`;
  } catch (err) {
    document.getElementById('newTaskBtn').disabled = true;
    showAlert(alertsBox, `${err.message}. Wróć do listy tablic.`, 'danger');
    return;
  }
  fillPeople(await api('/users'));
  loadTasks();
}

start();

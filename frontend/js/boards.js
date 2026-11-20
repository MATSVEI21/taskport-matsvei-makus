// Lista tablic: karty, dodawanie i edycja w oknie (modal), usuwanie z potwierdzeniem
const alertsBox = document.getElementById('alerts');
const boardList = document.getElementById('boardList');
const boardModalEl = document.getElementById('boardModal');
const boardModal = new bootstrap.Modal(boardModalEl);
const boardForm = document.getElementById('boardForm');
const boardName = document.getElementById('boardName');
const boardDescription = document.getElementById('boardDescription');
const boardError = document.getElementById('boardError');
let editingId = null; // null = nowa tablica, liczba = edycja istniejącej

// Buduje kartę jednej tablicy (textContent: bez wstrzykiwania HTML)
function boardCard(board) {
  const col = document.createElement('div');
  col.className = 'col-12 col-md-6 col-xl-4';

  const card = document.createElement('article');
  card.className = 'card tb-board-card shadow-sm h-100';

  const body = document.createElement('div');
  body.className = 'card-body';
  const title = document.createElement('h2');
  title.className = 'h5 card-title';
  title.textContent = board.name;
  const description = document.createElement('p');
  description.className = 'text-muted-tb';
  description.textContent = board.description || 'Brak opisu.';
  const owner = document.createElement('p');
  owner.className = 'mb-0 small';
  owner.textContent = `Utworzył(a): ${board.ownerName}`;
  const count = document.createElement('p');
  count.className = 'mb-0 small';
  count.textContent = `Aktywne zadania: ${board.activeTasks}`;
  body.append(title, description, owner, count);

  const footer = document.createElement('div');
  footer.className = 'card-footer bg-white d-flex flex-wrap gap-2';
  const open = document.createElement('a');
  open.className = 'btn btn-sm btn-primary';
  open.href = `board.html?id=${board.id}`;
  open.textContent = 'Otwórz';
  open.setAttribute('aria-label', `Otwórz tablicę ${board.name}`);
  const edit = document.createElement('button');
  edit.type = 'button';
  edit.className = 'btn btn-sm btn-outline-primary';
  edit.textContent = 'Edytuj';
  edit.setAttribute('aria-label', `Edytuj tablicę ${board.name}`);
  edit.addEventListener('click', () => openModal(board));
  const del = document.createElement('button');
  del.type = 'button';
  del.className = 'btn btn-sm btn-outline-danger';
  del.textContent = 'Usuń';
  del.setAttribute('aria-label', `Usuń tablicę ${board.name}`);
  del.addEventListener('click', () => deleteBoard(board));
  footer.append(open, edit, del);

  card.append(body, footer);
  col.append(card);
  return col;
}

async function loadBoards() {
  try {
    const boards = await api('/boards');
    boardList.innerHTML = '';
    if (boards.length === 0) {
      const empty = document.createElement('p');
      empty.className = 'text-muted-tb';
      empty.textContent = 'Nie ma jeszcze żadnej tablicy. Dodaj pierwszą przyciskiem „Nowa tablica”.';
      boardList.append(empty);
      return;
    }
    for (const board of boards) {
      boardList.append(boardCard(board));
    }
  } catch (err) {
    showAlert(alertsBox, err.message, 'danger');
  }
}

function openModal(board) {
  editingId = board ? board.id : null;
  document.getElementById('boardModalTitle').textContent = board ? 'Edytuj tablicę' : 'Nowa tablica';
  boardName.value = board ? board.name : '';
  boardDescription.value = board && board.description ? board.description : '';
  setInvalid(boardName, false);
  setInvalid(boardDescription, false);
  boardError.innerHTML = '';
  boardModal.show();
}

async function deleteBoard(board) {
  const ok = await confirmDialog(
    `Czy na pewno usunąć tablicę „${board.name}”? Jej zadania przestaną być widoczne.`
  );
  if (!ok) return;
  try {
    await api(`/boards/${board.id}`, 'DELETE');
    showAlert(alertsBox, 'Usunięto tablicę.');
    loadBoards();
  } catch (err) {
    showAlert(alertsBox, err.message, 'danger');
  }
}

document.getElementById('newBoardBtn').addEventListener('click', () => openModal(null));
boardModalEl.addEventListener('shown.bs.modal', () => boardName.focus());

boardForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const name = boardName.value.trim();
  const description = boardDescription.value.trim();
  const okName = setInvalid(boardName, name.length < 1 || name.length > 80);
  const okDescription = setInvalid(boardDescription, description.length > 255);
  if (!okName || !okDescription) return;

  try {
    if (editingId === null) {
      await api('/boards', 'POST', { name, description });
    } else {
      await api(`/boards/${editingId}`, 'PUT', { name, description });
    }
    boardModal.hide();
    showAlert(alertsBox, editingId === null ? 'Dodano tablicę.' : 'Zapisano zmiany w tablicy.');
    loadBoards();
  } catch (err) {
    showAlert(boardError, err.message, 'danger');
  }
});

boardName.addEventListener('input', () => setInvalid(boardName, false));
boardDescription.addEventListener('input', () => setInvalid(boardDescription, false));

initHeader().then(loadBoards);

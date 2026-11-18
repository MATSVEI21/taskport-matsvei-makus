# Taskboard

## Opis aplikacji

Taskboard to aplikacja do zarządzania zadaniami zespołu (wersja 1.0). Umożliwia organizowanie pracy w tablicach, tworzenie zadań, filtrowanie ich i śledzenie postępów w trzech kolumnach: „Do zrobienia”, „W trakcie” i „Gotowe”.

### Funkcje

- Rejestracja i logowanie (hasła zapisywane jako hash bcrypt, sesja w ciasteczku); bez logowania widoki przenoszą na stronę logowania.
- Tablice: lista kart, dodawanie, edycja w oknie i usuwanie z potwierdzeniem (usunięcie miękkie).
- Zadania: dodawanie, edycja, szczegóły, zmiana statusu przyciskiem i usuwanie z potwierdzeniem.
- Filtry zadań po priorytecie, osobie i fragmencie tytułu, łączone ze sobą.
- Walidacja formularzy w przeglądarce i w API; komunikaty błędów z API.
- Widok na telefonie: kolumny jedna pod drugą.

## Technologie

- **Git** – rozproszony system kontroli wersji; pozwala śledzić historię zmian
  i pracować na osobnych gałęziach (branch).
- **GitHub** – hosting repozytorium; Pull Requesty, przegląd zmian oraz ochrona
  gałęzi `main` (wymagany PR i zielone sprawdzenie przed scaleniem).
- **GitHub Actions** – workflow uruchamiany przy każdym Pull Requeście;
  sprawdza strukturę projektu i poprawność plików Markdown.
- **Bash** – skrypt `.github/sprawdzenie.sh` weryfikujący strukturę folderów.
- **Node.js i markdownlint-cli2** – lintowanie plików Markdown w workflow.
- **Markdown** – język dokumentacji projektu (README, opisy zadań, opis danych).
- **Mermaid** – diagramy ERD osadzone w dokumentacji i renderowane przez GitHub.
- **HTML, CSS i JavaScript (bez frameworka)** – trzy widoki frontendu (`frontend/`): logowanie, lista tablic i widok tablicy.
- **Bootstrap 5.3** – siatka, formularze, okna modalne i walidacja (`is-invalid`); własne kolory i style w `frontend/css/style.css`.
- **Node.js i Express** – środowisko i framework backendu; REST API (`backend/`), obsługa sesji (`express-session`) i haseł (`bcryptjs`).
- **MySQL (XAMPP, MariaDB)** – relacyjna baza danych `taskboard` z tabelami `users`, `boards` i `tasks`; sterownik `mysql2`.
- **Postman** – ręczne testowanie tras API; kolekcja w `docs/postman/`.

## Struktura folderów

| Folder | Opis |
| --- | --- |
| frontend/ | Widoki `login.html`, `boards.html`, `board.html`, skrypty w `js/` i style w `css/` |
| backend/ | API Express: trasy w `routes/`, ochrona tras w `middleware/` |
| database/ | Skrypty SQL: baza i dane testowe, konta, zapytania, kopia zapasowa |
| docs/ | Dokumentacja: `api.md`, `testy.md`, kolekcja Postman, opisy zadań |
| materialy/ | Materiały z zajęć: makieta, diagram ERD, ćwiczenie z debuggerem |

## Baza danych

Baza `taskboard` (MySQL) jest zgodna z diagramem ERD z `materialy/erd.md`.

### Tabele

| Tabela | Opis |
| --- | --- |
| users | Użytkownicy: login (unikalny, 3–30 znaków), hash hasła, imię i nazwisko |
| boards | Tablice: nazwa (1–80 znaków), opis, właściciel (`ownerId`) |
| tasks | Zadania: tytuł (3–100 znaków), opis, `status`, `priority`, termin, tablica, osoba |

### Relacje

- Użytkownik może mieć wiele tablic (`boards.ownerId` → `users.id`).
- Tablica zawiera wiele zadań (`tasks.boardId` → `boards.id`); zadanie należy do dokładnie jednej tablicy.
- Zadanie może mieć przypisaną osobę (`tasks.assigneeId` → `users.id`, pole opcjonalne).
- Osoba, która usunęła rekord, jest zapisana w `deletedById` (→ `users.id`).
- Dozwolone wartości: `status` – `todo`, `in_progress`, `done`; `priority` – `low`, `medium`, `high`.

### Soft delete

Tabele `boards` i `tasks` nie usuwają rekordów od razu. Usunięcie ustawia naraz `isDeleted = 1`, `deletedAt` i `deletedById`, a aplikacja pokazuje tylko rekordy z `isDeleted = 0`. Trwałe usunięcie (po 30 dniach) wykonuje administrator zapytaniem z `database/queries.sql`.

### Jak odtworzyć bazę

1. Uruchom MySQL w XAMPP.
2. Z głównego folderu projektu wykonaj skrypt, który usuwa i tworzy bazę od zera razem z danymi testowymi:
   `mysql -u root < database/taskboard.sql`
   (albo w phpMyAdmin: zakładka Import, plik `database/taskboard.sql`).
3. Zapytania do ćwiczeń znajdują się w `database/queries.sql`.

### Konta bazy danych

Skrypt `database/konta.sql` (uruchamiany jako `root`: `mysql -u root < database/konta.sql`) tworzy trzy konta:

| Konto | Uprawnienia | Do czego |
| --- | --- | --- |
| taskboard_admin | ALL PRIVILEGES na taskboard.* | administracja, trwałe usuwanie zadań, kopie zapasowe |
| taskboard_app | SELECT, INSERT, UPDATE | konto backendu (bez DELETE, bo usuwamy miękko) |
| taskboard_readonly | SELECT | podgląd danych i raporty |

Hasła w skrypcie są przykładowe (środowisko szkolne).

### Kopia zapasowa

Kopia `database/backup/taskboard_backup.sql` powstała poleceniem
`mysqldump -u root --no-create-db taskboard`. Odtworzenie w bazie `taskboard_test`
i porównanie liczby rekordów:

| Tabela | taskboard | taskboard_test |
| --- | --- | --- |
| users | 5 | 5 |
| boards | 2 | 2 |
| tasks | 11 | 11 |
| tasks z isDeleted = 1 | 3 | 3 |

Liczby są takie same, więc kopia zapasowa odtwarza bazę poprawnie.

## Uruchomienie

Wymagania: Git, Node.js 20 lub nowszy, MySQL lub MariaDB (np. XAMPP).

1. Sklonuj repozytorium i wejdź do folderu projektu:

   ```text
   git clone https://github.com/MATSVEI21/taskport-matsvei-makus.git
   cd taskport-matsvei-makus
   ```

2. Uruchom MySQL w XAMPP i odtwórz bazę wraz z danymi testowymi oraz kontami (sekcja „Baza danych”):

   ```text
   mysql -u root < database/taskboard.sql
   mysql -u root < database/konta.sql
   ```

3. Skopiuj wzór konfiguracji do pliku `.env` w głównym folderze projektu i wpisz własny `SESSION_SECRET` (plik `.env` nie trafia do repozytorium):

   ```text
   cp .env.example .env
   ```

4. Zainstaluj zależności i uruchom serwer (API i strony działają pod jednym adresem):

   ```text
   cd backend
   npm install
   npm start
   ```

5. Otwórz `http://localhost:3000` (strona przenosi na logowanie). Sprawdzenie API: `http://localhost:3000/api/health` zwraca `{"ok":true}`.

Użytkownicy z danych testowych (`anna.nowak`, `jan.kowalski`, …) mają wspólny hash hasła z pliku `users.csv`, którego hasło nie jest podane w repozytorium. Aby się zalogować, załóż własne konto w zakładce „Rejestracja”.

## Dokumentacja i testy

- [Dokumentacja API](docs/api.md) – tabela tras, filtry, walidacja i przykłady JSON.
- [Raport testów](docs/testy.md) – 21 przypadków testowych z wynikami, Lighthouse i W3C.
- Kolekcja Postman: `docs/postman/taskboard.postman_collection.json`.
- Opisy zadań: `docs/zadania/` (TB-1, TB-2, TB-3).

### Wyniki jakości

- Lighthouse (wydajność, dostępność, najlepsze praktyki, SEO): co najmniej 92 na wszystkich trzech stronach, w wersji mobilnej i na komputer.
- Walidator W3C: 0 błędów w `login.html`, `boards.html` i `board.html`.

## Autor

Matsvei Makus

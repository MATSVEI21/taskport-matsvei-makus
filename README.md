# Taskboard

## Opis aplikacji

Taskboard to aplikacja do zarządzania zadaniami.
Umożliwia organizowanie pracy, tworzenie zadań oraz śledzenie postępów ich realizacji.

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
- **Frontend** – warstwa interfejsu użytkownika (tablice, zadania, filtry);
  konkretna technologia zostanie wybrana w kolejnych zadaniach.
- **Node.js i Express** – środowisko i framework backendu; REST API dla użytkowników, tablic i zadań (`backend/`).
- **MySQL (XAMPP, MariaDB)** – relacyjna baza danych `taskboard` z tabelami `users`, `boards` i `tasks`; sterownik `mysql2`.
- **Postman** – ręczne testowanie tras API; kolekcja w `docs/postman/`.

## Struktura folderów

| Folder | Opis |
| --- | --- |
| frontend/ | Interfejs użytkownika |
| backend/ | Logika aplikacji i API |
| database/ | Struktura bazy danych |
| docs/ | Dokumentacja projektu |
| docs/zadania/ | Dokumentacja zadań |

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

### Kopia zapasowa

Kopia `database/backup/taskboard_backup.sql` powstała poleceniem
`mysqldump -u root --no-create-db taskboard`. Odtworzenie w bazie `taskboard_test`
i porównanie liczby rekordów:

| Tabela | taskboard | taskboard_test |
| --- | --- | --- |
| users | 5 | 5 |
| boards | 2 | 2 |
| tasks | 10 | 10 |
| tasks z isDeleted = 1 | 2 | 2 |

Liczby są takie same, więc kopia zapasowa odtwarza bazę poprawnie.

## Uruchomienie

1. Sklonuj repozytorium: `git clone <adres-repozytorium>` i otwórz folder w VS Code.
2. Uruchom MySQL w XAMPP i odtwórz bazę (sekcja „Baza danych”).
3. W głównym folderze projektu utwórz plik `.env` (nie trafia do repozytorium):

   ```text
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=taskboard
   ```

4. Zainstaluj zależności i uruchom API:

   ```text
   cd backend
   npm install
   npm start
   ```

5. Sprawdź działanie: `http://localhost:3000/api/health` zwraca `{"ok":true}`.

## Autor

Matsvei Makus

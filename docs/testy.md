# Raport testów TaskBoard

Data testów: 18.11.2026. Środowisko: Windows, Node.js 26, MariaDB 10.4 (XAMPP), Chrome.
Dane początkowe: baza odtworzona skryptem `database/taskboard.sql`.
Testy API wykonano skryptem w PowerShell z sesją (ciasteczko `connect.sid`), testy interfejsu
w przeglądarce, a trasy zadań dodatkowo kolekcją Postman (`docs/postman/`, 19 zapytań).

## Przypadki testowe

| Nr | Obszar | Kroki | Oczekiwany wynik | Wynik |
| --- | --- | --- | --- | --- |
| 1 | Logowanie | Wejść na `boards.html` bez logowania | Przekierowanie na `login.html` (API zwraca 401) | Zaliczony |
| 2 | Logowanie | Wysłać puste pola, potem login `anna.nowak` i hasło `zle` | Komunikaty przy polach, potem „Nieprawidłowy login lub hasło” z API (401) | Zaliczony |
| 3 | Rejestracja | Wysłać pusty formularz, login `x`, hasło `123`, różne powtórzenie | Komunikaty `invalid-feedback` przy każdym błędnym polu | Zaliczony |
| 4 | Rejestracja | Wypełnić poprawnie i kliknąć „Utwórz konto” | Konto powstaje, przejście na `boards.html`, w nagłówku imię i „Wyloguj” | Zaliczony |
| 5 | Rejestracja (API) | Zajęty login `anna.nowak` | 409 i komunikat „Ten login jest już zajęty” | Zaliczony |
| 6 | Tablice | Dodać tablicę z pustą nazwą, potem „Tablica UI” | Błąd walidacji, potem nowa karta i komunikat | Zaliczony |
| 7 | Tablice | Edytować nazwę tablicy w oknie | Zmiana widoczna na karcie | Zaliczony |
| 8 | Tablice | Usunąć tablicę: „Anuluj”, potem potwierdzenie | Anulowanie zostawia tablicę, potwierdzenie usuwa (soft delete) | Zaliczony |
| 9 | Zadania | Dodać zadanie z tytułem „ab”, potem „Zadanie z testu UI” | Błąd „Tytuł musi mieć od 3 do 100 znaków”, potem karta w „Do zrobienia” | Zaliczony |
| 10 | Zadania | Przycisk „Przenieś do: W trakcie” | Karta przechodzi do kolumny „W trakcie”, zmieniają się liczniki i przycisk | Zaliczony |
| 11 | Zadania | „Szczegóły”, zmiana tytułu, zapis | Zmiana widoczna na karcie | Zaliczony |
| 12 | Zadania | Usunąć zadanie z potwierdzeniem | Karta znika, w bazie `isDeleted = 1` i `deletedById` osoby z sesji | Zaliczony |
| 13 | Filtry | Priorytet „Wysoki”, potem „API” w wyszukiwarce, potem osoba | Filtry łączą się, lista się zawęża przy każdej zmianie | Zaliczony |
| 14 | Filtry | „Wyczyść filtry” | Wracają wszystkie zadania | Zaliczony |
| 15 | Filtry (API) | `?priority=pilne` oraz `?assigneeId=abc` | 400 w obu przypadkach | Zaliczony |
| 16 | Filtry (API) | `?priority=high&assigneeId=2&q=API`, `?q=%` | 200; znak `%` traktowany dosłownie | Zaliczony |
| 17 | Zadania (API) | `POST /api/tasks` z nieistniejącą tablicą, złym statusem, złym terminem | 400 z komunikatem po polsku | Zaliczony |
| 18 | Zadania (API) | `GET`, `PUT`, `PATCH`, `DELETE` dla id 999 | 404 | Zaliczony |
| 19 | Użytkownicy | `GET /api/users` po zalogowaniu | 200, brak pola `passwordHash` | Zaliczony |
| 20 | Wylogowanie | „Wyloguj”, potem wejść na `board.html?id=1` | Przekierowanie na `login.html`, API zwraca 401 | Zaliczony |
| 21 | Telefon | Szerokość 390 px, `board.html` | Kolumny jedna pod drugą, filtry jeden pod drugim, nagłówek w jednej linii | Zaliczony |

Łącznie 21 przypadków, wszystkie zaliczone. Skrypt API wykonał 41 zapytań, wszystkie
zwróciły oczekiwane kody (200, 201, 204, 400, 401, 404, 409).

## Lighthouse (18.11.2026)

| Strona | Wersja | Wydajność | Dostępność | Najlepsze praktyki | SEO |
| --- | --- | --- | --- | --- | --- |
| login.html | mobilna | 99 | 100 | 96 | 100 |
| boards.html | mobilna | 99 | 100 | 96 | 100 |
| board.html | mobilna | 92 | 96 | 96 | 100 |
| login.html | komputer | 100 | 100 | 96 | 100 |
| boards.html | komputer | 100 | 100 | 96 | 100 |
| board.html | komputer | 100 | 96 | 96 | 100 |

Wszystkie wyniki są co najmniej 90 (najniższy: 92).

## Walidator W3C

Pliki `login.html`, `boards.html` i `board.html` sprawdzono walidatorem HTML
(`validator.w3.org/nu`): 0 błędów i 0 ostrzeżeń. Podczas testów poprawiono dwa błędy:
brak atrybutu `role="dialog"` w oknach modalnych.

## Znalezione i poprawione usterki

- Atrybut `aria-labelledby` na oknach modalnych bez roli – dodano `role="dialog"` (W3C).
- Komunikat błędu logowania nie znikał po przełączeniu zakładki – komunikat jest teraz czyszczony.

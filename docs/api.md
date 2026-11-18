# Dokumentacja API TaskBoard

Adres bazowy: `http://localhost:3000/api`. Dane w formacie JSON (`Content-Type: application/json`).

Wszystkie trasy poza `GET /api/health`, `POST /api/auth/register` i `POST /api/auth/login`
wymagają zalogowania (sesja w ciasteczku `connect.sid`). Bez logowania API zwraca `401`
i komunikat `{ "error": "Musisz się zalogować" }`, a frontend przenosi na `login.html`.

Błędy mają zawsze postać `{ "error": "komunikat po polsku" }`.

## Trasy

| Metoda | Ścieżka | Opis | Kody |
| --- | --- | --- | --- |
| GET | `/api/health` | Sprawdzenie, czy serwer działa | 200 |
| POST | `/api/auth/register` | Rejestracja (loguje od razu) | 201, 400, 409 |
| POST | `/api/auth/login` | Logowanie | 200, 400, 401 |
| POST | `/api/auth/logout` | Wylogowanie | 204 |
| GET | `/api/auth/me` | Zalogowana osoba | 200, 401 |
| GET | `/api/users` | Lista użytkowników (bez `passwordHash`) | 200, 401 |
| GET | `/api/boards` | Lista tablic z autorem i liczbą aktywnych zadań | 200, 401 |
| GET | `/api/boards/:id` | Szczegóły tablicy | 200, 401, 404 |
| POST | `/api/boards` | Nowa tablica (właściciel z sesji) | 201, 400, 401 |
| PUT | `/api/boards/:id` | Zmiana nazwy i opisu tablicy | 200, 400, 401, 404 |
| DELETE | `/api/boards/:id` | Usunięcie miękkie tablicy | 204, 401, 404 |
| GET | `/api/boards/:boardId/tasks` | Zadania tablicy z filtrami (patrz niżej) | 200, 400, 401, 404 |
| GET | `/api/tasks/:id` | Szczegóły zadania | 200, 401, 404 |
| POST | `/api/tasks` | Nowe zadanie | 201, 400, 401 |
| PUT | `/api/tasks/:id` | Zmiana zadania | 200, 400, 401, 404 |
| PATCH | `/api/tasks/:id/status` | Zmiana samego statusu | 200, 400, 401, 404 |
| DELETE | `/api/tasks/:id` | Usunięcie miękkie zadania | 204, 401, 404 |

## Filtry zadań

`GET /api/boards/:boardId/tasks` przyjmuje parametry łączone ze sobą (warunek `AND`):

| Parametr | Wartość | Błąd |
| --- | --- | --- |
| `priority` | `low`, `medium` lub `high` | 400 przy innej wartości |
| `assigneeId` | liczba całkowita (id osoby) | 400, gdy to nie liczba |
| `q` | fragment tytułu (`LIKE`, znaki `%` i `_` traktowane dosłownie) | brak |

Przykład: `GET /api/boards/1/tasks?priority=high&assigneeId=2&q=API`.
Zadania są sortowane po terminie (bez terminu na końcu).

## Walidacja

| Pole | Reguła |
| --- | --- |
| `login` | 3–30 znaków: litery, cyfry, kropka, myślnik, podkreślnik; unikalny (409) |
| `password` | 8–72 znaków, w bazie tylko hash bcrypt |
| `firstName`, `lastName` | 1–50 znaków |
| tablica `name` | 1–80 znaków, `description` do 255 znaków |
| zadanie `title` | 3–100 znaków |
| zadanie `status` | `todo`, `in_progress`, `done` (domyślnie `todo`) |
| zadanie `priority` | `low`, `medium`, `high` (domyślnie `medium`) |
| zadanie `deadline` | `RRRR-MM-DD` albo puste |
| zadanie `boardId` | tablica musi istnieć |
| zadanie `assigneeId` | osoba musi istnieć albo puste |

## Przykłady JSON

Logowanie `POST /api/auth/login`:

```json
{ "login": "anna.nowak", "password": "haslo1234" }
```

Odpowiedź `200`:

```json
{ "id": 1, "login": "anna.nowak", "firstName": "Anna", "lastName": "Nowak" }
```

Nowe zadanie `POST /api/tasks`:

```json
{
  "title": "Uzupełnić README",
  "description": "Sekcja o uruchomieniu",
  "status": "todo",
  "priority": "high",
  "deadline": "2026-12-01",
  "boardId": 1,
  "assigneeId": 2
}
```

Odpowiedź `GET /api/tasks/1`:

```json
{
  "id": 1,
  "title": "Uzupełnić README",
  "description": "Sekcja o uruchomieniu",
  "status": "todo",
  "priority": "high",
  "deadline": "2026-12-01",
  "boardId": 1,
  "assigneeId": 2,
  "assigneeName": "Jan Kowalski",
  "createdAt": "2026-11-18 16:25:23"
}
```

Zmiana statusu `PATCH /api/tasks/1/status`:

```json
{ "status": "in_progress" }
```

Błąd `400`:

```json
{ "error": "Tytuł musi mieć od 3 do 100 znaków" }
```

## Usuwanie miękkie

`DELETE` na tablicy i zadaniu nie kasuje rekordu. Ustawia `isDeleted = 1`, `deletedAt`
i `deletedById` (osoba z sesji), a listy pokazują tylko rekordy z `isDeleted = 0`.

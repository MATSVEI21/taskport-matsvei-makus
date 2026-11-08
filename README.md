# Taskboard

## Opis aplikacji

Taskboard to aplikacja do zarządzania zadaniami.
Umożliwia organizowanie pracy, tworzenie zadań
oraz śledzenie postępów ich realizacji.

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
- **Backend** – logika aplikacji i API dla użytkowników, tablic i zadań;
  konkretna technologia zostanie wybrana w kolejnych zadaniach.
- **Baza danych (SQL)** – relacyjne przechowywanie danych (użytkownik, tablica,
  zadanie) zgodnie z modelem z `docs/dane.md`.

## Struktura folderów

| Folder | Opis |
| --- | --- |
| frontend/ | Interfejs użytkownika |
| backend/ | Logika aplikacji i API |
| database/ | Struktura bazy danych |
| docs/ | Dokumentacja projektu |
| docs/zadania/ | Dokumentacja zadań |

## Uruchomienie

1. Sklonuj repozytorium:
   `git clone <adres-repozytorium>`
2. Otwórz folder projektu w VS Code.
3. Zainstaluj wymagane zależności po skonfigurowaniu projektu.
4. Uruchom aplikację zgodnie z instrukcją odpowiedniego modułu.

## Autor

Matsvei Makus

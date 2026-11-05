# TB-1 – Przygotowanie struktury projektu

## Cel zadania

Przygotowanie repozytorium projektu Taskboard, struktury folderów oraz podstawowych zasad pracy z Git i GitHub.

## Zadania do wykonania

1. Jeśli nie masz jeszcze repozytorium, na stronie szablonu kliknij Use this template, następnie Create a new repository. Nazwij repozytorium taskboard-imie-nazwisko i ustaw je jako Public.

2. Ustawienia repozytorium:
   - Scalanie tylko przez Merge commit.
   - Wymagany Pull Request dla gałęzi main.
   - Blokada force push.
   - Blokada usuwania gałęzi main.
   - Po pierwszym uruchomieniu workflow dodaj wymagane sprawdzenie do reguły.

3. Utwórz branch feature/tb-1-start.

4. Utwórz foldery:
   - frontend/
   - backend/
   - database/
   - docs/
   - docs/zadania/

   W każdym folderze umieść README.md z opisem odpowiedzialności folderu (2–4 zdania).

5. Uzupełnij główny README.md według szablonu:
   - Opis aplikacji.
   - Technologie.
   - Tabela folderów.
   - Szkic sekcji Uruchomienie.
   - Autor.

6. Dodaj plik .gitignore z wpisami:
   - node_modules/
   - .env

7. Wklej treść zadania do docs/zadania/TB-1.md.

8. Wykonaj co najmniej 3 commity z opisami. Wyślij branch na GitHub i otwórz Pull Request do main. Gdy workflow będzie zielony, scal Pull Request przez Merge commit. Nie usuwaj brancha.

## Wskazówki Git

Utworzenie brancha:

git switch -c feature/tb-1-start

Dodawanie plików:

git add .

Tworzenie commita:

git commit -m "docs: opis folderów"

Wysyłanie brancha:

git push -u origin feature/tb-1-start

Przed każdym git add . sprawdź git status, żeby nie wysłać niechcianych plików.

## Workflow

W przypadku czerwonego workflow otwórz zakładkę Actions w repozytorium. Komunikat błędu wskazuje, czego brakuje.

## Gotowe, gdy

- Każdy folder ma README.md z opisem.
- Główne README zawiera wszystkie wymagane sekcje.
- .gitignore zawiera node_modules/ i .env.
- Gałąź main jest chroniona.
- Scalanie odbywa się tylko przez Merge commit.
- Pull Request z branchu feature/tb-1-start ma zielony workflow.
- Pull Request jest scalony do main.
- Branch feature/tb-1-start nie został usunięty.

## Termin

Zadanie należy zakończyć do piątku do godziny 18:00.
## TB-1 część 2 – opis danych

Pełny opis danych aplikacji (użytkownik, tablica, zadanie) wraz z powiązaniami,
przykładem JSON i wstępnym diagramem ERD znajduje się w pliku docs/dane.md.
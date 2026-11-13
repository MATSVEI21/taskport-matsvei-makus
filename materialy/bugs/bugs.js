// Ćwiczenie z debuggerem (poniedziałek 3).
// Ten skrypt ma 5 błędów. Otwórz index.html w przeglądarce (np. przez Live Server),
// włącz DevTools (F12) i znajdź błędy: zakładka Console pokazuje komunikaty,
// a w zakładce Sources ustawisz breakpoint i podejrzysz wartości zmiennych.
// Przy każdej poprawce dopisz komentarz, co było nie tak.

const zadania = [
  { tytul: 'Struktura repozytorium', status: 'done' },
  { tytul: 'Skrypt bazy danych', status: 'done' },
  { tytul: 'API tablic', status: 'in_progress' },
  { tytul: 'Widok tablicy', status: 'todo' },
  { tytul: 'Raport testów', status: 'todo' }
];

function policzWykonane(lista) {
  let licznik = 0;
  for (let i = 0; i < lista.length; i++) { // POPRAWKA 1: <= wychodzilo poza tablice (lista[5] to undefined, TypeError); powinno byc <
    if (lista[i].status === 'done') { // POPRAWKA 2: = to przypisanie (warunek zawsze prawdziwy); porownujemy przez ===
      licznik++;
    }
  }
  return licznik; // POPRAWKA 3: funkcja nic nie zwracala (undefined, wynik NaN%)
}

function pokazPodsumowanie() {
  const wykonane = policzWykonane(zadania); // POPRAWKA 4: literowka w nazwie zmiennej (zadanie zamiast zadania), ReferenceError
  const procent = Math.round((wykonane / zadania.length) * 100);
  document.getElementById('wynik').textContent = `Wykonane: ${wykonane} z ${zadania.length} (${procent}%)`;
}

document.getElementById('policz').addEventListener('click', pokazPodsumowanie); // POPRAWKA 5: literowka w nazwie zdarzenia (clik zamiast click), przycisk nic nie robil

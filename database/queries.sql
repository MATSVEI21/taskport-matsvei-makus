-- Zapytania SQL do bazy TaskBoard (TB-2, czesc 1).
-- Uruchamiac po zaimportowaniu database/taskboard.sql.
USE taskboard;

-- 1. Zadania o priorytecie high posortowane wedlug terminu (najblizszy termin pierwszy).
--    Pomijamy zadania usuniete miekko (isDeleted = 1).
SELECT id, title, deadline, status
FROM tasks
WHERE priority = 'high' AND isDeleted = 0
ORDER BY deadline ASC;

-- 2. Zadania po terminie i niezakonczone.
--    Termin musi byc wczesniejszy niz dzisiejsza data, a status inny niz done.
SELECT id, title, deadline, status
FROM tasks
WHERE deadline < CURDATE() AND status <> 'done' AND isDeleted = 0
ORDER BY deadline ASC;

-- 3. Zadanie z nazwa tablicy i loginem osoby (JOIN trzech tabel).
--    LEFT JOIN do users zachowuje tez zadania bez przypisanej osoby (login = NULL).
SELECT t.id, t.title, b.name AS tablica, u.login AS osoba
FROM tasks t
JOIN boards b ON b.id = t.boardId
LEFT JOIN users u ON u.id = t.assigneeId
WHERE t.isDeleted = 0;

-- 4. Liczba zadan w kazdym statusie dla wybranej tablicy (tu: tablica o id = 1).
--    GROUP BY grupuje wiersze wedlug statusu, a COUNT(*) liczy je w kazdej grupie.
SELECT status, COUNT(*) AS liczba_zadan
FROM tasks
WHERE boardId = 1 AND isDeleted = 0
GROUP BY status;

-- 5. Usuniete zadania z loginem osoby, ktora je usunela.
--    Tym razem szukamy rekordow z isDeleted = 1, a login pochodzi z deletedById.
SELECT t.id, t.title, t.deletedAt, u.login AS usunal
FROM tasks t
JOIN users u ON u.id = t.deletedById
WHERE t.isDeleted = 1;

-- 6. Uzytkownicy bez zadnego zadania (LEFT JOIN).
--    Po LEFT JOIN uzytkownik bez zadan ma w kolumnie t.id wartosc NULL.
SELECT u.id, u.login
FROM users u
LEFT JOIN tasks t ON t.assigneeId = u.id AND t.isDeleted = 0
WHERE t.id IS NULL;

-- 7. Zadania z tytulem zawierajacym slowo (tu: "API").
--    Znaki % oznaczaja dowolny ciag znakow przed i po slowie.
SELECT id, title, status
FROM tasks
WHERE title LIKE '%API%' AND isDeleted = 0;

-- 8. Zmiana statusu zadania (tu: zadanie 5 przechodzi na in_progress).
--    WHERE jest konieczne, bez niego zmienilibysmy status wszystkich zadan.
UPDATE tasks
SET status = 'in_progress'
WHERE id = 5 AND isDeleted = 0;

-- 9. Soft delete zadania (tu: zadanie 6).
--    Rekord zostaje w bazie; ustawiamy naraz isDeleted, deletedAt i deletedById.
UPDATE tasks
SET isDeleted = 1, deletedAt = NOW(), deletedById = 1
WHERE id = 6 AND isDeleted = 0;

-- 10. Trwale usuniecie zadan usunietych miekko ponad 30 dni temu.
--     Wykonuje administrator bazy (konto root). Operacja jest nieodwracalna,
--     dlatego przed DELETE warto sprawdzic wynik tym samym warunkiem w SELECT.
DELETE FROM tasks
WHERE isDeleted = 1 AND deletedAt < NOW() - INTERVAL 30 DAY;

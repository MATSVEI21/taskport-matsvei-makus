-- Konta bazy danych TaskBoard: trzy konta z roznymi uprawnieniami.
-- Skrypt wykonuje administrator bazy (root), po zaimportowaniu taskboard.sql:
--   mysql -u root < database/konta.sql
-- UWAGA: hasla ponizej sa przykladowe (srodowisko szkolne). Na prawdziwym
-- serwerze nalezy je zmienic i nie trzymac w repozytorium.

-- Konta mozna utworzyc ponownie bez bledu
DROP USER IF EXISTS 'taskboard_admin'@'localhost';
DROP USER IF EXISTS 'taskboard_app'@'localhost';
DROP USER IF EXISTS 'taskboard_readonly'@'localhost';

-- 1. Administrator: pelny dostep do bazy taskboard (m.in. trwale usuwanie
--    zadan zapytaniem nr 10, zmiana struktury, kopie zapasowe).
CREATE USER 'taskboard_admin'@'localhost' IDENTIFIED BY 'Admin_TB_2026!';
GRANT ALL PRIVILEGES ON taskboard.* TO 'taskboard_admin'@'localhost';

-- 2. Konto aplikacji (backend Express): odczyt, dodawanie i zmiana danych.
--    Bez DELETE, bo aplikacja usuwa miekko (isDeleted = 1), a bez DROP i ALTER,
--    zeby nie mogla zmienic struktury bazy.
CREATE USER 'taskboard_app'@'localhost' IDENTIFIED BY 'App_TB_2026!';
GRANT SELECT, INSERT, UPDATE ON taskboard.* TO 'taskboard_app'@'localhost';

-- 3. Konto tylko do odczytu (raporty, podglad danych).
CREATE USER 'taskboard_readonly'@'localhost' IDENTIFIED BY 'Read_TB_2026!';
GRANT SELECT ON taskboard.* TO 'taskboard_readonly'@'localhost';

FLUSH PRIVILEGES;

-- Sprawdzenie uprawnien:
-- SHOW GRANTS FOR 'taskboard_admin'@'localhost';
-- SHOW GRANTS FOR 'taskboard_app'@'localhost';
-- SHOW GRANTS FOR 'taskboard_readonly'@'localhost';

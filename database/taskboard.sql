-- Skrypt bazy danych TaskBoard (MySQL / MariaDB w XAMPP).
-- Struktura zgodna z diagramem materialy/erd.md.
DROP DATABASE IF EXISTS taskboard;
CREATE DATABASE taskboard CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE taskboard;


CREATE TABLE users (
  id           INT NOT NULL AUTO_INCREMENT,
  login        VARCHAR(30) NOT NULL,
  passwordHash CHAR(60)    NOT NULL,
  firstName    VARCHAR(50) NOT NULL,
  lastName     VARCHAR(50) NOT NULL,
  createdAt    DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_login (login),
  CONSTRAINT chk_users_login CHECK (CHAR_LENGTH(login) BETWEEN 3 AND 30)
) ENGINE=InnoDB;

CREATE TABLE boards (
  id          INT NOT NULL AUTO_INCREMENT,
  name        VARCHAR(80)  NOT NULL,
  description VARCHAR(255) NULL,
  ownerId     INT NOT NULL,
  createdAt   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  isDeleted   TINYINT NOT NULL DEFAULT 0,
  deletedAt   DATETIME NULL,
  deletedById INT NULL,
  PRIMARY KEY (id),
  CONSTRAINT fk_boards_owner   FOREIGN KEY (ownerId)     REFERENCES users (id),
  CONSTRAINT fk_boards_deleter FOREIGN KEY (deletedById) REFERENCES users (id)
) ENGINE=InnoDB;

CREATE TABLE tasks (
  id          INT NOT NULL AUTO_INCREMENT,
  title       VARCHAR(100) NOT NULL,
  description TEXT NULL,
  status      ENUM('todo', 'in_progress', 'done') NOT NULL DEFAULT 'todo',
  priority    ENUM('low', 'medium', 'high')       NOT NULL DEFAULT 'medium',
  deadline    DATE NULL,
  boardId     INT NOT NULL,
  assigneeId  INT NULL,
  createdAt   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  -- soft delete: usuniecie ustawia naraz isDeleted = 1, deletedAt i deletedById
  isDeleted   TINYINT NOT NULL DEFAULT 0,
  deletedAt   DATETIME NULL,
  deletedById INT NULL,
  PRIMARY KEY (id),
  CONSTRAINT fk_tasks_board    FOREIGN KEY (boardId)     REFERENCES boards (id),
  CONSTRAINT fk_tasks_assignee FOREIGN KEY (assigneeId)  REFERENCES users (id),
  CONSTRAINT fk_tasks_deleter  FOREIGN KEY (deletedById) REFERENCES users (id),
  CONSTRAINT chk_tasks_title   CHECK (CHAR_LENGTH(title) BETWEEN 3 AND 100)
) ENGINE=InnoDB;

-- Uzytkownicy z materialy/users.csv (to samo haslo dla wszystkich)
INSERT INTO users (login, passwordHash, firstName, lastName) VALUES
  ('anna.nowak',        '$2a$10$qCgFwKm4Qiu60z3cTqCvz.DZUvPNVnkJQjMagc4wtx24LiYjsF./y', 'Anna',  'Nowak'),
  ('jan.kowalski',      '$2a$10$qCgFwKm4Qiu60z3cTqCvz.DZUvPNVnkJQjMagc4wtx24LiYjsF./y', 'Jan',   'Kowalski'),
  ('ola.wisniewska',    '$2a$10$qCgFwKm4Qiu60z3cTqCvz.DZUvPNVnkJQjMagc4wtx24LiYjsF./y', 'Ola',   'Wiśniewska'),
  ('piotr.zielinski',   '$2a$10$qCgFwKm4Qiu60z3cTqCvz.DZUvPNVnkJQjMagc4wtx24LiYjsF./y', 'Piotr', 'Zieliński'),
  ('kasia.lewandowska', '$2a$10$qCgFwKm4Qiu60z3cTqCvz.DZUvPNVnkJQjMagc4wtx24LiYjsF./y', 'Kasia', 'Lewandowska');

-- Dwie przykladowe tablice (backend na razie ustawia ownerId = 1)
INSERT INTO boards (name, description, ownerId) VALUES
  ('Projekt Taskboard', 'Glowna tablica projektu', 1),
  ('Nauka Express',     'Zadania na zajecia z backendu', 2);

INSERT INTO tasks (title, description, status, priority, deadline, boardId, assigneeId) VALUES
  ('Struktura repozytorium', 'Foldery i pliki README',        'done',        'high',   '2026-11-06', 1, 1),
  ('Skrypt bazy danych',     'Tabele users, boards i tasks',   'done',        'high',   '2026-11-10', 1, 1),
  ('API tablic',             'POST, PUT i DELETE dla tablic',  'in_progress', 'high',   '2026-11-14', 1, 2),
  ('API zadań',              'Trasy w pliku routes/tasks.js',  'in_progress', 'medium', '2026-11-14', 1, 2),
  ('Widok tablicy',          'Trzy kolumny ze statusami',      'todo',        'medium', '2026-11-20', 1, 3),
  ('Raport testów',          NULL,                             'todo',        'low',    '2026-11-05', 1, NULL),
  ('Hello world Express',    'Pierwszy serwer na porcie 3000', 'done',        'low',    '2026-11-09', 2, 4),
  ('Kolekcja Postman',       'Przypadki 200, 400 i 404',       'todo',        'high',   '2026-11-13', 2, 5),
  ('Stary pomysł na filtry', 'Zrezygnowano z tej funkcji',     'todo',        'low',    NULL,         1, 3),
  ('Duplikat zadania API',   'Dodane omyłkowo',                'in_progress', 'medium', NULL,         2, NULL);

-- Soft delete: zadania 9 i 10 zostają w bazie, ale są oznaczone jako usunięte
UPDATE tasks
   SET isDeleted = 1, deletedAt = NOW(), deletedById = 1
 WHERE id IN (9, 10);
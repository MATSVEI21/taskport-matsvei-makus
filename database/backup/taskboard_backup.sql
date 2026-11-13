-- MariaDB dump 10.19  Distrib 10.4.32-MariaDB, for Win64 (AMD64)
--
-- Host: localhost    Database: taskboard
-- ------------------------------------------------------
-- Server version	10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `boards`
--

DROP TABLE IF EXISTS `boards`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `boards` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(80) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `ownerId` int(11) NOT NULL,
  `createdAt` datetime NOT NULL DEFAULT current_timestamp(),
  `isDeleted` tinyint(4) NOT NULL DEFAULT 0,
  `deletedAt` datetime DEFAULT NULL,
  `deletedById` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_boards_owner` (`ownerId`),
  KEY `fk_boards_deleter` (`deletedById`),
  CONSTRAINT `fk_boards_deleter` FOREIGN KEY (`deletedById`) REFERENCES `users` (`id`),
  CONSTRAINT `fk_boards_owner` FOREIGN KEY (`ownerId`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `boards`
--

LOCK TABLES `boards` WRITE;
/*!40000 ALTER TABLE `boards` DISABLE KEYS */;
INSERT INTO `boards` VALUES (1,'Projekt Taskboard','Glowna tablica projektu',1,'2026-11-13 14:31:26',0,NULL,NULL),(2,'Nauka Express','Zadania na zajecia z backendu',2,'2026-11-13 14:31:26',0,NULL,NULL);
/*!40000 ALTER TABLE `boards` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tasks`
--

DROP TABLE IF EXISTS `tasks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tasks` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `status` enum('todo','in_progress','done') NOT NULL DEFAULT 'todo',
  `priority` enum('low','medium','high') NOT NULL DEFAULT 'medium',
  `deadline` date DEFAULT NULL,
  `boardId` int(11) NOT NULL,
  `assigneeId` int(11) DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT current_timestamp(),
  `isDeleted` tinyint(4) NOT NULL DEFAULT 0,
  `deletedAt` datetime DEFAULT NULL,
  `deletedById` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_tasks_board` (`boardId`),
  KEY `fk_tasks_assignee` (`assigneeId`),
  KEY `fk_tasks_deleter` (`deletedById`),
  CONSTRAINT `fk_tasks_assignee` FOREIGN KEY (`assigneeId`) REFERENCES `users` (`id`),
  CONSTRAINT `fk_tasks_board` FOREIGN KEY (`boardId`) REFERENCES `boards` (`id`),
  CONSTRAINT `fk_tasks_deleter` FOREIGN KEY (`deletedById`) REFERENCES `users` (`id`),
  CONSTRAINT `chk_tasks_title` CHECK (char_length(`title`) between 3 and 100)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tasks`
--

LOCK TABLES `tasks` WRITE;
/*!40000 ALTER TABLE `tasks` DISABLE KEYS */;
INSERT INTO `tasks` VALUES (1,'Struktura repozytorium','Foldery i pliki README','done','high','2026-11-06',1,1,'2026-11-13 14:31:26',0,NULL,NULL),(2,'Skrypt bazy danych','Tabele users, boards i tasks','done','high','2026-11-10',1,1,'2026-11-13 14:31:26',0,NULL,NULL),(3,'API tablic','POST, PUT i DELETE dla tablic','in_progress','high','2026-11-14',1,2,'2026-11-13 14:31:26',0,NULL,NULL),(4,'API zadań','Trasy w pliku routes/tasks.js','in_progress','medium','2026-11-14',1,2,'2026-11-13 14:31:26',0,NULL,NULL),(5,'Widok tablicy','Trzy kolumny ze statusami','todo','medium','2026-11-20',1,3,'2026-11-13 14:31:26',0,NULL,NULL),(6,'Raport testów',NULL,'todo','low','2026-11-05',1,NULL,'2026-11-13 14:31:26',0,NULL,NULL),(7,'Hello world Express','Pierwszy serwer na porcie 3000','done','low','2026-11-09',2,4,'2026-11-13 14:31:26',0,NULL,NULL),(8,'Kolekcja Postman','Przypadki 200, 400 i 404','todo','high','2026-11-13',2,5,'2026-11-13 14:31:26',0,NULL,NULL),(9,'Stary pomysł na filtry','Zrezygnowano z tej funkcji','todo','low',NULL,1,3,'2026-11-13 14:31:26',1,'2026-11-13 14:31:26',1),(10,'Duplikat zadania API','Dodane omyłkowo','in_progress','medium',NULL,2,NULL,'2026-11-13 14:31:26',1,'2026-11-13 14:31:26',1);
/*!40000 ALTER TABLE `tasks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `login` varchar(30) NOT NULL,
  `passwordHash` char(60) NOT NULL,
  `firstName` varchar(50) NOT NULL,
  `lastName` varchar(50) NOT NULL,
  `createdAt` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_users_login` (`login`),
  CONSTRAINT `chk_users_login` CHECK (char_length(`login`) between 3 and 30)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'anna.nowak','$2a$10$qCgFwKm4Qiu60z3cTqCvz.DZUvPNVnkJQjMagc4wtx24LiYjsF./y','Anna','Nowak','2026-11-13 14:31:26'),(2,'jan.kowalski','$2a$10$qCgFwKm4Qiu60z3cTqCvz.DZUvPNVnkJQjMagc4wtx24LiYjsF./y','Jan','Kowalski','2026-11-13 14:31:26'),(3,'ola.wisniewska','$2a$10$qCgFwKm4Qiu60z3cTqCvz.DZUvPNVnkJQjMagc4wtx24LiYjsF./y','Ola','Wiśniewska','2026-11-13 14:31:26'),(4,'piotr.zielinski','$2a$10$qCgFwKm4Qiu60z3cTqCvz.DZUvPNVnkJQjMagc4wtx24LiYjsF./y','Piotr','Zieliński','2026-11-13 14:31:26'),(5,'kasia.lewandowska','$2a$10$qCgFwKm4Qiu60z3cTqCvz.DZUvPNVnkJQjMagc4wtx24LiYjsF./y','Kasia','Lewandowska','2026-11-13 14:31:26');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-11-13 14:31:26

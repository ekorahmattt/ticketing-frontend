/*
SQLyog Professional v13.1.1 (64 bit)
MySQL - 10.4.27-MariaDB : Database - ticketing-db
*********************************************************************
*/

/*!40101 SET NAMES utf8 */;

/*!40101 SET SQL_MODE=''*/;

/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
CREATE DATABASE /*!32312 IF NOT EXISTS*/`ticketing-db` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci */;

USE `ticketing-db`;

/*Table structure for table `units` */

DROP TABLE IF EXISTS `units`;

CREATE TABLE `units` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `code` varchar(20) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*Data for the table `units` */


/*Table structure for table `users` */

DROP TABLE IF EXISTS `users`;

CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','superadmin') DEFAULT 'admin',
  `last_login` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*Data for the table `users` */

insert  into `users`(`id`,`name`,`username`,`password`,`role`,`last_login`,`created_at`,`updated_at`) values 
(1,'Eko Rahmat','Eko','$2y$10$F6aqWguvk8xKQ5u7a29QLetDjxleYbl8sBMJVOv.Ro6TsF8e/TjRa','superadmin','2026-03-25 01:08:18','2026-03-10 05:22:50','2026-03-19 15:29:47'),
(4,'Adrian Ronaldy','Ronal','$2y$10$jGIC6eduWvV6mqtDYJfBne6gpFEz3klu0czpR6jkrqg8FF55AIANG','admin','2026-03-19 15:28:39','2026-03-19 15:27:38',NULL);

/*Table structure for table `categories` */

DROP TABLE IF EXISTS `categories`;

CREATE TABLE `categories` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*Data for the table `categories` */

insert  into `categories`(`id`,`name`) values 
(1,'Komputer'),
(2,'Jaringan'),
(3,'SIMRS'),
(4,'Display'),
(5,'Printer'),
(6,'Scanner');

/*Table structure for table `device_types` */

DROP TABLE IF EXISTS `device_types`;

CREATE TABLE `device_types` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*Data for the table `device_types` */

insert  into `device_types`(`id`,`name`) values 
(1,'Computer'),
(2,'Printer'),
(3,'Access Point'),
(4,'CCTV');

/*Table structure for table `device_users` */

DROP TABLE IF EXISTS `device_users`;

CREATE TABLE `device_users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `full_name` varchar(150) DEFAULT NULL,
  `unit_id` int(11) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `fk_device_users_unit` (`unit_id`),
  CONSTRAINT `fk_device_users_unit` FOREIGN KEY (`unit_id`) REFERENCES `units` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*Data for the table `device_users` */


/*Table structure for table `devices` */

DROP TABLE IF EXISTS `devices`;

CREATE TABLE `devices` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `device_name` varchar(100) NOT NULL,
  `brand` varchar(100) DEFAULT NULL,
  `model` varchar(100) DEFAULT NULL,
  `serial_number` varchar(100) DEFAULT NULL,
  `device_type_id` int(11) DEFAULT NULL,
  `ip_address` varchar(50) DEFAULT NULL,
  `mac_address` varchar(100) DEFAULT NULL,
  `remote_address` varchar(50) DEFAULT NULL,
  `os` varchar(100) DEFAULT NULL,
  `unit_id` int(11) DEFAULT NULL,
  `coord_x` int(11) DEFAULT NULL,
  `coord_y` int(11) DEFAULT NULL,
  `last_seen` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `created_by` int(11) DEFAULT NULL,
  `updated_by` int(11) DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `status` varchar(50) DEFAULT 'Aktif',
  `keterangan` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_device_ip` (`ip_address`),
  KEY `idx_device_mac` (`mac_address`),
  KEY `fk_device_type` (`device_type_id`),
  KEY `fk_devices_created_by` (`created_by`),
  KEY `fk_devices_updated_by` (`updated_by`),
  KEY `fk_devices_unit` (`unit_id`),
  CONSTRAINT `devices_ibfk_1` FOREIGN KEY (`device_type_id`) REFERENCES `device_types` (`id`),
  CONSTRAINT `fk_device_type` FOREIGN KEY (`device_type_id`) REFERENCES `device_types` (`id`),
  CONSTRAINT `fk_devices_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_devices_unit` FOREIGN KEY (`unit_id`) REFERENCES `units` (`id`),
  CONSTRAINT `fk_devices_updated_by` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*Data for the table `devices` */


/*Table structure for table `subcategories` */

DROP TABLE IF EXISTS `subcategories`;

CREATE TABLE `subcategories` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `category_id` int(11) DEFAULT NULL,
  `name` varchar(150) DEFAULT NULL,
  `sla_minutes` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `category_id` (`category_id`),
  CONSTRAINT `subcategories_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*Data for the table `subcategories` */

insert  into `subcategories`(`id`,`category_id`,`name`,`sla_minutes`) values 
(1,1,'Komputer tidak menyala',60),
(2,1,'Komputer sangat lambat',60),
(3,1,'Blue screen / error sistem',60),
(4,1,'Keyboard atau mouse tidak berfungsi',60),
(5,2,'Tidak bisa terhubung ke jaringan',30),
(6,2,'Internet sangat lambat',30),
(7,2,'Wifi sering terputus',30),
(8,2,'Tidak bisa akses server',30),
(9,3,'SIMRS tidak bisa login',15),
(10,3,'SIMRS error saat input data',15),
(11,3,'SIMRS tidak bisa mencetak',15),
(12,3,'SIMRS sangat lambat',15),
(13,4,'Monitor tidak menyala',60),
(14,4,'Tampilan layar tidak normal',60),
(15,4,'Resolusi layar bermasalah',60),
(16,5,'Printer tidak bisa mencetak',45),
(17,5,'Printer offline',45),
(18,5,'Hasil cetakan tidak jelas',45),
(19,5,'Kertas sering macet',45),
(20,6,'Scanner tidak terdeteksi',60),
(21,6,'Scanner tidak bisa scan',60),
(22,6,'Hasil scan tidak muncul',60),
(23,3,'INACBGs Tidak Bisa Diakses',NULL);

/*Table structure for table `tickets` */

DROP TABLE IF EXISTS `tickets`;

CREATE TABLE `tickets` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `device_id` int(11) DEFAULT NULL,
  `reporter_name` varchar(100) DEFAULT NULL,
  `reporter_unit` varchar(100) DEFAULT NULL,
  `reporter_contact` varchar(100) DEFAULT NULL,
  `report_hostname` varchar(100) DEFAULT NULL,
  `report_ip` varchar(50) DEFAULT NULL,
  `report_device_brand` varchar(100) DEFAULT NULL,
  `report_device_model` varchar(100) DEFAULT NULL,
  `report_user_agent` text DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `action_taken` text DEFAULT NULL,
  `handling_notes` text DEFAULT NULL,
  `status` enum('open','process','pending','on_hold','done','cancelled') NOT NULL DEFAULT 'open',
  `priority` enum('low','medium','high') DEFAULT 'medium',
  `sla_response_minutes` int(11) DEFAULT NULL,
  `first_response_at` datetime DEFAULT NULL,
  `handled_by` int(11) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT NULL,
  `resolved_at` datetime DEFAULT NULL,
  `category_id` int(11) DEFAULT NULL,
  `subcategory_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `handled_by` (`handled_by`),
  KEY `idx_ticket_status` (`status`),
  KEY `idx_ticket_device` (`device_id`),
  KEY `fk_ticket_category` (`category_id`),
  KEY `fk_ticket_subcategory` (`subcategory_id`),
  CONSTRAINT `fk_ticket_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`),
  CONSTRAINT `fk_ticket_subcategory` FOREIGN KEY (`subcategory_id`) REFERENCES `subcategories` (`id`),
  CONSTRAINT `tickets_ibfk_1` FOREIGN KEY (`device_id`) REFERENCES `devices` (`id`) ON DELETE CASCADE,
  CONSTRAINT `tickets_ibfk_2` FOREIGN KEY (`handled_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*Data for the table `tickets` */


/*Table structure for table `device_connections` */

DROP TABLE IF EXISTS `device_connections`;

CREATE TABLE `device_connections` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `parent_device_id` int(11) NOT NULL,
  `child_device_id` int(11) NOT NULL,
  `connection_type` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `parent_device_id` (`parent_device_id`),
  KEY `child_device_id` (`child_device_id`),
  CONSTRAINT `device_connections_ibfk_1` FOREIGN KEY (`parent_device_id`) REFERENCES `devices` (`id`),
  CONSTRAINT `device_connections_ibfk_2` FOREIGN KEY (`child_device_id`) REFERENCES `devices` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*Data for the table `device_connections` */


/*Table structure for table `device_user_assignments` */

DROP TABLE IF EXISTS `device_user_assignments`;

CREATE TABLE `device_user_assignments` (
  `device_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  PRIMARY KEY (`device_id`,`user_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `device_user_assignments_ibfk_1` FOREIGN KEY (`device_id`) REFERENCES `devices` (`id`) ON DELETE CASCADE,
  CONSTRAINT `device_user_assignments_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `device_users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*Data for the table `device_user_assignments` */


/*Table structure for table `messages` */

DROP TABLE IF EXISTS `messages`;

CREATE TABLE `messages` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `ticket_id` int(11) NOT NULL,
  `sender_type` enum('admin','device') NOT NULL,
  `sender_id` int(11) DEFAULT NULL,
  `message` text NOT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_messages_ticket` (`ticket_id`),
  CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`ticket_id`) REFERENCES `tickets` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*Data for the table `messages` */


/*Table structure for table `ticket_attachments` */

DROP TABLE IF EXISTS `ticket_attachments`;

CREATE TABLE `ticket_attachments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `ticket_id` int(11) NOT NULL,
  `file_name` varchar(255) DEFAULT NULL,
  `file_path` varchar(255) DEFAULT NULL,
  `uploaded_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `ticket_id` (`ticket_id`),
  CONSTRAINT `ticket_attachments_ibfk_1` FOREIGN KEY (`ticket_id`) REFERENCES `tickets` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*Data for the table `ticket_attachments` */


/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- ========================================
-- Simple Auth Node.js - Database Schema
-- ========================================
-- This file contains the database structure required for the authentication service
-- MySQL/MariaDB compatible

-- ========================================
-- Table: user
-- ========================================
-- Stores user credentials and basic information
CREATE TABLE IF NOT EXISTS `user` (
  `id_user` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(255) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `profile` VARCHAR(50) DEFAULT 'user',
  `status` TINYINT(1) DEFAULT 1 COMMENT '1 = active, 0 = inactive',
  `first_name` VARCHAR(100) NOT NULL,
  `last_name` VARCHAR(100) NOT NULL,
  `role` VARCHAR(50) DEFAULT 'user',
  `main_origin` INT DEFAULT NULL,
  `uuid` VARCHAR(36) NOT NULL UNIQUE,
  `dt_created` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `dt_last_update` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_username` (`username`),
  INDEX `idx_status` (`status`),
  INDEX `idx_uuid` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- Table: refresh_token
-- ========================================
-- Stores refresh tokens for JWT authentication
CREATE TABLE IF NOT EXISTS `refresh_token` (
  `id_refresh_token` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `token` VARCHAR(255) NOT NULL UNIQUE,
  `expires_at` DATETIME NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_token` (`token`),
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_expires_at` (`expires_at`),
  FOREIGN KEY (`user_id`) REFERENCES `user`(`id_user`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- Table: user_origin
-- ========================================
-- Stores origin/source information for users (e.g., registration source, affiliate, department, etc.)
-- This is a flexible table that can be used to categorize users by their origin
CREATE TABLE IF NOT EXISTS `user_origin` (
  `id_user_origin` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `description` TEXT,
  `uuid` VARCHAR(36) NOT NULL UNIQUE,
  `status` TINYINT(1) DEFAULT 1,
  `dt_created` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_uuid` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- Table: plataforms
-- ========================================
-- Stores platform/application definitions
CREATE TABLE IF NOT EXISTS `plataforms` (
  `id_plataforms` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `uuid` VARCHAR(36) NOT NULL UNIQUE,
  `description` TEXT,
  `status` TINYINT(1) DEFAULT 1,
  `dt_created` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_uuid` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- Table: platform_permission_by_user
-- ========================================
-- Maps users to platforms they have access to
CREATE TABLE IF NOT EXISTS `platform_permission_by_user` (
  `id_permission` INT AUTO_INCREMENT PRIMARY KEY,
  `id_user` INT NOT NULL,
  `id_platform` INT NOT NULL,
  `dt_created` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `unique_user_platform` (`id_user`, `id_platform`),
  INDEX `idx_user` (`id_user`),
  INDEX `idx_platform` (`id_platform`),
  FOREIGN KEY (`id_user`) REFERENCES `user`(`id_user`) ON DELETE CASCADE,
  FOREIGN KEY (`id_platform`) REFERENCES `plataforms`(`id_plataforms`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- Table: monitoring
-- ========================================
-- Stores API performance monitoring data
CREATE TABLE IF NOT EXISTS `monitoring` (
  `id_monitoring` INT AUTO_INCREMENT PRIMARY KEY,
  `response_time` INT NOT NULL COMMENT 'Response time in milliseconds',
  `response_code` INT NOT NULL COMMENT 'HTTP status code',
  `is_server_error` TINYINT(1) DEFAULT 0 COMMENT '1 = error, 0 = success',
  `dt_created` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_created` (`dt_created`),
  INDEX `idx_error` (`is_server_error`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- Sample Data (Optional)
-- ========================================
-- Uncomment the following lines to insert sample data for testing

-- INSERT INTO `user_origin` (`name`, `description`, `uuid`) VALUES
-- ('Web Registration', 'Users who registered via web', UUID()),
-- ('Mobile App', 'Users who registered via mobile app', UUID()),
-- ('Admin Created', 'Users created by administrators', UUID());

-- INSERT INTO `plataforms` (`name`, `uuid`, `description`) VALUES
-- ('Main Platform', UUID(), 'Default platform for testing');

-- INSERT INTO `user` (`username`, `password_hash`, `first_name`, `last_name`, `uuid`) VALUES
-- ('admin', '$2b$10$examplehashhere', 'Admin', 'User', UUID());

-- Note: Remember to hash passwords properly using bcrypt before inserting
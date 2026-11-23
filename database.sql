-- AgriGuard AI: MySQL Database Schema SQL Script
-- Final Year B.Tech AI & Data Science Project

CREATE DATABASE IF NOT EXISTS `agriguard`;
USE `agriguard`;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(80) NOT NULL UNIQUE,
  `email` VARCHAR(120) NOT NULL UNIQUE,
  `password_hash` VARCHAR(256) NOT NULL,
  `phone` VARCHAR(15) DEFAULT NULL,
  `farm_location` VARCHAR(200) DEFAULT NULL,
  `preferred_language` VARCHAR(10) DEFAULT 'en',
  `is_admin` BOOLEAN DEFAULT FALSE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Crop Disease Predictions Table
CREATE TABLE IF NOT EXISTS `predictions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT DEFAULT NULL,
  `crop_type` VARCHAR(50) NOT NULL,
  `disease_name` VARCHAR(100) NOT NULL,
  `confidence` FLOAT NOT NULL,
  `symptoms` TEXT DEFAULT NULL,
  `cause` TEXT DEFAULT NULL,
  `affected_parts` TEXT DEFAULT NULL,
  `severity` VARCHAR(20) DEFAULT NULL,
  `image_path` VARCHAR(255) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Fertilizer Recommendations Table
CREATE TABLE IF NOT EXISTS `fertilizer_predictions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT DEFAULT NULL,
  `temperature` INT NOT NULL,
  `humidity` INT NOT NULL,
  `moisture` INT NOT NULL,
  `soil_type` VARCHAR(50) NOT NULL,
  `crop_type` VARCHAR(50) NOT NULL,
  `nitrogen` INT NOT NULL,
  `phosphorus` INT NOT NULL,
  `potassium` INT NOT NULL,
  `recommended_fertilizer` VARCHAR(50) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Chat History Table
CREATE TABLE IF NOT EXISTS `chat_history` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT DEFAULT NULL,
  `message` TEXT NOT NULL,
  `response` TEXT NOT NULL,
  `language` VARCHAR(10) DEFAULT 'en',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Feedback Table
CREATE TABLE IF NOT EXISTS `feedback` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(100) NOT NULL,
  `rating` INT NOT NULL,
  `comment` TEXT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Pre-populate default Administrator Account (Password is hashed pbkdf2:sha256 representation of 'admin123')
INSERT INTO `users` (`username`, `email`, `password_hash`, `phone`, `farm_location`, `preferred_language`, `is_admin`)
VALUES (
  'admin',
  'admin@agriguard.com',
  'scrypt:32768:8:1$v5X1oR6dYyI6v1uK$cf0b561c28c89bdf6e4f3a74ef1a85c88c78c3c13b1940989f68bc7c5b6b1580970dbd3301a5cc9d0891cd02df9e51c893fa9de5d045d475ef9e51b689a9f24e',
  '9999999999',
  'Delhi, India',
  'en',
  TRUE
) ON DUPLICATE KEY UPDATE `is_admin` = TRUE;

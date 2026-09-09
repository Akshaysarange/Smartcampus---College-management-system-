ALTER TABLE users ADD COLUMN email VARCHAR(100) DEFAULT NULL, ADD UNIQUE KEY unique_email (email);

CREATE TABLE password_reset_otp (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    otp_hash VARCHAR(255) NOT NULL,
    expires_at DATETIME NOT NULL,
    used TINYINT(1) NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

UPDATE users u
JOIN teachers t ON t.user_id = u.id
SET u.email = CONCAT(LOWER(REPLACE(t.name, ' ', '.')), '@gmail.com')
WHERE u.email IS NULL;

UPDATE users u
JOIN students s ON s.user_id = u.id
SET u.email = CONCAT(LOWER(REPLACE(s.name, ' ', '.')), '@gmail.com')
WHERE u.email IS NULL;
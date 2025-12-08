# Create the database
CREATE DATABASE IF NOT EXISTS runnr;
USE runnr;

# Create the tables
CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT,
    username  VARCHAR(50) NOT NULL UNIQUE,
    hashed_password  VARCHAR(255) NOT NULL,
    first_name     VARCHAR(50),
    last_name      VARCHAR(50),
    email     VARCHAR(100) NOT NULL UNIQUE,
    PRIMARY KEY (user_id)
);

CREATE TABLE IF NOT EXISTS follows (
    follower_id INT NOT NULL,
    followee_id INT NOT NULL,
    PRIMARY KEY (follower_id, followee_id),
    FOREIGN KEY (follower_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (followee_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS runs (
    run_id INT AUTO_INCREMENT,
    user_id INT NOT NULL ,
    distance_km DECIMAL(5,2) NOT NULL,
    duration_minutes INT NOT NULL,
    date_of_run DATE NOT NULL,
    PRIMARY KEY (run_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS goals (
    goal_id INT AUTO_INCREMENT,
    user_id INT NOT NULL,
    goal_type ENUM('SingleRun', 'MultiRun'),
    target_value DECIMAL(5,2) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status ENUM('Active', 'Completed', 'Failed') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (goal_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

# Create the database user and grant permissions
CREATE USER IF NOT EXISTS 'runnr_app'@'localhost' IDENTIFIED BY 'qwertyuiop'; 
GRANT ALL PRIVILEGES ON runnr.* TO 'runnr_app'@'localhost';
FLUSH PRIVILEGES;

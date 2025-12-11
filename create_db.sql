# Create the database
CREATE DATABASE IF NOT EXISTS health;
USE health;

# Create the tables
CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT,
    username  VARCHAR(50) NOT NULL UNIQUE,
    hashed_password  VARCHAR(255) NOT NULL,
    first_name     VARCHAR(50),
    last_name      VARCHAR(50),
    email     VARCHAR(100) NOT NULL UNIQUE,
    profile_image_url varchar(100) UNIQUE,
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
    user_id INT NOT NULL,
    distance_km DECIMAL(5,2) NOT NULL,
    duration_minutes INT NOT NULL,
    date_of_run DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (run_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS goals (
    goal_id INT AUTO_INCREMENT PRIMARY KEY,
    creator_user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    goal_type ENUM('single', 'total', 'pace') NOT NULL,
    target_distance DECIMAL(5,2),
    target_pace DECIMAL(5,2),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    visibility ENUM('public','private') DEFAULT 'public',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (creator_user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS user_goals (
    user_goal_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    goal_id INT NOT NULL,
    status ENUM('incompleted','completed','failed') DEFAULT 'incompleted',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, goal_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (goal_id) REFERENCES goals(goal_id) ON DELETE CASCADE
);


# Create the database user and grant permissions
CREATE USER IF NOT EXISTS 'runnr_app'@'localhost' IDENTIFIED BY 'qwertyuiop'; 
GRANT ALL PRIVILEGES ON runnr.* TO 'runnr_app'@'localhost';
FLUSH PRIVILEGES;

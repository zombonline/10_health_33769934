USE health;


INSERT INTO users (username, hashed_password, first_name, last_name, email) VALUES
('gold', '$2b$10$rORyNzCI4ILqsZS2JFTsGezKwqSbi2.lhseR6pIZvCdZPGOA2o/aS', 'John', 'Goldmiths', 'john_goldsmiths@example.com'),
('Running_Man', '$2b$10$BTh6E3dXAEW75qEoqID/nOfyymj2jn5xyL6ST6aaMcyV2t8vTRfhm', 'Ron', 'Mann', 'Ron.Mann@example.com'),
('FastFeet', '$2b$10$Kix1WYGBJ/U6qSg49v0qUuPH8r4.TkC4rnJYOi4xTPammvFOFCU.O', 'Fiona', 'Swift', 'fiona.swift@example.com'),
('TrailBlazer', '$2b$10$Kix1WYGBJ/U6qSg49v0qUuPH8r4.TkC4rnJYOi4xTPammvFOFCU.O', 'Tom', 'Baker', 'tom.baker@example.com'),
('RoadRunner', '$2b$10$Kix1WYGBJ/U6qSg49v0qUuPH8r4.TkC4rnJYOi4xTPammvFOFCU.O', 'Rachel', 'Runner', 'rachel.runner@example.com'),
('PaceMaster', '$2b$10$Kix1WYGBJ/U6qSg49v0qUuPH8r4.TkC4rnJYOi4xTPammvFOFCU.O', 'Paul', 'Masters', 'paul.masters@example.com'),
('NightJogger', '$2b$10$Kix1WYGBJ/U6qSg49v0qUuPH8r4.TkC4rnJYOi4xTPammvFOFCU.O', 'Nina', 'Jones', 'nina.jones@example.com');


INSERT INTO runs (user_id, distance_km, duration_minutes, date_of_run, created_at) VALUES
(1, 4.50, 25, '2025-11-25', '2025-11-25 09:12:44'),
(1, 8.00, 50, '2025-11-20', '2025-11-20 15:21:10'),
(1, 5.00, 30, '2025-11-24', '2025-11-24 18:03:55'),
(1, 10.00, 60, '2025-11-22', '2025-11-22 11:47:39'),

(2, 3.00, 18, '2025-11-23', '2025-11-23 13:22:05'),
(2, 7.50, 42, '2025-11-20', '2025-11-20 08:55:12'),

(3, 12.00, 70, '2025-11-21', '2025-11-21 17:34:28'),
(3, 6.00, 33, '2025-11-19', '2025-11-19 10:02:43'),

(4, 5.50, 28, '2025-11-22', '2025-11-22 14:18:51'),
(4, 15.00, 90, '2025-11-18', '2025-11-18 19:44:09'),

(5, 8.00, 44, '2025-11-20', '2025-11-20 12:30:14'),
(5, 10.50, 58, '2025-11-21', '2025-11-21 09:50:06'),
(5, 6.75, 36, '2025-11-23', '2025-11-23 16:03:19'),
(5, 7.25, 40, '2025-11-19', '2025-11-19 20:11:48'),
(5, 4.00, 22, '2025-11-17', '2025-11-20 07:42:33'),

(6, 2.50, 16, '2025-11-23', '2025-11-23 08:22:09'),
(6, 5.00, 29, '2025-11-21', '2025-11-21 18:55:44'),
(6, 7.00, 41, '2025-11-20', '2025-11-20 10:14:57'),
(6, 9.00, 55, '2025-11-19', '2025-11-19 13:45:33'),
(6, 11.00, 65, '2025-11-18', '2025-11-18 17:28:11');


INSERT INTO follows (follower_id, followee_id) VALUES
(1, 2),(1, 3),(1, 4),
(2, 1),(2, 4),(2, 5),
(3, 1),(3, 5),
(4, 1),(4, 2),(4, 3),(4, 5),
(5, 2),(5, 4),
(6, 1),(6, 2),(6, 3),(6, 4),(6, 5);


INSERT INTO goals 
(creator_user_id, title, description, goal_type, target_distance, target_pace, start_date, end_date, visibility, created_at) 
VALUES
(1, 'Run a 10K', 'Complete a full 10 km run before Christmas.', 'single',
 10.00, NULL, '2025-12-01', '2025-12-25', 'public', '2025-11-21 08:32:10'),

(2, 'Run 50km in December', 'Accumulate 50 km total in December.', 'total',
 50.00, NULL, '2025-12-01', '2025-12-31', 'public', '2025-11-25 13:44:59'),

(3, 'Pace Under 5:00', 'Achieve a pace faster than 5:00 min/km.', 'pace',
 NULL, 5.00, '2025-12-05', '2026-01-05', 'public', '2025-11-28 18:05:21'),

(4, 'Half Marathon Training', 'Train for a 21 km run.', 'total',
 21.00, NULL, '2025-12-10', '2026-02-01', 'private', '2025-12-03 10:15:47');


INSERT INTO user_goals (user_id, goal_id, status, joined_at) VALUES
(1, 1, 'incompleted', '2025-11-22 09:14:03'),
(2, 1, 'incompleted', '2025-11-23 16:55:40'),
(3, 1, 'incompleted', '2025-11-26 11:22:18'),
(6, 1, 'incompleted', '2025-11-29 19:05:54'),

(2, 2, 'incompleted', '2025-11-27 14:44:27'),
(4, 2, 'incompleted', '2025-11-28 17:22:49'),
(5, 2, 'incompleted', '2025-12-01 10:02:31'),

(3, 3, 'incompleted', '2025-11-30 12:55:43'),
(1, 3, 'incompleted', '2025-12-02 18:33:25'),
(5, 3, 'incompleted', '2025-12-03 09:47:55'),

(4, 4, 'incompleted', '2025-12-05 11:12:14'),
(2, 4, 'incompleted', '2025-12-06 15:49:08');

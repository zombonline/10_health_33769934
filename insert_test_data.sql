USE runnr;
INSERT INTO users (username, hashed_password, first_name, last_name, email) VALUES
('Running_Man', '$2b$10$BTh6E3dXAEW75qEoqID/nOfyymj2jn5xyL6ST6aaMcyV2t8vTRfhm', 'Ron', 'Mann', 'Ron.Mann@example.com'),
-- Password is 'running'
('FastFeet', '$2b$10$Kix1WYGBJ/U6qSg49v0qUuPH8r4.TkC4rnJYOi4xTPammvFOFCU.O', 'Fiona', 'Swift', 'fiona.swift@example.com'),
('TrailBlazer', '$2b$10$Kix1WYGBJ/U6qSg49v0qUuPH8r4.TkC4rnJYOi4xTPammvFOFCU.O', 'Tom', 'Baker', 'tom.baker@example.com'),
('RoadRunner', '$2b$10$Kix1WYGBJ/U6qSg49v0qUuPH8r4.TkC4rnJYOi4xTPammvFOFCU.O', 'Rachel', 'Runner', 'rachel.runner@example.com'),
('PaceMaster', '$2b$10$Kix1WYGBJ/U6qSg49v0qUuPH8r4.TkC4rnJYOi4xTPammvFOFCU.O', 'Paul', 'Masters', 'paul.masters@example.com'),
('NightJogger', '$2b$10$Kix1WYGBJ/U6qSg49v0qUuPH8r4.TkC4rnJYOi4xTPammvFOFCU.O', 'Nina', 'Jones', 'nina.jones@example.com');

INSERT INTO runs (user_id, distance_km, duration_minutes, date_of_run) VALUES
(1, 4.50, 25, '2025-11-25'),
(1, 8.00, 50, '2025-11-20'),
(1, 5.00, 30, '2025-11-24'),
(1, 10.00, 60, '2025-11-22'),
(2, 3.00, 18, '2025-11-23'),
(2, 7.50, 42, '2025-11-20'),
(3, 12.00, 70, '2025-11-21'),
(3, 6.00, 33, '2025-11-19'),
(4, 5.50, 28, '2025-11-22'),
(4, 15.00, 90, '2025-11-18'),
(5, 8.00, 44, '2025-11-20'),
(5, 10.50, 58, '2025-11-21'),
(5, 6.75, 36, '2025-11-23'),
(5, 7.25, 40, '2025-11-19'),
(5, 4.00, 22, '2025-11-17'),
(6, 2.50, 16, '2025-11-23'),
(6, 5.00, 29, '2025-11-21'),
(6, 7.00, 41, '2025-11-20'),
(6, 9.00, 55, '2025-11-19'),
(6, 11.00, 65, '2025-11-18');

INSERT INTO follows (follower_id, followee_id) VALUES
(1, 2),
(1, 3),
(1, 4),
(2, 1),
(2, 4),
(2, 5),
(3, 1),
(3, 5),
(4, 1),
(4, 2),
(4, 3),
(4, 5),
(5, 2),
(5, 4),
(6, 1),
(6, 2),
(6, 3),
(6, 4);
(6, 5);



# Create test data for goals
-- INSERT INTO goals (user_id, goal_type, target_value, start_date, end_date, status) VALUES
-- (1, 'MultiRun', 30.00, '2025-11-01', '2025-12-01', 'Active'),
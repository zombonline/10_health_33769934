USE runnr;


# Create test data for users
INSERT INTO users (username, hashed_password, first_name, last_name, email) VALUES
('Running_Man', '$2b$10$BTh6E3dXAEW75qEoqID/nOfyymj2jn5xyL6ST6aaMcyV2t8vTRfhm', 'Ron', 'Mann', 'Ron.Mann@example.com');
-- Password is 'running'
# Create test data for runs
INSERT INTO runs (user_id, distance_km, duration_minutes, date_of_run) VALUES
(1, 5.00, 30, '2025-11-24'),
(1, 10.00, 60, '2025-11-22');

# Create test data for goals
-- INSERT INTO goals (user_id, goal_type, target_value, start_date, end_date, status) VALUES
-- (1, 'MultiRun', 30.00, '2025-11-01', '2025-12-01', 'Active'),
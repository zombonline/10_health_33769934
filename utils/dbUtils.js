const db = global.db;

function query(sql, params) {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, results) => {
      if (err) {
        console.error("Database error:", err); // TODO: remove logging in production
        return reject(new Error("Database error"));
      }
      resolve(results);
    });
  });
}

async function createUser(username, hashedPassword, email) {
  const result = await query(
    "INSERT INTO users (username, hashed_password, email) VALUES (?, ?, ?)",
    [username, hashedPassword, email]
  );
  //return user object
  return getUserById(result.insertId);
}

async function getUserLoginCredentialsByUsername(username) {
  const results = await query(
    "SELECT user_id, username, hashed_password FROM users WHERE username = ?",
    [username]
  );

  if (results.length === 0) {
    throw new Error("User not found");
  }

  return {
    userID: results[0].user_id,
    username: results[0].username,
    hashedPassword: results[0].hashed_password,
  };
}

function mapUser(sqlUser) {
  return (user = {
    userID: sqlUser.user_id,
    username: sqlUser.username,
    email: sqlUser.email,
    firstName: sqlUser.first_name,
    lastName: sqlUser.last_name,
  });
}

async function getUserByUsername(username) {
  const results = await query("SELECT * FROM users WHERE username = ?", [
    username,
  ]);

  if (results.length === 0) {
    throw new Error("User not found");
  }

  return mapUser(results[0]);
}

async function getUserById(id) {
  const results = await query("SELECT * FROM users WHERE user_id = ?", [id]);

  if (results.length === 0) {
    throw new Error("User not found");
  }

  return mapUser(results[0]);
}

async function getRunsByUserId(id) {
  const sqlRuns = await query("SELECT * FROM runs WHERE user_id = ?", [id]);

  const runs = sqlRuns.map((run) => ({
    runID: run.run_id,
    userID: run.user_id,
    distanceKm: run.distance_km,
    durationMinutes: run.duration_minutes,
    dateOfRun: run.date_of_run,
    paceSecPerKm: run.pace_sec_per_km,
    speedKmh: run.speed_kmh,
    calories: run.calories,
  }));

  return runs;
}

module.exports = {
  getUserByUsername,
  getUserById,
  getRunsByUserId,
  getUserLoginCredentialsByUsername,
  createUser,
};

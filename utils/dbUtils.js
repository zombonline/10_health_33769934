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
async function mapRun(sqlRun) {
  return {
    runID: sqlRun.run_id,
    user: await getUserById(sqlRun.user_id),
    distanceKm: sqlRun.distance_km,
    durationMinutes: sqlRun.duration_minutes,
    dateOfRun: sqlRun.date_of_run,
  };
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

async function getRunById(id) {
  const results = await query("SELECT * FROM runs WHERE run_id = ?", [id]);
  if (results.length === 0) {
    throw new Error("Run not found");
  }
  return await mapRun(results[0]);
}

async function getRunsByUserId(id, amount = -1, mode = "recent") {
  let results = [];
  switch (mode) {
    case "recent":
      results = await query(
        `SELECT * FROM runs WHERE user_id = ? ORDER BY date_of_run DESC ${
          amount > 0 ? "LIMIT ?" : ""
        }`,
        amount > 0 ? [id, amount] : [id]
      );
      break;
    case "longest":
      results = await query(
        `SELECT * FROM runs WHERE user_id = ? ORDER BY distance_km DESC ${
          amount > 0 ? "LIMIT ?" : ""
        }`,
        amount > 0 ? [id, amount] : [id]
      );
      break;
    default:
      throw new Error("Invalid mode");
  }
  //map results to runs
  const runs = [];
  for (const element of results) {
    runs.push(await mapRun(element));
  }
  return runs;
}

async function getRunsByFollowing(userID, amount = -1) {
  //get following IDs
  const followingIDs = await getFollowing(userID);

  if (followingIDs.length === 0) {
    return [];
  }
  //get runs by following IDs
  const result = [];
  for (const element of followingIDs) {
    result.push(...await getRunsByUserId(element, -1, "recent"));
  }
  //sort by date_of_run desc
  result.sort((a, b) => new Date(b.dateOfRun) - new Date(a.dateOfRun));
  //limit to amount
  return amount > 0 ? result.slice(0, amount) : result;
}

async function addRun(userID, distanceKm, durationMinutes, dateOfRun) {
  const result = await query(
    "INSERT INTO runs (user_id, distance_km, duration_minutes, date_of_run) VALUES (?, ?, ?, ?)",
    [userID, distanceKm, durationMinutes, dateOfRun]
  );
  return result.insertId;
}

async function follow(followerID, followeeID) {
  const result = await query(
    "INSERT INTO follows (follower_id, followee_id) VALUES (?, ?)",
    [followerID, followeeID]
  );
  return result.insertId;
}
async function unfollow(followerID, followeeID) {
  const result = await query(
    "DELETE FROM follows WHERE follower_id = ? AND followee_id = ?",
    [followerID, followeeID]
  );
  return result.affectedRows;
}
async function isFollowing(followerID, followeeID) {
  const results = await query(
    "SELECT * FROM follows WHERE follower_id = ? AND followee_id = ?",
    [followerID, followeeID]
  );
  return results.length > 0;
}
async function getFollowers(userID) {
  const results = await query(
    "SELECT follower_id FROM follows WHERE followee_id = ?",
    [userID]
  );
  return results.map((row) => row.follower_id);
}
async function getFollowing(userID) {
  const results = await query(
    "SELECT followee_id FROM follows WHERE follower_id = ?",
    [userID]
  );
  return results.map((row) => row.followee_id);
}

module.exports = {
  getUserByUsername,
  getUserById,
  getRunsByUserId,
  getUserLoginCredentialsByUsername,
  createUser,
  addRun,
  getRunById,
  follow,
  unfollow,
  isFollowing,
  getFollowers,
  getFollowing,
  getRunsByFollowing,
};

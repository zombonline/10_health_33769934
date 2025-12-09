const db = global.db;

/* -------------------------------------------------------------------------- */
/*                                   HELPERS                                  */
/* -------------------------------------------------------------------------- */

function query(sql, params) {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, results) => {
      if (err) {
        console.error("Database error:", err);
        return reject(new Error("Database error"));
      }
      resolve(results);
    });
  });
}

function mapUser(row) {
  return {
    userID: row.user_id,
    username: row.username,
    email: row.email,
    firstName: row.first_name,
    lastName: row.last_name,
  };
}

/* -------------------------------------------------------------------------- */
/*                               BASIC USER LOADERS                            */
/* -------------------------------------------------------------------------- */

async function getUserById(id) {
  const rows = await query("SELECT * FROM users WHERE user_id = ?", [id]);

  if (rows.length === 0)
    throw new Error("User not found with ID: " + id);

  return mapUser(rows[0]);
}

async function getUserByUsername(username) {
  const rows = await query("SELECT * FROM users WHERE username = ?", [username]);

  if (rows.length === 0)
    throw new Error("User not found");

  return mapUser(rows[0]);
}

async function getUserLoginCredentialsByUsername(username) {
  const rows = await query(
    "SELECT user_id, username, hashed_password FROM users WHERE username = ?",
    [username]
  );

  if (rows.length === 0)
    throw new Error("User not found");

  return {
    userID: rows[0].user_id,
    username: rows[0].username,
    hashedPassword: rows[0].hashed_password,
  };
}

/* -------------------------------------------------------------------------- */
/*                                  COUNTS                                    */
/* -------------------------------------------------------------------------- */

async function getRunCount(userID) {
  const result = await query(
    "SELECT COUNT(*) AS count FROM runs WHERE user_id = ?",
    [userID]
  );
  return result[0].count;
}

async function getFollowerCount(userID) {
  const result = await query(
    "SELECT COUNT(*) AS count FROM follows WHERE followee_id = ?",
    [userID]
  );
  return result[0].count;
}

async function getFollowingCount(userID) {
  const result = await query(
    "SELECT COUNT(*) AS count FROM follows WHERE follower_id = ?",
    [userID]
  );
  return result[0].count;
}

/* -------------------------------------------------------------------------- */
/*                             FOLLOW + RELATIONS                              */
/* -------------------------------------------------------------------------- */

async function follow(followerID, followeeID) {
  return query(
    "INSERT INTO follows (follower_id, followee_id) VALUES (?, ?)",
    [followerID, followeeID]
  );
}

async function unfollow(followerID, followeeID) {
  return query(
    "DELETE FROM follows WHERE follower_id = ? AND followee_id = ?",
    [followerID, followeeID]
  );
}

async function isFollowing(followerID, followeeID) {
  const rows = await query(
    "SELECT * FROM follows WHERE follower_id = ? AND followee_id = ?",
    [followerID, followeeID]
  );
  return rows.length > 0;
}

/* ----------------------- ID-ONLY follower lists --------------------------- */

async function getFollowerIDs(userID) {
  const rows = await query(
    "SELECT follower_id FROM follows WHERE followee_id = ?",
    [userID]
  );

  return rows.map(r => r.follower_id);
}

async function getFollowingIDs(userID) {
  const rows = await query(
    "SELECT followee_id FROM follows WHERE follower_id = ?",
    [userID]
  );

  return rows.map(r => r.followee_id);
}

/* -------------------------------------------------------------------------- */
/*                                  RUNS                                      */
/* -------------------------------------------------------------------------- */

async function mapRun(row) {
  return {
    runID: row.run_id,
    user: await getUserById(row.user_id), // lightweight
    distanceKm: row.distance_km,
    durationMinutes: row.duration_minutes,
    dateOfRun: row.date_of_run,
  };
}

async function getRunById(id) {
  const rows = await query("SELECT * FROM runs WHERE run_id = ?", [id]);

  if (rows.length === 0)
    throw new Error("Run not found");

  return await mapRun(rows[0]);
}

async function getRunsByUserId(id, amount = -1, mode = "recent") {
  let sql = `SELECT * FROM runs WHERE user_id = ?`;
  let order = "";
  if (mode === "recent") order = " ORDER BY date_of_run DESC";
  if (mode === "longest") order = " ORDER BY distance_km DESC";

  if (amount > 0) order += ` LIMIT ${amount}`;

  const rows = await query(sql + order, [id]);
  const runs = [];

  for (const r of rows)
    runs.push(await mapRun(r));

  return runs;
}

async function getRunsByFollowing(userID, amount = -1) {
  const followingIDs = await getFollowingIDs(userID);
  if (followingIDs.length === 0) return [];

  const allRuns = [];

  for (const id of followingIDs) {
    const userRuns = await getRunsByUserId(id, -1, "recent");
    allRuns.push(...userRuns);
  }

  allRuns.sort((a, b) => new Date(b.dateOfRun) - new Date(a.dateOfRun));

  return amount > 0 ? allRuns.slice(0, amount) : allRuns;
}

/* -------------------------------------------------------------------------- */
/*                          FULL / LITE PROFILE LOADERS                        */
/* -------------------------------------------------------------------------- */

async function getLiteUserProfileByID(userID, viewerID = null) {
  const user = await getUserById(userID);

  user.runsCount = await getRunCount(userID);
  user.followersCount = await getFollowerCount(userID);
  user.followingCount = await getFollowingCount(userID);

  user.isFollowing =
    viewerID && viewerID !== userID
      ? await isFollowing(viewerID, userID)
      : false;

  return user;
}

async function getFullUserProfileByID(userID, viewerID = null) {
  const user = await getUserById(userID);

  user.runs = await getRunsByUserId(userID);

  const followerIDs = await getFollowerIDs(userID);
  const followingIDs = await getFollowingIDs(userID);

  user.followers = [];
  for (const id of followerIDs)
    user.followers.push(await getLiteUserProfileByID(id, viewerID));

  user.following = [];
  for (const id of followingIDs)
    user.following.push(await getLiteUserProfileByID(id, viewerID));

  user.isFollowing =
    viewerID && viewerID !== userID
      ? await isFollowing(viewerID, userID)
      : false;

  return user;
}

/* -------------------------------------------------------------------------- */
/*                              MUTATION HELPERS                               */
/* -------------------------------------------------------------------------- */

async function createUser(username, hashedPassword, email) {
  const result = await query(
    "INSERT INTO users (username, hashed_password, email) VALUES (?, ?, ?)",
    [username, hashedPassword, email]
  );
  return getUserById(result.insertId);
}

async function addRun(userID, distanceKm, durationMinutes, dateOfRun) {
  return query(
    "INSERT INTO runs (user_id, distance_km, duration_minutes, date_of_run) VALUES (?, ?, ?, ?)",
    [userID, distanceKm, durationMinutes, dateOfRun]
  );
}

async function updateUserSetting(settingKey, newValue, userID) {
  const result = await query(
    `UPDATE users SET ${settingKey} = ? WHERE user_id = ?`,
    [newValue, userID]
  );
  return result.affectedRows;
}

/* -------------------------------------------------------------------------- */
/*                                   EXPORTS                                   */
/* -------------------------------------------------------------------------- */

module.exports = {
  // basic
  getUserById,
  getUserByUsername,
  getUserLoginCredentialsByUsername,

  // runs
  getRunById,
  getRunsByUserId,
  getRunsByFollowing,
  addRun,

  // relationships
  follow,
  unfollow,
  isFollowing,
  getFollowerIDs,
  getFollowingIDs,

  // counts
  getRunCount,
  getFollowerCount,
  getFollowingCount,

  // profiles
  getLiteUserProfileByID,
  getFullUserProfileByID,

  // settings
  createUser,
  updateUserSetting,
};

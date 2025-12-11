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
    profileImageUrl: row.profile_image_url
  };
}

function mapGoal(row) {
  return {
    goalID: row.goal_id,  
    creatorUserID: row.creator_user_id,
    title: row.title,
    description: row.description,
    goalType: row.goal_type,
    targetDistanceKm: row.target_distance,
    targetPace: row.target_pace,
    startDate: row.start_date,
    endDate: row.end_date,
    visibility: row.visibility
  };
}

function mapUserGoal(row) {
  return {
    userGoalID: row.user_goal_id,
    userID: row.user_id,
    goalId: row.goal_id,
    status: row.status,
    joinedAt: row.joined_at
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


//search

async function searchUsers(queryStr) {
  const rows = await query(
    "SELECT * FROM users WHERE username LIKE ? OR first_name LIKE ? OR last_name LIKE ?",
    [`%${queryStr}%`, `%${queryStr}%`, `%${queryStr}%`]
  );
  const users = [];
  for (const r of rows) {
    users.push(await getLiteUserProfileByID(r.user_id));
  }
  return users;
}

async function searchGoals(queryStr) {
  const rows = await query(
    "SELECT * FROM goals WHERE title LIKE ? OR description LIKE ?",
    [`%${queryStr}%`, `%${queryStr}%`]
  );
  const goals = [];
  for (const r of rows) {
    goals.push(mapGoal(r));
  }
  return goals;
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
    createdAt: row.created_at
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
  if (mode === "recent") order = " ORDER BY created_at DESC";
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


//GOALS

async function createGoal(userID, title, description, goalType, targetDistanceKm, targetPace, startDate, endDate, visibility){
  const result = await query(
    "INSERT INTO goals (creator_user_id, title, description, goal_type, target_distance, target_pace, start_date, end_date, visibility) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [userID, title, description, goalType, targetDistanceKm, targetPace, startDate, endDate, visibility]
  );
  return result.insertId;
}
async function joinGoal(userID, goalId){
  return query(
    "INSERT INTO user_goals (user_id, goal_id) VALUES (?, ?)",
    [userID, goalId]
  );
}
async function leaveGoal(userID, goalId){
  return query(
    "DELETE FROM user_goals WHERE user_id = ? AND goal_id = ?",
    [userID, goalId]
  );
}
async function getGoalById(goalId){
  const rows = await query("SELECT * FROM goals WHERE goal_id = ?", [goalId]);

  if (rows.length === 0)
    throw new Error("Goal not found");
  return mapGoal(rows[0]);
}
async function getUserGoalProgress(userID, goalId){
  const rows = await query(
    "SELECT * FROM user_goals WHERE user_id = ? AND goal_id = ?",
    [userID, goalId]
  );
  if (rows.length === 0)
    throw new Error("User goal not found");
  return mapUserGoal(rows[0]);
}
async function getUsersInGoal(goalId){
  const rows = await query(
    "SELECT ug.*, u.* FROM user_goals ug JOIN users u ON ug.user_id = u.user_id WHERE ug.goal_id = ?",
    [goalId]
  );
  const usersInGoal = [];
  for (const r of rows) {
    usersInGoal.push({
      user: mapUser(r),
      userGoalProgress: mapUserGoal(r)
    });
  }
  return usersInGoal;
}
async function getGoalsJoinedByUserID(userID) {
  const rows = await query(
    "SELECT g.* FROM goals g JOIN user_goals ug ON g.goal_id = ug.goal_id WHERE ug.user_id = ?",
    [userID]
  );
  const goals = [];
  for (const r of rows) {
    goals.push(mapGoal(r));
  }
  return goals;
}

async function getGoalsCreatedByUserID(userID) {
  const rows = await query(
    "SELECT * FROM goals WHERE creator_user_id = ?",  
    [userID]
  );
  const goals = [];
  for (const r of rows) {
    goals.push(mapGoal(r));
  }
  return goals;
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

  // search
  searchUsers,
  searchGoals,

  // goals
  createGoal,
  joinGoal,
  leaveGoal,
  getGoalById,
  getUserGoalProgress,
  getUsersInGoal,
  getGoalsJoinedByUserID,
  getGoalsCreatedByUserID,
};

const dbUtils = require('../utils/dbUtils');
async function getUserFeed(userId) {
  const followingUserIDs = await dbUtils.getFollowingIDs(userId);
  console.log('Following IDs:', followingUserIDs);
  const activities = [];
  for (const userID of followingUserIDs) {
    const userRuns = await dbUtils.getRunsByUserId(userID, -1, 'recent');
    const userGoalsJoined = await dbUtils.getGoalsJoinedByUserID(userID);
    const userGoalsCreated = await dbUtils.getGoalsCreatedByUserID(userID);
    const user = await dbUtils.getLiteUserProfileByID(userID);
    for (const run of userRuns) {
      activities.push({
        type: 'run',
        item: run,
        user: user,
        createdAt: run.created_at,
      });
    }
    for (const goal of userGoalsJoined) {
      //check creator isnt user
      if (goal.creatorUserID === userID) continue;
      activities.push({
        type: 'joinGoal',
        item: goal,
        user: user,
        createdAt: goal.joined_at,
      });
    }
    for (const goal of userGoalsCreated) {
      activities.push({
        type: 'createGoal',
        item: goal,
        user: user,
        createdAt: goal.created_at,
      });
    }
  }
  //sort by created at desc
  activities.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return activities;
}

async function getSearchResults(query, type) {
  let results = [];
  switch (type) {
    case 'users':
      results = await dbUtils.searchUsers(query);
      break;
    case 'goals':
      results = await dbUtils.searchGoals(query);
      break;
    default:
      results = await dbUtils.searchUsers(query);
      break;
  }
  return { type, results, query };
}

async function getSuggestedUsers(userID, limit = 5) {
  const followingUserIDs = userID ? await dbUtils.getFollowingIDs(userID) : [];
  let users = await dbUtils.getAllUsers();
  //shuffle users
  for (let i = users.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [users[i], users[j]] = [users[j], users[i]];
  }
  //remove logged in user from suggestions
  users = users.filter((u) => u.userID !== userID);
  //remove users already followed by logged in user
  users = users.filter((u) => !followingUserIDs.includes(u.userID));

  return users.slice(0, limit);
}

async function getSuggestedGoals(userID, limit = 5) {
  let goals = await dbUtils.getAllGoals();
  //shuffle goals
  for (let i = goals.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [goals[i], goals[j]] = [goals[j], goals[i]];
  }
  //remove goals already joined by logged in user
  if (userID) {
    const joinedGoalIDs = await dbUtils
      .getGoalsJoinedByUserID(userID)
      .then((gs) => gs.map((g) => g.goalID));
    goals = goals.filter((g) => !joinedGoalIDs.includes(g.goalID));
  }

  return goals.slice(0, limit);
}

module.exports = {
  getUserFeed,
  getSearchResults,
  getSuggestedUsers,
  getSuggestedGoals,
};

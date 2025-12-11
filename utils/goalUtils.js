const values = require('../constants/values');
const dbutils = require('./dbUtils');
async function checkAllGoals() {
  console.log('Checking all goals...');
  const allUsers = await dbutils.getAllUsers();
  for (const user of allUsers) {
    await checkAllUserGoals(user.userID);
  }
}
async function checkAllUserGoals(userID) {
  console.log('Checking goals for userID:', userID);
  const joinedGoals = await dbutils.getGoalsJoinedByUserID(userID);
  for (const userGoal of joinedGoals) {
    const userProgress = await dbutils.getUserGoalProgress(
      userID,
      userGoal.goalID,
    );
    console.log(
      'Processing goal:',
      userGoal.goalID,
      'with current status:',
      userProgress.goalStatus,
    );
    const goal = await dbutils.getGoalById(userGoal.goalID);
    const user_runs = await dbutils.getRunsByUserId(userID, -1, 'all');
    const newStatus = computeGoalStatus(goal, user_runs);
    console.log('Computed new status:', newStatus);
    if (newStatus !== userProgress.goalStatus) {
      await dbutils.updateUserGoalStatus(userProgress.userGoalID, newStatus);
    }
  }
}

function computeGoalStatus(goal, user_runs) {
  const today = new Date();
  let isCompleted = false;
  if (new Date(goal.startDate) > today) {
    return values.GOAL_STATUS.INCOMPLETED;
  }
  console.log(
    'Computing status for goal:',
    goal.goalID,
    'of type:',
    goal.goalType,
  );
  switch (goal.goalType) {
    case values.GOAL_TYPE.SINGLE:
      isCompleted = checkSingleGoalCompletion(goal, user_runs);
      break;
    case values.GOAL_TYPE.TOTAL:
      isCompleted = checkTotalGoalCompletion(goal, user_runs);
      break;
    case values.GOAL_TYPE.PACE:
      isCompleted = checkPaceGoalCompletion(goal, user_runs);
      break;
  }
  if (isCompleted) {
    return values.GOAL_STATUS.COMPLETED;
  }
  if (new Date(goal.endDate) < today) {
    return values.GOAL_STATUS.FAILED;
  }
  return values.GOAL_STATUS.INCOMPLETED;
}

function checkSingleGoalCompletion(goal, runs) {
  const startDate = new Date(goal.startDate);
  const endDate = new Date(goal.endDate);
  for (const run of runs) {
    const runDate = new Date(run.date);
    if (
      runDate >= startDate &&
      runDate <= endDate &&
      run.distanceKm >= goal.targetDistanceKm
    ) {
      return true;
    }
  }
  return false;
}

function checkTotalGoalCompletion(goal, runs) {
  const startDate = new Date(goal.startDate);
  const endDate = new Date(goal.endDate);
  let totalDistance = 0;
  for (const run of runs) {
    const runDate = new Date(run.dateOfRun);
    if (runDate >= startDate && runDate <= endDate) {
      totalDistance += run.distanceKm;
    }
  }

  return totalDistance >= goal.targetDistanceKm;
}

function checkPaceGoalCompletion(goal, runs) {
  const startDate = new Date(goal.startDate);
  const endDate = new Date(goal.endDate);
  for (const run of runs) {
    const runDate = new Date(run.date);
    if (run.distanceKm < goal.targetDistanceKm) {
      continue;
    }
    if (runDate >= startDate && runDate <= endDate) {
      const pace = run.durationMinutes / run.distanceKm;
      if (pace <= goal.targetPaceMinutesPerKm) {
        return true;
      }
    }
  }
  return false;
}

module.exports = {
  computeGoalStatus,
  checkAllGoals,
  checkAllUserGoals,
};

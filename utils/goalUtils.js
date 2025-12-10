const values = require('../constants/values');

function computeGoalStatus(goal, user_runs) {
    const today = new Date();
    let isCompleted = false;
    if (new Date(goal.startDate) > today) {
        return values.GOAL_STATUS.NOT_STARTED;
    }

    switch(goal.goalType) {
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
    if (new Date(goal.targetDate) < today) {
        return values.GOAL_STATUS.FAILED;
    }
    return values.GOAL_STATUS.ACTIVE;
}

function checkSingleGoalCompletion(goal, runs) {
    const startDate = new Date(goal.startDate);
    const endDate = new Date(goal.endDate);
    for (const run of runs) {
        const runDate = new Date(run.date);
        if (runDate >= startDate && runDate <= endDate && run.distanceKm >= goal.targetDistanceKm) {
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
        const runDate = new Date(run.date);
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
        if(run.distanceKm < goal.targetDistanceKm) {
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
    computeGoalStatus
};

const dbUtils = require("../utils/dbUtils");
async function getUserFeed(userId) {
    const followingUserIDs = await dbUtils.getFollowingIDs(userId);
    console.log("Following IDs:", followingUserIDs);
    const activities = [];
    for (const userID of followingUserIDs) {
        const userRuns = await dbUtils.getRunsByUserId(userID, -1, "recent");
        const userGoalsJoined = await dbUtils.getGoalsJoinedByUserID(userID);
        const userGoalsCreated = await dbUtils.getGoalsCreatedByUserID(userID);
        const user = await dbUtils.getLiteUserProfileByID(userID);
        for (const run of userRuns) {
            activities.push({
                type: "run",
                item: run,
                user: user,
                createdAt: run.created_at
            });
        }
        for (const goal of userGoalsJoined) {
            //check creator isnt user 
            if(goal.creatorUserID === userID) 
                continue;
            activities.push({
                type: "joinGoal",
                item: goal,
                user: user,
                createdAt: goal.joined_at
            });
        }
        for (const goal of userGoalsCreated) {
            activities.push({
                type: "createGoal",
                item: goal,
                user: user,
                createdAt: goal.created_at
            });
        }
    }
    //sort by created at desc
    activities.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return activities;
}

async function getSearchResults(query, type) {
    let results = [];
    switch(type) {
        case "users":
            results = await dbUtils.searchUsers(query);
            break;
        case "goals":
            results =  await dbUtils.searchGoals(query);
            break;
        default:
            results = await dbUtils.searchUsers(query);
            break;
    }
    return { type, results, query };
}

module.exports = {
    getUserFeed,
    getSearchResults
};

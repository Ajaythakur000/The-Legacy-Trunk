import FamilyCircle from '../models/familyCircleModel.js';
import FamilyMember from '../models/familyMember.js';

/**
 * Handle Daily Login Streak & First Login Points
 */
export const handleDailyLogin = async (userId, familyCircleId) => {
  try {
    const user = await FamilyMember.findById(userId);
    if (!user) return;

    // Aaj ki date string format mein (e.g., "2026-04-07")
    const todayStr = new Date().toISOString().split('T')[0];
    const lastLoginStr = user.lastLoginDate;

    let pointsToAdd = 0;

    if (!lastLoginStr) {
      // First time login ever
      user.currentStreak = 1;
      user.maxStreak = 1;
      pointsToAdd = 1;
    } else if (lastLoginStr !== todayStr) {
      // Pehle kabhi login kiya tha, par aaj nahi
      
      const today = new Date(todayStr);
      const lastLogin = new Date(lastLoginStr);
      
      // Calculate difference in days safely
      const diffTime = Math.abs(today - lastLogin);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        // Consecutive day -> Increase streak
        user.currentStreak += 1;
        if (user.currentStreak > user.maxStreak) {
          user.maxStreak = user.currentStreak;
        }
      } else {
        // Missed a day -> Reset streak
        user.currentStreak = 1;
      }
      
      // Pehla login aaj ka hai toh point do
      pointsToAdd = 1;
    }

    // Agar point milna hai (Pehla login din ka)
    if (pointsToAdd > 0) {
      user.lastLoginDate = todayStr;
      
      // Update Heatmap Score
      const currentMapScore = user.activityMap.get(todayStr) || 0;
      user.activityMap.set(todayStr, currentMapScore + pointsToAdd);

      // Save user
      await user.save();

      // Update Global Family Bond Points
      if (familyCircleId) {
        await FamilyCircle.findByIdAndUpdate(familyCircleId, {
          $inc: { familyBondPoints: pointsToAdd }
        });
      }
    }
  } catch (error) {
    console.error("Gamification Login Error:", error);
  }
};

/**
 * Handle Points for Actions (Post, Like, Comment)
 */
export const awardPoints = async (userId, familyCircleId, points) => {
  try {
    if (!userId || !familyCircleId || !points) return;

    const todayStr = new Date().toISOString().split('T')[0];
    const user = await FamilyMember.findById(userId);

    if (user) {
      // Update personal Top Contributor score
      user.totalContributionPoints += points;
      
      // Agar delete action hua (points negative hain), toh minimum 0 rakhein
      if (user.totalContributionPoints < 0) user.totalContributionPoints = 0;

      // Update Heatmap Score
      let currentMapScore = user.activityMap.get(todayStr) || 0;
      currentMapScore += points;
      if (currentMapScore < 0) currentMapScore = 0; // Score negative nahi ho sakta map mein

      user.activityMap.set(todayStr, currentMapScore);
      await user.save();
    }

    // Update Global Family Bond Points
    await FamilyCircle.findByIdAndUpdate(familyCircleId, {
      $inc: { familyBondPoints: points }
    });

  } catch (error) {
    console.error("Gamification Award Error:", error);
  }
};
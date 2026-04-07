import FamilyCircle from '../models/familyCircleModel.js';
import FamilyMember from '../models/familyMember.js';

// Helper function to calculate date difference
const getDiffDays = (date1Str, date2Str) => {
  const d1 = new Date(date1Str);
  const d2 = new Date(date2Str);
  return Math.max(0, Math.floor((d1 - d2) / (1000 * 60 * 60 * 24)));
};

/**
 * Handle Daily Login Points (ONLY HEATMAP, NO STREAK)
 */
export const handleDailyLogin = async (userId, familyCircleId) => {
  try {
    const user = await FamilyMember.findById(userId);
    if (!user) return;

    const todayStr = new Date().toISOString().split('T')[0];
    const lastLoginStr = user.lastLoginDate;

    // 🔥 Reset broken streak on login if they missed posting yesterday
    if (user.lastPostDate) {
      const diffPost = getDiffDays(todayStr, user.lastPostDate);
      if (diffPost > 1) {
        user.currentStreak = 0; // Streak toot gayi!
      }
    }

    // Heatmap Logic: 1 point for the first login of the day
    if (lastLoginStr !== todayStr) {
      user.lastLoginDate = todayStr;
      
      const currentMapScore = user.activityMap.get(todayStr) || 0;
      user.activityMap.set(todayStr, currentMapScore + 1);

      await user.save();

      if (familyCircleId) {
        await FamilyCircle.findByIdAndUpdate(familyCircleId, {
          $inc: { familyBondPoints: 1 }
        });
      }
    } else {
      await user.save(); // Save in case streak was reset
    }
  } catch (error) {
    console.error("Gamification Login Error:", error);
  }
};

/**
 * 🔥 NEW: Handle Streak ONLY when user POSTS A STORY
 */
export const handleStoryPostStreak = async (userId) => {
  try {
    const user = await FamilyMember.findById(userId);
    if (!user) return;

    const todayStr = new Date().toISOString().split('T')[0];
    const lastPostStr = user.lastPostDate;

    if (!lastPostStr) {
      // Pehli post zindagi ki
      user.currentStreak = 1;
      user.maxStreak = 1;
    } else if (lastPostStr !== todayStr) {
      // Aaj ki pehli post
      const diffDays = getDiffDays(todayStr, lastPostStr);
      if (diffDays === 1) {
        user.currentStreak += 1; // Streak zinda hai
        if (user.currentStreak > user.maxStreak) user.maxStreak = user.currentStreak;
      } else {
        user.currentStreak = 1; // Din miss ho gaya tha, nayi streak shuru
      }
    }
    // Agar same day mein 10 post bhi karega toh yahan aayega par streak nahi badhegi!
    
    user.lastPostDate = todayStr;
    await user.save();
  } catch (error) {
    console.error("Streak Error:", error);
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
      user.totalContributionPoints += points;
      if (user.totalContributionPoints < 0) user.totalContributionPoints = 0;

      let currentMapScore = user.activityMap.get(todayStr) || 0;
      currentMapScore += points;
      if (currentMapScore < 0) currentMapScore = 0;

      user.activityMap.set(todayStr, currentMapScore);
      await user.save();
    }

    await FamilyCircle.findByIdAndUpdate(familyCircleId, {
      $inc: { familyBondPoints: points }
    });

  } catch (error) {
    console.error("Gamification Award Error:", error);
  }
};
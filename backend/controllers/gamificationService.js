import FamilyCircle from '../models/familyCircleModel.js';
import FamilyMember from '../models/familyMember.js';

//  HELPER: Get strict YYYY-MM-DD date in Indian Time
const getISTDateStr = () => {
  const date = new Date();
  const options = { timeZone: 'Asia/Kolkata' };
  const year = new Intl.DateTimeFormat('en-US', { year: 'numeric', ...options }).format(date);
  const month = new Intl.DateTimeFormat('en-US', { month: '2-digit', ...options }).format(date);
  const day = new Intl.DateTimeFormat('en-US', { day: '2-digit', ...options }).format(date);
  return `${year}-${month}-${day}`;
};

//  HELPER: Calculate difference in days (Timezone agnostic)
const getDiffDays = (date1Str, date2Str) => {
  if (!date1Str || !date2Str) return 0;
  const [y1, m1, d1] = date1Str.split('-').map(Number);
  const [y2, m2, d2] = date2Str.split('-').map(Number);
  const utc1 = Date.UTC(y1, m1 - 1, d1);
  const utc2 = Date.UTC(y2, m2 - 1, d2);
  return Math.max(0, Math.floor((utc1 - utc2) / (1000 * 60 * 60 * 24)));
};

/**
 * Handle Daily Login Points (ONLY HEATMAP, NO STREAK)
 */
export const handleDailyLogin = async (userId, familyCircleId) => {
  try {
    const user = await FamilyMember.findById(userId);
    if (!user) return;

    const todayStr = getISTDateStr();
    const lastLoginStr = user.lastLoginDate;

    //  IF USER LOGS IN AND MISSED POSTING YESTERDAY -> RESET STREAK TO 0
    if (user.lastPostDate) {
      const diffPost = getDiffDays(todayStr, user.lastPostDate);
      if (diffPost > 1) {
        user.currentStreak = 0; 
      }
    }

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
      await user.save();
    }
  } catch (error) {
    console.error("Gamification Login Error:", error);
  }
};

/**
 *  NEW STREAK LOGIC (Triggered ONLY when user posts a story)
 */
export const handleStoryPostStreak = async (userId, session = null) => {
  try {
    const user = await FamilyMember.findById(userId).session(session);
    if (!user) return;

    const todayStr = getISTDateStr();
    const lastPostStr = user.lastPostDate;

    // Ensure streak is numeric
    user.currentStreak = Number(user.currentStreak) || 0;
    user.maxStreak = Number(user.maxStreak) || 0;

    if (!lastPostStr) {
      // SCENARIO 1: First post ever
      user.currentStreak = 1;
    } else if (lastPostStr !== todayStr) {
      const diffDays = getDiffDays(todayStr, lastPostStr);
      
      if (diffDays === 1) {
        // SCENARIO 2: Posted yesterday, posting again today -> Increment!
        user.currentStreak += 1; 
      } else if (diffDays > 1) {
        // SCENARIO 3: Missed a day -> Restart streak from 1
        user.currentStreak = 1; 
      }
    }
    // SCENARIO 4: Already posted today. (lastPostStr === todayStr)
    // Do nothing. Streak remains whatever it was.

    // Update Max Streak
    if (user.currentStreak > user.maxStreak) {
      user.maxStreak = user.currentStreak;
    }
    
    // Save today as the last post date
    user.lastPostDate = todayStr;
    await user.save({ session });
  } catch (error) {
    console.error("Streak Error:", error);
  }
};

/**
 * Handle Points for Actions (Post, Like, Comment)
 */
export const awardPoints = async (userId, familyCircleId, points, session = null) => {
  try {
    if (!userId || !familyCircleId || !points) return;

    const todayStr = getISTDateStr();
    const user = await FamilyMember.findById(userId).session(session);

    if (user) {
      user.totalContributionPoints = (Number(user.totalContributionPoints) || 0) + points;
      if (user.totalContributionPoints < 0) user.totalContributionPoints = 0;

      let currentMapScore = user.activityMap.get(todayStr) || 0;
      currentMapScore += points;
      if (currentMapScore < 0) currentMapScore = 0;

      user.activityMap.set(todayStr, currentMapScore);
      await user.save({ session });
    }

    // ✅ floor familyBondPoints at 0 (prevents negative values)
    await FamilyCircle.findByIdAndUpdate(
      familyCircleId,
      [
        {
          $set: {
            familyBondPoints: {
              $max: [0, { $add: ['$familyBondPoints', points] }],
            },
          },
        },
      ],
      { session } // Note: for aggregation pipeline updates, some older mongoose versions might have quirks, but usually session works here if passed as options object. Wait, findByIdAndUpdate options is the third arg.
    );
  } catch (error) {
    console.error('Gamification Award Error:', error);
  }
};
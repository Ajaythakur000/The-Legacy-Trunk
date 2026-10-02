import FamilyCircle from '../models/familyCircleModel.js';
import FamilyMember from '../models/familyMember.js';

// Returns the current date in YYYY-MM-DD format for Indian Standard Time
const getISTDateStr = () => {
  const date = new Date();
  const options = { timeZone: 'Asia/Kolkata' };
  const year = new Intl.DateTimeFormat('en-US', { year: 'numeric', ...options }).format(date);
  const month = new Intl.DateTimeFormat('en-US', { month: '2-digit', ...options }).format(date);
  const day = new Intl.DateTimeFormat('en-US', { day: '2-digit', ...options }).format(date);
  return `${year}-${month}-${day}`;
};

// Calculates the absolute difference in days between two date strings
const getDiffDays = (date1Str, date2Str) => {
  if (!date1Str || !date2Str) return 0;
  const [y1, m1, d1] = date1Str.split('-').map(Number);
  const [y2, m2, d2] = date2Str.split('-').map(Number);
  const utc1 = Date.UTC(y1, m1 - 1, d1);
  const utc2 = Date.UTC(y2, m2 - 1, d2);
  return Math.max(0, Math.floor((utc1 - utc2) / (1000 * 60 * 60 * 24)));
};

// Tracks a user's daily login for their activity map and resets streak if they missed a post day
export const handleDailyLogin = async (userId, familyCircleId) => {
  try {
    const user = await FamilyMember.findById(userId);
    if (!user) return;

    const todayStr = getISTDateStr();
    const lastLoginStr = user.lastLoginDate;

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

// Updates a user's current and maximum posting streak when they post a new story
export const handleStoryPostStreak = async (userId, session = null) => {
  try {
    let query = FamilyMember.findById(userId);
    if (session) query = query.session(session);
    const user = await query;
    
    if (!user) return;

    const todayStr = getISTDateStr();
    const lastPostStr = user.lastPostDate;

    user.currentStreak = Number(user.currentStreak) || 0;
    user.maxStreak = Number(user.maxStreak) || 0;

    if (!lastPostStr) {
      user.currentStreak = 1;
    } else if (lastPostStr !== todayStr) {
      const diffDays = getDiffDays(todayStr, lastPostStr);
      
      if (diffDays === 1) {
        user.currentStreak += 1; 
      } else if (diffDays > 1) {
        user.currentStreak = 1; 
      }
    }

    if (user.currentStreak > user.maxStreak) {
      user.maxStreak = user.currentStreak;
    }
    
    user.lastPostDate = todayStr;
    const saveOptions = session ? { session } : {};
    await user.save(saveOptions);
  } catch (error) {
    console.error("Streak Error:", error);
  }
};

// Awards contribution points to a user and bond points to their family circle for taking actions
export const awardPoints = async (userId, familyCircleId, points, session = null) => {
  try {
    if (!userId || !familyCircleId || !points) return;

    const todayStr = getISTDateStr();
    
    let query = FamilyMember.findById(userId);
    if (session) query = query.session(session);
    const user = await query;

    if (user) {
      user.totalContributionPoints = (Number(user.totalContributionPoints) || 0) + points;
      if (user.totalContributionPoints < 0) user.totalContributionPoints = 0;

      let currentMapScore = user.activityMap.get(todayStr) || 0;
      currentMapScore += points;
      if (currentMapScore < 0) currentMapScore = 0;

      user.activityMap.set(todayStr, currentMapScore);
      
      const saveOptions = session ? { session } : {};
      await user.save(saveOptions);
    }

    const updateOptions = session ? { session } : {};
    
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
      updateOptions
    );
  } catch (error) {
    console.error('Gamification Award Error:', error);
  }
};
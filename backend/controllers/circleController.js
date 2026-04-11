import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import FamilyCircle from '../models/familyCircleModel.js';
import FamilyMember from '../models/familyMember.js';
import Story from '../models/storyModel.js';
import Notification from '../models/notificationModel.js'; 

const generateFamilyCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let rand = '';
  for (let i = 0; i < 6; i += 1) rand += chars[Math.floor(Math.random() * chars.length)];
  return `TRUNK-${rand}`;
};

const createUniqueFamilyCode = async () => {
  let code = generateFamilyCode();
  while (await FamilyCircle.findOne({ familyCode: code })) {
    code = generateFamilyCode();
  }
  return code;
};

const createCircle = async (req, res) => {
  try {
    const { circleName } = req.body;
    if (!circleName?.trim()) {
      return res.status(400).json({ message: 'Circle name is required' });
    }

    const familyCode = await createUniqueFamilyCode();

    const created = await FamilyCircle.create({
      circleName: circleName.trim(),
      familyCode,
      admin: req.user._id,
      members: [req.user._id],
    });

    await FamilyMember.findByIdAndUpdate(req.user._id, {
      activeCircleId: created._id,
      familyCode: created.familyCode,
    });

    const circle = await FamilyCircle.findById(created._id)
      .populate('admin', 'name email role')
      .populate('members', 'name email role relationToAdmin');

    return res.status(201).json(circle);
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to create circle' });
  }
};

const getMyCircles = async (req, res) => {
  try {
    const circles = await FamilyCircle.find({ members: req.user._id })
      .populate('admin', 'name email role')
      .sort({ createdAt: -1 });

    return res.status(200).json(circles);
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to load circles' });
  }
};

const getCircleById = async (req, res) => {
  try {
    const circle = await FamilyCircle.findById(req.params.id)
      .populate('admin', 'name email role relationToAdmin avatar')
      .populate('members', 'name email role relationToAdmin activeCircleId familyCode avatar dateOfBirth');

    if (!circle) return res.status(404).json({ message: 'Circle not found' });

    const allowed = circle.members.some((m) => String(m._id) === String(req.user._id));
    if (!allowed) return res.status(403).json({ message: 'Not authorized to view this circle' });

    return res.status(200).json(circle);
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to load circle' });
  }
};

// ==========================================
//  MODIFIED: SEND INVITE NOTIFICATION (Spam Protection Added)
// ==========================================
const sendFamilyInvite = async (req, res) => {
  try {
    const { id: circleId } = req.params;
    const email = req.body?.email?.toLowerCase()?.trim();

    if (!email) return res.status(400).json({ message: 'Member email is required' });

    const circle = await FamilyCircle.findById(circleId);
    if (!circle) return res.status(404).json({ message: 'Circle not found' });

    if (String(circle.admin) !== String(req.user._id)) {
      return res.status(401).json({ message: 'Only admin can send invites' });
    }

    const targetUser = await FamilyMember.findOne({ email });
    if (!targetUser) return res.status(404).json({ message: 'User with this email not found' });

    if (circle.members.some((m) => String(m) === String(targetUser._id))) {
      return res.status(400).json({ message: 'User is already in this family' });
    }

    const pendingInvite = await Notification.findOne({
      recipient: targetUser._id,
      circleId: circle._id,
      type: 'invite' 
    });

    if (pendingInvite) {
      return res.status(400).json({ message: 'An invite is already pending for this user!' });
    }

    const newNotif = await Notification.create({
      recipient: targetUser._id,
      sender: req.user._id,
      type: 'invite', 
      circleId: circle._id, 
      message: `${req.user.name} invited you to join ${circle.circleName}`
    });

    const io = req.app.get('io');
    if (io) {
      io.to(String(targetUser._id)).emit('new_notification', newNotif);
    }

    return res.status(200).json({ message: `Invite sent to ${targetUser.name}` });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to send invite' });
  }
};

const removeMemberFromCircle = async (req, res) => {
  try {
    const { circleId, memberId } = req.params;

    const circle = await FamilyCircle.findById(circleId);
    if (!circle) return res.status(404).json({ message: 'Circle not found' });

    if (String(circle.admin) !== String(req.user._id)) {
      return res.status(401).json({ message: 'Only admin can remove members' });
    }

    if (String(circle.admin) === String(memberId)) {
      return res.status(400).json({ message: 'Admin cannot be removed' });
    }

    circle.members.pull(memberId);
    await circle.save();

    const userToUpdate = await FamilyMember.findById(memberId);
    if (userToUpdate && String(userToUpdate.activeCircleId || '') === String(circle._id)) {
      userToUpdate.activeCircleId = null;
      userToUpdate.familyCode = null;
      await userToUpdate.save();
    }

    const updated = await FamilyCircle.findById(circle._id)
      .populate('admin', 'name email role')
      .populate('members', 'name email role relationToAdmin');

    return res.status(200).json(updated);
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to remove member' });
  }
};

//  FIX: Calculate and attach the top contributor (champion) avatar for each family
const getLeaderboard = async (req, res) => {
  try {
    const topFamilies = await FamilyCircle.find({})
      .sort({ familyBondPoints: -1 }) 
      .limit(10)
      .populate('admin', 'name avatar') 
      .select('circleName familyCode familyBondPoints admin members')
      .lean(); // Lean to manipulate the object freely

    // Array to hold promises for finding the champion of each family
    const familiesWithChampions = await Promise.all(
      topFamilies.map(async (family) => {
        const topContributorData = await Story.aggregate([
          { $match: { originCircleId: new mongoose.Types.ObjectId(family._id) } },
          { $group: { _id: '$user', storyCount: { $sum: 1 } } },
          { $sort: { storyCount: -1 } },
          { $limit: 1 }
        ]);

        let championAvatar = null;
        let championName = '';

        if (topContributorData.length > 0) {
          const championUser = await FamilyMember.findById(topContributorData[0]._id).select('name avatar');
          championAvatar = championUser?.avatar || null;
          championName = championUser?.name || '';
        } else {
          // Fallback to admin if no stories exist
          championAvatar = family.admin?.avatar || null;
          championName = family.admin?.name || '';
        }

        return {
          ...family,
          championAvatar,
          championName
        };
      })
    );

    return res.status(200).json(familiesWithChampions);
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to fetch leaderboard' });
  }
};

const getTopContributor = async (req, res) => {
  try {
    const circleId = req.params.id;

    const circle = await FamilyCircle.findById(circleId);
    if (!circle) return res.status(404).json({ message: 'Circle not found' });

    const topContributorData = await Story.aggregate([
      { $match: { originCircleId: new mongoose.Types.ObjectId(circleId) } },
      { $group: { _id: '$user', storyCount: { $sum: 1 } } },
      { $sort: { storyCount: -1 } },
      { $limit: 1 }
    ]);

    if (topContributorData.length === 0) {
      const fallbackUser = await FamilyMember.findById(circle.admin).select('name avatar relationToAdmin');
      return res.status(200).json(fallbackUser);
    }

    const championUser = await FamilyMember.findById(topContributorData[0]._id).select('name avatar relationToAdmin');
    
    return res.status(200).json(championUser);
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to fetch top contributor' });
  }
};

const getUpcomingEvents = async (req, res) => {
  try {
    const circleId = req.params.id;
    const circle = await FamilyCircle.findById(circleId).populate('members', 'name dateOfBirth');
    
    if (!circle) return res.status(404).json({ message: 'Circle not found' });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const getNextOccurrence = (dateString) => {
      if (!dateString) return null;
      const originalDate = new Date(dateString);
      let nextDate = new Date(today.getFullYear(), originalDate.getMonth(), originalDate.getDate());
      
      if (nextDate.getTime() < today.getTime()) {
        nextDate.setFullYear(today.getFullYear() + 1);
      }
      return nextDate;
    };

    let events = [];

    circle.members.forEach(member => {
      if (member.dateOfBirth) {
        const nextBday = getNextOccurrence(member.dateOfBirth);
        if (nextBday) {
          events.push({
            type: 'birthday',
            title: `${member.name}'s Birthday`,
            date: nextBday,
            originalDate: member.dateOfBirth
          });
        }
      }
    });

    const milestoneStories = await Story.find({ 
      originCircleId: circleId, 
      isMilestone: true, 
      milestoneDate: { $exists: true } 
    }).select('title milestoneDate _id');

    milestoneStories.forEach(story => {
      const nextMilestone = getNextOccurrence(story.milestoneDate);
      if (nextMilestone) {
        events.push({
          type: 'milestone',
          title: `${story.title} Anniversary`,
          date: nextMilestone,
          storyId: story._id
        });
      }
    });

    events.sort((a, b) => a.date.getTime() - b.date.getTime());
    const topEvents = events.slice(0, 3);

    return res.status(200).json(topEvents);

  } catch (error) {
    console.error("Upcoming Events Error:", error);
    return res.status(500).json({ message: 'Failed to fetch upcoming events' });
  }
};

const generateInviteLink = async (req, res) => {
  try {
    const circleId = req.params.id;
    const circle = await FamilyCircle.findById(circleId);

    if (!circle) return res.status(404).json({ message: 'Circle not found' });

    if (String(circle.admin) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Only Admin can generate invite links' });
    }

    const inviteToken = jwt.sign(
      { circleId: circle._id, inviterId: req.user._id, type: 'invite' },
      process.env.JWT_SECRET,
      { expiresIn: '48h' }
    );

    return res.status(200).json({
      token: inviteToken,
      message: 'Invite token generated successfully',
    });
  } catch (error) {
    console.error('Generate Invite Error:', error);
    return res.status(500).json({ message: 'Failed to generate invite link' });
  }
};

const joinViaInvite = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ message: 'Invite token is missing' });

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: 'Invite link is invalid or has expired.' });
    }

    if (decoded?.type !== 'invite' || !decoded?.circleId) {
      return res.status(401).json({ message: 'Invalid invite token.' });
    }

    const { circleId } = decoded;
    const circle = await FamilyCircle.findById(circleId);

    if (!circle) return res.status(404).json({ message: 'This Family Vault no longer exists.' });

    if (circle.members.some((m) => String(m) === String(req.user._id))) {
      return res.status(400).json({ message: 'You are already a member of this family.' });
    }

    circle.members.push(req.user._id);
    await circle.save();

    await FamilyMember.findByIdAndUpdate(req.user._id, {
      activeCircleId: circle._id,
      familyCode: circle.familyCode,
    });

    return res.status(200).json({
      message: `Welcome to ${circle.circleName}!`,
      circleId: circle._id,
    });
  } catch (error) {
    console.error('Join Invite Error:', error);
    return res.status(500).json({ message: 'Failed to join via invite link' });
  }
};

const deleteCircle = async (req, res) => {
  try {
    const circleId = req.params.id;
    const circle = await FamilyCircle.findById(circleId);

    if (!circle) {
      return res.status(404).json({ message: 'Circle not found' });
    }

    if (String(circle.admin) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Only the admin can delete this family circle' });
    }

    await FamilyMember.updateMany(
      { activeCircleId: circleId },
      { activeCircleId: null, familyCode: null }
    );

    await FamilyCircle.findByIdAndDelete(circleId);

    return res.status(200).json({ message: 'Family Vault deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to delete circle' });
  }
};

export default {
  createCircle,
  sendFamilyInvite, 
  getMyCircles,
  getCircleById,
  removeMemberFromCircle,
  getLeaderboard,
  getTopContributor,
  getUpcomingEvents,
  generateInviteLink,
  joinViaInvite,
  deleteCircle
};
import FamilyCircle from '../models/familyCircleModel.js';
import FamilyMember from '../models/familyMember.js';

const generateFamilyCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let rand = '';
  for (let i = 0; i < 6; i += 1) rand += chars[Math.floor(Math.random() * chars.length)];
  return `TRUNK-${rand}`;
};

const createUniqueFamilyCode = async () => {
  let code = generateFamilyCode();
  // eslint-disable-next-line no-await-in-loop
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
      .populate('admin', 'name email role relationToAdmin')
      .populate('members', 'name email role relationToAdmin activeCircleId familyCode');

    if (!circle) return res.status(404).json({ message: 'Circle not found' });

    const allowed = circle.members.some((m) => String(m._id) === String(req.user._id));
    if (!allowed) return res.status(403).json({ message: 'Not authorized to view this circle' });

    return res.status(200).json(circle);
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to load circle' });
  }
};

const addMemberToCircle = async (req, res) => {
  try {
    const { id } = req.params;
    const email = req.body?.email?.toLowerCase()?.trim();

    if (!email) return res.status(400).json({ message: 'Member email is required' });

    const circle = await FamilyCircle.findById(id);
    if (!circle) return res.status(404).json({ message: 'Circle not found' });

    if (String(circle.admin) !== String(req.user._id)) {
      return res.status(401).json({ message: 'Only admin can add members' });
    }

    const member = await FamilyMember.findOne({ email });
    if (!member) return res.status(404).json({ message: 'User with this email not found' });

    if (circle.members.some((m) => String(m) === String(member._id))) {
      return res.status(400).json({ message: 'User already in this circle' });
    }

    circle.members.push(member._id);
    await circle.save();

    await FamilyMember.findByIdAndUpdate(member._id, {
      activeCircleId: circle._id,
      familyCode: circle.familyCode,
    });

    const updated = await FamilyCircle.findById(circle._id)
      .populate('admin', 'name email role')
      .populate('members', 'name email role relationToAdmin');

    return res.status(200).json(updated);
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to add member' });
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

export default {
  createCircle,
  addMemberToCircle,
  getMyCircles,
  getCircleById,
  removeMemberFromCircle,
};
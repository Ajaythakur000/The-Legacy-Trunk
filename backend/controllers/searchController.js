import Story from '../models/storyModel.js';
import Timeline from '../models/timelineModel.js';
import FamilyMember from '../models/familyMember.js';

/**
 * @desc    Search across stories, timeline events, and family members
 * @route   GET /api/search?q=keyword
 * @access  Private
 */
const searchContent = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || !String(q).trim()) {
      return res.status(400).json({ message: 'Please provide a search query' });
    }

    const keyword = String(q).trim();
    const regex = new RegExp(keyword, 'i');
    const activeCircleId = req.user.activeCircleId;

    // 1) Stories: private family + global searchable
    const storiesQuery = Story.find({
      $and: [
        {
          $or: [{ title: regex }, { content: regex }, { tags: regex }],
        },
        {
          $or: [{ originCircleId: activeCircleId }, { isGlobalPublic: true }],
        },
      ],
    })
      .populate('user', 'name relationToAdmin')
      .sort({ createdAt: -1 })
      .limit(25);

    // 2) Timeline events: private family + global searchable
    const timelinesQuery = Timeline.find({
      $and: [
        {
          $or: [{ title: regex }, { description: regex }, { tags: regex }],
        },
        {
          $or: [{ originCircleId: activeCircleId }, { isGlobalPublic: true }],
        },
      ],
    })
      .populate('user', 'name relationToAdmin')
      .sort({ year: 1, eventDate: 1, createdAt: 1 })
      .limit(25);

    // 3) Family members: only from same family circle (privacy first)
    const membersQuery = FamilyMember.find({
      $and: [
        {
          $or: [{ name: regex }, { email: regex }, { relationToAdmin: regex }],
        },
        { activeCircleId: activeCircleId },
      ],
    })
      .select('name email relationToAdmin role')
      .limit(25);

    const [stories, timelines, members] = await Promise.all([
      storiesQuery,
      timelinesQuery,
      membersQuery,
    ]);

    return res.json({
      query: keyword,
      counts: {
        stories: stories.length,
        timelines: timelines.length,
        members: members.length,
      },
      stories,
      timelines,
      members,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};

export { searchContent };
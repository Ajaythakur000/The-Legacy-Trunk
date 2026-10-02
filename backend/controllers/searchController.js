import Story from '../models/storyModel.js';
import Timeline from '../models/timelineModel.js';
import FamilyMember from '../models/familyMember.js';

// Searches across stories, timeline events, and family members for the given query
const searchContent = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || !String(q).trim()) {
      return res.status(400).json({ message: 'Please provide a search query' });
    }

    const keyword = String(q).trim();

    if (keyword.length > 80) {
      return res.status(400).json({ message: 'Search query too long (max 80 chars)' });
    }

    const activeCircleId = req.user.activeCircleId;
    if (!activeCircleId) {
      return res.status(400).json({ message: 'No active circle selected' });
    }

    const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\$&');
    const regex = new RegExp(escaped, 'i');

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

    const membersQuery = FamilyMember.find({
      $and: [
        {
          $or: [{ name: regex }, { relationToAdmin: regex }],
        },
        { activeCircleId: activeCircleId },
      ],
    })
      .select('name relationToAdmin role')
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
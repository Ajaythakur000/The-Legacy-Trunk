const Story = require('../models/storyModel.js');
const Timeline = require('../models/timelineModel.js');
const Event = require('../models/eventModel.js');
const FamilyCircle = require('../models/familyCircleModel.js');

/**
 * @desc    Search across stories, timelines, and events
 * @route   GET /api/search?q=keyword
 * @access  Private
 */
const searchContent = async (req, res) => {
    try {
        const { q } = req.query; // URL se search query (keyword) nikalna

        if (!q) {
            return res.status(400).json({ message: 'Please provide a search query' });
        }

        const userId = req.user._id;

        // == Authorization Setup ==
        // Pehle user ke saare circles aur timelines dhoondh lo
        const userCircles = await FamilyCircle.find({ members: userId });
        const circleIds = userCircles.map(circle => circle._id);

        const userTimelines = await Timeline.find({ user: userId });
        const timelineIds = userTimelines.map(timeline => timeline._id);

        // == Search Queries ==
        // 1. Stories mein search karo (jo user ki ho ya shared ho)
        const storyQuery = Story.find({
            $text: { $search: q },
            $or: [
                { user: userId },
                { sharedWith: { $in: circleIds } }
            ]
        }).populate('user', 'name');

        // 2. Timelines mein search karo (jo user ki ho)
        const timelineQuery = Timeline.find({
            $text: { $search: q },
            user: userId
        });

        // 3. Events mein search karo (jo user ki timelines se judi ho)
        const eventQuery = Event.find({
            $text: { $search: q },
            timeline: { $in: timelineIds }
        });

        // Saari queries ko ek saath (parallel) run karo
        const [stories, timelines, events] = await Promise.all([
            storyQuery,
            timelineQuery,
            eventQuery
        ]);

        res.json({ stories, timelines, events });

    } catch (error) {
        res.status(500).json({ message: 'Server Error: ' + error.message });
    }
};

module.exports = { searchContent };
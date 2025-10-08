const Story = require('../models/storyModel.js'); // Sahi path aur filename
const FamilyCircle = require('../models/familyCircleModel.js'); // Circle model ko import karna

/**
 * @desc    Create a new story
 * @route   POST /api/stories
 * @access  Private
 */
const createStory = async (req, res) => {
    try {
        const { title, content, tags } = req.body;

        if (!title || !content) {
            return res.status(400).json({ message: 'Title and content are required' });
        }

        let mediaUrl = '';
        let mediaType = 'text';

        if (req.file) {
            mediaUrl = req.file.path;
            if (req.file.mimetype.startsWith('image')) mediaType = 'photo';
            if (req.file.mimetype.startsWith('video')) mediaType = 'video';
            if (req.file.mimetype.startsWith('audio')) mediaType = 'audio';
        }

        const story = new Story({
            title,
            content,
            tags: tags ? tags.split(',') : [],
            user: req.user._id,
            mediaUrl,
            mediaType,
        });

        const createdStory = await story.save();
        res.status(201).json(createdStory);
    } catch (error) {
        res.status(500).json({ message: 'Server Error: ' + error.message });
    }
};

/**
 * @desc    Get stories for a logged-in user (THE LOGIC IS UPDATED)
 * @route   GET /api/stories
 * @access  Private
 */
const getMyStories = async (req, res) => {
    try {
        // 1. Un saare circles ko dhoondo jinka current user member hai
        const userCircles = await FamilyCircle.find({ members: req.user._id });
        const circleIds = userCircles.map(circle => circle._id);

        // 2. Aisi stories dhoondo jo ya to user ne khud banayi hain,
        //    YA fir un circles mein share ki gayi hain jinka woh member hai.
        const stories = await Story.find({
            $or: [
                { user: req.user._id },
                { sharedWith: { $in: circleIds } }
            ]
        }).populate('user', 'name'); // Author ka naam bhi saath mein bhej rahe hain

        res.json(stories);
    } catch (error) {
        res.status(500).json({ message: 'Server Error: ' + error.message });
    }
};

/**
 * @desc    Get a single story by ID
 * @route   GET /api/stories/:id
 * @access  Private
 */
const getStoryById = async (req, res) => {
    try {
        const story = await Story.findById(req.params.id);

        if (story) {
            if (story.user.toString() !== req.user._id.toString()) {
                return res.status(401).json({ message: 'User not authorized' });
            }
            res.json(story);
        } else {
            res.status(404).json({ message: 'Story not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error: ' + error.message });
    }
};

/**
 * @desc    Update a story
 * @route   PUT /api/stories/:id
 * @access  Private
 */
const updateStory = async (req, res) => {
    try {
        const story = await Story.findById(req.params.id);

        if (!story) {
            return res.status(404).json({ message: 'Story not found' });
        }

        if (story.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        story.title = req.body.title || story.title;
        story.content = req.body.content || story.content;
        story.tags = req.body.tags ? req.body.tags.split(',') : story.tags;

        const updatedStory = await story.save();
        res.json(updatedStory);

    } catch (error) {
        res.status(500).json({ message: 'Server Error: ' + error.message });
    }
};

/**
 * @desc    Delete a story
 * @route   DELETE /api/stories/:id
 * @access  Private
 */
const deleteStory = async (req, res) => {
    try {
        const story = await Story.findById(req.params.id);

        if (!story) {
            return res.status(404).json({ message: 'Story not found' });
        }

        if (story.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        await Story.deleteOne({ _id: req.params.id });

        res.json({ message: 'Story removed successfully', id: req.params.id });

    } catch (error) {
        res.status(500).json({ message: 'Server Error: ' + error.message });
    }
};

/**
 * @desc    Share a story with a circle
 * @route   PUT /api/stories/:id/share
 * @access  Private
 */
const shareStoryWithCircle = async (req, res) => {
    try {
        const { circleId } = req.body;
        const storyId = req.params.id;

        const story = await Story.findById(storyId);
        const circle = await FamilyCircle.findById(circleId);

        // 
        console.log("--- DEBUGGING SHARE STORY ---");
        console.log("Fetched Story Object:", story);
        console.log("Fetched Circle Object:", circle);
        console.log("---------------------------");
        // 

        if (!story || !circle) {
            return res.status(404).json({ message: 'Story or Circle not found' });
        }

        if (story.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized to share this story' });
        }

        if (!circle.members.includes(req.user._id)) {
            return res.status(401).json({ message: 'Cannot share to a circle you are not a member of' });
        }

        if (!story.sharedWith.includes(circleId)) {
            story.sharedWith.push(circleId);
            await story.save();
        }

        res.json(story);
    } catch (error) {
        console.error(error); // Yeh line error ko terminal mein print karegi
        res.status(500).json({ message: 'Server Error: ' + error.message });
    }
};

// Sabhi functions ko export karna
module.exports = {
    createStory,
    getMyStories,
    getStoryById,
    updateStory,
    deleteStory,
    shareStoryWithCircle
};
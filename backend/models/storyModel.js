const mongoose = require('mongoose');

const storySchema = new mongoose.Schema({
    // Yeh field har story ko uske banane waale user se jodegi.
    user: {
        type: mongoose.Schema.Types.ObjectId, // User ki unique ID store karega
        required: true,
        ref: 'FamilyMember' // Yeh batata hai ki yeh ID 'FamilyMember' model se li gayi hai
    },
    title: { // [cite: 66]
        type: String,
        required: [true, 'Please add a title'],
        trim: true
    },
    content: { // [cite: 67]
        type: String,
        required: [true, 'Please add content for the story']
    },
    tags: { // Yeh field humne class diagram review ke time discuss ki thi
        type: [String], // Yeh strings ka ek array hoga
        default: []
    },
    mediaUrl: { // [cite: 69]
        type: String,
        default: ''
    },
     mediaType: {
        type: String,
        enum: ['text', 'photo', 'audio', 'video'],
        default: 'text'
    },
    // Yeh array un sabhi circles ki ID store karega jinke saath yeh story shared hai.
   sharedWith: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FamilyCircle'
}]
}, {
    timestamps: true
});

const Story = mongoose.model('Story', storySchema);

module.exports = Story;
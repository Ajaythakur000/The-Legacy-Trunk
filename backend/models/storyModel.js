import { Schema, model } from 'mongoose';

// NAYA: Subdocument Schema for Comments
const commentSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'FamilyMember',
        required: true
    },
    text: {
        type: String,
        required: true,
        trim: true
    }
}, { timestamps: true });

const storySchema = new Schema({
    // Yeh field har story ko uske banane waale user se jodegi.
    user: {
        type: Schema.Types.ObjectId, 
        required: true,
        ref: 'FamilyMember' 
    },
    title: { 
        type: String,
        required: [true, 'Please add a title'],
        trim: true
    },
    content: { 
        type: String,
        required: [true, 'Please add content for the story']
    },
    tags: { 
        type: [String], 
        default: []
    },
    mediaUrl: { 
        type: String,
        default: ''
    },
    mediaType: {
        type: String,
        enum: ['text', 'photo', 'audio', 'video'],
        default: 'text'
    },
    
    // ---- THE HERITAGE NETWORK UPGRADE (NAYE FIELDS) ----
    
    // 1. Ownership: Yeh story technically kis Family Vault se belong karti hai?
    originCircleId: {
        type: Schema.Types.ObjectId,
        ref: 'FamilyCircle',
        required: true 
    },
    // 2. Visibility Toggle: Private by default, user isko Public kar sakta hai
    isGlobalPublic: {
        type: Boolean,
        default: false
    },
    // 3. Social Features (For Global Feed)
    likes: [{
        type: Schema.Types.ObjectId,
        ref: 'FamilyMember'
    }],
    comments: [commentSchema], // Upar banaya hua subdocument schema

    // 4. Cross-Family Sharing (Agar user explicitly kisi aur circle ke sath share kare)
    sharedWith: [{
        type: Schema.Types.ObjectId,
        ref: 'FamilyCircle'
    }]
}, {
    timestamps: true
});

const Story = model('Story', storySchema);

export default Story;
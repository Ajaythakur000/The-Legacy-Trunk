import { Schema, model } from 'mongoose';

const eventSchema = new Schema({
    eventName: { // [cite: 107]
        type: String,
        required: true,
        trim: true,
    },
    eventDate: { // [cite: 108]
        type: Date,
        required: true,
    },
    description: { // [cite: 109]
        type: String,
        required: true,
    },
    // Har event ek timeline se juda hoga.
    // Yeh field uss parent timeline ki ID store karegi.
    timeline: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Timeline' 
    }
}, {
    timestamps: true
});

const Event = model('Event', eventSchema);

export default Event;
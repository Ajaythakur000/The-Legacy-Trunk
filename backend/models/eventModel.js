import { Schema, model } from 'mongoose';

const eventSchema = new Schema({
    eventName: {
        type: String,
        required: true,
        trim: true,
    },
    eventDate: {
        type: Date,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
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
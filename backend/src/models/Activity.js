import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    type: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
});

export default mongoose.model('Activity', activitySchema);

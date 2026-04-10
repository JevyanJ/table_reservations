import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    googleId: { type: String, required: true, unique: true },
    name: String,
    nickname: String,
    email: { type: String, required: true, unique: true },
    role: { type: String, enum: ['user', 'admin', 'guest'], default: 'guest' }
});

export default mongoose.model('User', userSchema);

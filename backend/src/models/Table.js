import mongoose from 'mongoose';

const tableSchema = new mongoose.Schema({
    name: { type: String, required: true },
    seats: { type: Number, required: true },
    description: String
});

export default mongoose.model('Table', tableSchema);

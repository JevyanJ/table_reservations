import mongoose from 'mongoose';

const reservationSchema = new mongoose.Schema({
    title: { type: String, required: false },
    description: { type: String, required: false },
    table: { type: mongoose.Schema.Types.ObjectId, ref: 'Table', required: true },
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    userCount: { type: Number, required: true },
    start: { type: Date, required: true },
    end: { type: Date, required: true },
    fullTable: { type: Boolean, default: false }, // true si se reserva la mesa completa
    games: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Game' }], // Juegos asociados a la reserva
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
});

export default mongoose.model('Reservation', reservationSchema);

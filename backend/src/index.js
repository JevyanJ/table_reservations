import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import session from 'express-session';
import passport from 'passport';
import './passport.js';
import authRoutes from './routes/auth.js';
import reservationRoutes from './routes/reservation.js';
import tableRoutes from './routes/table.js';
import userRoutes from './routes/user.js';
import activityRoutes from './routes/activity.js';

import { swaggerUi, swaggerSpec } from './swagger.js';

dotenv.config();

const app = express();
// Middleware para loguear cada request y respuesta
app.use((req, res, next) => {
    const start = Date.now();
    console.log(`[REQ] ${req.method} ${req.originalUrl}`);
    // Log body solo si hay datos
    if (Object.keys(req.body || {}).length > 0) {
        console.log(`[BODY]`, req.body);
    }
    // Log query params
    if (Object.keys(req.query || {}).length > 0) {
        console.log(`[QUERY]`, req.query);
    }
    // Log respuesta al terminar
    const oldSend = res.send;
    res.send = function (data) {
        const duration = Date.now() - start;
        console.log(`[RES] ${req.method} ${req.originalUrl} (${duration}ms):`, data);
        oldSend.apply(res, arguments);
    };
    next();
});
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(session({
    secret: process.env.SESSION_SECRET || 'secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        sameSite: 'lax', // Cambia a 'none' y agrega secure: true si usas HTTPS
        // secure: true, // Descomenta si usas HTTPS
    }
}));
app.use(passport.initialize());
app.use(passport.session());
app.use('/auth', authRoutes);
app.use('/reservations', reservationRoutes);
app.use('/tables', tableRoutes);
app.use('/users', userRoutes);
app.use('/activities', activityRoutes);

// Documentación Swagger
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Middleware para desactivar autenticación si GOOGLE_AUTH_ENABLED=false
const googleAuthEnabled = process.env.GOOGLE_AUTH_ENABLED !== 'false';
if (!googleAuthEnabled) {
    Object.assign(global, {
        isAuthenticated: (req, res, next) => next(),
        isAdmin: (req, res, next) => next(),
    });
    app.use((req, res, next) => {
        req.user = { _id: 'dev', name: 'Dev User', email: 'dev@example.com', role: 'admin' };
        next();
    });
    console.log('⚠️  Google Auth desactivado: acceso libre a la API');
}

const PORT = process.env.PORT || 4000;

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
    })
    .catch(err => console.error('MongoDB connection error:', err));

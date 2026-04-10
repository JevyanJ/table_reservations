
/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Endpoints de autenticación
 */
import express from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';


const router = express.Router();


/**
 * @swagger
 * /auth/google:
 *   get:
 *     summary: Redirige a Google para autenticación
 *     tags: [Auth]
 *     responses:
 *       302:
 *         description: Redirección a Google
 */
// Redirige a Google para autenticación, permitiendo pasar state y callback
router.get('/google', (req, res, next) => {
    const opts = { scope: ['profile', 'email'] };
    if (req.query.state) opts.state = req.query.state;
    passport.authenticate('google', opts)(req, res, next);
});


/**
 * @swagger
 * /auth/google/callback:
 *   get:
 *     summary: Callback de Google, procesa autenticación
 *     tags: [Auth]
 *     responses:
 *       302:
 *         description: Redirección tras login
 */
router.get('/google/callback',
    passport.authenticate('google', {
        failureRedirect: '/login',
        session: true
    }),
    async (req, res) => {
        // Generar JWT
        const token = jwt.sign({ id: req.user._id, email: req.user.email, role: req.user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
        const state = req.query.state;
        if (state) {
            // Redirigir a la URL indicada con el token y state
            const url = new URL(state);
            url.searchParams.set('token', token);
            if (state) url.searchParams.set('state', state);
            res.redirect(url.toString());
        } else {
            // Devolver el token en JSON
            res.json({ token });
        }
    }
);

// Endpoint para obtener el token si el usuario está autenticado
router.get('/token', (req, res) => {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
    const jwt = require('jsonwebtoken');
    const token = jwt.sign({ id: req.user._id, email: req.user.email, role: req.user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
    res.json({ token });
});

/**
 * @swagger
 * /auth/logout:
 *   get:
 *     summary: Cierra la sesión del usuario
 *     tags: [Auth]
 *     responses:
 *       302:
 *         description: Redirección tras logout
 */
router.get('/logout', (req, res) => {
    req.logout(() => {
        const callbackUrl = req.query.callback;
        if (callbackUrl) {
            res.redirect(callbackUrl);
        } else {
            res.json({ success: true });
        }
    });
});


export default router;

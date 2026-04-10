import dotenv from 'dotenv';
import passport from 'passport';
import User from './models/User.js';

dotenv.config();

if (process.env.GOOGLE_AUTH_ENABLED !== 'false') {
    const clientID = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const callbackURL = process.env.GOOGLE_CALLBACK_URL;
    if (clientID && clientSecret && callbackURL) {
        const { Strategy: GoogleStrategy } = await import('passport-google-oauth20');
        passport.use(new GoogleStrategy({
            clientID,
            clientSecret,
            callbackURL
        }, async (accessToken, refreshToken, profile, done) => {
            try {
                let user = await User.findOne({ googleId: profile.id });
                if (!user) {
                    user = await User.create({
                        googleId: profile.id,
                        name: profile.displayName,
                        email: profile.emails[0].value,
                        role: 'user'
                    });
                }
                return done(null, user);
            } catch (err) {
                return done(err, null);
            }
        }));
    } else {
        console.warn('Google OAuth environment variables are missing or empty. GoogleStrategy not initialized.');
    }
}

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

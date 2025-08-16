import { Strategy as GoogleStrategy } from 'passport-google-oauth2';
import passport from 'passport';
import User from '../models/user.model.js'; 
import bcrypt from 'bcryptjs';

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_SECRET_ID, 
      callbackURL: 'http://localhost:5000/api/v1/auth/google/callback',
      passReqToCallback: true,
    },
    async function (request, accessToken, refreshToken, profile, done) {
      try {
        // Find existing user by Google email
        let user = await User.findOne({ email: profile.emails[0].value });

        if (!user) {
            const randomPassword = Math.random().toString(36).slice(-1);
            const hashedPassword = await bcrypt.hash(randomPassword, 10);
          // Create a new user if not found
          user = await User.create({
            name: profile.displayName,
            username: profile.displayName.toLowerCase().replace(/\s+/g, '_'),
            email: profile.emails[0].value,
            password: hashedPassword,
            profilePicture: profile.photos[0]?.value || '',
          });
        }

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

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

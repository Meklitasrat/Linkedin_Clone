import express from 'express';
import { login, logout, signup , getCurrentUser } from '../controllers/auth.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import "../middleware/passport.js";

const router = express.Router();

router.get(
  '/google',
  passport.authenticate('google', { 
    scope: ['email', 'profile'],
    prompt: 'select_account',
  })
);

router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/login',
  }),
  (req, res) => {
    // Generate JWT token for the authenticated user
    const token = jwt.sign({userId: req.user._id}, process.env.JWT_SECRET, {expiresIn: "3d"});
    
    // Set the JWT cookie
    res.cookie('jwt-linkedin', token, {
      httpOnly: true,
      maxAge: 3 * 24 * 60 * 60 * 1000,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production'
    });
    
    // Redirect to frontend
    res.redirect('http://localhost:5173/');
  }
);

router.post('/signup', signup)
router.post('/login', login)
router.post('/logout', logout)

router.get('/me', protectRoute , getCurrentUser )

export default router

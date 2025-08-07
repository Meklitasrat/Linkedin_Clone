import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

export const protectRoute = async(req, res, next) =>{
    try {
        const token = req.cookies["jwt-linkedin"] // app.use(cookieParser) in our main file must be written to extract the cookie.

        if(!token){
            return res.status(401).json({message: 'No token Provided'});
        }

        const decoded = jwt.verify(token , process.env.JWT_SECRET);
        if(!decoded){
            return res.status(401).json({message: 'Invalid token'})
        }

        const user = await User.findById(decoded.userId).select('-password') // so that we won't select the password all together

        if(!user){
            return res.status(404).json({message: 'User not found'})
        }
        req.user = user;

        next()
    } catch (error) {
        console.log("Error in ProtectRoute middleware:", error.message);
        return res.status(500).json({message: "Error while authenticating"})
    }
}
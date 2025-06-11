import { loginSchema, signupSchema } from "../dtos/auth.dto.js";
import User from "../models/user.model.js";
import  jwt  from 'jsonwebtoken'
import bcrypt from "bcryptjs";
import { sendWelcomeEmail } from "../emails/emailHandlers.js";

export const signup = async(req, res,) => {
  try {
    const body = req.body;
    const {name , username, email , password} = signupSchema.parse(body);

    const existingEmail = await User.findOne({email})
    if(existingEmail){
        return res.status(400).json({message: "Email Already exists"})
    }

    const existingUsername =  await User.findOne({username})
    if(existingUsername){
        return res.status(400).json({message: "User name already exists"})
    }

    const salt= await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password , salt)

    const user = new User({
      name , username , email , password: hashedPassword
    })

    await user.save();

    const token = jwt.sign({userId: user._id}, process.env.JWT_SECRET,  {expiresIn: "3d"});

    res.cookie('jwt-linkedin' , token, {
      httpOnly: true, // no accessing this token using js only http so prevents it form cross site attacks xxs
      maxAge: 3 * 24 * 60  * 60 * 1000,
      sameSite: "strict", //prevents cross site resource forgery attack
      secure: process.env.NODE_ENV === "production" ,// becomes true only in production (not in localhost http) Also prevents man-in-the-middle-attack
    });

    // Let us have a separate try catch for our email sending so that the not being able to send the email won't interfere with the registering the user;

    const profileUrl = process.env.CLIENT_URL +"/profile/" + user.username
    try{
      await sendWelcomeEmail(user.email , user.name , profileUrl)

    }catch(errorEmail){
      console.log("Error while sending email", errorEmail)
    }
    
    res.status(201).json({message: "User Registered successfully"})

  } catch (error) {
    console.log("Error on signup", error.message)

    res.status(500).json({message: "Internal Server Error"})
  }
}

export const login = async(req, res) =>{
  try {
    const body = req.body;
    const {username , password} = loginSchema.parse(body);
 
    const user = await User.findOne({username})
    
    if(!user){
      return res.status(404).json({message: "You need to Signup First"})
    }

    const isMatch = await bcrypt.compare(password , user.password)

    if(!isMatch){
      return res.status(400).json({message: "Invalid credentials."})
    }

    const token = jwt.sign({userid: user._id}, process.env.JWT_SECRET, {expiresIn: "3d"});
    await res.cookie('jwt-linkedin', token, {
      httpOnly: true,
      maxAge: 3 * 24 * 60 *60* 100,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production'
    })

    res.json({message: "Logged in successfully"})
    
  } catch (error) {
    console.log("Error while logging in :" , error)
    res.status(500).json({message: error.message})
  }
    
}
export const logout = (req, res) =>{
   res.clearCookie('jwt-linkedin');
   res.json({message: 'Logged out Successfully'})
}

export const getCurrentUser = async(req , res) =>{
  try {
    res.json(req.user)
  } catch (error) {
    console.log("Error while getting current user :" ,error)
    return res.status(500).json({message: error.message})
  }
}
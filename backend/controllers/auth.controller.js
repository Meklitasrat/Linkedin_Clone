import { z } from "zod";
import { signupSchema } from "../dtos/auth.dto.js";
import User from "../models/user.model.js";

export const signup = async(req, res,) => {
  try {
    const body = req.body;
    const {name , username, email , password} = signupSchema.parse(body);

    const existingEmail = await User.findOne({email})
    if(existingEmail){
        return res.status(400).json({message: "Email Already exists"})
    }

    const existingUsername  = User.findOne({username})
    if(existingUsername){
        return res.status(400).json({message: "User name already exists"})
    }

  } catch (error) {

    
  }
}

export const login = (req, res) =>{
    res.send('hey');
}
export const logout = (req, res) =>{
    res.send('hey');
}
z
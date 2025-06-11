import cloudinary from "../lib/cloudinary.js"
import User from "../models/user.model.js"

export const getRecommendedUser = async(req, res) =>{
    try {
        const currentUser = await User.findById(req.user._id).select('connections')

        const suggestedUsers = await User.find({
            _id: {
                // filter the id that are not equal to our id and not in our connections
                $ne: req.user._id , $nin: currentUser.connections
            }
        })
        .select("name username profilePicture headline")
        .limit(3)

        res.status(200).json(suggestedUsers)
    } catch (error) {
        console.log('Error while getting suggested User')
        return res.status(500).json({message: error.message})
    }
}

export const getPublicProfile = async(req , res) =>{
    try {
        const user = await User.findOne({username: req.params.username}).select('-password')
        if(!user){
            return res.status(404).json({message: 'User not found'})
        }
        res.status(200).json(user)
    } catch (error) {
        console.log('Error while getting User')
        return res.status(500).json({message: error.message})
    }
}

export const updateProfile = async(req, res) =>{
      try{
        const allowedFields= ["name", 'headline', 'about', 'location', 'profilePicture', 'bannerImg', 'skills', 'experience', 'education'];
        const updateData = {}

        for( const field of allowedFields){
            if(req.body[field]){
                updateData[field] = req.body[field]
            }
        }

        // If user tries to update their profile Picture;
        if(req.body.profilePicture){
           const result = await   cloudinary.uploader.upload(req.body.profilePicture);
           // So we will set the url that we will be getting from cloudinary;
           updateData.profilePicture = result.secure_url;
        }
        // If user wants to update banner Image

        if(req.body.bannerImg){
            const result = await cloudinary.uploader.upload(req.body.bannerImg);
            updateData.bannerImg = result.secure_url;
        }
        
        const user = await User.findByIdAndUpdate(req.user._id, {$set: updateData}, {new: true}).select('-password')

        res.json(user)
      } catch (error)
      {

      }
      
}
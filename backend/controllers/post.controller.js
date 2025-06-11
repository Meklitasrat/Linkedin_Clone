import { sendCommentNotification } from "../emails/emailHandlers.js";
import cloudinary from "../lib/cloudinary.js";
import Notification from "../models/notification.model.js";
import Post from "../models/post.model.js"

export const getFeedPost = async(req , res) => {
    try {
        const posts = Post.find({author: {$in: req.user.connections}})
        .populate('author', 'name username profilePicture headline')
        .populate('comments.user', 'name profilePicture')
        .sort({createdAt: -1});
        
        res.status(200).json(posts);
    } catch (error) {
        console.log('Error while getting feed posts controller', error);
        res.status(500).json({message: error.message})
    }
}

export const createPost = async(req, res) =>{
    try {
        const {content , image} = req.body

        let newPost;

        if(image){
            const result = await cloudinary.uploader.upload(image)
            newPost = new Post({
                author: req.user._id,
                content,
                image: result.secure_url
            })
        }else{
            newPost = new Post({
                author: req.user._id,
                content,
            })
        }
        await newPost.save();

        res.status(201).json(newPost)
        
    } catch (error) {
        console.log('Error while creating a post', error);
        res.status(500).json(error.message)
        
    }
}

export const deletePost = async(req, res) =>{
    try {
        const postId = req.params.id;
        const userId = req.user._id

        const deletedPost = await Post.findById(postId);

        if(!deletedPost){
            return res.status(401).json({message: 'Post not found'})
        }
        
        if(Post.author.toString() !== userId.toString()){
            return res.status(403).json({message: 'You are not authorized to delete this post'})
        }

        //if the post has an image (url stored in db also in cloudinary)

        if(Post.image){
        // https://res.cloudinary.com/dhqy3axid/image/upload/v1749586170/cld-sample-5.jpg
        // to delete an image from cloudinary we can extract the id from it and delete using that;

        await cloudinary.uploader.destroy(Post.image.split('/').pop().split('.')[0])
        }

        await Post.findByIdAndDelete(postId);
        res.status(200).json({message: 'Post deleted successfully'})

    } catch (error) {
        console.log('Error while deleting post', error)
        res.status(500).json({message: error.message})
        
    }
}

export const getPostById = async(req, res) =>{
    try {
        const postId = req.params.id
        const post  = await Post.findById(postId)
        .populate('author', 'name , username , headline, profilePicture')
        .populate('comment')

        if(!post){
            return res.status(401).json({message: 'Post not found'})
        }
        res.status(200).json(post)

    } catch (error) {
        console.log('Error getting post', error)

        res.status(500).json({message: error.message})
    }
}

export const createComment = async(req, res) =>{
    try{
        const postId = req.params.id

        const {content} = req.body

        const post = await Post.findOneAndUpdate(postId , 
            {
            $push: {comments: {user: req.user._id}, content},
            },
            {new: true}
        ).populate('author', 'name username headline, profilePicture')

        // Send notification if I didn't not comment on my own post

        if(post.author.toString() !== user.req._id.toString()){
            const newNotification = new Notification({
                recipient: post.author,
                type: 'comment',
                relatedUser:req.user._id,
                relatedPost: postId
            })

            await newNotification.save()
            // we'll send an email but should be in its own try catch since we don't want the whole thing failing just cause we couldn't send an email.

            try {
                const postUrl = process.env.CLIENT_URL + '/post' + postId
                await sendCommentNotification(post.author.email ,post.author.name, req.user.name, postUrl, content )
            } catch (error) {
                console.log('Error while sending notification email')
            }
        }

        res.status(200).json(post)
    } catch (error){
        console.log('Error commenting', error)
        res.status(500).json({message: error.message})
    }
}

export const likePost = async(req, res) =>{
    try {
        const postId = req.params.id
        const post = await Post.findById(postId)
        const userId = req.user._id

        if(post.like.includes(userId)){
            // If user already in like means it wants to unlike a post
            post.like = post.like.filter(id => id.toString() !== userId.toString())
        }else{
            // like the post 
            post.like.push(userId.toString())
            // we can create a notification if user if not liking its own post
            if(post.author.toString() !== userId.toString()){
                const newNotification = new Notification({
                    recipient: post.author,
                    type: 'like',
                    relatedUser:req.user._id,
                    relatedPost: postId
                })

                await newNotification.save();
            }
            
            await post.save()
        }
    } catch (error) {
        console.log('Error liking a post')
        res.status(201).json({message: error.message})
    }
}
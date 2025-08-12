import { sendCommentNotification } from "../emails/emailHandlers.js";
import cloudinary from "../lib/cloudinary.js";
import Notification from "../models/notification.model.js";
import Post from "../models/post.model.js"

export const getFeedPost = async(req , res) => {
    try {
        const posts = await Post.find({author: {$in:[...req.user.connections , req.user._id] }})
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
        
        if(deletedPost.author.toString() !== userId.toString()){
            return res.status(403).json({message: 'You are not authorized to delete this post'})
        }

        //if the post has an image (url stored in db also in cloudinary)

        if(deletedPost.image){
        // https://res.cloudinary.com/dhqy3axid/image/upload/v1749586170/cld-sample-5.jpg
        // to delete an image from cloudinary we can extract the id from it and delete using that;

        await cloudinary.uploader.destroy(deletedPost.image.split('/').pop().split('.')[0])
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
export const createComment = async (req, res) => {
    try {
        const postId = req.params.id;
        const { content } = req.body;

        if (!content || !content.trim()) {
            return res.status(400).json({ message: "Comment content is required" });
        }

        const post = await Post.findByIdAndUpdate(
            postId,
            {
                $push: {
                    comments: {
                        user: req.user._id,
                        content
                    }
                }
            },
            { new: true }
        )
        .populate('author', 'name username headline profilePicture')
        .populate('comments.user', 'name profilePicture');

        // Send notification only if the commenter isn't the post's author
        if (post.author._id.toString() !== req.user._id.toString()) {
            const newNotification = new Notification({
                recipient: post.author._id,
                type: 'comment',
                relatedUser: req.user._id,
                relatedPost: postId
            });

            await newNotification.save();

            try {
                const postUrl = `${process.env.CLIENT_URL}/post/${postId}`;
                await sendCommentNotification(
                    post.author.email,
                    post.author.name,
                    req.user.name,
                    postUrl,
                    content
                );
            } catch (error) {
                console.log('Error while sending notification email', error);
            }
        }

        res.status(200).json(post);
    } catch (error) {
        console.log('Error commenting', error);
        res.status(500).json({ message: error.message });
    }
};


export const likePost = async(req, res) =>{
    try {
        const postId = req.params.id
        const post = await Post.findById(postId)
        const userId = req.user._id

        if(post.likes.includes(userId)){
            // If user already in like means it wants to unlike a post
            post.likes = post.likes.filter((id) => id.toString() !== userId.toString());
        }else{
            // like the post 
            post.likes.push(userId)
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
            
        };

         await post.save();
            
         res.status(200).json(post);
    } catch (error) {
        console.log('Error liking a post')
        res.status(201).json({message: error.message})
    }
}
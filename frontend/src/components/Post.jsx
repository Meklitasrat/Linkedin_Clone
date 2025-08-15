import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import axiosInstance from "../lib/axios";
import toast from "react-hot-toast";
import { Loader, MessageCircle, Send, Share2, ThumbsUp, Trash2 } from "lucide-react";
import PostAction from "./PostAction";
import { useForm } from "react-hook-form";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {formatDistanceToNow} from 'date-fns';
import { Link } from "react-router-dom";

const schema = z.object({
    comment: z.string().min(1, "You can not comment nothing"),
})
const Post = ({post}) => {

    const queryClient = useQueryClient();

    const {data: authUser} = useQuery({queryKey:['authUser']})
    const [showComments , setShowComments] = useState(false);
    const [comments , setComments] = useState(post.comments || []);
    const isOwner = authUser._id === post.author._id;
    const isLiked = post?.likes?.includes(authUser._id);

    const {register , handleSubmit , formState:{errors} , reset} = useForm({
        resolver: zodResolver(schema),
        defaultValues: {comment: ""}
    })

    const {mutate: deletePost , isPending: isDeletingPost } = useMutation({
        mutationFn: async() =>{
             await axiosInstance.delete(`/posts/delete/${post._id}`)
        },
        onSuccess : () =>{
            queryClient.invalidateQueries({queryKey:['posts']});
            toast.success('Post deleted successfully');
        },
        onError: (error) =>{
            toast.error(error.message)
        }
    });

    const {mutate: createComment, isPending: isCommenting } = useMutation({
        mutationFn: async(newComment) =>{
            await axiosInstance.post(`/posts/${post._id}/comment`, {content: newComment});
            
        },
        onSuccess : () =>{
            queryClient.invalidateQueries({queryKey:["posts"]});
            toast.success('Comment added successfully');
        },
        onError: (error) =>{
            toast.error(error.response.data.message || "Failed to add a comment")
        }
    })

    const {mutate: likePost, isPending: isLiking } = useMutation({
        mutationFn: async() =>{
            const res = await axiosInstance.post(`/posts/${post._id}/like`);
            return res.data;
        },
        onSuccess : () =>{
            queryClient.invalidateQueries({queryKey:['posts']});
             queryClient.invalidateQueries({queryKey:['post', post._id]});
        },
        onError: (error) =>{
            toast.error(error.response.data.message || "Failed to add a comment")
        }
    });

    const onCreateComment= ({comment}) =>{
        if(isCommenting){
            return;
        };

        if(comment){
            createComment(comment)
            reset();
            setComments([
                ...comments,
                {
                    content: comment,
                    user:{
                        _id: authUser._id,
                        name: authUser.name,
                        profilePicture: authUser.profilePicture
                    },
                    createdAt: new Date()
                }
            ])
        }
    }
 
    const onPostDelete = () =>{
        if(!window.confirm('Are you sure you want to delete this post?')){
            return
        }
        deletePost();
    }

    const handleLikePost = () =>{
        if(isLiking){
            return
        }
        likePost()
    }

  return (
		<div className='bg-gray-50 rounded-lg shadow mb-4'>
			<div className='p-4'>
				<div className='flex items-center justify-between mb-4'>
					<div className='flex items-center'>
						<Link to={`/profile/${post?.author?.username}`}>
							<img
								src={post.author.profilePicture || "/avatar.png"}
								alt={post.author.name}
								className='size-10 rounded-full mr-3'
							/>
						</Link>

						<div>
							<Link to={`/profile/${post?.author?.username}`}>
								<h3 className='font-semibold'>{post.author.name}</h3>
							</Link>
							<p className='text-xs text-gray-500'>{post.author.headline}</p>
                            <p className="text-xs text-gray-500"> {formatDistanceToNow(new Date(post.createdAt) , {addSuffix: true})} </p>
						</div>
			</div>

        {isOwner && (
            <button onClick={onPostDelete} className="text-red-500 hover:text-red-700" disabled={isDeletingPost}>
                {isDeletingPost ? <Loader size={18} className="animate-spin"/> : <Trash2 size={18}/>}
            </button>
        )}
      </div>
      <p className="mb-4"> {post.content}</p>
      {post.image && (<img src={post.image} alt='Post comment' className="rounded-lg w-full mb-4"/>)}

      <div className="flex justify-between text-gray-500">
        <PostAction
            icon={<ThumbsUp size={18} className={isLiked ? "text-blue-500 fill-blue-300" : ""}/>}
            text={`Like (${post?.likes?.length})`}
            onClick={handleLikePost}
        />

        <PostAction
            icon={<MessageCircle size={18} />}
            text={`Comment (${comments?.length})`}
            onClick={() => setShowComments(!showComments)}
        />
        <PostAction icon={<Share2 size={18}/>} text="Share" />
      </div>
      </div>
      {showComments && (
        <div className="px-4 pb-4">
            <div className="mb-4 max-h-60 overflow-auto">
                {comments.map((comment)=>(
                    <div key={comment._id} className="mb-2 bg-gray-200 p-2 rounded flex items-start"> 
                        <img
                            src={comment.user.profilePicture || "/avatar.png"}
                            alt={comment.user.name}
                            className="w-8 h-8 rounded-full mr-2 flex shrink-0"
                        />
                        <div className="flex-grow"> 
                            <div className="flex-items-center mb-1"> 
                                <span className="font-semibold mr-2">{comment.user.name}</span>
                                {formatDistanceToNow(new Date(comment.createdAt) , {addSuffix: true})}
                            </div>
                            <p>{comment.content}</p>
                        </div>
                    </div>
                ))}

                <form onSubmit={handleSubmit(onCreateComment)} className="flex items-center">
                    <input
                        {...register("comment")}
                        type="text"
                        className='flex-grow p-2 rounded-l-full bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-700'
                        placeholder="Add a comment ..."
                    />
                    <button
                        type="submit"
                        className='bg-blue-700 text-white p-2 rounded-r-full hover:bg-blue-800 transition duration-300'
						disabled={isCommenting}
                    >
                        {isCommenting ? <Loader size={18}/> : <Send size={18}/>}
                    </button>
                    {errors.comment && <p className="text-red-500 text-sm">{errors.comment.message}</p>}

                </form>
            </div> 

        </div>
      )}
    </div>
  )
}

export default Post

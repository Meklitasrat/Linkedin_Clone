import { useMutation, useQueryClient } from "@tanstack/react-query";
import z from "zod"
import axiosInstance from "../lib/axios";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Image, Loader } from "lucide-react";

const schema = z.object({
    content: z.string().trim().min(1, {message: 'Content is required'}),
    image: z.string().nullable()
});

const PostCreation = ({user}) => {

    const queryClient = useQueryClient();

    const { handleSubmit ,register, formState: {errors} , watch, reset , setValue,} = useForm({
        resolver: zodResolver(schema),
        defaultValues: {
            image: null,
            content: ""
        }
    });

    const imagePreview = watch("image");

    const readFileDataURL = (file) =>{
        return new Promise((resolve, reject) =>{
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result)
            reader.onerror = () => reject;
            reader.readAsDataURL(file)
        })
    };

    const {mutate: post , isPending: isPosting} = useMutation({
        mutationFn: async(data) =>{
            const res = await axiosInstance.post('/posts/create', data , {
                headers: {"Content-Type": "application/json"}
            });
            return res.data;
        },
        onSuccess: ()=>{
            reset()
            queryClient.invalidateQueries({queryKey:['posts']}),
            toast.success('Post created successfully')
        },
        onError: (error) =>{
            toast(error.response.data.message || "Failed to create post")
        }
    });

    const onPost = (data) =>{
        post(data)
    };

    const handleImageChange = async(e) =>{
        const file = e.target.files[0];
        if(file) {
            const base64 = await readFileDataURL(file);
            setValue("image", base64)
        }
    }

    const onReset = () =>{
        reset();
    }


  return (
    <div className="bg-blue-100 rounded-lg shadow mb-4 p-4">
      <div className="flex space-x-3">
        <img src={user?.profilePicture || "/avatar.png"} alt={user?.name} className="size-12 rounded-full"/>
        <textarea
            errors= {errors.content}
            placeholder="What's on your mind?"
            className='w-full p-3 rounded-lg bg-base-100 hover:bg-cyan-50 focus:bg-base-200 focus:outline-none resize-none transition-colors duration-200 min-h-[100px]'
            {...register('content')}
		/>
        {errors.content && <p className="text-red-500 text-sm">{errors.content.message}</p>}

      </div>

        {imagePreview && (
        <div className="mt-4">
            <img src={imagePreview} alt="Selected" className="w-full h-auto rounded-lg" />
        </div>
        )}
        
        <div className="flex justify-between items-center mt-4">
            <div className="flex space-x-4">
                <label className='flex items-center text-info hover:text-info-dark transition-colors duration-200 cursor-pointer'>
                    <Image size={20} className='mr-2' />
                    <span>Photo</span>
                    <input 
                        type='file' 
                        accept='image/*' 
                        className='hidden' 
                        onChange={handleImageChange}/>
				</label>
            </div>

            <div className="flex justify-around gap-4">
                <button
                    className='bg-blue-500 text-white rounded-lg px-4 py-2 hover:bg-blue-900 transition-colors duration-200 cursor-pointer'
                    onClick={handleSubmit(onPost)}
                    disabled={isPosting}
                >
                    {isPosting ? <Loader className='size-5 animate-spin' /> : "Share"}
                </button>

                <button
                    className='bg-blue-200 text-black rounded-lg px-2 transition-colors duration-200 cursor-pointer border-none'
                    onClick={onReset}
                >
                    Reset
                </button>
            </div>
            
        </div>
    </div>
  )
}

export default PostCreation

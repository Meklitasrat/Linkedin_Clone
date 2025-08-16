import { useMutation, useQueryClient } from "@tanstack/react-query";
import z from "zod"
import axiosInstance from "../../lib/axios";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { Loader } from "lucide-react";
import GoogleSignInButton from "./GoogleSignInButton";

const LoginForm = () => {
    const schema = z.object({
        username: z.string().min(1, {message: 'Username is requires'}),
        password: z.string().min(8, {message: "Password is at least 8 character"})
    });

    const queryClient = useQueryClient();

    const {mutate: login, isPending: isLogging} = useMutation({
        mutationFn: async(data) =>{
            const res = await axiosInstance.post('/auth/login',data );
            return res.data
        },
        onSuccess: () =>{
            queryClient.invalidateQueries({queryKey: ['authUser']}),
            toast.success('User signed in successfully')
        },
        onError: (error)=>{
            toast.error(error.response.data.message || "Something went wrong")
        }
    });

    const {register , handleSubmit , formState: {errors}  } = useForm({
        resolver: zodResolver(schema),
        defaultValues: {username: '', password: ''}
    });

    const onLogin = (data) =>{
        login(data)
    }

   const handleGoogleLogin = () => {
    window.location.href = "http://localhost:5000/api/v1/auth/google?prompt=select_account";
  };

  return (
<div className="space-y-4 w-full max-w-md">
    <form onSubmit={handleSubmit(onLogin)} className='space-y-4 w-full max-w-md'>
			<input
				type='text'
				placeholder='Username'
				{...register('username')}
                errors={errors.username}
				className="w-full p-2 border rounded"
				required
			/>
            {errors.username && <p className="text-red-500 text-sm">{errors.username.message}</p>}

			<input
				type='password'
				placeholder='Password'
				{...register('password')}
				className="w-full p-2 border rounded"
                errors={errors.password}
				required
			/>
            {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}

			<button type='submit' disabled={isLogging} className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center">
				{isLogging ?
                 (<>
                    <Loader className="animate-spin mr-2" size={16} />
                    Logging in...
                </> )
                : ( "Login")}
			</button>
        
		</form>
    <div className="relative">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-gray-300" />
      </div>
      <div className="relative flex justify-center text-sm">
        <span className="px-2 bg-white text-gray-500">Or continue with</span>
      </div>
    </div>
    
    <GoogleSignInButton onClick={handleGoogleLogin} />
      </div>
  )
}

export default LoginForm

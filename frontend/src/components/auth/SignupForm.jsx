import {useForm} from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from "zod";
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../../lib/axios'; // No brace needed for a default export
import { toast } from 'react-hot-toast';
import { Loader } from 'lucide-react';
import GoogleSignInButton from './GoogleSignInButton';

const SignupForm = () => {
    const schema = z.object({
      name: z.string().min(1, {message: "Name is required"}),
      email: z.string().email({message: "Invalid email address"}),
      username: z.string().min(1, {message: "Username is required"}),
      password: z.string().min(8, {message: "Password must be at least 8 characters long"}),
    });

    const queryClient = useQueryClient();

    const {mutate: signup, isPending: isSigningUp} = useMutation({
      mutationFn: async(data) => {
        const res = await axiosInstance.post('/auth/signup', data);
        return res.data;
      },
      onSuccess: () => {
        toast.success('Account created successfully');
        queryClient.invalidateQueries({queryKey: ['authUser']});
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to create account');
      }
    });

    const {register, handleSubmit, formState: {errors}, reset} = useForm({
      resolver: zodResolver(schema),
      defaultValues: {
        name: "",
        email: "",
        username: "",
        password: "",
      },
    });

    const onSubmit = (data) => {
      signup(data);
    }
    
    const onReset = () =>{
      reset()
    }

    const handleGoogleSignup = () => {
      window.location.href = "http://localhost:5000/api/v1/auth/google?prompt=select_account";
    };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <input 
            type="text" 
            {...register("name")} 
            errors= {errors.name}
            placeholder="Name" 
            className="w-full p-2 border rounded"
          />
          {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
        </div>
        
        <div>
          <input 
            type="email" 
            errors= {errors.email}
            {...register("email")} 
            placeholder="Email" 
            className="w-full p-2 border rounded"
          />
          {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
        </div>
        
        <div>
          <input 
            type="text" 
            {...register("username")} 
            errors={errors.username}
            placeholder="Username" 
            className="w-full p-2 border rounded"
          />
          {errors.username && <p className="text-red-500 text-sm">{errors.username.message}</p>}
        </div>
        
        <div>
          <input 
            type="password" 
            {...register("password")} 
            errors ={errors.password}
            placeholder="Password" 
            className="w-full p-2 border rounded"
          />
          {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
        </div>
        
        <button 
          type="submit" 
          disabled={isSigningUp}
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isSigningUp ? (
            <>
              <Loader className="animate-spin mr-2" size={16} />
              Signing up...
            </>
          ) : (
            'Signup'
          )}
        </button>

        <button 
          onClick={onReset} 
          disabled={isSigningUp}
          className="w-full text-black p-2 rounded hover:bg-gray-400 disabled:opacity-50 border flex items-center justify-center"
        >
          Reset
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
      
      <GoogleSignInButton onClick={handleGoogleSignup} children="Sign up with Google" />
    </div>
  )
}

export default SignupForm

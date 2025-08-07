import { useMutation, useQueryClient } from "@tanstack/react-query";
import z from "zod"
import axiosInstance from "../../lib/axios";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { Loader } from "lucide-react";

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

  return (
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
  )
}

export default LoginForm

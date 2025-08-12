import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import axiosInstance from "../lib/axios"
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { Check, Clock, UserCheck, UserPlus, X } from "lucide-react";

const RecommendedUser = ({user}) => {
  const queryClient = useQueryClient();

  const {data: connectionStatus , isPending: isLoadingStatus} = useQuery({
    queryKey: ['connectionStatus', user._id],
    queryFn: async() => await axiosInstance.get(`/connections/status/${user._id}`)
  });

  const {mutate: sendConnectionRequest, isPending: isSendingRequest} = useMutation({
    mutationFn: async(userId) => await axiosInstance.post(`/connections/request/${userId}`),
    onSuccess: () =>{
      queryClient.invalidateQueries({queryKey: ['connectionStatus', user._id]});
      toast.success('Request send successfully')
    },
    onError: (err) =>{
      toast.error(err.response?.data?.error || "Failed to send request")
    }
  });

  const {mutate: acceptRequest , isPending: isAccepting} = useMutation({
    mutationFn: async(requestId) => await axiosInstance.put(`/connections/accept/${requestId}`),
    onSuccess: () =>{
      queryClient.invalidateQueries({queryKey: ['connectionStatus', user._id]});
      toast.success('Request accepted successfully')
    },
    onError: (err) =>{
      toast.error(err.response?.data?.error || "Failed to accept request")
    }
  })
    const {mutate: rejectRequest , isPending: isRejecting} = useMutation({
    mutationFn: async(requestId) => await axiosInstance.put(`/connections/reject/${requestId}`),
    onSuccess: () =>{
      queryClient.invalidateQueries({queryKey: ['connectionStatus', user._id]});
      toast.success('Request rejected successfully')
    },
    onError: (err) =>{
      toast.error(err.response?.data?.error || "Failed to reject request")
    }
  });

  const handleConnect = () =>{
     if(connectionStatus?.data?.status === "not connected"){
      sendConnectionRequest(user._id)
     }
  }


  const renderButton = () => {
    if (isLoadingStatus) {
			return (
				<button className='px-3 py-1 rounded-full text-sm bg-gray-200 text-gray-500' disabled>
					Loading...
				</button>
			);
		}
    switch(connectionStatus?.data?.status){
      case "pending":
        return (
          <button
            className="px-3 py-1 rounded-full text-sm bg-yellow-500 text-white flex items-center"
            disabled
          >
            <Clock size={16} className="mr-1"/>
              pending
          </button>
        );
      case 'received': 
        return (
          <div className='flex gap-2 justify-center'>
						<button
							onClick={() => acceptRequest(connectionStatus.data.requestId)}
							className={`rounded-full p-1 flex items-center justify-center bg-green-500 hover:bg-green-600 text-white`}
						>
							<Check size={16} />
						</button>
						<button
							onClick={() => rejectRequest(connectionStatus.data.requestId)}
							className={`rounded-full p-1 flex items-center justify-center bg-red-500 hover:bg-red-600 text-white`}
						>
							<X size={16} />
						</button>
					</div>
        );
      case 'connected': 
        return (
          <button
						className='px-3 py-1 rounded-full text-sm bg-green-500 text-white flex items-center'
						disabled
					>
						<UserCheck size={16} className='mr-1' />
						Connected
					</button>
        );
      default: 
        return (
          <button
						className='px-3 py-1 rounded-full text-sm border border-blue-500 text-primary hover:bg-blue-700 hover:text-white transition-colors duration-200 flex items-center'
						onClick={handleConnect}
					>
						<UserPlus size={16} className='mr-1' />
						Connect
					</button>
      )
    }
  };


  return (
    <div className="flex items-center justify-between mb-4">
      <Link to={`/profile/${user.username}`} className='flex items-center flex-grow'>
				<img
					src={user.profilePicture || "/avatar.png"}
					alt={user.name}
					className='w-12 h-12 rounded-full mr-3'
				/>
				<div>
					<h3 className='font-semibold text-sm'>{user.name}</h3>
					<p className='text-xs text-gray-500'>{user.headline}</p>
				</div>
			</Link>
      {renderButton()}
    </div>
  )
}

export default RecommendedUser

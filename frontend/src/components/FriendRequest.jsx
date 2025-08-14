import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../lib/axios";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

const FriendRequest = ({connectionRequest}) => {

    const queryClient = useQueryClient();

    const {mutate: acceptRequest , } = useMutation({

      mutationFn: async(requestId) => await axiosInstance.put(`/connections/accept/${requestId}`),
      onSuccess: () =>{
        queryClient.invalidateQueries({queryKey: ['connectionStatus', user._id]});
        toast.success('Request accepted successfully')
      },
      onError: (err) =>{
        toast.error(err.response?.data?.error || "Failed to accept request")
      }
  })

    const {mutate: rejectRequest ,} = useMutation({
    mutationFn: async(requestId) => await axiosInstance.put(`/connections/reject/${requestId}`),
    onSuccess: () =>{
      queryClient.invalidateQueries({queryKey: ['connectionStatus', user._id]});
      toast.success('Request rejected successfully')
    },
    onError: (err) =>{
      toast.error(err.response?.data?.error || "Failed to reject request")
    }
  });

  return (
    <div className='bg-white rounded-lg shadow p-4 flex items-center justify-between transition-all hover:shadow-md'>
      <div className="flex items-center gap-4">

        <Link to={`/profile/${connectionRequest.sender.username}`}> 
            <img
                src={connectionRequest.sender.profilePicture || "/avatar.png"}
                alt={connectionRequest.sender.name}
                className="w-16 h-16 rounded-full object-cover"
            />
        </Link>

        <div>
            <Link to={`/profile/${connectionRequest.sender.username}`} className='font-semibold text-lg'>
                {connectionRequest.sender.name}
            </Link>
            <p className='text-gray-600'>{connectionRequest.sender.headline}</p>
		</div>
      </div>
        <div className='space-x-2'>
            <button
                className='bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors'
                onClick={() => acceptRequest(connectionRequest._id)}
            >
                Accept
            </button>
            <button
                className='bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors'
                onClick={() => rejectRequest(connectionRequest._id)}
            >
                Reject
            </button>
		</div>
    </div>
  )
}

export default FriendRequest

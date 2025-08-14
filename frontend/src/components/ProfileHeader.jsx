import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {  useState } from "react"
import axiosInstance from "../lib/axios";
import toast from "react-hot-toast";
import { Camera, Clock, MapPin, UserCheck, UserPlus, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ProfileHeader = ({userData , isOwnProfile , onSave}) => {

    const [isEditing , setIsEditing] = useState(false);
    const [editedData , setEditedData] = useState({});
    
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const{data: authUser} = useQuery({
    queryKey:['authUser']
  });

  const {data: connectionStatus , refetch: refetchConnectionStatus} = useQuery({
    queryKey: ['connectionStatus' , userData._id],
    queryFn: () => axiosInstance.get(`/connections/status/${userData._id}`),
    enabled: !isOwnProfile
  })

  const isConnected = userData.connections.some((connection) => connection === authUser._id)

    const {mutate: sendConnectionRequest } = useMutation({
        mutationFn: async(userId) => await axiosInstance.post(`/connections/request/${userId}`),
        onSuccess: () =>{
            refetchConnectionStatus()
        toast.success('Request send successfully')
        },
        onError: (err) =>{
        toast.error(err.response?.data?.error || "Failed to send request")
        }
  });

    const {mutate: acceptRequest , } = useMutation({

        mutationFn: async(requestId) => await axiosInstance.put(`/connections/accept/${requestId}`),
        onSuccess: () =>{
        queryClient.invalidateQueries({queryKey: ['connectionRequests']});
        toast.success('Request accepted successfully')
        },
        onError: (err) =>{
        toast.error(err.response?.data?.error || "Failed to accept request")
        }
  });

    const {mutate: rejectRequest ,} = useMutation({
        mutationFn: async(requestId) => await axiosInstance.put(`/connections/reject/${requestId}`),
        onSuccess: () =>{
        queryClient.invalidateQueries({queryKey: ['connectionRequests']});
        toast.success('Request rejected successfully')
        },
        onError: (err) =>{
        toast.error(err.response?.data?.error || "Failed to reject request")
        }
  });

  const {mutate: removeConnection} = useMutation({
    mutationFn: (userId) => axiosInstance.delete(`/connections/${userId}`),
    onSuccess: () =>{
        toast.success('Connection removed successfully')
        refetchConnectionStatus();
        navigate('/')
        queryClient.invalidateQueries({queryKey:['connectionRequests']}
        )
    },
    onError: (err) =>{
        toast.error(err.response?.data?.error || "Failed to reject request")
    }
  });

  const getConnectionStatus = () => {
		if (isConnected){ 
            return "connected";
        }
		if (!isConnected) {
            return "not_connected";
        }
		return connectionStatus?.data?.status;
	};


	const renderConnectionButton = () => {
		const baseClass = "text-white py-2 px-4 rounded-full transition duration-300 flex items-center justify-center";
		switch (getConnectionStatus()) {
			case "connected":
				return (
					<div className='flex gap-2 justify-center'>
						<div className={`${baseClass} bg-green-500 hover:bg-green-600`}>
							<UserCheck size={20} className='mr-2' />
							Connected
						</div>
						<button
							className={`${baseClass} bg-red-500 hover:bg-red-600 text-sm`}
							onClick={() => removeConnection(userData._id)}
						>
							<X size={20} className='mr-2' />
							Remove Connection
						</button>
					</div>
				);

			case "pending":
				return (
					<button className={`${baseClass} bg-yellow-500 hover:bg-yellow-600`}>
						<Clock size={20} className='mr-2' />
						Pending
					</button>
				);

			case "received":
				return (
					<div className='flex gap-2 justify-center'>
						<button
							onClick={() => acceptRequest(connectionStatus.data.requestId)}
							className={`${baseClass} bg-green-500 hover:bg-green-600`}
						>
							Accept
						</button>
						<button
							onClick={() => rejectRequest(connectionStatus.data.requestId)}
							className={`${baseClass} bg-red-500 hover:bg-red-600`}
						>
							Reject
						</button>
					</div>
				);
			default: 
				return (
					<button
						onClick={() => sendConnectionRequest(userData._id)}
						className='bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded-full transition duration-300 flex items-center justify-center'
					>
						<UserPlus size={20} className='mr-2' />
						Connect
					</button>
				);
		}
	};

    const handleImageChange = (e) =>{
        const file = e.target.files[0];
        if(file){
           const reader = new FileReader();
           reader.onloadend = () =>{
            setEditedData((prev) => ({...prev , [e.target.name]: reader.result}));
           } ;
           reader.readAsDataURL(file)
        }
    }

    const handleSave = () =>{
        onSave(editedData)
    }
  return (
    <div className=" bg-white shadow rounded-lg mb-6 mx-10"> 
      <div
        className='relative h-38 rounded-t-lg  bg-center '
        style={{
            backgroundImage: `url('${editedData.bannerImg || userData.bannerImg || "/banner.png"}')`,
        }}
      >
        {isEditing && (
            <label className='absolute top-2 right-2 bg-white p-2 rounded-full shadow cursor-pointer'>
                <Camera size={20} />
                <input
                    type='file'
                    className='hidden'
                    name='bannerImg'
                    onChange={handleImageChange}
                    accept='image/*'
                />
            </label>
		)}
      </div>
      <div className="p-4">
        <div className="relative mb-4">
            <img
                className='w-32 -mt-20 h-32 rounded-full mx-auto object-cover'
                src={editedData.profilePicture || userData.profilePicture || "/avatar.png"}
                alt={userData.name}
			/>

            {isEditing && (
                <label className='absolute bottom-0 right-1/2 transform translate-x-16 bg-white p-2 rounded-full shadow cursor-pointer'>
                    <Camera size={20} />
                    <input
                        type='file'
                        className='hidden'
                        name='profilePicture'
                        onChange={handleImageChange}
                        accept='image/*'
                    />
                </label>
			)}
        </div>

        <div className="text-center mb-4">
            {isEditing ? (
                <input
                    type='text'
                    value={editedData.name ?? userData.name}
                    onChange={(e) => setEditedData({ ...editedData, name: e.target.value })}
                    className='text-2xl font-bold mb-2 text-center w-full'
                />
            ) : (
                <h1 className='text-2xl font-bold mb-2'>{userData.name}</h1>
			)}

            {isEditing ? (
                <input
                    type='text'
                    value={editedData.headline ?? userData.headline}
                    onChange={(e) => setEditedData({ ...editedData, headline: e.target.value })}
                    className='text-gray-600 text-center w-full border-2'
                />
            ) : (
                <p className='text-gray-600'>{userData.headline}</p>
            )}

            <div className="flex justify-center items-center mt-2">
                <MapPin size={16} className='text-gray-500 mr-1' />
                    {isEditing ? (
                        <input
                            type='text'
                            value={editedData.location ?? userData.location}
                            onChange={(e) => setEditedData({ ...editedData, location: e.target.value })}
                            className='text-gray-600 text-center border-2 '
                        />
                    ) : (
                        <span className='text-gray-600'>{userData.location}</span>
                )}
            </div>
        </div>
        {isOwnProfile ? (
                isEditing ? (
                    <button
                    onClick={() => {
                        handleSave()
                        setIsEditing(false)
                    }}
                        className='w-full bg-blue-500 text-white py-2 px-4 rounded-full hover:bg-blue-700
                            transition duration-300'
                    >
                        Save Profile
                    </button>
                ) : (
                    <button
                        onClick={() => setIsEditing(true)}
                        className='w-full bg-blue-500 text-white py-2 px-4 rounded-full hover:bg-blue-700
                            transition duration-300'
                    >
                        Edit Profile
                    </button>
                )
            ) : (
                <div className='flex justify-center'>{renderConnectionButton()}</div>
			)}
      </div>
    </div>
  )
}

export default ProfileHeader

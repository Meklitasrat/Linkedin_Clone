import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom"
import axiosInstance from "../lib/axios";
import ProfileHeader from "../components/ProfileHeader";
import AboutSection from "../components/AboutSection";
import ExperienceSection from "../components/ExperienceSection";
import EducationSection from "../components/EducationSection";
import SkillsSection from "../components/SkillsSection";
import toast from "react-hot-toast";

const ProfilePage = () => {
    const {username} = useParams();

    const queryClient = useQueryClient();

    const{data: authUser} = useQuery({
    queryKey:['authUser']
  })

  const {data: userProfile, isLoading: isFetchingProfile} = useQuery({
    queryKey: ['userProfile' , username ],
    queryFn: () => axiosInstance.get(`users/${username}`)
  });

  const {mutate: updateProfile} = useMutation({
    mutationFn: (updatedData) => axiosInstance.put('/users/profile', updatedData),
    onSuccess: () =>{
      toast.success('Profile updated Successfully')
      queryClient.invalidateQueries({queryKey:['authUser']})
    }
  })

  if(isFetchingProfile){
    return null
  }

  const isOwnProfile = authUser.username === userProfile.data.username;
  const userData = isOwnProfile ? authUser : userProfile.data

  const onProfileUpdate = (updatedData) => {
    updateProfile(updatedData)
  };
  
  return (
    <div className="max-w-4xl mx-auto p-4">
      <ProfileHeader userData={userData} isOwnProfile={isOwnProfile} onSave={onProfileUpdate}/>
      <AboutSection userData={userData} isOwnProfile={isOwnProfile} onSave={onProfileUpdate}/>
      <ExperienceSection userData={userData} isOwnProfile={isOwnProfile} onSave={onProfileUpdate}/>
      <EducationSection userData={userData} isOwnProfile={isOwnProfile} onSave={onProfileUpdate}/>
      <SkillsSection userData={userData} isOwnProfile={isOwnProfile} onSave={onProfileUpdate}/>
    </div>
  )
}

export default ProfilePage

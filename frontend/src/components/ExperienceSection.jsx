import { Briefcase, X } from "lucide-react";
import { useState } from "react"
import { formatDate } from "../utils/dateUtils";
import toast from "react-hot-toast";

const ExperienceSection = ({userData , onSave , isOwnProfile}) => {
  const [isEditing , setIsEditing] = useState(false);
  const [newExperience , setNewExperience] = useState({
    title: "",
    company: "",
    startDate: "",
    endDate: "",
    description: "",
    currentlyWorking: false
  });

  const [experiences , setExperiences] = useState(userData.experience || []);

  const handleAddExperience = () =>{
    if(newExperience.company && newExperience.title && newExperience.startDate){
      setExperiences([...experiences , newExperience]);
      setNewExperience({
        title: "",
        company: "",
        startDate: "",
        endDate: "",
        description: "",
        currentlyWorking: false
      })
    }else{
      toast.error("All Fields are required")
    }
  };
  const handleDeleteExperience = (company) => {
		setExperiences(experiences.filter((exp) => exp.company !== company));
	};
  const handleSave = () => {
    onSave({experience :experiences});
    setIsEditing(false)
  };

  const handleCurrentlyWorkingChange = (e) => {
    setNewExperience({
      ...newExperience , 
      currentlyWorking: e.target.checked,
      endDate: e.target.checked ? "": newExperience.endDate
    })
  };


  return (
    <div className="bg-white shadow rounded-lg p-6 mb-6">
      <h2 className="text-2xl font-semibold mb-4"> Experiences</h2>
       {experiences.map((experience) => (
        <div key={experience._id} className=" mb-4 flex justify-between items-start"> 
            <div className="flex items-start"> 
              <Briefcase size={20} className="mr-2 mt-1"/>
              <div>
                <h3 className="font-semibold"> {experience.title}</h3>
                <p className="text-gray-600"> {experience.company}</p>
                <p className="text-gray-600 text-sm">
                  {formatDate(experience.startDate)} - {experience.endDate ? formatDate(experience.endDate) : "Present"}
                </p>
                <p className="text-gray-700"> {experience.description}</p>
              </div>
            </div>
            {isEditing && (
              <button onClick={()=> handleDeleteExperience(experience.company)} className="text-red-500">
                <X size={20}/>
              </button>
            )}
        </div>
       ))}

       {isEditing && (
        <div className="mt-4"> 
          <input
            type="text"
            placeholder="Title"
            value={newExperience.title}
            onChange={(e) => setNewExperience({...newExperience , title: e.target.value})}
            className="w-full p-2 border rounded mb-2"
          />
          <input
            type="text"
            placeholder="Company"
            value={newExperience.company}
            onChange={(e) => setNewExperience({...newExperience , company: e.target.value})}
            className="w-full p-2 border rounded mb-2"
          />
          <input
            type="date"
            placeholder="Start Date"
            value={newExperience.startDate}
            onChange={(e) => setNewExperience({...newExperience , startDate: e.target.value})}
            className="w-full p-2 border rounded mb-2"
          />
          <div className="flex items-center mb-2">
            <input
            type="checkbox"
            onChange={handleCurrentlyWorkingChange}
            className="mr-2"
            checked={newExperience.currentlyWorking}
          />
            <label htmlFor="currentlyWorking"> Currently working here</label>
          </div>
          {!newExperience.currentlyWorking && (
            <input
            type="date"
            placeholder="End Date"
            value={newExperience.endDate}
            onChange={(e) => setNewExperience({...newExperience , endDate: e.target.value})}
            className="w-full p-2 border rounded mb-2"
          />
          )}
          <textarea
            placeholder="Description"
            value={newExperience.description}
            onChange={(e) => {setNewExperience({...newExperience , description: e.target.value})}}
            className="w-full p-2 border rounded mb-2"
          />
          {newExperience.company && newExperience.title && newExperience.startDate && <button
            onClick={handleAddExperience}
            className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-700 transition duration-300"
          >
            Add Experience
          </button>}
        </div>
       )}

       {isOwnProfile && (
				<>
					{isEditing  ? (
              <button
							onClick={handleSave}
							className='mt-4 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-700 transition duration-300'
						>
							Save Changes
						</button>
					) : (
						<button
							onClick={() => setIsEditing(true)}
							className='mt-4 text-blue-500 hover:text-blue-700 transition duration-300'
						>
							Edit Experiences
						</button>
					)}
				</>
			)}
    </div>
  )
}

export default ExperienceSection

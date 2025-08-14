import { useState } from "react"

const AboutSection = ({userData , onSave , isOwnProfile}) => {

  const [isEditing , setIsEditing] = useState(false);
  const [about , setAbout] = useState(userData?.about || "");

  const handleSave = () =>{
    setIsEditing(false);
    onSave({about})
  }
  return (
    <div className="bg-white shadow rounded-lg p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4"> About </h2>
      {isEditing && (
        <>
            <>
              <textarea
                value={about}
                onChange={(e) => setAbout(e.target.value)}
                className="w-full p-2 border rounded"
                rows={4}
                name="about"
              />
              <button
                onClick={handleSave}
                className="mt-2 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-700"
              >
                Save
              </button>
            </>
        </>
      )}

      <div > 
        {! isEditing && <p> {userData.about}</p>}

        {isOwnProfile && (
          <button
          onClick={() => setIsEditing(true)}
          className="mt-2 text-blue-500 hover:text-blue-700  transition duration-300"
        >
          Edit
        </button>
      )}
      </div>

    </div>
  )
}

export default AboutSection

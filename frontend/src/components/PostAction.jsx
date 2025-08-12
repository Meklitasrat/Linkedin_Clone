
const PostAction = ({text , icon , onClick}) => {
  return (
    <button className="flex items-center hover:cursor-pointer" onClick={onClick}>
        <span className="mr-1">{icon}</span>
        <span className="hidden sm:inline">{text}</span>
    </button>
  )
}

export default PostAction

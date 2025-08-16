import Layout from "./components/layout/Layout"
import  { Navigate, Route, Routes} from 'react-router-dom'
import Login from "./pages/auth/Login"
import Signup from "./pages/auth/Signup"
import HomePage from "./pages/auth/HomePage"
import toast, { Toaster } from "react-hot-toast"
import { useQuery } from "@tanstack/react-query"
import axiosInstance from "./lib/axios"
import { Home, Loader } from "lucide-react"
import NotificationsPage from "./pages/NotificationsPage"
import NetworkPage from "./pages/NetworkPage"
import PostPage from "./pages/PostPage"
import ProfilePage from "./pages/ProfilePage"

function App() {
  const {data: user,} = useQuery({
    queryKey: ['authUser'],
    queryFn: async() =>{
      try {
        const res = await axiosInstance.get('/auth/me');
        return res.data;
        
      } catch (error) {
        if(error.response && error.response.status === 401){
          return null
        };
        toast.error(error.response.data.message || "Something went wrong")
      }
    },
    retry: false
  });

  // if(isLoading) return(<div className="flex justify-center items-center h-screen"> 
  //   <Loader/> 
  // </div>)
  return <Layout> 
    <Routes>
      <Route path="/" element={ user ? <HomePage/>: <Navigate to={'/signup'}/>}> </Route>
      <Route path="/signup" element={!user ? (<Signup/>): <HomePage/>}> </Route>
      <Route path="/login" element={ !user ?<Login/> : <Navigate to={'/'}/>}> </Route>
      <Route path="/notifications" element={ user ?<NotificationsPage/> : <Navigate to={'/login'}/>}> </Route>
      <Route path="/network" element={ user ?<NetworkPage/> : <Navigate to={'/login'}/>}> </Route>
      <Route path="/post/:postId" element={ user ?<PostPage/> : <Navigate to={'/login'}/>}> </Route>
      <Route path="/profile/:username" element={ user ?<ProfilePage/> : <Navigate to={'/login'}/>}> </Route>
    </Routes>
    <Toaster/>
  </Layout>
}

export default App

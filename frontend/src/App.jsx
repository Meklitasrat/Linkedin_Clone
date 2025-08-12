import Layout from "./components/layout/Layout"
import  { Navigate, Route, Routes} from 'react-router-dom'
import Login from "./pages/auth/Login"
import Signup from "./pages/auth/Signup"
import HomePage from "./pages/auth/HomePage"
import toast, { Toaster } from "react-hot-toast"
import { useQuery } from "@tanstack/react-query"
import axiosInstance from "./lib/axios"
import { Loader } from "lucide-react"
import NotificationsPage from "./pages/NotificationsPage"

function App() {
  const {data: user, isLoading} = useQuery({
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

  if(isLoading) return(<div className="flex justify-center items-center h-screen"> 
    <Loader/> 
  </div>)
  return <Layout> 
    <Routes>
      <Route path="/" element={ user ? <HomePage/>: <Navigate to={'/login'}/>}> </Route>
      <Route path="/signup" element={!user ? <Signup/> : <Navigate to={'/'}/>}> </Route>
      <Route path="/login" element={ !user ?<Login/> : <Navigate to={'/'}/>}> </Route>
      <Route path="/notifications" element={ user ?<NotificationsPage/> : <Navigate to={'/login'}/>}> </Route>
    </Routes>
    <Toaster/>
  </Layout>
}

export default App

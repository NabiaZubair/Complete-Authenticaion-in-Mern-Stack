import { Routes,Route } from "react-router-dom"

import EmailVarification from "./Pages/EmailVarification"
import ForgetPassword from "./Pages/ForgetPassword"
import Home from "./Pages/Home"
import Register from "./Pages/Register"
import Login from "./Pages/login"
import ResetPassword from "./Pages/ResetPassword"
import VarifyOtp from "./Pages/VarifyOtp"


const App = () => {
  return (
   <Routes>
    <Route path="/" element={<Home/>}/>
    <Route path="/register" element={<Register/>}/>
    <Route path="/verify-email" element={<EmailVarification/>}/>
    <Route path="/login" element={<Login />} />
    <Route path="/forget-password" element={<ForgetPassword/>}/>
    <Route path="/verify-otp" element={<VarifyOtp/>}/>
    <Route path="/reset-password" element={<ResetPassword/>}/>
   
   </Routes>
  )
}

export default App

import axios from 'axios'
import React, { useState } from 'react'
import toast from 'react-hot-toast'
import { useLocation } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'


const ResetPassword = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const resetToken = location.state?.resetToken

  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setPassword(e.target.value)

  }
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true)

    if (!password) {
      toast.error("Please enter password")
      return
    }
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters")
      return;
    }

    if (!resetToken) {
      toast.error("Invalid or expired reset request")
      return;
    }
    setLoading(true);


    try {
      const response = await axios.post("http://localhost:3000/api/auth/reset-password",
        {
          newPassword: password,
          resetToken: resetToken
        },
        {
          withCredentials: true
        }
      )
      console.log("password reset successfullly:", response.data)
    toast.success("Password reset successfully")
      navigate("/login")

    } catch (error) {
      toast.error(error.response?.data?.message||"Password Reset Failed")

    } finally {
      setLoading(false)
    }
  }
  return (
    <div className='flex items-center justify-center h-screen bg-linear-to-bl from-violet-500 to-fuchsia-400 '>
      <div className='flex  flex-col  w-100  border border-gray-400 p-7 rounded-xl bg-white '>
        <h1 className='font-medium text-3xl text-center mb-6  text-purple-700'>Reset Password</h1>
        <form onSubmit={handleSubmit} >
          <div>
            <input
              type='password'
              name='password'
              value={password}
              onChange={handleChange}
              placeholder='enter password '
              className='w-full border border-gray-300 p-2 rounded mb-4'
            /></div>

          <div className='flex items-center justify-center'>
            <button type='submit' disabled={loading}   className='bg-purple-700 text-white rounded-xl  p-1.5  font-normal text-lg mt-4 w-40'> {loading ? "Resetting..." : "Reset"}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ResetPassword

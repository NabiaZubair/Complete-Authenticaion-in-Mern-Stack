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
    <div className='flex items-center justify-center h-screen '>
      <div className='bg-rose-400 p-6 '>
        <h1 className='font-semibold, text-center text-2xl'>Reset Password</h1>
        <form onSubmit={handleSubmit} >
          <div>
            <input
              type='password'
              name='password'
              value={password}
              onChange={handleChange}
              placeholder='enter password '
              className='bg-purple-600 border-2 border-black p-2 rounded-2xl'
            /></div>

          <div className='flex items-center justify-center'>
            <button type='submit' disabled={loading} className='bg-amber-700 rounded-full p-1 w-30 mt-4'> {loading ? "Resetting..." : "Reset"}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ResetPassword

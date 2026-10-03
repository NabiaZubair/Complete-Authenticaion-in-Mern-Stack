import React, { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'


const ForgetPassword = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setEmail(e.target.value)

  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post("http://localhost:3000/api/auth/forget-password",
        {
          email: email
        },
        {
          withCredentials: true
        }
      )
      console.log("otp is sent to you accout ", response.data)
      toast.success("OTP has been sent to your email")
      navigate("/verify-otp",{
        state:{email:email}
      })
    } catch (error) {
      toast.error(error.response?.data?.message||"Failed to send OTP")
    }finally{
      setLoading(false)
    }
  }



  return (
    <div className='flex items-center justify-center h-screen'>
      <div className='bg-pink-400 p-4'>
        <h1 className='font-semibold text-2xl text-center'>Forgot Password?</h1>
        <h2 className='text-center'>Enter your Email and We will send you an OTP</h2>
        <form onSubmit={handleSubmit}
        className='flex flex-col'>
          <input
            id='email'
            type='email'
            name='email'
            placeholder='enter your email'
            value={email}
            onChange={handleChange}
            className='border-2 border-black rounded-2xl p-1'
          />
          <div className='flex items-center justify-center mt-4'>
          <button type='submit' disabled={loading}
          className='bg-sky-500 w-30 rounded-full p-2'>
            {loading?"otp is sending":"send OTP"} </button>
            </div>
        </form>
      </div>
    </div>
  )
}

export default ForgetPassword

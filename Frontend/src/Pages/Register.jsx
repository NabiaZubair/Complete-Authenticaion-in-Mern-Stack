import { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import axios from "axios"
import { GoogleLogin } from '@react-oauth/google';
import toast from "react-hot-toast"
import { UserRound, Lock, Mail } from 'lucide-react';


const Register = () => {

  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: ""
  })

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    })
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post("http://localhost:3000/api/auth/register",
        formData,
        {
          withCredentials: true
        }
      )
      console.log("sign up successful:", response.data)
      toast.success("Sign up  successful")
      navigate("/verify-email", {
        state: {
          email: formData.email,
          userId: response.data.userId
        }
      })
    } catch (error) {
      console.log(error)
      toast.error(error.response?.data?.message || "sign up failed")
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async (credentialResponse) => {
    try {
      const response = await axios.post("http://localhost:3000/api/auth/google-login", {
        credential: credentialResponse.credential
      }, {
        withCredentials: true
      })
      console.log("google login successfull", response.data)
      const token = response.data.accessToken
      setAccessToken(token);
      await getMe(token);
      toast.success("you have been successfully logged in")
      navigate("/");
    } catch (error) {
      toast.error(error.response?.data?.message || "Google Login Failed")
    }
  }

  return (

    <div className='min-h-screen flex justify-center items-center   bg-linear-to-bl from-violet-500 to-fuchsia-400'>

      <div className='flex  flex-col  w-100  border border-gray-400 p-7 rounded-xl bg-white'>

        <h1 className='font-medium text-3xl text-center mb-4 text-purple-700'>Sign up</h1>
        < h2 className='text-center mb-4'>Please enter your credentials to Create your account</h2>

        <form onSubmit={handleSubmit} className='flex flex-col gap-3'>

          <div className='relative w-full flex flex-col'>
            <label htmlFor='username' className='text-sm text-gray-600'>username</label>
            <input
              id="username"
              className='border border-gray-400 pl-9 p-2 rounded-lg relative text-gray-600'
              type="text"
              name="username"
              placeholder='enter your name'
              value={formData.username}
              onChange={handleChange}
            />
            <UserRound className='absolute top-8 left-2 text-gray-500' size={20} />
          </div>

          <div className='relative w-full flex flex-col '>
            <label htmlFor='email' className='text-sm text-gray-600'>email</label>
            <input
              id="email"
              className='border border-gray-400 pl-9 p-2 rounded-lg text-gray-500'
              type="email"
              name="email"
              placeholder='enter your email'
              value={formData.email}
              onChange={handleChange}
            />
            <Mail className='absolute top-8 left-2 text-gray-500' size={20} />

          </div>

          <div className='relative w-full flex flex-col '>
            <label htmlFor='password' className='text-sm text-gray-600'>password</label>
            <input
              id="password"
              className='border border-gray-400 pl-9 p-2 rounded-lg text-gray-500'
              type="password"
              name="password"
              placeholder='enter your password'
              value={formData.password}
              onChange={handleChange}
            />
            < Lock className='absolute top-8 left-2 text-gray-500' size={20} />
          </div>


          <div className='flex justify-center text-purple-700'>
            <button className='bg-purple-700 text-white rounded-xl w-full p-2 mb-3 font-normal text-lg mt-4'
              type='submit' disabled={loading}>{loading ? "signing up...." : "Sign UP"}</button>
          </div>

        </form>

        <div className='text-center'>
          <p>Already have an account?<button className='text-purple-700 mb-2 ' onClick={() => navigate("/login")}>Login</button></p>
        </div>

        <div className='text-center mb-2'>or</div>
        <div>
          <GoogleLogin onSuccess={handleGoogleLogin}
            onError={() => {
              console.log(" Google Login failed")
            }}
            theme="outline"
            size="large"
            text="continue_with"
            shape="rectangular"
            width="340" />
        </div>

      </div>

    </div>

  )
}

export default Register

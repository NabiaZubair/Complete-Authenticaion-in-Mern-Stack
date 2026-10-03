import { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import axios from "axios"
import { GoogleLogin } from '@react-oauth/google';
import toast from "react-hot-toast"


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
      toast.error(  error.response?.data?.message || "sign up failed")
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
      toast.error(error.response?.data?.message||"Google Login Failed")
    }
  }

  return (

    <div className='flex  items-center justify-center min-h-screen'>

      <div className='border-2 border-black p-4'>

        <h1 className='text-center font-semibold text-2xl'>Sign up</h1>
        < h2 className='text-center text-xl'>create your account</h2>

        <form onSubmit={handleSubmit}>

          <div className='flex flex-col'>
            <label htmlFor="username">username</label>
            <input
              id="username"
              className='w-full border-2 border-gray-300 rounded-xl px-3 py-1'
              type="text"
              name="username"
              placeholder='enter your name'
              value={formData.username}
              onChange={handleChange}
            />
          </div>

          <div className='flex flex-col'>
            <label htmlFor='email'>email</label>
            <input
              id="email"
              className='w-full border-2 border-gray-300 rounded-xl px-3 py-1'
              type="email"
              name="email"
              placeholder='enter your email'
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div className='flex flex-col'>
            <label htmlFor='password'>password</label>
            <input
              id="password"
              className='w-full border-2 border-gray-300 rounded-xl px-3 py-1'
              type="password"
              name="password"
              placeholder='enter your password'
              value={formData.password}
              onChange={handleChange}
            />
          </div>


          <div className='flex justify-center items-center'>
            <button className='bg-sky-600 rounded-full w-30 p-1 mt-4'
              type='submit' disabled={loading}>{loading ? "signing up...." : "Sign UP"}</button>
          </div>

        </form>

        <p>Already have an account?<button onClick={() => navigate("/login")}>Login</button></p>


        <div>
          <GoogleLogin onSuccess={handleGoogleLogin}
            onError={() => {
              console.log(" Google Login failed")
            }} />
        </div>

      </div>

    </div>

  )
}

export default Register

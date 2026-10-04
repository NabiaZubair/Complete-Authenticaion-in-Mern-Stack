import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from "axios"
import { useContext } from 'react';
import { AuthContext } from '../context/authContext';
import { GoogleLogin } from '@react-oauth/google';
import toast from 'react-hot-toast';
import { Mail, Lock } from 'lucide-react';


const Login = () => {

  const navigate = useNavigate()
  const { setAccessToken, getMe } = useContext(AuthContext)
  const [formData, setFormDate] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [unverifiedUserId, setUnverifiedUserId] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormDate({
      ...formData,
      [name]: value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:3000/api/auth/login",
        formData,
        {
          withCredentials: true,
        }
      );
      console.log("Login Successfuly", response.data);

      const token = response.data.accessToken
      setAccessToken(token)
      await getMe(token)

      toast.success("You have been successfully logged in");

      navigate("/")

    } catch (error) {

      toast.error(error.response?.data || "Login Failed");

      if (error.response?.status === 403) {
        setUnverifiedUserId(error.response.data.userId);
        toast.error(error.response?.data?.message)
        return;
      }

      toast.error(error.response?.data?.message || "something went wrong")

    } finally {
      setLoading(false)
    }
  }

  const handleResendOTP = async () => {
    try {

      const response = await axios.post(
        "http://localhost:3000/api/auth/resend-otp",
        {
          userId: unverifiedUserId
        }
      );

      console.log("RESEND OTP SUCCESS:", response.data);

      toast.success("OTP is sent to you account")

      navigate("/verify-email", {
        state: {
          userId: unverifiedUserId,
          email: formData.email
        }
      });

    } catch (error) {
      console.log("RESEND OTP ERROR:", error);
      toast.error(error.response?.data?.message || "Failed to Resend OTP")
    }
  };

  const handleGoogleLogin = async (credentialResponse) => {
    try {
      const response = await axios.post("http://localhost:3000/api/auth/google-login", {
        credential: credentialResponse.credential
      }, {
        withCredentials: true
      }
      )

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
        <h1 className='font-medium text-3xl text-center mb-4 text-purple-700'>Login</h1>
        <h2 className=' text-center mb-4 '>Please enter your credentials to Access your account</h2>
        <form onSubmit={handleSubmit}
          className='flex flex-col gap-3'>

          <div className='relative w-full flex flex-col'>
            <label htmlFor='email' className='text-sm text-gray-600'>Email</label>
            <input
              className='border border-gray-400 pl-9 p-2 rounded-lg relative text-gray-600'
              type="email"
              name="email"
              placeholder='enter email'
              value={formData.email}
              onChange={handleChange}
            />
            <Mail className='absolute top-8 left-2 text-gray-500' size={20} />
          </div>

          <div className='relative w-full flex flex-col  '>
            <label htmlFor='password' className='text-sm text-gray-600'>Password</label>
            <input
              className='border border-gray-400 pl-9 p-2 rounded-lg text-gray-500'
              type="password"
              name="password"
              placeholder='enter your password'
              value={formData.password}
              onChange={handleChange}
            />
            <Lock className='absolute top-8 left-2 text-gray-500' size={20} />
          </div>

          <div className='flex justify-end text-purple-700'>
            <button className='text-start' type='button' onClick={() => navigate("/forget-password")}>forget Password</button>
          </div>


          <div className='flex justify-center w-full'>
            {unverifiedUserId && (
              <button  className='bg-purple-700 text-white rounded-xl w-full p-2 mb-3 font-normal text-xl' type="button" onClick={handleResendOTP}>
                Verify Email
              </button>
            )}
          </div>



          <div className='flex justify-center w-full'>
            <button type="submit" disabled={loading}
              className='bg-purple-700 text-white rounded-xl w-full p-2 mb-3 font-normal text-lg'
            >{loading ? "Logging in..." : "Login"}</button>
          </div>

        </form>


        <div className='text-center'>
          <p>
            Don't have and account?
            <button className='text-purple-700 mb-2 ' type='button' onClick={() => navigate("/register")}>Sign up</button>
          </p>
        </div>
        <div className='text-center mb-2'>or</div>
        <div >
          <GoogleLogin
            onSuccess={handleGoogleLogin}
            onError={() => {
              console.log(" Google Login failed")
            }}
            theme="outline"
            size="large"
            text="continue_with"
            shape="rectangular"
            width="340"
          />
        </div>

      </div >
    </div>
  )
}

export default Login

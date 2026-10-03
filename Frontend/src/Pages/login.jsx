import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from "axios"
import { useContext } from 'react';
import { AuthContext } from '../context/authContext';
import { GoogleLogin } from '@react-oauth/google';
import toast from 'react-hot-toast';
import { Mail } from 'lucide-react';


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

      toast.error( error.response?.data ||"Login Failed");

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
      toast.error( error.response?.data?.message ||"Failed to Resend OTP")
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
      toast.error(error.response?.data?.message||"Google Login Failed")
    }

  }
  return (
    <div className='min-h-screen flex justify-center items-center bg-linear-to-br from-sky-50 via-blue-100 to-sky-200 '>
      <div className='flex  flex-col  w-100  border-2 border-black p-2 '>

        <h1 className='font-medium text-3xl text-center mb-4'>Login</h1>
        <h2 className='text-lg  text-center '>Please enter your credentials to Access your account</h2>
        <form onSubmit={handleSubmit}
          className='flex flex-col gap-2'>
          <div className='relative w-full'>
            <label htmlFor='email'>Email</label>
             <Mail className='absolute top-10' />
            <input
              className='border border-gray-400 p-2 rounded-lg '
              type="email"
              name="email"
              placeholder='enter email'
              value={formData.email}
              onChange={handleChange}
            />
          </div>
          <div>
            <label htmlFor='password'>Password</label>
            <Lock />
            <input
              className='border border-gray-400  p-2 rounded-lg w-full'
              type="password"
              name="password"
              placeholder='enter your password'
              value={formData.password}
              onChange={handleChange}
            />
          </div>
          <button className='text-start' type='button' onClick={() => navigate("/forget-password")}>forget Password</button>


        
          {unverifiedUserId && (
            <button type="button" onClick={handleResendOTP}>
              Verify Email
            </button>
          )}



          <div className='flex justify-center w-full'>

            <button type="submit" disabled={loading}
              className='bg-sky-300 rounded-full w-50 px-4 py-1 mb-3'
            >{loading ? "Logging in..." : "Login"}</button>
          </div>

        </form>


        <div className='text-center'>
          <p>
            Don't have and account?
            <button type='button' onClick={() => navigate("/register")}>Sign up</button>
          </p>
        </div>
        <div>
          <GoogleLogin onSuccess={handleGoogleLogin}
            onError={() => {
              console.log(" Google Login failed")
            }} />
        </div>

      </div >
    </div>
  )
}

export default Login

import { useEffect, useRef, useState } from "react"
import { useLocation } from "react-router-dom";
import axios from "axios"
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/authContext";
import toast from "react-hot-toast";


const EmailVarification = () => {
  const navigate = useNavigate()
  const { setAccessToken, getMe } = useContext(AuthContext)

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [timer, setTimer] = useState(60);

  const inputRefs = useRef([]);
  const location = useLocation();
  const email = location.state?.email;
  const userId = location.state?.userId

  useEffect(() => {
    if (timer === 0) return
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval)
  }, [timer])


  const handleChange = (value, index) => {
    if (!/^\d?$/.test(value)) {
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0) {
        inputRefs.current[index - 1]?.focus()
      }
    }
  }

  const handlePaste = (e) => {
    e.preventDefault();

    const pastedData = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6)

    if (!pastedData) return
    const newOtp = [...otp]

    pastedData.split("").forEach((digit, index) => {
      newOtp[index] = digit;

    });

    setOtp(newOtp)
    const nextIndex = Math.min(pastedData.length, 5)
    inputRefs.current[nextIndex]?.focus()

  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpValue = otp.join("");

    if (otpValue.length !== 6) {
      toast.error("Please enter the 6 digit OTP")
      return
    }

    try {
      setLoading(true);

      const response = await axios.post("http://localhost:3000/api/auth/email-verify",
        {
          userId: userId,
          otp: otpValue
        },
        {
          withCredentials: true
        }
      )
      console.log("email verified", response.data)
      toast.success("Email verified Successfuly")
      const token = response.data.accessToken
      setAccessToken(token)
      await getMe(token)
      navigate("/")


    } catch (error) {
      toast.error(error.response?.data?.message || "Verification failed")
    } finally {
      setLoading(false)
    }
  }

  const handleResendOtp = async () => {
    if (timer > 0) return
    try {
      setResendLoading(true)

      const response = await axios.post("http://localhost:3000/api/auth/resend-otp",
        {
          email: email
        },
        {
          withCredentials: true
        }
      )
      console.log("OTP is Send to Your Account",response.data)
      toast.success("OTP has been sent to your email")
      setOtp(["", "", "", "", "", ""])

      setTimer(60);
      inputRefs.current[0]?.focus()
    } catch (error) {
      toast.error( error.response?.data?.message || "Failed to resend OTP")
    } finally { setResendLoading(false) }
  }


  return (
    <div className="flex items-center justify-center h-screen bg-linear-to-bl from-violet-500 to-fuchsia-400">
      <div className='flex  flex-col  w-100  border border-gray-400 p-7 rounded-xl bg-white'>
        <h1 className='font-medium text-3xl text-center mb-6  text-purple-700'>Verify your Email</h1>
        <p className="text-center mb-4">Enter 6-digit OTP sent to you Email</p>
        <form onSubmit={handleSubmit}>
          <div  className='flex justify-center gap-4'>
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(element) => {
                  inputRefs.current[index] = element
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(e.target.value, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                onPaste={handlePaste}
                 className='w-full border border-gray-300 p-2 rounded mb-4'
              />
            ))}

          </div>

          <div className='flex justify-center text-purple-700'>
            <button
              type="submit"
              disabled={loading}
              className='bg-purple-700 text-white rounded-xl  p-2 mb-3 font-normal text-lg mt-4 w-48'
            >
              {loading ? "Veriying..." : "Verify"}</button>
          </div>
        </form>

        <div className="flex items-center justify-center ">
          {timer > 0 ? (<p>Resend Otp in {""}<span>{timer}s</span></p>)
            : (<button type="button" disabled={resendLoading} onClick={handleResendOtp}
             className='bg-pink-600 text-white rounded-xl  p-2 mb-3 font-normal  mt-4 w-30'>
              {resendLoading ? "sending" : "Resend Otp"}
            </button>)}
        </div>

      </div>

    </div>
  )
}

export default EmailVarification

import React from 'react'
import { useState, useRef, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'


const VarifyOtp = () => {
  const inputRefs = useRef([])
  const navigate = useNavigate()
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [loading, setLoading] = useState(false)
  const [timer, setTimer] = useState(60)
  const [resendLoading, setResendLoading] = useState("")
  const location = useLocation()
  const email = location.state?.email


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

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

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
    const pastedData = e.clipboardData.getData("text").replace(/\D/g).slice(0, 6)
    if (!pastedData) return

    const newOtp = [...otp]

    pastedData.split("").forEach((digit,index) =>
      newOtp[index] = digit
    )


    setOtp(newOtp)
    const nextIndex = Math.min(pastedData.length, 5)
    inputRefs.current[nextIndex]?.focus()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const otpValue = otp.join("")
  

    if (otpValue.length !== 6) {
      toast.error("please enter the complete 6 digit otp ")
      return
    }
    setLoading(false)

    try {
      const response = await axios.post("http://localhost:3000/api/auth/verify-otp",
        {
          email: email,
          otp: otpValue
        },
        {
          withCredentials: true
        }
      )
      console.log("email verified", response.data)
      toast.success("Email verified")
      navigate("/reset-password", {
        state: { resetToken: response.data.resetToken }
      })
    } catch (error) {
      toast.error(error.response?.data?.message||"OTP Verification failed")
    
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
  
      toast.success("OTP has been sent to your Email")
      setOtp(["", "", "", "", "", ""])

      setTimer(60);
      inputRefs.current[0]?.focus()
    } catch (error) {
      toast.error(  error.response?.data?.message || "Failed to resend otp")
    
    } finally { setResendLoading(false) }
  }


  return (
    <div className='flex items-center justify-center h-screen'>
      <div  className='bg-sky-300'>
        <h1 className='text-center text-2xl font-semibold'>verify Otp</h1>
        <form onSubmit={handleSubmit} >
          <div>
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(element) => {
                inputRefs.current[index] = element
              }}
              type='text'
              inputMode='numeric'
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(e.target.value, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              onPaste={handlePaste}
              className='bg-amber-100 m-1 w-10'
            />
          ))}
          </div>
          <div className='flex items-center justify-center'>
          <button disabled={loading}
          className='bg-pink-600 w-30 p-1 rounded-full'>
            {loading ? "Verifying" : "Verify"}</button></div>
        </form>
        <div className="flex items-center justify-center mt-4">
          {timer > 0 ? (<p>Resend Otp in {""}<span>{timer}s</span></p>)
            : (<button type="button" disabled={resendLoading} onClick={handleResendOtp}
              className="bg-purple-800 rounded-full w-40 p-1">
              {resendLoading ? "Sending" : "Resend Otp"}
            </button>)}
        </div>

      </div>
    </div>
  )
}

export default VarifyOtp

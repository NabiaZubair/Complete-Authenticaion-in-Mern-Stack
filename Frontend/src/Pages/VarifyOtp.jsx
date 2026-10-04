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

    pastedData.split("").forEach((digit, index) =>
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
      toast.error(error.response?.data?.message || "OTP Verification failed")

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
      toast.error(error.response?.data?.message || "Failed to resend otp")

    } finally { setResendLoading(false) }
  }


  return (
    <div className='flex items-center justify-center h-screen bg-linear-to-bl from-violet-500 to-fuchsia-400'>

      <div className='flex  flex-col  w-100  border border-gray-400 p-7 rounded-xl bg-white'>
        <h1 className='font-medium text-3xl text-center mb-6  text-purple-700'>Verify OTP</h1>
        <form onSubmit={handleSubmit} className='flex  flex-col gap-2' >
          <div className='flex justify-center gap-4'>
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
                className='border border-gray-400  text-gray-600 h-12 w-12 rounded'
              />
            ))}
          </div>

          <div className='flex justify-center text-purple-700'>
            <button disabled={loading}
             className='bg-purple-700 text-white rounded-xl  p-2 mb-3 font-normal text-lg mt-4 w-48'>
              {loading ? "Verifying" : "Verify"}</button>
          </div>

        </form>

        <div className="flex items-center justify-center ">
          {timer > 0 ? (<p>Resend Otp in {""}<span>{timer}s</span></p>)
            : (<button type="button" disabled={resendLoading} onClick={handleResendOtp}
              className='bg-pink-600 text-white rounded-xl  p-2 mb-3 font-normal  mt-4 w-30'>
              {resendLoading ? "Sending" : "Resend Otp"}
            </button>)}
        </div>
      </div>

    </div>
  )
}

export default VarifyOtp

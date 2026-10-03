import React from 'react'
import robot from "../assets/robot.webp"
import { AuthContext } from '../context/authContext'
import { useContext } from 'react'
import { ArrowRight } from 'lucide-react'
const Header = () => {
    const { user } = useContext(AuthContext)

    return (
        <div className='flex items-center justify-center mt-30'>
            <div className='w-150  flex flex-col items-center justify-center '>
                <div className='relative h-48 w-48 '> 
                        <div className='absolute bg-purple-500 w-44 h-44 rounded-full blur-3xl opacity-40'></div>
                        <img className='relative h-48 w-48 object-contain' src={robot} alt="robot" />
                   
                </div>
                <div className='flex flex-col items-center justify-center text-center'>
                    <h2 className='text-xl font-medium'>Hey {user ? (user.username) : ("Developer")}</h2>
                    <h3 className='font-semibold text-4xl'>Welcome to our app</h3>
                    <div>
                        A secure and seamless way to manage your account, protect your information, and stay in control of your digital experience.
                    </div>
                    <button className='border-2 border-purple-700 rounded-full font-medium  mt-4 w-35 flex items-center justify-center gap-1 py-1.5'>
                        Get Started <ArrowRight size={22} /> </button>
                </div>
            </div>
        </div>


    )
}

export default Header

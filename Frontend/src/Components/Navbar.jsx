import React from 'react'
import { useNavigate } from "react-router-dom"
import { AuthContext } from '../context/authContext';
import { useContext } from 'react';
import ProfileMenu from './ProfileMenu';
import {ArrowRight} from "lucide-react"

const Navbar = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext)

  return (
    <div className='flex justify-between px-10 py-4'>
      <h2 className='text-purple-500 font-bold text-2xl'>Atuthentication</h2>
      {user ? (
        <ProfileMenu />
      ) : (
        <button className='bg-purple-700 rounded-full w-30 text-white py-1.5 flex items-center justify-center gap-1 text-lg '
          onClick={() => navigate("/login")}>Login <ArrowRight size={22}/></button>
      )}

    </div>
  )
}

export default Navbar

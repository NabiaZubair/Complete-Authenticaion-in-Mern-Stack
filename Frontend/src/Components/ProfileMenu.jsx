import React from 'react'
import { useState, useContext } from 'react'
import { AuthContext } from '../context/authContext'
import { useNavigate } from 'react-router-dom'

const ProfileMenu = () => {
    const navigate = useNavigate()
    const {user, logout, logoutAll}= useContext(AuthContext)
    const [open, setOpen] = useState(false)
    return (
        <div>
            <button onClick={()=>setOpen(!open)}>{user?.username?.charAt(0).toUpperCase()}</button>
            {open&&(<div>
                <div><p>{user?.username?.charAt(0).toUpperCase()}</p><p>{user?.email}</p></div>
                <button onClick={logout}>Logout</button>
                <button onClick={logoutAll}>Logout from all Devices</button>
                </div>
            )}
        </div>
    )
}

export default ProfileMenu

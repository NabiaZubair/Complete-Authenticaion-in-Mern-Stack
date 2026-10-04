
import { useState, useContext } from 'react'
import { AuthContext } from '../context/authContext'
import { useNavigate } from 'react-router-dom'
import { LogOut } from 'lucide-react'

const ProfileMenu = () => {
    const navigate = useNavigate()
    const { user, logout, logoutAll } = useContext(AuthContext)
    const [open, setOpen] = useState(false)
    return (
        <div>
            <div className='relative'>
                <button className='h-10 w-10 bg-purple-700 rounded-full text-white' onClick={() => setOpen(!open)}>{user?.username?.charAt(0).toUpperCase()}</button>

            </div>
            {open &&
             (<div>
                <div className='border border-gray-300 rounded-xl absolute top-20 right-4 px-4 py-6 shadow-lg flex flex-col items-start gap-4'>

                    <div className='flex gap-2 items-center   '>
                        <p className='h-16 w-16 bg-purple-700 rounded-full flex items-center justify-center text-2xl text-white font-medium  '>{user?.username?.charAt(0).toUpperCase()}</p>
                        <div>
                            <p className='font-medium text-lg'>{user?.username}</p>
                            <p className='text-sm'>{user?.email}</p>
                        </div>
                    </div>

                    <div className=' flex flex-col gap-2'>
                        <button className='flex items-center gap-2 text-sm' onClick={logout}><LogOut size={19} />Logout</button>
                        <button className='flex items-center gap-2 text-sm' onClick={logoutAll}><LogOut size={19} />Logout from all Devices</button>
                    </div>

                </div>

            </div>
            )}

        </div>
    )
}

export default ProfileMenu

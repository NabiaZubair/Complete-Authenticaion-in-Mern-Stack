import React from 'react'
import Navbar from '../Components/Navbar'
import Header from '../Components/Header'
import { AuthContext } from '../context/authContext'
import { useContext } from 'react'


const Home = () => {
 
  const {user}= useContext(AuthContext)
  


  return (
    <div className=' h-screen'>
      <Navbar />
      <Header />
    </div>
  )
}

export default Home

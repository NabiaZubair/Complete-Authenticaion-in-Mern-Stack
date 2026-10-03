import React from 'react'
import { useContext } from 'react'
import { AuthContext } from '../context/authContext'
import { Navigate } from 'react-router-dom'

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useContext(AuthContext)

    if (loading) {
        return <div>Loadign ....</div>
    }
    if (!user) {
        return <Navigate to="/login" />
    }
    return children
}

export default ProtectedRoute


import { createContext, useState, useEffect } from 'react'
import axios from 'axios'
import api from "../Api/axios"

export const AuthContext = createContext()

const AuthProvider = ({ children }) => {

    const [user, setUser] = useState(null)
    const [accessToken, setAccessToken] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const requestInterceptor = api.interceptors.request.use(
            (config) => {
                if (accessToken) {
                    config.headers.Authorization = `Bearer ${accessToken}`
                }
                return config
            },
            (error) => {
                return Promise.reject(error)
            }
        )
        return () => {
            api.interceptors.request.eject(requestInterceptor)
        }
    }, [accessToken])

    useEffect(() => {
        const responseInterceptor = api.interceptors.response.use(
            (response) => {
                return response
            },
            async (error) => {
                const originalRequest = error.config

                if (error.response?.status === 401 && !originalRequest._retry) {
                    originalRequest._retry = true
                    const newToken = await refreshAccessToken()
                    if (newToken) {
                        originalRequest.headers.Authorization = `Bearer ${newToken}`
                        return api(originalRequest)
                    }
                }
                return Promise.reject(error)
            }
        )
        return () => {
            api.interceptors.response.eject(responseInterceptor)
        }
    }, [])

    const refreshAccessToken = async () => {
        try {
            const response = await axios.get("http://localhost:3000/api/auth/refresh-token",
                {

                    withCredentials: true
                }
            )

            console.log("REFRESH SUCCESS:", response.data)
            setAccessToken(response.data.accessToken)
            return response.data.accessToken
        } catch (error) {
            setAccessToken(null)
            setUser(null)
            return null

        }
    }

    const getMe = async (token = accessToken) => {
        try {
            const response = await api.get("/auth/get-me",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    },
                    withCredentials: true
                }
            )
            console.log("GET ME SUCCESS:", response.data)
            setUser(response.data.user)
            setLoading(false)
        } catch (error) {
            console.log("get me error:", error)
            setUser(null)
            setLoading(false)

        }
    }
    useEffect(() => {
        const satartAuth = async () => {
            const token = await refreshAccessToken()
            if (token) {
                await getMe(token)
            } else {
                setLoading(false)
            }
        }
        satartAuth()
    }, [])


    const logout = async () => {
        try {
            await api.post("/auth/logout")
        } catch (error) {
            console.log("Logout error", error)
        } finally {
            setAccessToken(null)
            setUser(null)
        }
    }
    const logoutAll = async () => {
        try {
            await api.post("/auth/logout-all")
        } catch (error) {
            console.log("Logout error", error)
        } finally {
            setAccessToken(null)
            setUser(null)
        }

    }

    return (
        <AuthContext.Provider
            value={{
                user,
                setUser,
                getMe,
                accessToken,
                setAccessToken,
                logout,
                logoutAll,
                loading
            }}
        >
            {children}

        </AuthContext.Provider>
    )
}
export default AuthProvider;
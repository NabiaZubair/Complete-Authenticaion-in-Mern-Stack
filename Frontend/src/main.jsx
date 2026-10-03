import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import AuthProvider from './context/authContext.jsx'
import {GoogleOAuthProvider} from "@react-oauth/google"
import {Toaster} from "react-hot-toast"


createRoot(document.getElementById('root')).render(
  <AuthProvider>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID} >
  <BrowserRouter>
    <App />
     <Toaster />
  </BrowserRouter>
  </GoogleOAuthProvider>   
  </AuthProvider> 
)

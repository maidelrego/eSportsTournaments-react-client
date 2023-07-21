import { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { PrivateRoutes } from './PrivateRoutes'
import { PublicRoutes } from './PublicRoutes'
import { Login } from '../auth/pages/Login'
import { MainLayout } from '../layout/MainLayout/routes/MainLayoutRoutes'
import { Register } from '../auth/pages/Register'
import { useAuthStore } from '../hooks/useAuthStore'
import { authStatusName } from '../store/auth/authSlice'


export const AppRouter = () => {
  
     const { authStatus, startCheckAuthToken } = useAuthStore();
     
     useEffect(() => {
        startCheckAuthToken();
    },[])

    if(authStatus == authStatusName.checking ){
       return  <h3>Cargando.....</h3> //Loading component here!!
    }
    
  
  return (
    <>
      <Routes>

        {/* PUBLIC ROUTES */}
        <Route path="login/*" element={
          <PublicRoutes>
            <Login />
          </PublicRoutes>
        } />

        <Route path="register" element={
          <PublicRoutes>
            <Register />
          </PublicRoutes>
        } />

        {/* PRIVATE ROUTES */}
        <Route path="/*" element={
          <PrivateRoutes>
            <MainLayout />
          </PrivateRoutes>
        } />

      </Routes>
    </>
  )
}

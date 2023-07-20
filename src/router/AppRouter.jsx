import { Routes, Route } from 'react-router-dom'
import { PrivateRoutes } from './PrivateRoutes'
import { PublicRoutes } from './PublicRoutes'
import { Login } from '../auth/pages/Login'
import { MainLayout } from '../layout/MainLayout/routes/MainLayoutRoutes'
import { Register } from '../auth/pages/Register'

export const AppRouter = () => {
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

import { Routes, Route } from 'react-router-dom'
import { PrivateRoutes } from './PrivateRoutes'
import { PublicRoutes } from './PublicRoutes'
import { Login } from '../auth/pages/Login'
import { MainLayout } from '../layout/MainLayout/routes/MainLayoutRoutes'

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

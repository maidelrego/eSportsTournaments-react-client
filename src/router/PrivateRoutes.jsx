import { Navigate, useLocation } from 'react-router-dom'
import PropTypes from 'prop-types'
import { useAuthStore } from '../hooks/useAuthStore'
import { authStatusName } from '../store/auth/authSlice';


export const PrivateRoutes = ({ children }) => {

  const { authStatus } = useAuthStore();

  const { pathname, search } = useLocation()

  const lastPath = pathname + search

  localStorage.setItem('lastPath', lastPath)

  return (
    (authStatus === authStatusName.authenticated) ? children : <Navigate to="/login" />
  )
}

PrivateRoutes.propTypes = {
  children: PropTypes.node.isRequired
}

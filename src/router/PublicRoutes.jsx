import { Navigate } from 'react-router-dom'
import PropTypes from 'prop-types'
import { useAuthStore } from '../hooks/useAuthStore'
import { authStatusName } from '../store/auth/authSlice';

export const PublicRoutes = ({ children }) => {

  const { authStatus } = useAuthStore();

  return (
    (authStatus != authStatusName.authenticated) ? children : <Navigate to="/" />

  )
}

PublicRoutes.propTypes = {
  children: PropTypes.node.isRequired
}

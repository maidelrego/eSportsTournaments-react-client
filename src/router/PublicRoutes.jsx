import  { useContext } from 'react'
import { Navigate } from 'react-router-dom'
import { AuthContext } from '../auth/context/AuthContext'
import PropTypes from 'prop-types'

export const PublicRoutes = ({ children }) => {

  const { logged } = useContext(AuthContext)

  return (
    (!logged) ? children : <Navigate to="/" />
  )
}

PublicRoutes.propTypes = {
  children: PropTypes.node.isRequired
}

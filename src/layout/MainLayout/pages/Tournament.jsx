import { Navigate, useLocation } from 'react-router-dom'


export const Tournament = () => {
  const { state } = useLocation()
  console.log('STATE', state)
 
  if (!state) {
    return <Navigate to={'/my-tourneys'} />
  }


  return (
    <div>Tournament ID </div>
  )
}

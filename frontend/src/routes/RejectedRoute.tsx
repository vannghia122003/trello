import { Navigate, Outlet } from 'react-router-dom'
import useAuthStore from '~/stores/useAuthStore'

function RejectedRoute() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  return isAuthenticated ? <Navigate to="/" /> : <Outlet />
}

export default RejectedRoute

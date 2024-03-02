import { lazy } from 'react'
import { path } from '~/utils/constants'

export const BoardDetail = lazy(() => import('~/pages/BoardDetail'))
const Home = lazy(() => import('~/pages/Home'))
const Profile = lazy(() => import('~/pages/Profile'))
const Login = lazy(() => import('~/pages/Login'))
const Register = lazy(() => import('~/pages/Register'))
export const NotFound = lazy(() => import('~/pages/NotFound'))

export const publicRoute = [
  { path: path.login, component: Login },
  { path: path.register, component: Register }
]

export const privateRoute = [
  { path: path.home, component: Home },
  { path: path.profile, component: Profile }
]

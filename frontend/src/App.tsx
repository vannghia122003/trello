import { Suspense, useEffect } from 'react'
import { Route, Routes } from 'react-router-dom'
import { useShallow } from 'zustand/react/shallow'
import Loading from './components/Loading'
import { BoardDetail, NotFound, privateRoute, publicRoute } from './routes'
import ProtectedRoute from './routes/ProtectedRoute'
import RejectedRoute from './routes/RejectedRoute'
import useAuthStore from './stores/useAuthStore'
import useBoardStore from './stores/useBoardStore'
import { LocalStorageEventTarget } from './utils/auth'
import { path } from './utils/constants'

function App() {
  const { setIsAuthenticated, setProfile } = useAuthStore(
    useShallow(({ setIsAuthenticated, setProfile }) => ({ setIsAuthenticated, setProfile }))
  )
  const resetBoard = useBoardStore((state) => state.reset)

  useEffect(() => {
    const reset = () => {
      setIsAuthenticated(false)
      setProfile(null)
      resetBoard()
    }
    LocalStorageEventTarget.addEventListener('clearLocalStorage', reset)
    return () => {
      LocalStorageEventTarget.removeEventListener('clearLocalStorage', reset)
    }
  }, [resetBoard, setIsAuthenticated, setProfile])

  return (
    <Routes>
      {/* Public route */}
      <Route element={<RejectedRoute />}>
        {publicRoute.map((route) => {
          const Page = route.component
          return (
            <Route
              key={route.path}
              path={route.path}
              element={
                <Suspense fallback={<Loading />}>
                  <Page />
                </Suspense>
              }
            />
          )
        })}
      </Route>

      {/* Private route */}
      <Route element={<ProtectedRoute />}>
        {privateRoute.map((route) => {
          const Page = route.component
          return (
            <Route
              key={route.path}
              path={route.path}
              element={
                <Suspense fallback={<Loading />}>
                  <Page />
                </Suspense>
              }
            />
          )
        })}
      </Route>

      <Route
        path={path.boardDetail}
        element={
          <Suspense fallback={<Loading />}>
            <BoardDetail />
          </Suspense>
        }
      />

      <Route
        path="*"
        element={
          <Suspense fallback={<Loading />}>
            <NotFound />
          </Suspense>
        }
      />
    </Routes>
  )
}

export default App

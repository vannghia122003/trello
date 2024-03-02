import CssBaseline from '@mui/material/CssBaseline'
import { Experimental_CssVarsProvider as CssVarsProvider } from '@mui/material/styles'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { ConfirmProvider } from 'material-ui-confirm'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import { BrowserRouter } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import App from './App.tsx'
import './index.css'
import theme from './theme.ts'

declare global {
  interface Window {
    require: any
  }
}
window.require = (name: string) => new URL(name, import.meta.url).href

const queryClient = new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: false, retry: 0 } }
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <ReactQueryDevtools initialIsOpen={false} />
          <CssVarsProvider theme={theme}>
            <ConfirmProvider
              defaultOptions={{
                allowClose: false,
                dialogProps: { maxWidth: 'xs' },
                confirmationButtonProps: { color: 'error', variant: 'contained' },
                cancellationButtonProps: { color: 'error', variant: 'outlined' },
                buttonOrder: ['confirm', 'cancel']
              }}
            >
              <CssBaseline />
              <App />
              <ToastContainer pauseOnFocusLoss={false} autoClose={3000} />
            </ConfirmProvider>
          </CssVarsProvider>
        </QueryClientProvider>
      </HelmetProvider>
    </BrowserRouter>
  </React.StrictMode>
)

import { yupResolver } from '@hookform/resolvers/yup'
import LoadingButton from '@mui/lab/LoadingButton'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Grid from '@mui/material/Grid'
import SvgIcon from '@mui/material/SvgIcon'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useMutation } from '@tanstack/react-query'
import { Helmet } from 'react-helmet-async'
import { Controller, useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import * as yup from 'yup'
import { useShallow } from 'zustand/react/shallow'
import authApi from '~/api/auth.api'
import userApi from '~/api/user.api'
import trelloLogo from '~/assets/trello.svg?react'
import useAuthStore from '~/stores/useAuthStore'
import { ErrorResponse, LoginData } from '~/types'
import { setAccessTokenToLocalStorage, setProfileToLocalStorage, setRefreshTokenToLocalStorage } from '~/utils/auth'
import { path } from '~/utils/constants'
import { isUnauthorizedError, isUnprocessableEntity } from '~/utils/error'
import { capitalizeFirstLetter } from '~/utils/helpers'

const schema = yup.object({
  email: yup.string().email().required(),
  password: yup.string().required().min(6)
})
type FormData = yup.InferType<typeof schema>

function Login() {
  const { setProfile, setIsAuthenticated } = useAuthStore(
    useShallow(({ setProfile, setIsAuthenticated }) => ({ setProfile, setIsAuthenticated }))
  )
  const {
    control,
    handleSubmit,
    clearErrors,
    setError,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(schema),
    mode: 'onBlur',
    reValidateMode: 'onBlur',
    defaultValues: { email: '', password: '' }
  })
  const loginMutation = useMutation({
    mutationFn: async (data: LoginData) => {
      const loginRes = await authApi.login(data)
      const { accessToken, refreshToken } = loginRes.data
      setAccessTokenToLocalStorage(accessToken)
      setRefreshTokenToLocalStorage(refreshToken)
      setIsAuthenticated(true)

      const profileRes = await userApi.getMe()
      setProfile(profileRes.data)
      setProfileToLocalStorage(profileRes.data)

      return loginRes
    }
  })

  const handleLogin = handleSubmit((data) => {
    loginMutation.mutate(data, {
      onSuccess() {
        toast.success('Login successful', { position: 'top-right' })
      },
      onError(error) {
        if (isUnauthorizedError<ErrorResponse<undefined>>(error)) {
          toast.error(error.response?.data.message, { position: 'top-right' })
        }
        if (isUnprocessableEntity<ErrorResponse<FormData>>(error)) {
          const formError = error.response?.data.errors
          if (formError) {
            Object.keys(formError).forEach((key) => {
              setError(key as keyof FormData, {
                message: formError[key as keyof FormData],
                type: 'Server'
              })
            })
          }
        }
      }
    })
  })

  return (
    <Container component="main" maxWidth="xs">
      <Helmet>
        <title>Sign in | Trello</title>
      </Helmet>

      <Box
        sx={{
          pt: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SvgIcon component={trelloLogo} fontSize="large" inheritViewBox color="primary" />
          <Typography component="h1" variant="h4" fontWeight="700">
            Sign in
          </Typography>
        </Box>
        <Box component="form" onSubmit={handleLogin} sx={{ mt: 1 }}>
          <Controller
            control={control}
            name="email"
            render={({ field: { ref, ...rest } }) => (
              <TextField
                error={!!errors.email?.message}
                helperText={capitalizeFirstLetter(errors.email?.message || '')}
                margin="normal"
                fullWidth
                label="Email Address"
                {...rest}
                onChange={(e) => {
                  clearErrors('email')
                  rest.onChange(e)
                }}
                inputRef={ref}
              />
            )}
          />
          <Controller
            control={control}
            name="password"
            render={({ field: { ref, ...rest } }) => (
              <TextField
                error={!!errors.password?.message}
                helperText={capitalizeFirstLetter(errors.password?.message || '')}
                margin="normal"
                fullWidth
                label="Password"
                type="password"
                {...rest}
                onChange={(e) => {
                  clearErrors('password')
                  rest.onChange(e)
                }}
                inputRef={ref}
              />
            )}
          />

          <LoadingButton
            type="submit"
            loading={loginMutation.isPending}
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            SIGN IN
          </LoadingButton>
          <Grid container>
            <Grid item xs sx={{ '& a': { color: 'primary.main' } }}>
              {/* <Link to={path.register}>Forgot password?</Link> */}
            </Grid>
            <Grid item sx={{ '& a': { color: 'primary.main' } }}>
              <Link to={path.register}>Don't have an account? Sign Up</Link>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Container>
  )
}

export default Login

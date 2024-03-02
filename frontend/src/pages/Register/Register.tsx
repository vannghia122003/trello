import { yupResolver } from '@hookform/resolvers/yup'
import LoadingButton from '@mui/lab/LoadingButton'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Grid from '@mui/material/Grid'
import SvgIcon from '@mui/material/SvgIcon'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useMutation } from '@tanstack/react-query'
import omit from 'lodash/omit'
import { Helmet } from 'react-helmet-async'
import { Controller, useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import * as yup from 'yup'
import authApi from '~/api/auth.api'
import trelloLogo from '~/assets/trello.svg?react'
import { ErrorResponse } from '~/types'
import { path } from '~/utils/constants'
import { isUnauthorizedError, isUnprocessableEntity } from '~/utils/error'
import { capitalizeFirstLetter } from '~/utils/helpers'

const schema = yup.object({
  fullName: yup.string().required().min(5).max(30),
  username: yup.string().required().min(2).max(20),
  email: yup.string().email().required(),
  password: yup.string().required().min(6),
  confirmPassword: yup
    .string()
    .required('Confirm password is a required field')
    .min(6)
    .oneOf([yup.ref('password')], 'Confirm password is incorrect')
})

type FormData = yup.InferType<typeof schema>

function Register() {
  const registerMutation = useMutation({ mutationFn: authApi.register })
  const {
    control,
    handleSubmit,
    clearErrors,
    setError,
    reset,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(schema),
    mode: 'onBlur',
    reValidateMode: 'onBlur',
    defaultValues: { fullName: '', username: '', email: '', password: '', confirmPassword: '' }
  })

  const onSubmit = handleSubmit((data) => {
    registerMutation.mutate(omit(data, ['confirmPassword']), {
      onSuccess() {
        reset()
        toast.success('Account registration successful', { position: 'top-right' })
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
        <title>Sign up | Trello</title>
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
            Sign up
          </Typography>
        </Box>
        <Box component="form" onSubmit={onSubmit} sx={{ mt: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Controller
                control={control}
                name="fullName"
                render={({ field: { ref, ...rest } }) => (
                  <TextField
                    error={Boolean(errors.fullName?.message)}
                    helperText={capitalizeFirstLetter(errors.fullName?.message || '')}
                    fullWidth
                    label="Full name"
                    {...rest}
                    onChange={(e) => {
                      clearErrors('fullName')
                      rest.onChange(e)
                    }}
                    inputRef={ref}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                control={control}
                name="username"
                render={({ field: { ref, ...rest } }) => (
                  <TextField
                    error={Boolean(errors.username?.message)}
                    helperText={capitalizeFirstLetter(errors.username?.message || '')}
                    fullWidth
                    label="Username"
                    {...rest}
                    onChange={(e) => {
                      clearErrors('username')
                      rest.onChange(e)
                    }}
                    inputRef={ref}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                control={control}
                name="email"
                render={({ field: { ref, ...rest } }) => (
                  <TextField
                    error={Boolean(errors.email?.message)}
                    helperText={capitalizeFirstLetter(errors.email?.message || '')}
                    fullWidth
                    label="Email"
                    {...rest}
                    onChange={(e) => {
                      clearErrors('email')
                      rest.onChange(e)
                    }}
                    inputRef={ref}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                control={control}
                name="password"
                render={({ field: { ref, ...rest } }) => (
                  <TextField
                    error={Boolean(errors.password?.message)}
                    helperText={capitalizeFirstLetter(errors.password?.message || '')}
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
            </Grid>

            <Grid item xs={12}>
              <Controller
                control={control}
                name="confirmPassword"
                render={({ field: { ref, ...rest } }) => (
                  <TextField
                    error={Boolean(errors.confirmPassword?.message)}
                    helperText={capitalizeFirstLetter(errors.confirmPassword?.message || '')}
                    fullWidth
                    label="Confirm password"
                    type="password"
                    {...rest}
                    onChange={(e) => {
                      clearErrors('confirmPassword')
                      rest.onChange(e)
                    }}
                    inputRef={ref}
                  />
                )}
              />
            </Grid>
          </Grid>
          <LoadingButton
            type="submit"
            loading={registerMutation.isPending}
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            SIGN UP
          </LoadingButton>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', '& a': { color: 'primary.main' } }}>
            <Link to={path.login}>Already have an account? Sign in</Link>
          </Box>
        </Box>
      </Box>
    </Container>
  )
}
export default Register

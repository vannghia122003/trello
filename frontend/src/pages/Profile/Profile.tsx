import { yupResolver } from '@hookform/resolvers/yup'
import LoadingButton from '@mui/lab/LoadingButton'
import TabContext from '@mui/lab/TabContext'
import TabList from '@mui/lab/TabList'
import TabPanel from '@mui/lab/TabPanel'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import Tab from '@mui/material/Tab'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useMutation, useQuery } from '@tanstack/react-query'
import { SyntheticEvent, useEffect, useMemo, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import * as yup from 'yup'
import userApi from '~/api/user.api'
import AppBar from '~/components/AppBar'
import InputFile from '~/components/InputFile'
import useAuthStore from '~/stores/useAuthStore'
import { ErrorResponse } from '~/types'
import { setProfileToLocalStorage } from '~/utils/auth'
import { QUERY_KEYS } from '~/utils/constants'
import { isUnprocessableEntity } from '~/utils/error'
import { capitalizeFirstLetter } from '~/utils/helpers'

enum TabType {
  Profile = 'profile',
  ChangePassword = 'changePassword'
}

const updateProfileSchema = yup.object({
  username: yup.string().required(),
  fullName: yup.string().required(),
  avatar: yup.string().required().url()
})
const changePasswordSchema = yup.object({
  oldPassword: yup.string().required().min(6, 'Old password must be at least 6 characters'),
  newPassword: yup.string().required().min(6, 'New password must be at least 6 characters'),
  confirmNewPassword: yup
    .string()
    .required()
    .min(6, 'Confirm new password must be at least 6 characters')
    .oneOf([yup.ref('newPassword')], 'Confirm password is incorrect')
})
type ProfileData = yup.InferType<typeof updateProfileSchema>
type ChangePasswordData = yup.InferType<typeof changePasswordSchema>

function Profile() {
  const [tab, setTab] = useState<TabType>(TabType.Profile)
  const [file, setFile] = useState<File>()
  const setProfile = useAuthStore((state) => state.setProfile)
  const previewImage = useMemo(() => file && URL.createObjectURL(file), [file])
  const updateMeMutation = useMutation({ mutationFn: userApi.updateMe })
  const uploadImageMutation = useMutation({ mutationFn: userApi.uploadImage })
  const deleteImageMutation = useMutation({ mutationFn: userApi.deleteImage })
  const changePasswordMutation = useMutation({ mutationFn: userApi.changePassword })

  const { data, refetch } = useQuery({ queryKey: [QUERY_KEYS.PROFILE], queryFn: userApi.getMe })
  const updateProfileForm = useForm({
    resolver: yupResolver(updateProfileSchema),
    defaultValues: { fullName: '', username: '' }
  })
  const changePasswordForm = useForm({
    resolver: yupResolver(changePasswordSchema),
    defaultValues: { oldPassword: '', newPassword: '', confirmNewPassword: '' },
    mode: 'onBlur'
  })

  useEffect(() => {
    if (data) {
      updateProfileForm.setValue('username', data.data.username)
      updateProfileForm.setValue('fullName', data.data.fullName)
      updateProfileForm.setValue('avatar', data.data.avatar)
    }
  }, [data, updateProfileForm])

  useEffect(() => {
    return () => {
      previewImage && URL.revokeObjectURL(previewImage)
    }
  }, [previewImage])

  const handleChangeTab = (_e: SyntheticEvent, value: TabType) => setTab(value)

  const handleFileChange = (files?: File[]) => setFile(files?.[0])

  const handleUpdateProfile = updateProfileForm.handleSubmit(async (values) => {
    try {
      if (file) {
        const formData = new FormData()
        const urlId = data?.data.avatar.split('/').pop()?.split('.')[0]
        formData.append('images', file)
        const [uploadImageRes] = await Promise.all([
          uploadImageMutation.mutateAsync(formData),
          deleteImageMutation.mutateAsync(urlId as string)
        ])

        updateProfileForm.setValue('avatar', uploadImageRes.data[0])
      }
      const res = await updateMeMutation.mutateAsync(values)
      refetch()
      setProfile(res.data)
      setProfileToLocalStorage(res.data)
      toast.success('Saved')
    } catch (error) {
      if (isUnprocessableEntity<ErrorResponse<ProfileData>>(error)) {
        const formError = error.response?.data.errors
        if (formError) {
          Object.keys(formError).forEach((key) => {
            updateProfileForm.setError(key as keyof ProfileData, {
              message: formError[key as keyof ProfileData],
              type: 'Server'
            })
          })
        }
      }
    }
  })

  const handleChangePassword = changePasswordForm.handleSubmit((values) => {
    changePasswordMutation.mutate(
      { oldPassword: values.oldPassword, newPassword: values.newPassword },
      {
        onSuccess(data) {
          toast.success(data.message)
          changePasswordForm.reset()
        },
        onError(error) {
          if (isUnprocessableEntity<ErrorResponse<ChangePasswordData>>(error)) {
            const formError = error.response?.data.errors
            if (formError) {
              Object.keys(formError).forEach((key) => {
                changePasswordForm.setError(key as keyof ChangePasswordData, {
                  message: formError[key as keyof ChangePasswordData],
                  type: 'Server'
                })
              })
            }
          }
        }
      }
    )
  })

  return (
    <Container disableGutters maxWidth={false}>
      <Helmet>
        <title>Profile | Trello</title>
      </Helmet>

      <AppBar bgcolor="#1976d2" />
      <Container maxWidth="md" sx={{ py: 2 }}>
        <Box
          component="img"
          src="https://trello.com/assets/eff3d701a9c3a71105ea.svg"
          sx={{ width: '100%', objectFit: 'cover', mb: 2 }}
        />
        <Typography component="h1" fontSize="24px" fontWeight={500} mb={2}>
          Manage your personal information
        </Typography>
        <TabContext value={tab}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <TabList onChange={handleChangeTab}>
              <Tab label="Profile" value={TabType.Profile} />
              <Tab label="Change password" value={TabType.ChangePassword} />
            </TabList>
          </Box>
          <TabPanel value={TabType.Profile}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              divider={<Divider orientation="vertical" flexItem sx={{ order: 2 }} />}
              spacing={2}
              sx={{ alignItems: 'center' }}
            >
              <Box component="form" autoComplete="off" onSubmit={handleUpdateProfile} sx={{ order: 1 }}>
                <Controller
                  control={updateProfileForm.control}
                  name="username"
                  render={({ field: { ref, onChange, ...rest }, formState }) => (
                    <TextField
                      fullWidth
                      size="small"
                      margin="normal"
                      label="Username"
                      error={!!formState.errors.username?.message}
                      helperText={capitalizeFirstLetter(formState.errors.username?.message || '')}
                      {...rest}
                      onChange={(e) => {
                        updateProfileForm.clearErrors('username')
                        onChange(e)
                      }}
                      inputRef={ref}
                    />
                  )}
                />
                <Controller
                  control={updateProfileForm.control}
                  name="fullName"
                  render={({ field: { ref, onChange, ...rest }, formState }) => (
                    <TextField
                      fullWidth
                      size="small"
                      margin="normal"
                      label="Full name"
                      error={!!formState.errors.fullName?.message}
                      helperText={capitalizeFirstLetter(formState.errors.fullName?.message || '')}
                      {...rest}
                      onChange={(e) => {
                        updateProfileForm.clearErrors('fullName')
                        onChange(e)
                      }}
                      inputRef={ref}
                    />
                  )}
                />
                <LoadingButton
                  fullWidth
                  variant="contained"
                  sx={{ mt: 2 }}
                  type="submit"
                  loading={updateMeMutation.isPending || uploadImageMutation.isPending}
                >
                  Save
                </LoadingButton>
              </Box>
              <Box
                sx={{
                  width: '200px',
                  display: 'flex',
                  alignItems: 'center',
                  flexDirection: 'column',
                  gap: 2,
                  order: { xs: 0, sm: 3 }
                }}
              >
                <Box
                  component="img"
                  src={previewImage || data?.data.avatar}
                  sx={{ width: '100px', height: '100px', borderRadius: '50%' }}
                />
                <InputFile variant="outlined" color="primary" onFileChange={handleFileChange}>
                  Select Image
                </InputFile>
              </Box>
            </Stack>
          </TabPanel>
          <TabPanel value={TabType.ChangePassword}>
            <Box component="form" sx={{ width: '400px', maxWidth: '100%' }} onSubmit={handleChangePassword}>
              <Controller
                control={changePasswordForm.control}
                name="oldPassword"
                render={({ field: { ref, onChange, ...rest }, formState }) => (
                  <TextField
                    fullWidth
                    size="small"
                    margin="normal"
                    type="password"
                    label="Old password"
                    error={!!formState.errors.oldPassword?.message}
                    helperText={capitalizeFirstLetter(formState.errors.oldPassword?.message || '')}
                    {...rest}
                    onChange={(e) => {
                      changePasswordForm.clearErrors('oldPassword')
                      onChange(e)
                    }}
                    inputRef={ref}
                  />
                )}
              />
              <Controller
                control={changePasswordForm.control}
                name="newPassword"
                render={({ field: { ref, onChange, ...rest }, formState }) => (
                  <TextField
                    fullWidth
                    size="small"
                    margin="normal"
                    type="password"
                    label="New password"
                    error={!!formState.errors.newPassword?.message}
                    helperText={capitalizeFirstLetter(formState.errors.newPassword?.message || '')}
                    {...rest}
                    onChange={(e) => {
                      changePasswordForm.clearErrors('newPassword')
                      onChange(e)
                    }}
                    inputRef={ref}
                  />
                )}
              />
              <Controller
                control={changePasswordForm.control}
                name="confirmNewPassword"
                render={({ field: { ref, onChange, ...rest }, formState }) => (
                  <TextField
                    fullWidth
                    size="small"
                    margin="normal"
                    type="password"
                    label="Confirm new password"
                    error={!!formState.errors.confirmNewPassword?.message}
                    helperText={capitalizeFirstLetter(formState.errors.confirmNewPassword?.message || '')}
                    {...rest}
                    onChange={(e) => {
                      changePasswordForm.clearErrors('confirmNewPassword')
                      onChange(e)
                    }}
                    inputRef={ref}
                  />
                )}
              />
              <LoadingButton
                variant="contained"
                type="submit"
                fullWidth
                sx={{ mt: 2 }}
                loading={changePasswordMutation.isPending}
              >
                Change Password
              </LoadingButton>
            </Box>
          </TabPanel>
        </TabContext>
      </Container>
    </Container>
  )
}
export default Profile

import { yupResolver } from '@hookform/resolvers/yup'
import CheckIcon from '@mui/icons-material/Check'
import LoadingButton from '@mui/lab/LoadingButton'
import Box from '@mui/material/Box'
import FormControl from '@mui/material/FormControl'
import Grid from '@mui/material/Grid'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import TextField from '@mui/material/TextField'
import { useMutation } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import * as yup from 'yup'
import boardApi from '~/api/board.api'
import board from '~/assets/board.svg'
import { useBackground } from '~/hooks'
import { Background, Visibility } from '~/types'
import { capitalizeFirstLetter } from '~/utils/helpers'
import PopoverHeader from '../PopoverHeader'

interface Props {
  onClose: () => void
}
const schema = yup.object({
  backgroundId: yup.string().required(),
  title: yup.string().required().max(50),
  visibility: yup.string().oneOf(Object.values(Visibility)).required()
})

function CreateForm({ onClose }: Props) {
  const navigate = useNavigate()
  const { data } = useBackground({ staleTime: 10 * 60 * 1000 })
  const createBoardMutation = useMutation({ mutationFn: boardApi.createBoard })
  const backgrounds = data?.data
  const {
    control,
    setValue,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(schema),
    mode: 'onBlur',
    reValidateMode: 'onBlur',
    defaultValues: {
      title: '',
      visibility: Visibility.Private
    }
  })
  const [activeBackground, setActiveBackground] = useState<Background>()

  useEffect(() => {
    if (backgrounds) {
      setValue('backgroundId', backgrounds[0]._id)
      setActiveBackground(backgrounds[0])
    }
  }, [backgrounds, setValue])

  const handleChangeBackground = (backgroundId: string) => {
    setValue('backgroundId', backgroundId)
    setActiveBackground(backgrounds?.find((bg) => bg._id === backgroundId))
  }

  const onSubmit = handleSubmit((data) => {
    createBoardMutation.mutate(data, {
      onSuccess(data) {
        navigate(`/boards/${data.data._id}`)
      }
    })
  })

  return (
    <>
      <Box sx={{ width: '304px' }}>
        <PopoverHeader title="Create board" onClose={onClose} />
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            mb: 2,
            '& img': { width: '200px', height: '120px' }
          }}
        >
          <Box
            sx={{
              backgroundImage: `url(${activeBackground?.image})`,
              borderRadius: 1,
              px: 1
            }}
          >
            <Box component="img" src={board} />
          </Box>
        </Box>
        <Box
          sx={{ px: 2, pb: 2, display: 'flex', flexDirection: 'column', gap: 1 }}
          component="form"
          onSubmit={onSubmit}
        >
          <FormControl fullWidth>
            <Box component="label" fontWeight="500" fontSize="12px" marginBottom="2px">
              Background
            </Box>
            <Grid container spacing={1} columns={5}>
              {backgrounds?.map((bg) => (
                <Grid item key={bg._id}>
                  <Box
                    onClick={() => handleChangeBackground(bg._id)}
                    sx={{
                      backgroundImage: `url(${bg.image})`,
                      bgcolor: bg.color,
                      width: '48px',
                      height: '32px',
                      borderRadius: 1,
                      cursor: 'pointer',
                      position: 'relative'
                    }}
                  >
                    <Box
                      sx={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        '&:hover': { bgcolor: '#091E4224' }
                      }}
                    >
                      {bg._id === activeBackground?._id && <CheckIcon fontSize="small" sx={{ color: 'white' }} />}
                    </Box>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </FormControl>
          <FormControl fullWidth>
            <Box component="label" fontWeight="500" fontSize="12px" marginBottom="2px">
              Board title
            </Box>
            <Controller
              control={control}
              name="title"
              render={({ field: { ref, ...rest } }) => (
                <TextField
                  error={!!errors.title?.message}
                  helperText={capitalizeFirstLetter(errors.title?.message || '')}
                  size="small"
                  {...rest}
                  inputRef={ref}
                />
              )}
            />
          </FormControl>
          <FormControl fullWidth>
            <Box component="label" fontWeight="500" fontSize="12px" marginBottom="2px">
              Visibility
            </Box>
            <Controller
              control={control}
              name="visibility"
              render={({ field }) => (
                <Select size="small" {...field}>
                  <MenuItem value={Visibility.Private}>Private</MenuItem>
                  <MenuItem value={Visibility.Public}>Public</MenuItem>
                </Select>
              )}
            />
          </FormControl>
          <LoadingButton type="submit" loading={createBoardMutation.isPending} variant="contained" sx={{ mt: 1 }}>
            Create
          </LoadingButton>
        </Box>
      </Box>
    </>
  )
}
export default CreateForm

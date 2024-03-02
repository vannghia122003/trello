import { yupResolver } from '@hookform/resolvers/yup'
import LoadingButton from '@mui/lab/LoadingButton'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import FormControl from '@mui/material/FormControl'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { grey } from '@mui/material/colors'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Icons, toast } from 'react-toastify'
import * as yup from 'yup'
import cardApi from '~/api/card.api'
import userApi from '~/api/user.api'
import InputFile from '~/components/InputFile'
import PopoverHeader from '~/components/PopoverHeader'
import { AttachmentType, CreateAttachmentData } from '~/types'
import { QUERY_KEYS } from '~/utils/constants'
import { capitalizeFirstLetter } from '~/utils/helpers'

interface Props {
  cardId: string
  onClose: () => void
}

const schema = yup.object({
  url: yup.string().url().required(),
  name: yup.string().default('')
})

function AttachmentPopover({ cardId, onClose }: Props) {
  const queryClient = useQueryClient()
  const {
    control,
    setFocus,
    handleSubmit,
    clearErrors,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(schema),
    reValidateMode: 'onSubmit',
    defaultValues: { name: '', url: '' }
  })
  const createAttachmentMutation = useMutation({ mutationFn: cardApi.createAttachment })
  const uploadImageMutation = useMutation({ mutationFn: userApi.uploadImage })

  useEffect(() => setFocus('url'), [setFocus])

  const handleCreateAttachment = handleSubmit((values) => {
    const data: CreateAttachmentData = { ...values, type: AttachmentType.Link }
    createAttachmentMutation.mutate(
      { cardId, data },
      {
        onSuccess() {
          Promise.all([
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CARD, cardId] }),
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ATTACHMENTS, cardId] }),
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.BOARD] })
          ])
          onClose()
        }
      }
    )
  })

  const handleUploadFile = async (fileList?: File[]) => {
    onClose()
    const file = fileList?.[0]
    if (file) {
      try {
        const formData = new FormData()
        formData.append('images', file)
        toast('Uploading file...', {
          toastId: 'attachment',
          autoClose: false,
          icon: <Icons.spinner />
        })
        const uploadRes = await uploadImageMutation.mutateAsync(formData)
        const data: CreateAttachmentData = { name: file.name, type: AttachmentType.Image, url: uploadRes.data[0] }
        await createAttachmentMutation.mutateAsync({ cardId, data })
        toast.update('attachment', {
          autoClose: 4000,
          render: 'Success',
          type: 'success',
          icon: <Icons.success theme="light" type="success" />
        })

        await Promise.all([
          queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CARD, cardId] }),
          queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ATTACHMENTS, cardId] }),
          queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.BOARD] })
        ])
      } catch (error) {
        toast.dismiss('attachment')
      }
    }
  }

  return (
    <Box sx={{ width: '304px' }}>
      <PopoverHeader title="Attach" onClose={onClose} />
      <Box sx={{ p: 1.5 }} component="form" onSubmit={handleCreateAttachment} autoComplete="off">
        <Box>
          <Typography fontWeight="500" fontSize="12px" marginBottom="4px">
            Attach a file from your computer
          </Typography>
          <InputFile
            onFileChange={handleUploadFile}
            fullWidth
            sx={{ backgroundColor: grey[200], color: 'black', '&:hover': { backgroundColor: grey[300] } }}
          >
            Choose a file
          </InputFile>
        </Box>
        <Divider sx={{ mb: 1.5, mt: 2 }} />
        <FormControl fullWidth sx={{ mb: 0.5 }}>
          <Box mb="2px">
            <Box component="label" htmlFor="url" fontWeight="500" fontSize="12px">
              Search or paste a link
            </Box>
          </Box>
          <Controller
            control={control}
            name="url"
            render={({ field: { ref, ...rest } }) => (
              <TextField
                id="url"
                size="small"
                placeholder="Find recent links or paste a new link"
                error={!!errors.url?.message}
                helperText={capitalizeFirstLetter(errors.url?.message || '')}
                {...rest}
                onChange={(e) => {
                  clearErrors('url')
                  rest.onChange(e)
                }}
                inputRef={ref}
              />
            )}
          />
        </FormControl>
        <FormControl fullWidth>
          <Box mb="2px">
            <Box component="label" htmlFor="name" fontWeight="500" fontSize="12px">
              Display text (optional)
            </Box>
          </Box>
          <Controller
            control={control}
            name="name"
            render={({ field: { ref, ...rest } }) => (
              <TextField
                id="name"
                size="small"
                placeholder="Text to display"
                error={!!errors.name?.message}
                helperText={capitalizeFirstLetter(errors.name?.message || '')}
                {...rest}
                inputRef={ref}
              />
            )}
          />
        </FormControl>
        <Box sx={{ display: 'flex', justifyContent: 'end', gap: 1, mt: 2 }}>
          <Button variant="text" type="button" sx={{ color: grey[900] }} onClick={onClose}>
            Cancel
          </Button>
          <LoadingButton variant="contained" type="submit" loading={createAttachmentMutation.isPending}>
            Insert
          </LoadingButton>
        </Box>
      </Box>
    </Box>
  )
}
export default AttachmentPopover

import { yupResolver } from '@hookform/resolvers/yup'
import AttachmentIcon from '@mui/icons-material/Attachment'
import ImageIcon from '@mui/icons-material/Image'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import FormControl from '@mui/material/FormControl'
import Link from '@mui/material/Link'
import Popover from '@mui/material/Popover'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { grey } from '@mui/material/colors'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useConfirm } from 'material-ui-confirm'
import { MouseEvent, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import * as yup from 'yup'
import cardApi from '~/api/card.api'
import userApi from '~/api/user.api'
import { ButtonGray } from '~/components/Button'
import PopoverHeader from '~/components/PopoverHeader'
import { useUpdateCard } from '~/hooks'
import useBoardStore from '~/stores/useBoardStore'
import { AttachmentType, Attachment as IAttachment } from '~/types'
import { QUERY_KEYS } from '~/utils/constants'
import { capitalizeFirstLetter, formatDateString } from '~/utils/helpers'

interface Props {
  cardId: string
  coverImage: string
  openPopoverAttach: (event: MouseEvent<HTMLButtonElement>) => void
}
const schema = yup.object({
  url: yup.string().url().required(),
  name: yup.string().required()
})

function Attachments({ cardId, coverImage, openPopoverAttach }: Props) {
  const confirm = useConfirm()
  const queryClient = useQueryClient()
  const isBoardMember = useBoardStore((state) => state.isBoardMember)
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null)
  const [currentAttachment, setCurrentAttachment] = useState<IAttachment | null>(null)
  const deleteImageMutation = useMutation({ mutationFn: userApi.deleteImage })
  const updateCardMutation = useUpdateCard(cardId)
  const updateAttachmentMutation = useMutation({ mutationFn: cardApi.updateAttachment })
  const deleteAttachmentMutation = useMutation({ mutationFn: cardApi.deleteAttachment })

  const { data, refetch } = useQuery({
    queryKey: [QUERY_KEYS.ATTACHMENTS, cardId],
    queryFn: () => cardApi.getAttachments(cardId),
    staleTime: 10 * 60 * 1000
  })
  const {
    control,
    handleSubmit,
    clearErrors,
    setValue,
    setFocus,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(schema),
    reValidateMode: 'onSubmit',
    defaultValues: { name: '', url: '' }
  })
  const attachments = data?.data || []

  if (attachments.length === 0) return null

  const handleOpenPopoverEdit = (attachment: IAttachment) => (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    setAnchorEl(e.currentTarget)
    setCurrentAttachment(attachment)
    setValue('url', attachment.url)
    setValue('name', attachment.name)
    setTimeout(() => setFocus('name'), 0)
  }

  const handleClosePopoverEdit = () => {
    setAnchorEl(null)
    clearErrors()
  }

  const handleUpdateAttachment = handleSubmit((data) => {
    handleClosePopoverEdit()
    updateAttachmentMutation.mutate(
      { cardId, attachmentId: currentAttachment?._id as string, data },
      { onSuccess: () => refetch() }
    )
  })

  const handleDeleteAttachment = (attachment: IAttachment) => (e: MouseEvent<HTMLSpanElement>) => {
    e.stopPropagation()
    confirm({
      title: 'Delete attachment?',
      description: 'Deleting an attachment is permanent. There is no undo.',
      confirmationText: 'Delete'
    })
      .then(async () => {
        if (attachment.type === AttachmentType.Image) {
          const urlId = attachment.url.split('/').pop()?.split('.')[0]
          urlId && deleteImageMutation.mutate(urlId)
        }
        await deleteAttachmentMutation.mutateAsync({ cardId, attachmentId: attachment._id })
        if (attachment.url === coverImage) {
          await updateCardMutation.mutateAsync({ cardId, data: { cover: '' } })
        }
        await Promise.all([
          refetch(),
          queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CARD, cardId] }),
          queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.BOARD] })
        ])
      })
      .catch(() => {})
  }

  const handleMakeCover = (backgroundUrl: string) => (e: MouseEvent<HTMLSpanElement>) => {
    e.stopPropagation()
    updateCardMutation.mutate({ cardId, data: { cover: backgroundUrl } })
  }

  const handleRemoveCover = (e: MouseEvent<HTMLSpanElement>) => {
    e.stopPropagation()
    updateCardMutation.mutate({ cardId, data: { cover: '' } })
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AttachmentIcon />
          <Typography variant="h3" fontSize="16px" fontWeight="500">
            Attachments
          </Typography>
        </Box>
        {isBoardMember && (
          <ButtonGray size="small" onClick={openPopoverAttach}>
            Add
          </ButtonGray>
        )}
      </Box>

      <Box
        sx={(theme) => ({
          ml: 4,
          [theme.breakpoints.down('sm')]: {
            ml: 0
          },
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          cursor: 'pointer'
        })}
      >
        {attachments.map((attachment) => (
          <Box
            key={attachment._id}
            sx={{
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              '&:hover': { bgcolor: grey[300] }
            }}
          >
            <Box sx={{ color: '#172B4D', flexBasis: '20%', height: '90px' }}>
              <Link
                href={attachment.url}
                target="_blank"
                sx={{
                  width: '90px',
                  bgcolor: '#B6B6B4',
                  height: '100%',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderRadius: '4px',
                  color: 'black',
                  boxShadow: 1
                }}
              >
                {attachment.type === AttachmentType.Link && <AttachmentIcon />}
                {attachment.type === AttachmentType.Image && (
                  <Box
                    component="img"
                    sx={{ width: '100%', borderRadius: '4px', objectFit: 'cover', height: '100%' }}
                    src={attachment.url}
                    alt={attachment.name}
                  />
                )}
              </Link>
            </Box>
            <Box sx={{ flexBasis: '80%', width: '80%' }} onClick={() => window.open(attachment.url, '_blank')}>
              <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ p: 1 }}>
                  <Typography
                    sx={{
                      fontSize: '14px',
                      fontWeight: 700,
                      textDecoration: 'none',
                      display: '-webkit-box',
                      WebkitBoxOrient: 'vertical',
                      WebkitLineClamp: { xs: 1, sm: 2 },
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      wordBreak: 'break-word'
                    }}
                  >
                    {attachment.name}
                  </Typography>
                  <Box
                    sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', color: grey[600], fontSize: '14px' }}
                  >
                    <Typography sx={{ fontSize: 'inherit' }}>Added {formatDateString(attachment.createdAt)}</Typography>
                    {isBoardMember && (
                      <>
                        <Box component="span" sx={{ mx: 0.5 }}>
                          •
                        </Box>
                        <Typography
                          sx={{ textDecoration: 'underline', cursor: 'pointer', fontSize: 'inherit' }}
                          onClick={handleDeleteAttachment(attachment)}
                        >
                          Delete
                        </Typography>
                        <Box component="span" sx={{ mx: 0.5 }}>
                          •
                        </Box>
                        <Typography
                          sx={{ textDecoration: 'underline', cursor: 'pointer', fontSize: 'inherit' }}
                          onClick={handleOpenPopoverEdit(attachment)}
                        >
                          Edit
                        </Typography>
                      </>
                    )}
                  </Box>
                  {isBoardMember && attachment.type === AttachmentType.Image && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5, color: grey[600] }}>
                      <ImageIcon sx={{ fontSize: '16px' }} />
                      {coverImage !== attachment.url && (
                        <Typography
                          sx={{ fontSize: '14px', textDecoration: 'underline', px: 0.5 }}
                          onClick={handleMakeCover(attachment.url)}
                        >
                          Make cover
                        </Typography>
                      )}
                      {coverImage === attachment.url && (
                        <Typography
                          sx={{ fontSize: '14px', textDecoration: 'underline', px: 0.5 }}
                          onClick={handleRemoveCover}
                        >
                          Remove cover
                        </Typography>
                      )}
                    </Box>
                  )}
                </Box>
              </Box>
            </Box>
          </Box>
        ))}
      </Box>
      <Popover
        open={!!anchorEl}
        anchorEl={anchorEl}
        onClose={handleClosePopoverEdit}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Box sx={{ width: '304px' }}>
          <PopoverHeader title="Edit attachment" onClose={handleClosePopoverEdit} />
          <Box sx={{ p: 1.5 }} component="form" autoComplete="off" onSubmit={handleUpdateAttachment}>
            {currentAttachment?.type !== AttachmentType.Image && (
              <FormControl fullWidth sx={{ mb: 1 }}>
                <Box mb="2px">
                  <Box component="label" htmlFor="url" fontWeight="500" fontSize="12px">
                    Link
                  </Box>
                </Box>
                <Controller
                  control={control}
                  name="url"
                  render={({ field: { ref, ...rest } }) => (
                    <TextField
                      id="url"
                      size="small"
                      placeholder="Text to display"
                      error={!!errors.url?.message}
                      helperText={capitalizeFirstLetter(errors.url?.message || '')}
                      {...rest}
                      inputRef={ref}
                    />
                  )}
                />
              </FormControl>
            )}

            <FormControl fullWidth sx={{ mb: 1 }}>
              <Box mb="2px">
                <Box component="label" htmlFor="name" fontWeight="500" fontSize="12px">
                  Link name
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
            <Button variant="contained" type="submit" sx={{ mt: 1 }}>
              Update
            </Button>
          </Box>
        </Box>
      </Popover>
    </Box>
  )
}
export default Attachments

import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import AttachmentIcon from '@mui/icons-material/Attachment'
import CheckBoxOutlinedIcon from '@mui/icons-material/CheckBoxOutlined'
import CloseIcon from '@mui/icons-material/Close'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import CreditCardIcon from '@mui/icons-material/CreditCard'
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined'
import LabelOutlinedIcon from '@mui/icons-material/LabelOutlined'
import PersonOutlineIcon from '@mui/icons-material/PersonOutline'
import RemoveIcon from '@mui/icons-material/Remove'
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined'
import Box from '@mui/material/Box'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'
import Popover from '@mui/material/Popover'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { MouseEvent, useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import cardApi from '~/api/card.api'
import { ButtonGray } from '~/components/Button'
import { useUpdateCard } from '~/hooks'
import useBoardStore from '~/stores/useBoardStore'
import { QUERY_KEYS } from '~/utils/constants'
import AddMember from './AddMember'
import Attachments from './Attachments'
import Comments from './Comments'
import CreateAttachment from './CreateAttachment'
import CreateCover from './CreateCover'
import Description from './Description'
import Labels from './Labels'
import LabelsPopover from './LabelsPopover'
import Members from './Members'

interface Props {
  cardId: string
  open: boolean
  onClose: () => void
}

function CardModal({ open, onClose, cardId }: Props) {
  const queryClient = useQueryClient()
  const isBoardMember = useBoardStore((state) => state.isBoardMember)
  const [anchorAttachmentEl, setAnchorAttachmentEl] = useState<null | HTMLElement>(null)
  const [anchorCoverEl, setAnchorCoverEl] = useState<null | HTMLElement>(null)
  const [anchorAddMemberEl, setAnchorAddMemberEl] = useState<null | HTMLElement>(null)
  const [anchorLabelsEl, setAnchorLabelsEl] = useState<null | HTMLElement>(null)
  const updateCardMutation = useUpdateCard(cardId)
  const deleteCardMutation = useMutation({ mutationFn: cardApi.deleteCard })

  const { data } = useQuery({
    queryKey: [QUERY_KEYS.CARD, cardId],
    queryFn: () => cardApi.getCardDetail(cardId),
    enabled: open
    // staleTime: 10 * 60 * 1000
  })
  const card = data?.data

  const { control, setValue, handleSubmit } = useForm({ defaultValues: { title: '' } })

  useEffect(() => {
    if (card) setValue('title', card.title)
  }, [card, setValue])

  const handleOpenAttachmentPopover = (e: MouseEvent<HTMLButtonElement>) => setAnchorAttachmentEl(e.currentTarget)
  const handleCloseAttachmentPopover = () => setAnchorAttachmentEl(null)

  const handleOpenCoverPopover = (e: MouseEvent<HTMLButtonElement>) => setAnchorCoverEl(e.currentTarget)
  const handleCloseCoverPopover = () => setAnchorCoverEl(null)

  const handleOpenAddMemberPopover = (e: MouseEvent<HTMLButtonElement>) => setAnchorAddMemberEl(e.currentTarget)
  const handleCloseAddMemberPopover = () => setAnchorAddMemberEl(null)

  const handleOpenLabelsPopover = (e: MouseEvent<HTMLButtonElement>) => setAnchorLabelsEl(e.currentTarget)
  const handleCloseLabelsPopover = () => setAnchorLabelsEl(null)

  if (!card) return null

  const handleUpdateTitle = handleSubmit(({ title }) => {
    if (!title) {
      setValue('title', card.title)
      return
    }
    if (title !== card.title) {
      setValue('title', title)
      updateCardMutation.mutate(
        { cardId: card._id, data: { title } },
        {
          onSuccess() {
            Promise.all([
              queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.BOARD] }),
              queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CARD, card._id] })
            ])
          }
        }
      )
    }
  })

  const handleDeleteCard = () => {
    deleteCardMutation.mutate(
      { cardId, params: { deleteType: 'soft' } },
      {
        onSuccess() {
          Promise.all([
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.BOARD] }),
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CLOSED_CARDS] })
          ])
        }
      }
    )
  }

  const options = {
    'Add to card': [
      { label: 'Members', Icon: PersonOutlineIcon, onClick: handleOpenAddMemberPopover, hidden: isBoardMember },
      { label: 'Labels', Icon: LabelOutlinedIcon, onClick: handleOpenLabelsPopover, hidden: isBoardMember },
      { label: 'Checklist', Icon: CheckBoxOutlinedIcon, onClick: () => {}, hidden: isBoardMember },
      { label: 'Dates', Icon: AccessTimeOutlinedIcon, onClick: () => {}, hidden: isBoardMember },
      { label: 'Attachment', Icon: AttachmentIcon, onClick: handleOpenAttachmentPopover, hidden: isBoardMember },
      { label: 'Cover', Icon: ImageOutlinedIcon, onClick: handleOpenCoverPopover, hidden: isBoardMember }
    ],
    Actions: [
      { label: 'Move', Icon: ArrowForwardIcon, onClick: () => {}, hidden: isBoardMember },
      { label: 'Copy', Icon: ContentCopyIcon, onClick: () => {}, hidden: isBoardMember },
      { label: 'Delete', Icon: RemoveIcon, onClick: handleDeleteCard, hidden: isBoardMember },
      { label: 'Share', Icon: ShareOutlinedIcon, onClick: () => {}, hidden: true }
    ]
  }

  const handleAddDescription = (description: string) => {
    updateCardMutation.mutate({ cardId: card._id, data: { description } })
  }

  return (
    <Dialog
      onClose={onClose}
      open={open}
      disableRestoreFocus
      fullWidth
      maxWidth="md"
      sx={{ '& .MuiPaper-root': { bgcolor: '#F1F2F4' } }}
    >
      <Box sx={{ position: 'relative' }}>
        <IconButton onClick={onClose} sx={{ ml: 4, position: 'absolute', top: 3, right: 3 }}>
          <CloseIcon />
        </IconButton>
        {card.cover && (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              backgroundImage: 'linear-gradient(0, #bdc3c7, #2c3e50)'
            }}
          >
            <Box component="img" src={card.cover} sx={{ height: '160px', objectFit: 'cover' }} />
          </Box>
        )}
        <DialogTitle sx={{ m: 0, px: 2.5, py: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <CreditCardIcon />
            <Controller
              control={control}
              name="title"
              render={({ field }) => (
                <TextField
                  disabled={!isBoardMember}
                  sx={{
                    ml: 0.5,
                    '& .MuiOutlinedInput-root.Mui-disabled': { color: 'inherit' },
                    '& .Mui-disabled': { WebkitTextFillColor: 'inherit' },
                    '& .MuiOutlinedInput-root': {
                      '& input': { fontSize: '20px', fontWeight: 500, px: 1, py: 0.5 },
                      '& fieldset': { borderWidth: '0!important' },
                      '&.Mui-focused fieldset': { borderWidth: '2px!important' },
                      '&:has(.MuiInputBase-input:focus)': {
                        backgroundColor: (theme) => theme.palette.background.paper,
                        backgroundImage: 'linear-gradient(rgba(255 255 255 / 0.05), rgba(255 255 255 / 0.05))'
                      }
                    },
                    mr: 3
                  }}
                  fullWidth
                  size="small"
                  {...field}
                  onBlur={handleUpdateTitle}
                />
              )}
            />
          </Box>
        </DialogTitle>
        <DialogContent sx={{ px: { xs: 2.5, md: 2 } }}>
          <Grid container spacing={4}>
            <Grid item xs={12} md={9}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Members members={card.members} />
                <Labels labels={card.labels} />
                <Description description={card.description} addDescription={handleAddDescription} />
                <Attachments
                  cardId={card._id}
                  coverImage={card.cover}
                  openPopoverAttach={handleOpenAttachmentPopover}
                />
                <Comments cardId={card._id} />
              </Box>
            </Grid>

            <Grid item xs={12} md={3}>
              {Object.entries(options).map(
                ([key, value]) =>
                  value.filter((item) => item.hidden).length > 0 && (
                    <Box key={key} sx={{ mb: 3, '&:last-child': { mb: 0 } }}>
                      <Typography variant="h3" sx={{ fontSize: '12px', fontWeight: 600, mb: 1 }}>
                        {key}
                      </Typography>
                      <Grid container spacing={1}>
                        {value.map(
                          ({ label, Icon, onClick, hidden }) =>
                            hidden && (
                              <Grid key={label} item xs={6} sm={4} md={12}>
                                <ButtonGray
                                  fullWidth
                                  startIcon={<Icon />}
                                  sx={{
                                    justifyContent: 'flex-start',
                                    px: 2,
                                    fontSize: '14px',
                                    '& .MuiButton-startIcon': { mr: 0.5 }
                                  }}
                                  onClick={onClick}
                                >
                                  {label}
                                </ButtonGray>
                              </Grid>
                            )
                        )}
                      </Grid>
                    </Box>
                  )
              )}
            </Grid>
          </Grid>
        </DialogContent>

        <Popover
          open={!!anchorAttachmentEl}
          anchorEl={anchorAttachmentEl}
          onClose={handleCloseAttachmentPopover}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          transformOrigin={{ vertical: 'center', horizontal: 'center' }}
          children={<CreateAttachment cardId={card._id} onClose={handleCloseAttachmentPopover} />}
        />
        <Popover
          open={!!anchorCoverEl}
          anchorEl={anchorCoverEl}
          onClose={handleCloseCoverPopover}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          transformOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          children={<CreateCover cardId={card._id} coverImage={card.cover} onClose={handleCloseCoverPopover} />}
        />
        <Popover
          open={!!anchorAddMemberEl}
          anchorEl={anchorAddMemberEl}
          onClose={handleCloseAddMemberPopover}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          transformOrigin={{ vertical: 'top', horizontal: 'left' }}
          children={<AddMember cardId={card._id} cardMembers={card.members} onClose={handleCloseAddMemberPopover} />}
        />
        <Popover
          open={!!anchorLabelsEl}
          anchorEl={anchorLabelsEl}
          onClose={handleCloseLabelsPopover}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          transformOrigin={{ vertical: 'top', horizontal: 'left' }}
          children={<LabelsPopover cardId={card._id} cardLabels={card.labels} onClose={handleCloseLabelsPopover} />}
        />
      </Box>
    </Dialog>
  )
}

export default CardModal

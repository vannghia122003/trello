import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import AttachmentIcon from '@mui/icons-material/Attachment'
import CommentIcon from '@mui/icons-material/Comment'
import GroupIcon from '@mui/icons-material/Group'
import SubjectIcon from '@mui/icons-material/Subject'
import Box from '@mui/material/Box'
import MuiCard from '@mui/material/Card'
import CardActions from '@mui/material/CardActions'
import CardContent from '@mui/material/CardContent'
import CardMedia from '@mui/material/CardMedia'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { useState } from 'react'
import useBoardStore from '~/stores/useBoardStore'
import { Card as CardType } from '~/types'
import CardModal from '../CardModal'

interface Props {
  card: CardType
}

function Card({ card }: Props) {
  const { memberIds, comments, attachments, description, labels } = card

  const [openModal, setOpenModal] = useState(false)
  const isBoardMember = useBoardStore((state) => state.isBoardMember)
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card._id,
    data: card,
    disabled: openModal || !isBoardMember
  })
  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? '0.5' : undefined
  }
  const showCardActions = !!(memberIds.length || comments.length || attachments.length || description)

  const handleOpenModal = () => setOpenModal(true)
  const handleCloseModal = () => {
    setOpenModal(false)
  }

  return (
    <>
      <MuiCard
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        onClick={handleOpenModal}
        sx={{
          position: 'relative',
          cursor: 'pointer',
          boxShadow: '0px 1px 1px #091E4240',
          overflow: 'unset',
          display: card.FE_PlaceholderCard ? 'none' : 'block'
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            borderRadius: '4px',
            border: '2px solid transparent',
            borderColor: (theme) => (isDragging ? theme.palette.primary.main : 'transparent'),
            '&:hover': { borderColor: 'primary.main' }
          }}
        />
        {card.cover && (
          <CardMedia sx={{ height: 240, borderTopLeftRadius: '4px', borderTopRightRadius: '4px' }} image={card.cover} />
        )}

        <CardContent sx={{ px: 1.5, pb: 1, pt: 1.5, '&:last-child': { p: 1.5 } }}>
          <Box sx={{ mb: 0.5, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
            {labels.map((label) => (
              <Box
                key={label._id}
                sx={{ minWidth: '40px', maxWidth: '40px', height: '8px', bgcolor: label.hex, borderRadius: 1 }}
              />
            ))}
          </Box>
          <Typography>{card.title}</Typography>
        </CardContent>

        {showCardActions && (
          <CardActions sx={{ p: '0 4px 8px 4px' }} disableSpacing>
            {description && (
              <Tooltip title="This card has a description.">
                <IconButton disableRipple color="primary" sx={{ py: 0 }}>
                  <SubjectIcon sx={{ fontSize: '18px' }} />
                </IconButton>
              </Tooltip>
            )}

            {!!memberIds.length && (
              <Tooltip title="Members">
                <IconButton disableRipple color="primary" sx={{ py: 0 }}>
                  <GroupIcon sx={{ fontSize: '18px', mr: 0.5 }} />
                  <Typography variant="caption">{memberIds.length}</Typography>
                </IconButton>
              </Tooltip>
            )}

            {!!comments.length && (
              <Tooltip title="Comments">
                <IconButton disableRipple color="primary" sx={{ py: 0 }}>
                  <CommentIcon sx={{ fontSize: '18px', mr: 0.5 }} />
                  <Typography variant="caption">{comments.length}</Typography>
                </IconButton>
              </Tooltip>
            )}

            {!!attachments.length && (
              <Tooltip title="Attachments">
                <IconButton disableRipple color="primary" sx={{ py: 0 }}>
                  <AttachmentIcon sx={{ fontSize: '18px', mr: 0.5 }} />
                  <Typography variant="caption">{attachments.length}</Typography>
                </IconButton>
              </Tooltip>
            )}
          </CardActions>
        )}
      </MuiCard>
      <CardModal cardId={card._id} open={openModal} onClose={handleCloseModal} />
    </>
  )
}
export default Card

import CloseIcon from '@mui/icons-material/Close'
import CreditCardIcon from '@mui/icons-material/CreditCard'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import Typography from '@mui/material/Typography'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useConfirm } from 'material-ui-confirm'
import { toast } from 'react-toastify'
import boardApi from '~/api/board.api'
import useAuthStore from '~/stores/useAuthStore'
import { Board, BoardStatus } from '~/types'
import { QUERY_KEYS } from '~/utils/constants'

interface Props {
  open: boolean
  onClose: () => void
  boards: Board[]
}

function ClosedBoardDialog({ open, onClose, boards }: Props) {
  const confirm = useConfirm()
  const queryClient = useQueryClient()
  const profile = useAuthStore((state) => state.profile)
  const deleteBoardMutation = useMutation({ mutationFn: boardApi.deleteBoard })
  const reopenBoardMutation = useMutation({ mutationFn: boardApi.reopenBoard })

  const handleDeleteBoard = (boardId: string) => {
    confirm({
      title: 'Delete board?',
      description:
        'All lists, cards and actions will be deleted, and you won’t be able to re-open the board. There is no undo.',
      confirmationText: 'Delete'
    })
      .then(() => {
        deleteBoardMutation.mutate(
          { boardId, params: { deleteType: 'hard' } },
          {
            onSuccess() {
              queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.BOARD_LIST, BoardStatus.Closed] })
              toast.success('Board deleted')
            }
          }
        )
      })
      .catch(() => {})
  }

  const handleReopenBoard = (boardId: string) => {
    reopenBoardMutation.mutate(boardId, {
      onSuccess() {
        Promise.all([
          queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.BOARD_LIST, BoardStatus.Closed] }),
          queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.BOARD_LIST, BoardStatus.Open] })
        ])
      }
    })
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth sx={{ '& .MuiPaper-root': { p: 2 } }}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 0, pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CreditCardIcon />
          <Typography fontWeight="500" fontSize="20px">
            Closed boards
          </Typography>
        </Box>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      {boards.length > 0 && (
        <List sx={{ pt: 0 }}>
          {boards.map((board) => (
            <Box key={board._id}>
              <ListItem sx={{ px: 0 }}>
                <ListItemText
                  primary={board.title}
                  primaryTypographyProps={{ overflow: 'hidden', textOverflow: 'ellipsis' }}
                  secondary={
                    profile?._id !== board.ownerId
                      ? 'You were not an admin on this board, so you cannot reopen it.'
                      : null
                  }
                  secondaryTypographyProps={{ fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis' }}
                />
                {profile?._id === board.ownerId && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Button
                      size="small"
                      color="error"
                      variant="outlined"
                      startIcon={<CloseIcon />}
                      onClick={() => handleDeleteBoard(board._id)}
                    >
                      Delete
                    </Button>
                    <Button size="small" variant="contained" onClick={() => handleReopenBoard(board._id)}>
                      Reopen
                    </Button>
                  </Box>
                )}
                {profile?._id !== board.ownerId && (
                  <Button size="small" color="error" variant="contained" startIcon={<CloseIcon />}>
                    Leave
                  </Button>
                )}
              </ListItem>
              <Divider />
            </Box>
          ))}
        </List>
      )}
      {!boards.length && (
        <Typography align="center" sx={{ bgcolor: '#091E420F', px: 1, py: 4 }}>
          No boards have been closed
        </Typography>
      )}
    </Dialog>
  )
}
export default ClosedBoardDialog

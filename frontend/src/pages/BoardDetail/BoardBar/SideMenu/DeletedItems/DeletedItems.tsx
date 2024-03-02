import CloseIcon from '@mui/icons-material/Close'
import ReplayIcon from '@mui/icons-material/Replay'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Divider from '@mui/material/Divider'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import { grey } from '@mui/material/colors'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useConfirm } from 'material-ui-confirm'
import { useState } from 'react'
import cardApi from '~/api/card.api'
import listApi from '~/api/list.api'
import { ButtonGray } from '~/components/Button'
import useBoardStore from '~/stores/useBoardStore'
import { QUERY_KEYS } from '~/utils/constants'

function DeletedItems() {
  const confirm = useConfirm()
  const queryClient = useQueryClient()
  const boardId = useBoardStore((state) => state.boardId)
  const [mode, setMode] = useState<'lists' | 'cards'>('lists')
  const deleteListMutation = useMutation({ mutationFn: listApi.deleteList })
  const reopenListMutation = useMutation({ mutationFn: listApi.reopenList })
  const deleteCardMutation = useMutation({ mutationFn: cardApi.deleteCard })
  const reopenCardMutation = useMutation({ mutationFn: cardApi.reopenCard })
  const {
    data: listsData,
    isPending: listsDataPending,
    refetch: refetchListsData
  } = useQuery({
    queryKey: [QUERY_KEYS.CLOSED_LISTS, boardId],
    queryFn: () => listApi.getLists({ status: 'closed', boardId }),
    enabled: mode === 'lists',
    staleTime: 10 * 60 * 1000
  })

  const {
    data: cardsData,
    isPending: cardsDataPending,
    refetch: refetchCardsData
  } = useQuery({
    queryKey: [QUERY_KEYS.CLOSED_CARDS, boardId],
    queryFn: () => cardApi.getCards({ status: 'closed', boardId }),
    enabled: mode === 'cards',
    staleTime: 10 * 60 * 1000
  })

  const isPending = mode === 'lists' ? listsDataPending : cardsDataPending
  const closedLists = listsData?.data
  const closedCards = cardsData?.data

  const handleChangeMode = () => {
    setMode(mode === 'cards' ? 'lists' : 'cards')
  }

  const handleDeleteList = (listId: string) => {
    confirm({
      title: 'Delete list?',
      description: 'Are you sure you want to delete this list?',
      confirmationText: 'Delete'
    })
      .then(() => {
        deleteListMutation.mutate({ listId, params: { deleteType: 'hard' } }, { onSuccess: () => refetchListsData() })
      })
      .catch(() => {})
  }

  const handleReopenList = (listId: string) => {
    reopenListMutation.mutate(listId, {
      onSuccess() {
        Promise.all([
          refetchListsData(),
          queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.BOARD] }),
          queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CLOSED_CARDS] })
        ])
      }
    })
  }

  const handleDeleteCard = (cardId: string) => {
    confirm({
      title: 'Delete card?',
      description:
        'All actions will be removed from the activity feed and you won’t be able to re-open the card. There is no undo.',
      confirmationText: 'Delete'
    })
      .then(() => {
        deleteCardMutation.mutate({ cardId, params: { deleteType: 'hard' } }, { onSuccess: () => refetchCardsData() })
      })
      .catch(() => {})
  }

  const handleReopenCard = (cardId: string) => {
    reopenCardMutation.mutate(cardId, {
      onSuccess() {
        refetchCardsData()
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.BOARD] })
      }
    })
  }

  return (
    <Box>
      <Button fullWidth variant="contained" color="primary" onClick={handleChangeMode} sx={{ mb: 1 }}>
        {mode === 'cards' ? 'Switch to lists' : 'Switch to cards'}
      </Button>
      <List>
        {isPending && (
          <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
            <CircularProgress />
          </Box>
        )}
        {mode === 'lists' && closedLists && !closedLists.length && (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              bgcolor: grey[300],
              borderRadius: '4px',
              p: '24px 12px'
            }}
          >
            No deleted lists
          </Box>
        )}
        {mode === 'cards' && closedCards && !closedCards.length && (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              bgcolor: grey[300],
              borderRadius: '4px',
              p: '24px 12px'
            }}
          >
            No deleted cards
          </Box>
        )}
        {mode === 'lists' &&
          closedLists?.map((list) => (
            <Box key={list._id}>
              <ListItem sx={{ px: 1 }}>
                <ListItemText
                  primary={list.title}
                  primaryTypographyProps={{ fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis' }}
                />
                <Box sx={{ display: 'flex', gap: 1, flexShrink: 0 }}>
                  <ButtonGray
                    size="small"
                    color="inherit"
                    startIcon={<ReplayIcon />}
                    onClick={() => handleReopenList(list._id)}
                  >
                    Send to board
                  </ButtonGray>
                  <Button
                    size="small"
                    color="error"
                    variant="outlined"
                    sx={{ minWidth: 'auto', '& .MuiButton-startIcon': { mr: 0 } }}
                    startIcon={<CloseIcon />}
                    onClick={() => handleDeleteList(list._id)}
                  />
                </Box>
              </ListItem>
              <Divider />
            </Box>
          ))}

        {mode === 'cards' &&
          closedCards?.map((card) => (
            <Box key={card._id}>
              <ListItem sx={{ px: 1 }}>
                <ListItemText
                  primary={card.title}
                  primaryTypographyProps={{ fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis' }}
                />
                <Box sx={{ display: 'flex', gap: 1, flexShrink: 0 }}>
                  <ButtonGray
                    size="small"
                    color="inherit"
                    startIcon={<ReplayIcon />}
                    onClick={() => handleReopenCard(card._id)}
                  >
                    Send to board
                  </ButtonGray>
                  <Button
                    size="small"
                    color="error"
                    variant="outlined"
                    sx={{ minWidth: 'auto', '& .MuiButton-startIcon': { mr: 0 } }}
                    startIcon={<CloseIcon />}
                    onClick={() => handleDeleteCard(card._id)}
                  />
                </Box>
              </ListItem>
              <Divider />
            </Box>
          ))}
      </List>
    </Box>
  )
}
export default DeletedItems

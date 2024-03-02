import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { yupResolver } from '@hookform/resolvers/yup'
import AddCardIcon from '@mui/icons-material/AddCard'
import CloseIcon from '@mui/icons-material/Close'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import MoreHorizIcon from '@mui/icons-material/MoreHoriz'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import IconButton from '@mui/material/IconButton'
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { MouseEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import * as yup from 'yup'
import { useShallow } from 'zustand/react/shallow'
import cardApi from '~/api/card.api'
import listApi from '~/api/list.api'
import Menu from '~/components/Menu'
import { Option } from '~/components/Menu/Menu'
import useBoardStore from '~/stores/useBoardStore'
import { List as ListType } from '~/types'
import {
  ADD_CARD_FORM_HEIGHT,
  BOARD_CONTENT_HEIGHT,
  LIST_FOOTER_HEIGHT,
  LIST_HEADER_HEIGHT,
  QUERY_KEYS
} from '~/utils/constants'
import { sortByOrder } from '~/utils/helpers'
import Card from '../Card'

interface Props {
  list: ListType
}

const createCardSchema = yup.object({
  title: yup.string().required()
})

function List({ list }: Props) {
  const queryClient = useQueryClient()
  const createCardMutation = useMutation({ mutationFn: cardApi.createCard })
  const updateListMutation = useMutation({ mutationFn: listApi.updateList })
  const deleteListMutation = useMutation({ mutationFn: listApi.deleteList })

  const { isBoardMember, boardId, cards } = useBoardStore(
    useShallow(({ isBoardMember, boardId, cards }) => ({ isBoardMember, boardId, cards }))
  )
  const orderedCards = useMemo(() => sortByOrder(cards, list.cardOrderIds, '_id'), [list.cardOrderIds, cards])

  const listCardRef = useRef<null | HTMLDivElement>(null)
  const [openCreateCardForm, setOpenCreateCardForm] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [anchorEl, setAnchorEl] = useState<null | HTMLDivElement>(null)
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: list._id,
    data: list,
    disabled: isEditMode || !isBoardMember || !!anchorEl
  })
  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    height: '100%',
    opacity: isDragging ? '0.5' : undefined
  }

  const BOX_FOOTER_HEIGHT = openCreateCardForm ? ADD_CARD_FORM_HEIGHT : LIST_FOOTER_HEIGHT

  const createCardForm = useForm({
    resolver: yupResolver(createCardSchema),
    mode: 'onBlur',
    reValidateMode: 'onBlur'
  })
  const updateTitleForm = useForm({
    defaultValues: { title: '' }
  })

  useEffect(() => {
    updateTitleForm.setValue('title', list.title)
  }, [list.title, updateTitleForm])

  const handleOpenMenu = (event: MouseEvent<HTMLDivElement>) => setAnchorEl(event.currentTarget)
  const handleCloseMenu = () => setAnchorEl(null)

  const enableEditMode = () => {
    if (!isBoardMember) return
    setIsEditMode(true)
  }

  const closeCreateCardForm = () => {
    setOpenCreateCardForm(false)
    createCardForm.reset()
  }

  const handleCreateNewCard = createCardForm.handleSubmit((data) => {
    createCardMutation.mutate(
      { listId: list._id, title: data.title, boardId },
      {
        onSuccess: async () => {
          createCardForm.reset({ title: '' })
          await queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.BOARD] })
          listCardRef.current?.lastElementChild?.scrollIntoView()
        }
      }
    )
  })

  const handleUpdateTitle = updateTitleForm.handleSubmit(({ title }) => {
    setIsEditMode(!isEditMode)
    if (!title) {
      updateTitleForm.setValue('title', list.title)
      return
    }
    if (title !== list.title) {
      updateTitleForm.setValue('title', title)
      updateListMutation.mutate(
        {
          listId: list._id,
          data: {
            title,
            boardId: list.boardId,
            cardOrderIds: list.cardOrderIds.filter((cardId) => !cardId.includes('placeholder-card'))
          }
        },
        {
          onSuccess() {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.BOARD] })
          }
        }
      )
    }
  })

  const handleDeleteList = useCallback(() => {
    deleteListMutation.mutate(
      { listId: list._id, params: { deleteType: 'soft' } },
      {
        onSuccess() {
          Promise.all([
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.BOARD] }),
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CLOSED_LISTS] }),
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CLOSED_CARDS] })
          ])
        }
      }
    )
  }, [deleteListMutation, list._id, queryClient])

  const menu: Option[] = useMemo(
    () => [
      { label: 'Add card', icon: <AddCardIcon fontSize="small" />, onClick: () => setOpenCreateCardForm(true) },
      { label: 'Copy list', icon: <ContentCopyIcon fontSize="small" /> },
      { label: 'Delete this list', icon: <DeleteForeverIcon fontSize="small" />, onClick: handleDeleteList }
    ],
    [handleDeleteList]
  )

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <Box
        sx={{
          minWidth: '300px',
          maxWidth: '300px',
          bgcolor: '#ebecf0',
          ml: 2,
          borderRadius: '6px',
          height: 'fit-content',
          maxHeight: (theme) => `calc(${BOARD_CONTENT_HEIGHT} - ${theme.spacing(5)})`
        }}
      >
        {/* Box header */}
        <Box
          {...listeners}
          sx={{
            height: LIST_HEADER_HEIGHT,
            px: 1,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 0.5
          }}
        >
          <Box component="form" onSubmit={handleUpdateTitle} sx={{ width: '100%' }}>
            {!isEditMode && (
              <Typography
                sx={{ px: 1, fontSize: '16px', fontWeight: 600, cursor: isBoardMember ? 'pointer' : 'default' }}
                onClick={enableEditMode}
              >
                {updateTitleForm.getValues('title') || list.title}
              </Typography>
            )}
            {isEditMode && (
              <Controller
                control={updateTitleForm.control}
                name="title"
                render={({ field }) => (
                  <TextField
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '& input': { fontSize: '16px', fontWeight: 600, px: 1.5, py: 0.5 },
                        '&.Mui-focused fieldset': { borderWidth: '2px!important' },
                        '&:has(.MuiInputBase-input:focus)': {
                          backgroundColor: (theme) => theme.palette.background.paper,
                          backgroundImage: 'linear-gradient(rgba(255 255 255 / 0.05), rgba(255 255 255 / 0.05))'
                        }
                      }
                    }}
                    fullWidth
                    size="small"
                    variant="outlined"
                    autoFocus
                    onFocus={(e) => e.target.select()}
                    {...field}
                    onBlur={handleUpdateTitle}
                  />
                )}
              />
            )}
          </Box>
          {isBoardMember && (
            <Box>
              <Tooltip title="More options">
                <Chip
                  icon={<MoreHorizIcon />}
                  sx={{
                    bgcolor: 'transparent',
                    borderRadius: '4px',
                    p: 0.5,
                    '& .MuiChip-label': { display: 'none' },
                    '.MuiSvgIcon-root': { margin: 0 }
                  }}
                  clickable
                  onClick={handleOpenMenu}
                />
              </Tooltip>

              <Menu menu={menu} anchorEl={anchorEl} onClose={handleCloseMenu} />
            </Box>
          )}
        </Box>

        {/* Box list card */}
        <SortableContext items={orderedCards.map((card) => card._id)} strategy={verticalListSortingStrategy}>
          <Box
            ref={listCardRef}
            sx={{
              p: '1px 4px 1px 4px',
              m: '0 4px',
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
              overflowX: 'hidden',
              overflowY: 'auto',
              maxHeight: (theme) => `calc(
            ${BOARD_CONTENT_HEIGHT} - 
            ${theme.spacing(5)} - 
            ${LIST_HEADER_HEIGHT} - 
            ${isBoardMember ? BOX_FOOTER_HEIGHT : '8px'})`,
              '&::-webkit-scrollbar-thumb': { backgroundColor: '#ced0da' },
              '&::-webkit-scrollbar-thumb:hover': { backgroundColor: '#bfc2cf' }
            }}
          >
            {orderedCards.map((card) => (
              <Card key={card._id} card={card} />
            ))}
          </Box>
        </SortableContext>

        {/* Box footer */}
        {isBoardMember && (
          <Box
            sx={{
              height: BOX_FOOTER_HEIGHT,
              p: '8px 4px',
              m: '0 4px',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            {!openCreateCardForm && (
              <Button
                startIcon={<AddCardIcon />}
                sx={{ '&:hover': { bgcolor: '#091E4224' } }}
                onClick={() => setOpenCreateCardForm(true)}
              >
                Add a card
              </Button>
            )}
            {openCreateCardForm && (
              <ClickAwayListener onClickAway={closeCreateCardForm}>
                <Box
                  component="form"
                  sx={{ display: 'flex', flexDirection: 'column', gap: 1, width: '100%' }}
                  onSubmit={handleCreateNewCard}
                >
                  <Controller
                    control={createCardForm.control}
                    name="title"
                    render={({ field }) => (
                      <TextField
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset, &.Mui-focused fieldset': {
                              borderColor: (theme) => theme.palette.primary.main
                            },
                            '&:has(.MuiInputBase-input:focus)': {
                              backgroundColor: (theme) => theme.palette.background.paper,
                              backgroundImage: 'linear-gradient(rgba(255 255 255 / 0.05), rgba(255 255 255 / 0.05))'
                            }
                          }
                        }}
                        fullWidth
                        multiline
                        rows={3}
                        placeholder="Enter list title..."
                        type="text"
                        size="small"
                        variant="outlined"
                        autoFocus
                        {...field}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            handleCreateNewCard()
                          }
                        }}
                      />
                    )}
                  />
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, height: '34px' }}>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      sx={{
                        boxShadow: 'none',
                        px: 1.5,
                        height: '100%',
                        '&:hover': { boxShadow: 'none' }
                      }}
                    >
                      Add card
                    </Button>
                    <IconButton
                      color="default"
                      onClick={closeCreateCardForm}
                      sx={{
                        borderRadius: 1,
                        padding: 1,
                        height: '100%',
                        '&:hover': { backgroundColor: '#091E4224', '&:focus': { borderRadius: 1 } }
                      }}
                    >
                      <CloseIcon />
                    </IconButton>
                  </Box>
                </Box>
              </ClickAwayListener>
            )}
          </Box>
        )}
        {!isBoardMember && <Box pb={1}></Box>}
      </Box>
    </div>
  )
}
export default List

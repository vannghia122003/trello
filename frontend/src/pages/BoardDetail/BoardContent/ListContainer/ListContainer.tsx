import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable'
import { yupResolver } from '@hookform/resolvers/yup'
import CloseIcon from '@mui/icons-material/Close'
import NoteAddIcon from '@mui/icons-material/NoteAdd'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import IconButton from '@mui/material/IconButton'
import TextField from '@mui/material/TextField'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import * as yup from 'yup'
import listApi from '~/api/list.api'
import useBoardStore from '~/stores/useBoardStore'
import { List as ListType } from '~/types'
import { QUERY_KEYS } from '~/utils/constants'
import List from '../List'

interface Props {
  lists: ListType[]
}

const addListSchema = yup.object({
  title: yup.string().required()
})

function ListContainer({ lists }: Props) {
  const queryClient = useQueryClient()
  const createListMutation = useMutation({ mutationFn: listApi.createList })
  const boardId = useBoardStore((state) => state.boardId)
  const isBoardMember = useBoardStore((state) => state.isBoardMember)
  const [openCreateListForm, setOpenCreateListForm] = useState(false)

  const { control, handleSubmit, reset } = useForm({
    resolver: yupResolver(addListSchema),
    defaultValues: { title: '' },
    mode: 'onBlur',
    reValidateMode: 'onBlur'
  })

  const closeCreateListForm = () => {
    setOpenCreateListForm(false)
    reset()
  }

  const handleCreateNewList = handleSubmit((data) => {
    createListMutation.mutate(
      { boardId, title: data.title },
      {
        onSuccess() {
          reset()
          queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.BOARD] })
        }
      }
    )
  })

  return (
    <SortableContext items={lists.map((list) => list._id)} strategy={horizontalListSortingStrategy}>
      <Box
        sx={{
          bgcolor: 'inherit',
          width: '100%',
          height: '100%',
          display: 'flex',
          overflowX: 'auto',
          overflowY: 'hidden',
          '&::-webkit-scrollbar-track': { m: 2 }
        }}
      >
        {lists.map((list) => (
          <List key={list._id} list={list} />
        ))}

        <Box
          sx={{
            bgcolor: openCreateListForm ? '#ebecf0' : '#ffffff3d',
            minWidth: '250px',
            maxWidth: '250px',
            height: 'fit-content',
            borderRadius: '6px',
            mx: 2,
            p: openCreateListForm ? 1 : 0
          }}
        >
          {!openCreateListForm && isBoardMember && (
            <Button
              onClick={() => setOpenCreateListForm(true)}
              startIcon={<NoteAddIcon />}
              sx={{
                color: 'white',
                width: '100%',
                justifyContent: 'flex-start',
                pl: 2.5,
                py: 1
              }}
            >
              Add another list
            </Button>
          )}
          {openCreateListForm && (
            <ClickAwayListener onClickAway={closeCreateListForm}>
              <Box
                component="form"
                onSubmit={handleCreateNewList}
                sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}
              >
                <Controller
                  control={control}
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
                      placeholder="Enter list title..."
                      type="text"
                      size="small"
                      variant="outlined"
                      autoFocus
                      {...field}
                    />
                  )}
                />
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    size="small"
                    sx={{ boxShadow: 'none', px: 1.5, '&:hover': { boxShadow: 'none' } }}
                  >
                    Add list
                  </Button>
                  <IconButton
                    type="button"
                    color="default"
                    size="small"
                    onClick={closeCreateListForm}
                    sx={{
                      borderRadius: 1,
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
      </Box>
    </SortableContext>
  )
}
export default ListContainer

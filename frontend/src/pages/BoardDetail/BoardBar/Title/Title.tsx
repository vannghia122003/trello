import { yupResolver } from '@hookform/resolvers/yup'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import TextField from '@mui/material/TextField'
import { useEffect, useRef, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import * as yup from 'yup'
import { useShallow } from 'zustand/react/shallow'
import { useUpdateBoard } from '~/hooks'
import useBoardStore from '~/stores/useBoardStore'

const schema = yup.object({
  title: yup.string()
})
type FormData = yup.InferType<typeof schema>

function Title() {
  const { boardId, title, visibility, backgroundId, listOrderIds, isBoardAdmin } = useBoardStore(
    useShallow(({ boardId, title, visibility, backgroundId, listOrderIds, isBoardAdmin }) => ({
      boardId,
      title,
      visibility,
      backgroundId,
      listOrderIds,
      isBoardAdmin
    }))
  )
  const updateBoardMutation = useUpdateBoard(boardId)
  const updateTitle = useBoardStore((state) => state.updateTitle)
  const [isEditMode, setIsEditMode] = useState(false)
  const input = useRef<HTMLInputElement>(null)
  const { control, setValue, handleSubmit, watch } = useForm<FormData>({
    resolver: yupResolver(schema),
    mode: 'onBlur',
    reValidateMode: 'onBlur',
    defaultValues: { title: '' }
  })

  const value = watch('title')

  useEffect(() => {
    setValue('title', title)
  }, [setValue, title])

  const enableEditMode = () => {
    if (!isBoardAdmin) return
    setTimeout(() => input.current?.select(), 0)
    setIsEditMode(!isEditMode)
  }

  const handleUpdateTitle = handleSubmit((data) => {
    setIsEditMode(false)
    if (!data.title) {
      setValue('title', title)
      return
    }
    if (data.title !== title) {
      updateTitle(data.title)
      updateBoardMutation.mutate({ boardId, data: { visibility, backgroundId, listOrderIds, title: data.title } })
    }
  })

  return (
    <Box component="form" onSubmit={handleUpdateTitle} sx={{ position: 'relative' }}>
      <Chip
        sx={{
          color: 'white',
          bgcolor: 'transparent',
          paddingX: '5px',
          border: 'none',
          borderRadius: '4px',
          '.MuiSvgIcon-root': { color: 'white' },
          '&:hover': { bgcolor: 'primary.50' },
          '& .MuiChip-label': { fontWeight: 'bold', fontSize: '1rem' },
          opacity: isEditMode ? 0 : 1,
          visibility: isEditMode ? 'hidden' : 'visible'
        }}
        label={value || title}
        clickable={isBoardAdmin}
        onClick={enableEditMode}
      />
      <Controller
        control={control}
        name="title"
        render={({ field }) => (
          <TextField
            inputRef={input}
            sx={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'white',
              opacity: isEditMode ? 1 : 0,
              visibility: isEditMode ? 'visible' : 'hidden',
              '& .MuiOutlinedInput-root': {
                color: 'black',
                fontWeight: 'bold',
                fontSize: '16px',
                borderRadius: 0,
                height: '100%',
                '& input': { paddingY: 0.5, paddingX: '17px' },
                '&.Mui-focused fieldset': {
                  borderColor: (theme) => theme.palette.primary.main,
                  borderWidth: '3px'
                }
              }
            }}
            size="small"
            fullWidth
            variant="outlined"
            {...field}
            onBlur={handleUpdateTitle}
          />
        )}
      />
    </Box>
  )
}
export default Title

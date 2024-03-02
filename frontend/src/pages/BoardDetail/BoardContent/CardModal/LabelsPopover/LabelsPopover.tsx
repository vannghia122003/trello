import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ModeEditOutlinedIcon from '@mui/icons-material/ModeEditOutlined'
import LoadingButton from '@mui/lab/LoadingButton'
import Box from '@mui/material/Box'
import Checkbox from '@mui/material/Checkbox'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useConfirm } from 'material-ui-confirm'
import { ChangeEvent, FormEvent, useState } from 'react'
import boardApi from '~/api/board.api'
import cardApi from '~/api/card.api'
import { ButtonGray } from '~/components/Button'
import PopoverHeader from '~/components/PopoverHeader'
import useBoardStore from '~/stores/useBoardStore'
import { Label } from '~/types'
import { QUERY_KEYS } from '~/utils/constants'
import { colors } from '~/utils/data'
import LabelItem from '../LabelItem'

interface Props {
  cardId: string
  cardLabels: Label[]
  onClose: () => void
}
const initialCurrentLabel: Label = { ...colors[0], title: '', _id: '' }

function LabelsPopover({ onClose, cardId, cardLabels }: Props) {
  const confirm = useConfirm()
  const queryClient = useQueryClient()
  const [mode, setMode] = useState<'Labels' | 'Create label' | 'Edit label'>('Labels')
  const [currentLabel, setCurrentLabel] = useState<Label>(initialCurrentLabel)
  const boardLabels = useBoardStore((state) => state.labels)
  const boardId = useBoardStore((state) => state.boardId)
  const updateLabelMutation = useMutation({ mutationFn: boardApi.updateLabel })
  const createLabelToBoardMutation = useMutation({ mutationFn: boardApi.createLabelToBoard })
  const deleteLabelFromBoardMutation = useMutation({ mutationFn: boardApi.deleteLabelFromBoard })
  const addLabelToCardMutation = useMutation({ mutationFn: cardApi.addLabelToCard })
  const deleteLabelFromCardMutation = useMutation({ mutationFn: cardApi.deleteLabelFromCard })

  const handleReturnPreviousScreen = () => {
    setMode('Labels')
    setCurrentLabel(initialCurrentLabel)
  }

  const handleChangeTitle = (e: ChangeEvent<HTMLInputElement>) => {
    setCurrentLabel({ ...currentLabel, title: e.target.value })
  }

  const handleSelectColor = (hex: string, name: string) => {
    setCurrentLabel({ ...currentLabel, hex, name })
  }

  const handleEnableEditLabel = (label: Label) => {
    setMode('Edit label')
    setCurrentLabel(label)
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const { hex, name, title, _id } = currentLabel
    if (mode === 'Create label') {
      await createLabelToBoardMutation.mutateAsync({ boardId, data: { hex, name, title } })
    }
    if (mode === 'Edit label') {
      await updateLabelMutation.mutateAsync({ boardId, labelId: _id, data: { title, hex } })
    }
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.BOARD] }),
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CARD, cardId] })
    ])
    handleReturnPreviousScreen()
  }

  const handleDeleteLabel = () => {
    confirm({
      title: 'Delete label',
      description: 'This will remove this label from all cards. There is no undo.',
      confirmationText: 'Delete'
    })
      .then(async () => {
        await deleteLabelFromBoardMutation.mutateAsync({ boardId, labelId: currentLabel._id })
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.BOARD] }),
          queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CARD, cardId] })
        ])
        handleReturnPreviousScreen()
      })
      .catch(() => {})
  }

  const handleAddLabelToCard = async (labelId: string) => {
    if (cardLabels.some((label) => label._id === labelId)) {
      await deleteLabelFromCardMutation.mutateAsync({ cardId, labelId })
    } else {
      await addLabelToCardMutation.mutateAsync({ cardId, data: { labelId } })
    }
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.BOARD] }),
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CARD, cardId] })
    ])
  }

  return (
    <Box sx={{ width: '304px' }}>
      <PopoverHeader onClose={onClose} title={mode}>
        {mode !== 'Labels' && (
          <IconButton
            size="small"
            onClick={handleReturnPreviousScreen}
            sx={{
              position: 'absolute',
              top: '50%',
              left: 3,
              transform: 'translateY(-50%)',
              borderRadius: 2,
              '.MuiTouchRipple-ripple .MuiTouchRipple-child': { borderRadius: 2 }
            }}
          >
            <ChevronLeftIcon />
          </IconButton>
        )}
      </PopoverHeader>
      <Box sx={{ p: 1.5, pt: 0, maxHeight: 400, overflowY: 'auto', overflowX: 'hidden' }}>
        {mode === 'Labels' && (
          <Box>
            <Box component="ul" sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              {boardLabels.map((boardLabel) => (
                <Box component="li" sx={{ display: 'flex', alignItems: 'center' }} key={boardLabel._id}>
                  <Checkbox
                    sx={{ p: 0, flexShrink: 0 }}
                    disableRipple
                    checked={cardLabels.some((cardLabel) => cardLabel._id === boardLabel._id)}
                    onChange={() => handleAddLabelToCard(boardLabel._id)}
                  />
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: 1, width: '248px' }}>
                    <LabelItem
                      fullWidth
                      hex={boardLabel.hex}
                      title={boardLabel.title}
                      name={boardLabel.name}
                      onClick={() => handleAddLabelToCard(boardLabel._id)}
                    />
                    <IconButton
                      sx={{
                        borderRadius: 2,
                        width: '32px',
                        height: '32px',
                        '.MuiTouchRipple-ripple .MuiTouchRipple-child': { borderRadius: 2 }
                      }}
                      onClick={() => handleEnableEditLabel(boardLabel)}
                    >
                      <ModeEditOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
              ))}
            </Box>
            <ButtonGray fullWidth sx={{ mt: 2 }} onClick={() => setMode('Create label')}>
              Create a new label
            </ButtonGray>
          </Box>
        )}

        {mode !== 'Labels' && (
          <Box>
            <Box sx={{ p: 2 }}>
              <LabelItem disableHover hex={currentLabel.hex} title={currentLabel.title} name={currentLabel.name} />
            </Box>
            <Box component="form" onSubmit={handleSubmit}>
              <Box sx={{ mb: 2 }}>
                <Typography fontWeight="500" fontSize="12px" marginBottom="4px">
                  Title
                </Typography>
                <TextField size="small" fullWidth autoFocus value={currentLabel.title} onChange={handleChangeTitle} />
              </Box>

              <Box>
                <Typography fontWeight="500" fontSize="12px" marginBottom="4px">
                  Select a color
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 0.5 }}>
                  {colors.map((color) => (
                    <Box
                      key={color.hex}
                      sx={{
                        height: '36px',
                        borderRadius: 0.5,
                        border: '2px solid transparent',
                        position: 'relative',
                        borderColor: color.hex === currentLabel.hex ? 'primary.main' : 'transparent',
                        p: color.hex === currentLabel.hex ? '2px' : 0
                      }}
                    >
                      <Tooltip
                        disableInteractive
                        title={color.name}
                        slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [0, -7] } }] } }}
                      >
                        <Box
                          onClick={() => handleSelectColor(color.hex, color.name)}
                          sx={{
                            position: 'relative',
                            width: '100%',
                            height: '100%',
                            bgcolor: color.hex,
                            borderRadius: 0.5,
                            cursor: 'pointer'
                          }}
                        >
                          <Box
                            sx={{
                              position: 'absolute',
                              width: '100%',
                              height: '100%',
                              borderRadius: '2px',
                              '&:hover': { bgcolor: 'rgba(0,0,0,0.1)' }
                            }}
                          />
                        </Box>
                      </Tooltip>
                    </Box>
                  ))}
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <LoadingButton
                  variant="contained"
                  size="small"
                  type="submit"
                  loading={createLabelToBoardMutation.isPending || updateLabelMutation.isPending}
                >
                  {mode === 'Create label' && 'Create'}
                  {mode === 'Edit label' && 'Save'}
                </LoadingButton>

                {mode === 'Edit label' && (
                  <LoadingButton
                    variant="contained"
                    size="small"
                    color="error"
                    onClick={handleDeleteLabel}
                    loading={deleteLabelFromBoardMutation.isPending}
                  >
                    Delete
                  </LoadingButton>
                )}
              </Box>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  )
}
export default LabelsPopover

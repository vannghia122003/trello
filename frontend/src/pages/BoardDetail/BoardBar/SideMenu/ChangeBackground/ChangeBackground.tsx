import CheckIcon from '@mui/icons-material/Check'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Grid from '@mui/material/Grid'
import { useShallow } from 'zustand/react/shallow'
import { useBackground, useUpdateBoard } from '~/hooks'
import useBoardStore from '~/stores/useBoardStore'

function ChangeBackground() {
  const { boardId, title, listOrderIds, visibility, backgroundId } = useBoardStore(
    useShallow(({ boardId, title, listOrderIds, visibility, backgroundId }) => ({
      boardId,
      title,
      listOrderIds,
      visibility,
      backgroundId
    }))
  )
  const { data, isPending } = useBackground({ staleTime: 10 * 60 * 1000 })
  const updateBoardMutation = useUpdateBoard(boardId)
  const backgrounds = data?.data

  const handleChangeBackground = (id: string) => {
    if (id === backgroundId) return
    updateBoardMutation.mutate({ boardId, data: { title, listOrderIds, visibility, backgroundId: id } })
  }

  return (
    <Grid container spacing={1}>
      {isPending && (
        <Grid item xs={12}>
          <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
            <CircularProgress />
          </Box>
        </Grid>
      )}
      {backgrounds &&
        backgrounds.map((bg) => (
          <Grid item xs={6} key={bg._id}>
            <Box
              onClick={() => handleChangeBackground(bg._id)}
              sx={{
                backgroundColor: bg.color,
                backgroundImage: `url(${bg.image})`,
                height: '96px',
                borderRadius: 2,
                position: 'relative',
                cursor: 'pointer',
                '&:hover': { opacity: 0.7 }
              }}
            >
              {backgroundId === bg._id && (
                <Box
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}
                >
                  <CheckIcon sx={{ color: 'white' }} />
                </Box>
              )}
              <Box
                component="span"
                sx={{
                  position: 'absolute',
                  left: '10px',
                  bottom: '8px',
                  fontSize: '16px',
                  textShadow: '0 1px 1px #091e4229'
                }}
              >
                {bg.icon}
              </Box>
            </Box>
          </Grid>
        ))}
    </Grid>
  )
}
export default ChangeBackground

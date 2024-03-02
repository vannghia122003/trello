import StarIcon from '@mui/icons-material/Star'
import StarBorderIcon from '@mui/icons-material/StarBorder'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Popover from '@mui/material/Popover'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { MouseEvent, useState } from 'react'
import { Link } from 'react-router-dom'
import boardApi from '~/api/board.api'
import { ButtonGray } from '~/components/Button'
import CreateBoardForm from '~/components/CreateBoardForm'
import { Board, BoardStatus } from '~/types'
import { QUERY_KEYS } from '~/utils/constants'

interface Props {
  title: string
  icon: JSX.Element
  boards: Board[]
  isStarredBoards?: boolean
}

function BoardList({ title, icon, isStarredBoards, boards }: Props) {
  const queryClient = useQueryClient()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const starBoardMutation = useMutation({ mutationFn: boardApi.starBoard })
  const unstarBoardMutation = useMutation({ mutationFn: boardApi.unstarBoard })
  const { data: starredBoardsData } = useQuery({
    queryKey: [QUERY_KEYS.BOARD_LIST, BoardStatus.Starred],
    queryFn: () => boardApi.getBoards({ status: BoardStatus.Starred })
  })
  const starredBoardIds = starredBoardsData?.data.map((board) => board._id) || []

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => setAnchorEl(e.currentTarget)
  const handleClose = () => setAnchorEl(null)

  const checkStarredBoard = (boardId: string) => starredBoardIds.includes(boardId)

  const handleStarBoard = (boardId: string) => (e: MouseEvent<SVGSVGElement>) => {
    e.preventDefault()
    starBoardMutation.mutate(boardId, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.BOARD_LIST, BoardStatus.Starred] })
    })
  }

  const handleUnstarBoard = (boardId: string) => (e: MouseEvent<SVGSVGElement>) => {
    e.preventDefault()
    unstarBoardMutation.mutate(boardId, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.BOARD_LIST, BoardStatus.Starred] })
    })
  }

  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pb: 1 }}>
        {icon}
        <Typography color="#44546F" fontWeight="600" fontSize="20px">
          {title}
        </Typography>
      </Box>
      <Grid container spacing={1.5}>
        {boards.map((board) => (
          <Grid item xs={6} sm={4} md={3} key={board._id}>
            <Link to={`boards/${board._id}`} style={{ textDecoration: 'none' }}>
              <Box
                sx={{
                  position: 'relative',
                  cursor: 'pointer',
                  borderRadius: 1,
                  overflow: 'hidden',
                  p: 1.2,
                  backgroundImage: `url(${board.background.image})`,
                  '&:hover': {
                    '& .overlay': { bgcolor: '#00000040' },
                    '& .star': { transform: 'translateX(0%)' }
                  }
                }}
              >
                <Box className="overlay" sx={{ position: 'absolute', inset: 0, bgcolor: '#00000026' }} />
                <Box
                  sx={{
                    height: '90px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    position: 'relative'
                  }}
                >
                  <Typography fontWeight="700" color="white" noWrap sx={{ width: '100%' }}>
                    {board.title}
                  </Typography>
                  <Box sx={{ textAlign: 'right', height: '24px' }}>
                    {checkStarredBoard(board._id) ? (
                      <Tooltip title="Click to unstar this board. It will be removed from your starred list.">
                        <StarIcon
                          fontSize="small"
                          onClick={handleUnstarBoard(board._id)}
                          sx={{ color: 'orange', transition: 'all 0.25s', '&:hover': { transform: 'scale(1.3)' } }}
                        />
                      </Tooltip>
                    ) : (
                      <Tooltip title="Click to star this board. It will be added to your starred list.">
                        <StarBorderIcon
                          fontSize="small"
                          onClick={handleStarBoard(board._id)}
                          className="star"
                          sx={{
                            color: 'white',
                            transform: 'translateX(200%) scale(1)',
                            transition: 'all 0.25s',
                            '&:hover': { transform: 'translateX(0) scale(1.3)!important' }
                          }}
                        />
                      </Tooltip>
                    )}
                  </Box>
                </Box>
              </Box>
            </Link>
          </Grid>
        ))}
        {!isStarredBoards && (
          <Grid item xs={6} sm={4} md={3}>
            <ButtonGray onClick={handleClick} variant="text" fullWidth sx={{ p: 1.2 }}>
              <Typography
                color="#44546f"
                noWrap
                align="center"
                sx={{ width: '100%', fontSize: '14px', height: '90px', lineHeight: '90px' }}
              >
                Create new board
              </Typography>
            </ButtonGray>
          </Grid>
        )}
      </Grid>

      <Popover
        open={!!anchorEl}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <CreateBoardForm onClose={handleClose} />
      </Popover>
    </Box>
  )
}
export default BoardList

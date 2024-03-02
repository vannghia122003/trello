import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import StarIcon from '@mui/icons-material/Star'
import StarBorderIcon from '@mui/icons-material/StarBorder'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Popover from '@mui/material/Popover'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { MouseEvent, useState } from 'react'
import { Link } from 'react-router-dom'
import boardApi from '~/api/board.api'
import { BoardStatus } from '~/types'
import { QUERY_KEYS } from '~/utils/constants'

function Starred() {
  const queryClient = useQueryClient()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const unstarBoardMutation = useMutation({ mutationFn: boardApi.unstarBoard })
  const { data: starredBoardsData } = useQuery({
    queryKey: [QUERY_KEYS.BOARD_LIST, BoardStatus.Starred],
    queryFn: () => boardApi.getBoards({ status: BoardStatus.Starred }),
    staleTime: 10 * 60 * 1000
  })
  const starredBoards = starredBoardsData?.data || []

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => setAnchorEl(e.currentTarget)
  const handleClose = () => setAnchorEl(null)

  const handleUnstarBoard = (boardId: string) => (e: MouseEvent<HTMLDivElement>) => {
    e.preventDefault()
    unstarBoardMutation.mutate(boardId, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.BOARD_LIST, BoardStatus.Starred] })
    })
  }

  return (
    <Box>
      <Button sx={{ color: 'white' }} onClick={handleClick} endIcon={<ExpandMoreIcon />}>
        Starred
      </Button>
      <Popover
        open={!!anchorEl}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left'
        }}
      >
        <Box sx={{ p: 1.5, width: '304px', maxHeight: '376px', overflowY: 'auto' }}>
          {!starredBoards.length && (
            <Box>
              <Box
                component="img"
                sx={{ width: '100%' }}
                src="https://trello.com/assets/cc47d0a8c646581ccd08.svg"
              ></Box>
              <Typography align="center" fontSize="14px" mb={1}>
                Star important boards to access them quickly and easily.
              </Typography>
            </Box>
          )}
          <Box sx={{ display: 'flex', gap: 0.5, flexDirection: 'column' }}>
            {starredBoards.map((board) => (
              <Link key={board._id} to={`boards/${board._id}`} style={{ textDecoration: 'none', color: '#172B4D' }}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 1,
                    p: 0.5,
                    borderRadius: '8px',
                    '&:hover': { bgcolor: '#091E420F' }
                  }}
                >
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Box
                      sx={{
                        width: '40px',
                        height: '32px',
                        borderRadius: '4px',
                        backgroundSize: 'cover',
                        backgroundImage: `url(${board.background.image})`
                      }}
                    />
                    <Box sx={{ height: '32px' }}>
                      <Typography fontSize="14px" fontWeight={500}>
                        {board.title}
                      </Typography>
                    </Box>
                  </Box>

                  <Tooltip enterDelay={500} title="Click to unstar API. It will be removed from your starred list.">
                    <Box
                      sx={{
                        height: '20px',
                        '&:hover': { '& .star': { display: 'none' }, '& .star-border': { display: 'block' } }
                      }}
                      onClick={handleUnstarBoard(board._id)}
                    >
                      <StarIcon className="star" fontSize="small" sx={{ color: 'orange' }} />
                      <StarBorderIcon
                        className="star-border"
                        fontSize="small"
                        sx={{ color: 'orange', display: 'none' }}
                      />
                    </Box>
                  </Tooltip>
                </Box>
              </Link>
            ))}
          </Box>
        </Box>
      </Popover>
    </Box>
  )
}
export default Starred

import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined'
import StarBorderIcon from '@mui/icons-material/StarBorder'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import boardApi from '~/api/board.api'
import AppBar from '~/components/AppBar'
import { BoardStatus } from '~/types'
import { QUERY_KEYS } from '~/utils/constants'
import BoardList from './BoardList'
import ClosedBoardDialog from './ClosedBoardDialog'
import { Helmet } from 'react-helmet-async'

function Home() {
  const [open, setOpen] = useState(false)
  const { data: openBoardsData } = useQuery({
    queryKey: [QUERY_KEYS.BOARD_LIST, BoardStatus.Open],
    queryFn: () => boardApi.getBoards({ status: BoardStatus.Open })
  })
  const { data: closedBoardsData } = useQuery({
    queryKey: [QUERY_KEYS.BOARD_LIST, BoardStatus.Closed],
    queryFn: () => boardApi.getBoards({ status: BoardStatus.Closed })
  })
  const { data: starredBoardsData } = useQuery({
    queryKey: [QUERY_KEYS.BOARD_LIST, BoardStatus.Starred],
    queryFn: () => boardApi.getBoards({ status: BoardStatus.Starred }),
    staleTime: 10 * 60 * 1000
  })

  const openBoards = openBoardsData?.data || []
  const closedBoards = closedBoardsData?.data || []
  const starredBoards = starredBoardsData?.data || []

  const handleOpenDialog = () => setOpen(true)
  const handleCloseDialog = () => setOpen(false)

  return (
    <Container disableGutters maxWidth={false}>
      <Helmet>
        <title>Boads | Trello</title>
      </Helmet>

      <AppBar bgcolor="#1976d2" />
      <Container sx={{ py: 2 }} maxWidth="md">
        {!!starredBoards.length && (
          <BoardList title="Starred boards" boards={starredBoards} isStarredBoards icon={<StarBorderIcon />} />
        )}
        <BoardList title="Your boards" boards={openBoards} icon={<PersonOutlineOutlinedIcon />} />
        <Button variant="contained" color="info" onClick={handleOpenDialog}>
          View all closed boards
        </Button>
        <ClosedBoardDialog open={open} onClose={handleCloseDialog} boards={closedBoards} />
      </Container>
    </Container>
  )
}
export default Home

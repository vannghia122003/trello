import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import SvgIcon from '@mui/material/SvgIcon'
import Typography from '@mui/material/Typography'
import { useQuery } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import { useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link, useNavigate, useParams } from 'react-router-dom'
import boardApi from '~/api/board.api'
import trelloLogo from '~/assets/trello.svg?react'
import AppBar from '~/components/AppBar'
import Loading from '~/components/Loading'
import useBoardStore from '~/stores/useBoardStore'
import { LocalStorageEventTarget } from '~/utils/auth'
import { APP_BAR_HEIGHT, QUERY_KEYS, path } from '~/utils/constants'
import BoardBar from './BoardBar'
import BoardContent from './BoardContent'
import NoAccessPage from './NoAccessPage'

function BoardDetail() {
  const navigate = useNavigate()
  const setBoard = useBoardStore((state) => state.setBoard)
  const isBoardMember = useBoardStore((state) => state.isBoardMember)
  const { boardId } = useParams()
  const { data, error, isPending } = useQuery({
    queryKey: [QUERY_KEYS.BOARD, boardId],
    queryFn: async () => {
      const data = await boardApi.getBoardDetail(boardId as string)
      setBoard(data.data)
      return data
    }
  })
  const boardDetail = data?.data

  useEffect(() => {
    const logout = () => {
      navigate('/login')
    }
    LocalStorageEventTarget.addEventListener('clearLocalStorage', logout)
    return () => {
      LocalStorageEventTarget.removeEventListener('clearLocalStorage', logout)
    }
  }, [navigate])

  if (error && isAxiosError(error) && (error.response?.status === 403 || error.response?.status === 401))
    return <NoAccessPage />

  if (isPending) return <Loading />
  if (!boardDetail) return null

  return (
    <Container
      disableGutters
      maxWidth={false}
      sx={{
        height: '100vh',
        backgroundColor: boardDetail.background.color,
        backgroundImage: `url(${boardDetail.background.image})`
      }}
    >
      <Helmet>
        <title>{boardDetail.title} | Trello</title>
      </Helmet>
      {isBoardMember && <AppBar bgcolor={boardDetail.background.color} />}
      {!isBoardMember && (
        <Box
          sx={{
            width: '100%',
            height: APP_BAR_HEIGHT,
            bgcolor: boardDetail.background.color,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 2,
            paddingX: 2
          }}
        >
          <Typography color="white">Sign in to use more features</Typography>
          <Link to={path.login} style={{ flexShrink: 0 }}>
            <Button
              variant="contained"
              startIcon={<SvgIcon component={trelloLogo} fontSize="medium" inheritViewBox sx={{ color: 'white' }} />}
            >
              Sign in
            </Button>
          </Link>
        </Box>
      )}
      <BoardBar />
      <BoardContent />
    </Container>
  )
}
export default BoardDetail

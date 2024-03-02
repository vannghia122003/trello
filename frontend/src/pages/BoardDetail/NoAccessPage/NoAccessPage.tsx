import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import SvgIcon from '@mui/material/SvgIcon'
import Typography from '@mui/material/Typography'
import { Link } from 'react-router-dom'
import trelloLogo from '~/assets/trello.svg?react'
import AppBar from '~/components/AppBar'
import useAuthStore from '~/stores/useAuthStore'
import { APP_BAR_HEIGHT, path } from '~/utils/constants'

function NoAccessPage() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  return (
    <Container disableGutters maxWidth={false} sx={{ height: '100vh' }}>
      {isAuthenticated && <AppBar />}
      <Box
        sx={{
          bgcolor: '#091E420F',
          position: 'relative',
          height: isAuthenticated ? `calc(100vh - ${APP_BAR_HEIGHT})` : '100vh'
        }}
      >
        <Container>
          <Box pt={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
              <SvgIcon component={trelloLogo} fontSize="large" inheritViewBox color="primary" />
              <Typography component="h1" variant="h4" fontWeight="700">
                Trello
              </Typography>
            </Box>
            <Typography fontWeight={400} fontSize="18px" align="center" marginTop={1}>
              This board may be private. If someone gave you this link, they may need to share the board with you or
              invite you to their Workspace.
            </Typography>
            <Link to={path.home}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }} marginTop={2}>
                <Button sx={{ fontSize: '20px' }} variant="contained">
                  Back
                </Button>
              </Box>
            </Link>
          </Box>
        </Container>
        <Box
          component="img"
          src="https://trello.com/assets/da0d6fb7fd0a5918d5e8.svg"
          sx={{ position: 'absolute', width: '351px', height: '332px', bottom: '48px', right: 0, maxWidth: '100%' }}
        />
        <Box
          component="img"
          src="https://trello.com/assets/45d7253154299d327a17.png"
          sx={{ position: 'absolute', bottom: 0, width: '100%' }}
        />
      </Box>
    </Container>
  )
}
export default NoAccessPage

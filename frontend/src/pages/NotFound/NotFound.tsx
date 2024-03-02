import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import error_404 from '~/assets/404.png'
import { path } from '~/utils/constants'

function NotFound() {
  return (
    <Box
      component="main"
      sx={{
        alignItems: 'center',
        display: 'flex',
        flexGrow: 1,
        minHeight: '100%'
      }}
    >
      <Helmet>
        <title>Not found</title>
      </Helmet>

      <Container maxWidth="md">
        <Box
          sx={{
            alignItems: 'center',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <Box
            sx={{
              mb: 3,
              textAlign: 'center'
            }}
          >
            <img
              alt="Not found"
              src={error_404}
              style={{
                display: 'inline-block',
                maxWidth: '100%',
                width: 400
              }}
            />
          </Box>
          <Typography align="center" sx={{ mb: 3 }} variant="h3">
            404: The page you are looking for isn’t here
          </Typography>
          <Typography align="center" color="text.secondary" variant="body1">
            You either tried some shady route or you came here by mistake. Whichever it is, try using the navigation
          </Typography>
          <Button sx={{ mt: 3, '& a': { color: 'white' } }} variant="contained">
            <Link to={path.home}>Back</Link>
          </Button>
        </Box>
      </Container>
    </Box>
  )
}
export default NotFound

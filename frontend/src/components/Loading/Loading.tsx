import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'

function Loading() {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 2,
        width: '100vw',
        height: '100vh'
      }}
    >
      <CircularProgress />
      <Typography>Loading...</Typography>
    </Box>
  )
}
export default Loading

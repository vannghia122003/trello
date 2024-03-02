import Box from '@mui/material/Box'
import Link from '@mui/material/Link'

interface Props {
  photoUrl: string
  coverImage: string
  photographer?: string
  photographerUrl?: string
  onClick?: () => void
}

function Photo({ photoUrl, coverImage, photographer, photographerUrl, onClick }: Props) {
  return (
    <Box
      sx={{
        p: 0.2,
        borderRadius: '4px',
        overflow: 'hidden',
        boxShadow: (theme) => (coverImage === photoUrl ? `0 0 0 2px ${theme.palette.primary.main}` : 'none'),
        cursor: 'pointer',
        position: 'relative',
        '&:hover a': { display: 'block' }
      }}
      onClick={onClick}
    >
      <Box
        sx={{
          backgroundImage: `url(${photoUrl})`,
          height: '60px',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          bgcolor: '#B6B6B4',
          borderRadius: '4px',
          '&:hover': { filter: coverImage !== photoUrl ? 'brightness(70%)' : 'none' }
        }}
      />
      {photographerUrl && (
        <Link
          href={photographerUrl}
          target="_blank"
          noWrap
          sx={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            left: 0,
            fontSize: '12px',
            fontWeight: 700,
            textDecoration: 'underline',
            color: 'white',
            px: 1,
            m: 0.3,
            bgcolor: 'rgba(0, 0, 0, 0.5)',
            display: 'none'
          }}
        >
          {photographer}
        </Link>
      )}
    </Box>
  )
}
export default Photo

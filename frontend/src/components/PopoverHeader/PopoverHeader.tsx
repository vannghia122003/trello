import CloseIcon from '@mui/icons-material/Close'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import { ReactNode } from 'react'

interface Props {
  title: string
  onClose: () => void
  children?: ReactNode
}

function PopoverHeader({ title, onClose, children }: Props) {
  return (
    <Box sx={{ position: 'relative' }}>
      <Typography sx={{ p: 1.5 }} align="center" fontSize="14px" fontWeight="600">
        {title}
      </Typography>
      <IconButton
        size="small"
        onClick={onClose}
        sx={{
          position: 'absolute',
          top: '50%',
          right: 3,
          transform: 'translateY(-50%)',
          borderRadius: 2,
          '.MuiTouchRipple-ripple .MuiTouchRipple-child': { borderRadius: 2 }
        }}
      >
        <CloseIcon />
      </IconButton>
      {children}
    </Box>
  )
}
export default PopoverHeader

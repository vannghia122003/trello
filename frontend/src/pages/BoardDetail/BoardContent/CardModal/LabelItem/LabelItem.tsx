import Box from '@mui/material/Box'
import Tooltip from '@mui/material/Tooltip'
import { MouseEvent } from 'react'

interface Props {
  hex: string
  title: string
  name: string
  fullWidth?: boolean
  disableHover?: boolean
  onClick?: (e: MouseEvent<HTMLDivElement>) => void
}

function LabelItem({ hex, title, name, disableHover, onClick, fullWidth }: Props) {
  return (
    <Tooltip
      disableInteractive
      title={`Color: ${name}, title: "${title || 'none'}"`}
      slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [0, -7] } }] } }}
    >
      <Box
        onClick={onClick}
        sx={{
          backgroundColor: hex,
          px: 1.5,
          minWidth: '48px',
          maxWidth: '100%',
          width: fullWidth ? '100%' : undefined,
          height: '32px',
          lineHeight: '32px',
          borderRadius: '4px',
          fontSize: '14px',
          fontWeight: 500,
          whiteSpace: 'nowrap',
          textOverflow: 'ellipsis',
          overflow: 'hidden',
          cursor: disableHover ? undefined : 'pointer',
          position: 'relative'
        }}
      >
        {title}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            borderRadius: '2px',
            '&:hover': { bgcolor: disableHover ? undefined : 'rgba(0, 0, 0, 0.1)' }
          }}
        />
      </Box>
    </Tooltip>
  )
}
export default LabelItem

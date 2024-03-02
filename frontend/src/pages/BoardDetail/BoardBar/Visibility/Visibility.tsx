import CheckIcon from '@mui/icons-material/Check'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import PublicIcon from '@mui/icons-material/Public'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'
import { MouseEvent, useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { useUpdateBoard } from '~/hooks'
import useBoardStore from '~/stores/useBoardStore'
import { Visibility as VisibilityType } from '~/types'
import { capitalizeFirstLetter } from '~/utils/helpers'

const options = [
  {
    label: 'Private',
    value: VisibilityType.Private,
    icon: <LockOutlinedIcon />,
    description: 'Only board members can see and edit this board.',
    color: '#ef5350'
  },
  {
    label: 'Public',
    value: VisibilityType.Public,
    icon: <PublicIcon />,
    description: 'Anyone on the internet can see this board. Only board members can edit.',
    color: '#4caf50'
  }
]

function Visibility() {
  const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null)
  const { boardId, title, visibility, backgroundId, listOrderIds, isBoardAdmin } = useBoardStore(
    useShallow(({ boardId, title, visibility, backgroundId, listOrderIds, isBoardAdmin }) => ({
      boardId,
      title,
      visibility,
      backgroundId,
      listOrderIds,
      isBoardAdmin
    }))
  )
  const updateBoardMutation = useUpdateBoard(boardId)

  const handleOpenMenu = (event: MouseEvent<HTMLDivElement>) => {
    if (!isBoardAdmin) return
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => setAnchorEl(null)

  const handleChangeVisibility = (value: VisibilityType) => {
    if (visibility !== value) {
      updateBoardMutation.mutate({ boardId, data: { visibility: value, backgroundId, listOrderIds, title } })
    }
    setAnchorEl(null)
  }

  return (
    <Box>
      <Chip
        sx={{
          color: 'white',
          bgcolor: 'transparent',
          paddingX: '5px',
          border: 'none',
          borderRadius: '4px',
          '.MuiSvgIcon-root': { color: 'white' },
          '&:hover': { bgcolor: 'primary.50' }
        }}
        icon={visibility === VisibilityType.Public ? <PublicIcon /> : <LockOutlinedIcon />}
        label={capitalizeFirstLetter(visibility)}
        clickable={isBoardAdmin}
        onClick={handleOpenMenu}
      />
      <Menu
        anchorEl={anchorEl}
        open={!!anchorEl}
        onClose={handleClose}
        sx={{ '& .MuiMenu-list': { maxWidth: '350px' } }}
      >
        <Typography variant="h2" align="center" sx={{ fontSize: '14px!important', fontWeight: 600, py: 1 }}>
          Change visibility
        </Typography>
        {options.map((option) => (
          <MenuItem
            sx={{ flexDirection: 'column', alignItems: 'flex-start' }}
            key={option.value}
            selected={option.value === visibility}
            onClick={() => handleChangeVisibility(option.value)}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <ListItemIcon
                sx={{
                  color: option.color,
                  minWidth: 'initial!important',
                  '& .MuiSvgIcon-root': { fontSize: '16px!important' }
                }}
              >
                {option.icon}
              </ListItemIcon>
              <ListItemText primary={option.label} />
              {option.value === visibility && <CheckIcon sx={{ fontSize: '16px' }} />}
            </Box>
            <Typography variant="caption" sx={{ whiteSpace: 'wrap' }}>
              {option.description}
            </Typography>
          </MenuItem>
        ))}
      </Menu>
    </Box>
  )
}
export default Visibility

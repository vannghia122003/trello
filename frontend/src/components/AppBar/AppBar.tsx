import CloseIcon from '@mui/icons-material/Close'
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'
import LibraryAddIcon from '@mui/icons-material/LibraryAdd'
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone'
import SearchIcon from '@mui/icons-material/Search'
import Badge from '@mui/material/Badge'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Popover from '@mui/material/Popover'
import SvgIcon from '@mui/material/SvgIcon'
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { MouseEvent, useState } from 'react'
import { Link } from 'react-router-dom'
import trelloLogo from '~/assets/trello.svg?react'
import { APP_BAR_HEIGHT, path } from '~/utils/constants'
import CreateBoardForm from '../CreateBoardForm'
import Profile from './Menu/Profile'
import Starred from './Menu/Starred'

interface Props {
  bgcolor?: string
}

function AppBar({ bgcolor = 'hsl(215,90%,32.7%)' }: Props) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [searchValue, setSearchValue] = useState('')

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => setAnchorEl(e.currentTarget)
  const handleClose = () => setAnchorEl(null)

  return (
    <Box
      sx={{
        width: '100%',
        height: APP_BAR_HEIGHT,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 6,
        paddingX: 2,
        overflowX: 'auto',
        bgcolor,
        border: '1px solid #ffffff29'
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Link to={path.home}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <SvgIcon component={trelloLogo} fontSize="medium" inheritViewBox sx={{ color: 'white' }} />
            <Typography sx={{ fontWeight: 'bold', fontSize: '20px', color: 'white' }}>Trello</Typography>
          </Box>
        </Link>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Starred />
          <Button startIcon={<LibraryAddIcon />} sx={{ color: 'white' }} onClick={handleClick}>
            Create
          </Button>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <TextField
          autoComplete="off"
          label="Search"
          type="text"
          size="small"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: 'white' }} />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <CloseIcon
                  fontSize="small"
                  sx={{
                    color: searchValue ? 'white' : 'transparent',
                    visibility: searchValue ? 'visible' : 'hidden',
                    cursor: 'pointer'
                  }}
                  onClick={() => setSearchValue('')}
                />
              </InputAdornment>
            )
          }}
          sx={{
            minWidth: '170px',
            // maxWidth: '170px',
            '& label': { color: 'white' },
            '& input': { color: 'white' },
            '& label.Mui-focused': { color: 'white' },
            '& .MuiOutlinedInput-root': {
              '& fieldset': { borderColor: 'white!important' },
              '&:hover fieldset': { borderColor: 'white!important' },
              '&.Mui-focused fieldset': { borderColor: 'white!important' }
            }
          }}
        />

        <Tooltip title="Notifications">
          <IconButton sx={{ color: 'white' }}>
            <Badge color="error" variant="dot" invisible={false}>
              <NotificationsNoneIcon />
            </Badge>
          </IconButton>
        </Tooltip>

        <Tooltip title="Information">
          <IconButton sx={{ color: 'white' }}>
            <HelpOutlineIcon />
          </IconButton>
        </Tooltip>

        <Profile />
      </Box>

      <Popover
        open={!!anchorEl}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        children={<CreateBoardForm onClose={handleClose} />}
      />
    </Box>
  )
}
export default AppBar

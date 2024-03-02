import Logout from '@mui/icons-material/Logout'
import PersonIcon from '@mui/icons-material/Person'
import Settings from '@mui/icons-material/Settings'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { MouseEvent, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useShallow } from 'zustand/react/shallow'
import authApi from '~/api/auth.api'
import useAuthStore from '~/stores/useAuthStore'
import { clearLocalStorage, getRefreshTokenFromLocalStorage } from '~/utils/auth'
import { path } from '~/utils/constants'

function Profile() {
  const queryClient = useQueryClient()
  const { profile, setIsAuthenticated, setProfile } = useAuthStore(
    useShallow(({ profile, setIsAuthenticated, setProfile }) => ({ profile, setIsAuthenticated, setProfile }))
  )
  const logoutMutation = useMutation({ mutationFn: authApi.logout })
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => setAnchorEl(e.currentTarget)
  const handleClose = () => setAnchorEl(null)

  const handleLogout = () => {
    const refreshToken = getRefreshTokenFromLocalStorage()
    logoutMutation.mutate(
      { refreshToken },
      {
        onSuccess() {
          queryClient.removeQueries()
          setIsAuthenticated(false)
          setProfile(null)
          clearLocalStorage()
          toast.success('Logout successfully')
        }
      }
    )
  }

  return (
    <Box>
      <Tooltip title="Account">
        <IconButton onClick={handleClick} size="small" sx={{ padding: 0 }}>
          <Avatar sx={{ width: 36, height: 36 }} src={profile?.avatar} alt={profile?.fullName} />
        </IconButton>
      </Tooltip>

      <Menu anchorEl={anchorEl} open={open} onClose={handleClose} sx={{ width: '250px' }}>
        <Box sx={{ display: 'flex', gap: 1, px: 2, py: 1 }}>
          <Avatar src={profile?.avatar} alt={profile?.fullName} />
          <Box sx={{ width: '74%' }}>
            <Typography noWrap color="#172b4d">
              {profile?.fullName}
            </Typography>
            <Typography noWrap color="#172b4d" fontSize="14px">
              {profile?.email}
            </Typography>
          </Box>
        </Box>
        <Divider sx={{ mb: 1 }} />
        <Link to={path.profile} style={{ color: 'inherit' }}>
          <MenuItem onClick={handleClose}>
            <ListItemIcon>
              <PersonIcon />
            </ListItemIcon>
            Profile
          </MenuItem>
        </Link>
        <MenuItem>
          <ListItemIcon>
            <Settings />
          </ListItemIcon>
          Settings
        </MenuItem>
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <Logout />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>
    </Box>
  )
}
export default Profile

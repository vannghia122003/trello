import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import CloseIcon from '@mui/icons-material/Close'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import LabelOutlinedIcon from '@mui/icons-material/LabelOutlined'
import MoreHorizIcon from '@mui/icons-material/MoreHoriz'
import RemoveIcon from '@mui/icons-material/Remove'
import RestoreFromTrashIcon from '@mui/icons-material/RestoreFromTrash'
import RocketLaunchOutlinedIcon from '@mui/icons-material/RocketLaunchOutlined'
import SettingsIcon from '@mui/icons-material/Settings'
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined'
import SquareIcon from '@mui/icons-material/Square'
import TocIcon from '@mui/icons-material/Toc'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import { SvgIconTypeMap } from '@mui/material'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import { OverridableComponent } from '@mui/material/OverridableComponent'
import Typography from '@mui/material/Typography'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useConfirm } from 'material-ui-confirm'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import boardApi from '~/api/board.api'
import useBoardStore from '~/stores/useBoardStore'
import { BoardStatus } from '~/types'
import { QUERY_KEYS } from '~/utils/constants'
import ChangeBackground from './ChangeBackground'
import DeletedItems from './DeletedItems'

interface MainMenu {
  label: string
  Icon: OverridableComponent<SvgIconTypeMap<unknown, 'svg'>>
  divider?: boolean
  onClick: () => void
}

function SideMenu() {
  const confirm = useConfirm()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { boardId } = useParams()
  const [open, setOpen] = useState(false)
  const [menuName, setMenuName] = useState('Menu')
  const isBoardMember = useBoardStore((state) => state.isBoardMember)
  const deleteMutation = useMutation({ mutationFn: boardApi.deleteBoard })

  const toggleOpenSideMenu = () => setOpen(!open)

  const handleCloseBoard = () => {
    confirm({
      title: 'Close board?',
      description: 'You can find and reopen closed boards at the bottom of your boards page.',
      confirmationText: 'Close'
    })
      .then(() => {
        deleteMutation.mutate(
          { boardId: boardId as string, params: { deleteType: 'soft' } },
          {
            onSuccess() {
              queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.BOARD_LIST, BoardStatus.Starred] })
              navigate('/')
            }
          }
        )
      })
      .catch(() => {})
  }

  const mainMenu: MainMenu[] = [
    { label: 'About this board', Icon: InfoOutlinedIcon, onClick: () => {} },
    { label: 'Activity', Icon: TocIcon, onClick: () => {} },
    { label: 'Deleted items', Icon: RestoreFromTrashIcon, divider: true, onClick: () => setMenuName('Deleted items') },
    { label: 'Settings', Icon: SettingsIcon, onClick: () => {} },
    { label: 'Change background', Icon: SquareIcon, onClick: () => setMenuName('Change background') },
    { label: 'Power-Ups', Icon: RocketLaunchOutlinedIcon, onClick: () => {} },
    { label: 'Label', Icon: LabelOutlinedIcon, divider: true, onClick: () => {} },
    { label: 'Watch', Icon: VisibilityOutlinedIcon, onClick: () => {} },
    { label: 'Copy board', Icon: ContentCopyIcon, onClick: () => {} },
    { label: 'Email-to-board', Icon: EmailOutlinedIcon, onClick: () => {} },
    { label: 'Print, export, and share', Icon: ShareOutlinedIcon, onClick: () => {} },
    { label: 'Close board', Icon: RemoveIcon, onClick: handleCloseBoard }
  ]

  return (
    <Box>
      {isBoardMember && (
        <Chip
          sx={{
            color: 'white',
            bgcolor: 'transparent',
            paddingX: '5px',
            border: 'none',
            borderRadius: '4px',
            '&:hover': { bgcolor: 'primary.50' },
            '& .MuiChip-label': { display: 'none' },
            '.MuiSvgIcon-root': { margin: 0, color: 'white' }
          }}
          icon={<MoreHorizIcon />}
          clickable
          onClick={toggleOpenSideMenu}
        />
      )}
      <Drawer anchor="right" open={open} onClose={toggleOpenSideMenu}>
        <Box sx={{ width: 340, px: 1 }}>
          <Box sx={{ position: 'relative' }}>
            {menuName !== 'Menu' && (
              <IconButton
                size="small"
                onClick={() => setMenuName('Menu')}
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: 3,
                  transform: 'translateY(-50%)',
                  borderRadius: 2
                }}
              >
                <ChevronLeftIcon />
              </IconButton>
            )}
            <Typography align="center" sx={{ p: 2, fontWeight: 500, fontSize: 16 }}>
              {menuName}
            </Typography>
            <IconButton
              size="small"
              onClick={toggleOpenSideMenu}
              sx={{ position: 'absolute', top: '50%', right: 3, transform: 'translateY(-50%)', borderRadius: 2 }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
          <Divider />
          <List>
            {menuName === 'Menu' &&
              mainMenu.map(({ label, Icon, divider, onClick }) => (
                <Box key={label}>
                  <ListItem disablePadding onClick={onClick}>
                    <ListItemButton>
                      <ListItemIcon sx={{ minWidth: 32 }} children={<Icon />} />
                      <ListItemText primary={label} sx={{ '& .MuiTypography-root': { fontSize: 14 } }} />
                    </ListItemButton>
                  </ListItem>
                  {divider && <Divider sx={{ my: 1 }} />}
                </Box>
              ))}
            {menuName === 'Deleted items' && <DeletedItems />}
            {menuName === 'Change background' && <ChangeBackground />}
          </List>
        </Box>
      </Drawer>
    </Box>
  )
}
export default SideMenu

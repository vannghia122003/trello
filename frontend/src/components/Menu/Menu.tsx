import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import MuiMenu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'

export interface Option {
  label: string
  icon?: JSX.Element
  onClick?: () => void
}

interface Props {
  menu: Option[]
  anchorEl: HTMLDivElement | null
  onClose: () => void
}

function Menu({ menu, anchorEl, onClose }: Props) {
  const open = Boolean(anchorEl)

  return (
    <MuiMenu anchorEl={anchorEl} open={open} onClose={onClose} onClick={onClose}>
      {menu.map((item) => (
        <MenuItem key={item.label} onClick={item.onClick}>
          {item.icon && <ListItemIcon>{item.icon}</ListItemIcon>}
          <ListItemText>{item.label}</ListItemText>
        </MenuItem>
      ))}
    </MuiMenu>
  )
}
export default Menu

import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useConfirm } from 'material-ui-confirm'
import { useState } from 'react'
import boardApi from '~/api/board.api'
import { ButtonGray } from '~/components/Button'
import useAuthStore from '~/stores/useAuthStore'
import useBoardStore from '~/stores/useBoardStore'
import { User } from '~/types'
import { QUERY_KEYS } from '~/utils/constants'

interface Props {
  member: User
  adminIds: string[]
  memberIds: string[]
}

function MemberItem({ member, adminIds, memberIds }: Props) {
  const confirm = useConfirm()
  const queryClient = useQueryClient()
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null)
  const boardId = useBoardStore((state) => state.boardId)
  const profile = useAuthStore((state) => state.profile)
  const updateMemberMutation = useMutation({ mutationFn: boardApi.updateMember })
  const removeMemberMutation = useMutation({ mutationFn: boardApi.removeMember })

  const handleCloseMenu = () => setAnchorEl(null)

  const handleUpdateMember = (memberId: string, role: 'admin' | 'member') => {
    handleCloseMenu()
    if (adminIds.includes(memberId) && role === 'admin') return
    if (memberIds.includes(memberId) && role === 'member') return
    updateMemberMutation.mutate(
      { boardId, memberId, data: { role } },
      { onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.BOARD, boardId] }) }
    )
  }

  const handleRemoveMember = (memberId: string, fullName: string) => {
    handleCloseMenu()
    confirm({
      title: 'Remove from board',
      description: `${fullName} will be removed from all cards on this board.`,
      confirmationText: 'Remove'
    })
      .then(() => {
        removeMemberMutation.mutate(
          { boardId, memberId },
          { onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.BOARD, boardId] }) }
        )
      })
      .catch(() => {})
  }

  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Avatar alt={member.username} src={member.avatar} sx={{ width: 36, height: 36 }} />
        <Box>
          <Typography fontSize="14px">
            {member.fullName} {member._id === profile?._id && '(you)'}
          </Typography>
          <Typography fontSize="12px">@{member.username}</Typography>
        </Box>
      </Box>
      <ButtonGray
        endIcon={<ExpandMoreIcon />}
        onClick={(e) => setAnchorEl(e.currentTarget)}
        disabled={adminIds.includes(member._id) && memberIds.includes(profile?._id as string)}
      >
        {adminIds.includes(member._id) ? 'Admin' : 'Member'}
      </ButtonGray>

      <Menu
        anchorEl={anchorEl}
        open={!!anchorEl}
        onClose={handleCloseMenu}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        sx={{
          '& .MuiMenu-list': {
            width: '200px',
            '& .Mui-selected': { borderLeft: '3px solid', borderColor: 'primary.main' }
          }
        }}
      >
        <MenuItem
          selected={adminIds.includes(member._id)}
          onClick={() => handleUpdateMember(member._id, 'admin')}
          disabled={memberIds.includes(profile?._id as string)}
        >
          Admin
        </MenuItem>
        <MenuItem selected={memberIds.includes(member._id)} onClick={() => handleUpdateMember(member._id, 'member')}>
          Member
        </MenuItem>
        <MenuItem onClick={() => handleRemoveMember(member._id, member.fullName)}>
          {member._id === profile?._id ? 'Leave board' : 'Remove from board'}
        </MenuItem>
      </Menu>
    </Box>
  )

  // ko phai chu board
}
export default MemberItem

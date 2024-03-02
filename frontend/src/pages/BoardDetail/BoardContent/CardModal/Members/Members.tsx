import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { User } from '~/types'

interface Props {
  members: User[]
}

function Members({ members }: Props) {
  if (members.length === 0) return null

  return (
    <Box sx={{ mt: 1, ml: 4 }}>
      <Typography fontSize="12px" fontWeight={600} mb={0.5}>
        Members
      </Typography>
      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
        {members.map((member) => (
          <Tooltip title={`${member.fullName} (${member.username})`} key={member._id}>
            <Avatar alt={member.fullName} src={member.avatar} sx={{ width: 36, height: 36 }} />
          </Tooltip>
        ))}
      </Box>
    </Box>
  )
}
export default Members

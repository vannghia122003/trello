import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { grey } from '@mui/material/colors'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import cardApi from '~/api/card.api'
import PopoverHeader from '~/components/PopoverHeader'
import useBoardStore from '~/stores/useBoardStore'
import { User } from '~/types'
import { QUERY_KEYS } from '~/utils/constants'

interface Props {
  onClose: () => void
  cardMembers: User[]
  cardId: string
}

function AddMember({ onClose, cardMembers, cardId }: Props) {
  const queryClient = useQueryClient()
  const addMemberMutation = useMutation({ mutationFn: cardApi.addMember })
  const removeMemberMutation = useMutation({ mutationFn: cardApi.removeMember })
  const members = useBoardStore((state) => state.members)
  const admins = useBoardStore((state) => state.admins)

  const boardMembers = [...members, ...admins].filter(
    (boardMember) => !cardMembers.some((cardMember) => cardMember._id === boardMember._id)
  )

  const handleAddMember = (memberId: string) => {
    addMemberMutation.mutate(
      { cardId, data: { memberId } },
      {
        onSuccess() {
          Promise.all([
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CARD, cardId] }),
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.BOARD] })
          ])
        }
      }
    )
  }

  const handleRemoveMember = (memberId: string) => {
    removeMemberMutation.mutate(
      { cardId, memberId },
      {
        onSuccess() {
          Promise.all([
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CARD, cardId] }),
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.BOARD] })
          ])
        }
      }
    )
  }

  return (
    <Box sx={{ width: '304px' }}>
      <PopoverHeader title="Members" onClose={onClose} />
      <Box sx={{ p: 1.5, pt: 0, maxHeight: 400, overflowY: 'auto' }}>
        {!!cardMembers.length && (
          <Box>
            <Typography fontSize="12px" fontWeight={600} mb={0.5}>
              Card members
            </Typography>
            {cardMembers.map((member) => (
              <Box
                key={member._id}
                sx={{
                  p: 0.5,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  '&:hover': { bgcolor: grey[200], cursor: 'pointer' }
                }}
                onClick={() => handleRemoveMember(member._id)}
              >
                <Avatar sx={{ width: 32, height: 32 }} src={member.avatar} alt={member.fullName} />
                <Typography fontSize="14px">{member.fullName}</Typography>
              </Box>
            ))}
          </Box>
        )}

        {!!boardMembers.length && (
          <Box>
            <Typography fontSize="12px" fontWeight={600} mb={0.5} mt={2}>
              Board members
            </Typography>
            {boardMembers.map((member) => (
              <Box
                key={member._id}
                sx={{
                  p: 0.5,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  '&:hover': { bgcolor: grey[200], cursor: 'pointer' }
                }}
                onClick={() => handleAddMember(member._id)}
              >
                <Avatar sx={{ width: 32, height: 32 }} src={member.avatar} alt={member.fullName} />
                <Typography fontSize="14px">{member.fullName}</Typography>
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  )
}
export default AddMember

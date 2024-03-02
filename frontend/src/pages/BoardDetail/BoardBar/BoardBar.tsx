import AddToDriveIcon from '@mui/icons-material/AddToDrive'
import BoltIcon from '@mui/icons-material/Bolt'
import CloseIcon from '@mui/icons-material/Close'
import FilterListIcon from '@mui/icons-material/FilterList'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import StarIcon from '@mui/icons-material/Star'
import StarOutlineIcon from '@mui/icons-material/StarOutline'
import { SxProps, Theme } from '@mui/material'
import Autocomplete from '@mui/material/Autocomplete'
import Avatar from '@mui/material/Avatar'
import AvatarGroup from '@mui/material/AvatarGroup'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'
import MenuItem from '@mui/material/MenuItem'
import Modal from '@mui/material/Modal'
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import boardApi from '~/api/board.api'
import userApi from '~/api/user.api'
import { useDebounce } from '~/hooks'
import useBoardStore from '~/stores/useBoardStore'
import { BoardStatus, User } from '~/types'
import { BOARD_BAR_HEIGHT, QUERY_KEYS } from '~/utils/constants'
import MemberItem from './MemberItem'
import SideMenu from './SideMenu'
import Title from './Title'
import Visibility from './Visibility'

const MENU_STYLES: SxProps<Theme> = {
  color: 'white',
  bgcolor: 'transparent',
  paddingX: '5px',
  border: 'none',
  borderRadius: '4px',
  '.MuiSvgIcon-root': { color: 'white' },
  '&:hover': { bgcolor: 'primary.50' }
}

function BoardBar() {
  const queryClient = useQueryClient()
  const [openModal, setOpenModal] = useState(false)
  const { admins, members, isBoardMember, boardId } = useBoardStore(
    useShallow(({ admins, members, isBoardMember, boardId }) => ({ admins, members, isBoardMember, boardId }))
  )

  const adminIds = admins.map((admin) => admin._id)
  const memberIds = members.map((member) => member._id)
  const addMemberMutation = useMutation({ mutationFn: boardApi.addMember })
  const starBoardMutation = useMutation({ mutationFn: boardApi.starBoard })
  const unstarBoardMutation = useMutation({ mutationFn: boardApi.unstarBoard })

  const [selectedMembers, setSelectedMembers] = useState<User[]>([])
  const [searchValue, setSearchValue] = useState('')
  const debouncedSearchValue = useDebounce(searchValue, 500)
  const { data: usersData, isFetching } = useQuery({
    queryKey: [QUERY_KEYS.USERS, debouncedSearchValue],
    queryFn: () => userApi.getUsers({ q: debouncedSearchValue }),
    enabled: Boolean(debouncedSearchValue)
  })
  const users = usersData?.data || []

  const { data: starredBoardsData } = useQuery({
    queryKey: [QUERY_KEYS.BOARD_LIST, BoardStatus.Starred],
    queryFn: () => boardApi.getBoards({ status: BoardStatus.Starred }),
    staleTime: 10 * 60 * 1000
  })
  const starredBoardIds = starredBoardsData?.data.map((board) => board._id)
  const isStarredBoard = starredBoardIds?.includes(boardId)

  const handleOpenModal = () => setOpenModal(true)
  const handleCloseModal = () => setOpenModal(false)

  const handleClosePopup = () => {
    queryClient.removeQueries({ queryKey: [QUERY_KEYS.USERS, debouncedSearchValue] })
  }

  const handleAddMember = () => {
    if (selectedMembers.length === 0) return
    setSearchValue('')
    setSelectedMembers([])
    addMemberMutation.mutate(
      { boardId, userIds: selectedMembers.map((member) => member._id) },
      { onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.BOARD] }) }
    )
  }

  const handleStarBoard = () => {
    starBoardMutation.mutate(boardId, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.BOARD_LIST, BoardStatus.Starred] })
    })
  }

  const handleUnstarBoard = () => {
    unstarBoardMutation.mutate(boardId, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.BOARD_LIST, BoardStatus.Starred] })
    })
  }

  return (
    <Box
      sx={{
        width: '100%',
        height: BOARD_BAR_HEIGHT,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 2,
        paddingX: 2,
        overflowX: 'auto',
        bgcolor: '#0000003d'
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Title />

        {isBoardMember && (
          <Tooltip
            enterDelay={500}
            title="Click to star or unstar this board. Starred boards show up at the top of your boards list."
          >
            {isStarredBoard ? (
              <Chip
                sx={{
                  ...MENU_STYLES,
                  '& .MuiChip-label': { display: 'none' },
                  '.MuiSvgIcon-root': { margin: 0, color: 'white' }
                }}
                icon={<StarIcon />}
                clickable
                onClick={handleUnstarBoard}
              />
            ) : (
              <Chip
                sx={{
                  ...MENU_STYLES,
                  '& .MuiChip-label': { display: 'none' },
                  '.MuiSvgIcon-root': { margin: 0, color: 'white' }
                }}
                icon={<StarOutlineIcon />}
                clickable
                onClick={handleStarBoard}
              />
            )}
          </Tooltip>
        )}

        <Visibility />
        <Chip sx={MENU_STYLES} icon={<AddToDriveIcon />} label="Add To Google Drive" clickable onClick={() => {}} />
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Chip sx={MENU_STYLES} icon={<BoltIcon />} label="Automation" clickable onClick={() => {}} />
        <Chip sx={MENU_STYLES} icon={<FilterListIcon />} label="Filter" clickable onClick={() => {}} />
        {isBoardMember && (
          <Button
            variant="outlined"
            startIcon={<PersonAddIcon />}
            sx={{ color: 'white', borderColor: 'white', '&:hover': { borderColor: 'white' } }}
            onClick={handleOpenModal}
          >
            Share
          </Button>
        )}
        <AvatarGroup
          max={4}
          sx={{
            gap: 1,
            '& .MuiAvatar-root': {
              width: 34,
              height: 34,
              fontSize: 16,
              border: 'none',
              color: 'white'
            }
          }}
        >
          {[...admins, ...members].map((member) => (
            <Tooltip title={`${member.fullName} (${member.username})`} key={member._id}>
              <Avatar alt={member.fullName} src={member.avatar} />
            </Tooltip>
          ))}
        </AvatarGroup>
        <SideMenu />
      </Box>

      {/* Modal */}
      <Modal open={openModal} onClose={handleCloseModal}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '500px',
            maxWidth: '100%',
            bgcolor: 'background.paper',
            borderRadius: '8px',
            pt: 2,
            pb: 3,
            color: '#172B4D'
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 3 }}>
            <Typography sx={{ fontSize: '20px' }}>Share board</Typography>
            <IconButton onClick={handleCloseModal}>
              <CloseIcon />
            </IconButton>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, px: 3, py: 1 }}>
            <Autocomplete
              size="small"
              multiple
              fullWidth
              clearOnBlur={false}
              options={searchValue ? users : []}
              filterOptions={(options) => options.filter((option) => ![...adminIds, ...memberIds].includes(option._id))}
              getOptionLabel={(option) => option.fullName}
              loading={isFetching}
              loadingText={
                <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                  <CircularProgress size={20} />
                </Box>
              }
              noOptionsText="No results"
              onClose={handleClosePopup}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder={!selectedMembers.length ? 'Enter address or name' : ''}
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                />
              )}
              value={selectedMembers}
              onChange={(_, value) => {
                setSearchValue('')
                setSelectedMembers(value)
              }}
              renderOption={(props, option) => (
                <MenuItem {...props} key={option._id} value={option._id} sx={{ justifyContent: 'space-around' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar alt={option.fullName} src={option.avatar} sx={{ width: 36, height: 36 }} />
                    <Box>
                      <Typography fontSize="14px">{option.fullName}</Typography>
                      <Typography fontSize="12px">@{option.username}</Typography>
                    </Box>
                  </Box>
                </MenuItem>
              )}
            />

            <Button variant="contained" onClick={handleAddMember}>
              Share
            </Button>
          </Box>

          <Box sx={{ px: 3, mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {[...admins, ...members].map((member) => (
              <MemberItem key={member._id} adminIds={adminIds} memberIds={memberIds} member={member} />
            ))}
          </Box>
        </Box>
      </Modal>
    </Box>
  )
}
export default BoardBar

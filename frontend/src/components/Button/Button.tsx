import Button, { ButtonProps } from '@mui/material/Button'
import { grey } from '@mui/material/colors'
import { styled } from '@mui/material/styles'

export const ButtonGray = styled(Button)<ButtonProps>({
  backgroundColor: grey[300],
  color: 'black',
  '&:hover': { backgroundColor: grey[400] }
})

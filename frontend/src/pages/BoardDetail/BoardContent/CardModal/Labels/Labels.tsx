import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { Label } from '~/types'
import LabelItem from '../LabelItem'

interface Props {
  labels: Label[]
}

function Labels({ labels }: Props) {
  if (labels.length === 0) return null

  return (
    <Box sx={{ mt: 1, ml: 4 }}>
      <Typography fontSize="12px" fontWeight={600} mb={0.5}>
        Labels
      </Typography>
      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
        {labels.map((label) => (
          <LabelItem key={label._id} hex={label.hex} title={label.title} name={label.name} disableHover />
        ))}
      </Box>
    </Box>
  )
}
export default Labels

import SubjectIcon from '@mui/icons-material/Subject'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import Typography from '@mui/material/Typography'
import { grey } from '@mui/material/colors'
import MDEditor from '@uiw/react-md-editor'
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import rehypeSanitize from 'rehype-sanitize'
import { ButtonGray } from '~/components/Button'
import Editor from '~/components/Editor'
import useBoardStore from '~/stores/useBoardStore'

interface Props {
  description: string
  addDescription: (description: string) => void
}

function Description({ description, addDescription }: Props) {
  const [open, setOpen] = useState(false)
  const isBoardMember = useBoardStore((state) => state.isBoardMember)
  const { control, setValue, watch } = useForm({ defaultValues: { description: '' } })
  const value = watch('description')

  useEffect(() => {
    setValue('description', description)
  }, [description, setValue])

  const handleOpenEditor = () => {
    if (!isBoardMember) return
    setOpen(true)
  }

  const handleCloseEditor = () => {
    setValue('description', description)
    setOpen(false)
  }

  const handleAddDescription = () => {
    setOpen(false)
    if (open) {
      setValue('description', value)
      if (value !== description) addDescription(value)
    }
  }

  return (
    <ClickAwayListener onClickAway={handleAddDescription}>
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SubjectIcon />
            <Typography variant="h3" fontSize="16px" fontWeight="500">
              Description
            </Typography>
          </Box>
          {isBoardMember && !open && description && (
            <ButtonGray size="small" onClick={handleOpenEditor}>
              Edit
            </ButtonGray>
          )}
        </Box>

        <Box sx={{ ml: 4 }}>
          {isBoardMember && !open && !description && (
            <Box
              onClick={handleOpenEditor}
              sx={{
                p: 1.5,
                userSelect: 'none',
                borderRadius: '3px',
                backgroundColor: grey[300],
                '&:hover': { backgroundColor: grey[400], cursor: 'pointer' }
              }}
            >
              <Typography sx={{ minHeight: '40px', fontWeight: 500, color: 'black', fontSize: '14px' }}>
                Add a more detailed description...
              </Typography>
            </Box>
          )}
          {!open && description && (
            <Box sx={{ cursor: isBoardMember ? 'pointer' : 'default' }} onClick={handleOpenEditor}>
              <MDEditor.Markdown
                source={value}
                style={{ backgroundColor: 'inherit' }}
                rehypePlugins={[[rehypeSanitize]]}
              />
            </Box>
          )}

          {/* Start box editor */}
          {open && (
            <>
              <Controller
                control={control}
                name="description"
                render={({ field }) => <Editor value={field.value} onChange={field.onChange} />}
              />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, mt: 1 }}>
                <Button size="small" variant="contained" onClick={handleAddDescription}>
                  Save
                </Button>
                <Button
                  onClick={handleCloseEditor}
                  size="small"
                  variant="text"
                  sx={{
                    backgroundColor: 'transparent',
                    color: (theme) => (theme.palette.mode === 'light' ? 'black' : 'white'),
                    '&:hover': { backgroundColor: grey[300] }
                  }}
                >
                  Cancel
                </Button>
              </Box>
            </>
          )}
          {/* End box editor */}
        </Box>
      </Box>
    </ClickAwayListener>
  )
}
export default Description

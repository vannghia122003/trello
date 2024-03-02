import Button, { ButtonProps } from '@mui/material/Button'
import { styled } from '@mui/material/styles'

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1
})

interface Props extends ButtonProps {
  onFileChange?: (files?: File[]) => void
  multiple?: boolean
}

function InputFile({ children, onFileChange, multiple, ...rest }: Props) {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    files && onFileChange && onFileChange(Array.from(files))
  }

  return (
    <Button component="label" {...rest}>
      {children}
      <VisuallyHiddenInput type="file" multiple={multiple} onChange={handleFileChange} />
    </Button>
  )
}
export default InputFile

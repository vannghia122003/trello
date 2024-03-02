import MDEditor from '@uiw/react-md-editor'
import rehypeSanitize from 'rehype-sanitize'

interface Props {
  value: string
  onChange: (value?: string) => void
}

function Editor({ value, onChange }: Props) {
  return (
    <MDEditor
      autoFocus
      preview="edit"
      height="100%"
      extraCommands={[]}
      visibleDragbar={false}
      previewOptions={{ rehypePlugins: [[rehypeSanitize]] }}
      value={value}
      onChange={onChange}
    />
  )
}

export default Editor

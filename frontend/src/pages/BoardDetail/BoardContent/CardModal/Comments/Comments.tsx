import { yupResolver } from '@hookform/resolvers/yup'
import AddReactionOutlinedIcon from '@mui/icons-material/AddReactionOutlined'
import LoadingButton from '@mui/lab/LoadingButton'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'
import { grey } from '@mui/material/colors'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import MDEditor from '@uiw/react-md-editor'
import { useConfirm } from 'material-ui-confirm'
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import rehypeSanitize from 'rehype-sanitize'
import * as yup from 'yup'
import cardApi from '~/api/card.api'
import Editor from '~/components/Editor'
import useAuthStore from '~/stores/useAuthStore'
import useBoardStore from '~/stores/useBoardStore'
import { Comment as CommentType } from '~/types'
import { QUERY_KEYS } from '~/utils/constants'
import { formatDateString } from '~/utils/helpers'

interface Props {
  cardId: string
}
interface ExtendedComment extends CommentType {
  isEditing: boolean
}
const schema = yup.object({
  content: yup.string().required()
})

function Comments({ cardId }: Props) {
  const confirm = useConfirm()
  const queryClient = useQueryClient()
  const profile = useAuthStore((state) => state.profile)
  const isBoardMember = useBoardStore((state) => state.isBoardMember)
  const [open, setOpen] = useState(false)
  const [comments, setComments] = useState<ExtendedComment[]>([])
  const createCommentForm = useForm({ resolver: yupResolver(schema) })
  const updateCommentForm = useForm({ resolver: yupResolver(schema) })
  const createCommentMutation = useMutation({ mutationFn: cardApi.createComment })
  const updateCommentMutation = useMutation({ mutationFn: cardApi.updateComment })
  const deleteCommentMutation = useMutation({ mutationFn: cardApi.deleteComment })
  const { data, refetch, isPending } = useQuery({
    queryKey: [QUERY_KEYS.COMMENTS, cardId],
    queryFn: () => cardApi.getComments(cardId),
    staleTime: 10 * 60 * 1000
  })

  useEffect(() => {
    setComments(data?.data.map((comment) => ({ ...comment, isEditing: false })) || [])
  }, [data?.data])

  const handleOpenEditor = () => setOpen(true)
  const handleCloseEditor = () => {
    setOpen(false)
    createCommentForm.reset()
  }

  const handleAddComment = createCommentForm.handleSubmit((data) => {
    createCommentMutation.mutate(
      { cardId, data },
      {
        onSuccess() {
          handleCloseEditor()
          refetch()
          queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.BOARD] })
        }
      }
    )
  })

  const toggleEditComment = (commentId: string, isEditing: boolean, content?: string) => {
    content && updateCommentForm.setValue('content', content)
    setComments((prev) => prev.map((comment) => ({ ...comment, isEditing: comment._id === commentId && isEditing })))
  }

  const handleUpdateComment = (commentId: string, oldContent: string) =>
    updateCommentForm.handleSubmit((data) => {
      toggleEditComment(commentId, false)

      if (oldContent !== data.content) {
        updateCommentMutation.mutate({ cardId, commentId, data }, { onSuccess: () => refetch() })
      }
    })

  const handleDeleteComment = (commentId: string) => {
    confirm({
      title: 'Delete comment?',
      description: 'Deleting a comment is forever. There is no undo.',
      confirmationText: 'Delete comment'
    })
      .then(() => {
        deleteCommentMutation.mutate(
          { cardId, commentId },
          {
            onSuccess() {
              refetch()
              queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.BOARD] })
            }
          }
        )
      })
      .catch(() => {})
  }

  return (
    <Box>
      {isBoardMember && (
        <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
          <Avatar sx={{ width: 32, height: 32, ml: -1 }} src={profile?.avatar} />
          {!open && (
            <Box
              onClick={handleOpenEditor}
              sx={{
                px: 1.5,
                py: 1,
                width: '100%',
                borderRadius: '8px',
                userSelect: 'none',
                bgcolor: '#fff',
                boxShadow: 1,
                '&:hover': { backgroundColor: grey[100], cursor: 'pointer' }
              }}
            >
              <Typography sx={{ color: 'black', fontSize: '14px' }}>Write a comment...</Typography>
            </Box>
          )}

          {open && (
            <Box component="form" sx={{ width: '100%' }} onSubmit={handleAddComment}>
              <Box>
                <Controller
                  control={createCommentForm.control}
                  name="content"
                  render={({ field }) => <Editor value={field.value} onChange={field.onChange} />}
                />
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, mt: 1 }}>
                <LoadingButton
                  size="small"
                  variant="contained"
                  type="submit"
                  loading={createCommentMutation.isPending}
                  disabled={!createCommentForm.watch('content')}
                >
                  Save
                </LoadingButton>
                <Button
                  onClick={handleCloseEditor}
                  size="small"
                  variant="text"
                  type="button"
                  sx={{
                    backgroundColor: 'transparent',
                    color: (theme) => (theme.palette.mode === 'light' ? 'black' : 'white'),
                    '&:hover': { backgroundColor: grey[300] }
                  }}
                >
                  Cancel
                </Button>
              </Box>
            </Box>
          )}
        </Box>
      )}

      {/* list comment */}
      <Box>
        {isPending && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 1 }}>
            <CircularProgress />
          </Box>
        )}
        {!isPending &&
          comments.map((comment) => (
            <Box key={comment._id}>
              <Box key={comment._id} sx={{ display: 'flex', gap: 1, py: 1 }}>
                <Avatar sx={{ width: 32, height: 32, ml: -1 }} src={comment.user.avatar} />
                <Box sx={{ width: '100%' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
                    <Typography fontSize="14px" fontWeight="700" mr={1}>
                      {comment.user.fullName}
                    </Typography>
                    <Typography fontSize="12px">
                      {formatDateString(comment.createdAt)} {comment.createdAt !== comment.updatedAt && '(edited)'}
                    </Typography>
                  </Box>

                  {!comment.isEditing && (
                    <>
                      <Box sx={{ px: 1.5, py: 1, my: 0.5, borderRadius: 2, bgcolor: '#fff', boxShadow: 1 }}>
                        <MDEditor.Markdown source={comment.content} rehypePlugins={[[rehypeSanitize]]} />
                      </Box>
                      {isBoardMember && (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <AddReactionOutlinedIcon
                            titleAccess="Add reaction"
                            sx={{ cursor: 'pointer', fontSize: '16px' }}
                          />
                          <Box component="span" sx={{ mx: 0.5 }}>
                            •
                          </Box>
                          <Typography
                            sx={{ textDecoration: 'underline', cursor: 'pointer', fontSize: '12px' }}
                            onClick={() => toggleEditComment(comment._id, true, comment.content)}
                          >
                            Edit
                          </Typography>
                          <Box component="span" sx={{ mx: 0.5 }}>
                            •
                          </Box>
                          <Typography
                            sx={{ textDecoration: 'underline', cursor: 'pointer', fontSize: '12px' }}
                            onClick={() => handleDeleteComment(comment._id)}
                          >
                            Delete
                          </Typography>
                        </Box>
                      )}
                    </>
                  )}

                  {comment.isEditing && (
                    <Box component="form" onSubmit={handleUpdateComment(comment._id, comment.content)}>
                      <Controller
                        control={updateCommentForm.control}
                        name="content"
                        render={({ field }) => <Editor value={field.value} onChange={field.onChange} />}
                      />
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, mt: 1 }}>
                        <Button
                          size="small"
                          variant="contained"
                          type="submit"
                          disabled={!updateCommentForm.watch('content')}
                        >
                          Save
                        </Button>
                        <Button
                          size="small"
                          variant="text"
                          type="button"
                          sx={{
                            backgroundColor: 'transparent',
                            color: (theme) => (theme.palette.mode === 'light' ? 'black' : 'white'),
                            '&:hover': { backgroundColor: grey[300] }
                          }}
                          onClick={() => toggleEditComment(comment._id, false, comment.content)}
                        >
                          Discard changes
                        </Button>
                      </Box>
                    </Box>
                  )}
                </Box>
              </Box>
            </Box>
          ))}
      </Box>
    </Box>
  )
}
export default Comments

import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import CloseIcon from '@mui/icons-material/Close'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'
import OutlinedInput from '@mui/material/OutlinedInput'
import Typography from '@mui/material/Typography'
import { grey } from '@mui/material/colors'
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Photos, PhotosWithTotalResults } from 'pexels'
import { ChangeEvent, UIEvent, useRef, useState } from 'react'
import cardApi from '~/api/card.api'
import pexelsApi from '~/api/pexels.api'
import userApi from '~/api/user.api'
import { ButtonGray } from '~/components/Button'
import InputFile from '~/components/InputFile'
import PopoverHeader from '~/components/PopoverHeader'
import { useDebounce, useUpdateCard } from '~/hooks'
import { AttachmentType } from '~/types'
import { QUERY_KEYS } from '~/utils/constants'
import Photo from './Photo'

interface Props {
  cardId: string
  coverImage: string
  onClose: () => void
}

const suggestedSearches = ['Productivity', 'Perspective', 'Organization', 'Colorful', 'Nature', 'Business', 'Space']

function CreateCover({ cardId, coverImage, onClose }: Props) {
  const queryClient = useQueryClient()
  const inputRef = useRef<null | HTMLInputElement>(null)
  const [mode, setMode] = useState<'Cover' | 'Photo search'>('Cover')
  const [searchValue, setSearchValue] = useState('')
  const debouncedSearchValue = useDebounce(searchValue, 800)

  const {
    data: searchData,
    fetchNextPage,
    isFetchingNextPage,
    isPending: isSearchPending
  } = useInfiniteQuery({
    queryKey: [QUERY_KEYS.PHOTOS, debouncedSearchValue],
    queryFn: ({ pageParam }) =>
      pexelsApi.searchPhotos({ params: { per_page: 10, page: pageParam }, query: debouncedSearchValue }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      return (lastPage as PhotosWithTotalResults).next_page ? allPages.length + 1 : null
    },
    enabled: Boolean(debouncedSearchValue)
  })

  const { data: attachmentsData } = useQuery({
    queryKey: [QUERY_KEYS.ATTACHMENTS, cardId],
    queryFn: () => cardApi.getAttachments(cardId),
    staleTime: 10 * 60 * 1000
  })
  const { data: curatedPhotosData } = useQuery({
    queryKey: [QUERY_KEYS.PHOTOS],
    queryFn: () => pexelsApi.getCuratedPhotos({ per_page: 9 }),
    staleTime: 10 * 60 * 1000
  })

  const updateCardMutation = useUpdateCard(cardId)
  const uploadImageMutation = useMutation({ mutationFn: userApi.uploadImage })
  const createAttachmentMutation = useMutation({ mutationFn: cardApi.createAttachment })
  const attachments = attachmentsData?.data.filter((attachment) => attachment.type === AttachmentType.Image) || []
  const photos = (curatedPhotosData as Photos | undefined)?.photos || []

  const handleUpdateCoverImage = (backgroundUrl: string) => {
    if (backgroundUrl !== coverImage) {
      updateCardMutation.mutate({ cardId, data: { cover: backgroundUrl } })
    }
  }

  const handleUploadCoverImage = async (fileList?: File[]) => {
    const file = fileList?.[0]
    if (file) {
      const formData = new FormData()
      formData.append('images', file)
      const uploadRes = await uploadImageMutation.mutateAsync(formData)
      await Promise.all([
        updateCardMutation.mutateAsync({ cardId, data: { cover: uploadRes.data[0] } }),
        createAttachmentMutation.mutateAsync({
          cardId,
          data: { name: file.name, type: AttachmentType.Image, url: uploadRes.data[0] }
        })
      ])
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.BOARD] }),
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CARD, cardId] }),
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ATTACHMENTS, cardId] })
      ])
    }
  }

  const handleClickKeyWord = (word: string) => {
    setSearchValue(word)
    inputRef.current?.focus()
  }

  const handleScrollSearchResult = (e: UIEvent<HTMLDivElement>) => {
    const { scrollTop, clientHeight, scrollHeight } = e.target as HTMLElement
    if (scrollTop + clientHeight == scrollHeight) fetchNextPage()
  }

  return (
    <Box sx={{ width: '304px' }}>
      <PopoverHeader title={mode} onClose={onClose}>
        {mode === 'Photo search' && (
          <IconButton
            size="small"
            onClick={() => setMode('Cover')}
            sx={{
              position: 'absolute',
              top: '50%',
              left: 3,
              transform: 'translateY(-50%)',
              borderRadius: 2,
              '.MuiTouchRipple-ripple .MuiTouchRipple-child': { borderRadius: 2 }
            }}
          >
            <ChevronLeftIcon />
          </IconButton>
        )}
      </PopoverHeader>
      {mode === 'Cover' && (
        <Box sx={{ p: 1.5 }}>
          <Box sx={{ mb: 2 }}>
            <Typography fontWeight="500" fontSize="12px" marginBottom="4px">
              Attachments
            </Typography>
            <Grid container spacing={0.5} mb={1}>
              {attachments.map((attachment) => (
                <Grid item xs={4} key={attachment._id}>
                  <Photo
                    coverImage={coverImage}
                    photoUrl={attachment.url}
                    onClick={() => handleUpdateCoverImage(attachment.url)}
                  />
                </Grid>
              ))}
            </Grid>

            {uploadImageMutation.isPending && (
              <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                <CircularProgress size={30} />
              </Box>
            )}
            {!uploadImageMutation.isPending && (
              <InputFile
                fullWidth
                sx={{ backgroundColor: grey[200], color: 'black', '&:hover': { backgroundColor: grey[300] } }}
                onFileChange={handleUploadCoverImage}
              >
                Upload a cover image
              </InputFile>
            )}
          </Box>
          <Box>
            <Typography fontWeight="500" fontSize="12px" marginBottom="4px">
              Photos from Pexels
            </Typography>
            <Grid container spacing={0.5} mb={1}>
              {photos.slice(0, 6).map((photo) => (
                <Grid item xs={4} key={photo.id}>
                  <Photo
                    coverImage={coverImage}
                    photoUrl={photo.src['tiny']}
                    photographer={photo.photographer}
                    photographerUrl={photo.photographer_url}
                    onClick={() => handleUpdateCoverImage(photo.src['tiny'])}
                  />
                </Grid>
              ))}
            </Grid>
            <ButtonGray fullWidth onClick={() => setMode('Photo search')}>
              Search for photos
            </ButtonGray>
          </Box>
        </Box>
      )}
      {mode === 'Photo search' && (
        <Box sx={{ p: 1.5 }}>
          <OutlinedInput
            inputRef={inputRef}
            size="small"
            placeholder="Search Pexels for photos"
            fullWidth
            endAdornment={
              <CloseIcon
                sx={{ cursor: 'pointer', display: searchValue ? 'block' : 'none' }}
                onClick={() => setSearchValue('')}
              />
            }
            sx={{ mb: 1.5, pr: 1, '& .MuiOutlinedInput-input': { pr: 1 } }}
            value={searchValue}
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
              setSearchValue(event.target.value)
            }}
          />
          {!searchValue && (
            <Box sx={{ mb: 2 }}>
              <Typography fontWeight="500" fontSize="12px" marginBottom="4px">
                Suggested searches
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {suggestedSearches.map((word, i) => (
                  <ButtonGray key={i} onClick={() => handleClickKeyWord(word)}>
                    {word}
                  </ButtonGray>
                ))}
              </Box>
            </Box>
          )}
          {!searchValue && (
            <Box>
              <Typography fontWeight="500" fontSize="12px" marginBottom="4px">
                Top photos
              </Typography>
              <Grid container spacing={0.5} mb={1}>
                {photos.map((photo) => (
                  <Grid item xs={4} key={photo.id}>
                    <Photo
                      coverImage={coverImage}
                      photoUrl={photo.src['tiny']}
                      photographer={photo.photographer}
                      photographerUrl={photo.photographer_url}
                      onClick={() => handleUpdateCoverImage(photo.src['tiny'])}
                    />
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {searchValue && (
            <Box>
              <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', px: '2px', mb: '4px' }}>
                <Typography fontWeight="500" fontSize="12px">
                  Results
                </Typography>
                {(isSearchPending || isFetchingNextPage) && <CircularProgress size={18} sx={{ mr: 1.5 }} />}
              </Box>

              {!isSearchPending && (
                <Box sx={{ maxHeight: '300px', overflowY: 'auto' }} onScroll={handleScrollSearchResult}>
                  {searchData?.pages.map((page, i) => {
                    const photos = (page as PhotosWithTotalResults).photos
                    return (
                      <Grid container spacing={0.5} key={i} padding="2px">
                        {photos.map((photo) => (
                          <Grid item xs={6} key={photo.id}>
                            <Photo
                              coverImage={coverImage}
                              photoUrl={photo.src['tiny']}
                              photographer={photo.photographer}
                              photographerUrl={photo.photographer_url}
                              onClick={() => handleUpdateCoverImage(photo.src['tiny'])}
                            />
                          </Grid>
                        ))}
                      </Grid>
                    )
                  })}
                </Box>
              )}
            </Box>
          )}
        </Box>
      )}
    </Box>
  )
}
export default CreateCover

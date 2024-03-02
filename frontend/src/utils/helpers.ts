import { Card, List } from '~/types'

export const capitalizeFirstLetter = (value: string) => {
  return `${value.charAt(0).toUpperCase()}${value.slice(1)}`
}

export const sortByOrder = <T>(originalArray: T[], orderArray: string[], key: keyof T) => {
  // if (!originalArray || !orderArray || !key) return []
  return orderArray.map((id) => originalArray.find((item) => item[key] === id) as T)
}

export const generatePlaceholderCard = (list: List): Card => ({
  _id: `${list._id}-placeholder-card`,
  listId: list._id,
  title: '',
  description: '',
  cover: '',
  memberIds: [],
  comments: [],
  labels: [],
  attachments: [],
  createdAt: '',
  updatedAt: '',
  _deleted: false,
  FE_PlaceholderCard: true
})

export const formatDateString = (isoString: string) => {
  const date = new Date(isoString)
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  const month = monthNames[date.getMonth()]
  const day = date.getDate()
  const hours = date.getHours()
  const year = date.getFullYear()
  const minutes = date.getMinutes().toString().padStart(2, '0')
  const period = hours >= 12 ? 'PM' : 'AM'

  // Chuyển đổi giờ sang định dạng 12 giờ
  const formattedHours = hours % 12 || 12

  return `${month} ${day}, ${year} at ${formattedHours}:${minutes} ${period}`
}

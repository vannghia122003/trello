export const APP_BAR_HEIGHT = '58px'
export const BOARD_BAR_HEIGHT = '60px'
export const BOARD_CONTENT_HEIGHT = `calc(100vh - ${APP_BAR_HEIGHT} - ${BOARD_BAR_HEIGHT})`
export const LIST_HEADER_HEIGHT = '50px'
export const LIST_FOOTER_HEIGHT = '50px'
export const ADD_CARD_FORM_HEIGHT = '135px'
export const API_URL = import.meta.env.PROD ? import.meta.env.VITE_API_URL : 'http://localhost:4000'

export const path = {
  home: '/',
  boardDetail: '/boards/:boardId',
  login: '/login',
  register: '/register',
  profile: '/profile'
}

export const QUERY_KEYS = {
  PROFILE: 'profile',
  BOARD_LIST: 'boards',
  BOARD: 'board',
  BACKGROUND: 'background',
  CLOSED_LISTS: 'lists/closed',
  CLOSED_CARDS: 'cards/closed',
  CARD: 'card',
  COMMENTS: 'comments',
  ATTACHMENTS: 'attachments',
  PHOTOS: 'photos',
  USERS: 'users'
}

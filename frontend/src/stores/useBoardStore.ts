import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { BoardDetail, Card, Label, List, User, Visibility } from '~/types'
import { generatePlaceholderCard } from '~/utils/helpers'
import useAuthStore from './useAuthStore'

interface State {
  boardId: string
  title: string
  visibility: Visibility
  lists: List[]
  cards: Card[]
  listOrderIds: string[]
  labels: Label[]
  backgroundId: string
  ownerId: string
  members: User[]
  admins: User[]
  isBoardMember: boolean
  isBoardAdmin: boolean
}

interface Actions {
  setBoard: (board: BoardDetail) => void
  updateListOrderIds: (listOrderIds: string[]) => void
  updateTitle: (title: string) => void
  moveCardInTheSameList: (payload: { listId: string; cardOrderIds: string[] }) => void
  moveCardBetweenDifferentList2: (payload: {
    cardId: string
    prevListId: string
    newCardIndex: number
    nextListId: string
  }) => void
  moveCardBetweenDifferentList: (payload: { cardId: string; nextActiveList: List; nextOverList: List }) => void
  addCard: (card: Card) => void
  reset: () => void
}

const initialState: State = {
  boardId: '',
  title: '',
  visibility: Visibility.Private as Visibility,
  lists: [],
  cards: [],
  listOrderIds: [],
  labels: [],
  backgroundId: '',
  ownerId: '',
  members: [],
  admins: [],
  isBoardMember: false,
  isBoardAdmin: false
}

const useBoardStore = create<State & Actions>()(
  immer((set) => ({
    ...initialState,
    setBoard(board) {
      set((state) => {
        const { _id, title, listOrderIds, lists, cards, visibility, background, members, admins, ownerId, labels } =
          board
        const profile = useAuthStore.getState().profile
        const adminIds = admins.map((admin) => admin._id)
        const memberIds = [...members.map((member) => member._id), ...adminIds]
        state.isBoardAdmin = adminIds.includes(profile?._id || '')
        state.isBoardMember = memberIds.includes(profile?._id || '')
        state.boardId = _id
        state.title = title
        state.listOrderIds = listOrderIds
        state.labels = labels
        state.lists = lists
        state.cards = cards
        state.visibility = visibility
        state.backgroundId = background._id
        state.ownerId = ownerId
        state.members = members
        state.admins = admins

        // xử lí thêm placehoder card vào list rỗng
        const listIds = cards.map((c) => c.listId) // danh sách các list có card
        lists.forEach((list) => {
          if (!listIds.includes(list._id)) {
            cards.push(generatePlaceholderCard(list))
            list.cardOrderIds.push(generatePlaceholderCard(list)._id)
          }
        })
      })
    },
    updateListOrderIds(listOrderIds) {
      set((state) => {
        state.listOrderIds = listOrderIds
      })
    },
    updateTitle(title) {
      set((state) => {
        state.title = title
      })
    },
    moveCardInTheSameList(payload) {
      set((state) => {
        const { listId, cardOrderIds } = payload
        const list = state.lists.find((l) => l._id === listId)
        if (list) {
          list.cardOrderIds = cardOrderIds
        }
      })
    },
    moveCardBetweenDifferentList2(payload) {
      set((state) => {
        const { cardId, prevListId, nextListId, newCardIndex } = payload
        const prevList = state.lists.find((l) => l._id === prevListId)
        const nextList = state.lists.find((l) => l._id === nextListId)
        const card = state.cards.find((c) => c._id === cardId) // tìm card đang kéo
        if (prevList && nextList && card) {
          card.listId = nextListId
          prevList.cardOrderIds = prevList.cardOrderIds.filter((id) => id !== cardId) // xoá card ở activeList (list chứa card đang kéo)
          nextList.cardOrderIds.splice(newCardIndex, 0, card._id) // thêm card đang kéo vào overList theo vị trí index mới
        }

        // xử lí thêm placehoder card vào list rỗng
        const listIds = state.cards.map((c) => c.listId) // danh sách các list có card
        state.lists.forEach((list) => {
          if (!listIds.includes(list._id)) {
            state.cards.push(generatePlaceholderCard(list))
            list.cardOrderIds.push(generatePlaceholderCard(list)._id)
          }
        })
      })
    },

    moveCardBetweenDifferentList(payload) {
      set((state) => {
        const { cardId, nextActiveList, nextOverList } = payload
        const prevList = state.lists.find((l) => l._id === nextActiveList._id)
        const nextList = state.lists.find((l) => l._id === nextOverList._id)
        const card = state.cards.find((c) => c._id === cardId) // tìm card đang kéo
        if (card && prevList && nextList) {
          card.listId = nextOverList._id
          prevList.cardOrderIds = nextActiveList.cardOrderIds // xoá card ở activeList (list chứa card đang kéo)
          nextList.cardOrderIds = nextOverList.cardOrderIds // thêm card đang kéo vào overList theo vị trí index mới
        }
      })
    },
    addCard(card) {
      set((state) => {
        state.cards.push(card)
      })
    },
    reset() {
      set(initialState)
    }
  }))
)

export default useBoardStore

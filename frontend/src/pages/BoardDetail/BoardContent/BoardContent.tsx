import {
  CollisionDetection,
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  DropAnimation,
  MouseSensor,
  TouchSensor,
  UniqueIdentifier,
  closestCorners,
  defaultDropAnimationSideEffects,
  getFirstCollision,
  pointerWithin,
  useSensor,
  useSensors
} from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import Box from '@mui/material/Box'
import { useMutation } from '@tanstack/react-query'
import cloneDeep from 'lodash/cloneDeep'
import isEmpty from 'lodash/isEmpty'
import { useCallback, useMemo, useRef, useState } from 'react'
import boardApi from '~/api/board.api'
import listApi from '~/api/list.api'
import { useUpdateBoard } from '~/hooks'
import useBoardStore from '~/stores/useBoardStore'
import { Card as CardType, List as ListType } from '~/types'
import { BOARD_CONTENT_HEIGHT } from '~/utils/constants'
import { generatePlaceholderCard, sortByOrder } from '~/utils/helpers'
import Card from './Card'
import List from './List'
import ListContainer from './ListContainer'

type DragItemType = 'LIST' | 'CARD' | null

function BoardContent() {
  const boardId = useBoardStore((state) => state.boardId)
  const backgroundId = useBoardStore((state) => state.backgroundId)
  const title = useBoardStore((state) => state.title)
  const visibility = useBoardStore((state) => state.visibility)
  const lists = useBoardStore((state) => state.lists)
  const cards = useBoardStore((state) => state.cards)
  const listOrderIds = useBoardStore((state) => state.listOrderIds)
  const addCard = useBoardStore((state) => state.addCard)
  const updateListOrderIds = useBoardStore((state) => state.updateListOrderIds)
  const moveCardInTheSameList = useBoardStore((state) => state.moveCardInTheSameList)
  const moveCardBetweenDifferentList = useBoardStore((state) => state.moveCardBetweenDifferentList)

  const updateBoardMutation = useUpdateBoard(boardId)
  const updateListMutation = useMutation({ mutationFn: listApi.updateList })
  const movingCardMutation = useMutation({ mutationFn: boardApi.movingCard })

  const orderedLists = useMemo(() => sortByOrder(lists, listOrderIds, '_id'), [listOrderIds, lists])
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 10 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 500 } })
  )

  const [activeDragItemType, setActiveDragItemType] = useState<DragItemType>(null)
  const [activeDragItemData, setActiveDragItemData] = useState<ListType | CardType | null>(null)
  const [activeListData, setActiveListData] = useState<ListType | null>(null) // list cũ khi kéo card
  const lastOverId = useRef<UniqueIdentifier | null>(null) // tạo ref lưu lại điểm va chạm cuối cùng

  const dropAnimation: DropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: '0.5' } } })
  }

  // tìm ra list theo card id
  const findListByCardId = (cardId: string) => {
    const card = cards.find((c) => c._id === cardId)
    return orderedLists.find((list) => list._id === card?.listId) || null
  }

  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragItemType(event.active.data.current?.listId ? 'CARD' : 'LIST')
    setActiveDragItemData(event.active.data.current as ListType | CardType)
    if (event.active.data.current?.listId) {
      // nếu kéo card
      setActiveListData(findListByCardId(event.active.id as string))
    }
  }

  const handleDragOver = (event: DragOverEvent) => {
    // console.log('DragOverEvent: ', event)
    const { active, over } = event
    if (!over) return // over = null khi kéo ra ngoài thì return
    if (activeDragItemType === 'LIST') return

    const draggingCardId = active.id as string
    const overCardId = over.id as string
    const activeList = findListByCardId(draggingCardId)
    const overList = findListByCardId(overCardId)

    if (!activeList || !overList) return

    // xử lí kéo card qua 2 list khác nhau
    if (activeList._id !== overList._id) {
      const overCardIndex = overList.cardOrderIds.findIndex((cardId) => cardId === overCardId) // tìm index của over card (nơi active card được thả)

      // tính toán cardIndex mới (trên hoặc dưới overCard)
      const isBelowOverItem =
        active.rect.current.translated && active.rect.current.translated.top > over.rect.top + over.rect.height
      const modifier = isBelowOverItem ? 1 : 0
      const newCardIndex = overCardIndex >= 0 ? overCardIndex + modifier : overList.cardOrderIds.length + 1

      const newLists = cloneDeep(orderedLists)
      const nextActiveList = newLists.find((list) => list._id === activeList._id)
      const nextOverList = newLists.find((list) => list._id === overList._id)

      if (nextActiveList && nextOverList) {
        nextActiveList.cardOrderIds = nextActiveList.cardOrderIds.filter((id) => id !== draggingCardId) // xoá card ở activeList (list chứa card đang kéo)
        if (isEmpty(nextActiveList.cardOrderIds)) {
          addCard(generatePlaceholderCard(nextActiveList))
          nextActiveList.cardOrderIds.push(generatePlaceholderCard(nextActiveList)._id)
        }

        nextOverList.cardOrderIds.splice(newCardIndex, 0, draggingCardId) // thêm card đang kéo vào overList theo vị trí index mới
        nextOverList.cardOrderIds = nextOverList.cardOrderIds.filter((cardId) => !cardId.includes('placeholder-card'))

        moveCardBetweenDifferentList({ cardId: draggingCardId, nextActiveList, nextOverList })
      }
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    // console.log('DragEndEvent: ', event)
    const { active, over } = event
    if (!over) return // over = null khi kéo ra ngoài thì return

    // xử lí kéo thả list
    if (activeDragItemType === 'LIST') {
      if (active.id !== over.id) {
        const oldListIndex = listOrderIds.findIndex((listId) => listId === active.id)
        const newListIndex = listOrderIds.findIndex((listId) => listId === over.id)
        const nextListOrderIds = arrayMove(listOrderIds, oldListIndex, newListIndex) // listOrderIds sau khi sắp xếp
        updateListOrderIds(nextListOrderIds) // update listOrderIds trong store

        updateBoardMutation.mutate({
          boardId,
          data: { title, backgroundId, visibility, listOrderIds: nextListOrderIds }
        }) // call api
      }
    }

    // xử lí kéo thả card
    if (activeDragItemType === 'CARD') {
      const draggingCardId = active.id as string
      const overCardId = over.id as string

      const activeList = findListByCardId(draggingCardId)
      const overList = findListByCardId(overCardId)

      if (!activeList || !overList) return

      // kéo thả card trong cùng 1 list
      if (activeListData?._id === overList._id) {
        const oldCardIndex = activeList.cardOrderIds.findIndex((cardId) => cardId === draggingCardId)
        const newCardIndex = overList.cardOrderIds.findIndex((cardId) => cardId === overCardId)

        if (oldCardIndex !== newCardIndex) {
          const newCardOderIds = arrayMove(activeList.cardOrderIds, oldCardIndex, newCardIndex)
          moveCardInTheSameList({ listId: activeList._id, cardOrderIds: newCardOderIds }) // update cardOderIds trong store
          updateListMutation.mutate({
            listId: activeList._id,
            data: { title: activeList.title, cardOrderIds: newCardOderIds, boardId }
          }) // call api
        }
      } else {
        // kéo thả card khác list
        const overCardIndex = overList.cardOrderIds.findIndex((cardId) => cardId === overCardId) // tìm index của over card (nơi active card được thả)

        // tính toán cardIndex mới (trên hoặc dưới overCard)
        const isBelowOverItem =
          active.rect.current.translated && active.rect.current.translated.top > over.rect.top + over.rect.height
        const modifier = isBelowOverItem ? 1 : 0
        const newCardIndex = overCardIndex >= 0 ? overCardIndex + modifier : overList.cardOrderIds.length + 1

        const newLists = cloneDeep(orderedLists)
        const nextActiveList = newLists.find((list) => list._id === activeList?._id)
        const nextOverList = newLists.find((list) => list._id === overList._id)

        if (nextActiveList && nextOverList) {
          nextActiveList.cardOrderIds = nextActiveList.cardOrderIds.filter((id) => id !== draggingCardId) // xoá card ở activeList (list chứa card đang kéo)
          if (isEmpty(nextActiveList.cardOrderIds)) {
            addCard(generatePlaceholderCard(nextActiveList))
            nextActiveList.cardOrderIds.push(generatePlaceholderCard(nextActiveList)._id)
          }

          nextOverList.cardOrderIds.splice(newCardIndex, 0, draggingCardId) // thêm card đang kéo vào overList theo vị trí index mới
          nextOverList.cardOrderIds = nextOverList.cardOrderIds.filter((cardId) => !cardId.includes('placeholder-card'))

          moveCardBetweenDifferentList({ cardId: draggingCardId, nextActiveList, nextOverList })

          const prevList = newLists.find((l) => l._id === activeListData?._id)
          const nextList = newLists.find((l) => l._id === nextOverList._id)
          if (prevList && nextList) {
            const prevCardOrderIds = prevList.cardOrderIds.filter((cardId) => !cardId.includes('placeholder-card'))
            const nextCardOrderIds = nextList.cardOrderIds.filter((cardId) => !cardId.includes('placeholder-card'))
            movingCardMutation.mutate({
              boardId,
              data: {
                cardId: draggingCardId,
                prevListId: activeListData?._id as string,
                nextListId: nextOverList._id,
                prevCardOrderIds,
                nextCardOrderIds
              }
            })
          }
        }
      }
    }

    setActiveDragItemType(null)
    setActiveDragItemData(null)
    setActiveListData(null)
  }

  const collisionDetectionStrategy: CollisionDetection = useCallback(
    (args) => {
      if (activeDragItemType === 'LIST') return closestCorners(args) // kéo list thì dùng closestCorners

      const pointerIntersections = pointerWithin(args) // tìm bất kỳ điểm giao nhau nào với con trỏ
      if (!pointerIntersections.length) return []

      let overId = getFirstCollision(pointerIntersections, 'id') // tìm overId đầu tiên trong intersections

      if (overId) {
        // nếu overId là của list thì sẽ tìm tới cardId gần nhất bên trong khu vực va chạm dựa vào closestCorners hoặc closestCenter
        const checkList = orderedLists.find((list) => list._id === overId)
        if (checkList) {
          // console.log('overId before: ' + overId)
          overId = closestCorners({
            ...args,
            droppableContainers: args.droppableContainers.filter(
              (container) => container.id !== overId && checkList.cardOrderIds.includes(container.id as string)
            )
          })[0]?.id
          // console.log('overId after: ' + overId)
        }

        lastOverId.current = overId
        return [{ id: overId }]
      }
      return lastOverId.current ? [{ id: lastOverId.current }] : [] // nếu overId là null thì trả về mảng rỗng, tránh crash trang
    },
    [activeDragItemType, orderedLists]
  )

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetectionStrategy}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <Box
        sx={{
          width: '100%',
          height: BOARD_CONTENT_HEIGHT,
          p: '10px 0',
          userSelect: 'none'
        }}
      >
        <ListContainer lists={orderedLists} />

        <DragOverlay dropAnimation={dropAnimation}>
          {!activeDragItemType && null}
          {activeDragItemType === 'LIST' && <List list={activeDragItemData as ListType} />}
          {activeDragItemType === 'CARD' && <Card card={activeDragItemData as CardType} />}
        </DragOverlay>
      </Box>
    </DndContext>
  )
}
export default BoardContent

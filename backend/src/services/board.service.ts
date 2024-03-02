import { StatusCodes } from 'http-status-codes'
import omit from 'lodash/omit'
import { ObjectId } from 'mongodb'
import db from '~/config/mongodb'
import { Board, Bookmark, Label } from '~/models'
import {
  BoardListDocument,
  BoardStatus,
  CreateBoardReqBody,
  CreateLabelReqBody,
  DeleteType,
  GetBoardDocument,
  MovingCardReqBody,
  Role,
  UpdateBoardReqBody,
  UpdateLabelReqBody
} from '~/types'
import ApiError from '~/utils/ApiError'
import { parseStringsToObjectIdArray } from '~/utils/helpers'

const boardService = {
  async createBoard(data: CreateBoardReqBody, userId: string) {
    const result = await db.boards.insertOne(new Board({ ...data, ownerId: userId }))
    return db.boards.findOne({ _id: result.insertedId })
  },
  async getBoards(boardStatus: BoardStatus, userId: string) {
    const userObjectId = new ObjectId(userId)
    const boards = await db.boards
      .aggregate<BoardListDocument>([
        { $match: { $or: [{ adminIds: userObjectId }, { memberIds: userObjectId }] } },
        {
          $lookup: {
            from: 'backgrounds',
            localField: 'backgroundId',
            foreignField: '_id',
            as: 'background'
          }
        },
        {
          $unwind: {
            path: '$background',
            preserveNullAndEmptyArrays: true
          }
        },
        { $project: { backgroundId: 0 } }
      ])
      .toArray()

    let result: BoardListDocument[] = []

    if (boardStatus === BoardStatus.Open) {
      result = boards.filter((board) => !board._deleted)
    }
    if (boardStatus === BoardStatus.Closed) {
      result = boards.filter((board) => board._deleted)
    }
    if (boardStatus === BoardStatus.Starred) {
      const bookmarks = await db.bookmarks.find({ userId: userObjectId }).sort({ createdAt: 1 }).toArray()
      result = bookmarks.map(
        (bookmark) => boards.find((board) => bookmark.boardId.equals(board._id)) as BoardListDocument
      )
    }

    return result
  },
  async getBoardById(boardId: string) {
    const result = await db.boards
      .aggregate<GetBoardDocument>([
        { $match: { _id: new ObjectId(boardId) } },
        {
          $lookup: {
            from: 'lists',
            localField: '_id',
            foreignField: 'boardId',
            pipeline: [{ $match: { _deleted: false } }],
            as: 'lists'
          }
        },
        {
          $lookup: {
            from: 'cards',
            localField: 'lists._id',
            foreignField: 'listId',
            as: 'cards'
          }
        },
        {
          $lookup: {
            from: 'backgrounds',
            localField: 'backgroundId',
            foreignField: '_id',
            as: 'background'
          }
        },
        {
          $unwind: { path: '$background', preserveNullAndEmptyArrays: true }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'adminIds',
            foreignField: '_id',
            as: 'admins'
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'memberIds',
            foreignField: '_id',
            as: 'members'
          }
        },
        {
          $project: {
            memberIds: 0,
            adminIds: 0,
            admins: { password: 0 },
            members: { password: 0 },
            backgroundId: 0
          }
        }
      ])
      .toArray()

    const board = result[0]
    if (!board) {
      throw new ApiError({
        message: 'Board not found',
        status: StatusCodes.NOT_FOUND
      })
    }

    const boardLabels = board.labels
    const cardsWithLabel = board.cards.map((card) => {
      const labels = card.labelIds.map((labelId) => boardLabels.find((label) => labelId.equals(label._id)) as Label)
      return { ...omit(card, 'labelIds'), labels }
    })

    if (board._deleted) return { _id: board._id, title: board.title, owners: board.owners, _deleted: board._deleted }
    return { ...board, cards: cardsWithLabel }
  },

  async updateBoard(boardId: string, data: UpdateBoardReqBody) {
    // chỉ chủ board mới được update
    const result = await db.boards.findOneAndUpdate(
      { _id: new ObjectId(boardId) },
      {
        $set: {
          ...data,
          listOrderIds: parseStringsToObjectIdArray(data.listOrderIds),
          backgroundId: new ObjectId(data.backgroundId)
        },
        $currentDate: { updatedAt: true }
      },
      { returnDocument: 'after' }
    )

    if (!result) {
      throw new ApiError({
        status: StatusCodes.NOT_FOUND,
        message: 'Board not found'
      })
    }

    return result
  },
  async deleteBoard(boardId: string, deleteType: DeleteType) {
    // chỉ chủ board mới được xoá
    const boardObjectId = new ObjectId(boardId)
    if (deleteType === DeleteType.Soft) {
      Promise.all([
        db.boards.updateOne({ _id: boardObjectId }, { $set: { _deleted: true } }),
        db.lists.updateMany({ boardId: boardObjectId }, { $set: { _deleted: true } }),
        db.cards.updateMany({ boardId: boardObjectId }, { $set: { _deleted: true } }),
        db.bookmarks.deleteMany({ boardId: boardObjectId })
      ])
    } else {
      Promise.all([
        db.boards.deleteOne({ _id: boardObjectId }),
        db.lists.deleteMany({ boardId: boardObjectId }),
        db.cards.deleteMany({ boardId: boardObjectId })
      ])
    }
  },

  async movingCardToDifferentList(data: MovingCardReqBody) {
    /**
     * khi kéo card giữa 2 list:
     * b1: update cardOrderIds của list ban đầu (xoá _id của card đang kéo ra khỏi mảng)
     * b2: update cardOrderIds của list tiếp theo (thêm _id của card đang kéo vào mảng)
     * b3: update lại listId mới của card đã kéo
     */
    await Promise.all([
      db.lists.updateOne(
        { _id: new ObjectId(data.prevListId) },
        { $set: { cardOrderIds: parseStringsToObjectIdArray(data.prevCardOrderIds) } }
      ), // update cardOrderIds của list ban đầu (xoá _id của card đang kéo ra khỏi mảng)
      db.lists.updateOne(
        { _id: new ObjectId(data.nextListId) },
        { $set: { cardOrderIds: parseStringsToObjectIdArray(data.nextCardOrderIds) } }
      ), //  update cardOrderIds của list tiếp theo (thêm _id của card đang kéo vào mảng)
      db.cards.updateOne({ _id: new ObjectId(data.cardId) }, { $set: { listId: new ObjectId(data.nextListId) } }) // update lại listId mới của card đã kéo
    ])
  },

  async reopenBoard(boardId: string) {
    // chỉ chủ board mới được reopen board
    const boardObjectId = new ObjectId(boardId)
    const board = await db.boards.findOne({ _id: boardObjectId })
    if (!board) {
      throw new ApiError({
        status: StatusCodes.NOT_FOUND,
        message: 'Board not found'
      })
    }
    if (!board._deleted) {
      throw new ApiError({
        status: StatusCodes.OK,
        message: 'Board is opening'
      })
    }

    await Promise.all([
      db.boards.updateOne({ _id: boardObjectId, _deleted: true }, { $set: { _deleted: false } }),
      db.lists.updateMany({ boardId: boardObjectId }, { $set: { _deleted: false } }),
      db.cards.updateMany({ boardId: boardObjectId }, { $set: { _deleted: false } })
    ])
  },

  async addMember(boardId: string, userIds: string[]) {
    return db.boards.findOneAndUpdate(
      { _id: new ObjectId(boardId) },
      { $addToSet: { memberIds: { $each: parseStringsToObjectIdArray(userIds) } } },
      { returnDocument: 'after' }
    )
  },

  async updateMember(boardId: string, memberId: string, role: Role, board: Board) {
    const boardObjectId = new ObjectId(boardId)
    const memberObjectId = new ObjectId(memberId)
    if (role === Role.Admin) {
      Promise.all([
        db.boards.updateOne({ _id: boardObjectId }, { $pull: { memberIds: memberObjectId } }),
        db.boards.updateOne({ _id: boardObjectId }, { $push: { adminIds: memberObjectId } })
      ])
    }
    if (role === Role.Member) {
      if (board.adminIds.some((id) => id.equals(memberId)) && board.adminIds.length === 1) {
        throw new ApiError({
          status: StatusCodes.FORBIDDEN,
          message: 'Board must have at least one admin'
        })
      }
      Promise.all([
        db.boards.updateOne({ _id: boardObjectId }, { $pull: { adminIds: memberObjectId } }),
        db.boards.updateOne({ _id: boardObjectId }, { $push: { memberIds: memberObjectId } })
      ])
    }
  },

  async removeMember(boardId: string, memberId: string) {
    const boardObjectId = new ObjectId(boardId)
    await Promise.all([
      db.boards.updateOne({ _id: boardObjectId }, { $pull: { memberIds: new ObjectId(memberId) } }),
      db.boards.updateOne({ _id: boardObjectId }, { $pull: { adminIds: new ObjectId(memberId) } }),
      db.cards.updateMany({ boardId: boardObjectId }, { $pull: { memberIds: new ObjectId(memberId) } })
    ])
  },

  async starBoard(boardId: string, userId: string) {
    const result = await db.bookmarks.findOneAndUpdate(
      { boardId: new ObjectId(boardId), userId: new ObjectId(userId) },
      { $setOnInsert: new Bookmark({ boardId: boardId, userId: userId }) },
      { upsert: true, returnDocument: 'after' }
    )
    return result
  },

  async unstarBoard(boardId: string, userId: string) {
    await db.bookmarks.deleteOne({ boardId: new ObjectId(boardId), userId: new ObjectId(userId) })
  },

  async createLabel(boardId: string, data: CreateLabelReqBody) {
    const label = new Label(data)
    await db.boards.updateOne({ _id: new ObjectId(boardId) }, { $push: { labels: label } })
    return label
  },

  async deleteLabel(boardId: string, labelId: string) {
    await Promise.all([
      db.boards.updateOne({ _id: new ObjectId(boardId) }, { $pull: { labels: { _id: new ObjectId(labelId) } } }),
      db.cards.updateMany({ boardId: new ObjectId(boardId) }, { $pull: { labelIds: new ObjectId(labelId) } })
    ])
  },

  async updateLabel(boardId: string, labelId: string, data: UpdateLabelReqBody) {
    await db.boards.updateOne(
      { _id: new ObjectId(boardId), 'labels._id': new ObjectId(labelId) },
      { $set: { 'labels.$.title': data.title, 'labels.$.hex': data.hex } }
    )
  }
}

export default boardService

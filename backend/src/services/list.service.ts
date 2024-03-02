import { StatusCodes } from 'http-status-codes'
import { ObjectId } from 'mongodb'
import db from '~/config/mongodb'
import { List } from '~/models'
import { CreateListReqBody, UpdateListReqBody, DeleteType, ListStatus } from '~/types'
import ApiError from '~/utils/ApiError'
import { parseStringsToObjectIdArray } from '~/utils/helpers'

const listService = {
  async createList(data: CreateListReqBody) {
    const result = await db.lists.insertOne(new List(data))
    const [newList] = await Promise.all([
      db.lists.findOne({ _id: result.insertedId }),
      db.boards.findOneAndUpdate({ _id: new ObjectId(data.boardId) }, { $push: { listOrderIds: result.insertedId } })
    ])
    return { ...newList, cards: [] }
  },

  async getLists(boardId: string, listStatus: ListStatus) {
    const result = await db.lists
      .find({ boardId: new ObjectId(boardId), _deleted: listStatus === ListStatus.Open ? false : true })
      .toArray()
    return result
  },

  async updateListById(listId: string, data: UpdateListReqBody) {
    const result = await db.lists.findOneAndUpdate(
      { _id: new ObjectId(listId), _deleted: false },
      {
        $set: {
          ...data,
          boardId: new ObjectId(data.boardId),
          cardOrderIds: parseStringsToObjectIdArray(data.cardOrderIds)
        },
        $currentDate: { updatedAt: true }
      },
      { returnDocument: 'after' }
    )

    return result
  },
  async deleteListById(listId: string, deleteType: DeleteType) {
    const listObjectId = new ObjectId(listId)
    const list = await db.lists.findOne({ _id: listObjectId })
    if (!list) {
      throw new ApiError({
        status: StatusCodes.NOT_FOUND,
        message: 'List not found'
      })
    }

    if (deleteType === DeleteType.Soft) {
      await Promise.all([
        db.lists.updateOne({ _id: listObjectId }, { $set: { _deleted: true } }),
        db.cards.updateMany({ listId: listObjectId }, { $set: { _deleted: true } }),
        db.boards.updateOne({ _id: list.boardId }, { $pull: { listOrderIds: listObjectId } })
      ])
    } else {
      await Promise.all([
        db.lists.deleteOne({ _id: listObjectId }), // delete list
        db.cards.deleteMany({ listId: listObjectId }), // delete all card in list
        db.boards.updateOne({ _id: list.boardId }, { $pull: { listOrderIds: listObjectId } }) // pull listId from listOrderIds
      ])
    }
  },
  async reopenList(listId: string) {
    const listObjectId = new ObjectId(listId)
    const list = await db.lists.findOne({ _id: listObjectId })
    if (!list) {
      throw new ApiError({
        status: StatusCodes.NOT_FOUND,
        message: 'List not found'
      })
    }
    if (!list._deleted) {
      throw new ApiError({
        status: StatusCodes.OK,
        message: 'List is opening'
      })
    }

    await Promise.all([
      db.lists.updateOne({ _id: listObjectId }, { $set: { _deleted: false } }),
      db.cards.updateMany({ listId: listObjectId }, { $set: { _deleted: false } }),
      db.boards.updateOne({ _id: list.boardId }, { $push: { listOrderIds: list._id } })
    ])
  }
}

export default listService

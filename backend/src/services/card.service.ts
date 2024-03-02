import { StatusCodes } from 'http-status-codes'
import omit from 'lodash/omit'
import { ObjectId } from 'mongodb'
import db from '~/config/mongodb'
import { Board, Card, Label } from '~/models'
import {
  AddLabelReqBody,
  AddMemberReqBody,
  CardDetailDocument,
  CardStatus,
  CreateCardReqBody,
  DeleteType,
  UpdateCardReqBody
} from '~/types'
import ApiError from '~/utils/ApiError'

const cardService = {
  async createCard(data: CreateCardReqBody) {
    const result = await db.cards.insertOne(new Card(data))
    const [newCard] = await Promise.all([
      db.cards.findOne({ _id: result.insertedId }),
      db.lists.findOneAndUpdate({ _id: new ObjectId(data.listId) }, { $push: { cardOrderIds: result.insertedId } })
    ])
    return newCard
  },

  async getCards(boardId: string, cardStatus: CardStatus, board: Board) {
    const cards = await db.cards
      .find({ boardId: new ObjectId(boardId), _deleted: cardStatus === CardStatus.Open ? false : true })
      .toArray()
    const boardLabels = board.labels
    const cardsWithLabel = cards.map((card) => {
      const labels = card.labelIds.map((labelId) => boardLabels.find((label) => labelId.equals(label._id)) as Label)
      return { ...omit(card, 'labelIds'), labels }
    })
    return cardsWithLabel
  },

  async getCardById(cardId: string, board: Board) {
    const result = await db.cards
      .aggregate<CardDetailDocument>([
        {
          $match: {
            _id: new ObjectId(cardId)
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
            members: { password: 0 }
          }
        }
      ])
      .toArray()

    const card = result[0]
    if (!card) {
      throw new ApiError({
        status: StatusCodes.NOT_FOUND,
        message: 'Card not found'
      })
    }
    const boardLabels = board.labels
    const cardLabels = card.labelIds.map((labelId) => boardLabels.find((label) => labelId.equals(label._id)) as Label)
    const response = {
      ...omit(card, 'labelIds'),
      labels: cardLabels
    }
    return response
  },

  async deleteCardById(cardId: string, deleteType: DeleteType) {
    // thành viên board có thể xoá card
    const card = await db.cards.findOne({ _id: new ObjectId(cardId) })
    if (!card) {
      throw new ApiError({
        status: StatusCodes.NOT_FOUND,
        message: 'Card not found'
      })
    }
    if (deleteType === DeleteType.Soft) {
      await Promise.all([
        db.cards.updateOne({ _id: card._id }, { $set: { _deleted: true } }),
        db.lists.updateOne({ _id: card.listId }, { $pull: { cardOrderIds: card._id } })
      ])
    } else {
      await Promise.all([
        db.cards.deleteOne({ _id: card._id }),
        db.lists.updateOne({ _id: card.listId }, { $pull: { cardOrderIds: card._id } })
      ])
    }
  },

  async updateCardById(cardId: string, data: UpdateCardReqBody) {
    const result = await db.cards.findOneAndUpdate(
      { _id: new ObjectId(cardId) },
      { $set: data, $currentDate: { updatedAt: true } },
      { returnDocument: 'after' }
    )
    return result
  },

  async reopenCard(cardId: string) {
    const cardObjectId = new ObjectId(cardId)
    const card = await db.cards.findOne({ _id: cardObjectId })
    if (!card) {
      throw new ApiError({
        status: StatusCodes.NOT_FOUND,
        message: 'Card not found'
      })
    }
    if (!card._deleted) {
      throw new ApiError({
        status: StatusCodes.OK,
        message: 'Card is opening'
      })
    }
    await Promise.all([
      db.cards.updateOne({ _id: cardObjectId }, { $set: { _deleted: false } }),
      db.lists.updateOne({ _id: card.listId }, { $addToSet: { cardOrderIds: card._id } })
    ])
  },

  async addMemberToCard(cardId: string, board: Board, data: AddMemberReqBody) {
    if (
      !board.memberIds.some((id) => id.equals(data.memberId)) &&
      !board.adminIds.some((id) => id.equals(data.memberId))
    ) {
      throw new ApiError({
        status: StatusCodes.BAD_REQUEST,
        message: 'User is not a member of the board'
      })
    }
    const result = await db.cards.findOneAndUpdate(
      { _id: new ObjectId(cardId) },
      { $addToSet: { memberIds: new ObjectId(data.memberId) } },
      { returnDocument: 'after' }
    )
    return result
  },

  async removeMemberFromCard(cardId: string, memberId: string) {
    await db.cards.updateOne({ _id: new ObjectId(cardId) }, { $pull: { memberIds: new ObjectId(memberId) } })
  },

  async addLabelToCard(cardId: string, board: Board, data: AddLabelReqBody) {
    if (!board.labels.some((label) => label._id.equals(data.labelId))) {
      throw new ApiError({
        status: StatusCodes.BAD_REQUEST,
        message: 'Label is not a label of the board'
      })
    }
    const result = await db.cards.findOneAndUpdate(
      { _id: new ObjectId(cardId) },
      { $addToSet: { labelIds: new ObjectId(data.labelId) } },
      { returnDocument: 'after' }
    )
    return result
  },

  async removeLabelFromCard(cardId: string, labelId: string) {
    await db.cards.updateOne({ _id: new ObjectId(cardId) }, { $pull: { labelIds: new ObjectId(labelId) } })
  }
}

export default cardService

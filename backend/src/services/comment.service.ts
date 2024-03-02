import { StatusCodes } from 'http-status-codes'
import { ObjectId } from 'mongodb'
import db from '~/config/mongodb'
import { Comment } from '~/models'
import { CreateCommentReqBody, UpdateCommentReqBody } from '~/types'
import ApiError from '~/utils/ApiError'

const commentService = {
  async createComment(userId: string, cardId: string, data: CreateCommentReqBody) {
    const result = await db.comments.insertOne(new Comment({ ...data, userId, cardId }))
    const [comment] = await Promise.all([
      db.comments.findOne({ _id: result.insertedId }),
      db.cards.updateOne({ _id: new ObjectId(cardId) }, { $push: { comments: result.insertedId } })
    ])
    return comment
  },

  async getComments(cardId: string) {
    const result = await db.comments
      .aggregate([
        {
          $match: { cardId: new ObjectId(cardId) }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'user'
          }
        },
        {
          $unwind: {
            path: '$user',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $project: {
            userId: 0,
            user: { password: 0 }
          }
        }
      ])
      .sort({ createdAt: -1 })
      .toArray()
    return result
  },

  async updateComment(commentId: string, data: UpdateCommentReqBody) {
    const result = await db.comments.findOneAndUpdate(
      { _id: new ObjectId(commentId) },
      { $set: data, $currentDate: { updatedAt: true } }
    )
    return result
  },

  async deleteComment(commentId: string) {
    const comment = await db.comments.findOne({ _id: new ObjectId(commentId) })
    if (!comment) {
      throw new ApiError({
        status: StatusCodes.NOT_FOUND,
        message: 'Comment not found'
      })
    }
    await Promise.all([
      db.comments.deleteOne({ _id: comment._id }),
      db.cards.updateOne({ _id: comment.cardId }, { $pull: { comments: comment._id } })
    ])
  }
}

export default commentService

import { StatusCodes } from 'http-status-codes'
import { ObjectId } from 'mongodb'
import urlMetadata from 'url-metadata'
import db from '~/config/mongodb'
import { Attachment } from '~/models'
import { AttachmentType, CreateAttachmentReqBody, UpdateAttachmentReqBody } from '~/types'
import ApiError from '~/utils/ApiError'

const attachmentService = {
  async createAttachment(cardId: string, data: CreateAttachmentReqBody) {
    const buildData = { ...data }
    if (!buildData.name && buildData.type === AttachmentType.Link) {
      const metadata = await urlMetadata(buildData.url)
      buildData.name = metadata.title
      //metadata['og:title'] ||
    }
    const result = await db.attachments.insertOne(new Attachment({ ...buildData, cardId }))
    const [attachment] = await Promise.all([
      db.attachments.findOne({ _id: result.insertedId }),
      db.cards.updateOne({ _id: new ObjectId(cardId) }, { $push: { attachments: result.insertedId } })
    ])
    return attachment
  },

  async getAttachments(cardId: string) {
    return db.attachments
      .find({ cardId: new ObjectId(cardId) })
      .sort({ createdAt: -1 })
      .toArray()
  },

  async deleteAttachment(attachmentId: string) {
    const attachment = await db.attachments.findOne({ _id: new ObjectId(attachmentId) })
    if (!attachment) {
      throw new ApiError({
        status: StatusCodes.NOT_FOUND,
        message: 'Attachment not found'
      })
    }
    await Promise.all([
      db.attachments.deleteOne({ _id: attachment._id }),
      db.cards.updateOne({ _id: attachment.cardId }, { $pull: { attachments: attachment._id } })
    ])
  },

  async updateAttachment(attachmentId: string, data: UpdateAttachmentReqBody) {
    return db.attachments.findOneAndUpdate(
      { _id: new ObjectId(attachmentId) },
      { $set: data, $currentDate: { updatedAt: true } }
    )
  }
}

export default attachmentService

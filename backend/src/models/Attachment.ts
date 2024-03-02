import { ObjectId } from 'mongodb'
import { AttachmentType } from '~/types'

interface Type {
  _id?: ObjectId
  cardId: string
  name: string
  type: AttachmentType
  url: string
}

class Attachment {
  _id: ObjectId
  cardId: ObjectId
  name: string
  type: AttachmentType
  url: string
  createdAt: Date
  updatedAt: Date
  constructor(attachment: Type) {
    this._id = attachment._id || new ObjectId()
    this.cardId = new ObjectId(attachment.cardId)
    this.name = attachment.name
    this.type = attachment.type
    this.url = attachment.url
    this.createdAt = new Date()
    this.updatedAt = new Date()
  }
}

export default Attachment

import { ObjectId } from 'mongodb'

interface Type {
  _id?: ObjectId
  cardId: string
  userId: string
  content: string
}

class Comment {
  _id: ObjectId
  cardId: ObjectId
  userId: ObjectId
  content: string
  createdAt: Date
  updatedAt: Date
  constructor(attachment: Type) {
    this._id = attachment._id || new ObjectId()
    this.cardId = new ObjectId(attachment.cardId)
    this.userId = new ObjectId(attachment.userId)
    this.content = attachment.content
    this.createdAt = new Date()
    this.updatedAt = new Date()
  }
}

export default Comment

import { ObjectId } from 'mongodb'

interface Type {
  _id?: ObjectId
  boardId: string
  listId: string
  title: string
}

class Card {
  _id: ObjectId
  boardId: ObjectId
  listId: ObjectId
  title: string
  cover: string
  description: string
  memberIds: ObjectId[]
  labelIds: ObjectId[]
  comments: ObjectId[]
  attachments: ObjectId[]
  createdAt: Date
  updatedAt: Date
  _deleted: boolean
  constructor(card: Type) {
    this._id = card._id || new ObjectId()
    this.boardId = new ObjectId(card.boardId)
    this.listId = new ObjectId(card.listId)
    this.title = card.title
    this.cover = ''
    this.description = ''
    this.memberIds = []
    this.labelIds = []
    this.comments = []
    this.attachments = []
    this.createdAt = new Date()
    this.updatedAt = new Date()
    this._deleted = false
  }
}

export default Card

import { ObjectId } from 'mongodb'

interface Type {
  _id?: ObjectId
  userId: string
  boardId: string
}

class Bookmark {
  _id?: ObjectId
  userId: ObjectId
  boardId: ObjectId
  createdAt: Date
  constructor(bookmark: Type) {
    this._id = bookmark._id || new ObjectId()
    this.userId = new ObjectId(bookmark.userId)
    this.boardId = new ObjectId(bookmark.boardId)
    this.createdAt = new Date()
  }
}

export default Bookmark

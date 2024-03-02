import { ObjectId } from 'mongodb'

interface Type {
  _id?: ObjectId
  boardId: string
  title: string
}

class List {
  _id: ObjectId
  boardId: ObjectId
  title: string
  cardOrderIds: ObjectId[]
  createdAt: Date
  updatedAt: Date
  _deleted: boolean
  constructor(list: Type) {
    this._id = list._id || new ObjectId()
    this.title = list.title
    this.boardId = new ObjectId(list.boardId)
    this.cardOrderIds = []
    this.createdAt = new Date()
    this.updatedAt = new Date()
    this._deleted = false
  }
}

export default List

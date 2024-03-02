import { ObjectId } from 'mongodb'
import { Visibility } from '~/types'
import { Label } from '.'

interface Type {
  _id?: ObjectId
  title: string
  visibility: Visibility
  backgroundId: string
  ownerId: string
}

class Board {
  _id: ObjectId
  title: string
  visibility: Visibility
  ownerId: ObjectId
  adminIds: ObjectId[]
  memberIds: ObjectId[]
  listOrderIds: ObjectId[]
  backgroundId: ObjectId
  labels: Label[]
  createdAt: Date
  updatedAt: Date
  _deleted: boolean
  constructor(board: Type) {
    this._id = board._id || new ObjectId()
    this.title = board.title
    this.visibility = board.visibility
    this.ownerId = new ObjectId(board.ownerId)
    this.adminIds = [new ObjectId(board.ownerId)]
    this.memberIds = []
    this.listOrderIds = []
    this.labels = []
    this.backgroundId = new ObjectId(board.backgroundId)
    this.createdAt = new Date()
    this.updatedAt = new Date()
    this._deleted = false
  }
}

export default Board

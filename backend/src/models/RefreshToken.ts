import { ObjectId } from 'mongodb'

interface Type {
  _id?: ObjectId
  token: string
  userId: string
  exp: number
}

export default class RefreshToken {
  _id: ObjectId
  userId: ObjectId
  token: string
  createAt: Date
  exp: Date
  constructor({ _id, token, userId, exp }: Type) {
    this._id = _id || new ObjectId()
    this.userId = new ObjectId(userId)
    this.token = token
    this.createAt = new Date()
    this.exp = new Date(exp * 1000)
  }
}

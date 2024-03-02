import { ObjectId } from 'mongodb'

interface Type {
  _id?: ObjectId
  email: string
  password: string
  username: string
  fullName: string
  avatar: string
}

class User {
  _id: ObjectId
  email: string
  password: string
  username: string
  fullName: string
  avatar: string
  createdAt: Date
  updatedAt: Date
  constructor(user: Type) {
    this._id = user._id || new ObjectId()
    this.email = user.email
    this.password = user.password
    this.username = user.username
    this.fullName = user.fullName
    this.avatar = user.avatar
    this.createdAt = new Date()
    this.updatedAt = new Date()
  }
}

export default User

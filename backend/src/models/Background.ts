import { ObjectId } from 'mongodb'

interface Type {
  _id?: ObjectId
  color: string
  image: string
  icon: string
}

class Background {
  _id: ObjectId
  color: string
  image: string
  icon: string

  constructor(board: Type) {
    this._id = board._id || new ObjectId()
    this.color = board.color
    this.image = board.image
    this.icon = board.icon
  }
}

export default Background

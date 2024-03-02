import { ObjectId } from 'mongodb'

interface Type {
  name: string
  title: string
  hex: string
}

class Label {
  _id: ObjectId
  name: string
  title: string
  hex: string
  constructor({ name, title, hex }: Type) {
    this._id = new ObjectId()
    this.name = name
    this.title = title
    this.hex = hex
  }
}

export default Label

import db from '~/config/mongodb'
import { Background } from '~/models'
import { CreateBackgroundReqBody } from '~/types'

const backgroundService = {
  getBackgrounds() {
    return db.backgrounds.find().toArray()
  },
  async createBackground(data: CreateBackgroundReqBody) {
    await db.backgrounds.insertOne(new Background(data))
  }
}

export default backgroundService

import { Request } from 'express'
import { TokenPayload } from './utils/jwt'
import { Board } from './models'

declare module 'express' {
  interface Request {
    decodeAccessToken?: TokenPayload
    board?: Board
  }
}

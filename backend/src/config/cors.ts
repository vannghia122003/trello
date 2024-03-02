import type { CorsOptions } from 'cors'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'
import env from './environment'

const whitelist = [env.CLIENT_URL]
const corsOptions: CorsOptions = {
  origin: function (origin, callback) {
    if (env.BUILD_MODE === 'dev') return callback(null, true)

    if (origin && whitelist.includes(origin)) return callback(null, true)

    return callback(
      new ApiError({
        message: `${origin} not allowed by our CORS Policy.`,
        status: StatusCodes.FORBIDDEN
      })
    )
  },

  optionsSuccessStatus: 200,
  credentials: true // cho phép nhận cookies từ request
}

export default corsOptions

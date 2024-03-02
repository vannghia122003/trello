import cors from 'cors'
import express from 'express'
import { StatusCodes } from 'http-status-codes'
import corsOptions from './config/cors'
import { errorHandler } from './middlewares/error.middleware'
import routes from './routes'
import ApiError from './utils/ApiError'

const app = express()

app.get('/', (req, res) => res.json({ message: 'Server is running' }))

app.use(cors(corsOptions))
app.use(express.json())
app.use(routes)

// send 404 error for any unknown api request
app.use((req, res, next) => {
  next(
    new ApiError({
      status: StatusCodes.NOT_FOUND,
      message: 'Not Found API Request'
    })
  )
})

app.use(errorHandler)

export default app

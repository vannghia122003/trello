import { Router } from 'express'
import authRoute from './auth.route'
import backgroundRoute from './background.route'
import boardRoute from './board.route'
import cardRoute from './card.route'
import listRoute from './list.route'
import userRoute from './user.route'

const routes = Router()

routes.use('/auth', authRoute)
routes.use('/users', userRoute)
routes.use('/boards', boardRoute)
routes.use('/lists', listRoute)
routes.use('/cards', cardRoute)
routes.use('/backgrounds', backgroundRoute)

export default routes

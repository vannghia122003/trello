import { Router } from 'express'
import backgroundController from '~/controllers/background.controller'
import { verifyAccessToken } from '~/middlewares/auth.middleware'

const backgroundRoute = Router()

backgroundRoute.use(verifyAccessToken)

backgroundRoute.post('/', backgroundController.createBackgrounds)

backgroundRoute.get('/', backgroundController.getBackgrounds)

export default backgroundRoute

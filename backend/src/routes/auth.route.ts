import { Router } from 'express'
import authController from '~/controllers/auth.controller'
import { verifyAccessToken } from '~/middlewares/auth.middleware'
import authValidation from '~/validations/auth.validation'

const authRoute = Router()

authRoute.post('/register', authValidation.register, authController.register)
authRoute.post('/login', authValidation.login, authController.login)
authRoute.post('/logout', verifyAccessToken, authController.logout)
authRoute.post('/refresh-token', authController.refreshToken)

export default authRoute

import { Router } from 'express'
import userController from '~/controllers/user.controller'
import { verifyAccessToken } from '~/middlewares/auth.middleware'
import { upload } from '~/utils/file'
import userValidation from '~/validations/user.validation'

const userRoute = Router()

userRoute.use(verifyAccessToken)

userRoute.get('/', userValidation.getUsers, userController.getUsers)
userRoute.get('/me', userController.getMe)
userRoute.put('/me', userValidation.updateMe, userController.updateMe)
userRoute.put('/change-password', userValidation.changePassword, userController.changePassword)
userRoute.post('/upload-image', upload.array('images', 4), userController.uploadImage)
userRoute.delete('/delete-image/:urlId', userController.deleteImage)

export default userRoute

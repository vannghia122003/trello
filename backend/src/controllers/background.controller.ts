import { Request, Response } from 'express'
import backgroundService from '~/services/background.service'
import { CreateBackgroundReqBody } from '~/types'
import catchAsync from '~/utils/catchAsync'

const backgroundController = {
  getBackgrounds: catchAsync(async (req: Request, res: Response) => {
    const data = await backgroundService.getBackgrounds()
    res.json({ message: 'Get background successfully', data })
  }),
  createBackgrounds: catchAsync(async (req: Request<undefined, undefined, CreateBackgroundReqBody>, res: Response) => {
    await backgroundService.createBackground(req.body)
    res.json({ message: 'Success' })
  })
}

export default backgroundController

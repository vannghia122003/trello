import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { StatusCodes } from 'http-status-codes'
import listService from '~/services/list.service'
import { CreateListReqBody, DeleteListReqQuery, GetListReqQuery, ListIdReqParams, UpdateListReqBody } from '~/types'
import catchAsync from '~/utils/catchAsync'

const listController = {
  createList: catchAsync(async (req: Request<ParamsDictionary, undefined, CreateListReqBody>, res: Response) => {
    const data = await listService.createList(req.body)
    res.status(StatusCodes.CREATED).json({ message: 'List created', data })
  }),
  updateList: catchAsync(async (req: Request<ListIdReqParams, undefined, UpdateListReqBody>, res: Response) => {
    const data = await listService.updateListById(req.params.listId, req.body)
    res.status(StatusCodes.OK).json({ message: 'Update list successfully', data })
  }),
  deleteList: catchAsync(
    async (req: Request<ListIdReqParams, undefined, undefined, DeleteListReqQuery>, res: Response) => {
      await listService.deleteListById(req.params.listId, req.query.deleteType)
      res.status(StatusCodes.NO_CONTENT).json()
    }
  ),
  getLists: catchAsync(async (req: Request<ParamsDictionary, undefined, undefined, GetListReqQuery>, res: Response) => {
    const data = await listService.getLists(req.query.boardId, req.query.status)
    res.status(StatusCodes.OK).json({ message: 'Get lists successfully', data })
  }),
  reopenList: catchAsync(async (req: Request<ListIdReqParams>, res: Response) => {
    await listService.reopenList(req.params.listId)
    res.status(StatusCodes.OK).json({ message: 'List reopened successfully' })
  })
}

export default listController

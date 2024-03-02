import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { StatusCodes } from 'http-status-codes'
import { Board } from '~/models'
import boardService from '~/services/board.service'
import {
  BoardIdReqParams,
  CreateBoardReqBody,
  CreateLabelReqBody,
  DeleteBoardReqQuery,
  GetBoardsReqQuery,
  InviteUsersReqBody,
  LabelIdReqParams,
  MemberIdReqParams,
  MovingCardReqBody,
  UpdateBoardReqBody,
  UpdateLabelReqBody,
  UpdateMemberReqBody
} from '~/types'
import catchAsync from '~/utils/catchAsync'

const boardController = {
  createBoard: catchAsync(async (req: Request<ParamsDictionary, undefined, CreateBoardReqBody>, res: Response) => {
    const userId = req.decodeAccessToken?.userId as string
    const data = await boardService.createBoard(req.body, userId)
    res.status(StatusCodes.CREATED).json({ message: 'Board created', data })
  }),

  getBoards: catchAsync(
    async (req: Request<ParamsDictionary, undefined, undefined, GetBoardsReqQuery>, res: Response) => {
      const userId = req.decodeAccessToken?.userId as string
      const data = await boardService.getBoards(req.query.status, userId)
      res.status(StatusCodes.OK).json({ message: `Get ${req.query.status} boards successfully`, data })
    }
  ),

  getBoard: catchAsync(async (req: Request<BoardIdReqParams>, res: Response) => {
    const data = await boardService.getBoardById(req.params.boardId)
    res.status(StatusCodes.OK).json({ message: 'Get board successfully', data })
  }),

  updateBoard: catchAsync(async (req: Request<BoardIdReqParams, undefined, UpdateBoardReqBody>, res: Response) => {
    const data = await boardService.updateBoard(req.params.boardId, req.body)
    res.status(StatusCodes.OK).json({ message: 'Update board successfully', data })
  }),

  movingCard: catchAsync(async (req: Request<ParamsDictionary, undefined, MovingCardReqBody>, res: Response) => {
    await boardService.movingCardToDifferentList(req.body)
    res.status(StatusCodes.OK).json({ message: 'Card updated' })
  }),

  deleteBoard: catchAsync(
    async (req: Request<BoardIdReqParams, undefined, undefined, DeleteBoardReqQuery>, res: Response) => {
      await boardService.deleteBoard(req.params.boardId, req.query.deleteType)
      res.status(StatusCodes.OK).json({ message: 'Board deleted successfully' })
    }
  ),

  reopenBoard: catchAsync(async (req: Request<BoardIdReqParams>, res: Response) => {
    await boardService.reopenBoard(req.params.boardId)
    res.status(StatusCodes.OK).json({ message: 'Board reopened successfully' })
  }),

  addMember: catchAsync(async (req: Request<BoardIdReqParams, undefined, InviteUsersReqBody>, res: Response) => {
    const data = await boardService.addMember(req.params.boardId, req.body.userIds)
    res.status(StatusCodes.CREATED).json({ message: 'Add member successfully', data })
  }),

  updateMember: catchAsync(
    async (req: Request<BoardIdReqParams & MemberIdReqParams, undefined, UpdateMemberReqBody>, res: Response) => {
      await boardService.updateMember(req.params.boardId, req.params.memberId, req.body.role, req.board as Board)
      res.status(StatusCodes.OK).json({ message: 'Update member successfully' })
    }
  ),

  removeMember: catchAsync(async (req: Request<BoardIdReqParams & MemberIdReqParams>, res: Response) => {
    await boardService.removeMember(req.params.boardId, req.params.memberId)
    res.status(StatusCodes.NO_CONTENT).json()
  }),

  starBoard: catchAsync(async (req: Request<BoardIdReqParams>, res: Response) => {
    const userId = req.decodeAccessToken?.userId as string
    const data = await boardService.starBoard(req.params.boardId, userId)
    res.status(StatusCodes.CREATED).json({ message: 'Board starred successfully', data })
  }),

  unstarBoard: catchAsync(async (req: Request<BoardIdReqParams>, res: Response) => {
    const userId = req.decodeAccessToken?.userId as string
    await boardService.unstarBoard(req.params.boardId, userId)
    res.status(StatusCodes.NO_CONTENT).json()
  }),

  createLabel: catchAsync(async (req: Request<BoardIdReqParams, undefined, CreateLabelReqBody>, res: Response) => {
    const data = await boardService.createLabel(req.params.boardId, req.body)
    res.status(StatusCodes.CREATED).json({ message: 'Create label successfully', data })
  }),

  deleteLabel: catchAsync(async (req: Request<BoardIdReqParams & LabelIdReqParams>, res: Response) => {
    await boardService.deleteLabel(req.params.boardId, req.params.labelId)
    res.status(StatusCodes.NO_CONTENT).json()
  }),

  updateLabel: catchAsync(
    async (req: Request<BoardIdReqParams & LabelIdReqParams, undefined, UpdateLabelReqBody>, res: Response) => {
      await boardService.updateLabel(req.params.boardId, req.params.labelId, req.body)
      res.status(StatusCodes.NO_CONTENT).json()
    }
  )
}

export default boardController

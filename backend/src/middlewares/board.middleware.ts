import { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ObjectId, WithId } from 'mongodb'
import db from '~/config/mongodb'
import { Board } from '~/models'
import { BoardIdReqParams, Visibility } from '~/types'
import ApiError from '~/utils/ApiError'
import catchAsync from '~/utils/catchAsync'

export const findBoardById = (property: 'body' | 'params' | 'query') =>
  catchAsync(async (req: Request<BoardIdReqParams>, res: Response, next: NextFunction) => {
    const boardId = req[property]['boardId']
    const board = await db.boards.findOne({ _id: new ObjectId(boardId) })
    if (!board) {
      return next(
        new ApiError({
          status: StatusCodes.NOT_FOUND,
          message: 'Board not found'
        })
      )
    }
    req.board = board
    next()
  })

export const findBoardByListId = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const listId = req.params.listId
  const list = await db.lists.findOne({ _id: new ObjectId(listId) })
  if (!list) {
    return next(
      new ApiError({
        status: StatusCodes.NOT_FOUND,
        message: 'List not found'
      })
    )
  }
  const board = (await db.boards.findOne({ _id: list.boardId })) as WithId<Board>
  req.board = board
  next()
})

export const findBoardByCardId = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const cardId = req.params.cardId
  const card = await db.cards.findOne({ _id: new ObjectId(cardId) })
  if (!card) {
    return next(
      new ApiError({
        status: StatusCodes.NOT_FOUND,
        message: 'Card not found'
      })
    )
  }
  const board = (await db.boards.findOne({ _id: card.boardId })) as WithId<Board>
  req.board = board
  next()
})

export const isBoardOwner = (req: Request, res: Response, next: NextFunction) => {
  const userId = req.decodeAccessToken?.userId as string
  const board = req.board as Board
  if (!board.ownerId.equals(userId)) {
    return next(
      new ApiError({
        status: StatusCodes.FORBIDDEN,
        message: 'Access denied'
      })
    )
  }
  next()
}

export const isBoardAdmin = (req: Request, res: Response, next: NextFunction) => {
  /* kiểm tra xem có phải admin board */
  const userId = req.decodeAccessToken?.userId as string
  const board = req.board as Board
  const isOwner = board.adminIds.some((memberId) => memberId.equals(userId))
  if (!isOwner) {
    return next(
      new ApiError({
        status: StatusCodes.FORBIDDEN,
        message: 'Access denied'
      })
    )
  }
  next()
}

export const isBoardMember = (req: Request, res: Response, next: NextFunction) => {
  /* kiểm tra xem có phải thành viên của board (bao gồm cả chủ board) */
  const userId = req.decodeAccessToken?.userId as string
  const board = req.board as Board
  const isMember =
    board.memberIds.some((memberId) => memberId.equals(userId)) ||
    board.adminIds.some((memberId) => memberId.equals(userId))
  if (!isMember) {
    return next(
      new ApiError({
        status: StatusCodes.FORBIDDEN,
        message: 'Access denied'
      })
    )
  }
  next()
}

export const checkBoardVisibility = (req: Request, res: Response, next: NextFunction) => {
  const board = req.board as Board
  if (board.visibility === Visibility.Private) {
    if (!req.decodeAccessToken) {
      return next(
        new ApiError({
          status: StatusCodes.UNAUTHORIZED,
          message: 'access token is required'
        })
      )
    }
    return isBoardMember(req, res, next)
  }
  next()
}

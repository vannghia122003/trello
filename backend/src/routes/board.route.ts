import { Router } from 'express'
import boardController from '~/controllers/board.controller'
import { isLoggedIn, verifyAccessToken } from '~/middlewares/auth.middleware'
import { checkBoardVisibility, findBoardById, isBoardAdmin, isBoardMember } from '~/middlewares/board.middleware'
import boardValidation from '~/validations/board.validation'
import { deleteQueryParams, validateObjectIdParams } from '~/validations/common.validation'

const boardRoute = Router()

boardRoute.get(
  '/:boardId',
  validateObjectIdParams(['boardId']),
  findBoardById('params'),
  isLoggedIn(verifyAccessToken),
  checkBoardVisibility,
  boardController.getBoard
) // get board detail

boardRoute.use(verifyAccessToken) // use middleware

boardRoute.get('/', boardValidation.getBoardsQuery, boardController.getBoards)
boardRoute.post('/', boardValidation.createBoard, boardController.createBoard)

boardRoute.put(
  '/:boardId',
  validateObjectIdParams(['boardId']),
  findBoardById('params'),
  isBoardAdmin,
  boardValidation.updateBoard,
  boardController.updateBoard
)

boardRoute.delete(
  '/:boardId',
  validateObjectIdParams(['boardId']),
  findBoardById('params'),
  isBoardAdmin,
  deleteQueryParams,
  boardController.deleteBoard
)

boardRoute.put(
  '/:boardId/reopen',
  validateObjectIdParams(['boardId']),
  findBoardById('params'),
  isBoardAdmin,
  boardController.reopenBoard
)

boardRoute.put(
  '/:boardId/moving-card',
  validateObjectIdParams(['boardId']),
  findBoardById('params'),
  isBoardMember,
  boardValidation.movingCard,
  boardController.movingCard
)

/* members */

boardRoute.post(
  '/:boardId/members',
  validateObjectIdParams(['boardId']),
  findBoardById('params'),
  isBoardMember,
  boardValidation.addMember,
  boardController.addMember
)

boardRoute.put(
  '/:boardId/members/:memberId',
  validateObjectIdParams(['boardId', 'memberId']),
  findBoardById('params'),
  isBoardAdmin,
  boardValidation.updateMember,
  boardController.updateMember
)

boardRoute.delete(
  '/:boardId/members/:memberId',
  validateObjectIdParams(['boardId', 'memberId']),
  findBoardById('params'),
  isBoardAdmin,
  boardController.removeMember
)

/* labels */
boardRoute.post(
  '/:boardId/labels',
  validateObjectIdParams(['boardId']),
  findBoardById('params'),
  isBoardMember,
  boardValidation.createLabel,
  boardController.createLabel
)
boardRoute.put(
  '/:boardId/labels/:labelId',
  validateObjectIdParams(['boardId', 'labelId']),
  findBoardById('params'),
  isBoardMember,
  boardValidation.updateLabel,
  boardController.updateLabel
)
boardRoute.delete(
  '/:boardId/labels/:labelId',
  validateObjectIdParams(['boardId', 'labelId']),
  findBoardById('params'),
  isBoardMember,
  boardController.deleteLabel
)

/* star board */
boardRoute.post(
  '/:boardId/star',
  validateObjectIdParams(['boardId']),
  findBoardById('params'),
  isBoardMember,
  boardController.starBoard
)
boardRoute.delete(
  '/:boardId/unstar',
  validateObjectIdParams(['boardId']),
  findBoardById('params'),
  isBoardMember,
  boardController.unstarBoard
)

export default boardRoute

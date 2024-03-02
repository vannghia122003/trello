import { Router } from 'express'
import listController from '~/controllers/list.controller'
import { isLoggedIn, verifyAccessToken } from '~/middlewares/auth.middleware'
import { checkBoardVisibility, findBoardById, findBoardByListId, isBoardMember } from '~/middlewares/board.middleware'
import { deleteQueryParams, validateObjectIdParams } from '~/validations/common.validation'
import listValidation from '~/validations/list.validation'

const listRoute = Router()

listRoute.get(
  '/',
  listValidation.getListsQuery,
  isLoggedIn(verifyAccessToken),
  findBoardById('query'),
  checkBoardVisibility,
  listController.getLists
)

listRoute.use(verifyAccessToken) // use middleware

listRoute.post('/', listValidation.createList, findBoardById('body'), isBoardMember, listController.createList)

listRoute.put('/:listId', listValidation.updateList, findBoardByListId, isBoardMember, listController.updateList)

listRoute.delete(
  '/:listId',
  validateObjectIdParams(['listId']),
  deleteQueryParams,
  findBoardByListId,
  isBoardMember,
  listController.deleteList
)

listRoute.put(
  '/:listId/reopen',
  validateObjectIdParams(['listId']),
  findBoardByListId,
  isBoardMember,
  listController.reopenList
) // chỉ member mới được reopen list

export default listRoute

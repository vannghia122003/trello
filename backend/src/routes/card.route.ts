import { Router } from 'express'
import cardController from '~/controllers/card.controller'
import { isLoggedIn, verifyAccessToken } from '~/middlewares/auth.middleware'
import { checkBoardVisibility, findBoardByCardId, findBoardById, isBoardMember } from '~/middlewares/board.middleware'
import cardValidation from '~/validations/card.validation'
import { deleteQueryParams, validateObjectIdParams } from '~/validations/common.validation'

const cardRoute = Router()

cardRoute.get(
  '/',
  cardValidation.getCards,
  findBoardById('query'),
  isLoggedIn(verifyAccessToken),
  checkBoardVisibility,
  cardController.getCards
)
cardRoute.get(
  '/:cardId',
  validateObjectIdParams(['cardId']),
  isLoggedIn(verifyAccessToken),
  findBoardByCardId,
  checkBoardVisibility,
  cardController.getCard
)
cardRoute.get(
  '/:cardId/comments',
  validateObjectIdParams(['cardId']),
  isLoggedIn(verifyAccessToken),
  findBoardByCardId,
  checkBoardVisibility,
  cardController.getComments
)
cardRoute.get(
  '/:cardId/attachments',
  validateObjectIdParams(['cardId']),
  isLoggedIn(verifyAccessToken),
  findBoardByCardId,
  checkBoardVisibility,
  cardController.getAttachments
)

cardRoute.use(verifyAccessToken) // use middleware

cardRoute.post('/', cardValidation.createCard, findBoardById('body'), isBoardMember, cardController.createCard)

cardRoute.delete(
  '/:cardId',
  validateObjectIdParams(['cardId']),
  findBoardByCardId,
  isBoardMember,
  deleteQueryParams,
  cardController.deleteCard
)

cardRoute.patch(
  '/:cardId',
  validateObjectIdParams(['cardId']),
  findBoardByCardId,
  isBoardMember,
  cardValidation.updateCard,
  cardController.updateCard
)

cardRoute.put(
  '/:cardId/reopen',
  validateObjectIdParams(['cardId']),
  findBoardByCardId,
  isBoardMember,
  cardController.reopenCard
)

/* attachments */
cardRoute.post(
  '/:cardId/attachments',
  validateObjectIdParams(['cardId']),
  findBoardByCardId,
  isBoardMember,
  cardValidation.createAttachment,
  cardController.createAttachment
)

cardRoute.put(
  '/:cardId/attachments/:attachmentId',
  validateObjectIdParams(['cardId', 'attachmentId']),
  findBoardByCardId,
  isBoardMember,
  cardValidation.updateAttachment,
  cardController.updateAttachment
)

cardRoute.delete(
  '/:cardId/attachments/:attachmentId',
  validateObjectIdParams(['cardId', 'attachmentId']),
  findBoardByCardId,
  isBoardMember,
  cardController.deleteAttachment
)

/* comments */
cardRoute.post(
  '/:cardId/comments',
  validateObjectIdParams(['cardId']),
  findBoardByCardId,
  isBoardMember,
  cardValidation.createComment,
  cardController.createComment
)
cardRoute.put(
  '/:cardId/comments/:commentId',
  validateObjectIdParams(['cardId', 'commentId']),
  findBoardByCardId,
  isBoardMember,
  cardValidation.updateComment,
  cardController.updateComment
)
cardRoute.delete(
  '/:cardId/comments/:commentId',
  validateObjectIdParams(['cardId', 'commentId']),
  findBoardByCardId,
  isBoardMember,
  cardController.deleteComment
)

/* member */
cardRoute.post(
  '/:cardId/members',
  validateObjectIdParams(['cardId']),
  findBoardByCardId,
  isBoardMember,
  cardValidation.addMember,
  cardController.addMember
)

cardRoute.delete(
  '/:cardId/members/:memberId',
  validateObjectIdParams(['cardId', 'memberId']),
  findBoardByCardId,
  isBoardMember,
  cardController.removeMember
)

/* label */
cardRoute.post(
  '/:cardId/labels',
  validateObjectIdParams(['cardId']),
  findBoardByCardId,
  isBoardMember,
  cardValidation.addLabel,
  cardController.addLabel
)

cardRoute.delete(
  '/:cardId/labels/:labelId',
  validateObjectIdParams(['cardId', 'labelId']),
  findBoardByCardId,
  isBoardMember,
  cardController.removeLabel
)

export default cardRoute

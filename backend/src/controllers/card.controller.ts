import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { StatusCodes } from 'http-status-codes'
import { Board } from '~/models'
import attachmentService from '~/services/attachment.service'
import cardService from '~/services/card.service'
import commentService from '~/services/comment.service'
import {
  AddLabelReqBody,
  AddMemberReqBody,
  AttachmentIdReqParams,
  CardIdReqParams,
  CreateAttachmentReqBody,
  CreateCardReqBody,
  DeleteCardReqQuery,
  GetCardsReqQuery,
  LabelIdReqParams,
  MemberIdReqParams,
  UpdateAttachmentReqBody,
  UpdateCardReqBody
} from '~/types'
import { CommentIdReqParams, CreateCommentReqBody, UpdateCommentReqBody } from '~/types/comment.type'
import catchAsync from '~/utils/catchAsync'

const cardController = {
  createCard: catchAsync(async (req: Request<ParamsDictionary, undefined, CreateCardReqBody>, res: Response) => {
    const data = await cardService.createCard(req.body)
    res.status(StatusCodes.CREATED).json({ message: 'Card created', data })
  }),
  deleteCard: catchAsync(
    async (req: Request<CardIdReqParams, undefined, undefined, DeleteCardReqQuery>, res: Response) => {
      await cardService.deleteCardById(req.params.cardId, req.query.deleteType)
      res.status(StatusCodes.NO_CONTENT).json()
    }
  ),
  getCards: catchAsync(
    async (req: Request<ParamsDictionary, undefined, undefined, GetCardsReqQuery>, res: Response) => {
      const data = await cardService.getCards(req.query.boardId, req.query.status, req.board as Board)
      res.status(StatusCodes.OK).json({ message: 'Get cards successfully', data })
    }
  ),
  getCard: catchAsync(async (req: Request<CardIdReqParams>, res: Response) => {
    const data = await cardService.getCardById(req.params.cardId, req.board as Board)
    res.status(StatusCodes.OK).json({ message: 'Get card successfully', data })
  }),
  updateCard: catchAsync(async (req: Request<CardIdReqParams, undefined, UpdateCardReqBody>, res: Response) => {
    const data = await cardService.updateCardById(req.params.cardId, req.body)
    res.status(StatusCodes.OK).json({ message: 'Update card successfully', data })
  }),
  reopenCard: catchAsync(async (req: Request<CardIdReqParams>, res: Response) => {
    await cardService.reopenCard(req.params.cardId)
    res.status(StatusCodes.OK).json({ message: 'Reopen card successfully' })
  }),

  /* Attachment */
  createAttachment: catchAsync(
    async (req: Request<CardIdReqParams, undefined, CreateAttachmentReqBody>, res: Response) => {
      const data = await attachmentService.createAttachment(req.params.cardId, req.body)
      res.status(StatusCodes.CREATED).json({ message: 'Create attachment successfully', data })
    }
  ),
  getAttachments: catchAsync(async (req: Request<CardIdReqParams>, res: Response) => {
    const data = await attachmentService.getAttachments(req.params.cardId)
    res.status(StatusCodes.OK).json({ message: 'Get attachments successfully', data })
  }),
  deleteAttachment: catchAsync(async (req: Request<AttachmentIdReqParams>, res: Response) => {
    await attachmentService.deleteAttachment(req.params.attachmentId)
    res.status(StatusCodes.NO_CONTENT).json()
  }),
  updateAttachment: catchAsync(
    async (req: Request<AttachmentIdReqParams, undefined, UpdateAttachmentReqBody>, res: Response) => {
      const data = await attachmentService.updateAttachment(req.params.attachmentId, req.body)
      res.status(StatusCodes.OK).json({ message: 'Update attachment successfully', data })
    }
  ),

  /* Comment */
  createComment: catchAsync(async (req: Request<CardIdReqParams, undefined, CreateCommentReqBody>, res: Response) => {
    const userId = req.decodeAccessToken?.userId as string
    const data = await commentService.createComment(userId, req.params.cardId, req.body)
    res.status(StatusCodes.CREATED).json({ message: 'Comment successfully', data })
  }),
  getComments: catchAsync(async (req: Request<CardIdReqParams>, res: Response) => {
    const data = await commentService.getComments(req.params.cardId)
    res.status(StatusCodes.OK).json({ message: 'Get comments successfully', data })
  }),
  updateComment: catchAsync(
    async (req: Request<CommentIdReqParams, undefined, UpdateCommentReqBody>, res: Response) => {
      const data = await commentService.updateComment(req.params.commentId, req.body)
      res.status(StatusCodes.OK).json({ message: 'Update comment successfully', data })
    }
  ),
  deleteComment: catchAsync(async (req: Request<CommentIdReqParams>, res: Response) => {
    await commentService.deleteComment(req.params.commentId)
    res.status(StatusCodes.NO_CONTENT).json()
  }),

  /* Member */
  addMember: catchAsync(async (req: Request<CardIdReqParams, undefined, AddMemberReqBody>, res: Response) => {
    const data = await cardService.addMemberToCard(req.params.cardId, req.board as Board, req.body)
    res.status(StatusCodes.CREATED).json({ message: 'Member added to card successfully', data })
  }),
  removeMember: catchAsync(async (req: Request<CardIdReqParams & MemberIdReqParams>, res: Response) => {
    await cardService.removeMemberFromCard(req.params.cardId, req.params.memberId)
    res.status(StatusCodes.NO_CONTENT).json()
  }),

  /* Label */
  addLabel: catchAsync(async (req: Request<CardIdReqParams, undefined, AddLabelReqBody>, res: Response) => {
    const data = await cardService.addLabelToCard(req.params.cardId, req.board as Board, req.body)
    res.status(StatusCodes.CREATED).json({ message: 'Label added to card successfully', data })
  }),
  removeLabel: catchAsync(async (req: Request<CardIdReqParams & LabelIdReqParams>, res: Response) => {
    await cardService.removeLabelFromCard(req.params.cardId, req.params.labelId)
    res.status(StatusCodes.NO_CONTENT).json()
  })
}

export default cardController

import { NextFunction, Request, Response } from 'express'
import Joi from 'joi'
import { BoardStatus, Role, Visibility } from '~/types'
import {
  HEX_COLOR_MESSAGE,
  HEX_COLOR_RULE,
  OBJECT_ID_RULE,
  OBJECT_ID_RULE_MESSAGE,
  validateSchema
} from '~/utils/validators'

const boardValidation = {
  createBoard(req: Request, res: Response, next: NextFunction) {
    const schema = Joi.object({
      title: Joi.string().required().max(50).trim(),
      visibility: Joi.string()
        .required()
        .valid(...Object.values(Visibility))
        .trim(),
      backgroundId: Joi.string().required().trim().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
    })
    validateSchema(schema, req, next, 'body')
  },

  updateBoard(req: Request, res: Response, next: NextFunction) {
    const schema = Joi.object({
      title: Joi.string().required().max(50).trim(),
      visibility: Joi.string()
        .required()
        .valid(...Object.values(Visibility))
        .trim(),
      listOrderIds: Joi.array().items(Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)).required(),
      backgroundId: Joi.string().required().trim().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
    })
    validateSchema(schema, req, next, 'body')
  },

  movingCard(req: Request, res: Response, next: NextFunction) {
    const schema = Joi.object({
      cardId: Joi.string().required().trim().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
      prevListId: Joi.string().required().trim().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
      prevCardOrderIds: Joi.array()
        .items(Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE))
        .required(),
      nextListId: Joi.string().required().trim().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
      nextCardOrderIds: Joi.array()
        .items(Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE))
        .required()
    })
    validateSchema(schema, req, next, 'body')
  },

  getBoardsQuery(req: Request, res: Response, next: NextFunction) {
    const schema = Joi.object({
      status: Joi.string()
        .required()
        .valid(...Object.values(BoardStatus))
    })
    validateSchema(schema, req, next, 'query')
  },

  addMember(req: Request, res: Response, next: NextFunction) {
    const schema = Joi.object({
      userIds: Joi.array().items(Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)).required()
    })
    validateSchema(schema, req, next, 'body')
  },

  updateMember(req: Request, res: Response, next: NextFunction) {
    const schema = Joi.object({
      role: Joi.string()
        .required()
        .valid(...Object.values(Role))
    })
    validateSchema(schema, req, next, 'body')
  },

  createLabel(req: Request, res: Response, next: NextFunction) {
    const schema = Joi.object({
      name: Joi.string().required(),
      title: Joi.string().required().allow(''),
      hex: Joi.string().required().pattern(HEX_COLOR_RULE).message(HEX_COLOR_MESSAGE)
    })
    validateSchema(schema, req, next, 'body')
  },

  updateLabel(req: Request, res: Response, next: NextFunction) {
    const schema = Joi.object({
      title: Joi.string().required().allow(''),
      hex: Joi.string().required().pattern(HEX_COLOR_RULE).message(HEX_COLOR_MESSAGE)
    })
    validateSchema(schema, req, next, 'body')
  }
}

export default boardValidation

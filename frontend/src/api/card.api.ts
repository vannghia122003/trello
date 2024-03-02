import {
  Attachment,
  Card,
  CardDetail,
  CreateAttachmentData,
  CreateCardData,
  DeleteCardParams,
  GetCardsParams,
  SuccessResponse,
  UpdateAttachmentData,
  UpdateCardData
} from '~/types'
import { AddLabelData, AddMemberData, Comment, CreateCommentData, UpdateCommentData } from '~/types/comment.type'
import axiosClient from './axiosClient'

const cardApi = {
  createCard(data: CreateCardData) {
    return axiosClient.post<undefined, SuccessResponse<Card>>('/cards', data)
  },
  updateCard({ cardId, data }: { cardId: string; data: UpdateCardData }) {
    return axiosClient.patch<undefined, SuccessResponse<Card>>(`/cards/${cardId}`, data)
  },
  deleteCard({ cardId, params }: { cardId: string; params: DeleteCardParams }) {
    return axiosClient.delete(`/cards/${cardId}`, { params })
  },
  getCardDetail(cardId: string) {
    return axiosClient.get<undefined, SuccessResponse<CardDetail>>(`/cards/${cardId}`)
  },
  getCards(params: GetCardsParams) {
    return axiosClient.get<undefined, SuccessResponse<Card[]>>('/cards', { params })
  },
  reopenCard(cardId: string) {
    return axiosClient.put<undefined, SuccessResponse<undefined>>(`/cards/${cardId}/reopen`)
  },

  /* attachment */
  createAttachment({ cardId, data }: { cardId: string; data: CreateAttachmentData }) {
    return axiosClient.post<undefined, SuccessResponse<Attachment>>(`/cards/${cardId}/attachments`, data)
  },
  getAttachments(cardId: string) {
    return axiosClient.get<undefined, SuccessResponse<Attachment[]>>(`/cards/${cardId}/attachments`)
  },
  updateAttachment({
    cardId,
    attachmentId,
    data
  }: {
    cardId: string
    attachmentId: string
    data: UpdateAttachmentData
  }) {
    return axiosClient.put<undefined, SuccessResponse<Attachment>>(`/cards/${cardId}/attachments/${attachmentId}`, data)
  },
  deleteAttachment({ cardId, attachmentId }: { cardId: string; attachmentId: string }) {
    return axiosClient.delete(`/cards/${cardId}/attachments/${attachmentId}`)
  },

  /* comment */
  createComment({ cardId, data }: { cardId: string; data: CreateCommentData }) {
    return axiosClient.post<undefined, SuccessResponse<Comment>>(`/cards/${cardId}/comments`, data)
  },
  getComments(cardId: string) {
    return axiosClient.get<undefined, SuccessResponse<Comment[]>>(`/cards/${cardId}/comments`)
  },
  updateComment({ cardId, commentId, data }: { cardId: string; commentId: string; data: UpdateCommentData }) {
    return axiosClient.put<undefined, SuccessResponse<Comment>>(`/cards/${cardId}/comments/${commentId}`, data)
  },
  deleteComment({ cardId, commentId }: { cardId: string; commentId: string }) {
    return axiosClient.delete(`/cards/${cardId}/comments/${commentId}`)
  },

  addMember({ cardId, data }: { cardId: string; data: AddMemberData }) {
    return axiosClient.post<undefined, SuccessResponse<Card>>(`/cards/${cardId}/members`, data)
  },

  removeMember({ cardId, memberId }: { cardId: string; memberId: string }) {
    return axiosClient.delete(`/cards/${cardId}/members/${memberId}`)
  },

  addLabelToCard({ cardId, data }: { cardId: string; data: AddLabelData }) {
    return axiosClient.post<undefined, SuccessResponse<Card>>(`/cards/${cardId}/labels`, data)
  },

  deleteLabelFromCard({ cardId, labelId }: { cardId: string; labelId: string }) {
    return axiosClient.delete(`/cards/${cardId}/labels/${labelId}`)
  }
}

export default cardApi

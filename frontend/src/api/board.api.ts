import {
  Board,
  BoardDetail,
  CreateBoardData,
  CreateBoardResponse,
  CreateLabelData,
  DeleteBoardParams,
  GetBoardsParams,
  Label,
  MovingCardData,
  SuccessResponse,
  UpdateBoardData,
  UpdateLabelData,
  UpdateMemberData
} from '~/types'
import axiosClient from './axiosClient'

const boardApi = {
  createBoard(data: CreateBoardData) {
    return axiosClient.post<undefined, SuccessResponse<CreateBoardResponse>>('/boards', data)
  },
  getBoards(params: GetBoardsParams) {
    return axiosClient.get<undefined, SuccessResponse<Board[]>>('/boards', { params })
  },
  getBoardDetail(boardId: string) {
    return axiosClient.get<undefined, SuccessResponse<BoardDetail>>(`/boards/${boardId}`)
  },
  updateBoard({ boardId, data }: { boardId: string; data: UpdateBoardData }) {
    return axiosClient.put(`/boards/${boardId}`, data)
  },
  deleteBoard({ boardId, params }: { boardId: string; params: DeleteBoardParams }) {
    return axiosClient.delete<undefined, SuccessResponse<undefined>>(`/boards/${boardId}`, { params })
  },
  movingCard({ boardId, data }: { boardId: string; data: MovingCardData }) {
    return axiosClient.put(`/boards/${boardId}/moving-card`, data)
  },
  reopenBoard(boardId: string) {
    return axiosClient.put<undefined, SuccessResponse<undefined>>(`/boards/${boardId}/reopen`)
  },

  addMember({ boardId, userIds }: { boardId: string; userIds: string[] }) {
    return axiosClient.post<undefined, SuccessResponse<Board>>(`/boards/${boardId}/members`, { userIds })
  },
  updateMember({ boardId, memberId, data }: { boardId: string; memberId: string; data: UpdateMemberData }) {
    return axiosClient.put(`/boards/${boardId}/members/${memberId}`, data)
  },
  removeMember({ boardId, memberId }: { boardId: string; memberId: string }) {
    return axiosClient.delete(`/boards/${boardId}/members/${memberId}`)
  },

  starBoard(boardId: string) {
    return axiosClient.post(`/boards/${boardId}/star`)
  },
  unstarBoard(boardId: string) {
    return axiosClient.delete(`/boards/${boardId}/unstar`)
  },

  createLabelToBoard({ boardId, data }: { boardId: string; data: CreateLabelData }) {
    return axiosClient.post<undefined, SuccessResponse<Label>>(`/boards/${boardId}/labels`, data)
  },
  updateLabel({ boardId, labelId, data }: { boardId: string; labelId: string; data: UpdateLabelData }) {
    return axiosClient.put(`/boards/${boardId}/labels/${labelId}`, data)
  },
  deleteLabelFromBoard({ boardId, labelId }: { boardId: string; labelId: string }) {
    return axiosClient.delete(`/boards/${boardId}/labels/${labelId}`)
  }
}

export default boardApi

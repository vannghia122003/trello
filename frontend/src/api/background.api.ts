import { SuccessResponse } from '~/types'
import axiosClient from './axiosClient'
import { Background } from '~/types/background.type'

const backgroundApi = {
  getAllBackground() {
    return axiosClient.get<undefined, SuccessResponse<Background[]>>('/backgrounds')
  }
}

export default backgroundApi

import { AxiosError, HttpStatusCode, isAxiosError } from 'axios'

export function isUnprocessableEntity<FormError>(error: unknown): error is AxiosError<FormError> {
  // generic type để xác định kiểu trả về của error.response.data (ctrl + click vào AxiosError để đọc)
  return isAxiosError(error) && error.response?.status === HttpStatusCode.UnprocessableEntity
}

export function isUnauthorizedError<UnauthorizedError>(error: unknown): error is AxiosError<UnauthorizedError> {
  return isAxiosError(error) && error.response?.status === HttpStatusCode.Unauthorized
}

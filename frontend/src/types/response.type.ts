export interface SuccessResponse<T> {
  message: string
  data: T
}

export interface ErrorResponse<T> {
  message: string
  errors: T
}

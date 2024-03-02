export interface ErrorsType {
  [key: string]: string
}

class ApiError extends Error {
  message: string
  status: number
  errors?: ErrorsType
  constructor({ message, status, errors }: { message: string; status: number; errors?: ErrorsType }) {
    super(message)
    this.name = 'ApiError'
    this.message = message
    this.status = status
    this.errors = errors

    Error.captureStackTrace(this, this.constructor)
  }
}

export default ApiError

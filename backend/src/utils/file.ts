import { UploadApiErrorResponse, UploadApiResponse, v2 as cloudinary } from 'cloudinary'
import { StatusCodes } from 'http-status-codes'
import multer, { Multer } from 'multer'
import env from '~/config/environment'
import ApiError from './ApiError'

cloudinary.config({
  cloud_name: env.CLOUDINARY_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_SECRET
})

export interface CloudinaryFile extends Express.Multer.File {
  buffer: Buffer
}

const storage = multer.memoryStorage()
export const upload: Multer = multer({
  storage: storage,
  fileFilter(req, file, cb) {
    if (!file.mimetype.includes('image/')) {
      cb(new ApiError({ status: StatusCodes.BAD_REQUEST, message: 'Unsupported image format' }))
    }

    cb(null, true)
  },
  limits: {
    files: 2,
    fileSize: 500 * 1024 // 500kb
  }
})

export const uploadImageToCloudinary = (buffer: Buffer) => {
  return new Promise<string>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { resource_type: 'auto', folder: 'trello' },
      (err: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
        if (err) {
          console.error('Cloudinary upload error:', err)
          return reject(
            new ApiError({
              status: err.http_code,
              message: err.message
            })
          )
        }
        if (!result) {
          return reject(new Error('Cloudinary upload result is undefined'))
        }
        resolve(result.secure_url)
      }
    )

    uploadStream.end(buffer)
  })
}

export const deleteImageFromCloudinary = (public_id: string) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(public_id, (err, result) => {
      if (err) return reject(err)
      resolve(result)
    })
  })
}

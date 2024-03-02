import 'dotenv/config'

const env = {
  PORT: process.env.PORT as string,
  MONGODB_URI: process.env.MONGODB_URI as string,
  DATABASE_NAME: process.env.DATABASE_NAME as string,
  BUILD_MODE: process.env.BUILD_MODE as string,
  CLIENT_URL: process.env.CLIENT_URL as string,

  SECRET_KEY_ACCESS_TOKEN: process.env.SECRET_KEY_ACCESS_TOKEN as string,
  SECRET_KEY_REFRESH_TOKEN: process.env.SECRET_KEY_REFRESH_TOKEN as string,
  SECRET_KEY_EMAIL_VERIFY_TOKEN: process.env.SECRET_KEY_EMAIL_VERIFY_TOKEN as string,
  SECRET_KEY_RESET_PASSWORD_TOKEN: process.env.SECRET_KEY_RESET_PASSWORD_TOKEN as string,

  ACCESS_TOKEN_EXPIRES_IN: process.env.ACCESS_TOKEN_EXPIRES_IN as string,
  REFRESH_TOKEN_EXPIRES_IN: process.env.REFRESH_TOKEN_EXPIRES_IN as string,
  EMAIL_VERIFY_TOKEN_EXPIRES_IN: process.env.EMAIL_VERIFY_TOKEN_EXPIRES_IN as string,
  RESET_PASSWORD_TOKEN_EXPIRES_IN: process.env.RESET_PASSWORD_TOKEN_EXPIRES_IN as string,

  CLOUDINARY_NAME: process.env.CLOUDINARY_NAME as string,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY as string,
  CLOUDINARY_SECRET: process.env.CLOUDINARY_SECRET as string
}

export default env

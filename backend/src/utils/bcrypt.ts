import bcrypt from 'bcrypt'

const salt = bcrypt.genSaltSync(10)

export const hashPassword = (password: string) => {
  return bcrypt.hashSync(password, salt)
}

export const comparePassword = (password: string, hashPassword: string) => {
  return bcrypt.compareSync(password, hashPassword)
}

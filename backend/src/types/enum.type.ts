export enum TokenType {
  AccessToken,
  RefreshToken,
  ResetPasswordToken,
  VerifyToken
}

export enum DeleteType {
  Soft = 'soft',
  Hard = 'hard'
}

export enum BoardStatus {
  Open = 'open',
  Closed = 'closed',
  Starred = 'starred'
}

export enum ListStatus {
  Open = 'open',
  Closed = 'closed'
}

export enum CardStatus {
  Open = 'open',
  Closed = 'closed'
}

export enum AttachmentType {
  Image = 'image',
  Link = 'link'
}

export enum Role {
  Admin = 'admin',
  Member = 'member'
}

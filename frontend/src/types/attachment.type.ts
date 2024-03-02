export interface Attachment {
  _id: string
  cardId: string
  name: string
  type: AttachmentType
  url: string
  createdAt: string
  updatedAt: string
}

export interface CreateAttachmentData {
  name: string
  type: AttachmentType
  url: string
}

export interface UpdateAttachmentData {
  name: string
  url: string
}

export enum AttachmentType {
  Image = 'image',
  Link = 'link'
}

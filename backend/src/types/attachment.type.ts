import { AttachmentType } from '.'

export interface CreateAttachmentReqBody {
  name: string
  type: AttachmentType
  url: string
}

export interface UpdateAttachmentReqBody {
  name: string
  url: string
}

export interface AttachmentIdReqParams {
  attachmentId: string
}

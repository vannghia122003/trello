import { Collection, Db, MongoClient, ServerApiVersion } from 'mongodb'
import { Attachment, Background, Board, Bookmark, Card, Comment, List, RefreshToken, User } from '~/models'
import env from './environment'

class Database {
  private client: MongoClient
  private db: Db

  constructor() {
    this.client = new MongoClient(env.MONGODB_URI, {
      serverApi: {
        version: ServerApiVersion.v1,
        // strict: true,
        deprecationErrors: true
      }
    })
    this.db = this.client.db(env.DATABASE_NAME)
  }

  async connect() {
    try {
      await this.db.command({ ping: 1 })
      console.log('You successfully connected to MongoDB!')
    } catch (error) {
      console.log(error)
      throw error
    }
  }

  initIndex() {
    Promise.all([this.createIndexRefreshTokens(), this.createIndexUsers()])
  }

  async createIndexUsers() {
    const exists = await this.users.indexExists(['email_text_username_text'])
    if (!exists) {
      this.users.createIndex({ email: 'text', username: 'text' }, { default_language: 'none' })
    }
  }

  async createIndexRefreshTokens() {
    const exists = await this.refreshTokens.indexExists(['exp_1', 'token_1'])
    if (!exists) {
      this.refreshTokens.createIndex({ token: 1 })
      this.refreshTokens.createIndex({ exp: 1 }, { expireAfterSeconds: 0 })
    }
  }

  get boards(): Collection<Board> {
    return this.db.collection('boards')
  }
  get lists(): Collection<List> {
    return this.db.collection('lists')
  }
  get cards(): Collection<Card> {
    return this.db.collection('cards')
  }
  get users(): Collection<User> {
    return this.db.collection('users')
  }
  get refreshTokens(): Collection<RefreshToken> {
    return this.db.collection('refreshTokens')
  }
  get backgrounds(): Collection<Background> {
    return this.db.collection('backgrounds')
  }
  get attachments(): Collection<Attachment> {
    return this.db.collection('attachments')
  }
  get comments(): Collection<Comment> {
    return this.db.collection('comments')
  }
  get bookmarks(): Collection<Bookmark> {
    return this.db.collection('bookmarks')
  }
}

const db = new Database()
export default db

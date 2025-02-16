import { Request, Response } from 'express'
import { Language, Translate } from '../src/middlewares/i18n'
import { UserAuth } from '../src/middlewares/check_auth'

declare global {
  namespace Express {
    interface Request {
      language: Language
      user: UserAuth
    }

    interface Response {
      t: Translate
      result: any
    }
  }
}

import axios from 'axios'
import { NextFunction, Request, Response } from 'express'
import qs from 'qs'
import dotenv from 'dotenv'
dotenv.config()

export const validateCaptcha = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { captchaToken } = req.body

  if (!captchaToken) {
    return res.status(400).json({ message: 'Captcha Not Found' })
  }

  try {
    const response = await axios.post(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      qs.stringify({
        secret: process.env.CLOUDFARE_SECRET_KEY,
        response: captchaToken,
      }),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      },
    )

    if (!response.data.success) {
      console.log(
        'Cloudflare Error:',
        JSON.stringify(response.data['error-codes']),
      )
    }

    if (response.data.success) {
      next()
    } else {
      res.status(403).json({
        message: 'Captcha Code Invalid',
        error: response.data['error-codes'],
      })
    }
  } catch (error) {
    console.error('Cloudflare Error')
    res.status(500).json({ message: 'Cloudflare Error' })
  }
}

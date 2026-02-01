import crypto from 'crypto'

export function hash(input: string): string {
  return crypto.createHash('md5').update(input).digest('hex')
}
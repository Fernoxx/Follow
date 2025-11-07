'use strict'

const requiredVars = {
  NEYNAR_API_KEY: process.env.NEYNAR_API_KEY,
  USER_FID: process.env.USER_FID,
  SIGNER_UUID: process.env.SIGNER_UUID,
} as const

type RequiredVarKey = keyof typeof requiredVars

function ensureVar(key: RequiredVarKey): string {
  const value = requiredVars[key]
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`)
  }
  return value
}

export const env = {
  NEYNAR_API_KEY: ensureVar('NEYNAR_API_KEY'),
  USER_FID: ensureVar('USER_FID'),
  SIGNER_UUID: ensureVar('SIGNER_UUID'),
  WEBHOOK_SECRET: process.env.WEBHOOK_SECRET ?? null,
} as const

export type Env = typeof env

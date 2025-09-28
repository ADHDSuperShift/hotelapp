import { Amplify } from 'aws-amplify'
// Prefer modern amplifyconfiguration.json if present, otherwise aws-exports.js
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - js module without types
import awsExports from '@/aws-exports'

let configured = false

export function configureAmplify() {
  if (configured) return
  try {
    Amplify.configure(awsExports)
    configured = true
    console.log('Amplify configured')
  } catch (e) {
    console.warn('Amplify not configured, running in frontend-only mode', e)
  }
}

export function isAmplifyConfigured() {
  return configured
}

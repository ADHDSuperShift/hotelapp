// Centralized Amplify configuration for the app
// Region is pinned to us-east-1 as requested

import { Amplify } from 'aws-amplify'
import awsconfig from '@/aws-exports'

// Configure Amplify with generated config (already pinned to us-east-1)
export function configureAmplify() {
  Amplify.configure(awsconfig)
}

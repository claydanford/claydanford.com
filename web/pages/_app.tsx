import '../styles/globals.css'
import type { AppProps } from 'next/app'
import Amplify from 'aws-amplify'
import { AppSyncConfig } from '../config'

Amplify.configure(AppSyncConfig)

function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}

export default MyApp

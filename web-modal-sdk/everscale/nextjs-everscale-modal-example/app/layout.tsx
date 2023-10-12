import { ClientConfig } from '@eversdk/core'
import { TON_ENDPOINT, TonClientContextProvider } from './context/tonclient'
import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Create Next App',
  description: 'Generated by create next app',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const config: ClientConfig = {
    network: {
      endpoints: [TON_ENDPOINT]
    }
  }
  return (
    <html lang="en">
      <body className={inter.className}>
        <TonClientContextProvider config={config}>{children}</TonClientContextProvider>
      </body>
    </html>
  )
}
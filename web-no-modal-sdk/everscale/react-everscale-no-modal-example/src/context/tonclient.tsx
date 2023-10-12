import React, { useState, createContext } from 'react'
import type { ReactNode } from 'react'
import { libWeb, libWebSetup } from "@eversdk/lib-web"
import { ClientConfig, TonClient } from "@eversdk/core"
import { useMountEffectOnce } from '../hooks/useMountEffectOnce'

interface ITonClientContext {
  tonClient?: TonClient
}

interface TonClientContextProviderProps {
  config: ClientConfig,
  children: ReactNode
}

const initial: ITonClientContext = {}

//get endpoing from https://dashboard.evercloud.dev/ 
export const TON_ENDPOINT =
  'https://devnet.evercloud.dev/7768b66385354827847158c2ef411b28/graphql'

export const TonClientContext = createContext(initial)

export const TonClientContextProvider: React.FC<TonClientContextProviderProps> = ({ children, config }) => {
  const [state, setState] = useState<ITonClientContext>(initial)

  // In development, React renders twice when Strict Mode is enabled: https://reactjs.org/docs/strict-mode.html
  // That's why it must be limited to a single mount run
  useMountEffectOnce(() => {
    libWebSetup({
      disableSeparateWorker: true,
    })
    // eslint-disable-next-line react-hooks/rules-of-hooks
    TonClient.useBinaryLibrary(libWeb as any)
    setState({ tonClient: new TonClient(config) })
  })

  return (
    <TonClientContext.Provider value={state}>
      {children}
    </TonClientContext.Provider>
  )
}


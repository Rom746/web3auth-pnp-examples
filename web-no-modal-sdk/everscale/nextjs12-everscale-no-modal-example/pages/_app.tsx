import { TON_ENDPOINT, TonClientContextProvider } from "@/lib/context/tonclient";
import "../styles/globals.css";

import type { AppProps } from "next/app";
import { ClientConfig } from "@eversdk/core";

function MyApp({ Component, pageProps }: AppProps) {
  const config: ClientConfig = {
    network: {
      endpoints: [TON_ENDPOINT]
    }
  }
  return (
    <TonClientContextProvider config={config}>
      <Component {...pageProps} />
    </TonClientContextProvider>
  );
}

export default MyApp;
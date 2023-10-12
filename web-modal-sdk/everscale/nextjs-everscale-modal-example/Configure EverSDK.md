The Everscale SDK is a comprehensive library designed for DApp development on TVM-based blockchains. This includes chains such as Everscale, TON, Venom Blockchain, Gosh, and others.

This guide will walk you through the installation process, handling the WebAssembly (WASM) file.

## How to Use

### Download Manually

```bash
npm install @eversdk/core @eversdk/lib-web @eversdk/appkit
```

### Setup library

```
import {TonClient} from "@eversdk/core";
import {libWeb} from "@eversdk/lib-web";

// Application initialization

TonClient.useBinaryLibrary(libWeb);
```

### Framework config

We have to perform several steps to modify classic Next.js app:

1. Create `TonClientContextProvider` component that performs an async initialization 
   of the SDK core library (see context/tonclient.tsx).

2. Include `TonClientContextProvider` in the app element hierarchy close 
   to the root (pages/_app.tsx or app/layout.tsx).

3. Check that library is initialized somewhere in the root component (pages/index.tsx or app/page.tsx).

4. You can safely use the provided TonClient object where you need.

5. Add the `prep.js` script which copies the `eversdk.wasm` module from `node_modules` into `public` folder.

6. Add the `copy-webpack-plugin` configuration to `next.config.js` , which copies the `eversdk.wasm` module from `node_modules`.

## Useful links

- [Everscale SDK](https://github.com/tonlabs/ever-sdk-js)
- [Everscale Quick start](https://docs.everos.dev/ever-sdk/quick_start)
- [Everscale AppKit](https://github.com/tonlabs/ever-appkit-js)
- [web3auth Website](https://web3auth.io)
- [web3auth Docs](https://web3auth.io/docs)
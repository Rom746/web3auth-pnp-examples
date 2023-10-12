'use client';
import { CHAIN_NAMESPACES, SafeEventEmitterProvider } from "@web3auth/base";
import { Web3Auth } from "@web3auth/modal";
import { useContext, useEffect, useState } from "react";

import RPC from "./everscaleRPC";
import { TON_ENDPOINT, TonClientContext } from "./context/tonclient";

const clientId = "BEIJgJYcY3Rv9mB3ArL5qq5gWlyXzqgolFk1uOs2Qzl1H0AxX4Sm72_HkoKh3rc9Hyiv1DWTJdIEu7MmOQIwqLA"; // get from https://dashboard.web3auth.io

export default function App() {
  const [web3auth, setWeb3auth] = useState<Web3Auth | null>(null);
  const [provider, setProvider] = useState<SafeEventEmitterProvider | null>(null);
  const { tonClient } = useContext(TonClientContext)
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const web3authInstance = new Web3Auth({
          clientId,
          chainConfig: {
            chainId: '0x42',
            chainNamespace: CHAIN_NAMESPACES.OTHER,
            rpcTarget: TON_ENDPOINT,
            blockExplorer: '',
            displayName: 'Everscale',
            ticker: 'EVER',
            tickerName: 'EVER',
          },
          web3AuthNetwork: 'testnet'
        });

        setWeb3auth(web3authInstance);

        await web3authInstance.initModal();
        setProvider(web3authInstance.provider);

        if (web3authInstance.connectedAdapterName) {
          setLoggedIn(true);
        }
      } catch (error) {
        console.error(error);
      }
    };

    init();
  }, []);

  function uiConsole(...args: any[]): void {
    const el = document.querySelector("#console>p");
    if (el) {
      el.innerHTML = JSON.stringify(args || {}, null, 2);
    }
  }

  const login = async () => {
    if (!web3auth) {
      uiConsole("web3auth not initialized yet");
      return;
    }
    const web3authProvider = await web3auth.connect();
    setProvider(web3authProvider);
    setLoggedIn(true);
  };

  const authenticateUser = async () => {
    if (!web3auth) {
      uiConsole("web3auth not initialized yet");
      return;
    }
    const idToken = await web3auth.authenticateUser();
    uiConsole(idToken);
  };

  const getUserInfo = async () => {
    if (!web3auth) {
      uiConsole("web3auth not initialized yet");
      return;
    }
    const user = await web3auth.getUserInfo();
    uiConsole(user);
  };

  const logout = async () => {
    if (!web3auth) {
      uiConsole("web3auth not initialized yet");
      return;
    }
    await web3auth.logout();
    setProvider(null);
    setLoggedIn(false);
  };

  const onGetEverscaleAccount = async () => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    if (!tonClient) {
      uiConsole("ton client not initialized yet");
      return;
    }
    const rpc = new RPC(provider as SafeEventEmitterProvider, tonClient);
    const everAccount = await rpc.getEverscaleAccount();
    if (everAccount?.acc_type === 3) {
      uiConsole('Account not deployed', everAccount);
    } else uiConsole(everAccount);
  };

  const getEverscaleAddress = async () => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    if (!tonClient) {
      uiConsole("ton client not initialized yet");
      return;
    }
    const rpc = new RPC(provider as SafeEventEmitterProvider, tonClient);
    const everAddress = await rpc.getAddress();
    uiConsole(everAddress);
  };

  const deployEverscaleAccount = async () => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    if (!tonClient) {
      uiConsole("ton client not initialized yet");
      return;
    }
    const rpc = new RPC(provider as SafeEventEmitterProvider, tonClient);
    const deploy = await rpc.deployAccount();
    uiConsole(deploy?.message ? deploy?.message : deploy);
  };

  const deployEverscaleAccountFromGiver = async () => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    if (!tonClient) {
      uiConsole("ton client not initialized yet");
      return;
    }
    const rpc = new RPC(provider as SafeEventEmitterProvider, tonClient);
    const deploy = await rpc.deployAccountFromGiver();
    uiConsole(deploy?.message ? deploy?.message : deploy);
  };

  const getEverscaleBalance = async () => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    if (!tonClient) {
      uiConsole("ton client not initialized yet");
      return;
    }
    const rpc = new RPC(provider as SafeEventEmitterProvider, tonClient);
    const balance = await rpc.getBalance();
    uiConsole(balance);
  }

  const sendEverscaleTransaction = async () => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    if (!tonClient) {
      uiConsole("ton client not initialized yet");
      return;
    }
    const rpc = new RPC(provider as SafeEventEmitterProvider, tonClient);
    const transaction = await rpc.sendTransaction();
    uiConsole(transaction);
  }

  const loggedInView = (
    <>
      <div className="flex-container">
        <button onClick={getUserInfo} className="card">
          Get User Info
        </button>
        <button onClick={authenticateUser} className="card">
          Get ID Token
        </button>
        <button onClick={onGetEverscaleAccount} className="card">
          Get Everscale Account
        </button>
        <button onClick={getEverscaleAddress} className="card">
          Get Everscale Address
        </button>
        <button onClick={getEverscaleBalance} className="card">
          Get Everscale Balance
        </button>
        <button onClick={deployEverscaleAccount} className="card">
          Deploy Everscale Account
        </button>
        <button onClick={deployEverscaleAccountFromGiver} className="card">
          Deploy Everscale Account from Giver
        </button>
        <button onClick={sendEverscaleTransaction} className="card">
          Send 1 EVER to Giver
        </button>
        <button onClick={logout} className="card">
          Log Out
        </button>
      </div>
      <div id="console" style={{ whiteSpace: "pre-line" }}>
        <p style={{ whiteSpace: "pre-line" }}></p>
      </div>
    </>
  );

  const unloggedInView = (
    <button onClick={login} className="card">
      Login
    </button>
  );

  return (
    <div className="container">
      <h1 className="title">
        <a target="_blank" href="http://web3auth.io/" rel="noreferrer">
          Web3Auth
        </a>
        & NextJS Everscale Example
      </h1>

      <div className="grid">{loggedIn ? loggedInView : unloggedInView}</div>

      <footer className="footer">
        <a
          href="https://github.com/Web3Auth/examples/tree/main/web-modal-sdk/everscale/nextjs-everscale-modal-example"
          target="_blank"
          rel="noopener noreferrer"
        >
          Source code
        </a>
      </footer>
    </div>
  );
}

import {
  ADAPTER_EVENTS,
  IProvider,
  WALLET_ADAPTER_TYPE,
} from "@web3auth/base";
import { Web3AuthNoModal } from "@web3auth/no-modal";
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";
import { SolanaPrivateKeyProvider } from "@web3auth/solana-provider";
import { LOGIN_PROVIDER_TYPE, OpenloginAdapter, PrivateKeyProvider } from "@web3auth/openlogin-adapter";
import {
  createContext,
  FunctionComponent,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { CHAIN_CONFIG, CHAIN_CONFIG_TYPE } from "../config/chainConfig";
import { WEB3AUTH_NETWORK_TYPE } from "../config/web3AuthNetwork";
import { getWalletProvider, IWalletProvider } from "./walletProvider";

export interface IWeb3AuthContext {
  web3Auth: Web3AuthNoModal | null;
  provider: IWalletProvider | null;
  isLoading: boolean;
  user: unknown;
  chain: string;
  login: (
    adapter: WALLET_ADAPTER_TYPE,
    provider: LOGIN_PROVIDER_TYPE,
    jwtToken: string
  ) => Promise<void>;
  logout: () => Promise<void>;
  setIsLoading: (loading: boolean) => void;
  getUserInfo: () => Promise<any>;
  signMessage: () => Promise<any>;
  getAccounts: () => Promise<any>;
  getBalance: () => Promise<any>;
  signTransaction: () => Promise<void>;
  signAndSendTransaction: () => Promise<void>;
}

export const Web3AuthContext = createContext<IWeb3AuthContext>({
  web3Auth: null,
  provider: null,
  isLoading: false,
  user: null,
  chain: "",
  setIsLoading: (loading: boolean) => {},
  login: async (
    adapter: WALLET_ADAPTER_TYPE,
    provider: LOGIN_PROVIDER_TYPE,
    jwtToken: string
  ) => {},
  logout: async () => {},
  getUserInfo: async () => {},
  signMessage: async () => {},
  getAccounts: async () => {},
  getBalance: async () => {},
  signTransaction: async () => {},
  signAndSendTransaction: async () => {},
});

export function useWeb3Auth(): IWeb3AuthContext {
  return useContext(Web3AuthContext);
}

interface IWeb3AuthState {
  web3AuthNetwork: WEB3AUTH_NETWORK_TYPE;
  chain: CHAIN_CONFIG_TYPE;
  children?: React.ReactNode;
}
interface IWeb3AuthProps {
  children?: ReactNode;
  web3AuthNetwork: WEB3AUTH_NETWORK_TYPE;
  chain: CHAIN_CONFIG_TYPE;
}

export const Web3AuthProvider: FunctionComponent<IWeb3AuthState> = ({
  children,
  web3AuthNetwork,
  chain,
}: IWeb3AuthProps) => {
  const [web3Auth, setWeb3Auth] = useState<Web3AuthNoModal | null>(null);
  const [provider, setProvider] = useState<IWalletProvider | null>(null);
  const [user, setUser] = useState<unknown | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const setWalletProvider = useCallback(
    (web3authProvider: IProvider) => {
      const walletProvider = getWalletProvider(
        chain,
        web3authProvider,
        uiConsole
      );
      setProvider(walletProvider);
    },
    [chain]
  );

  useEffect(() => {
    const subscribeAuthEvents = (web3auth: Web3AuthNoModal) => {
      // Can subscribe to all ADAPTER_EVENTS and LOGIN_MODAL_EVENTS
      web3auth.on(ADAPTER_EVENTS.CONNECTED, (data: unknown) => {
        console.log("Yeah!, you are successfully logged in", data);
        setUser(data);
        setWalletProvider(web3auth.provider!);
      });

      web3auth.on(ADAPTER_EVENTS.CONNECTING, () => {
        console.log("connecting");
      });

      web3auth.on(ADAPTER_EVENTS.DISCONNECTED, () => {
        console.log("disconnected");
        setUser(null);
      });

      web3auth.on(ADAPTER_EVENTS.ERRORED, (error) => {
        console.error("some error or user has cancelled login request", error);
      });
    };

    const currentChainConfig = CHAIN_CONFIG[chain];

    async function init() {
      try {
        setIsLoading(true);
        // get your client id from https://dashboard.web3auth.io by registering a plug and play application.
        const clientId =
          process.env.REACT_APP_CLIENT_ID ||
          "BEglQSgt4cUWcj6SKRdu5QkOXTsePmMcusG5EAoyjyOYKlVRjIF1iCNnMOTfpzCiunHRrMui8TIwQPXdkQ8Yxuk";

        const web3AuthInstance = new Web3AuthNoModal({
          chainConfig: currentChainConfig,
          clientId,
          web3AuthNetwork,
        });
        subscribeAuthEvents(web3AuthInstance);
        var privateKeyProvider: PrivateKeyProvider = new EthereumPrivateKeyProvider({ config: { chainConfig: currentChainConfig } });
        if (chain === "solana") {
          privateKeyProvider = new SolanaPrivateKeyProvider({ config: { chainConfig: currentChainConfig } });
        }
        const adapter = new OpenloginAdapter({
          privateKeyProvider,
          adapterSettings: {
            clientId,
            uxMode: "redirect",
            loginConfig: {
              jwt: {
                verifier: "web3auth-firebase-examples",
                typeOfLogin: "jwt",
                clientId,
              },
            },
          },
        });
        web3AuthInstance.configureAdapter(adapter);
        await web3AuthInstance.init();
        setWeb3Auth(web3AuthInstance);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }
    init();
  }, [chain, web3AuthNetwork, setWalletProvider]);

  const login = async (
    adapter: WALLET_ADAPTER_TYPE,
    loginProvider: LOGIN_PROVIDER_TYPE,
    jwtToken: string
  ) => {
    try {
      setIsLoading(true);
      if (!web3Auth) {
        console.log("web3auth not initialized yet");
        uiConsole("web3auth not initialized yet");
        return;
      }
      const localProvider = await web3Auth.connectTo(adapter, {
        loginProvider: "jwt",
        extraLoginOptions: {
          id_token: jwtToken,
          verifierIdField: "sub",
          domain: "http://localhost:3000",
        },
      });
      setWalletProvider(localProvider!);
    } catch (error) {
      console.log("error", error);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    if (!web3Auth) {
      console.log("web3auth not initialized yet");
      uiConsole("web3auth not initialized yet");
      return;
    }
    await web3Auth.logout();
    setProvider(null);
  };

  const getUserInfo = async () => {
    if (!web3Auth) {
      console.log("web3auth not initialized yet");
      uiConsole("web3auth not initialized yet");
      return;
    }
    const user = await web3Auth.getUserInfo();
    uiConsole(user);
  };

  const getAccounts = async () => {
    if (!provider) {
      console.log("provider not initialized yet");
      uiConsole("provider not initialized yet");
      return;
    }
    await provider.getAccounts();
  };

  const getBalance = async () => {
    if (!provider) {
      console.log("provider not initialized yet");
      uiConsole("provider not initialized yet");
      return;
    }
    await provider.getBalance();
  };

  const signMessage = async () => {
    if (!provider) {
      console.log("provider not initialized yet");
      uiConsole("provider not initialized yet");
      return;
    }
    await provider.signMessage();
  };

  const signTransaction = async () => {
    if (!provider) {
      console.log("provider not initialized yet");
      uiConsole("provider not initialized yet");
      return;
    }
    await provider.signTransaction();
  };

  const signAndSendTransaction = async () => {
    if (!provider) {
      console.log("provider not initialized yet");
      uiConsole("provider not initialized yet");
      return;
    }
    await provider.signAndSendTransaction();
  };

  const uiConsole = (...args: unknown[]): void => {
    const el = document.querySelector("#console>p");
    if (el) {
      el.innerHTML = JSON.stringify(args || {}, null, 2);
    }
  };

  const contextProvider = {
    web3Auth,
    chain,
    provider,
    user,
    isLoading,
    setIsLoading,
    login,
    logout,
    getUserInfo,
    getAccounts,
    getBalance,
    signMessage,
    signTransaction,
    signAndSendTransaction,
  };
  return (
    <Web3AuthContext.Provider value={contextProvider}>
      {children}
    </Web3AuthContext.Provider>
  );
};

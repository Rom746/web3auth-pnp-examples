<template>
  <div id="app">
    <h2>Login with Web3Auth and Solana</h2>
    <Loader :isLoading="loading"></Loader>
    <section
      :style="{
        fontSize: '12px',
      }"
    >
      <button class="rpcBtn" v-if="!provider" @click="connect" style="cursor: pointer">Connect</button>
      <button class="rpcBtn" v-if="provider" @click="logout" style="cursor: pointer">Logout</button>
      <button class="rpcBtn" v-if="provider" @click="getUserInfo" style="cursor: pointer">Get User Info</button>
      <button class="rpcBtn" v-if="provider" @click="authenticateUser" style="cursor: pointer">Get Auth Id token</button>
      <SolanaRpc v-if="provider" :provider="provider" :console="console"></SolanaRpc>
      <!-- <button @click="showError" style="cursor: pointer">Show Error</button> -->
    </section>
    <div id="console" style="white-space: pre-line">
      <p style="white-space: pre-line"></p>
    </div>
  </div>
</template>

<script lang="ts">
import { OPENLOGIN_NETWORK_TYPE } from "@toruslabs/openlogin-utils";
import {
  ADAPTER_STATUS,
  CHAIN_NAMESPACES,
  CONNECTED_EVENT_DATA,
  CustomChainConfig,
  LoginMethodConfig,
  IProvider,
  WALLET_ADAPTERS,
} from "@web3auth/base";
import { Web3Auth } from "@web3auth/modal";
import { OpenloginAdapter } from "@web3auth/openlogin-adapter";
import { SlopeAdapter } from "@web3auth/slope-adapter";
import { SolanaWalletConnectorPlugin } from "@web3auth/solana-wallet-connector-plugin";
import { SolflareAdapter } from "@web3auth/solflare-adapter";
import { SolanaWalletAdapter } from "@web3auth/torus-solana-adapter";
import Vue from "vue";

import Loader from "@/components/loader.vue";

import config from "../config";
import SolanaRpc from "../rpc/solanaRpc.vue";
const solanaChainConfig: CustomChainConfig = {
  chainNamespace: CHAIN_NAMESPACES.SOLANA,
  rpcTarget: "https://api.devnet.solana.com",
  blockExplorer: "https://explorer.solana.com?cluster=devnet",
  chainId: "0x3",
  displayName: "devnet",
  ticker: "SOL",
  tickerName: "solana",
};

export default Vue.extend({
  name: "SolanaChain",
  props: {
    plugins: {
      type: Object,
      default: () => ({}),
    },
    adapterConfig: {
      type: Object,
    },
    openloginNetwork: {
      type: String,
      default: "testnet",
    },
  },
  watch: {
    adapterConfig: async function (newVal, oldVal) {
      // watch it
      console.log("Prop changed: ", newVal, " | was: ", oldVal);
      await this.initSolanaAuth();
    },
  },
  data() {
    return {
      modalConfig: {},
      loading: false,
      loginButtonStatus: "",
      provider: undefined,
      web3auth: new Web3Auth({
        chainConfig: { chainNamespace: CHAIN_NAMESPACES.SOLANA },
        clientId: config.clientId[this.openloginNetwork],
        enableLogging: true,
      }),
    };
  },
  components: {
    SolanaRpc,
    Loader,
  },
  async mounted() {
    await this.initSolanaAuth();
  },
  methods: {
    parseConfig() {
      this.adapterConfig.adapter.forEach((adapterConf) => {
        this.modalConfig[adapterConf.id] = {
          name: adapterConf.name,
          showOnModal: adapterConf.checked,
        };
        if (adapterConf.id === "openlogin") {
          const loginMethodsConfig: LoginMethodConfig = {};
          this.adapterConfig.login.forEach((loginProvider) => {
            loginMethodsConfig[loginProvider.id] = {
              name: loginProvider.name,
              showOnModal: loginProvider.checked,
            };
          });
          this.modalConfig[adapterConf.id] = {
            ...this.modalConfig[adapterConf.id],
            loginMethods: loginMethodsConfig,
          };
        }
      });
    },
    async initSolanaAuth() {
      try {
        this.parseConfig();

        this.loading = true;
        this.web3auth = new Web3Auth({
          chainConfig: solanaChainConfig,
          clientId: config.clientId[this.openloginNetwork],
          authMode: "DAPP",
          enableLogging: true,
        });
        const openloginAdapter = new OpenloginAdapter({
          adapterSettings: {
            network: this.openloginNetwork as OPENLOGIN_NETWORK_TYPE,
            clientId: config.clientId[this.openloginNetwork],
          },
        });
        const slopeAdapter = new SlopeAdapter();
        const solflareAdapter = new SolflareAdapter();
        const solAdapter = new SolanaWalletAdapter({ initParams: { buildEnv: "testing" } });
        this.web3auth.configureAdapter(solAdapter);
        this.web3auth.configureAdapter(solflareAdapter);
        this.web3auth.configureAdapter(slopeAdapter);
        this.web3auth.configureAdapter(openloginAdapter);
        if (this.plugins["torusWallet"]) {
          const torusPlugin = new SolanaWalletConnectorPlugin({
            torusWalletOpts: {},
            walletInitOptions: {
              enableLogging: true,
            },
          });
          await this.web3auth.addPlugin(torusPlugin);
        }
        this.subscribeAuthEvents(this.web3auth);
        await this.web3auth.initModal({
          modalConfig: {
            // to hide social login methods
            [WALLET_ADAPTERS.OPENLOGIN]: {
              label: "OpenLogin",
              loginMethods: {
                twitter: {
                  name: "twitter",
                  showOnModal: false,
                },
              },
            },
          },
        });
      } catch (error) {
        console.log("error", error);
        this.console("error", error);
      } finally {
        this.loading = false;
      }
    },
    async setupProvider(provider: IProvider) {
      this.provider = provider;
    },
    subscribeAuthEvents(web3auth: Web3Auth) {
      web3auth.on(ADAPTER_STATUS.CONNECTED, async (data: CONNECTED_EVENT_DATA) => {
        this.console("connected to wallet", data);
        await this.setupProvider(web3auth.provider);
        this.loginButtonStatus = "Logged in";
      });
      web3auth.on(ADAPTER_STATUS.CONNECTING, () => {
        this.console("connecting");
        this.loginButtonStatus = "Connecting...";
      });
      web3auth.on(ADAPTER_STATUS.DISCONNECTED, () => {
        this.console("disconnected");
        this.loginButtonStatus = "";
        this.provider = undefined;
      });
      web3auth.on(ADAPTER_STATUS.ERRORED, (error) => {
        console.log("error", error);
        this.console("errored", error);
        this.loginButtonStatus = "";
      });
    },
    async connect() {
      try {
        const provider = await this.web3auth.connect();
        await this.setupProvider(provider);
      } catch (error) {
        console.error(error);
        this.console("error", error);
      }
    },

    async logout() {
      await this.web3auth.logout();
      this.provider = undefined;
    },
    async getUserInfo() {
      const userInfo = await this.web3auth.getUserInfo();
      this.console(userInfo);
    },
    async authenticateUser() {
      const idTokenDetails = await this.web3auth.authenticateUser();
      this.console(idTokenDetails);
    },
    console(...args: unknown[]): void {
      const el = document.querySelector("#console>p");
      if (el) {
        el.innerHTML = JSON.stringify(args || {}, null, 2);
      }
    },
  },
});
</script>

<template>
  <div id="app">
    <h2>
      <a target="_blank" href="http://web3auth.io/" rel="noreferrer">
        Web3Auth
      </a>
      Vue.js Everscale Example
    </h2>

    <button v-if="!loggedin" class="card" @click="login" style="cursor: pointer">
      Login
    </button>

    <div v-if="loggedin">
      <div class="flex-container">
        <button class="card" @click="getUserInfo" style="cursor: pointer">
          Get User Info
        </button>
        <button class="card" @click="authenticateUser" style="cursor: pointer">
          Get ID Token
        </button>
        <button class="card" @click="onGetEverscaleAccount" style="cursor: pointer">
          Get Everscale Accounts
        </button>
        <button class="card" @click="getEverscaleAddress" style="cursor: pointer">
          Get Everscale Address
        </button>
        <button class="card" @click="getEverscaleBalance" style="cursor: pointer">
          Get Everscale Balance
        </button>
        <button class="card" @click="deployEverscaleAccount" style="cursor: pointer">
          Deploy Everscale Account
        </button>
        <button class="card" @click="deployEverscaleAccountFromGiver" style="cursor: pointer">
          Deploy Everscale Account from Giver
        </button>
        <button class="card" @click="sendEverscaleTransaction" style="cursor: pointer">
          Send 1 EVER to Giver
        </button>
        <button class="card" @click="logout" style="cursor: pointer">
          Logout
        </button>
      </div>
      <div id="console" style="white-space: pre-line">
        <p style="white-space: pre-line"></p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { ref, onMounted } from "vue";
import { Web3Auth } from "@web3auth/modal";
import {
  WALLET_ADAPTERS,
  CHAIN_NAMESPACES,
  SafeEventEmitterProvider,
} from "@web3auth/base";
import RPC from "./everscaleRPC";
import { TON_ENDPOINT } from "./everscaleRPC";

export default {
  name: "Home",
  props: {
    msg: String,
  },
  setup() {
    const loggedin = ref<boolean>(false);
    const loading = ref<boolean>(false);
    const loginButtonStatus = ref<string>("");
    const connecting = ref<boolean>(false);
    let provider = ref<SafeEventEmitterProvider | any>(null);
    const clientId = "BEIJgJYcY3Rv9mB3ArL5qq5gWlyXzqgolFk1uOs2Qzl1H0AxX4Sm72_HkoKh3rc9Hyiv1DWTJdIEu7MmOQIwqLA"; // get from https://dashboard.web3auth.io

    const web3auth = new Web3Auth({
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

    onMounted(async () => {
      try {
        loading.value = true;
        loggedin.value = false;

        await web3auth.initModal();
        if (web3auth.provider) {
          provider = web3auth.provider;
          loading.value = true;
        }
      } catch (error) {
        uiConsole("error", error);
      } finally {
        loading.value = false;
      }
    });

    const login = async () => {
      if (!web3auth) {
        uiConsole("web3auth not initialized yet");
        return;
      }
      provider = await web3auth.connect();
      loggedin.value = true;
      uiConsole("Logged in Successfully!");
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
      provider = null;
      loggedin.value = false;
    };

    function uiConsole(...args: any[]): void {
      const el = document.querySelector("#console>p");
      if (el) {
        el.innerHTML = JSON.stringify(args || {}, null, 2);
      }
    }

    const onGetEverscaleAccount = async () => {
      if (!provider) {
        uiConsole("provider not initialized yet");
        return;
      }
      const rpc = new RPC(provider as SafeEventEmitterProvider);
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
      const rpc = new RPC(provider as SafeEventEmitterProvider);
      const everAddress = await rpc.getAddress();
      uiConsole(everAddress);
    };

    const deployEverscaleAccount = async () => {
      if (!provider) {
        uiConsole("provider not initialized yet");
        return;
      }
      const rpc = new RPC(provider as SafeEventEmitterProvider);
      const deploy = await rpc.deployAccount();
      uiConsole(deploy?.message ? deploy?.message : deploy);
    };

    const deployEverscaleAccountFromGiver = async () => {
      if (!provider) {
        uiConsole("provider not initialized yet");
        return;
      }
      const rpc = new RPC(provider as SafeEventEmitterProvider);
      const deploy = await rpc.deployAccountFromGiver();
      uiConsole(deploy?.message ? deploy?.message : deploy);
    };

    const getEverscaleBalance = async () => {
      if (!provider) {
        uiConsole("provider not initialized yet");
        return;
      }
      const rpc = new RPC(provider as SafeEventEmitterProvider);
      const balance = await rpc.getBalance();
      uiConsole(balance);
    }

    const sendEverscaleTransaction = async () => {
      if (!provider) {
        uiConsole("provider not initialized yet");
        return;
      }

      const rpc = new RPC(provider as SafeEventEmitterProvider);
      const transaction = await rpc.sendTransaction();
      uiConsole(transaction);
    }

    return {
      loggedin,
      loading,
      loginButtonStatus,
      connecting,
      provider,
      web3auth,
      login,
      authenticateUser,
      logout,
      getUserInfo,
      onGetEverscaleAccount,
      getEverscaleAddress,
      deployEverscaleAccount,
      deployEverscaleAccountFromGiver,
      getEverscaleBalance,
      sendEverscaleTransaction,
    };
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
#app {
  width: 70%;
  margin: auto;
  padding: 0 2rem;
}

h3 {
  margin: 40px 0 0;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  display: inline-block;
  margin: 0 10px;
}

a {
  color: #42b983;
}

.card {
  width: 180px;
  height: 54px;
  margin: 10px;
  padding: 10px;
  text-align: center;
  color: #0070f3;
  background-color: #fafafa;
  text-decoration: none;
  border: 1px solid #0070f3;
  border-radius: 10px;
  transition: color 0.15s ease, border-color 0.15s ease;
}

.card:hover,
.card:focus,
.card:active {
  cursor: pointer;
  background-color: #f1f1f1;
}

.flex-container {
  display: flex;
  flex-flow: row wrap;
}

#console {
  width: 100%;
  height: 100%;
  overflow: auto;
  word-wrap: break-word;
  font-size: 16px;
  font-family: monospace;
  text-align: left;
}
</style>

import { Component } from "@angular/core";
import { CHAIN_NAMESPACES, SafeEventEmitterProvider, WALLET_ADAPTERS } from "@web3auth/base";
import { Web3AuthNoModal } from "@web3auth/no-modal";
import { OpenloginAdapter } from "@web3auth/openlogin-adapter";
import RPC, { TON_ENDPOINT } from "./everscaleRPC";
import { CommonPrivateKeyProvider } from "@web3auth/base-provider";
const clientId = "BEIJgJYcY3Rv9mB3ArL5qq5gWlyXzqgolFk1uOs2Qzl1H0AxX4Sm72_HkoKh3rc9Hyiv1DWTJdIEu7MmOQIwqLA"; // get from https://dashboard.web3auth.io

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"],
})
export class AppComponent {
  title = "angular-app";

  web3auth: Web3AuthNoModal | null = null;

  provider: SafeEventEmitterProvider | null = null;

  isModalLoaded = false;

  loggedIn = false;



  async ngOnInit() {
    const chainConfig = {
      chainId: '0x42',
      chainNamespace: CHAIN_NAMESPACES.OTHER,
      rpcTarget: TON_ENDPOINT,
      blockExplorer: '',
      displayName: 'Everscale',
      ticker: 'EVER',
      tickerName: 'EVER',
    };
    this.web3auth = new Web3AuthNoModal({
      clientId,
      chainConfig,
      web3AuthNetwork: 'testnet'
    });
    const { web3auth } = this;
    const privateKeyProvider = new CommonPrivateKeyProvider({ config: { chainConfig } });
    const openloginAdapter = new OpenloginAdapter({
      privateKeyProvider,
    });
    web3auth.configureAdapter(openloginAdapter);
    await web3auth.init();
    if (web3auth.connected) {
      this.provider = web3auth.provider;
      this.loggedIn = true;
    }
    this.isModalLoaded = true;
  }

  login = async () => {
    if (!this.web3auth) {
      this.uiConsole("web3auth not initialized yet");
      return;
    }
    const { web3auth } = this;
    this.provider = await web3auth.connectTo(WALLET_ADAPTERS.OPENLOGIN, {
      loginProvider: "google",
    });
    this.loggedIn = true;
    this.uiConsole("Logged in Successfully!");
  };

  authenticateUser = async () => {
    if (!this.web3auth) {
      this.uiConsole("web3auth not initialized yet");
      return;
    }
    const idToken = await this.web3auth.authenticateUser();
    this.uiConsole(idToken);
  };

  getUserInfo = async () => {
    if (!this.web3auth) {
      this.uiConsole("web3auth not initialized yet");
      return;
    }
    const user = await this.web3auth.getUserInfo();
    this.uiConsole(user);
  };

  getEverscaleAccount = async () => {
    if (!this.provider) {
      this.uiConsole("provider not initialized yet");
      return;
    }
    const rpc = new RPC(this.provider as SafeEventEmitterProvider);
    const everAccount = await rpc.getEverscaleAccount();
    if (everAccount?.acc_type === 3) {
      this.uiConsole('Account not deployed', everAccount);
    } else this.uiConsole(everAccount);
  };

  getEverscaleAddress = async () => {
    if (!this.provider) {
      this.uiConsole("provider not initialized yet");
      return;
    }
    const rpc = new RPC(this.provider as SafeEventEmitterProvider);
    const everAddress = await rpc.getAddress();
    this.uiConsole(everAddress);
  };

  deployEverscaleAccount = async () => {
    if (!this.provider) {
      this.uiConsole("provider not initialized yet");
      return;
    }
    const rpc = new RPC(this.provider as SafeEventEmitterProvider);
    const deploy = await rpc.deployAccount();
    this.uiConsole(deploy?.message ? deploy?.message : deploy);
  };

  deployEverscaleAccountFromGiver = async () => {
    if (!this.provider) {
      this.uiConsole("provider not initialized yet");
      return;
    }
    const rpc = new RPC(this.provider as SafeEventEmitterProvider);
    const deploy = await rpc.deployAccountFromGiver();
    this.uiConsole(deploy?.message ? deploy?.message : deploy);
  };

  getEverscaleBalance = async () => {
    if (!this.provider) {
      this.uiConsole("provider not initialized yet");
      return;
    }
    const rpc = new RPC(this.provider as SafeEventEmitterProvider);
    const balance = await rpc.getBalance();
    this.uiConsole(balance);
  };

  sendEverscaleTransaction = async () => {
    if (!this.provider) {
      this.uiConsole("provider not initialized yet");
      return;
    }
    const rpc = new RPC(this.provider as SafeEventEmitterProvider);
    const transaction = await rpc.sendTransaction();
    this.uiConsole(transaction);
  };

  logout = async () => {
    if (!this.web3auth) {
      this.uiConsole("web3auth not initialized yet");
      return;
    }
    await this.web3auth.logout();
    this.provider = null;
    this.loggedIn = false;
    this.uiConsole("logged out");
  };

  uiConsole(...args: any[]) {
    const el = document.querySelector("#console-ui>p");
    if (el) {
      el.innerHTML = JSON.stringify(args || {}, null, 2);
    }
  }
}

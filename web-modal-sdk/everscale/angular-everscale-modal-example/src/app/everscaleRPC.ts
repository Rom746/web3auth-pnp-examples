import { Account } from "@eversdk/appkit";
import { TonClient, signerKeys } from "@eversdk/core";
import type { SafeEventEmitterProvider } from "@web3auth/base";
import { SafeMultisigContract } from "../abi/SafeMultisig.abi";
import { GiverContract } from "../abi/Giver.abi";

const DEPLOY_COUNT = 500_000_000;

export const TON_ENDPOINT =
  'https://devnet.evercloud.dev/7768b66385354827847158c2ef411b28/graphql'

export default class EverscaleRPC {
  private provider: SafeEventEmitterProvider;
  private client: TonClient;
  private account: Account | undefined;
  private public: string | undefined;

  constructor(provider: SafeEventEmitterProvider) {
    this.provider = provider;
    this.client = new TonClient({
      network: {
        endpoints: [TON_ENDPOINT]
      }
    });
  }

  async init() {
    const privateKey = await this.provider.request({ method: "private_key" }) as string;
    const seed = await this.client.crypto.mnemonic_from_entropy({
      entropy: privateKey,
    });
    const keyPair = await this.client.crypto.mnemonic_derive_sign_keys({
      phrase: seed.phrase,
    });
    this.public = keyPair.public;
    this.account = new Account(SafeMultisigContract, {
      signer: signerKeys(keyPair),
      client: this.client,
    });
  }

  async getEverscaleAccount(): Promise<{
    address: string | null;
    acc_type: any;
    balance: number | null;
  } | any> {
    try {
      await this.init();
      if (!this.client || !this.account) throw new Error('Account not initialized yet');
      return await this.account.getAccount();
    } catch (error) {
      return error;
    }
  };

  async getAddress(): Promise<string> {
    await this.init();
    if (!this.client || !this.account) throw new Error('Account not initialized yet');
    const address = await this.account.getAddress();
    return address;
  }

  async getBalance() {
    await this.init();
    if (!this.client || !this.account) throw new Error('Account not initialized yet');
    const balance = (await this.account.getBalance()) || '0';
    return parseInt(balance);
  }

  async deployAccount(): Promise<any> {
    try {
      await this.init();
      if (!this.client || !this.account || !this.public) throw new Error('Account not initialized yet');
      //Make sure you have enough funds in your wallet
      if (await this.getBalance() < DEPLOY_COUNT) {
        throw new Error('Account has insufficient balance for the requested operation. Send some value to account balance')
      }
      const deploy_status = await this.account.deploy({
        initFunctionName: 'constructor',
        initInput: {
          owners: [`0x${this.public}`],
          reqConfirms: 1,
        },
      });
      return deploy_status
    } catch (error) {
      return error
    }
  }

  async deployAccountFromGiver(): Promise<any> {
    try {
      await this.init();
      if (!this.client || !this.account || !this.public) throw new Error('Account not initialized yet');

      // Address of the Giver
      const giverAddress = '0:ece57bcc6c530283becbbd8a3b24d3c5987cdddc3c8b7b33be6e4a6312490415';
      // Keypair for the Giver
      const giverKeys = signerKeys({
        public: '2ada2e65ab8eeab09490e3521415f45b6e42df9c760a639bcf53957550b25a16',
        secret: '172af540e43a524763dd53b26a066d472a97c4de37d5498170564510608250c3',
      });

      // Create Giver's account
      const giverAccount = new Account(GiverContract, {
        client: this.client,
        address: giverAddress,
        signer: giverKeys,
      });

      const giverSendTo = async (address: string, value: number) => {
        // Run method `sendTransaction` for the Giver. You can use your custom account,
        // in this case, method name and arguments might vary:
        return await giverAccount.run("sendTransaction", {
          dest: address,
          value,
          bounce: false,
        });
      };

      // In order to implement giver's logics, we must implement `AccountGiver` interface
      const giver = {
        account: giverAccount,
        address: giverAddress,
        sendTo: async (address: string, value: number) => giverSendTo(address, value),
      };

      // Set Giver for a client
      Account.setGiverForClient(this.client, giver);
      const deploy_status = await this.account.deploy({
        initFunctionName: 'constructor',
        initInput: {
          owners: [`0x${this.public}`],
          reqConfirms: 1,
        },
        useGiver: true
      });
      return deploy_status
    } catch (error) {
      return error
    }
  }

  async sendTransaction() {
    try {
      await this.init();
      if (!this.client || !this.account || !this.public) throw new Error('Account not initialized yet');
      if (await this.getBalance() < 1000000000) {
        throw new Error('Account has insufficient balance for the requested operation. Send some value to account balance')
      }
      const transaction = await this.account.run('sendTransaction', {
        dest: '0:ece57bcc6c530283becbbd8a3b24d3c5987cdddc3c8b7b33be6e4a6312490415',
        value: 1000000000,
        bounce: true,
        flags: 1,
        payload: '',
      });
      return transaction;
    } catch (error) {
      return error;
    }
  }


}

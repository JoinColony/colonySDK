import type {
  UserTokenDeposited_address_address_uint256_EventObject,
  UserTokenWithdrawnEventObject,
} from '@colony/colony-js/events';

import { BigNumberish } from 'ethers';
import { TokenLockingClient } from '@colony/colony-js/';

import { extractEvent } from '../utils';
import { ColonyNetwork } from './ColonyNetwork';

export class TokenLocking {
  address: string;

  private colonyNetwork: ColonyNetwork;

  private tokenLockingClient: TokenLockingClient;

  constructor(
    colonyNetwork: ColonyNetwork,
    tokenLockingClient: TokenLockingClient,
  ) {
    this.address = tokenLockingClient.address;
    this.colonyNetwork = colonyNetwork;
    this.tokenLockingClient = tokenLockingClient;
  }

  /**
   * Provide direct access to the internally used TokenLocking client. Only use when you know what you're doing
   *
   * @internal
   * @returns The internally used TokenLockingClient
   */
  getInternalTokenLockingClient(): TokenLockingClient {
    return this.tokenLockingClient;
  }

  /**
   * Deposit `amount` of the wallet owners holdings of the Colony's native token into the Colony.
   *
   * In order for the wallet owner to stake tokens, that amount has to be approved and deposited into the Colony first. In the dapp the process is called "Activation" of a certain amount of the Colony's native token. The wallet must hold at least the amount of the token that will be deposited.
   *
   * @example
   * ```typescript
   * import { w } from '@colony/sdk';
   *
   * // Immediately executing async function
   * (async function() {
   *   const token = await colony.getToken();
   *   // Approve 100 tokens for the Colony Network to activate
   *   await token.approve(w`100`).force();
   *   // Deposit the tokens
   *   await colonyNetwork.locking.deposit(token.address, w`100`).force();
   * })();
   * ```
   *
   * @param tokenAddress - Token to be deposited
   * @param amount - Amount of the token to be deposited
   *
   * @returns A transaction creator
   *
   * #### Event data
   *
   * | Property | Type | Description |
   * | :------ | :------ | :------ |
   * | `token` | string | The address of the Colony's native token |
   * | `user` | string | The address that deposited the tokens from their wallet |
   * | `amount` | BigNumber | Amount that was deposited |
   */
  deposit(tokenAddress: string, amount: BigNumberish) {
    return this.colonyNetwork.createMetaTxCreator(
      this.tokenLockingClient,
      'deposit(address,uint256,bool)',
      [tokenAddress, amount, false],
      async (receipt) => ({
        ...extractEvent<UserTokenDeposited_address_address_uint256_EventObject>(
          'UserTokenDeposited',
          receipt,
        ),
      }),
    );
  }

  /**
   * Withdraw `amount` of the wallet owners holdings of the Colony's native token from the Colony.
   *
   * Does the opposite of `deposit` and frees the deposited tokens back to the wallet address.
   *
   * @example
   * ```typescript
   * import { w } from '@colony/sdk';
   *
   * // Immediately executing async function
   * (async function() {
   *   const token = await colony.getToken();
   *   // Withdraw 100 tokens that were previously deposited
   *   await colonyNetwork.locking.withdraw(token.address, w`100`).force();
   * })();
   * ```
   *
   * @param tokenAddress - Token to be withdrawn
   * @param amount - Amount of the token to be withdrawn
   *
   * @returns A transaction creator
   *
   * #### Event data
   *
   * | Property | Type | Description |
   * | :------ | :------ | :------ |
   * | `token` | string | The address of the Colony's native token |
   * | `user` | string | The address that withdrew the tokens from their wallet |
   * | `amount` | BigNumber | Amount that was withdrawn |
   */
  withdraw(tokenAddress: string, amount: BigNumberish) {
    return this.colonyNetwork.createMetaTxCreator(
      this.tokenLockingClient,
      'withdraw(address,uint256,bool)',
      [tokenAddress, amount, false],
      async (receipt) => ({
        ...extractEvent<UserTokenWithdrawnEventObject>(
          'UserTokenWithdrawn',
          receipt,
        ),
      }),
    );
  }

  /**
   * Get the wallet owner's deposited and locked balance of the Colony's native token.
   *
   * This method will show the accumulated amount that was deposited using the [[ColonyToken.deposit]] method
   *
   * @param tokenAddress - Token to check
   * @param user - The wallet address that we want to check the deposited amount of
   *
   * @returns The currently deposited balance of the Colony's native token
   */
  async getUserDeposit(tokenAddress: string, user: string) {
    const userLock = await this.tokenLockingClient.getUserLock(
      tokenAddress,
      user,
    );
    return userLock.balance;
  }

  /**
   * Get the wallet owner's approved balance of the Colony's native token for an obliator (i.e. an extension)
   *
   * This method will show the accumulated amount that was approved using the [[ColonyToken.approve]] method
   *
   * @param tokenAddress - Token to check
   * @param user - The wallet address that we want to check the approved amount of
   * @param obligator - The address that has been approved to obligate the funds.
   *
   * @returns The currently approved balance of the Colony's native token for the obligator
   */
  async getUserApproval(tokenAddress: string, user: string, obligator: string) {
    return this.tokenLockingClient.getApproval(user, tokenAddress, obligator);
  }
}

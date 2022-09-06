import {
  ColonyClientV8,
  ColonyClientV9,
  SignerOrProvider,
  Id,
  Extension,
} from '@colony/colony-js';

import {
  ColonyFundsClaimed_address_uint256_uint256_EventObject,
  // eslint-disable-next-line max-len
  ColonyFundsMovedBetweenFundingPots_address_uint256_uint256_uint256_address_EventObject,
  DomainAdded_uint256_EventObject,
  DomainMetadataEventObject,
  FundingPotAddedEventObject,
  OneTxPaymentMadeEventObject,
} from '@colony/colony-js/extras';
import type {
  BigNumberish,
  ContractReceipt,
  ContractTransaction,
} from 'ethers';

import { MetadataKey, MetadataValue } from '../events';
import { extractEvent } from '../utils';
import { ColonyToken } from './ColonyToken';
import { ColonyNetwork } from './ColonyNetwork';
import { VotingReputation } from './VotingReputation';

export type SupportedColonyClient = ColonyClientV8 | ColonyClientV9;
export type SupportedColonyMethods = SupportedColonyClient['functions'];
export interface SupportedExtensions {
  motions?: VotingReputation;
}

export class Colony {
  /** The currently supported Colony version. If a Colony is not on this version it has to be upgraded.
   * If this is not an option, Colony SDK might throw errors at certain points. Usage of ColonyJS is advised in these cases
   */
  static SupportedVersions: (8 | 9)[] = [8, 9];

  private colonyClient: SupportedColonyClient;

  private signerOrProvider: SignerOrProvider;

  address: string;

  colonyNetwork: ColonyNetwork;

  ext: SupportedExtensions;

  version: number;

  /**
   * Creates a new instance to connect to an existing Colony
   * @internal
   *
   * @remarks
   * Do not use this method directly but use [[ColonyNetwork.getColony]]
   *
   * @param colonyNetwork A Colony SDK `ColonyNetwork` instance
   * @param colonyClient A ColonyJS `ColonyClient` in the latest supported version
   * @returns A [[Colony]] abstaction instance
   */
  constructor(
    colonyNetwork: ColonyNetwork,
    colonyClient: SupportedColonyClient,
    extensions: SupportedExtensions,
  ) {
    this.colonyClient = colonyClient;
    this.signerOrProvider = colonyClient.signer || colonyClient.provider;
    this.address = colonyClient.address;
    this.ext = extensions;
    this.colonyNetwork = colonyNetwork;
    this.version = colonyClient.clientVersion;
  }

  private async returnTxData<
    D extends { metadata?: string },
    E extends MetadataKey,
  >(
    data: D,
    metadataEvent: E,
    receipt: ContractReceipt,
  ): Promise<
    [D, ContractReceipt, () => Promise<MetadataValue<E>>] | [D, ContractReceipt]
  > {
    if (data.metadata) {
      const getMetadata =
        this.colonyNetwork.ipfsMetadata.getMetadataForEvent.bind(
          this.colonyNetwork.ipfsMetadata,
          metadataEvent,
          data.metadata,
        );

      return [data, receipt, getMetadata];
    }

    return [data, receipt];
  }

  /**
   * Provide direct access to the internally used ColonyJS client. Only use when you know what you're doing
   *
   * @internal
   *
   * @returns The internally used ColonyClient
   */
  getInternalColonyClient(): SupportedColonyClient {
    return this.colonyClient;
  }

  /**
   * Get a new instance of a Colony's native Token
   *
   * @remarks
   * Currently only Tokens deployed via Colony are supported (no external, imported tokens) in Colony SDK. All other kinds will throw an error
   *
   * @returns A [[ColonyNetwork.ColonyToken]] abstaction instance
   */
  getToken(): ColonyToken {
    return new ColonyToken(this.colonyClient);
  }

  /**
   * Get a token balance for a specific token and team. Defaults to the Colony's native token and the `Root` team.
   *
   * @remarks
   * The function will automatically figure out the corresponding pot for the given domain, as this is what's usually expected.
   *
   * @example
   * Get the xDAI balance of the team number 2
   * ```typescript
   * import { constants } from 'ethers';
   * import { toEth } from '@colony/sdk';
   * // The `AddressZero` means ETH on mainnet and xDAI on Gnosis chain
   * const balance = await colony.getBalance(constants.AddressZero, 2);
   * // This will format the balance as a string in eth and not wei (i.e. 1.0 vs. 1000000000000000000)
   * console.info(toEth(balance));
   * ```
   *
   * @param tokenAddress The address of the token to get the balance for. Default is the Colony's native token
   * @param teamId The teamId (domainId) of the team to get the balance for. Default is the `Root` team
   * @returns A token balance in [wei](https://gwei.io/)
   */
  async getBalance(tokenAddress?: string, teamId?: BigNumberish) {
    let potId: BigNumberish = Id.RootPot;
    if (teamId) {
      const { fundingPotId } = await this.colonyClient.getDomain(teamId);
      potId = fundingPotId;
    }
    const token = tokenAddress || this.colonyClient.tokenClient.address;
    return this.colonyClient.getFundingPotBalance(potId, token);
  }

  /**
   * Create a team within a Colony
   *
   * @remarks
   * Currently you can only add domains within the `Root` domain. This restriction will be lifted soon
   *
   * @param metadataCid An IPFS [CID](https://docs.ipfs.io/concepts/content-addressing/#identifier-formats) for a JSON file containing the metadata described below. For now, we would like to keep it agnostic to any IPFS upload mechanism, so you have to upload the file manually and provide your own hash (by using, for example, [Pinata](https://docs.pinata.cloud/))
   *
   * @returns A tupel: `[eventData, ContractReceipt, getMetaData]`
   *
   * **Event data**
   *
   * | Property | Type | Description |
   * | :------ | :------ | :------ |
   * | `agent` | string | The address that is responsible for triggering this event |
   * | `domainId` | BigNumber | Integer domain id of the created team |
   * | `fundingPotId` | BigNumber | Integer id of the corresponding funding pot |
   * | `metadata` | string | IPFS CID of metadata attached to this transaction |
   *
   * **Metadata** (can be obtained by calling and awaiting the `getMetadata` function)
   *
   * | Property | Type | Description |
   * | :------ | :------ | :------ |
   * | `domainName` | string | The human readable name assigned to this team |
   * | `domainColor` | string | The color assigned to this team |
   * | `domainPurpose` | string | The purpose for this team (a broad description) |
   */
  async createTeam(metadataCid?: string) {
    let tx: ContractTransaction;
    if (metadataCid) {
      tx = await this.colonyClient['addDomainWithProofs(uint256,string)'](
        Id.RootDomain,
        metadataCid,
      );
    } else {
      tx = await this.colonyClient['addDomainWithProofs(uint256)'](
        Id.RootDomain,
      );
    }

    const receipt = await tx.wait();

    const data = {
      ...extractEvent<DomainAdded_uint256_EventObject>('DomainAdded', receipt),
      ...extractEvent<FundingPotAddedEventObject>('FundingPotAdded', receipt),
      ...extractEvent<DomainMetadataEventObject>('DomainMetadata', receipt),
    };

    return this.returnTxData(
      data,
      'DomainMetadata(address,uint256,string)',
      receipt,
    );
  }

  /**
   * Gets the team for `teamId`
   *
   * @remarks Will throw if teamId does not exist
   *
   * @param teamId The teamId to get the team information for
   * FIXME: get the type somehow
   * @returns A Team object
   */
  async getTeam(teamId: BigNumberish) {
    const teamCount = await this.colonyClient.getDomainCount();
    if (teamCount.lt(teamId)) {
      throw new Error(`Team with id ${teamId} does not exist`);
    }
    return this.colonyClient.getDomain(teamId);
  }

  /**
   * Claim outstanding Colony funds
   *
   * Anyone can call this function. Claims funds _for_ the Colony that have been sent to the Colony's contract address or minted funds of the Colony's native token. This function _has_ to be called in order for the funds to appear in the Colony's treasury. You can provide a token address for the token to be claimed. Otherwise it will claim the outstanding funds of the Colony's native token
   *
   * @param tokenAddress The address of the token to claim the funds for. Default is the Colony's native token
   *
   * @returns A tupel of event data and contract receipt
   *
   * **Event data**
   *
   * | Property | Type | Description |
   * | :------ | :------ | :------ |
   * | `agent` | string | The address that is responsible for triggering this event |
   * | `token` | string | The token address |
   * | `fee` | BigNumber | The fee deducted for rewards |
   * | `payoutRemainder` | BigNumber | The remaining funds moved to the top-level domain pot |
   */
  async claimFunds(
    tokenAddress: string = this.colonyClient.tokenClient.address,
  ) {
    const token = tokenAddress || this.colonyClient.tokenClient.address;
    const tx = await this.colonyClient.claimColonyFunds(token);
    const receipt = await tx.wait();

    const data = {
      ...extractEvent<ColonyFundsClaimed_address_uint256_uint256_EventObject>(
        'ColonyFundsClaimed',
        receipt,
      ),
    };

    return [data, receipt] as [typeof data, typeof receipt];
  }

  /**
   * Make a payment to a single address using a single token
   *
   * @remarks Requires the `OneTxPayment` extension to be installed for the Colony (this is usually the case for Colonies created via the Dapp). Note that most tokens use 18 decimals, so add a bunch of zeros or use our `w` or `toWei` functions (see example)
   *
   * @example
   * ```typescript
   * import { Id, Tokens, w } from '@colony/sdk';
   *
   * // Immediately executing async function
   * (async function() {
   *   // Pay 10 XDAI (on Gnosis chain) from the root domain to the following address
   *   await colony.pay(
   *      '0xb77D57F4959eAfA0339424b83FcFaf9c15407461',
   *      w`10`,
   *      Id.RootDomain,
   *      Tokens.Gnosis.XDAI,
   *   );
   * })();
   * ```
   *
   * @param recipient Wallet address of account to send the funds to (also awarded reputation when sending the native token)
   * @param amount Amount to pay in wei
   * @param tokenAddress The address of the token to make the payment in. Default is the Colony's native token
   * @param teamId The team to use to send the funds from. Has to have funding of at least the amount you need to send. See [[Colony.moveFundsToTeam]]. Defaults to the Colony's root team
   * @returns A tupel of event data and contract receipt
   *
   * **Event data**
   *
   * | Property | Type | Description |
   * | :------ | :------ | :------ |
   * | `agent` | string | The address that is responsible for triggering this event |
   * | `fundamentalId` | BigNumber | The newly added payment id |
   * | `nPayouts` | BigNumber | Number of payouts in total |
   */
  async pay(
    recipient: string,
    amount: BigNumberish,
    teamId?: BigNumberish,
    tokenAddress?: string,
  ) {
    const setTeamId = teamId || Id.RootDomain;
    const setTokenAddress =
      tokenAddress || this.colonyClient.tokenClient.address;

    const oneTxClient = await this.colonyClient.getExtensionClient(
      Extension.OneTxPayment,
    );

    const tx = await oneTxClient.makePaymentFundedFromDomainWithProofs(
      // This function supports multiple receipients, amounts and tokens. Here only one of each is used
      [recipient],
      [setTokenAddress],
      [amount],
      setTeamId,
      // Skill associated with this payment. Ignore for now
      Id.SkillIgnore,
    );

    const receipt = await tx.wait();
    const data = {
      ...extractEvent<OneTxPaymentMadeEventObject>('OneTxPaymentMade', receipt),
    };

    return [data, receipt] as [typeof data, typeof receipt];
  }

  /**
   * Move funds from one team to another
   *
   * After sending funds to and claiming funds for your Colony they will land in a special team, the root team. If you want to make payments from other teams (in order to award reputation in that team) you have to move the funds there first. Use this method to do so.
   *
   * @remarks Requires the `Funding` permission in the root team. As soon as teams can be nested, this requires the `Funding` permission in a team that is a parent of both teams in which funds are moved.
   *
   * @example
   * ```typescript
   * import { Tokens, w } from '@colony/sdk';
   *
   * // Immediately executing async function
   * (async function() {
   *   // Move 10 of the native token from team 2 to team 3
   *   await colony.moveFundsToTeam(
   *      w`10`,
   *      2,
   *      3,
   *   );
   * })();
   * ```
   *
   * @param amount Amount to transfer between the teams
   * @param toTeam The team to transfer the funds to
   * @param fromTeam The team to transfer the funds from. Default is the Root team
   * @param tokenAddress The address of the token to be transferred. Default is the Colony's native token
   * @returns A tupel of event data and contract receipt
   *
   * **Event data**
   *
   * | Property | Type | Description |
   * | :------ | :------ | :------ |
   * | `agent` | string | The address that is responsible for triggering this event |
   * | `fromPot` | BigNumber | The source funding pot |
   * | `toPot` | BigNumber | The target funding pot |
   * | `amount` | BigNumber | The amount that was transferred |
   * | `token` | string | The token address being transferred |
   */
  async moveFundsToTeam(
    amount: BigNumberish,
    toTeam: BigNumberish,
    fromTeam?: BigNumberish,
    tokenAddress?: string,
  ) {
    const parentTeam = Id.RootDomain;
    const setFromTeam = fromTeam || Id.RootDomain;
    const setTokenAddress =
      tokenAddress || this.colonyClient.tokenClient.address;

    const { fundingPotId: fromPot } = await this.colonyClient.getDomain(
      setFromTeam,
    );
    const { fundingPotId: toPot } = await this.colonyClient.getDomain(toTeam);

    const tx = await this.colonyClient[
      // eslint-disable-next-line max-len
      'moveFundsBetweenPotsWithProofs(uint256,uint256,uint256,uint256,address)'
    ](parentTeam, fromPot, toPot, amount, setTokenAddress);
    const receipt = await tx.wait();

    const data = {
      // eslint-disable-next-line max-len
      ...extractEvent<ColonyFundsMovedBetweenFundingPots_address_uint256_uint256_uint256_address_EventObject>(
        'ColonyFundsMovedBetweenFundingPots',
        receipt,
      ),
    };

    return [data, receipt] as [typeof data, typeof receipt];
  }

  /**
   * Get the reputation for a user address within a team in the Colony
   *
   * @param userAddress The address of the account to check the reputation for
   * @param teamId The teamId (domainId) of the team to get the reputation for. Default is the `Root` team
   * @returns A number quantifying the user addresses' reputation
   */
  async getReputation(userAddress: string, teamId = Id.RootDomain) {
    const { skillId } = await this.colonyClient.getDomain(teamId);
    const { reputationAmount } =
      await this.colonyClient.getReputationWithoutProofs(skillId, userAddress);
    return reputationAmount;
  }

  /**
   * Get the reputation for a user address across all teams in the Colony
   *
   * @param userAddress The address of the account to check the reputation for
   * @returns An array of objects containing the following
   *
   * | Property | Description |
   * | :------ | :------ |
   * | `domainId` | The domainId of the domain the user has reputation in |
   * | `skillId` | The corresponding skillId |
   * | `reputationAmount` | The reputation amount in that domain |
   */
  async getReputationAcrossTeams(userAddress: string) {
    return this.colonyClient.getReputationAcrossDomains(userAddress);
  }
}

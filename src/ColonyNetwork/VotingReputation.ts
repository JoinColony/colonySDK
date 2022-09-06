import {
  Extension,
  Id,
  MotionState,
  Motion,
  VotingReputationClientV4,
} from '@colony/colony-js';

import {
  MotionEventSetEventObject,
  MotionFinalizedEventObject,
  MotionStakedEventObject,
  MotionVoteRevealedEventObject,
  MotionVoteSubmittedEventObject,
  UserTokenApprovedEventObject,
} from '@colony/colony-js/extras';
import { BigNumber, BigNumberish, Signer, utils } from 'ethers';
import { extractEvent, extractEventFromLogs, toEth } from '../utils';

import { Colony, SupportedColonyClient } from './Colony';
import { MotionCreator } from './MotionCreator';

export enum Vote {
  Nay,
  Yay,
}

export type SupportedVotingReputationClient = VotingReputationClientV4;
export const SUPPORTED_VOTING_REPUTATION_VERSION = 4;

type ReputationData = Awaited<
  ReturnType<SupportedColonyClient['getReputation']>
>;

export const getVotingReputationClient = async (
  colonyClient: SupportedColonyClient,
) => {
  const votingReputationClient = await colonyClient.getExtensionClient(
    Extension.VotingReputation,
  );

  if (
    votingReputationClient.clientVersion !== SUPPORTED_VOTING_REPUTATION_VERSION
  ) {
    throw new Error(
      `The installed version ${votingReputationClient.clientVersion} of the VotingReputation extension is not supported. Please upgrade the extension in your Colony`,
    );
  }

  return votingReputationClient;
};

const REP_DIVISOR = BigNumber.from(10).pow(18);

/**
 * ## `VotingReputation` (Motions & Disputes)
 *
 * The `VotingReputation` extension allows any member of a Colony to propose a Motion to take an `action` that will pass after a security delay unless somebody Objects. This applies to all actions, such as creating an expenditure, managing funds, or managing teams.
 *
 * ### What is a Motion?
 *
 * Within Colony a Motion is an on-chain proposal whose two sides (_Yay_ or _Nay_) can be supported by staking the Colony's native token for that side. Motions _always_ have an `action` attached to them which is a contract transaction that can take place in a Colony. For example, Motions could be created to move funds from one team to another, for paying someone that did work or minting new native tokens (even arbitrary transaction on any contract in the name of the Colony are supported!).
 * Motions that pass (the outcome is _Yay_) will execute the `action` once they are finalized. If the outcome is _Nay_, there is no action taking place.
 *
 * ### The Motion lifecycle
 *
 * :::info
 *
 * The exact lifecycle is determined by the parameters that were set when the `VotingReputation` extension was installed for the Colony. You can find a detailed explanation of all the parameters [here](https://colony.gitbook.io/colony/extensions/governance/parameters).
 *
 * :::
 *
 * #### Creating a Motion
 *
 * See [[MotionCreator]].
 *
 * Anyone within a Colony can start a motion. In Colony SDK, this can be done with the [[MotionCreator]] API. There the `action` (the contract transaction) for the Motion will be defined. This is essentially nothing else than an encoded contract function string alongside its parameters (see for detailed info [here](https://medium.com/linum-labs/a-technical-primer-on-using-encoded-function-calls-50e2b9939223) - but don't worry. In Colony SDK this will all be taken care of by the [[MotionCreator]]).
 *
 *  #### Staking
 *
 * See [[VotingReputation.stakeMotion]].
 *
 * Once a motion is created, native tokens can be staked to support either of its sides (_Yay_ or _Nay_). A user can only stake as many tokens for either side as they have reputation in the team the motion is created in. A side can be staked by the motion creator and an arbitrary number of additional users as long as they adhere to the minimum stake per user that was defined in the extensions parameters. The maximum amount a user can stake is also determined by the amount of reputation in the team in which the Motion takes place.
 *
 * :::caution Over-staking
 *
 * Once a side of a Motion is activated, further attempts to stake tokens for that side will revert. It is not necessary or sensible to stake more tokens than needed. Keep in mind that both sides can be activated at the same time (see below for what happens then). You can use the [[VotingReputation.getRemainingStakes]] method to see how many tokens need to be staked on each side for them to activate.
 *
 * :::
 *
 * After the staking phase (which has a predetermined runtime) one of these four cases can happen:
 *
 * * **Case 1**: _Yay_ side reaches minimum stakes, _Nay_ side does not: the motion passed and can be finalized. All stakes are returned
 * * **Case 2**: _Nay_ side reaches minimum stakes, _Yay_ side does not: the motion failed and will not execute. All stakes are returned
 * * **Case 3**: Neither _Yay_ or _Nay_ side have reached minimum stakes: nothing happens. All stakes are returned.
 * * **Case 4**: Both _Yay_ and _Nay_ sides are activated. The Motion will go into _Voting_ immediately (and will not wait out the staking period).
 *
 * #### Voting
 *
 * See [[VotingReputation.submitVote]].
 *
 * As soon as the voting phase starts, anyone with reputation in the team the Motion was created in can vote for a side. Votes are secret (i.e. they're encrypted using your private key), and weighted by reputation. Vote weight is proportional to the voter's reputation in the team in which the vote is occurring.
 *
 * Voters receive a reward for voting proportional to their reputation in the team in which the vote is occurring. The reward comes from the stake provided by whichever side of the dispute loses. It doesn't matter whether the voter voters for the winning or the losing side, they are rewarded the same either way.
 *
 * #### Revealing the votes
 *
 * See [[VotingReputation.revealVote]].
 *
 * After the voting period is complete, the Reveal phase starts. Votes must be Revealed in order to be counted, and for the voter to receive their voter reward. The Reveal phase ends when either the time runs out, or everyone who has voted reveals their vote, whichever comes first.
 *
 * :::danger Staking penalties
 *
 * If you staked tokens for the side that eventually lost you will lose some of your stake. The amount lost will be smaller the closer the decision ultimately ended up being.
 *
 * :::
 *
 * ### The structure of a Motion
 *
 * You can - at any point in the lifecycle inspect the current state of a Motion. Using the [[VotingReputation.getMotion]] method, the resulting object will have the following properties:
 *
 * | Property | Types | Description |
 * | :------ | :------ | :------ |
 * | `events` | `[BigNumberish, BigNumberish, BigNumberish]` | Timestamps (in **seconds**) for when the phases for staking, voting and revealing end |
 * | `rootHash` | `BytesLike` | The root hash of the reputation tree at the time the motion was created |
 * | `domainId` | `BigNumberish` | The domain/team the Motion is in |
 * | `skillId`  | `BigNumberish` | The skillId associated with the domain |
 * | `skillRep` | `BigNumberish` | The total amount of reputation (among all users) that can vote for this motion |
 * | `repSubmitted` | `BigNumberish` | The amount of reputation that has submitted a vote |
 * | `paidVoterComp` | `BigNumberish` | Total compensation that was paid out to voters who revealed their votes |
 * | `pastVoterComp` | `[BigNumberish, BigNumberish]` | Keeps track of previous compensations when escalated |
 * | `stakes` | `[BigNumberish, BigNumberish]` | The amounts staked for each of the sides |
 * | `votes` | `[BigNumberish, BigNumberish]`  | The amount of reputation voted for each side |
 * | `escalated` | `boolean` | Whether a Motion was escelated to a higher team |
 * | `finalized` | `boolean` | Whether the motion is finalized (done) |
 * | `altTarget` | `string`  | A contract the motion should act on. Can be a Colony or an extension contract |
 * | `action` | `BytesLike`  | The data for the contract method that will be executed once the motion passes |
 *
 */
export class VotingReputation {
  private colony: Colony;

  private signer: Signer;

  private votingReputationClient: SupportedVotingReputationClient;

  address: string;

  create: MotionCreator;

  constructor(
    colony: Colony,
    votingReputationClient: SupportedVotingReputationClient,
  ) {
    this.address = votingReputationClient.address;
    this.create = new MotionCreator(colony, votingReputationClient);
    this.colony = colony;
    this.signer = this.colony.getInternalColonyClient().signer;
    this.votingReputationClient = votingReputationClient;
  }

  /**
   * Have the user sign a message to create a salt for casting and revealing a vote
   */
  private async createMotionSalt(motionId: BigNumberish) {
    const { address } = this.votingReputationClient;
    const motionNumber = BigNumber.from(motionId).toNumber();
    /*
     * NOTE We need this to be all in one line (no new lines, or line breaks) since
     * Metamask doesn't play nice with them and will replace them, in the message
     * presented to the user with \n
     */
    const message = `Sign this message to generate 'salt' entropy. Extension Address: ${address} Motion ID: ${motionNumber}`;
    const signature = await this.colony
      .getInternalColonyClient()
      .signer.signMessage(message);
    return utils.keccak256(signature);
  }

  /**
   * Gets the side the user voted for by testing both options and asserting which one reverts. This method is not 100% failsafe as the contract could revert for other reasons, so it's safer to provide the vote manually
   */
  private async getSideVoted(
    motionId: BigNumberish,
    salt: string,
    reputation: ReputationData,
  ) {
    const { key, value, branchMask, siblings } = reputation;
    let sideVoted;
    try {
      await this.votingReputationClient.estimateGas.revealVote(
        motionId,
        salt,
        0,
        key,
        value,
        branchMask,
        siblings,
      );
      sideVoted = Vote.Nay;
    } catch (nayErr) {
      if ((nayErr as Error).message.includes('voting-rep-secret-no-match')) {
        try {
          await this.votingReputationClient.estimateGas.revealVote(
            motionId,
            salt,
            1,
            key,
            value,
            branchMask,
            siblings,
          );
          sideVoted = Vote.Yay;
        } catch (yayErr) {
          // Can't find a matching vote that was cast
        }
      }
    }
    return sideVoted;
  }

  /**
   * Get a motion by its id
   *
   * @remarks Will throw if motionId does not exist
   *
   * @param motionId The motionId to get the information for
   *
   * @returns A Motion object
   */
  async getMotion(motionId: BigNumberish) {
    const motionCount = await this.votingReputationClient.getMotionCount();
    if (motionCount.lt(motionId)) {
      throw new Error(`Motion with id ${motionId} does not exist`);
    }
    return this.votingReputationClient.getMotion(motionId);
  }

  /**
   * Get the minimum stake that has to be supplied for a motion and a certain vote (NOT for activation)
   *
   * @remarks To get the missing amount for activation, call [[getMotionStakes]]
   *
   * @param motion A Motion struct object
   * @param vote A vote for (Yay) or against (Nay) the motion
   *
   * @returns The minimum stake amount
   */
  async getMinStake(motion: Motion, vote: Vote) {
    // skillRep is the amount of reputation in the domain the motion was created in
    // at the time the motion was created
    const {
      skillRep,
      stakes: [totalNay, totalYay],
    } = motion;

    // Fraction of the total amount that is required to be staked for either side
    // (Yay or Nay) to be activated
    const totalStakeFraction =
      await this.votingReputationClient.getTotalStakeFraction();
    // Fraction of the total amount that has to be staked per transaction
    const userMinStakeFraction =
      await this.votingReputationClient.getUserMinStakeFraction();
    // Total amount that is needed for activation
    const requiredStakeForActivation = skillRep
      .mul(totalStakeFraction)
      .div(REP_DIVISOR);
    // Total amount that is needed per transaction
    const minStakePerUser = requiredStakeForActivation
      .mul(userMinStakeFraction)
      .div(REP_DIVISOR);

    // The minimum amount to be staked is usually the minStakePerUser
    // With one exception. If less than minStakePerUser is needed to activate the
    // voted side then this is the minimum amount
    // E.g.:
    // Stake to activation: 10
    // Already staked for Yay: 9
    // Minimum stake per transaction: 2
    // Here the minimum becomes 1 (instead of 2) as this is what's missing for activation
    let minStake = minStakePerUser;
    if (vote === Vote.Nay && totalNay.lt(requiredStakeForActivation)) {
      const requiredNay = requiredStakeForActivation.sub(totalNay);
      minStake = requiredNay.lt(minStakePerUser)
        ? requiredNay
        : minStakePerUser;
    } else if (totalYay.lt(requiredStakeForActivation)) {
      const requiredYay = requiredStakeForActivation.sub(totalYay);
      minStake = requiredYay.lt(minStakePerUser)
        ? requiredYay
        : minStakePerUser;
    }
    return minStake;
  }

  /**
   * Get the amounts remaining for Yay/Nay sides to be activated
   *
   * @param motionId The motionId of the motion
   *
   * @returns An object containing the remaining amounts
   */
  async getRemainingStakes(motionId: BigNumberish) {
    const {
      skillRep,
      stakes: [totalNay, totalYay],
    } = await this.getMotion(motionId);

    // Fraction of the total amount that is required to be staked for either side
    // (Yay or Nay) to be activated
    const totalStakeFraction =
      await this.votingReputationClient.getTotalStakeFraction();
    // Fraction of the total amount that has to be staked per transaction
    // Total amount that is needed for activation
    const requiredStakeForActivation = skillRep
      .mul(totalStakeFraction)
      .div(REP_DIVISOR);

    const remainingToFullyNayStaked = totalNay.gte(requiredStakeForActivation)
      ? BigNumber.from(0)
      : requiredStakeForActivation.sub(totalNay);

    const remainingToFullyYayStaked = totalYay.gte(requiredStakeForActivation)
      ? BigNumber.from(0)
      : requiredStakeForActivation.sub(totalYay);

    return {
      remainingToFullyNayStaked,
      remainingToFullyYayStaked,
    };
  }

  /**
   * Approve `amount` of the "activated" native tokens of a user for staking in a specific team
   * After a token was "activated" (approved and deposited via the native token interface) it can be used for staking motions. To stake a motion, the token amount for staking has to be approved for the domain the motion was created in. See also the example in [[VotingReputation.stakeMotion]]
   *
   * @param amount Amount of "activated" tokens to be approved for staking
   * @param teamId Team that the approved tokens can be used in for staking motions
   *
   * @returns A tupel of event data and contract receipt
   *
   * **Event data**
   *
   * | Property | Type | Description |
   * | :------ | :------ | :------ |
   * | `token` | string | The address of the token that is approved for staking |
   * | `user` | string | The address of the VotingReputation contract |
   * | `approvedBy` | string | The address of the Colony |
   * | `amount` | BigNumber | Amount of the token that was approved for staking |
   */
  async approveStake(
    amount: BigNumberish,
    teamId: BigNumberish = Id.RootDomain,
  ) {
    const tx = await this.colony
      .getInternalColonyClient()
      .approveStake(this.votingReputationClient.address, teamId, amount);
    const receipt = await tx.wait();

    const tokenLockingClient =
      await this.colony.colonyToken.getTokenLockingClient();

    const data = {
      ...extractEventFromLogs<UserTokenApprovedEventObject>(
        'UserTokenApproved',
        receipt,
        tokenLockingClient.interface,
      ),
    };

    return [data, receipt] as [typeof data, typeof receipt];
  }

  /**
   * Stake `amount` to support a motion with your vote
   *
   * @remarks In order to stake a motion the amount to stake (or any amount higher than that) needs to be "activated" and approved for staking in the motion's team first. See below for a full example. Usually you would have more tokens "activated" or even approved for a domain than you would stake, to make this process more seamless
   *
   * @example
   * ```typescript
   * import { Vote, w } from '@colony/sdk';
   *
   * // Immediately executing async function
   * (async function() {
   *   const token = colony.getToken();
   *   // Approve 200 tokens to be "activated"
   *   await token.approve(w`200`);
   *   // Deposit all of approved the tokens
   *   await token.deposit(w`200`);
   *   // Approve 150 tokens for staking in the root domain
   *   await colony.ext.motions.approveStake(w`150`);
   *   // Stake 100 tokens for motion with id 3
   *   await colony.ext.motions.stakeMotion(3, Vote.Yay, w`100`);
   * })();
   * ```
   *
   * @param amount Amount of the token to be approved
   *
   * @returns A tupel of event data and contract receipt
   *
   * **Event data**
   *
   * | Property | Type | Description |
   * | :------ | :------ | :------ |
   * | `motionId` | BigNumber | ID of the motion created |
   * | `staker` | string | The address that staked the tokens |
   * | `vote` | Vote | The vote that was staked for (Yay or Nay). See [[Vote]] |
   * | `amount` | BigNumber | The amount that was staked for that vote |
   * | `eventIndex` | BigNumber | If the stake triggered a motion event, this will contain its index |
   */
  async stakeMotion(motionId: BigNumberish, vote: Vote, amount: BigNumberish) {
    const userAddress = await this.signer.getAddress();
    const motion = await this.getMotion(motionId);

    const deposited = await this.colony.colonyToken.getUserDeposit(userAddress);
    if (deposited.lt(amount)) {
      throw new Error('Not enough tokens deposited for staking.');
    }

    const colonyApproval = await this.colony.colonyToken.getUserApproval(
      userAddress,
      this.colony.address,
    );
    if (colonyApproval.lt(amount)) {
      throw new Error('Not enough tokens approved for staking in the Colony.');
    }

    const votingReputationApproval = await this.colony
      .getInternalColonyClient()
      .getApproval(userAddress, this.address, motion.domainId);

    if (votingReputationApproval.lt(amount)) {
      throw new Error(
        `Not enough tokens approved for staking in the VotingReputation contract.`,
      );
    }

    if (motion.events[0].mul(1000).lte(Date.now())) {
      throw new Error('The staking period for this Motion has passed already.');
    }

    const minStake = await this.getMinStake(motion, vote);

    if (BigNumber.from(amount).lt(minStake)) {
      throw new Error(
        `The staked amount is too small. Please stake at least ${toEth(
          minStake,
        )}`,
      );
    }

    const tx = await this.votingReputationClient.stakeMotionWithProofs(
      motionId,
      BigNumber.from(vote),
      amount,
    );
    const receipt = await tx.wait();

    const data = {
      ...extractEvent<MotionStakedEventObject>('MotionStaked', receipt),
      ...extractEvent<MotionEventSetEventObject>('MotionEventSet', receipt),
    };

    return [data, receipt] as [typeof data, typeof receipt];
  }

  /**
   * Submit a vote for a motion
   *
   * @param motionId The motionId of the motion to be finalized
   * @param vote A vote for (Yay) or against (Nay) the motion
   *
   * @returns A tupel of event data and contract receipt
   *
   * **Event data**
   *
   * | Property | Type | Description |
   * | :------ | :------ | :------ |
   * | `motionId` | BigNumber | ID of the motion created |
   * | `voter` | string | The address of the user who voted |
   */
  async submitVote(motionId: BigNumberish, vote: Vote) {
    const motionState = await this.votingReputationClient.getMotionState(
      motionId,
    );

    // TODO: we might want to improve this error message by giving the exact reason
    if (motionState !== MotionState.Submit) {
      throw new Error('Motion cannot be voted on at this time');
    }

    const colonyClient = this.colony.getInternalColonyClient();
    const { domainId, rootHash } = await this.getMotion(motionId);
    const { skillId } = await colonyClient.getDomain(domainId);
    const userAddress = await colonyClient.signer.getAddress();

    const { key, value, branchMask, siblings } =
      await colonyClient.getReputation(skillId, userAddress, rootHash);

    const salt = await this.createMotionSalt(motionId);
    const hash = utils.solidityKeccak256(['bytes', 'uint256'], [salt, vote]);

    const tx = await this.votingReputationClient.submitVote(
      motionId,
      hash,
      key,
      value,
      branchMask,
      siblings,
    );

    const receipt = await tx.wait();

    const data = {
      ...extractEvent<MotionVoteSubmittedEventObject>(
        'MotionVoteSubmitted',
        receipt,
      ),
    };

    return [data, receipt] as [typeof data, typeof receipt];
  }

  /**
   * Reveal a vote for a motion
   *
   * @remarks In order for a vote to count it has to be revealed within the reveal period. Only then rewards can be paid out to the voter.
   *
   * @param motionId The motionId of the motion to be finalized
   * @param vote The vote that was cast. If not provided Colony SDK will try to find out which side was voted on (not recommended)
   *
   * @returns A tupel of event data and contract receipt
   *
   * **Event data**
   *
   * | Property | Type | Description |
   * | :------ | :------ | :------ |
   * | `motionId` | BigNumber | ID of the motion created |
   * | `voter` | string | The address of the user who voted |
   * | `vote` | BigNumber | The vote that was cast (0 = Nay, 1 = Yay) |
   */
  async revealVote(motionId: BigNumberish, vote?: Vote) {
    const motionState = await this.votingReputationClient.getMotionState(
      motionId,
    );

    // TODO: we might want to improve this error message by giving the exact reason
    if (motionState !== MotionState.Reveal) {
      throw new Error('Motion cannot be revealed at this time');
    }

    const colonyClient = this.colony.getInternalColonyClient();
    const { domainId, rootHash } = await this.getMotion(motionId);
    const { skillId } = await colonyClient.getDomain(domainId);
    const userAddress = await colonyClient.signer.getAddress();

    const reputation = await colonyClient.getReputation(
      skillId,
      userAddress,
      rootHash,
    );

    const salt = await this.createMotionSalt(motionId);
    const foundVote =
      vote || (await this.getSideVoted(motionId, salt, reputation));

    if (!foundVote) {
      throw new Error(
        `Could not find a vote cast by ${userAddress} for motion ${motionId}`,
      );
    }

    const { key, value, branchMask, siblings } = reputation;

    const tx = await this.votingReputationClient.revealVote(
      motionId,
      salt,
      foundVote,
      key,
      value,
      branchMask,
      siblings,
    );

    const receipt = await tx.wait();

    const data = {
      ...extractEvent<MotionVoteRevealedEventObject>(
        'MotionVoteRevealed',
        receipt,
      ),
    };

    return [data, receipt] as [typeof data, typeof receipt];
  }

  /**
   * Finalize a motion, executing its action
   *
   * @remarks A motion cannot be finalized if:
   * - The required Yay or Nay stake amount has not been reached
   * - The staking period is not up yet
   * - Voting is still in progress
   * - The motion was already finalized
   *
   * @param motionId The motionId of the motion to be finalized
   *
   * @returns A tupel of event data and contract receipt
   *
   * **Event data**
   *
   * | Property | Type | Description |
   * | :------ | :------ | :------ |
   * | `motionId` | BigNumber | ID of the motion created |
   * | `action` | string | The action that was executed in case Yay won |
   * | `exectued` | boolean | Whether the action was executed (Yay won)|
   */
  async finalizeMotion(motionId: BigNumberish) {
    const motionState = await this.votingReputationClient.getMotionState(
      motionId,
    );

    // TODO: we might want to improve this error message by giving the exact reason
    if (motionState !== MotionState.Finalizable) {
      throw new Error('Motion is not finalizable (yet)');
    }

    const tx = await this.votingReputationClient.finalizeMotion(motionId);

    const receipt = await tx.wait();

    const data = {
      ...extractEvent<MotionFinalizedEventObject>('MotionFinalized', receipt),
    };

    return [data, receipt] as [typeof data, typeof receipt];
  }
}

import { constants, providers, Wallet } from 'ethers';

import { ColonyNetwork } from '../../src';

const provider = new providers.JsonRpcProvider('https://xdai.colony.io/rpc2/');

// Claim ETH for the MetaColony using a Metatransaction
const start = async () => {
  const signer = Wallet.createRandom().connect(provider);
  const colonyNetwork = await ColonyNetwork.init(signer);
  const colony = await colonyNetwork.getMetaColony();
  const res = await colony.claimFunds(constants.AddressZero).tx();
  console.info(res);
};

start();

🚀 The Colony SDK. Get started with Colony quickly

<div align="center">
  <img src="https://raw.githubusercontent.com/JoinColony/brand/v1.0.0/logo_sdk.svg" width="600" />
</div>

[![Discord](https://img.shields.io/discord/562263648173555742)](https://discord.gg/feVZWwysqM)

# Colony SDK

The Colony SDK is under heavy development by the community and will be an easy-to-use interface for the Colony Network contracts, providing simple functions that hide the dark magic going on under the hood of ColonyJS.
It covers _everything_ the dApp can do, so you'll be able to run your DAO entirely programmatically 👩‍💻

Colony SDK also includes a variety of examples to get you up and building with Colony in no time!

## Quickstart

```javascript
import { providers } from 'ethers';
import { ColonyNetwork, toEth } from '@colony/sdk';

// If MetaMask is installed there will be an `ethereum` object on the `window`
// NOTE: Make sure MetaMask is connected to Gnosis chain (see https://www.xdaichain.com/for-users/wallets/metamask/metamask-setup)
const provider = new providers.Web3Provider(window.ethereum);

// Get the Colony's XDAI funding in the ROOT pot (id 1)
const start = async () => {
  // This will try to connect the page to MetaMask
  await provider.send('eth_requestAccounts', []);
  // Create a new connection to the Colony Network contracts using the MetaMask "wallet"
  const colonyNetwork = await ColonyNetwork.init(provider.getSigner());
  // Connect to the MetaColony (this could be replaced with your own colony using `colonyNetwork.getColony(COLONY_ADDRESS)`)
  const metaColony = await colonyNetwork.getMetaColony();
  // Get the CLNY funding for the MetaColony (CLNY is it's native token)
  const funding = await metaColony.getBalance();
  // The funding will be in wei (x * 10^18), so we format into a readable string using the `toEth` function
  alert('MetaColony balance is ' + toEth(funding) + ' CLNY');
};

start();
```

## Documentation

[🖺 Click here for docs!](https://docs.colony.io/colonysdk)

## Running the examples

First, clone this repo: 
```bash
git clone https://github.com/JoinColony/colonySDK.git
```

Then install all the required dependencies (this will install [ethers.js](https://docs.ethers.io/v5/) and [colonyJS](https://github.com/JoinColony/colonyJS) as well as some required development dependencies):

```bash
npm install
```

Then you can run the examples:

### Node.js

```bash
npm run examples:node
```

### Browser (vanilla JS example)

```bash
npm run examples:browser
```

### Some notes

These examples will run on Gnosis chain. If you'd like to make transactions, you will need some XDAI. Reach out to us in our [Discord](https://discord.gg/feVZWwysqM) if you're having trouble starting out.

## Development

### Prerequisites

- Node `>=16.0.0`

_You may find it helpful to use [Node Version Manager (`nvm`)](https://github.com/nvm-sh/nvm) to manage Node versions._

### Creating a new release

colonySDK is using [`release-it`](https://github.com/release-it/release-it) to create new releases. To create and publish a new release, commit your changes, then execute

```bash
npm run release -- SEMVER_TAG # SEMVER_TAG is major, minor, patch
```

If you don't supply a `GITHUB_TOKEN` environment variable, `release-it` will open a browser window and pre-populate the corresponding release input fields for you.

**Frequent commits and descriptive commit messages** will help when `release-it` tries to autogenerate the changelog.

### Contribute

_Are you interested in contributing?_ Check out the following document for more information:

- [Contributing](CONTRIBUTING.md)

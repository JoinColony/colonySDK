[Colony SDK 🚀](../README.md) / [Modules](../modules.md) / [ColonyNetwork](../modules/ColonyNetwork.md) / Colony

# Class: Colony

[ColonyNetwork](../modules/ColonyNetwork.md).Colony

## Table of contents

### Properties

- [address](ColonyNetwork.Colony.md#address)
- [colonyNetwork](ColonyNetwork.Colony.md#colonynetwork)
- [version](ColonyNetwork.Colony.md#version)
- [SupportedVersions](ColonyNetwork.Colony.md#supportedversions)

### Methods

- [claimFunds](ColonyNetwork.Colony.md#claimfunds)
- [createTeam](ColonyNetwork.Colony.md#createteam)
- [getBalance](ColonyNetwork.Colony.md#getbalance)
- [getReputation](ColonyNetwork.Colony.md#getreputation)
- [getReputationAcrossTeams](ColonyNetwork.Colony.md#getreputationacrossteams)
- [getToken](ColonyNetwork.Colony.md#gettoken)
- [moveFundsToTeam](ColonyNetwork.Colony.md#movefundstoteam)
- [pay](ColonyNetwork.Colony.md#pay)
- [returnTxData](ColonyNetwork.Colony.md#returntxdata)

## Properties

### address

• **address**: `string`

___

### colonyNetwork

• **colonyNetwork**: [`ColonyNetwork`](ColonyNetwork.ColonyNetwork-1.md)

___

### version

• **version**: `number`

___

### SupportedVersions

▪ `Static` **SupportedVersions**: (``8`` \| ``9``)[]

The currently supported Colony version. If a Colony is not on this version it has to be upgraded.
If this is not an option, Colony SDK might throw errors at certain points. Usage of ColonyJS is advised in these cases

## Methods

### claimFunds

▸ **claimFunds**(`tokenAddress?`): `Promise`<[{ `fee?`: `BigNumber` ; `payoutRemainder?`: `BigNumber` ; `token?`: `string`  }, `ContractReceipt`]\>

Claim outstanding Colony funds.

Anyone can call this function. Claims funds _for_ the Colony that have been sent to the Colony's contract address or minted funds of the Colony's native token. This function _has_ to be called in order for the funds to appear in the Colony's treasury. You can provide a token address for the token to be claimed. Otherwise it will claim the outstanding funds of the Colony's native token

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `tokenAddress` | `string` | The address of the token to claim the funds for. Default is the Colony's native token |

#### Returns

`Promise`<[{ `fee?`: `BigNumber` ; `payoutRemainder?`: `BigNumber` ; `token?`: `string`  }, `ContractReceipt`]\>

A tupel of event data and contract receipt

**Event data**
| Property | Type | Description |
| :------ | :------ | :------ |
| `agent` | string | The address that is responsible for triggering this event |
| `token` | string | The token address |
| `fee` | BigNumber | The fee deducted for rewards |
| `payoutRemainder` | BigNumber | The remaining funds moved to the top-level domain pot |

___

### createTeam

▸ **createTeam**(`metadataCid?`): `Promise`<[{ `agent?`: `string` ; `domainId?`: `BigNumber` ; `fundingPotId?`: `BigNumber` ; `metadata?`: `string`  }, `ContractReceipt`, () => `Promise`<{ `domainColor`: `string` ; `domainName`: `string` ; `domainPurpose`: `string`  }\>] \| [{ `agent?`: `string` ; `domainId?`: `BigNumber` ; `fundingPotId?`: `BigNumber` ; `metadata?`: `string`  }, `ContractReceipt`]\>

Create a team within a Colony

**`remarks`**
Currently you can only add domains within the `Root` domain. This restriction will be lifted soon

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `metadataCid?` | `string` | An IPFS [CID](https://docs.ipfs.io/concepts/content-addressing/#identifier-formats) for a JSON file containing the metadata described below. For now, we would like to keep it agnostic to any IPFS upload mechanism, so you have to upload the file manually and provide your own hash (by using, for example, [Pinata](https://docs.pinata.cloud/)) |

#### Returns

`Promise`<[{ `agent?`: `string` ; `domainId?`: `BigNumber` ; `fundingPotId?`: `BigNumber` ; `metadata?`: `string`  }, `ContractReceipt`, () => `Promise`<{ `domainColor`: `string` ; `domainName`: `string` ; `domainPurpose`: `string`  }\>] \| [{ `agent?`: `string` ; `domainId?`: `BigNumber` ; `fundingPotId?`: `BigNumber` ; `metadata?`: `string`  }, `ContractReceipt`]\>

A tupel: `[eventData, ContractReceipt, getMetaData]`

**Event data**
| Property | Type | Description |
| :------ | :------ | :------ |
| `agent` | string | The address that is responsible for triggering this event |
| `domainId` | BigNumber | Integer domain id of the created team |
| `fundingPotId` | BigNumber | Integer id of the corresponding funding pot |
| `metadata` | string | IPFS CID of metadata attached to this transaction |

**Metadata** (can be obtained by calling and awaiting the `getMetadata` function)
| Property | Type | Description |
| :------ | :------ | :------ |
| `domainName` | string | The human readable name assigned to this team |
| `domainColor` | string | The color assigned to this team |
| `domainPurpose` | string | The purpose for this team (a broad description) |

___

### getBalance

▸ **getBalance**(`tokenAddress?`, `teamId?`): `Promise`<`BigNumber`\>

Get a token balance for a specific token and team. Defaults to the Colony's native token and the `Root` team.

**`remarks`**
The function will automatically figure out the corresponding pot for the given domain, as this is what's usually expected.

**`example`**
Get the xDAI balance of the team number 2
```typescript
import { constants, utils } from 'ethers';
// The `AddressZero` means ETH on mainnet and xDAI on Gnosis chain
const balance = await colony.getBalance(constants.AddressZero, 2);
// This will format the balance as a string in eth and not wei (i.e. 1.0 vs. 1000000000000000000)
console.info(utils.formatEther(balance));
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `tokenAddress?` | `string` | The address of the token to get the balance for. Default is the Colony's native token |
| `teamId?` | `BigNumberish` | The teamId (domainId) of the team to get the balance for. Default is the `Root` team |

#### Returns

`Promise`<`BigNumber`\>

A token balance in [wei](https://gwei.io/)

___

### getReputation

▸ **getReputation**(`userAddress`, `teamId?`): `Promise`<`BigNumber`\>

Get the reputation for a user address within a team in the Colony

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `userAddress` | `string` | `undefined` | The address of the account to check the reputation for |
| `teamId` | [`Id`](../enums/constants.Id.md) | `Id.RootDomain` | The teamId (domainId) of the team to get the reputation for. Default is the `Root` team |

#### Returns

`Promise`<`BigNumber`\>

A number quantifying the user addresses' reputation

___

### getReputationAcrossTeams

▸ **getReputationAcrossTeams**(`userAddress`): `Promise`<{ `domainId`: `number` ; `reputationAmount?`: `BigNumberish` ; `skillId`: `number`  }[]\>

Get the reputation for a user address across all teams in the Colony

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `userAddress` | `string` | The address of the account to check the reputation for |

#### Returns

`Promise`<{ `domainId`: `number` ; `reputationAmount?`: `BigNumberish` ; `skillId`: `number`  }[]\>

An array of objects containing the following

| Property | Description |
| :------ | :------ |
| `domainId` | The domainId of the domain the user has reputation in |
| `skillId` | The corresponding skillId |
| `reputationAmount` | The reputation amount in that domain |

___

### getToken

▸ **getToken**(): [`ColonyToken`](ColonyNetwork.ColonyToken.md)

Get a new instance of a Colony's native Token

**`remarks`**
Currently only Tokens deployed via Colony are supported (no external, imported tokens) in Colony SDK. All other kinds will throw an error

#### Returns

[`ColonyToken`](ColonyNetwork.ColonyToken.md)

A [ColonyNetwork.ColonyToken](ColonyNetwork.ColonyToken.md) abstaction instance

___

### moveFundsToTeam

▸ **moveFundsToTeam**(`amount`, `toTeam`, `fromTeam?`, `tokenAddress?`): `Promise`<[{ `agent?`: `string` ; `amount?`: `BigNumber` ; `fromPot?`: `BigNumber` ; `toPot?`: `BigNumber` ; `token?`: `string`  }, `ContractReceipt`]\>

Move funds from one team to another

After sending funds to and claiming funds for your Colony they will land in a special team, the root team. If you want to make payments from other teams (in order to award reputation in that team) you have to move the funds there first. Use this method to do so.

**`remarks`** Requires the `Funding` permission in the root team. As soon as teams can be nested, this requires the `Funding` permission in a team that is a parent of both teams in which funds are moved.

**`example`**
```typescript
import { utils } from 'ethers';
import { Tokens } from '@colony/sdk';

// Immediately executing async function
(async function() {
  // Move 10 of the native token from team 2 to team 3
  await colony.moveFunds(
     utils.parseUnits('10'),
     2,
     3,
  );
})();
```

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `amount` | `BigNumberish` | `undefined` | Amount to transfer between the teams |
| `toTeam` | `BigNumberish` | `undefined` | The team to transfer the funds to |
| `fromTeam` | `BigNumberish` | `Id.RootDomain` | The team to transfer the funds from. Default is the Root team |
| `tokenAddress` | `string` | `undefined` | The address of the token to be transferred. Default is the Colony's native token |

#### Returns

`Promise`<[{ `agent?`: `string` ; `amount?`: `BigNumber` ; `fromPot?`: `BigNumber` ; `toPot?`: `BigNumber` ; `token?`: `string`  }, `ContractReceipt`]\>

A tupel of event data and contract receipt

**Event data**
| Property | Type | Description |
| :------ | :------ | :------ |
| `agent` | string | The address that is responsible for triggering this event |
| `fromPot` | BigNumber | The source funding pot |
| `toPot` | BigNumber | The target funding pot |
| `amount` | BigNumber | The amount that was transferred |
| `token` | string | The token address being transferred |

___

### pay

▸ **pay**(`recipient`, `amount`, `teamId?`, `tokenAddress?`): `Promise`<[{ `agent?`: `string` ; `fundamentalId?`: `BigNumber` ; `nPayouts?`: `BigNumber`  }, `ContractReceipt`]\>

Make a payment to a single address using a single token

**`remarks`** Requires the `OneTxPayment` extension to be installed for the Colony (this is usually the case for Colonies created via the Dapp). Note that most tokens use 18 decimals, so add a bunch of zeros or use ethers' `parseUnits` function (see example)

**`example`**
```typescript
import { utils } from 'ethers';
import { Tokens } from '@colony/sdk';

// Immediately executing async function
(async function() {
  // Pay 10 XDAI (on Gnosis chain) to the following address
  await colony.pay(
     '0xb77D57F4959eAfA0339424b83FcFaf9c15407461',
     utils.parseUnits('10'),
     Tokens.Gnosis.XDAI,
  );
})();
```

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `recipient` | `string` | `undefined` | Wallet address of account to send the funds to (also awarded reputation when sending the native token) |
| `amount` | `BigNumberish` | `undefined` | Amount to pay in wei |
| `teamId` | `BigNumberish` | `Id.RootDomain` | The team to use to send the funds from. Has to have funding of at least the amount you need to send. See [Colony.moveFundsToTeam](ColonyNetwork.Colony.md#movefundstoteam). Defaults to the Colony's root team |
| `tokenAddress` | `string` | `undefined` | The address of the token to make the payment in. Default is the Colony's native token |

#### Returns

`Promise`<[{ `agent?`: `string` ; `fundamentalId?`: `BigNumber` ; `nPayouts?`: `BigNumber`  }, `ContractReceipt`]\>

A tupel of event data and contract receipt

**Event data**
| Property | Type | Description |
| :------ | :------ | :------ |
| `agent` | string | The address that is responsible for triggering this event |
| `fundamentalId` | BigNumber | The newly added payment id |
| `nPayouts` | BigNumber | Number of payouts in total |

___

### returnTxData

▸ **returnTxData**<`D`, `E`\>(`data`, `metadataEvent`, `receipt`): `Promise`<[`D`, `ContractReceipt`, () => `Promise`<[`MetadataValue`](../modules/events.md#metadatavalue)<`E`\>\>] \| [`D`, `ContractReceipt`]\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `D` | extends `Object` |
| `E` | extends ``"DomainMetadata"`` \| ``"Annotation"`` \| ``"ColonyMetadata"`` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `data` | `D` |
| `metadataEvent` | `E` |
| `receipt` | `ContractReceipt` |

#### Returns

`Promise`<[`D`, `ContractReceipt`, () => `Promise`<[`MetadataValue`](../modules/events.md#metadatavalue)<`E`\>\>] \| [`D`, `ContractReceipt`]\>

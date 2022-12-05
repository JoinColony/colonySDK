# Class: OneTxPayment

## `OneTxPayment` (One Transaction Payment)

Ordinarily payments require more than one transaction, because the payment lifecycle requires more than one permissioned role.

In some use cases, there might be a need for one authorized individual to be able to create, funds, and finalize a payment within a single transaction.

The OneTxPayment extension adds this functionality by adding a makePayment function which requires the caller to have both Funding and administration ability within the domain of the payment.

Extension therefore requires Administration and Funding roles to function.

Note: if you deployed your Colony using the Dapp, the OneTxPayment extension is already installed for you

## Constructors

### constructor

• **new OneTxPayment**(`colony`, `oneTxPaymentClient`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `colony` | [`Colony`](Colony.md) |
| `oneTxPaymentClient` | `OneTxPaymentClientV3` |

## Properties

### address

• **address**: `string`

___

### extensionType

▪ `Static` **extensionType**: [`OneTxPayment`](../enums/Extension.md#onetxpayment) = `Extension.OneTxPayment`

___

### supportedVersion

▪ `Static` **supportedVersion**: ``3``[]

## Methods

### pay

▸ **pay**(`recipient`, `amount`, `teamId?`, `tokenAddress?`): [`TxCreator`](TxCreator.md)<`OneTxPaymentClientV3`, ``"makePaymentFundedFromDomain"``, { `agent?`: `string` ; `fundamentalId?`: `BigNumber` ; `nPayouts?`: `BigNumber`  }, [`MetadataType`](../enums/MetadataType.md)\>

Make a payment to a single address using a single token

**`Remarks`**

Requires the `OneTxPayment` extension to be installed for the Colony (this is usually the case for Colonies created via the Dapp). Note that most tokens use 18 decimals, so add a bunch of zeros or use our `w` or `toWei` functions (see example)

**`Example`**

```typescript
import { Id, Tokens, w } from '@colony/sdk';

// Immediately executing async function
(async function() {
  // Pay 10 XDAI (on Gnosis chain) from the root domain to the following address
  // (forced transaction example)
  await colony.pay(
     '0xb77D57F4959eAfA0339424b83FcFaf9c15407461',
     w`10`,
     Id.RootDomain,
     Tokens.Gnosis.XDAI,
  ).force();
})();
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `recipient` | `string` | Wallet address of account to send the funds to (also awarded reputation when sending the native token) |
| `amount` | `BigNumberish` | Amount to pay in wei |
| `teamId?` | `BigNumberish` | The team to use to send the funds from. Has to have funding of at least the amount you need to send. See [Colony.moveFundsToTeam](Colony.md#movefundstoteam). Defaults to the Colony's root team |
| `tokenAddress?` | `string` | The address of the token to make the payment in. Default is the Colony's native token |

#### Returns

[`TxCreator`](TxCreator.md)<`OneTxPaymentClientV3`, ``"makePaymentFundedFromDomain"``, { `agent?`: `string` ; `fundamentalId?`: `BigNumber` ; `nPayouts?`: `BigNumber`  }, [`MetadataType`](../enums/MetadataType.md)\>

A [TxCreator](TxCreator.md)

**Event data**

| Property | Type | Description |
| :------ | :------ | :------ |
| `agent` | string | The address that is responsible for triggering this event |
| `fundamentalId` | BigNumber | The newly added payment id |
| `nPayouts` | BigNumber | Number of payouts in total |

___

### getLatestSupportedVersion

▸ `Static` **getLatestSupportedVersion**(): ``3``

#### Returns

``3``
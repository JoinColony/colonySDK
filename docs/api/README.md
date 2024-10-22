# API

## Namespaces

- [Tokens](modules/Tokens.md)

## Enumerations

- [ColonyLabelSuffix](enums/ColonyLabelSuffix.md)
- [ColonyRole](enums/ColonyRole.md)
- [ColonyRpcEndpoint](enums/ColonyRpcEndpoint.md)
- [Extension](enums/Extension.md)
- [Id](enums/Id.md)
- [MetaTxBroadCasterEndpoint](enums/MetaTxBroadCasterEndpoint.md)
- [MetadataType](enums/MetadataType.md)
- [MotionState](enums/MotionState.md)
- [Network](enums/Network.md)
- [SupportedExtension](enums/SupportedExtension.md)
- [TeamColor](enums/TeamColor.md)
- [UserLabelSuffix](enums/UserLabelSuffix.md)
- [Vote](enums/Vote.md)

## Classes

- [CloudflareReadonlyAdapter](classes/CloudflareReadonlyAdapter.md)
- [Colony](classes/Colony.md)
- [ColonyEventManager](classes/ColonyEventManager.md)
- [ColonyGraph](classes/ColonyGraph.md)
- [ColonyNetwork](classes/ColonyNetwork.md)
- [ColonyToken](classes/ColonyToken.md)
- [ColonyTxCreator](classes/ColonyTxCreator.md)
- [ERC20Token](classes/ERC20Token.md)
- [ERC2612Token](classes/ERC2612Token.md)
- [MetaTxCreator](classes/MetaTxCreator.md)
- [OneTxPayment](classes/OneTxPayment.md)
- [PinataAdapter](classes/PinataAdapter.md)
- [TxCreator](classes/TxCreator.md)
- [VotingReputation](classes/VotingReputation.md)

## Interfaces

- [AnnotationMetadata](interfaces/AnnotationMetadata.md)
- [BaseContract](interfaces/BaseContract.md)
- [ColonyEvent](interfaces/ColonyEvent.md)
- [ColonyEventManagerOptions](interfaces/ColonyEventManagerOptions.md)
- [ColonyFilter](interfaces/ColonyFilter.md)
- [ColonyMetadata](interfaces/ColonyMetadata.md)
- [ColonyMultiFilter](interfaces/ColonyMultiFilter.md)
- [ColonyNetworkOptions](interfaces/ColonyNetworkOptions.md)
- [ColonyTopic](interfaces/ColonyTopic.md)
- [DecisionMetadata](interfaces/DecisionMetadata.md)
- [DomainMetadata](interfaces/DomainMetadata.md)
- [Ethers6Filter](interfaces/Ethers6Filter.md)
- [Ethers6FilterByBlockHash](interfaces/Ethers6FilterByBlockHash.md)
- [EventSources](interfaces/EventSources.md)
- [GraphDomain](interfaces/GraphDomain.md)
- [IpfsAdapter](interfaces/IpfsAdapter.md)
- [MetaTxBaseContract](interfaces/MetaTxBaseContract.md)
- [NetworkClientOptions](interfaces/NetworkClientOptions.md)
- [ParsedLogTransactionReceipt](interfaces/ParsedLogTransactionReceipt.md)
- [PermissionConfig](interfaces/PermissionConfig.md)
- [SubgraphClientOptions](interfaces/SubgraphClientOptions.md)
- [SupportedExtensions](interfaces/SupportedExtensions.md)
- [TxConfig](interfaces/TxConfig.md)
- [TxCreatorConfig](interfaces/TxCreatorConfig.md)

## Type Aliases

### EventSource

Ƭ **EventSource**: [`EventSources`](interfaces/EventSources.md)[keyof [`EventSources`](interfaces/EventSources.md)]

An EventSource is essentially an _ethers_ contract, that we can keep track of

___

### MetadataEvent

Ƭ **MetadataEvent**<`K`\>: typeof `IPFS_METADATA_EVENTS`[`K`]

#### Type parameters

| Name | Type |
| :------ | :------ |
| `K` | extends [`MetadataType`](enums/MetadataType.md) |

___

### MetadataValue

Ƭ **MetadataValue**<`K`\>: `ReturnType`<typeof `IPFS_METADATA_PARSERS`[`K`]\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `K` | extends [`MetadataType`](enums/MetadataType.md) |

## Variables

### DecisionMotionCode

• `Const` **DecisionMotionCode**: ``"0x12345678"``

Identifies a motion as a decision

Usually there's no need to use this directly. Use [VotingReputation.createDecision](classes/VotingReputation.md#createdecision) instead.

## Functions

### addressesAreEqual

▸ **addressesAreEqual**(`a`, `b`): `boolean`

Check if two addresses are equal

#### Parameters

| Name | Type |
| :------ | :------ |
| `a` | `string` |
| `b` | `string` |

#### Returns

`boolean`

___

### createSubgraphClient

▸ **createSubgraphClient**(`options?`): `Client`

Creates a Colony Subgraph client

The Colony Subgraph client is nothing else than a ready-to-use [`urql`](https://formidable.com/open-source/urql/) client connected to the Colony Subgraph with subscriptions enabled. Please refer to the following references if you'd like to know more about [The Graph](https://thegraph.com/) or [GraphQL](https://graphql.org/) in general.

The Colony Subgraph's schema and resolvers are kept up-to-date by the Colony team and can be explored here: [Colony Subgraph](https://thegraph.com/hosted-service/subgraph/joincolony/colony-xdai). There you can make test queries to the Colony Subgraph and explore it all the way down the rabbit hole :)

**`Example`**

Retrieve the 10 most recent "DomainAdded" events across all Colonies
```typescript
import { createSubgraphClient, gql } from '@colony/sdk/graph';

const colonySubgraph = createSubgraphClient();

const QUERY = gql`
  query DomainAddedEvents {
    events(
      first: 10
      orderBy: timestamp
      orderDirection: desc
      where: { name_contains: "DomainAdded" }
    ) {
      id
      address
      associatedColony {
        colonyAddress: id
      }
      name
      args
      timestamp
    }
  }
`;

colonySubgraph
  .query(QUERY)
  .toPromise()
  .then((result) => {
    console.info(result.data.events[0]);
  });
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `options?` | [`SubgraphClientOptions`](interfaces/SubgraphClientOptions.md) | Define configuration options to instantiate the client with |

#### Returns

`Client`

A ready-to-use `urql` GraphQL client instance

___

### extractCustomEvent

▸ **extractCustomEvent**<`T`\>(`eventName`, `receipt`, `iface`): `undefined` \| `T`

Manually extract an event using the interface (e.g. if emitting contract is a different one than the calling contract)

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `eventName` | `string` |
| `receipt` | `ContractReceipt` \| [`ParsedLogTransactionReceipt`](interfaces/ParsedLogTransactionReceipt.md) |
| `iface` | `Interface` |

#### Returns

`undefined` \| `T`

___

### extractEvent

▸ **extractEvent**<`T`\>(`eventName`, `receipt`): `undefined` \| `T`

Extract event args from a contract receipt

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `eventName` | `string` |
| `receipt` | `ContractReceipt` \| [`ParsedLogTransactionReceipt`](interfaces/ParsedLogTransactionReceipt.md) |

#### Returns

`undefined` \| `T`

___

### getLogs

▸ **getLogs**(`filter`, `provider`): `Promise`<`Log`[]\>

Version of `getLogs` that also supports filtering for multiple addresses

#### Parameters

| Name | Type |
| :------ | :------ |
| `filter` | [`Ethers6Filter`](interfaces/Ethers6Filter.md) \| [`Ethers6FilterByBlockHash`](interfaces/Ethers6FilterByBlockHash.md) \| `Promise`<[`Ethers6Filter`](interfaces/Ethers6Filter.md) \| [`Ethers6FilterByBlockHash`](interfaces/Ethers6FilterByBlockHash.md)\> |
| `provider` | `JsonRpcProvider` |

#### Returns

`Promise`<`Log`[]\>

___

### gql

▸ **gql**<`Data`, `Variables`\>(`strings`, ...`interpolations`): `TypedDocumentNode`<`Data`, `Variables`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `Data` | `any` |
| `Variables` | `object` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `strings` | `TemplateStringsArray` |
| `...interpolations` | (`string` \| `DocumentNode` \| `TypedDocumentNode`<{ `[key: string]`: `any`;  }, { `[key: string]`: `any`;  }\>)[] |

#### Returns

`TypedDocumentNode`<`Data`, `Variables`\>

▸ **gql**<`Data`, `Variables`\>(`string`): `TypedDocumentNode`<`Data`, `Variables`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `Data` | `any` |
| `Variables` | `object` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `string` | `string` |

#### Returns

`TypedDocumentNode`<`Data`, `Variables`\>

___

### nonNullable

▸ **nonNullable**<`T`\>(`value`): value is NonNullable<T\>

Use this to filter empty undefinied values from arrays in a type-safe way

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `T` |

#### Returns

value is NonNullable<T\>

___

### parseRoles

▸ **parseRoles**(`roles`): [`ColonyRole`](enums/ColonyRole.md)[]

Parses a binary role integer into a [ColonyRole](enums/ColonyRole.md) array

When getting multiple roles from contract methods or events they are
usually formatted as a binary number. Here the least significant bit is
the role with the index 0 (Recovery).

E.g. 5 = 0b00101 equals Recovery and Arbitration

This function parses these binary integers into a [ColonyRole](enums/ColonyRole.md) array.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `roles` | `string` | A hex string (e.g. 0x3 = 0b11 equals Recovery and Root roles) |

#### Returns

[`ColonyRole`](enums/ColonyRole.md)[]

___

### toEth

▸ **toEth**(`num`): `string`

Convert any number to ETH (remove 18 zeros)

**`Example`**

```typescript
import { toEth } from '@colony/sdk';

const oneEther = BigNumber.from("1000000000000000000");
console.log(toEth(oneEther)); // 1.0
```

#### Parameters

| Name | Type |
| :------ | :------ |
| `num` | `BigNumberish` |

#### Returns

`string`

___

### toWei

▸ **toWei**(`num`): `BigNumber`

Convert any number to wei (add 18 zeros)

**`Example`**

```typescript
import { toWei } from '@colony/sdk';

const oneEther = '1.0';
console.log(toWei(oneEther)); // { BigNumber: "1000000000000000000" }
```

#### Parameters

| Name | Type |
| :------ | :------ |
| `num` | `string` |

#### Returns

`BigNumber`

___

### w

▸ **w**(`str`): `BigNumber`

Short-hand method to convert a number to wei using JS tagged template strings

See also here: http://tc39wiki.calculist.org/es6/template-strings/

**`Remarks`**

This is only useful in contexts where the number is hard-coded (e.g. examples)

**`Example`**

```typescript
import { w } from '@colony/sdk';

console.log(w`1.0`); // { BigNumber: "1000000000000000000" }
```

#### Parameters

| Name | Type |
| :------ | :------ |
| `str` | `TemplateStringsArray` |

#### Returns

`BigNumber`

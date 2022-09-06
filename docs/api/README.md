# Colony SDK

## Namespaces

- [Tokens](modules/Tokens.md)

## Enumerations

- [ColonyRole](enums/ColonyRole.md)
- [Extension](enums/Extension.md)
- [Id](enums/Id.md)
- [MotionState](enums/MotionState.md)
- [Vote](enums/Vote.md)

## Classes

- [Colony](classes/Colony.md)
- [ColonyEventManager](classes/ColonyEventManager.md)
- [ColonyNetwork](classes/ColonyNetwork.md)
- [MotionCreator](classes/MotionCreator.md)
- [VotingReputation](classes/VotingReputation.md)

## Interfaces

- [ColonyEvent](interfaces/ColonyEvent.md)
- [ColonyFilter](interfaces/ColonyFilter.md)
- [ColonyMultiFilter](interfaces/ColonyMultiFilter.md)
- [Ethers6Filter](interfaces/Ethers6Filter.md)
- [Ethers6FilterByBlockHash](interfaces/Ethers6FilterByBlockHash.md)
- [EventSources](interfaces/EventSources.md)

## Type Aliases

### AnyMetadataValue

Ƭ **AnyMetadataValue**: `Static`<typeof `IPFS_METADATA`[[`MetadataKey`](README.md#metadatakey)]\>

___

### EventSource

Ƭ **EventSource**: [`EventSources`](interfaces/EventSources.md)[keyof [`EventSources`](interfaces/EventSources.md)]

An EventSource is essentially an _ethers_ contract, that we can keep track of

___

### MetadataKey

Ƭ **MetadataKey**: keyof typeof `IPFS_METADATA`

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
| `receipt` | `ContractReceipt` |

#### Returns

`undefined` \| `T`

___

### extractEventFromLogs

▸ **extractEventFromLogs**<`T`\>(`eventName`, `receipt`, `iface`): `undefined` \| `T`

Manually extract an event from logs (e.g. if emitting contract is a different one than the calling contract)

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `eventName` | `string` |
| `receipt` | `ContractReceipt` |
| `iface` | `Interface` |

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

[Colony SDK 🚀](../README.md) / [events](../modules/events.md) / ColonyFilter

# Interface: ColonyFilter

[events](../modules/events.md).ColonyFilter

A Colony extended ethers Filter to keep track of where events are coming from

## Hierarchy

- [`Ethers6Filter`](types.Ethers6Filter.md)

  ↳ **`ColonyFilter`**

  ↳↳ [`ColonyEvent`](events.ColonyEvent.md)

## Table of contents

### Properties

- [address](events.ColonyFilter.md#address)
- [eventName](events.ColonyFilter.md#eventname)
- [eventSource](events.ColonyFilter.md#eventsource)
- [fromBlock](events.ColonyFilter.md#fromblock)
- [toBlock](events.ColonyFilter.md#toblock)
- [topics](events.ColonyFilter.md#topics)

## Properties

### address

• `Optional` **address**: `string` \| `string`[]

#### Inherited from

[Ethers6Filter](types.Ethers6Filter.md).[address](types.Ethers6Filter.md#address)

___

### eventName

• **eventName**: `string`

The full event signature of this event (e.g. `TokenMinted(uint256))`

___

### eventSource

• **eventSource**: keyof [`EventSources`](events.EventSources.md)

The Colony contract the event originated from

___

### fromBlock

• `Optional` **fromBlock**: `BlockTag`

#### Inherited from

[Ethers6Filter](types.Ethers6Filter.md).[fromBlock](types.Ethers6Filter.md#fromblock)

___

### toBlock

• `Optional` **toBlock**: `BlockTag`

#### Inherited from

[Ethers6Filter](types.Ethers6Filter.md).[toBlock](types.Ethers6Filter.md#toblock)

___

### topics

• `Optional` **topics**: (``null`` \| `string` \| `string`[])[]

#### Inherited from

[Ethers6Filter](types.Ethers6Filter.md).[topics](types.Ethers6Filter.md#topics)
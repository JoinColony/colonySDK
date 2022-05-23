[Colony SDK 🚀](../README.md) / [Modules](../modules.md) / [events](../modules/events.md) / IpfsMetadata

# Class: IpfsMetadata

[events](../modules/events.md).IpfsMetadata

## Table of contents

### Constructors

- [constructor](events.IpfsMetadata.md#constructor)

### Methods

- [getMetadataForEvent](events.IpfsMetadata.md#getmetadataforevent)

## Constructors

### constructor

• **new IpfsMetadata**(`options?`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `options?` | [`IpfsOptions`](../interfaces/events.IpfsOptions.md) |

## Methods

### getMetadataForEvent

▸ **getMetadataForEvent**<`T`\>(`eventName`, `ipfsCid`): `Promise`<`Static`<{ `DomainMetadata`: `Record`<{ `domainColor`: `String` = String; `domainName`: `String` = String; `domainPurpose`: `String` = String }, ``false``\>  }[`T`]\>\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends ``"DomainMetadata"`` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `eventName` | `T` |
| `ipfsCid` | `string` |

#### Returns

`Promise`<`Static`<{ `DomainMetadata`: `Record`<{ `domainColor`: `String` = String; `domainName`: `String` = String; `domainPurpose`: `String` = String }, ``false``\>  }[`T`]\>\>

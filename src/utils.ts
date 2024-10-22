import { BigNumberish, ContractReceipt, utils } from 'ethers';
import { ColonyRole } from '@colony/colony-js';

import type { Log } from '@ethersproject/abstract-provider';
import type { JsonRpcProvider } from '@ethersproject/providers';
import type { Interface } from '@ethersproject/abi';

import {
  Ethers6Filter,
  Ethers6FilterByBlockHash,
  ParsedLogTransactionReceipt,
} from './types';

/** Extract event args from a contract receipt */
// TODO: Make it possible to retrieve multiple events of the same kind
export const extractEvent = <T>(
  eventName: string,
  receipt: ContractReceipt | ParsedLogTransactionReceipt,
): T | undefined => {
  if ('events' in receipt && receipt.events) {
    const event = receipt.events.find((ev) => ev.event === eventName);
    if (event?.args) {
      return event.args as ReadonlyArray<unknown> & T;
    }
  } else if ('parsedLogs' in receipt && receipt.parsedLogs) {
    const event = receipt.parsedLogs.find((ev) => ev.name === eventName);
    if (event?.args) {
      return event.args as ReadonlyArray<unknown> & T;
    }
  }
  return undefined;
};

/** Manually extract an event using the interface (e.g. if emitting contract is a different one than the calling contract) */
export const extractCustomEvent = <T>(
  eventName: string,
  receipt: ContractReceipt | ParsedLogTransactionReceipt,
  iface: Interface,
): T | undefined => {
  let events: { data: string; topics: string[] }[];
  if ('events' in receipt && receipt.events) {
    events = receipt.events;
  } else if ('logs' in receipt && receipt.logs) {
    events = receipt.logs;
  } else {
    events = [];
  }
  for (let i = 0; i < events.length; i += 1) {
    try {
      return iface.decodeEventLog(
        eventName,
        events[i].data,
        events[i].topics,
      ) as ReadonlyArray<unknown> & T;
    } catch (e) {
      // ignore
    }
  }
  return undefined;
};

/** Version of `getLogs` that also supports filtering for multiple addresses */
export const getLogs = async (
  filter:
    | Ethers6Filter
    | Ethers6FilterByBlockHash
    | Promise<Ethers6Filter | Ethers6FilterByBlockHash>,
  provider: JsonRpcProvider,
): Promise<Log[]> => {
  const usedFilter = await filter;
  return provider.send('eth_getLogs', [usedFilter]);
};

/** Check if two addresses are equal */
export const addressesAreEqual = (a: string, b: string) =>
  a.toLowerCase() === b.toLowerCase();

/** Use this to filter empty undefinied values from arrays in a type-safe way */
export const nonNullable = <T>(value: T): value is NonNullable<T> => {
  return value !== null && value !== undefined;
};

/**
 * Convert any number to ETH (remove 18 zeros)
 *
 * @example
 * ```typescript
 * import { toEth } from '@colony/sdk';
 *
 * const oneEther = BigNumber.from("1000000000000000000");
 * console.log(toEth(oneEther)); // 1.0
 * ```
 */
export const toEth = (num: BigNumberish) => utils.formatEther(num);

/**
 * Convert any number to wei (add 18 zeros)
 *
 * @example
 * ```typescript
 * import { toWei } from '@colony/sdk';
 *
 * const oneEther = '1.0';
 * console.log(toWei(oneEther)); // { BigNumber: "1000000000000000000" }
 * ```
 */
export const toWei = (num: string) => utils.parseEther(num);

/**
 * Short-hand method to convert a number to wei using JS tagged template strings
 *
 * See also here: http://tc39wiki.calculist.org/es6/template-strings/
 *
 * @remarks
 * This is only useful in contexts where the number is hard-coded (e.g. examples)
 *
 * @example
 * ```typescript
 * import { w } from '@colony/sdk';
 *
 * console.log(w`1.0`); // { BigNumber: "1000000000000000000" }
 * ```
 */
export const w = (str: TemplateStringsArray) => toWei(str[0]);

/**
 * Parses a binary role integer into a [[ColonyRole]] array
 *
 * When getting multiple roles from contract methods or events they are
 * usually formatted as a binary number. Here the least significant bit is
 * the role with the index 0 (Recovery).
 *
 * E.g. 5 = 0b00101 equals Recovery and Arbitration
 *
 * This function parses these binary integers into a [[ColonyRole]] array.
 *
 * @param roles - A hex string (e.g. 0x3 = 0b11 equals Recovery and Root roles)
 *
 */
export const parseRoles = (roles: string) => {
  const rolesNum = parseInt(roles, 16);
  const result = [] as ColonyRole[];
  for (let i = 0; i < ColonyRole.LAST_ROLE; i += 1) {
    // eslint-disable-next-line no-bitwise
    if (rolesNum & (1 << i)) {
      result.push(i as ColonyRole);
    }
  }
  return result;
};

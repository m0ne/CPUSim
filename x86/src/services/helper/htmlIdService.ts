/* SPDX-License-Identifier: GPL-2.0-only */
/*
 * CPUSim
 *
 * Copyright © 2021 by Eliane Schmidli <seliane.github@gmail.com> and Yves Boillat <yvbo@protonmail.com>
 * Modified 2022 by Michael Schneider <michael.schneider@hispeed.com> and Tobias Petter <tobiaspetter@chello.at>
 *
 * This file is part of CPUSim
 *
 * CPUSim is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, version 2 of the License only.
 *
 * CPUSim is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with CPUSim.  If not, see <https://www.gnu.org/licenses/>.
 */

import Address from '@/services/interfaces/Address';
import Byte from '@/services/interfaces/Byte';
import htmlId from '@/services/helper/htmlIds';

export function getLocationIdsFromBytes(memoryLineContent: Array<Byte>): Array<string> {
  const locationIds: Array<string> = Array(memoryLineContent.length);
  memoryLineContent.forEach((byte, index) => {
    locationIds[index] = byte.locationId;
  });
  return locationIds;
}

export function getAnimationIdImmediate(locationId: string) {
  return htmlId.animatePrefix + locationId;
}

function getAnimationId(locationId: string, write: boolean, index?: number): string {
  const prefix = write ? htmlId.animateWrite : htmlId.animateRead;
  let animationId = prefix + locationId;
  if (index !== undefined) {
    animationId += `_${index}`;
  }
  return animationId;
}

export function getAnimationIdRegister(locationId: string, write: boolean, index: number): string {
  return getAnimationId(locationId, write, index);
}

export function getAnimationIdMemory(locationId: string, write: boolean, index: number): string {
  return getAnimationId(locationId, write, index);
}

export function getAnimationIdFlag(locationId: string, write: boolean): string {
  return getAnimationId(locationId, write);
}

export function getAnimationIdJumpDestination(locationId: string, write: boolean, index: number): string {
  return getAnimationId(locationId, write, index);
}

export function getAnimationZoneIdImmediate(address: string): string {
  return htmlId.animateImmZone + address;
}

function getAnimationZoneIdAddressIndex(address: string, write: boolean, index: number): string {
  const idPrefix = write ? htmlId.animateWriteZone : htmlId.animateReadZone;
  return `${idPrefix}${address}_${index}`;
}

export function getAnimationZoneIdJumpDestination(name: string, write: boolean, index: number): string {
  return getAnimationZoneIdAddressIndex(name, write, index);
}

export function getAnimationZoneIdMemory(address: string, write: boolean, index: number): string {
  return getAnimationZoneIdAddressIndex(address, write, index);
}

export function getAnimationZoneIdRegister(name: string, write: boolean, index: number): string {
  return getAnimationZoneIdAddressIndex(name, write, index);
}

export function getAnimationZoneIdFlags(write: boolean): string {
  return write ? htmlId.animateWriteZoneFlags : htmlId.animateReadZoneFlags;
}

export function createLocationIdNumbers(start: number, size: number): Array<number> {
  let locationIds: Array<number> = Array(size).fill(0);
  locationIds = locationIds.map((locationId, index) => start + index);
  return locationIds;
}

export default function fillAddress(addressNumber: number): Address {
  let address = addressNumber.toString(16).toUpperCase();
  while (address.length < 4) {
    address = `0${address}`;
  }
  return { address };
}

function createLocationIdForMemoryByte(address: number): string {
  let addressHexString = '';
  const highestMemoryAddress = 0xffff;
  if (address >= 0 && address <= highestMemoryAddress) {
    addressHexString = fillAddress(address).address;
  } else {
    throw new RangeError(`Byte location Id ${address} is not valid.`);
  }
  return addressHexString;
}

function createLocationIdsWithPrefix(start: number, size: number, prefix: string): Array<string> {
  let locationIds: Array<string> = Array(size).fill('');
  locationIds = locationIds.map((value: string, index: number) => `${prefix}_${(start + index).toString()}`);
  return locationIds;
}

function createLocationIdsWithAddress(start: number, size: number): Array<string> {
  let locationIds: Array<string> = Array(size).fill('');
  locationIds = locationIds.map((locationId, index) => createLocationIdForMemoryByte(start + index));
  return locationIds;
}

export function createLocationIds(startHexAddress: number, size: number, locationIdPrefix?: string) {
  let locationIds: Array<string>;
  if (locationIdPrefix === undefined) {
    locationIds = createLocationIdsWithAddress(startHexAddress, size);
  } else {
    locationIds = createLocationIdsWithPrefix(startHexAddress, size, locationIdPrefix);
  }
  return locationIds;
}

export function getLocationIdsForCurrentInstruction(instructionSize: number) {
  return createLocationIdsWithPrefix(0, instructionSize, htmlId.locationIdPrefixCurrentInstruction);
}

export function getLocationIdsForImmediate(numberOfBytes: number): Array<string> {
  return createLocationIdsWithPrefix(0, numberOfBytes, htmlId.locationIdPrefixImmediate);
}

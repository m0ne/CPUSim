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

import Byte from '@/services/interfaces/Byte';
import {
  createLocationIds,
} from '@/services/helper/htmlIdService';
import htmlId from '@/services/helper/htmlIds';

function validateTwoLetterByteContent(content: string): boolean {
  const pattern = '^([0-9]|[A-F]){2}$';
  const byteRegex = RegExp(pattern);
  let isValid = false;
  if (content.match(byteRegex)) {
    isValid = true;
  } else {
    throw new TypeError(`Byte content: "${content}" contains invalid characters.`);
  }
  return isValid;
}

function validateOneLetterByteContent(content: string): boolean {
  let isValid = false;
  if (content === '0' || content === '1') {
    isValid = true;
  } else {
    throw new TypeError(`Byte content: "${content}" contains invalid characters.`);
  }
  return isValid;
}

function validateByteContent(content: string): boolean {
  let isValid = false;
  if (content.length === 2) {
    isValid = validateTwoLetterByteContent(content);
  } else if (content.length === 1) {
    isValid = validateOneLetterByteContent(content);
  } else {
    throw new TypeError(`Byte content: "${content}" is not two digits.`);
  }
  return isValid;
}

export default function dataStringsToBytes(contentStrings: Array<string>, startHexAddress: number, locationIdPrefix?: string): Array<Byte> {
  const bytes: Array<Byte> = [];
  if (contentStrings.length > 0) {
    const locationIds = createLocationIds(startHexAddress, contentStrings.length, locationIdPrefix);
    contentStrings.forEach((byteString, index) => {
      if (validateByteContent(byteString)) {
        bytes[index] = {
          locationId: locationIds[index],
          content: byteString,
        };
      }
    });
  } else {
    throw new TypeError('Content string is empty.');
  }
  return bytes;
}

export function dataStringsToCurrentInstructionBytes(contentStrings: Array<string>): Array<Byte> {
  return dataStringsToBytes(contentStrings, 0, htmlId.locationIdPrefixCurrentInstruction);
}

export function stringToByteStringArray(contentHex: string, sizeInBytes: number): Array<string> {
  if (sizeInBytes * 2 < contentHex.length) {
    throw new TypeError(`Byte String cannot be created because sizeInBytes: ${sizeInBytes} is smaller than memoryContentHex: ${contentHex}`);
  }
  let content = contentHex.toUpperCase();
  if (content.length % 2 !== 0) {
    content = `0${content}`;
  }
  const byteStringArray: Array<string> = [];
  for (let i = 0; i < content.length; i += 2) {
    byteStringArray.push(content.slice(i, i + 2));
  }
  byteStringArray.reverse();
  while (byteStringArray.length < sizeInBytes) {
    byteStringArray.push('00');
  }
  return byteStringArray;
}

export function byteArrayToUInt8Array(byteArray: Array<Byte>): Uint8Array {
  const numArray: Array<number> = [];
  byteArray.forEach((byte) => { numArray.push(parseInt(byte.content, 16)); });
  return Uint8Array.from(numArray);
}

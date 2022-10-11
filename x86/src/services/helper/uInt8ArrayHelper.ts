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

function addZeroToSingleDigitHex(value: string) {
  if (value.length < 2) {
    return `0${value}`;
  }
  return value;
}

export default function uInt8ArrayToHexStringArray(uInt8Data: Uint8Array): Array<string> {
  let hexStringArray: Array<string> = [];
  if (uInt8Data.length !== 0) {
    const stringData: Array<string> = Array.from(uInt8Data, (byte) => byte.toString(16).toUpperCase());
    hexStringArray = stringData.map(addZeroToSingleDigitHex);
  } else {
    throw new TypeError('Uint8Array is empty.');
  }
  return hexStringArray;
}

function reverseByteString(byte: string): string {
  const byteStringReversed = byte.split('').reverse();
  return byteStringReversed.join('');
}

export function uint8ArrayToBitString(bytes: Uint8Array): string {
  return bytes.reduce((binaryString: string, byteNumber: number) => {
    const byte = byteNumber.toString(2).padStart(8, '0');
    return binaryString + reverseByteString(byte);
  }, '');
}

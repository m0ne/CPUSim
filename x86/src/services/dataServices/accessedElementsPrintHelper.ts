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

import Flag from '@/services/interfaces/Flag';
import Register from '@/services/interfaces/Register';
import AccessedElements from '@/services/interfaces/AccessedElements';
import MemoryDataLine from '@/services/interfaces/MemoryDataLine';
import Byte from '@/services/interfaces/Byte';
import JumpDestination from '@/services/interfaces/JumpDestination';

function bytesToString(bytes: Array<Byte>): string {
  const byteStrings: Array<string> = Array(bytes.length);
  bytes.forEach((byte, index) => {
    byteStrings[index] = byte.content;
  });
  return byteStrings.join(' ');
}

function printMemoryLineAddress(memoryLine: MemoryDataLine): string {
  return `[0x${memoryLine.address.address}]`;
}

function printFlagsPrefix(): string {
  return 'Flags';
}

function printImmediatePrefix(): string {
  return 'Immediate';
}

function printJumpDestinationPrefix(): string {
  return 'Destination';
}

function printMemoryLineToString(memoryLine: MemoryDataLine, changedElements: Array<string>) {
  const byteString = bytesToString(memoryLine.dataBytes);
  const address = printMemoryLineAddress(memoryLine);
  changedElements.push(`${address}: ${byteString}`);
}

function printRegisterToString(register: Register, changedElements: Array<string>) {
  const byteString = bytesToString(register.content);
  changedElements.push(`${register.name}: ${byteString}`);
}

function printFlagsToString(flags: Array<Flag>, changedElements: Array<string>) {
  const flagStrings: Array<string> = [];
  flags.forEach((flag) => {
    flagStrings.push(`${flag.name}: ${flag.content.content}`);
  });
  const flagsPrefix = printFlagsPrefix();
  changedElements.push(`${flagsPrefix}: ${flagStrings.join(', ')}`);
}

export function printWriteAccessElementsToString(accessedElements: AccessedElements): Array<string> {
  const changedElements: Array<string> = [];
  accessedElements.memoryWriteAccess.forEach((memoryLine) => {
    printMemoryLineToString(memoryLine, changedElements);
  });
  accessedElements.registerWriteAccess.forEach((register) => {
    printRegisterToString(register, changedElements);
  });
  if (accessedElements.flagWriteAccess.length > 0) {
    printFlagsToString(accessedElements.flagWriteAccess, changedElements);
  }

  return changedElements;
}

export function getImmediateNames(immediates: Array<MemoryDataLine>): Array<string> {
  const names: Array<string> = [];
  immediates.forEach(() => {
    names.push(printImmediatePrefix());
  });
  return names;
}

export function getMemoryAccessNames(memoryLines: Array<MemoryDataLine>): Array<string> {
  const names: Array<string> = [];
  memoryLines.forEach((memoryLine) => {
    names.push(printMemoryLineAddress(memoryLine));
  });
  return names;
}

export function getRegisterNames(registers: Array<Register>): Array<string> {
  const names: Array<string> = [];
  registers.forEach((register) => {
    names.push(register.name);
  });
  return names;
}

export function getFlagsLabel(flags: Array<Flag>): Array<string> {
  const labels: Array<string> = [];
  if (flags.length > 0) {
    labels.push(printFlagsPrefix());
  }
  return labels;
}

export function getJumpLabel(jumpDestinations: Array<JumpDestination>): Array<string> {
  const labels: Array<string> = [];
  if (jumpDestinations.length > 0) {
    labels.push(printJumpDestinationPrefix());
  }
  return labels;
}

/* SPDX-License-Identifier: GPL-2.0-only */
/*
 * CPUSim
 *
 * Copyright © 2022 by Michael Schneider <michael.schneider@hispeed.com> and Tobias Petter <tobiaspetter@chello.at>
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

import State from '@/services/interfaces/State';
import Unicorn from '@/services/emulator/emulatorService';
import JumpDestination from '@/services/interfaces/JumpDestination';
import dataStringsToBytes from '@/services/dataServices/byteService';
import InstructionPointer from '@/services/interfaces/InstructionPointer';
import MemoryDataLine from '@/services/interfaces/MemoryDataLine';
import getInstructionPointer from '@/services/dataServices/instructionPointerService';

export function immediateToBytes(address: string, locationIdPrefix: string) {
  const half = Math.ceil(address.length / 2);
  const firstHalf = address.slice(0, half);
  const secondHalf = address.slice(-half);

  const immediateStringArray: Array<string> = [];
  immediateStringArray.push(firstHalf, secondHalf);

  return dataStringsToBytes(immediateStringArray, 0, locationIdPrefix);
}

export function extractAddressAsString(addressContainer: InstructionPointer | MemoryDataLine) {
  const { address } = addressContainer.address;
  return address;
}

export default function getJumpDestinationFromJumpInstruction(state: State, ucInstance: Unicorn): Array<JumpDestination> {
  const jumpDestinations: Array<JumpDestination> = [];

  // no immediate access => can't be jump/call instruction
  if (state.currentAccessedElements.immediateAccess.length === 0) {
    return jumpDestinations;
  }

  const nextInstructionPointer = getInstructionPointer(ucInstance);
  const nextInstructionPointerAddressAsString = extractAddressAsString(nextInstructionPointer);

  const [immediateAccessAddress] = state.currentAccessedElements.immediateAccess;
  const immediateAccessAddressAsString = extractAddressAsString(immediateAccessAddress);

  // is jump/call instruction and jump/call is executed
  if (nextInstructionPointerAddressAsString === immediateAccessAddressAsString) {
    const locationPrefix = 'JumpDestination';
    const bytes = immediateToBytes(immediateAccessAddressAsString, locationPrefix);

    const jumpDestination = {
      name: locationPrefix,
      content: bytes,
    };

    jumpDestinations.push(jumpDestination);
  }

  return jumpDestinations;
}

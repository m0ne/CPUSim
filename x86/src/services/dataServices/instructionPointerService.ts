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

import Unicorn from '@/services/emulator/emulatorService';
import InstructionPointer from '@/services/interfaces/InstructionPointer';
import uInt8ArrayToHexStringArray from '@/services/helper/uInt8ArrayHelper';
import { RegisterID } from '@/services/emulator/emulatorEnums';
import Instruction from '@/services/interfaces/Instruction';

function getInstructionPointerRegisterString(unicornInstance: Unicorn): string {
  let shortenAddressString: Array<string> = [];
  try {
    const hexStrings = uInt8ArrayToHexStringArray(unicornInstance.register_read(RegisterID.EIP));
    shortenAddressString = hexStrings.slice(0, 2).reverse();
  } catch (err) {
    throw new Error(`Instruction Pointer could not be read : ${err}`);
  }
  return shortenAddressString.join('');
}

export function calculateNextInstructionPointer(currentInstruction: Instruction, instructionPointer: InstructionPointer) {
  const { length } = currentInstruction;
  const currentInstructionPointer = instructionPointer.address;

  const newInstructionPointerAddressAsInt = parseInt(currentInstructionPointer.address, 16) + length;
  const newInstructionPointerAddressAsString = newInstructionPointerAddressAsInt.toString(16);

  const newInstructionPointerAddressAsStringPadded = newInstructionPointerAddressAsString.padStart(4, '0');

  return {
    address: {
      address: newInstructionPointerAddressAsStringPadded,
    },
  };
}

export default function getInstructionPointer(unicornInstance: Unicorn): InstructionPointer {
  return {
    address: {
      address: getInstructionPointerRegisterString(unicornInstance),
    },
  };
}

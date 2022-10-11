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

import { RegisterID } from '@/services/emulator/emulatorEnums';
import Unicorn from '@/services/emulator/emulatorService';
import Disassembler from '@/services/disassembler/disassemblerService';
import { FlagID } from '@/services/interfaces/Flag';
import Program from '@/services/interfaces/Program';

const memoryStartAddress = 0x0000;
const stackPointerPosition = [0x00, 0x03];
const memorySizeInBytes = 4 * 1024;
const registers: Array<RegisterID> = [RegisterID.RAX, RegisterID.RBX, RegisterID.RBP, RegisterID.RSP];
const flags: Array<FlagID> = [FlagID.CF, FlagID.OF, FlagID.ZF, FlagID.SF];

let ucInstance: Unicorn;
const disassemblerInstance = new Disassembler();

function codeAsNumberArray(code: string): Array<number> {
  const stringArray = code.split(',');
  return stringArray.map((value) => parseInt(value, 16));
}

function setStackAndBasePointer() {
  ucInstance.register_write(RegisterID.RSP, stackPointerPosition);
  ucInstance.register_write(RegisterID.RBP, stackPointerPosition);
}

async function initEmulator(code: Array<number>): Promise<void> {
  ucInstance = new Unicorn();
  try {
    await ucInstance.initialiseEmulator();
    ucInstance.memory_map(memoryStartAddress, memorySizeInBytes, ucInstance.uc.PROT_ALL);
    ucInstance.memory_write(memoryStartAddress, code);
    setStackAndBasePointer();
    await disassemblerInstance.initialiseDisassembler();
  } catch (e) {
    /* eslint no-console: ["error", { allow: ["warn"] }] */
    console.warn(e);
  }
}

export default async function startEmulator(codeInput: string | number[]): Promise<Program> {
  let code: number[];
  if (typeof codeInput === 'string') {
    code = codeAsNumberArray(codeInput);
  } else {
    code = codeInput;
  }

  return initEmulator(code)
    .then(() => {
      const program: Program = {
        ucInstance,
        disassemblerInstance,
        memoryAddress: memoryStartAddress,
        memorySizeInBytes,
        registersToShow: registers,
        flagsToShow: flags,
        codeAddress: memoryStartAddress,
        codeSizeInBytes: code.length,
        code,
      };
      return program;
    });
}

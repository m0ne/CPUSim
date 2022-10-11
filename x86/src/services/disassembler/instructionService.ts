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

import Instruction from '@/services/interfaces/Instruction';
import { byteArrayToUInt8Array } from '@/services/dataServices/byteService';
import Program from '@/services/interfaces/Program';
import { getFirstInstruction } from '@/services/nasm/ndisasm';
import isJmpCallInstructionWORKAROUND from '@/services/disassembler/jumpInstructionService';

async function injectNasmAssemblyIntoInstruction(instruction: Instruction): Promise<Instruction> {
  const injectedInstruction = instruction;

  try {
    const ndisasmInstruction = await getFirstInstruction(byteArrayToUInt8Array(instruction.content));
    injectedInstruction.assemblyInterpretation = ndisasmInstruction;
  } catch (e) {
    throw new Error(`Injecting of Instruction failed: ${e}`);
  }
  return injectedInstruction;
}

export default async function getCurrentInstruction(program: Program, nextBytesOfCode: Uint8Array, instructionAddressHex: string): Promise<Instruction> {
  let instructionsOfCapstone: Array<Instruction> = [];
  const instructionAddress: number = parseInt(instructionAddressHex, 16);
  try {
    instructionsOfCapstone = program.disassemblerInstance.disassemble(nextBytesOfCode, instructionAddress, 1);
  } catch (e) {
    throw new Error(`Disassemble of Current Instruction failed: ${e}`);
  }
  if (isJmpCallInstructionWORKAROUND(instructionsOfCapstone[0].operands.opcode)) {
    return instructionsOfCapstone[0];
  }
  return injectNasmAssemblyIntoInstruction(instructionsOfCapstone[0]);
}

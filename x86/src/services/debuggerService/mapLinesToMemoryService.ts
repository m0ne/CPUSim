/* SPDX-License-Identifier: GPL-2.0-only */

/* CPUSim
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

import EditorLine from '@/services/interfaces/codeEditor/EditorLine';
import getInstructionPointer, {
  calculateNextInstructionPointer,
} from '@/services/dataServices/instructionPointerService';
import { readNextInstructionBytesFromMemory } from '@/services/dataServices/memoryService';
import getCurrentInstruction from '@/services/disassembler/instructionService';
import Program from '@/services/interfaces/Program';
import addHexAndIntToStringService from '@/services/debuggerService/addHexAndIntToStringService';
import Instruction from '../interfaces/Instruction';

export default async function mapLinesToMemory(program: Program): Promise<Map<number, EditorLine>> {
  const codeMemorySize = program.codeSizeInBytes;
  let positionInCodeMemory = 0;
  const editorLinesMap = new Map<number, EditorLine>();
  let instructionPointer = getInstructionPointer(program.ucInstance);
  let instructionAddress = instructionPointer.address.address;
  let i = 1;

  while (positionInCodeMemory < codeMemorySize) {
    let currentInstruction: Instruction;
    const nextInstructionBytes: Uint8Array = readNextInstructionBytesFromMemory(instructionAddress, program);

    try {
      currentInstruction = await getCurrentInstruction(program, nextInstructionBytes, instructionAddress);
    } catch (error: unknown) {
      // eslint-disable-next-line no-param-reassign
      program.codeSizeInBytes = positionInCodeMemory;
      return editorLinesMap;
    }

    const memoryAddressUntilAsString = addHexAndIntToStringService(currentInstruction.address.address, (currentInstruction.length - 1));
    const memoryAddressUntil = {
      address: memoryAddressUntilAsString,
    };

    const currentLine = {
      line: i,
      memoryAddressFrom: currentInstruction.address,
      memoryAddressUntil,
      instruction: currentInstruction,
    };
    editorLinesMap.set(i, currentLine);
    instructionPointer = calculateNextInstructionPointer(currentInstruction, instructionPointer);
    instructionAddress = instructionPointer.address.address;

    positionInCodeMemory += currentInstruction.length;
    i += 1;
  }
  return editorLinesMap;
}

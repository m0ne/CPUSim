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

import { expect } from 'chai';
import { RegisterID } from '@/services/emulator/emulatorEnums';
import Unicorn from '@/services/emulator/emulatorService';
import Disassembler from '@/services/disassembler/disassemblerService';
import getStateWithEmptyInstruction from '@/services/dataServices/fillDataService';
import { getMemory } from '@/services/dataServices/memoryService';
import getCurrentInstruction from '@/services/disassembler/instructionService';
import MemoryData from '@/services/interfaces/MemoryData';
import Register from '@/services/interfaces/Register';
import Program from '@/services/interfaces/Program';
import { getFlags, getRegisters } from '@/services/dataServices/registerService';
import getInstructionPointer from '@/services/dataServices/instructionPointerService';
import {
  testDataCurrentInstruction, testDataFlags,
  testDataInstructionPointer, testDataInstructions,
  testDataMemory,
  testDataRegisters, testDataState,
} from './testDataCurrentState';
import {
  startSimpleTestProgram,
  writeTestDataInRegister,
} from './testEmulator';

const expectedMemory: MemoryData = testDataMemory;
const expectedRegister: Array<Register> = testDataRegisters;
const expectedInstructionPointer = testDataInstructionPointer;
const expectedCurrentInstruction = testDataCurrentInstruction;
const expectedInstructions = testDataInstructions;
const expectedState = testDataState;
const expectedFlags = testDataFlags;

let program: Program;

describe('Create state from emulator', async () => {
  const ucInstance = new Unicorn();
  const disassemblerInstance = new Disassembler();

  await startSimpleTestProgram(ucInstance, disassemblerInstance)
    .then(async (prog) => {
      program = prog;
      program.registersToShow = [RegisterID.RAX, RegisterID.RBX, RegisterID.RCX];
      writeTestDataInRegister(ucInstance);
      it('succeeds if register created', () => {
        const testRegister = getRegisters(ucInstance, program.registersToShow);
        expect(testRegister)
          .to
          .eql(expectedRegister);
      });
      it('succeeds if memory created', () => {
        const testMemory = getMemory(program);
        expect(testMemory)
          .to
          .eql(expectedMemory);
      });
      it('succeeds if instructions disassebled and created', () => {
        const code = [
          0x48, 0x01, 0xC3, 0x48, 0x01, 0xC3,
        ];
        const instructions = disassemblerInstance.disassemble(code, 0x0000, 0);
        expect(instructions)
          .to
          .eql(expectedInstructions);
      });
      it('succeeds if instructionPointer created', () => {
        const testInstructionPointer = getInstructionPointer(ucInstance);
        expect(testInstructionPointer)
          .to
          .eql(expectedInstructionPointer);
      });
      it('succeeds if current instruction created', async () => {
        const instructionPointer = getInstructionPointer(ucInstance);
        const bytes: Uint8Array = ucInstance.memory_read(0, 6);
        const testCurrentInstruction = await getCurrentInstruction(program, bytes, instructionPointer.address.address);
        expect(testCurrentInstruction)
          .to
          .eql(expectedCurrentInstruction);
      });
      it('succeeds if flags created', () => {
        const testFlags = getFlags(ucInstance, program.flagsToShow);
        expect(testFlags)
          .to
          .eql(expectedFlags);
      });
      it('succeeds if state created', () => {
        const testState = getStateWithEmptyInstruction(program);
        expect(testState)
          .to
          .eql(expectedState);
      });
    });
});

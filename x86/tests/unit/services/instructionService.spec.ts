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
import getCurrentInstruction from '@/services/disassembler/instructionService';
import Disassembler from '@/services/disassembler/disassemblerService';
import Unicorn from '@/services/emulator/emulatorService';
import {
  testDataCurrentInstruction,
  testDataInstructionPointer,
} from './testDataCurrentState';
import {
  closeEmulator,
  startSimpleTestProgram,
} from './testEmulator';

describe('Get current Instruction from Instruction Pointer', () => {
  it('succeeds if instruction found', async () => {
    const ucInstance = new Unicorn();
    const disassemblerInstance = new Disassembler();
    await startSimpleTestProgram(ucInstance, disassemblerInstance).then(async (program) => {
      const bytes: Uint8Array = ucInstance.memory_read(0, 6);

      const currentInstruction = await getCurrentInstruction(program, bytes, testDataInstructionPointer.address.address);
      expect(currentInstruction).to.be.eql(testDataCurrentInstruction);
      closeEmulator(program);
    });
  });
});

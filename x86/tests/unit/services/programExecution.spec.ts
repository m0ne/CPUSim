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
import Unicorn from '@/services/emulator/emulatorService';
import Disassembler from '@/services/disassembler/disassemblerService';
import StepController from '@/services/stepController';
import Flag from '@/services/interfaces/Flag';
import {
  closeEmulator,
  startCallAndStackTestProgram,
  startFlagsTestProgram,
  stepOverFiveInstructions,
  stepOverOneInstruction,
} from './testEmulator';

describe('Call and Stack', () => {
  it('succeeds if Stackpointer in byteinformation created', async () => {
    const ucInstance = new Unicorn();
    const disassemblerInstance = new Disassembler();

    await startCallAndStackTestProgram(ucInstance, disassemblerInstance).then(async (program) => {
      const testController = new StepController(program);
      expect(testController.getState().byteInformation.stackPointerInformation.pointerAddress).to.eql(0);
      expect(testController.getState().byteInformation.stackPointerInformation.pointerBytes).to.eql([0]);
      closeEmulator(program);
    });
  });
  it('succeeds if Stackpointer in byteinformation updated', async () => {
    const ucInstance = new Unicorn();
    const disassemblerInstance = new Disassembler();

    await startCallAndStackTestProgram(ucInstance, disassemblerInstance).then(async (program) => {
      const testController = new StepController(program);
      await stepOverOneInstruction(testController);
      await stepOverOneInstruction(testController);
      await testController.nextStep();
      await testController.nextStep();
      await testController.nextStep();
      expect(testController.getState().byteInformation.stackPointerInformation.pointerAddress).to.eql(0x0110);
      expect(testController.getState().byteInformation.stackPointerInformation.pointerBytes).to.eql([0x0110, 0x0111, 0x0112, 0x0113, 0x0114, 0x0115, 0x0116, 0x0117]);
      closeEmulator(program);
    });
  });
  it('succeeds if BasePointer in byteinformation created', async () => {
    const ucInstance = new Unicorn();
    const disassemblerInstance = new Disassembler();

    await startCallAndStackTestProgram(ucInstance, disassemblerInstance).then(async (program) => {
      const testController = new StepController(program);
      expect(testController.getState().byteInformation.basePointerInformation.pointerAddress).to.eql(0);
      expect(testController.getState().byteInformation.basePointerInformation.pointerBytes).to.eql([0]);
      closeEmulator(program);
    });
  });
});

describe('Flags', async () => {
  it('succeeds if ZF set', async () => {
    const expectedFlagsZF: Array<Flag> = [
      { name: 'CF', content: { locationId: 'CF_0', content: '0' } },
      { name: 'OF', content: { locationId: 'OF_0', content: '0' } },
      { name: 'ZF', content: { locationId: 'ZF_0', content: '1' } },
      { name: 'SF', content: { locationId: 'SF_0', content: '0' } },
    ];
    const ucInstance = new Unicorn();
    const disassemblerInstance = new Disassembler();
    await startFlagsTestProgram(ucInstance, disassemblerInstance).then(async (program) => {
      const testController = new StepController(program);
      await testController.nextStep();
      await testController.nextStep();
      await testController.nextStep();
      expect(testController.getState().flags).to.eql(expectedFlagsZF);
      closeEmulator(program);
    });
  });
  it('succeeds if SF set', async () => {
    const expectedFlagsSF: Array<Flag> = [
      { name: 'CF', content: { locationId: 'CF_0', content: '0' } },
      { name: 'OF', content: { locationId: 'OF_0', content: '0' } },
      { name: 'ZF', content: { locationId: 'ZF_0', content: '0' } },
      { name: 'SF', content: { locationId: 'SF_0', content: '1' } },
    ];
    const ucInstance = new Unicorn();
    const disassemblerInstance = new Disassembler();
    await startFlagsTestProgram(ucInstance, disassemblerInstance).then(async (program) => {
      const testController = new StepController(program);
      await stepOverOneInstruction(testController);
      await testController.nextStep();
      await testController.nextStep();
      await testController.nextStep();
      expect(testController.getState().flags).to.eql(expectedFlagsSF);
      closeEmulator(program);
    });
  });
  it('succeeds if CF set', async () => {
    const expectedFlagsCF: Array<Flag> = [
      { name: 'CF', content: { locationId: 'CF_0', content: '1' } },
      { name: 'OF', content: { locationId: 'OF_0', content: '0' } },
      { name: 'ZF', content: { locationId: 'ZF_0', content: '0' } },
      { name: 'SF', content: { locationId: 'SF_0', content: '1' } },
    ];
    const ucInstance = new Unicorn();
    const disassemblerInstance = new Disassembler();
    await startFlagsTestProgram(ucInstance, disassemblerInstance).then(async (program) => {
      const testController = new StepController(program);
      await stepOverOneInstruction(testController);
      await stepOverOneInstruction(testController);
      await testController.nextStep();
      await testController.nextStep();
      await testController.nextStep();
      expect(testController.getState().flags).to.eql(expectedFlagsCF);
      closeEmulator(program);
    });
  });
  it('succeeds if OF set', async () => {
    const expectedFlagsOF: Array<Flag> = [
      { name: 'CF', content: { locationId: 'CF_0', content: '0' } },
      { name: 'OF', content: { locationId: 'OF_0', content: '1' } },
      { name: 'ZF', content: { locationId: 'ZF_0', content: '0' } },
      { name: 'SF', content: { locationId: 'SF_0', content: '1' } },
    ];
    const ucInstance = new Unicorn();
    const disassemblerInstance = new Disassembler();
    await startFlagsTestProgram(ucInstance, disassemblerInstance).then(async (program) => {
      const testController = new StepController(program);
      await stepOverFiveInstructions(testController);
      await testController.nextStep();
      await testController.nextStep();
      await testController.nextStep();
      expect(testController.getState().flags).to.eql(expectedFlagsOF);
      closeEmulator(program);
    });
  });
});

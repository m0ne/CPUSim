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
import MemoryData from '@/services/interfaces/MemoryData';
import Register from '@/services/interfaces/Register';
import Unicorn from '@/services/emulator/emulatorService';
import Disassembler from '@/services/disassembler/disassemblerService';
import StepController from '@/services/stepController';
import { Step } from '@/services/interfaces/CpuCycleStep';
import {
  testDataCurrentInstruction,
  testDataExecuteInstructionInformation,
  testDataGetInstructionInformation,
  testDataGetInstructionSecondInformation,
  testDataIncrementInstructionInformation,
  testDataInstructionPointer,
  testDataMemory,
  testDataRegisters,
} from './testDataCurrentState';
import {
  testDataNextStateCurrentInstruction,
  testDataNextStateInstructionPointer,
  testDataNextStateRegisters,
} from './testDataNextState';
import {
  closeEmulator,
  startSimpleTestProgram, stepOverOneInstruction,
} from './testEmulator';

const expectedMemory: MemoryData = testDataMemory;
const expectedRegister: Array<Register> = testDataRegisters.slice(0, 2);
const expectedRegisterThirdStep: Array<Register> = testDataNextStateRegisters.slice(0, 2);
const expectedInstructionPointer = testDataInstructionPointer;
const expectedInstructionPointerSecondStep = testDataNextStateInstructionPointer;
const expectedCurrentInstruction = testDataCurrentInstruction;
const expectedCurrentInstructionRepeat = testDataNextStateCurrentInstruction;

describe('First Step (Get Instruction) ', async () => {
  const ucInstance = new Unicorn();
  const disassemblerInstance = new Disassembler();

  await startSimpleTestProgram(ucInstance, disassemblerInstance).then(async (program) => {
    const testController = new StepController(program);
    await testController.nextStep();
    const currentState = testController.getState();

    closeEmulator(program);
    it('succeeds if current step updated after first step', () => {
      expect(testController.getCurrentStep().numberInCycleSequence).to.eql(Step.INCREASE_IP);
    });
    it('succeeds if register created after first step', () => {
      expect(currentState.registers).to.eql(expectedRegister);
    });
    it('succeeds if memory created after first step', () => {
      expect(currentState.memoryData).to.eql(expectedMemory);
    });
    it('succeeds if instructionPointer created after first step', () => {
      expect(currentState.instructionPointer).to.eql(expectedInstructionPointer);
    });
    it('succeeds if currentInstruction created after first step', () => {
      expect(currentState.currentInstruction).to.eql(expectedCurrentInstruction);
    });
    it('succeeds if pointerInformation updated after first step', () => {
      expect(currentState.byteInformation).to.eql(testDataGetInstructionInformation);
    });
  });
});

describe('Second Step (Increment Instruction Pointer)', async () => {
  const ucInstance = new Unicorn();
  const disassemblerInstance = new Disassembler();

  await startSimpleTestProgram(ucInstance, disassemblerInstance).then(async (program) => {
    const testController = new StepController(program);
    await testController.nextStep();
    await testController.nextStep();
    const currentState = testController.getState();
    closeEmulator(program);
    it('succeeds if currentStep updated after second step', () => {
      expect(testController.getCurrentStep().numberInCycleSequence).to.eql(Step.EXECUTE_INSTRUCTION);
    });
    it('succeeds if registers not updated after second step', () => {
      expect(currentState.registers).to.not.equal(expectedRegisterThirdStep);
    });
    it('succeeds if instructionPointer is updated after second step', () => {
      expect(currentState.instructionPointer).to.eql(expectedInstructionPointerSecondStep); // FIX
    });
    it('succeeds if currentInstruction not updated after second step', () => {
      expect(currentState.currentInstruction).to.eql(expectedCurrentInstruction);
    });
    it('succeeds if pointerInformation updated after second step', () => {
      expect(currentState.byteInformation).to.eql(testDataIncrementInstructionInformation);
    });
  });
});

describe('Third Step (Execute Instruction)', async () => {
  const ucInstance = new Unicorn();
  const disassemblerInstance = new Disassembler();

  await startSimpleTestProgram(ucInstance, disassemblerInstance).then(async (program) => {
    const testController = new StepController(program);
    await stepOverOneInstruction(testController);
    const currentState = testController.getState();
    closeEmulator(program);
    it('succeeds if currentStep updated after third step', () => {
      expect(testController.getCurrentStep().numberInCycleSequence).to.eql(Step.GET_INSTRUCTION);
    });
    it('succeeds if register updated after third step', () => {
      expect(currentState.registers).to.eql(expectedRegisterThirdStep);
    });
    it('succeeds if instructionPointer is not updated after third step', () => {
      expect(currentState.instructionPointer).to.eql(expectedInstructionPointerSecondStep); // FIX
    });
    it('succeeds if currentInstruction not updated after third step', () => {
      expect(currentState.currentInstruction).to.eql(expectedCurrentInstruction);
    });
    it('succeeds if pointerInformation updated after third step', () => {
      expect(currentState.byteInformation).to.eql(testDataExecuteInstructionInformation);
    });
  });
});

describe('Repeat first step (Get Instruction)', async () => {
  const ucInstance = new Unicorn();
  const disassemblerInstance = new Disassembler();

  await startSimpleTestProgram(ucInstance, disassemblerInstance).then(async (program) => {
    const testController = new StepController(program);
    await stepOverOneInstruction(testController);
    await testController.nextStep();
    const currentState = testController.getState();
    closeEmulator(program);
    it('succeeds if currentStep updated after repetition of first step', () => {
      expect(testController.getCurrentStep().numberInCycleSequence).to.eql(Step.INCREASE_IP);
    });
    it('succeeds if registers not updated after repetition of first step', () => {
      expect(currentState.registers).to.eql(expectedRegisterThirdStep);
    });
    it('succeeds if memory not updated after repetition of first step', () => {
      expect(currentState.memoryData).to.eql(expectedMemory);
    });
    it('succeeds if instructionPointer not updated after repetition of first step', () => {
      expect(currentState.instructionPointer).to.eql(expectedInstructionPointerSecondStep);
    });
    it('succeeds if currentInstruction updated after repetition of first step', () => {
      expect(currentState.currentInstruction).to.eql(expectedCurrentInstructionRepeat);
    });
    it('succeeds if pointerInformation updated after repetition of first step', () => {
      expect(currentState.byteInformation).to.eql(testDataGetInstructionSecondInformation);
    });
  });
});

describe('Indicates last step', () => {
  it('succeeds if last step is not indicated', async () => {
    const ucInstance = new Unicorn();
    const disassemblerInstance = new Disassembler();

    await startSimpleTestProgram(ucInstance, disassemblerInstance).then(async (program) => {
      const testController = new StepController(program);
      await testController.nextStep();
      await testController.nextStep();
      expect(await testController.nextStep()).to.be.equal(true);
      closeEmulator(program);
    });
  });
  it('succeeds if last step is indicated', async () => {
    const ucInstance = new Unicorn();
    const disassemblerInstance = new Disassembler();

    await startSimpleTestProgram(ucInstance, disassemblerInstance).then(async (program) => {
      const testController = new StepController(program);
      await stepOverOneInstruction(testController);
      await testController.nextStep();
      await testController.nextStep();
      expect(await testController.nextStep()).to.be.equal(false);
      closeEmulator(program);
    });
  });
});

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

import getStateWithEmptyInstruction from '@/services/dataServices/fillDataService';
import State from '@/services/interfaces/State';
import CpuCycleStep, { Step } from '@/services/interfaces/CpuCycleStep';
import getCurrentInstruction from '@/services/disassembler/instructionService';
import Program from '@/services/interfaces/Program';
import {
  changeRegistersToLongSizeRegisters,
} from '@/services/dataServices/registerAssignmentService';
import getChangeHistory, {
  addMemoryAccessHook,
  getEmptyAccessedElements,
  getNewRegistersToShow,
  getReadAccessElements,
  getWriteAccessElements,
} from '@/services/dataServices/accessedElementsService';
import {
  animateGetInstruction,
  animateIncreaseInstructionPointer,
  animateInstructionGeneric,
  changeAnimationSpeed,
} from '@/services/animationService/animationController';
import { readNextInstructionBytesFromMemory } from '@/services/dataServices/memoryService';
import { getRegisters } from '@/services/dataServices/registerService';
import { calculateNextInstructionPointer } from '@/services/dataServices/instructionPointerService';
import rfdc from 'rfdc';
import ReverseDebugger from '@/services/reverseStepController';

export default class StepController {
  private reverseDebugger: ReverseDebugger;

  state: State;

  private program: Program;

  private steps: Array<CpuCycleStep> = [{
    name: 'Get Instruction',
    numberInCycleSequence: Step.GET_INSTRUCTION,
    animate: true,
  }, {
    name: 'Increment Instr. Pointer',
    numberInCycleSequence: Step.INCREASE_IP,
    animate: true,
  }, {
    name: 'Execute Instruction',
    numberInCycleSequence: Step.EXECUTE_INSTRUCTION,
    animate: true,
  }];

  private currentStep: CpuCycleStep;

  constructor(program: Program) {
    if (this.steps.length > 0) {
      this.currentStep = this.steps[Step.GET_INSTRUCTION];
    } else {
      throw new Error('Steps Array is empty.');
    }
    try {
      StepController.validateProgram(program);
      this.program = program;
      this.program.registersToShow = changeRegistersToLongSizeRegisters(this.program.registersToShow);
      const emptyState = getStateWithEmptyInstruction(program);
      this.reverseDebugger = new ReverseDebugger(emptyState, program, this.steps);
      this.program = this.reverseDebugger.getProgramProxy();
      this.state = this.reverseDebugger.getStateProxy();
    } catch (err: unknown) {
      if (err instanceof Error) {
        throw new Error(`State could not be created: ${err.message}`);
      } else {
        throw new Error('State could not be created');
      }
    }
    addMemoryAccessHook(this.state, this.program);
  }

  private static validateProgram(program: Program) {
    const highestMemoryAddress = 0xFFFF;
    if (program.memoryAddress < 0 || program.memoryAddress > highestMemoryAddress) {
      throw new Error(`Memory Address ${program.memoryAddress.toString(16)} is not valid.`);
    }
    if (program.memorySizeInBytes <= 0) {
      throw new Error(`Memory Size ${program.memorySizeInBytes} is not valid.`);
    }
    if (program.codeAddress < 0 || program.codeAddress > highestMemoryAddress) {
      throw new Error(`Code Address ${program.codeAddress.toString(16)} is not valid.`);
    }
    if (program.codeSizeInBytes <= 0) {
      throw new Error(`Code Size ${program.codeSizeInBytes} is not valid.`);
    }
    return true;
  }

  private async getInstruction() {
    try {
      const animateThisStep = this.steps[Step.GET_INSTRUCTION].animate;
      const instructionAddress = this.state.instructionPointer.address.address;
      const nextInstructionBytes: Uint8Array = readNextInstructionBytesFromMemory(instructionAddress, this.program);
      const currentInstruction = await getCurrentInstruction(this.program, nextInstructionBytes, this.state.instructionPointer.address.address);
      await animateGetInstruction(currentInstruction, this.state, animateThisStep);
      this.getAccessedElementsBeforeExecution();
      this.program.ucInstance.executeInstruction(this.state.currentInstruction);
      this.getAccessedElementsAfterExecution();
      // required to enable reverse debugger
      const byteInformationWrite = this.state.byteInformation;
      this.state.byteInformation = byteInformationWrite;
      this.currentStep = this.reverseDebugger.updateStep(this.steps[Step.INCREASE_IP]);
    } catch (err) {
      throw new Error(`Current Instruction cannot be executed: ${err}`);
    }
  }

  private getAccessedElementsBeforeExecution() {
    this.state.currentAccessedElements = getReadAccessElements(this.state, this.program.ucInstance);
    this.program.registersToShow = getNewRegistersToShow(this.state.currentInstruction.operands, this.program.registersToShow);
    this.state.registers = getRegisters(this.program.ucInstance, this.program.registersToShow);
  }

  private getAccessedElementsAfterExecution() {
    this.state.currentAccessedElements = getWriteAccessElements(this.state, this.program.ucInstance);
  }

  private async executeInstruction() {
    const animateThisStep = this.steps[Step.EXECUTE_INSTRUCTION].animate;
    await animateInstructionGeneric(this.state, this.program, animateThisStep)
      .then(() => {
        this.state.changeHistory.push(getChangeHistory(this.state.currentInstruction, this.state.currentAccessedElements));
        this.state.currentAccessedElements = getEmptyAccessedElements();

        // required to enable reverse debugger
        const changeHistoryWrite = this.state.changeHistory;
        const byteInformationWrite = this.state.byteInformation;
        this.state.byteInformation = byteInformationWrite;
        this.state.changeHistory = changeHistoryWrite;

        this.currentStep = this.reverseDebugger.updateStep(this.steps[Step.GET_INSTRUCTION]);
      });
  }

  private async increaseIp() {
    const nextInstructionPointer = calculateNextInstructionPointer(this.state.currentInstruction, this.state.instructionPointer);
    const animateThisStep = this.steps[Step.INCREASE_IP].animate;
    await animateIncreaseInstructionPointer(nextInstructionPointer, this.state, animateThisStep);
    // required to enable reverse debugger
    const byteInformationWrite = this.state.byteInformation;
    this.state.byteInformation = byteInformationWrite;

    this.currentStep = this.reverseDebugger.updateStep(this.steps[Step.EXECUTE_INSTRUCTION]);
  }

  private isInCodeRange(instructionAddress: number): boolean {
    return instructionAddress >= this.state.byteInformation.code.from && instructionAddress < this.state.byteInformation.code.to;
  }

  public isInitialStep() {
    return this.reverseDebugger.isInitialStep();
  }

  public isLastStep() {
    const instructionPointer = this.state.instructionPointer.address.address;
    const instructionAddressNumber = parseInt(instructionPointer, 16);
    return (!this.isInCodeRange(instructionAddressNumber));
  }

  async previousStep() {
    const {
      modifiedState, modifiedProgram, modifiedStep,
    } = await this.reverseDebugger.previousStep(this.state, this.program);

    this.currentStep = modifiedStep;
    this.state = modifiedState;
    this.program = modifiedProgram;
  }

  async nextStep(): Promise<boolean> {
    switch (this.currentStep.numberInCycleSequence) {
      case Step.GET_INSTRUCTION: {
        try {
          await this.getInstruction();
        } catch (e) {
          /* eslint no-console: ["error", { allow: ["warn"] }] */
          console.warn(e);
          return false;
        }
        break;
      }
      case Step.INCREASE_IP: {
        await this.increaseIp();
        break;
      }
      case Step.EXECUTE_INSTRUCTION: {
        await this.executeInstruction();
        this.reverseDebugger.increaseNrOfInstructions();
        if (this.isLastStep()) {
          return false;
        }
        break;
      }
      default:
        throw new Error('State does not exist');
    }
    return true;
  }

  getState(): State {
    return this.state;
  }

  getProgram(): Program {
    return this.program;
  }

  getCurrentStep(): CpuCycleStep {
    return this.currentStep;
  }

  changeStepAnimate(step: number) {
    const { animate } = this.steps[step];
    this.steps[step].animate = !animate;
  }

  turnOfAllAnimations() {
    const clone = rfdc();
    const savedAnimations = clone(this.steps);
    for (let i = 0; i < this.steps.length; i += 1) {
      this.steps[i].animate = false;
    }

    return savedAnimations;
  }

  setSteps(steps: Array<CpuCycleStep>) {
    this.steps = steps;
  }

  // eslint-disable-next-line class-methods-use-this
  async changeAnimationSpeed(speed: number) {
    await changeAnimationSpeed(speed);
  }

  getAllSteps(): Array<CpuCycleStep> {
    return this.steps;
  }
}

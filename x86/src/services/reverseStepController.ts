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

import rfdc from 'rfdc';
import Version from '@/services/interfaces/reverseDebugger/Version';
import TransactionStore from '@/services/interfaces/reverseDebugger/TransactionStore';
import State, { ChangeHistory, ValueOfState } from '@/services/interfaces/State';
import Program, { ValueOfProgram } from '@/services/interfaces/Program';
import getStateWithEmptyInstruction from '@/services/dataServices/fillDataService';
import ProgramTransactions from '@/services/interfaces/reverseDebugger/ProgramTransactions';
import CpuCycleStep from '@/services/interfaces/CpuCycleStep';
import startEmulator from '@/services/startSimulatorService';
import { changeRegistersToLongSizeRegisters } from '@/services/dataServices/registerAssignmentService';
import StateTransactions from '@/services/interfaces/reverseDebugger/StateTransactions';
import MemoryData from '@/services/interfaces/MemoryData';
import Instruction from '@/services/interfaces/Instruction';
import Register from '@/services/interfaces/Register';
import InstructionPointer from '@/services/interfaces/InstructionPointer';
import Flag from '@/services/interfaces/Flag';
import AccessedElements from '@/services/interfaces/AccessedElements';
import ByteInformation, { PointerInformation } from './interfaces/ByteInformation';

export default class ReverseDebugger {
  private clone = rfdc();

  private readonly steps: Array<CpuCycleStep>;

  private readonly versioning: Version;

  private readonly transactionStore: TransactionStore;

  private readonly programProxy: Program;

  private readonly stateProxy: State;

  constructor(emptyState: State, initialProgram: Program, steps: Array<CpuCycleStep>) {
    this.steps = steps;
    this.versioning = {
      step: 0,
      nrOfInstructions: 1,
    };

    this.transactionStore = this.populateTransactionStore(emptyState, initialProgram);

    this.programProxy = this.attachProgram(initialProgram);
    this.stateProxy = this.attachState(emptyState);
  }

  public getStateProxy() {
    return this.stateProxy;
  }

  public getProgramProxy() {
    return this.programProxy;
  }

  public isInitialStep() {
    return this.versioning.step === 0 && this.versioning.nrOfInstructions === 1;
  }

  // Typescript doesn't support Array.prototype.at() yet
  // https://stackoverflow.com/questions/68782029/how-to-use-stage-3-features-in-typescript
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  static getLastEntry = (array: Array) => {
    const { length } = array;
    return array[length - 1];
  };

  public decreaseNrOfInstructions() {
    this.versioning.nrOfInstructions -= 1;
  }

  public increaseNrOfInstructions() {
    this.versioning.nrOfInstructions += 1;
  }

  public updateStep = (newStep: CpuCycleStep) => {
    this.versioning.step = newStep.numberInCycleSequence;
    return newStep;
  };

  private calculatePreviousStep() {
    let newStep: CpuCycleStep;
    const nr = this.versioning.step - 1;
    if (nr < 0) {
      this.decreaseNrOfInstructions();
      const nrOfSteps = this.steps.length;
      newStep = this.updateStep(this.steps[nrOfSteps - 1]);
    } else {
      newStep = this.updateStep(this.steps[nr]);
    }
    return newStep;
  }

  // eslint-disable-next-line class-methods-use-this
  private populateTransactionStore = (state: State, program: Program) => {
    const versioning: Version = {
      step: 0,
      nrOfInstructions: 0,
    };

    const initialTransactions: Partial<StateTransactions> = {};
    Object.entries(state)
      .forEach(([item]) => {
        Object.assign(initialTransactions, {
          [item]: Array({
            version: versioning,
            value: getStateWithEmptyInstruction(program)[item as keyof State],
          }),
        });
      });

    const initialProgram = {
      version: versioning,
      value: program,
    };

    const finalStateTransactions: TransactionStore = {
      stateTransactions: initialTransactions as StateTransactions,
      programStates: [initialProgram],
    };

    return finalStateTransactions;
  };

  private async buildProgram(modifiedProgram: Program) {
    const machineCode = modifiedProgram.code;
    const program = await startEmulator(machineCode);
    program.registersToShow = changeRegistersToLongSizeRegisters(program.registersToShow);

    const states = this.transactionStore.stateTransactions.currentInstruction;
    const { length } = states;

    for (let i = 1; i < length; i += 1) {
      program.ucInstance.executeInstruction((states[i].value));
    }

    const savedProgram = ReverseDebugger.getLastEntry(this.transactionStore.programStates).value;

    const {
      registersToShow,
      flagsToShow,
      memoryAddress,
      memorySizeInBytes,
      codeAddress,
      codeSizeInBytes,
      code,
    } = savedProgram;

    const newProgram: Program = {
      ucInstance: program.ucInstance,
      disassemblerInstance: program.disassemblerInstance,
      registersToShow,
      flagsToShow,
      memoryAddress,
      memorySizeInBytes,
      codeAddress,
      codeSizeInBytes,
      code,
    };

    return this.attachProgram(newProgram);
  }

  static compareVersions = (version: Version, versioning: Version) => {
    const regular: boolean = (versioning.nrOfInstructions === version.nrOfInstructions) && (versioning.step <= version.step);
    const isWrapAround: boolean = versioning.nrOfInstructions < version.nrOfInstructions;

    return regular || isWrapAround;
  };

  private loadTransactionStore(state: State) {
    let byteInformation = {};
    let rebuildProgram = false;

    Object.entries(this.transactionStore.stateTransactions)
      .forEach(([key, entry]) => {
        const lengthOfEntry = () => entry.length.valueOf();

        let length = 0;
        let previousLength = 1;

        while (previousLength > length) {
          previousLength = lengthOfEntry();
          const { version } = ReverseDebugger.getLastEntry(entry);

          // Estimation if we drop the value or not
          if (ReverseDebugger.compareVersions(version, this.versioning)) {
            if (entry.length !== 1) {
              if (key === 'currentInstruction') {
                rebuildProgram = true;
              }
              this.getKeyFromStateTransactions(key).pop();
            }

            if (key !== 'byteInformation') {
              state[key as keyof StateTransactions] = ReverseDebugger.getLastEntry(this.getKeyFromStateTransactions(key)).value;
              // required because proxy records new change
              this.getKeyFromStateTransactions(key).pop();
            } else {
              byteInformation = ReverseDebugger.getLastEntry(this.getKeyFromStateTransactions(key)).value;
            }
          }
          length = lengthOfEntry();
        }
      });

    const modifiedState = state;

    return {
      rebuildProgram,
      byteInformation,
      modifiedState,
    };
  }

  async cleanProgramStates() {
    const nrOfEntriesProgramStates = () => this.transactionStore.programStates.length.valueOf();
    let cleaned = false;

    let length = 0;
    let previousLength = 1;
    while (previousLength > length) {
      previousLength = nrOfEntriesProgramStates();
      const { version } = this.transactionStore.programStates[previousLength - 1];

      if (ReverseDebugger.compareVersions(version, this.versioning)) {
        if (length !== 1) {
          cleaned = true;
          this.transactionStore.programStates.pop();
        }
      }
      length = nrOfEntriesProgramStates();
    }
    return cleaned;
  }

  private static updateByteInformation(byteInformation: ByteInformation, state: State) {
    const compareViaArray = (arr1: Array<number>, arr2: Array<number>) => arr1.length === arr2.length;

    const updatePointerInformation = (oldPointer: PointerInformation, newPointer: PointerInformation) => {
      const updatedPointer = oldPointer;
      updatedPointer.pointerAddress = newPointer.pointerAddress;
      updatedPointer.pointerBytes = newPointer.pointerBytes;
    };

    if (!compareViaArray(state.byteInformation.usedBytes, byteInformation.usedBytes)) {
      state.byteInformation.usedBytes = byteInformation.usedBytes;
    }

    state.byteInformation.code = byteInformation.code;
    updatePointerInformation(state.byteInformation.instructionPointerInformation, byteInformation.instructionPointerInformation);
    updatePointerInformation(state.byteInformation.stackPointerInformation, byteInformation.stackPointerInformation);
    updatePointerInformation(state.byteInformation.basePointerInformation, byteInformation.basePointerInformation);
  }

  async previousStep(state: State, program: Program) {
    let modifiedProgram = program;
    const modifiedStep = this.calculatePreviousStep();
    const {
      rebuildProgram, byteInformation,
      modifiedState,
    } = this.loadTransactionStore(state);

    const cleaned = this.cleanProgramStates();
    if (rebuildProgram && cleaned) {
      modifiedProgram = await this.buildProgram(modifiedProgram);
    }

    ReverseDebugger.updateByteInformation(byteInformation as ByteInformation, modifiedState);

    return {
      modifiedState,
      modifiedProgram,
      modifiedStep,
    };
  }

  private setProgramStates = (program: Program) => {
    const {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      disassemblerInstance, vm, ucInstance, ...fields
    } = program;

    const clonedFields = this.clone(fields);

    const {
      registersToShow,
      flagsToShow,
      memoryAddress,
      memorySizeInBytes,
      codeAddress,
      codeSizeInBytes,
      code,
    } = clonedFields;

    const updatedProgram: ProgramTransactions = {
      registersToShow,
      flagsToShow,
      memoryAddress,
      memorySizeInBytes,
      codeAddress,
      codeSizeInBytes,
      code,
    };

    const versionCopy = this.clone(this.versioning);

    const newEntry = {
      version: versionCopy,
      value: updatedProgram,
    };

    this.transactionStore.programStates.push(newEntry);
  };

  private getKeyFromStateTransactions = (key: string) => this.transactionStore.stateTransactions[key as keyof StateTransactions];

  static getEntry = (versionObject: Version, valueObject: ValueOfState) => ({ version: versionObject, value: valueObject });

  private precisePush(prop: string, entry: {version: Version; value: unknown}) {
    const { stateTransactions } = this.transactionStore;

    switch (prop) {
      case 'byteInformation':
        stateTransactions.byteInformation.push(entry as {version: Version; value: ByteInformation});
        break;
      case 'currentAccessedElements':
        stateTransactions.currentAccessedElements.push(entry as {version: Version; value: AccessedElements});
        break;
      case 'flags':
        stateTransactions.flags.push(entry as {version: Version; value: Array<Flag>});
        break;
      case 'instructionPointer':
        stateTransactions.instructionPointer.push(entry as {version: Version; value: InstructionPointer});
        break;
      case 'currentInstruction':
        stateTransactions.currentInstruction.push(entry as {version: Version; value: Instruction});
        break;
      case 'registers':
        stateTransactions.registers.push(entry as {version: Version; value: Array<Register>});
        break;
      case 'memoryData':
        stateTransactions.memoryData.push(entry as {version: Version; value: MemoryData});
        break;
      default:
        stateTransactions.changeHistory.push(entry as {version: Version; value: Array<ChangeHistory>});
    }
  }

  private setTransactionStore = (property: string, value: ValueOfState) => {
    const versionCopy = this.clone(this.versioning);
    const valueCopy = this.clone(value);
    const entry = ReverseDebugger.getEntry(versionCopy, valueCopy);
    this.precisePush(property, entry);
  };

  private attachProgram(target: Program) {
    const setProgramStates = (obj: Program) => {
      this.setProgramStates(obj);
    };

    const handler = {
      set(obj: Program, prop: string, value: ValueOfProgram) {
        if (prop !== 'vm') {
          setProgramStates(obj);
        }
        return Reflect.set(obj, prop, value);
      },
    };
    return new Proxy(target, handler);
  }

  private attachState(target: State) {
    const setTransactionStore = (prop: string, value: ValueOfState) => {
      this.setTransactionStore(prop, value);
    };

    const handler = {
      set(obj: State, prop: string, value: ValueOfState) {
        setTransactionStore(prop, value);
        return Reflect.set(obj, prop, value);
      },
    };
    return new Proxy(target, handler);
  }
}

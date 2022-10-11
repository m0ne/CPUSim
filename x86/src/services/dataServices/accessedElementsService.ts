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

import AccessedElements from '@/services/interfaces/AccessedElements';
import State, { ChangeHistory } from '@/services/interfaces/State';
import Instruction from '@/services/interfaces/Instruction';
import {
  getMemoryDataLinesFromImmediateOperands,
  getMemoryLineFromReadAccess,
  getMemoryLineFromWriteAccess,
} from '@/services/dataServices/memoryService';
import {
  getFlagsFromFlagIDs,
  getRegistersFromRegisterIDs,
} from '@/services/dataServices/registerService';
import getJumpDestinationFromJumpInstruction from '@/services/dataServices/jumpDestinationService';
import Unicorn from '@/services/emulator/emulatorService';
import { eUC, RegisterID } from '@/services/emulator/emulatorEnums';
import { getLongSizeRegister } from '@/services/dataServices/registerAssignmentService';
import InstructionOperands from '@/services/interfaces/InstructionOperands';
import Program from '@/services/interfaces/Program';
import {
  getFlagsLabel,
  getImmediateNames, getJumpLabel,
  getMemoryAccessNames,
  getRegisterNames,
  printWriteAccessElementsToString,
} from '@/services/dataServices/accessedElementsPrintHelper';

function registersContainsRegisterId(registerId: RegisterID, registers: Array<RegisterID>): boolean {
  const index = registers.findIndex((register) => register === registerId);
  return index >= 0;
}

function addNewRegisterToRegistersToShow(newRegisterOperands: Array<RegisterID>, oldRegisters: Array<RegisterID>): Array<RegisterID> {
  newRegisterOperands.forEach((register) => {
    const longSizeRegister = getLongSizeRegister(register);
    if (!registersContainsRegisterId(longSizeRegister, oldRegisters)) {
      oldRegisters.push(longSizeRegister);
    }
  });
  return oldRegisters;
}

export function getNewRegistersToShow(operands: InstructionOperands, registersToShow: Array<RegisterID>): Array<RegisterID> {
  const registerOperandsRead = operands.registersRead;
  const registerOperandsWrite = operands.registersWrite;
  let registers = registersToShow;
  registers = addNewRegisterToRegistersToShow(registerOperandsRead, registers);
  return addNewRegisterToRegistersToShow(registerOperandsWrite, registers);
}

export function getReadAccessElements(state: State, ucInstance: Unicorn): AccessedElements {
  const registerOperandsRead = state.currentInstruction.operands.registersRead;
  const immediateOperand = state.currentInstruction.operands.immediate;
  const accessedElements = state.currentAccessedElements;
  accessedElements.immediateAccess = getMemoryDataLinesFromImmediateOperands(immediateOperand);
  accessedElements.registerReadAccess = getRegistersFromRegisterIDs(registerOperandsRead, ucInstance);
  return accessedElements;
}

// The flags that are both, tested and written are contained in the flagWriteAccess and not in the flagTestAccess.
// Therefore, it does not matter whether you query the tested flags before or after executing
// the instruction.
export function getWriteAccessElements(state: State, ucInstance: Unicorn): AccessedElements {
  const { operands } = state.currentInstruction;
  const accessedElements = state.currentAccessedElements;
  const registerOperandsWrite = operands.registersWrite;
  accessedElements.registerWriteAccess = getRegistersFromRegisterIDs(registerOperandsWrite, ucInstance);
  accessedElements.flagTestAccess = getFlagsFromFlagIDs(operands.flagsTest, ucInstance);
  accessedElements.flagWriteAccess = getFlagsFromFlagIDs(operands.flagsWrite, ucInstance);
  accessedElements.jumpDestinationWriteAccess = getJumpDestinationFromJumpInstruction(state, ucInstance);
  return accessedElements;
}

export default function getChangeHistory(instruction: Instruction, accessedElements: AccessedElements): ChangeHistory {
  return {
    instruction: instruction.assemblyInterpretation,
    changedElements: printWriteAccessElementsToString(accessedElements),
  };
}

export function getOutputNamesForExecutionBox(accessedElements: AccessedElements): Array<string> {
  let outputElements: Array<string> = [];
  outputElements = outputElements.concat(getMemoryAccessNames(accessedElements.memoryWriteAccess));
  outputElements = outputElements.concat(getRegisterNames(accessedElements.registerWriteAccess));
  outputElements = outputElements.concat(getFlagsLabel(accessedElements.flagWriteAccess));
  outputElements = outputElements.concat(getJumpLabel(accessedElements.jumpDestinationWriteAccess));
  return outputElements;
}

export function getInputNamesForExecutionBox(accessedElements: AccessedElements): Array<string> {
  let inputElements: Array<string> = [];
  inputElements = inputElements.concat(getImmediateNames(accessedElements.immediateAccess));
  inputElements = inputElements.concat(getMemoryAccessNames(accessedElements.memoryReadAccess));
  inputElements = inputElements.concat(getRegisterNames(accessedElements.registerReadAccess));
  inputElements = inputElements.concat(getFlagsLabel(accessedElements.flagTestAccess));
  return inputElements;
}

export function getEmptyAccessedElements(): AccessedElements {
  return {
    memoryWriteAccess: [],
    memoryReadAccess: [],
    registerWriteAccess: [],
    registerReadAccess: [],
    immediateAccess: [],
    flagWriteAccess: [],
    flagTestAccess: [],
    jumpDestinationWriteAccess: [],
  };
}

export function addMemoryAccessHook(state: State, program: Program) {
  program.ucInstance.hook_add(eUC.HOOK_MEM_READ, (handle: number, type: number, addrLo: number, addrHi: number, size: number) => {
    const memLine = getMemoryLineFromReadAccess({
      addrLo, addrHi, size, valueLo: 0, valueHi: 0,
    }, program.ucInstance);
    state.currentAccessedElements.memoryReadAccess.push(memLine);
  }, 0, 0, -1, []);

  program.ucInstance.hook_add(eUC.HOOK_MEM_WRITE, (handle: number, type: number, addrLo: number, addrHi: number, size: number, valueLo: number, valueHi: number) => {
    const memLine = getMemoryLineFromWriteAccess({
      addrLo, addrHi, size, valueLo, valueHi,
    });
    state.currentAccessedElements.memoryWriteAccess.push(memLine);
  }, 0, 0, -1, []);
}

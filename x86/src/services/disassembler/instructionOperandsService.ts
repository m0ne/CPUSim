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

import InstructionOperands, {
  FlagAccessMode,
  ImmediateOperand,
  MemoryOperand,
  MemoryPointerArithmeticOperands,
  OperandFromJSON,
  ReadWriteAccessMode,
  RegisterOperand,
} from '@/services/interfaces/InstructionOperands';
import { RegisterID } from '@/services/emulator/emulatorEnums';
import { getFlagIdFromName, getRegisterIdFromName } from '@/services/dataServices/registerService';

export function getReadWriteAccessModFromName(memoryAccess: string): ReadWriteAccessMode {
  const name = memoryAccess.toUpperCase() as keyof typeof ReadWriteAccessMode;
  return ReadWriteAccessMode[name];
}

export function getFlagAccessModFromName(flagAccess: string): FlagAccessMode {
  const accessMode = flagAccess.toUpperCase() as keyof typeof FlagAccessMode;
  return FlagAccessMode[accessMode];
}

function createPointerArithmeticOperands(operand: OperandFromJSON): MemoryPointerArithmeticOperands {
  const regBase = operand.reg_base ? getRegisterIdFromName(operand.reg_base) : undefined;
  const regIndex = operand.reg_index ? getRegisterIdFromName(operand.reg_index) : undefined;
  const disp: number | undefined = operand.disp ? parseInt(operand.disp, 16) : undefined;
  const scale: number | undefined = operand.scale ? parseInt(operand.scale, 10) : undefined;
  if (!operand.reg_index && !operand.reg_base && disp === undefined && scale === undefined) {
    return {};
  }
  return {
    regBase,
    regIndex,
    disp,
    scale,
  };
}

function createMemoryOperandFromJSON(operand: OperandFromJSON): MemoryOperand {
  if (!operand.access) {
    throw new TypeError('MEM operand has no access attribute');
  }
  const pointerArithmeticOperands = createPointerArithmeticOperands(operand);
  return {
    size: parseInt(operand.size, 10),
    pointerArithmeticOperands,
    access: getReadWriteAccessModFromName(operand.access),
  };
}

function createRegisterOperandFromJSON(registerAccess?: string, registerName?: string): RegisterOperand {
  if (!registerAccess || !registerName) {
    throw new TypeError('REG operand has no access or value attribute');
  }
  return {
    access: getReadWriteAccessModFromName(registerAccess),
    register: getRegisterIdFromName(registerName),
  };
}

function createImmediateOperandFromJSON(immediateSize: string, immediateValue?: string): ImmediateOperand {
  if (!immediateValue) {
    throw new TypeError('IMM operand has no value attribute');
  }
  return {
    size: parseInt(immediateSize, 10),
    value: parseInt(immediateValue, 16),
  };
}

function isReadAccess(accessMode: ReadWriteAccessMode): boolean {
  return accessMode === ReadWriteAccessMode.READ
    || accessMode === ReadWriteAccessMode.READ_WRITE;
}

function isWriteAccess(accessMode: ReadWriteAccessMode): boolean {
  return accessMode === ReadWriteAccessMode.WRITE
    || accessMode === ReadWriteAccessMode.READ_WRITE;
}

function addMemoryOperandToInstructionOperands(memOp: MemoryOperand, instructionOperands: InstructionOperands) {
  if (isReadAccess(memOp.access)) {
    instructionOperands.memoryRead.push(memOp);
  }
  if (isWriteAccess(memOp.access)) {
    instructionOperands.memoryWrite.push(memOp);
  }
}

function addRegisterOperandToInstructionOperands(regOp: RegisterOperand, instructionOperands: InstructionOperands) {
  if (isReadAccess(regOp.access)) {
    instructionOperands.registersRead.push(regOp.register);
  }
  if (isWriteAccess(regOp.access)) {
    instructionOperands.registersWrite.push(regOp.register);
  }
}

function createOperandFromJSON(operand: OperandFromJSON, instructionOperands: InstructionOperands): void {
  switch (operand.type) {
    case 'MEM': {
      const memOp = createMemoryOperandFromJSON(operand);
      addMemoryOperandToInstructionOperands(memOp, instructionOperands);
      break;
    }
    case 'IMM': {
      const immOp = createImmediateOperandFromJSON(operand.size, operand.value);
      instructionOperands.immediate.push(immOp);
      break;
    }
    case 'REG': {
      const regOp = createRegisterOperandFromJSON(operand.access, operand.value);
      addRegisterOperandToInstructionOperands(regOp, instructionOperands);
      break;
    }
    default: {
      break;
    }
  }
}

function isFlagWriteAccess(flagAccessMode: FlagAccessMode): boolean {
  return flagAccessMode === FlagAccessMode.MOD
    || flagAccessMode === FlagAccessMode.SET
    || flagAccessMode === FlagAccessMode.RESET;
}

function createRegisterIdsFromJSON(registers: Array<string>): Array<RegisterID> {
  const registerIds: Array<RegisterID> = [];
  const nameOfFlagRegisterInCapstone = 'rflags';
  registers.forEach((register: string) => {
    if (register !== nameOfFlagRegisterInCapstone) {
      registerIds.push(getRegisterIdFromName(register));
    }
  });
  return registerIds;
}

function addJSONFlagsToInstructionOperands(flagsJSON: Array<{access: string; name: string}>, instructionOperands: InstructionOperands): void {
  flagsJSON.forEach((flag: { access: string; name: string }) => {
    const flagId = getFlagIdFromName(flag.name);
    if (flagId >= 0) {
      const flagAccessMode: FlagAccessMode = getFlagAccessModFromName(flag.access);
      if (isFlagWriteAccess(flagAccessMode)) {
        instructionOperands.flagsWrite.push(flagId);
      } else if (flagAccessMode === FlagAccessMode.TEST) {
        instructionOperands.flagsTest.push(flagId);
      }
    }
  });
}

function addJSONRegistersToRegisterIds(registersJSON: Array<string>, registerIds: Array<RegisterID>): Array<RegisterID> {
  const registers = createRegisterIdsFromJSON(registersJSON);
  registers.forEach((registerJSON) => {
    if (!registerIds.find((alreadyAddedRegister) => alreadyAddedRegister === registerJSON)) {
      registerIds.push(registerJSON);
    }
  });
  return registerIds;
}

function getEmptyInstructionOperands(): InstructionOperands {
  return {
    opcode: Uint8Array.from([0]),
    operandCount: 0,
    memoryWrite: [],
    memoryRead: [],
    flagsTest: [],
    flagsWrite: [],
    immediate: [],
    registersRead: [],
    registersWrite: [],
  };
}

function addJSONInstructionOperands(operands: Array<OperandFromJSON>, instructionOperands: InstructionOperands) {
  operands.forEach((operand: OperandFromJSON) => {
    createOperandFromJSON(operand, instructionOperands);
  });
}

export default function getInstructionInformationFromCapstone(instructionData: string): InstructionOperands {
  const instructionOperands: InstructionOperands = getEmptyInstructionOperands();
  try {
    const object = JSON.parse(instructionData);
    instructionOperands.opcode = Uint8Array.from(object.Opcode.split(' ').map((byte: string) => parseInt(byte, 16)));
    if (object.operands) {
      instructionOperands.operandCount = object.operands.length;
      addJSONInstructionOperands(object.operands, instructionOperands);
    }
    if (object.registers_read) {
      instructionOperands.registersRead = addJSONRegistersToRegisterIds(object.registers_read, instructionOperands.registersRead);
    }
    if (object.registers_modified) {
      instructionOperands.registersWrite = addJSONRegistersToRegisterIds(object.registers_modified, instructionOperands.registersWrite);
    }
    if (object.EFLAGS) {
      addJSONFlagsToInstructionOperands(object.EFLAGS, instructionOperands);
      instructionOperands.flagsWrite.sort();
      instructionOperands.flagsTest.sort();
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new TypeError(`Instruction Information JSON from Capstone is invalid: ${error.message}`);
    } else {
      throw new TypeError('Instruction Information JSON from Capstone is invalid');
    }
  }
  return instructionOperands;
}

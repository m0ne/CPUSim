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

import { RegisterID } from '@/services/emulator/emulatorEnums';
import ByteInformation, {
  CodeInformation,
  PointerInformation,
} from '@/services/interfaces/ByteInformation';
import { getRegisters } from '@/services/dataServices/registerService';
import Unicorn from '@/services/emulator/emulatorService';
import MemoryDataLine from '@/services/interfaces/MemoryDataLine';
import { createLocationIdNumbers } from '@/services/helper/htmlIdService';
import Program from '@/services/interfaces/Program';
import Instruction from '@/services/interfaces/Instruction';
import State from '@/services/interfaces/State';

export function byteInformationUsedBytesContainsAddressNumber(address: number, usedBytes: Array<number>): boolean {
  const index = usedBytes.findIndex((addressUsedByte) => addressUsedByte === address);
  return index >= 0;
}

export function updateUsedBytesInByteInformation(memoryLines: Array<MemoryDataLine>, usedBytes: Array<number>) {
  memoryLines.forEach((line) => {
    line.dataBytes.forEach((byte) => {
      const addressNumber = parseInt(byte.locationId, 16);
      if (!byteInformationUsedBytesContainsAddressNumber(addressNumber, usedBytes)) {
        usedBytes.push(addressNumber);
      }
    });
  });
}

function addPointerToUsedBytesInByteInformation(pointerAddress: number, usedBytes: Array<number>) {
  if (!byteInformationUsedBytesContainsAddressNumber(pointerAddress, usedBytes)) {
    usedBytes.push(pointerAddress);
  }
}

function getPointerAddressFromRegister(registerId: RegisterID, ucInstance: Unicorn): number {
  const rbpRegister = getRegisters(ucInstance, [registerId])[0];
  const addressString = rbpRegister.content[1].content.concat(rbpRegister.content[0].content);
  return parseInt(addressString, 16);
}

function getEmptyPointerInfo(): PointerInformation {
  return {
    pointerAddress: 0,
    pointerBytes: [],
  };
}

function setPointerInfo(pointerAddress: number): PointerInformation {
  return {
    pointerAddress,
    pointerBytes: [pointerAddress],
  };
}

function setCodeInfo(codeAddress: number, codeSizeInBytes: number): CodeInformation {
  return {
    from: codeAddress,
    to: codeAddress + codeSizeInBytes,
  };
}

function updatePointerInformation(register: RegisterID, ucInstance: Unicorn, usedBytes: Array<number>): PointerInformation {
  const addressFromPointerRegister = getPointerAddressFromRegister(register, ucInstance);
  const pointerInfo: PointerInformation = getEmptyPointerInfo();
  pointerInfo.pointerAddress = addressFromPointerRegister;
  pointerInfo.pointerBytes = createLocationIdNumbers(addressFromPointerRegister, 8);
  addPointerToUsedBytesInByteInformation(pointerInfo.pointerAddress, usedBytes);
  return pointerInfo;
}

export function buildByteInformation(program: Program): ByteInformation {
  const basePointerAddress = getPointerAddressFromRegister(RegisterID.BP, program.ucInstance);
  const stackPointerAddress = getPointerAddressFromRegister(RegisterID.SP, program.ucInstance);
  const usedBytes = [basePointerAddress, stackPointerAddress];
  return {
    basePointerInformation: setPointerInfo(basePointerAddress),
    stackPointerInformation: setPointerInfo(stackPointerAddress),
    instructionPointerInformation: setPointerInfo(program.codeAddress),
    unevenInstructionBytes: [],
    evenInstructionBytes: [],
    usedBytes,
    code: setCodeInfo(program.codeAddress, program.codeSizeInBytes),
  };
}

export function updateBasePointerInByteInformation(state: State, program: Program) {
  const basePointerInfo = updatePointerInformation(RegisterID.BP, program.ucInstance, state.byteInformation.usedBytes);
  state.byteInformation.basePointerInformation.pointerBytes = basePointerInfo.pointerBytes;
  state.byteInformation.basePointerInformation.pointerAddress = basePointerInfo.pointerAddress;
}

export function updateStackPointerInByteInformation(state: State, program: Program) {
  const stackPointerInfo = updatePointerInformation(RegisterID.SP, program.ucInstance, state.byteInformation.usedBytes);
  state.byteInformation.stackPointerInformation.pointerBytes = stackPointerInfo.pointerBytes;
  state.byteInformation.stackPointerInformation.pointerAddress = stackPointerInfo.pointerAddress;
}

export default function updateInstructionPointerInByteInformation(state: State) {
  state.byteInformation.instructionPointerInformation.pointerAddress = parseInt(state.instructionPointer.address.address, 16);
  state.byteInformation.instructionPointerInformation.pointerBytes = [state.byteInformation.instructionPointerInformation.pointerAddress];
}

export function updateInstructionBytesInByteInformation(instruction: Instruction, state: State) {
  const addressInstruction = instruction.address.address;
  const startAddressInstruction: number = parseInt(addressInstruction, 16);
  state.byteInformation.instructionPointerInformation.pointerBytes = createLocationIdNumbers(startAddressInstruction, instruction.length);
}

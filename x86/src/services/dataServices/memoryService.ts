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

import MemoryData from '@/services/interfaces/MemoryData';
import Byte from '@/services/interfaces/Byte';
import MemoryDataLine from '@/services/interfaces/MemoryDataLine';
import dataStringsToBytes, {
  stringToByteStringArray,
} from '@/services/dataServices/byteService';
import uInt8ArrayToHexStringArray from '@/services/helper/uInt8ArrayHelper';
import Program from '@/services/interfaces/Program';
import { ImmediateOperand } from '@/services/interfaces/InstructionOperands';
import fillAddress, {
  getLocationIdsForImmediate,
} from '@/services/helper/htmlIdService';
import { MemoryHookInformation } from '@/services/interfaces/AccessedElements';
import Unicorn from '@/services/emulator/emulatorService';

function bytesToMemoryLines(bytes: Array<Byte>): Array<MemoryDataLine> {
  const memoryLines: Array<MemoryDataLine> = [];
  if (bytes.length > 0) {
    while (bytes.length > 0) {
      const memoryLineLength = 16;
      memoryLines.push({
        address: { address: bytes[0].locationId },
        dataBytes: bytes.splice(0, memoryLineLength),
      });
    }
  } else {
    throw new Error('Byte array for Memory Line is empty');
  }
  return memoryLines;
}

export function uInt8ArrayToMemoryBytes(memoryContent: Uint8Array, startAddress: number): Array<Byte> {
  const memoryContentStringArray: Array<string> = uInt8ArrayToHexStringArray(memoryContent);
  return dataStringsToBytes(memoryContentStringArray, startAddress);
}

function buildMemoryData(memoryContent: Uint8Array, startAddress: string): MemoryData {
  const startAddressHex = parseInt(startAddress, 16);
  const memoryBytes = uInt8ArrayToMemoryBytes(memoryContent, startAddressHex);
  return {
    memoryDataLines: bytesToMemoryLines(memoryBytes),
  };
}

export function getMemory(program: Program): MemoryData {
  let memory: MemoryData;
  try {
    const memoryData = program.ucInstance.memory_read(program.memoryAddress, program.memorySizeInBytes);
    memory = buildMemoryData(memoryData, program.memoryAddress.toString(16));
  } catch (err: unknown) {
    if (err instanceof Error) {
      throw new Error(`Memory could not be created: ${err.message}`);
    } else {
      throw new Error('Memory could not be created');
    }
  }
  return memory;
}

function convertSigned32BitToUnsigned(negativeDecimal: number): number {
  const overFlow = 0x100000000;
  return negativeDecimal + overFlow;
}

function createDataStringFromHookValues(valueLo: number, valueHi: number, size: number): Array<string> {
  let byteStringHi: Array<string> = [];
  let byteStringLo: Array<string> = [];
  const lower32Bit = valueLo >= 0 ? valueLo : convertSigned32BitToUnsigned(valueLo);
  const higher32Bit = valueHi >= 0 ? valueHi : convertSigned32BitToUnsigned(valueHi);
  if (size <= 4) {
    byteStringLo = stringToByteStringArray(lower32Bit.toString(16), size);
  } else {
    byteStringLo = stringToByteStringArray(lower32Bit.toString(16), 4);
    byteStringHi = stringToByteStringArray(higher32Bit.toString(16), size - 4);
  }
  return byteStringLo.concat(byteStringHi);
}

export function readNextInstructionBytesFromMemory(instructionAddressHex: string, program: Program) {
  const startAddress: number = parseInt(instructionAddressHex, 16);
  const endOfMemory = program.memoryAddress + program.memorySizeInBytes;
  const bytesToRead = endOfMemory - startAddress + 1;
  const bytes = bytesToRead >= 8 ? 8 : bytesToRead;
  return program.ucInstance.memory_read(startAddress, bytes);
}

export function getMemoryLineFromWriteAccess(hook: MemoryHookInformation): MemoryDataLine {
  const byteStrings = createDataStringFromHookValues(hook.valueLo, hook.valueHi, hook.size);
  return {
    address: fillAddress(hook.addrLo),
    dataBytes: dataStringsToBytes(byteStrings, hook.addrLo),
  };
}

export function getMemoryLineFromReadAccess(hook: MemoryHookInformation, ucInstance: Unicorn): MemoryDataLine {
  const memoryData = ucInstance.memory_read(hook.addrLo, hook.size);
  return {
    address: fillAddress(hook.addrLo),
    dataBytes: (uInt8ArrayToMemoryBytes(memoryData, hook.addrLo)),
  };
}

export function getMemoryDataLinesFromImmediateOperands(immediateOperands: Array<ImmediateOperand>): Array<MemoryDataLine> {
  const immediateAccess: Array<MemoryDataLine> = [];
  const immediateLocationIds = getLocationIdsForImmediate(immediateOperands.length);
  immediateOperands.forEach((value, index) => {
    const size = value.value.toString(16).length / 2;
    const valueNumber = value.value >= 0 ? value.value : convertSigned32BitToUnsigned(value.value);
    const dataString = stringToByteStringArray(valueNumber.toString(16), size);
    const memLine: MemoryDataLine = {
      address: fillAddress(index),
      dataBytes: dataStringsToBytes(dataString, 0, immediateLocationIds[index]),
    };
    immediateAccess.push(memLine);
  });
  return immediateAccess;
}

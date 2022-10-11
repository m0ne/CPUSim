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
import Program from '@/services/interfaces/Program';
import Unicorn from '@/services/emulator/emulatorService';
import Disassembler from '@/services/disassembler/disassemblerService';
import StepController from '@/services/stepController';
import { FlagID } from '@/services/interfaces/Flag';
import startEmulator from '@/services/startSimulatorService';

export async function initEmulator(ucInstance: Unicorn, disassemblerInstance: Disassembler, memoryAddress: number, flagsToShow: Array<FlagID>, registersToShow: Array<RegisterID>, code: Array<number>, codeAddress: number): Promise<Program> {
  const memorySizeInBytes = 4 * 1024;
  await ucInstance.initialiseEmulator();

  // map instruction memory
  ucInstance.memory_map(codeAddress, memorySizeInBytes, ucInstance.uc.PROT_ALL);
  ucInstance.memory_write(codeAddress, code);

  // map data memory
  if (memoryAddress !== codeAddress) {
    ucInstance.memory_map(memoryAddress, memorySizeInBytes, ucInstance.uc.PROT_ALL);
  }
  await disassemblerInstance.initialiseDisassembler();
  return {
    ucInstance,
    disassemblerInstance,
    memorySizeInBytes,
    memoryAddress,
    registersToShow,
    flagsToShow,
    codeAddress,
    codeSizeInBytes: code.length,
    code,
  };
}

export function closeEmulator(prog: Program) {
  prog.ucInstance.close();
  prog.disassemblerInstance.delete();
}

const codeAddress = 0x0000;
const registers: Array<RegisterID> = [RegisterID.RAX, RegisterID.RBX];
const flags: Array<FlagID> = [FlagID.CF, FlagID.OF, FlagID.ZF, FlagID.SF];
const memoryAddress = 0x8000;

export function writeTestDataInRegister(ucInstance: Unicorn) {
  ucInstance.register_write(RegisterID.RAX, ['0xFF', '0xFF', '0xFF', '0xFF']);
  ucInstance.register_write(RegisterID.RBX, [1]);
}

async function startProgram(code: Array<number>, ucInstance: Unicorn, disassemblerInstance: Disassembler) {
  return initEmulator(ucInstance, disassemblerInstance, memoryAddress, flags, registers, code, codeAddress);
}

export async function startStackExampleProgram() {
  const codeStackExampleProgram = [
    0x6A, 0x06, 0xFF, 0x34, 0x25, 0x06, 0x00, 0x00, 0x00, 0x48, 0x8B, 0x04, 0x25, 0x00, 0x00, 0x00, 0x00, 0x50, 0x5B, 0x8F, 0x04, 0x25, 0x40, 0x00, 0x00, 0x00,
  ];

  const program = await startEmulator(codeStackExampleProgram);
  return program;
}

export async function startAddExampleProgram() {
  const codeAddExampleProgram = [
    0x48, 0x8B, 0x04, 0x25, 0x00, 0x00, 0x00, 0x00, 0x48, 0x8B, 0x1C, 0x25, 0x30, 0x00, 0x00, 0x00, 0x48, 0x01, 0xC3, 0x48, 0x89, 0x1C, 0x25, 0x20, 0x00, 0x00, 0x00,
  ];

  const program = await startEmulator(codeAddExampleProgram);
  return program;
}

export async function startSimpleTestProgram(ucInstance: Unicorn, disassemblerInstance: Disassembler) {
  const codeSimpleTest = [
    0x48, 0x01, 0xC3, 0x48, 0x01, 0xC3,
  ];
  const program = await startProgram(codeSimpleTest, ucInstance, disassemblerInstance);
  writeTestDataInRegister(ucInstance);
  return program;
}

export async function startCallAndStackTestProgram(ucInstance: Unicorn, disassemblerInstance: Disassembler) {
  const codeWithCallAndStack = [
    0x48, 0xC7, 0xC4, 0x20, 0x01, 0x00, 0x00, 0xFF, 0x34, 0x25, 0x00, 0x00, 0x00, 0x00, 0xE8, 0x04, 0x00, 0x00, 0x00, 0x6A, 0x06, 0xEB, 0x09, 0xFF, 0x34, 0x25, 0x00, 0x00, 0x00, 0x00, 0x58, 0xC3,
  ];
  const stackRegisters = [RegisterID.RAX, RegisterID.RBX, RegisterID.EIP, RegisterID.RSP];
  return initEmulator(ucInstance, disassemblerInstance, memoryAddress, flags, stackRegisters, codeWithCallAndStack, codeAddress);
}

export async function startMemoryAccessTestProgram(ucInstance: Unicorn, disassemblerInstance: Disassembler) {
  const codeMemoryAccess8Bytes = [
    0x48, 0x8B, 0x04, 0x25, 0x00, 0x00, 0x00, 0x00, 0x48, 0x89, 0x04, 0x25, 0x00, 0x00, 0x00, 0x00,
  ];
  const program = await startProgram(codeMemoryAccess8Bytes, ucInstance, disassemblerInstance);
  writeTestDataInRegister(ucInstance);
  return program;
}

export async function startMemoryAccessShortTestProgram(ucInstance: Unicorn, disassemblerInstance: Disassembler) {
  const codeMemoryAccess2Bytes = [
    0x66, 0x8B, 0x04, 0x25, 0x00, 0x00, 0x00, 0x00, 0x66, 0x89, 0x04, 0x25, 0x00, 0x00, 0x00, 0x00,
  ];
  const program = await startProgram(codeMemoryAccess2Bytes, ucInstance, disassemblerInstance);
  writeTestDataInRegister(ucInstance);
  return program;
}

export function writeSignedBytesInRegister(ucInstance: Unicorn) {
  ucInstance.register_write(RegisterID.RAX, ['0xB8', '0x38', '0x3B', '0xDF']);
}

export async function startMemoryWriteAccessWithSignedBytesTestProgram(ucInstance: Unicorn, disassemblerInstance: Disassembler) {
  const codeMemoryWriteAccessWithSignedBytes = [
    0x48, 0x89, 0x04, 0x25, 0x0A, 0x00, 0x00, 0x00,
  ];
  const program = await startProgram(codeMemoryWriteAccessWithSignedBytes, ucInstance, disassemblerInstance);
  writeSignedBytesInRegister(ucInstance);
  return program;
}

export async function startFlagsTestProgram(ucInstance: Unicorn, disassemblerInstance: Disassembler) {
  const codeFlags = [
    0x48, 0x31, 0xC0, 0x83, 0xC8, 0xFF, 0xF9, 0xF8, 0xB0, 0x7F, 0x04, 0x01,
  ];
  return startProgram(codeFlags, ucInstance, disassemblerInstance);
}

export async function startOperandsTestProgram(ucInstance: Unicorn, disassemblerInstance: Disassembler) {
  const codeOperands = [
    0x48, 0xC7, 0xC0, 0xFF, 0xFF, 0xFF, 0x00, 0x48, 0xC7, 0xC4, 0x20, 0x81, 0x00, 0x00, 0xE8, 0x00, 0x00, 0x00, 0x00, 0x48, 0x31, 0xDB,
  ];
  return startProgram(codeOperands, ucInstance, disassemblerInstance);
}

export async function stepOverOneInstruction(testController: StepController) {
  await testController.nextStep();
  await testController.nextStep();
  await testController.nextStep();
}

export async function stepOverFiveInstructions(testController: StepController) {
  await stepOverOneInstruction(testController);
  await stepOverOneInstruction(testController);
  await stepOverOneInstruction(testController);
  await stepOverOneInstruction(testController);
  await stepOverOneInstruction(testController);
}

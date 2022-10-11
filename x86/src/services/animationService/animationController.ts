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

import State from '@/services/interfaces/State';
import Program from '@/services/interfaces/Program';
import updateInstructionPointerInByteInformation, {
  updateBasePointerInByteInformation,
  updateInstructionBytesInByteInformation,
  updateStackPointerInByteInformation,
  updateUsedBytesInByteInformation,
} from '@/services/dataServices/byteInformationService';
import {
  animateExecutionBox,
  animateFlag,
  animateGetInstruction as animateGetInstructionAnimationService,
  animateImmediate,
  animateIncreaseInstructionPointer as animateIncreaseInstructionPointerAnimationService,
  animateJumpDestination,
  animateMemoryLine,
  animateRegister,
  changeAnimationServiceSpeed,
} from '@/services/animationService/animationService';
import { RegisterID } from '@/services/emulator/emulatorEnums';
import Instruction from '@/services/interfaces/Instruction';
import InstructionPointer from '@/services/interfaces/InstructionPointer';
import Flag from '@/services/interfaces/Flag';
import {
  animateAttentionCurrentInstruction,
  animateAttentionCurrentInstructionAssemblyBlock,
  animateAttentionFlags,
  animateAttentionImmediate,
  animateAttentionInstructionPointer,
  animateAttentionJumpDestination,
  animateAttentionMemory,
  animateAttentionRegister,
  changeAttentionAnimationSpeed,
} from '@/services/animationService/attentionAnimation';
import Register from '@/services/interfaces/Register';
import MemoryDataLine from '@/services/interfaces/MemoryDataLine';
import { getMemory } from '@/services/dataServices/memoryService';
import { getLongSizeRegister } from '@/services/dataServices/registerAssignmentService';
import {
  showFlagBytesExecutionZone,
  showImmediateBytesExecutionZone,
  showMemoryBytesExecutionZone,
  showRegisterBytesExecutionZone,
} from '@/services/animationService/showExecutionZoneBytes';
import JumpDestination from '@/services/interfaces/JumpDestination';
import {
  getFlags,
  getRegisterIdFromName,
  getRegisters,
} from '@/services/dataServices/registerService';
import getInstructionPointer from '@/services/dataServices/instructionPointerService';

function updateMemoryInSimulator(state: State, program: Program) {
  state.memoryData = getMemory(program);
}

function getRegisterIndexInSimulator(register: RegisterID, state: State) {
  return state.registers.findIndex((reg) => RegisterID[register] === reg.name);
}

function getValueOfRegister(register: RegisterID, program: Program): Register {
  const registers = getRegisters(program.ucInstance, [register]);
  return registers[0];
}

function updateOneRegisterInSimulator(register: Register, program: Program, state: State) {
  const registerId = getRegisterIdFromName(register.name);
  const longSizeRegisterId = getLongSizeRegister(registerId);
  const indexInSimulator = getRegisterIndexInSimulator(longSizeRegisterId, state);
  if (program.vm && indexInSimulator >= 0) {
    const longSizeRegister = getValueOfRegister(longSizeRegisterId, program);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    program.vm.$set(state.registers, indexInSimulator, longSizeRegister);
  }
}

function updateInstructionPointerInSimulator(state: State, program: Program) {
  state.instructionPointer = getInstructionPointer(program.ucInstance);
}

function updateAllRegistersInSimulator(state: State, program: Program) {
  state.registers = getRegisters(program.ucInstance, program.registersToShow);
}

function updateAllFlagsInSimulator(state: State, program: Program) {
  state.flags = getFlags(program.ucInstance, program.flagsToShow);
}

function updateStateInSimulator(state: State, program: Program, memoryAccess: Array<MemoryDataLine>) {
  updateUsedBytesInByteInformation(memoryAccess, state.byteInformation.usedBytes);
  updateStackPointerInByteInformation(state, program);
  updateBasePointerInByteInformation(state, program);
  updateAllRegistersInSimulator(state, program);
  updateAllFlagsInSimulator(state, program);
  updateMemoryInSimulator(state, program);
  updateInstructionPointerInSimulator(state, program);
}

async function animateRegisterRead(readRegisters: Array<Register>) {
  await readRegisters.reduce(async (previousRegister, register, index) => {
    await previousRegister;
    await animateAttentionRegister(register.name, false, index);
    await animateRegister(register, false, index);
    showRegisterBytesExecutionZone(register.name, false, index);
  }, Promise.resolve());
}

async function animateMemoryRead(accessedMemoryLines: Array<MemoryDataLine>) {
  await accessedMemoryLines.reduce(async (previousMemoryLine, memoryLine, index) => {
    await previousMemoryLine;
    await animateAttentionMemory(memoryLine, true, index);
    await animateMemoryLine(memoryLine, false, index);
    showMemoryBytesExecutionZone(memoryLine.address.address, false, index);
  }, Promise.resolve());
}

async function animateFlagAccess(accessedFlags: Array<Flag>, writeAccess: boolean) {
  const allAnimationsMov: Promise<unknown>[] = [];

  await animateAttentionFlags(accessedFlags, writeAccess);
  accessedFlags.forEach((flag) => {
    allAnimationsMov.push(animateFlag(flag, writeAccess));
  });
  await Promise.all(allAnimationsMov);

  if (accessedFlags.length > 0 && !writeAccess) {
    showFlagBytesExecutionZone(writeAccess, true);
  }
}

async function animateImmediateAccess(immediates: Array<MemoryDataLine>) {
  await immediates.reduce(async (previousImmediate, immediate) => {
    await previousImmediate;
    await animateAttentionImmediate(immediate);
    await animateImmediate(immediate);
    showImmediateBytesExecutionZone(immediate.address.address, true);
  }, Promise.resolve());
}

async function animateMemoryWrite(accessedMemoryLines: Array<MemoryDataLine>, state: State, program: Program) {
  await accessedMemoryLines.reduce(async (previousMemoryLine, memoryLine, index) => {
    await previousMemoryLine;
    await animateAttentionMemory(memoryLine, true, index);
    await animateMemoryLine(memoryLine, true, index);
    updateMemoryInSimulator(state, program);
  }, Promise.resolve());
}

async function animateRegisterWrite(registerWriteAccess: Array<Register>, state: State, program: Program) {
  await registerWriteAccess.reduce(async (previousRegister, register, index) => {
    await previousRegister;
    await animateAttentionRegister(register.name, true, index);
    await animateRegister(register, true, index);
    updateOneRegisterInSimulator(register, program, state);
  }, Promise.resolve());
}

async function animateJumpDestinationWrite(jumpDestinationWriteAccess: Array<JumpDestination>, state: State, program: Program) {
  await jumpDestinationWriteAccess.reduce(async (previousDestination, destination, index) => {
    await previousDestination;
    await animateAttentionJumpDestination(destination.name, true, index);
    await animateJumpDestination(destination, state.currentInstruction, true, index);
    updateInstructionPointerInSimulator(state, program);
  }, Promise.resolve());
}

async function animateReadAccess(state: State) {
  const accessedElements = state.currentAccessedElements;
  updateUsedBytesInByteInformation(accessedElements.memoryReadAccess, state.byteInformation.usedBytes);
  await animateFlagAccess(accessedElements.flagTestAccess, false);
  await animateRegisterRead(accessedElements.registerReadAccess);
  await animateMemoryRead(accessedElements.memoryReadAccess);
  await animateImmediateAccess(accessedElements.immediateAccess);
}

async function animateWriteAccess(state: State, program: Program) {
  const accessedElements = state.currentAccessedElements;
  updateUsedBytesInByteInformation(accessedElements.memoryWriteAccess, state.byteInformation.usedBytes);
  await animateMemoryWrite(accessedElements.memoryWriteAccess, state, program);
  await animateRegisterWrite(accessedElements.registerWriteAccess, state, program);
  updateStackPointerInByteInformation(state, program);
  updateBasePointerInByteInformation(state, program);
  await animateFlagAccess(accessedElements.flagWriteAccess, true);
  await animateJumpDestinationWrite(accessedElements.jumpDestinationWriteAccess, state, program);
  // All registers and flags must be updated at the end. There are registers like RIP, which
  // are not included in registerWriteAccess, but are modified with every instruction.
  updateAllRegistersInSimulator(state, program);
  updateAllFlagsInSimulator(state, program);
}

export async function animateInstructionGeneric(state: State, program: Program, animateThisStep: boolean) {
  if (animateThisStep) {
    await animateAttentionCurrentInstructionAssemblyBlock();
    await animateReadAccess(state);
    await animateExecutionBox(true);
    await animateWriteAccess(state, program);
    await animateExecutionBox(false);
    showFlagBytesExecutionZone(false, false);
  } else {
    const accessedElements = state.currentAccessedElements;
    const memoryAccess = accessedElements.memoryReadAccess.concat(accessedElements.memoryWriteAccess);
    updateStateInSimulator(state, program, memoryAccess);
  }
}

export async function animateGetInstruction(currentInstruction: Instruction, state: State, animateThisStep: boolean) {
  updateInstructionPointerInByteInformation(state);
  updateInstructionBytesInByteInformation(currentInstruction, state);
  if (animateThisStep) {
    await animateAttentionCurrentInstruction(currentInstruction);
    await animateGetInstructionAnimationService(currentInstruction);
    state.currentInstruction = currentInstruction;
    await animateAttentionCurrentInstructionAssemblyBlock();
  } else {
    state.currentInstruction = currentInstruction;
  }
}

export async function animateIncreaseInstructionPointer(instructionPointer: InstructionPointer, state: State, animateThisStep: boolean) {
  if (animateThisStep) {
    await animateAttentionInstructionPointer(state.currentInstruction);
    await animateIncreaseInstructionPointerAnimationService(state.currentInstruction);
  }
  state.instructionPointer = instructionPointer;
  updateInstructionPointerInByteInformation(state);
}

export async function changeAnimationSpeed(speed: number) {
  await changeAttentionAnimationSpeed(speed);
  await changeAnimationServiceSpeed(speed);
}

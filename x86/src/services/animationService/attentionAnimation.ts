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

import {
  animateAttentionLocationIDs,
  AttentionMode, changeAnimationSpeed,
} from '@/services/animationService/attentionAnimationHelper';
import { getRegisterIdFromName } from '@/services/dataServices/registerService';
import Flag from '@/services/interfaces/Flag';
import MemoryDataLine from '@/services/interfaces/MemoryDataLine';
import Instruction from '@/services/interfaces/Instruction';
import { getLocationIdsInLongSizeRegister } from '@/services/dataServices/registerAssignmentService';
import {
  createLocationIds,
  getAnimationZoneIdFlags,
  getAnimationZoneIdImmediate,
  getAnimationZoneIdJumpDestination,
  getAnimationZoneIdMemory,
  getAnimationZoneIdRegister,
  getLocationIdsForCurrentInstruction,
  getLocationIdsFromBytes,
} from '@/services/helper/htmlIdService';
import htmlId from '@/services/helper/htmlIds';

async function animateAttentionRegisterExecutionBox(registerName: string, writeAccess: boolean, index: number) {
  const locationId = getAnimationZoneIdRegister(registerName, writeAccess, index);
  return animateAttentionLocationIDs([locationId], AttentionMode.Pulse, false);
}

async function animateAttentionJumpDestinationExecutionBox(jumpDestinationName: string, writeAccess: boolean, index: number) {
  const locationId = getAnimationZoneIdJumpDestination(jumpDestinationName, writeAccess, index);
  return animateAttentionLocationIDs([locationId], AttentionMode.Pulse, false);
}

async function animateAttentionMemoryExecutionBox(memoryLineAddress: string, writeAccess: boolean, index: number) {
  const locationId = getAnimationZoneIdMemory(memoryLineAddress, writeAccess, index);
  return animateAttentionLocationIDs([locationId], AttentionMode.Pulse, false);
}

async function animateAttentionImmediateExecutionBox(immediateAddress: string) {
  const locationId = getAnimationZoneIdImmediate(immediateAddress);
  return animateAttentionLocationIDs([locationId], AttentionMode.Pulse, false);
}

async function animateAttentionFlagExecutionBox(writeAccess: boolean) {
  const locationId = getAnimationZoneIdFlags(writeAccess);
  return animateAttentionLocationIDs([locationId], AttentionMode.Pulse, false);
}

async function animateAttentionFlag(flag: Flag) {
  const locationIds = [createLocationIds(0, 1, flag.name)[0]];
  return animateAttentionLocationIDs(locationIds, AttentionMode.AttentionPulse, true);
}

async function animateAttentionMemoryLine(memoryLine: MemoryDataLine, scrollIntoView: boolean) {
  const locationIds: Array<string> = getLocationIdsFromBytes(memoryLine.dataBytes);
  return animateAttentionLocationIDs(locationIds, AttentionMode.AttentionPulse, scrollIntoView);
}

async function animateAttentionInstruction(instruction: Instruction) {
  const startAddressInstructionInMemory = parseInt(instruction.address.address, 16);
  const instructionSize = instruction.content.length;

  const locationIds = createLocationIds(startAddressInstructionInMemory, instructionSize);

  const allAnimations: Promise<unknown>[] = [];
  locationIds.forEach((byteForAnimation) => {
    allAnimations.push(animateAttentionLocationIDs([byteForAnimation], AttentionMode.AttentionPulse, true));
  });
  return Promise.all(allAnimations);
}

export async function animateAttentionCurrentInstructionAssemblyBlock() {
  await animateAttentionLocationIDs([htmlId.currentInstructionAssemblyBlock], AttentionMode.Pulse, false);
}

async function animateAttentionCurrentInstructionBlock() {
  await animateAttentionLocationIDs([htmlId.currentInstructionBlock], AttentionMode.Pulse, false);
}

async function animateAttentionInstructionPointerBlock() {
  await animateAttentionLocationIDs([htmlId.instructionPointerBlock], AttentionMode.Pulse, false);
}

async function animateAttentionInstructionBytes(instruction: Instruction) {
  const instructionSize = instruction.content.length;
  const locationIDs: Array<string> = getLocationIdsForCurrentInstruction(instructionSize);
  await animateAttentionLocationIDs(locationIDs, AttentionMode.AttentionPulse, true);
  await animateAttentionLocationIDs([htmlId.ipBlock], AttentionMode.Pulse, false);
}

export async function animateAttentionMemory(memoryLine: MemoryDataLine, writeAccess: boolean, index: number) {
  await animateAttentionMemoryExecutionBox(memoryLine.address.address, writeAccess, index);
  await animateAttentionMemoryLine(memoryLine, true);
}

export async function animateAttentionImmediate(immediate: MemoryDataLine) {
  await animateAttentionMemoryLine(immediate, false);
  await animateAttentionImmediateExecutionBox(immediate.address.address);
}

export async function animateAttentionRegister(registerName: string, writeAccess: boolean, index: number) {
  await animateAttentionRegisterExecutionBox(registerName, writeAccess, index);
  const locationIds = getLocationIdsInLongSizeRegister(getRegisterIdFromName(registerName));
  return animateAttentionLocationIDs(locationIds, AttentionMode.AttentionPulse, true);
}

export async function animateAttentionJumpDestination(jumpDestinationName: string, writeAccess: boolean, index: number) {
  await animateAttentionJumpDestinationExecutionBox(jumpDestinationName, writeAccess, index);
  await animateAttentionInstructionPointerBlock();
}

export async function animateAttentionFlags(flags: Array<Flag>, writeAccess: boolean) {
  if (flags.length > 0) {
    await animateAttentionFlagExecutionBox(writeAccess);
  }
  const allAnimationsAttention: Promise<unknown>[] = [];
  flags.forEach((flag) => allAnimationsAttention.push(animateAttentionFlag(flag)));

  return Promise.all(allAnimationsAttention);
}

export async function animateAttentionInstructionPointer(instruction: Instruction) {
  await animateAttentionInstructionPointerBlock();
  await animateAttentionInstructionBytes(instruction);
}

export async function animateAttentionCurrentInstruction(instruction: Instruction) {
  await animateAttentionCurrentInstructionBlock();
  await animateAttentionInstruction(instruction);
}

export async function changeAttentionAnimationSpeed(speed: number) {
  await changeAnimationSpeed(speed);
}

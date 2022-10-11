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

import Instruction from '@/services/interfaces/Instruction';
import MemoryDataLine from '@/services/interfaces/MemoryDataLine';
import Register from '@/services/interfaces/Register';
import { getRegisterIdFromName } from '@/services/dataServices/registerService';
import { getLocationIdsInLongSizeRegister } from '@/services/dataServices/registerAssignmentService';
import Flag from '@/services/interfaces/Flag';
import {
  createLocationIds,
  getAnimationIdFlag,
  getAnimationIdImmediate,
  getAnimationIdMemory,
  getAnimationIdRegister,
  getLocationIdsFromBytes,
  getLocationIdsForCurrentInstruction, getAnimationIdJumpDestination,
} from '@/services/helper/htmlIdService';
import {
  moveByte,
  moveExecutionBoxLeft,
  moveExecutionBoxRight,
  changeAnimationSpeed,
} from '@/services/animationService/animationServiceHelper';
import htmlId from '@/services/helper/htmlIds';
import JumpDestination from '@/services/interfaces/JumpDestination';

export async function animateGetInstruction(instruction: Instruction) {
  const startAddressInstructionInMemory = parseInt(instruction.address.address, 16);
  const instructionSize = instruction.content.length;
  const targetForAnimation = getLocationIdsForCurrentInstruction(1)[0];
  const locationIds = createLocationIds(startAddressInstructionInMemory, instructionSize);

  const allAnimations: Promise<unknown>[] = [];
  locationIds.forEach((byteForAnimation, index) => {
    allAnimations.push(moveByte(byteForAnimation, targetForAnimation, index));
  });
  return Promise.all(allAnimations);
}

export async function animateExecutionBox(toTheLeft: boolean) {
  if (toTheLeft) {
    await moveExecutionBoxLeft();
  } else {
    await moveExecutionBoxRight();
  }
}

async function animateMoveByte(byteForAnimation: string, targetForAnimation: string, writeToMemory: boolean): Promise<unknown> {
  if (writeToMemory) {
    return moveByte(targetForAnimation, byteForAnimation, 0);
  }
  return moveByte(byteForAnimation, targetForAnimation, 0);
}

export async function animateRegister(register: Register, writeToMemory: boolean, index: number) {
  const registerName = register.name;
  const locationIdsLongSizeRegister: Array<string> = getLocationIdsInLongSizeRegister(getRegisterIdFromName(registerName));
  const locationIdsRegister: Array<string> = getLocationIdsFromBytes(register.content);
  const allAnimations: Promise<unknown>[] = [];

  locationIdsLongSizeRegister.forEach((registerForAnimation, indexRegisterByte) => {
    const targetForAnimation = getAnimationIdRegister(locationIdsRegister[indexRegisterByte], writeToMemory, index);
    allAnimations.push(animateMoveByte(registerForAnimation, targetForAnimation, writeToMemory));
  });
  return Promise.all(allAnimations);
}

export async function animateJumpDestination(jumpDestination: JumpDestination, currentInstruction: Instruction, writeToMemory: boolean, index: number) {
  const allAnimations: Promise<unknown>[] = [];
  const locationIDs: Array<string> = getLocationIdsFromBytes(jumpDestination.content);

  locationIDs.forEach((locationID) => {
    const modifiedLocationIDs = getAnimationIdJumpDestination(locationID, writeToMemory, index);
    allAnimations.push(moveByte(modifiedLocationIDs, htmlId.ipBlock, 0));
  });
  return Promise.all(allAnimations);
}

export async function animateFlag(flag: Flag, writeAccess: boolean) {
  const flagForAnimation = createLocationIds(0, 1, flag.name)[0];
  const targetForAnimation = getAnimationIdFlag(flagForAnimation, writeAccess);
  return animateMoveByte(flagForAnimation, targetForAnimation, writeAccess);
}

export async function animateMemoryLine(memoryLine: MemoryDataLine, writeToMemory: boolean, index: number) {
  const locationIds = getLocationIdsFromBytes(memoryLine.dataBytes);

  const allAnimations: Promise<unknown>[] = [];

  locationIds.forEach((byteForAnimation) => {
    const targetForAnimation = getAnimationIdMemory(byteForAnimation, writeToMemory, index);
    allAnimations.push(animateMoveByte(byteForAnimation, targetForAnimation, writeToMemory));
  });
  return Promise.all(allAnimations);
}

export async function animateImmediate(immediate: MemoryDataLine) {
  const allAnimations: Promise<unknown>[] = [];
  const locationIds: Array<string> = getLocationIdsFromBytes(immediate.dataBytes);

  locationIds.forEach((locationId) => {
    const targetForAnimation = getAnimationIdImmediate(locationId);
    allAnimations.push(animateMoveByte(locationId, targetForAnimation, false));
  });
  return Promise.all(allAnimations);
}

export async function animateIncreaseInstructionPointer(currentInstruction: Instruction) {
  const instructionSize = currentInstruction.content.length;
  const allAnimations: Promise<unknown>[] = [];
  const locationIDs: Array<string> = getLocationIdsForCurrentInstruction(instructionSize);
  locationIDs.forEach((locationID) => {
    allAnimations.push(moveByte(locationID, htmlId.ipBlock, 0));
  });

  return Promise.all(allAnimations);
}

export async function changeAnimationServiceSpeed(speed: number) {
  await changeAnimationSpeed(speed);
}

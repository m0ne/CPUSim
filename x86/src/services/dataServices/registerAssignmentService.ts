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

import { RegisterID, registerSize } from '@/services/emulator/emulatorEnums';
import { createLocationIds } from '@/services/helper/htmlIdService';

const keyValueForLongSizeRegister: Array<[RegisterID, RegisterID]> = [
  [RegisterID.EAX, RegisterID.RAX],
  [RegisterID.AX, RegisterID.RAX],
  [RegisterID.AL, RegisterID.RAX],
  [RegisterID.AH, RegisterID.RAX],
  [RegisterID.EBX, RegisterID.RBX],
  [RegisterID.BX, RegisterID.RBX],
  [RegisterID.BL, RegisterID.RBX],
  [RegisterID.BH, RegisterID.RBX],
  [RegisterID.ECX, RegisterID.RCX],
  [RegisterID.CX, RegisterID.RCX],
  [RegisterID.CL, RegisterID.RCX],
  [RegisterID.CH, RegisterID.RCX],
  [RegisterID.EDX, RegisterID.RDX],
  [RegisterID.DX, RegisterID.RDX],
  [RegisterID.DL, RegisterID.RDX],
  [RegisterID.DH, RegisterID.RDX],
  [RegisterID.EIP, RegisterID.RIP],
  [RegisterID.ESP, RegisterID.RSP],
  [RegisterID.SP, RegisterID.RSP],
  [RegisterID.SPL, RegisterID.RSP],
  [RegisterID.EBP, RegisterID.RBP],
  [RegisterID.BP, RegisterID.RBP],
  [RegisterID.BPL, RegisterID.RBP],
  [RegisterID.ESI, RegisterID.RSI],
  [RegisterID.SI, RegisterID.RSI],
  [RegisterID.SIL, RegisterID.RSI],
  [RegisterID.EDI, RegisterID.RDI],
  [RegisterID.DI, RegisterID.RDI],
  [RegisterID.DIL, RegisterID.RDI],
  [RegisterID.R8D, RegisterID.R8],
  [RegisterID.R8W, RegisterID.R8],
  [RegisterID.R8B, RegisterID.R8],
  [RegisterID.R9D, RegisterID.R9],
  [RegisterID.R9W, RegisterID.R9],
  [RegisterID.R9B, RegisterID.R9],
  [RegisterID.R10D, RegisterID.R10],
  [RegisterID.R10W, RegisterID.R10],
  [RegisterID.R10B, RegisterID.R10],
  [RegisterID.R11D, RegisterID.R11],
  [RegisterID.R11W, RegisterID.R11],
  [RegisterID.R11B, RegisterID.R11],
  [RegisterID.R12D, RegisterID.R12],
  [RegisterID.R12W, RegisterID.R12],
  [RegisterID.R12B, RegisterID.R12],
  [RegisterID.R13D, RegisterID.R13],
  [RegisterID.R13W, RegisterID.R13],
  [RegisterID.R13B, RegisterID.R13],
  [RegisterID.R14D, RegisterID.R14],
  [RegisterID.R14W, RegisterID.R14],
  [RegisterID.R14B, RegisterID.R14],
  [RegisterID.R15D, RegisterID.R15],
  [RegisterID.R15W, RegisterID.R15],
  [RegisterID.R15B, RegisterID.R15],
];

const longSizeRegisterMap: Map<RegisterID, RegisterID> = new Map(keyValueForLongSizeRegister);

export function getLongSizeRegister(registerId: RegisterID): RegisterID {
  const longSizeRegisterId = longSizeRegisterMap.get(registerId);
  if (longSizeRegisterId) {
    return longSizeRegisterId;
  }
  return registerId;
}

export function changeRegistersToLongSizeRegisters(registers: Array<RegisterID>): Array<RegisterID> {
  return registers.map(getLongSizeRegister);
}

function isIntSizeRegister(registerId: RegisterID) {
  return (registerSize(registerId) === 4);
}

function isShortSizeRegister(registerId: RegisterID) {
  return (registerSize(registerId) === 2);
}

function isLowCharSizeRegister(registerId: RegisterID) {
  const inputRegisterSize = registerSize(registerId);
  const inputRegisterName = RegisterID[registerId];
  const indexLastLetter = inputRegisterName.length - 1;
  return (inputRegisterSize === 1 && inputRegisterName[indexLastLetter] === 'L');
}

function isHighCharSizeRegister(registerId: RegisterID) {
  const inputRegisterSize = registerSize(registerId);
  const inputRegisterName = RegisterID[registerId];
  return (inputRegisterSize === 1 && inputRegisterName[1] === 'H');
}

export function getLocationIdsInLongSizeRegister(registerId: RegisterID) {
  const longSizeRegister = getLongSizeRegister(registerId);
  const inputRegisterSize = registerSize(registerId);
  if (longSizeRegister !== registerId) {
    let locationIds: Array<string> = [];
    const longRegisterName: string = RegisterID[longSizeRegister];
    if (isIntSizeRegister(registerId) || isShortSizeRegister(registerId) || isLowCharSizeRegister(registerId)) {
      locationIds = createLocationIds(0, inputRegisterSize, longRegisterName);
    } else if (isHighCharSizeRegister(registerId)) {
      locationIds = createLocationIds(1, inputRegisterSize, longRegisterName);
    } else {
      locationIds = createLocationIds(0, inputRegisterSize, RegisterID[registerId]);
    }
    return locationIds;
  }
  return createLocationIds(0, inputRegisterSize, RegisterID[registerId]);
}

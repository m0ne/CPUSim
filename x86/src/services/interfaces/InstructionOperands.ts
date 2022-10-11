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
import { FlagID } from '@/services/interfaces/Flag';

export interface OperandFromJSON {
  type: string;
  access?: string;
  reg_base?: string;
  reg_index?: string;
  size: string;
  disp?: string;
  scale?: string;
  value?: string;
}

export interface MemoryPointerArithmeticOperands {
  regBase?: RegisterID;
  regIndex?: RegisterID;
  disp?: number;
  scale?: number;
}

export enum ReadWriteAccessMode {
  READ,
  WRITE,
  READ_WRITE,
}

export interface RegisterOperand {
  register: RegisterID;
  access: ReadWriteAccessMode;
}

export interface ImmediateOperand {
  size: number;
  value: number;
}

export interface MemoryOperand {
  size: number;
  pointerArithmeticOperands: MemoryPointerArithmeticOperands;
  access: ReadWriteAccessMode;
}

export enum FlagAccessMode {
  MOD,
  UNDEF,
  RESET,
  TEST,
  SET,
  PRIOR,
}

interface InstructionOperands {
  opcode: Uint8Array;
  operandCount: number;
  memoryRead: Array<MemoryOperand>;
  memoryWrite: Array<MemoryOperand>;
  registersRead: Array<RegisterID>;
  registersWrite: Array<RegisterID>;
  immediate: Array<ImmediateOperand>;
  flagsWrite: Array<FlagID>;
  flagsTest: Array<FlagID>;
}

export default InstructionOperands;

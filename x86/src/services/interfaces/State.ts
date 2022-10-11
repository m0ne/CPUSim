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
import InstructionPointer from '@/services/interfaces/InstructionPointer';
import MemoryData from '@/services/interfaces/MemoryData';
import Register from '@/services/interfaces/Register';
import Flag from '@/services/interfaces/Flag';
import AccessedElements from '@/services/interfaces/AccessedElements';
import ByteInformation from '@/services/interfaces/ByteInformation';

export interface ChangeHistory {
  instruction: string;
  changedElements: Array<string>;
}

interface State {
  memoryData: MemoryData;
  registers: Array<Register>;
  currentInstruction: Instruction;
  instructionPointer: InstructionPointer;
  flags: Array<Flag>;
  currentAccessedElements: AccessedElements;
  byteInformation: ByteInformation;
  changeHistory: Array<ChangeHistory>;
}

export type ValueOfState = State[keyof State]

export default State;

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

import { testDataInstructionOperands } from './testDataCurrentState';

export const testDataNextStateRegisters = [
  {
    content: [
      { content: 'FF', locationId: 'RAX_0' },
      { content: 'FF', locationId: 'RAX_1' },
      { content: 'FF', locationId: 'RAX_2' },
      { content: 'FF', locationId: 'RAX_3' },
      { content: '00', locationId: 'RAX_4' },
      { content: '00', locationId: 'RAX_5' },
      { content: '00', locationId: 'RAX_6' },
      { content: '00', locationId: 'RAX_7' },
    ],
    name: 'RAX',
  },
  {
    content: [
      { content: '00', locationId: 'RBX_0' },
      { content: '00', locationId: 'RBX_1' },
      { content: '00', locationId: 'RBX_2' },
      { content: '00', locationId: 'RBX_3' },
      { content: '01', locationId: 'RBX_4' },
      { content: '00', locationId: 'RBX_5' },
      { content: '00', locationId: 'RBX_6' },
      { content: '00', locationId: 'RBX_7' },
    ],
    name: 'RBX',
  },
  {
    content: [
      { content: '00', locationId: 'RCX_0' },
      { content: '00', locationId: 'RCX_1' },
      { content: '00', locationId: 'RCX_2' },
      { content: '00', locationId: 'RCX_3' },
      { content: '00', locationId: 'RCX_4' },
      { content: '00', locationId: 'RCX_5' },
      { content: '00', locationId: 'RCX_6' },
      { content: '00', locationId: 'RCX_7' },
    ],
    name: 'RCX',
  },
];

export const testDataNextStateInstructionPointer = {
  address: { address: '0003' },
};

export const testDataNextStateCurrentInstruction = {
  address: { address: '0003' },
  assemblyInterpretation: 'add rbx, rax',
  content: [
    { content: '48', locationId: 'CurrInstr_0' },
    { content: '01', locationId: 'CurrInstr_1' },
    { content: 'C3', locationId: 'CurrInstr_2' },
  ],
  length: 3,
  operands: testDataInstructionOperands,
};

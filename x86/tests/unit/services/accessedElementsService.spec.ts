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

import { expect } from 'chai';
import getChangeHistory, {
  getEmptyAccessedElements,
  getNewRegistersToShow,
} from '@/services/dataServices/accessedElementsService';
import { RegisterID } from '@/services/emulator/emulatorEnums';
import { ChangeHistory } from '@/services/interfaces/State';
import MemoryDataLine from '@/services/interfaces/MemoryDataLine';
import AccessedElements from '@/services/interfaces/AccessedElements';
import {
  testDataCurrentInstruction,
  testDataEmptyAccessedElements, testDataFlags,
  testDataInstructionOperands, testDataRegisters,
} from './testDataCurrentState';

describe('getNewRegistersToShow', () => {
  it('succeeds if RBX only once added to registersToShow', () => {
    expect(getNewRegistersToShow(testDataInstructionOperands, [RegisterID.RAX])).to.eql([RegisterID.RAX, RegisterID.RBX]);
  });
  it('succeeds if Rax added to registersToShow', () => {
    expect(getNewRegistersToShow(testDataInstructionOperands, [RegisterID.RBX])).to.eql([RegisterID.RBX, RegisterID.RAX]);
  });
  it('succeeds if registersToShow not changed', () => {
    expect(getNewRegistersToShow(testDataInstructionOperands, [RegisterID.RBX, RegisterID.RAX])).to.eql([RegisterID.RBX, RegisterID.RAX]);
  });
  it('succeeds if both registers added to registersToShow', () => {
    expect(getNewRegistersToShow(testDataInstructionOperands, [])).to.eql([RegisterID.RBX, RegisterID.RAX]);
  });
});

describe('getNewRegistersToShow', () => {
  it('succeeds if RBX only once added to registersToShow', () => {
    expect(getEmptyAccessedElements()).to.eql({
      memoryWriteAccess: [],
      memoryReadAccess: [],
      registerWriteAccess: [],
      registerReadAccess: [],
      immediateAccess: [],
      flagWriteAccess: [],
      flagTestAccess: [],
      jumpDestinationWriteAccess: [],
    });
  });
});

describe('getChangeHistory', () => {
  const accessedMemoryLine: MemoryDataLine = {
    address: { address: '0000' },
    dataBytes: [
      { content: 'FF', locationId: 'immediate_0_0' },
      { content: 'FF', locationId: 'immediate_0_1' },
      { content: 'FF', locationId: 'immediate_0_2' },
    ],
  };

  const accessedLittleMemoryLine = {
    address: { address: '0010' },
    dataBytes: [
      { content: '13', locationId: 'immediate_0_0' },
    ],
  };

  const fullAccessedElements: AccessedElements = {
    immediateAccess: [accessedLittleMemoryLine, accessedMemoryLine],
    registerReadAccess: [testDataRegisters[0], testDataRegisters[1]],
    registerWriteAccess: [testDataRegisters[0], testDataRegisters[1]],
    flagWriteAccess: [testDataFlags[0], testDataFlags[1]],
    flagTestAccess: [testDataFlags[0], testDataFlags[1]],
    memoryWriteAccess: [accessedLittleMemoryLine, accessedMemoryLine],
    memoryReadAccess: [accessedLittleMemoryLine, accessedMemoryLine],
    jumpDestinationWriteAccess: [],
  };
  const fullChangeHistory: ChangeHistory = {
    instruction: testDataCurrentInstruction.assemblyInterpretation,
    changedElements: [
      '[0x0010]: 13',
      '[0x0000]: FF FF FF',
      'RAX: FF FF FF FF 00 00 00 00',
      'RBX: 01 00 00 00 00 00 00 00',
      'Flags: CF: 0, OF: 0',
    ],
  };
  const emptyChangeHistory: ChangeHistory = {
    instruction: testDataCurrentInstruction.assemblyInterpretation,
    changedElements: [],
  };
  it('succeeds if empty Change History ', () => {
    expect(getChangeHistory(testDataCurrentInstruction, testDataEmptyAccessedElements)).to.eql(emptyChangeHistory);
  });
  it('succeeds if full Change History', () => {
    expect(getChangeHistory(testDataCurrentInstruction, fullAccessedElements)).to.eql(fullChangeHistory);
  });
});

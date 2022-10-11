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
import MemoryDataLine from '@/services/interfaces/MemoryDataLine';
import {
  byteInformationUsedBytesContainsAddressNumber,
  updateUsedBytesInByteInformation,
} from '@/services/dataServices/byteInformationService';
import { testDataMemory } from './testDataCurrentState';

describe('updateUsedBytesInByteInformation', () => {
  it('succeeds if locationIds created', () => {
    const usedBytes = [8];
    const memLines = [testDataMemory.memoryDataLines[0], testDataMemory.memoryDataLines[3]];
    updateUsedBytesInByteInformation(memLines, usedBytes);
    expect(usedBytes).to.eql([8, 0x8000, 0x8001, 0x8002, 0x8003, 0x8004, 0x8005, 0x8006, 0x8007, 0x8008, 0x8009, 0x800A, 0x800B, 0x800C, 0x800D, 0x800E, 0x800F, 0x8030, 0x8031, 0x8032, 0x8033, 0x8034, 0x8035, 0x8036, 0x8037, 0x8038, 0x8039, 0x803A, 0x803B, 0x803C, 0x803D, 0x803E, 0x803F]);
  });
  it('succeeds if empty MemoryLine creates no locationIds', () => {
    const usedBytes = [8];
    const emptyMemLine: MemoryDataLine = {
      address: {
        address: '',
      },
      dataBytes: [],
    };
    updateUsedBytesInByteInformation([emptyMemLine], usedBytes);
    expect(usedBytes).to.eql([8]);
  });
});

describe('byteInformationUsedBytesContainsLocalId', () => {
  const usedBytes = [0x1000, 0xABCD, 0x1234];
  it('succeeds if locationId found', () => {
    expect(byteInformationUsedBytesContainsAddressNumber(0x1234, usedBytes)).to.eql(true);
  });
  it('succeeds if locationId 1000 found', () => {
    expect(byteInformationUsedBytesContainsAddressNumber(0x1000, usedBytes)).to.eql(true);
  });
  it('succeeds if locationId not found', () => {
    expect(byteInformationUsedBytesContainsAddressNumber(0xABCF, usedBytes)).to.eql(false);
  });
  it('succeeds if empty LocationId not found', () => {
    expect(byteInformationUsedBytesContainsAddressNumber(0, usedBytes)).to.eql(false);
  });
});

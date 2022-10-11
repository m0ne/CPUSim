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
import Byte from '@/services/interfaces/Byte';
import {
  getMemoryDataLinesFromImmediateOperands,
  uInt8ArrayToMemoryBytes,
} from '@/services/dataServices/memoryService';
import dataStringsToBytes, { stringToByteStringArray } from '@/services/dataServices/byteService';
import { ImmediateOperand } from '@/services/interfaces/InstructionOperands';
import MemoryDataLine from '@/services/interfaces/MemoryDataLine';

describe('Create Bytes from memory data string', () => {
  it('succeeds if bytes for memory created', () => {
    const testDataString = ['03', '0A', 'FF', 'AB', '38', '23', '16', 'FF', '0A', '03', '0A', 'FF', '07', '38', 'AD', '0A', 'FF', 'AB', '38', '23'];
    const expectedBytes: Array<Byte> = [
      { content: '03', locationId: '0019' },
      { content: '0A', locationId: '001A' },
      { content: 'FF', locationId: '001B' },
      { content: 'AB', locationId: '001C' },
      { content: '38', locationId: '001D' },
      { content: '23', locationId: '001E' },
      { content: '16', locationId: '001F' },
      { content: 'FF', locationId: '0020' },
      { content: '0A', locationId: '0021' },
      { content: '03', locationId: '0022' },
      { content: '0A', locationId: '0023' },
      { content: 'FF', locationId: '0024' },
      { content: '07', locationId: '0025' },
      { content: '38', locationId: '0026' },
      { content: 'AD', locationId: '0027' },
      { content: '0A', locationId: '0028' },
      { content: 'FF', locationId: '0029' },
      { content: 'AB', locationId: '002A' },
      { content: '38', locationId: '002B' },
      { content: '23', locationId: '002C' },
    ];
    const result = dataStringsToBytes(testDataString, 25);
    expect(result).to.eql(expectedBytes);
  });
  it('succeeds if throws invalid characters error', () => {
    expect(() => dataStringsToBytes(['03', '0A', 'Ff'], 25)).to.throw('Byte content: "Ff" contains invalid characters.');
  });
  it('succeeds if throws invalid characters error', () => {
    expect(() => dataStringsToBytes(['03', '0A', 'GF'], 25)).to.throw('Byte content: "GF" contains invalid characters.');
  });
  it('succeeds if throws not two digits error', () => {
    expect(() => dataStringsToBytes(['03', '0AB', '0F'], 25)).to.throw('Byte content: "0AB" is not two digits.');
  });
  it('succeeds if throws not two digits error', () => {
    expect(() => dataStringsToBytes(['03', 'F', 'FF'], 25)).to.throw('Byte content: "F" contains invalid characters.');
  });
  it('succeeds if throws not valid location id error', () => {
    expect(() => dataStringsToBytes(['03', 'A0', 'FF'], -1)).to.throw('Byte location Id -1 is not valid.');
  });
  it('succeeds if throws not valid location id error', () => {
    expect(() => dataStringsToBytes(['03', 'A0', 'FF'], 65535)).to.throw('Byte location Id 65536 is not valid.');
  });
  it('succeeds if throws empty content string error', () => {
    expect(() => dataStringsToBytes(new Array<string>(), 65535)).to.throw('Content string is empty.');
  });
});
describe('Create Memory bytes from Uint8Array', () => {
  it('succeeds if bytes created', () => {
    const testDataString = Uint8Array.from([3, 10, 255, 171, 56, 35, 22, 255, 0, 3, 10, 255, 7, 124, 173, 10, 255, 171]);
    const expectedBytes: Array<Byte> = [
      { content: '03', locationId: '0014' },
      { content: '0A', locationId: '0015' },
      { content: 'FF', locationId: '0016' },
      { content: 'AB', locationId: '0017' },
      { content: '38', locationId: '0018' },
      { content: '23', locationId: '0019' },
      { content: '16', locationId: '001A' },
      { content: 'FF', locationId: '001B' },
      { content: '00', locationId: '001C' },
      { content: '03', locationId: '001D' },
      { content: '0A', locationId: '001E' },
      { content: 'FF', locationId: '001F' },
      { content: '07', locationId: '0020' },
      { content: '7C', locationId: '0021' },
      { content: 'AD', locationId: '0022' },
      { content: '0A', locationId: '0023' },
      { content: 'FF', locationId: '0024' },
      { content: 'AB', locationId: '0025' },
    ];
    const result = uInt8ArrayToMemoryBytes(testDataString, 20);
    expect(result).to.eql(expectedBytes);
  });
});

describe('Convert Hex String to ByteStringArray', () => {
  it('succeeds if Array of size 4 created', () => {
    const expectedBytes = ['48', 'C7', 'C4', '20'];
    expect(stringToByteStringArray('20c4c748', 4)).to.eql(expectedBytes);
  });
  it('succeeds if zero Array of size 4 created', () => {
    const expectedBytes = ['00', '00', '00', '00'];
    expect(stringToByteStringArray('0', 4)).to.eql(expectedBytes);
  });
  it('succeeds if zero Array of size 3 created', () => {
    const expectedBytes = ['00', '00', '00'];
    expect(stringToByteStringArray('0', 3)).to.eql(expectedBytes);
  });
  it('succeeds if zero added created', () => {
    const expectedBytes = ['FF', 'FF', 'FF', '07'];
    expect(stringToByteStringArray('7ffffff', 4)).to.eql(expectedBytes);
  });
  it('succeeds if zero added created 2', () => {
    const expectedBytes = ['B8', '38', '3B', '0F'];
    expect(stringToByteStringArray('f3b38b8', 4)).to.eql(expectedBytes);
  });
  it('succeeds if 00 zeros added', () => {
    const expectedBytes = ['38', '3B', '0F', '00'];
    expect(stringToByteStringArray('f3b38', 4)).to.eql(expectedBytes);
  });
  it('succeeds if Array of size 3 created and zero added', () => {
    const expectedBytes = ['FF', '07', '00'];
    expect(stringToByteStringArray('7ff', 3)).to.eql(expectedBytes);
  });
  it('succeeds if throws', () => {
    expect(() => stringToByteStringArray('abc0d', 2)).to.throw('Byte String cannot be created because sizeInBytes: 2 is smaller than memoryContentHex: abc0d');
  });
});

describe('getMemoryDataLinesFromImmediateOperands', () => {
  const operandThird: ImmediateOperand = {
    value: -549766984,
    size: 8,
  };
  const operandSecond: ImmediateOperand = {
    value: 0,
    size: 8,
  };
  const operandFirst: ImmediateOperand = {
    value: 2345,
    size: 8,
  };
  const memoryLineThird: MemoryDataLine = {
    address: { address: '0002' },
    dataBytes: [
      {
        content: 'B8',
        locationId: 'immediate_2_0',
      },
      {
        content: '38',
        locationId: 'immediate_2_1',
      },
      {
        content: '3B',
        locationId: 'immediate_2_2',
      },
      {
        content: 'DF',
        locationId: 'immediate_2_3',
      },
      {
        content: '00',
        locationId: 'immediate_2_4',
      },
    ],
  };
  const memoryLineSecond: MemoryDataLine = {
    address: { address: '0001' },
    dataBytes: [
      {
        content: '00',
        locationId: 'immediate_1_0',
      },
    ],
  };
  const memoryLineFirst: MemoryDataLine = {
    address: { address: '0000' },
    dataBytes: [
      {
        content: '29',
        locationId: 'immediate_0_0',
      },
      {
        content: '09',
        locationId: 'immediate_0_1',
      },
    ],
  };

  it('succeeds if Array of size 0 created', () => {
    expect(getMemoryDataLinesFromImmediateOperands([])).to.eql([]);
  });
  it('succeeds if Array of size 1 created', () => {
    expect(getMemoryDataLinesFromImmediateOperands([operandFirst])).to.eql([memoryLineFirst]);
  });
  it('succeeds if Array of size 3 created', () => {
    expect(getMemoryDataLinesFromImmediateOperands([operandFirst, operandSecond, operandThird])).to.eql([memoryLineFirst, memoryLineSecond, memoryLineThird]);
  });
});

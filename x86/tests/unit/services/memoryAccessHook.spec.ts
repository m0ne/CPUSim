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
import Unicorn from '@/services/emulator/emulatorService';
import Disassembler from '@/services/disassembler/disassemblerService';
import StepController from '@/services/stepController';
import { MemoryHookInformation } from '@/services/interfaces/AccessedElements';
import { getMemoryLineFromWriteAccess } from '@/services/dataServices/memoryService';
import Byte from '@/services/interfaces/Byte';
import {
  closeEmulator,
  startMemoryAccessShortTestProgram,
  startMemoryAccessTestProgram, startMemoryWriteAccessWithSignedBytesTestProgram,
  stepOverOneInstruction,
} from './testEmulator';

describe('createDataStringFromHookValues', () => {
  const expectedBytes123: Array<Byte> = [
    {
      content: '7B',
      locationId: '0000',
    },
    {
      content: '00',
      locationId: '0001',
    },
    {
      content: '00',
      locationId: '0002',
    },
    {
      content: '00',
      locationId: '0003',
    },
    {
      content: '00',
      locationId: '0004',
    },
  ];

  const expectedBytesNegative: Array<Byte> = [
    {
      content: 'B8',
      locationId: '0005',
    },
    {
      content: '38',
      locationId: '0006',
    },
    {
      content: '3B',
      locationId: '0007',
    },
    {
      content: 'DF',
      locationId: '0008',
    },
    {
      content: 'B8',
      locationId: '0009',
    },
    {
      content: '38',
      locationId: '000A',
    },
    {
      content: '3B',
      locationId: '000B',
    },
    {
      content: 'DF',
      locationId: '000C',
    },
  ];

  it('succeeds if empty Array created', async () => {
    const hook: MemoryHookInformation = {
      addrLo: 0, addrHi: 0, size: 0, valueLo: 0, valueHi: 0,
    };
    expect(() => getMemoryLineFromWriteAccess(hook).dataBytes).to.throw('Byte String cannot be created because sizeInBytes: 0 is smaller than memoryContentHex: 0');
  });
  it('succeeds if array from negtative number created', async () => {
    const hook: MemoryHookInformation = {
      addrLo: 5, addrHi: 0, size: 8, valueLo: -549766984, valueHi: -549766984,
    };
    expect(getMemoryLineFromWriteAccess(hook).dataBytes).to.eql(expectedBytesNegative);
  });
  it('succeeds if array size 4 created', async () => {
    const hook: MemoryHookInformation = {
      addrLo: 0, addrHi: 0, size: 4, valueLo: 123, valueHi: 123,
    };
    expect(getMemoryLineFromWriteAccess(hook).dataBytes).to.eql(expectedBytes123.slice(0, 4));
  });
  it('succeeds if array size 5 created', async () => {
    const hook: MemoryHookInformation = {
      addrLo: 0, addrHi: 0, size: 5, valueLo: 123, valueHi: 0,
    };
    expect(getMemoryLineFromWriteAccess(hook).dataBytes).to.eql(expectedBytes123);
  });
  it('succeeds if array size 3 created', async () => {
    const hook: MemoryHookInformation = {
      addrLo: 0, addrHi: 0, size: 3, valueLo: 123, valueHi: 123,
    };
    expect(getMemoryLineFromWriteAccess(hook).dataBytes).to.eql(expectedBytes123.slice(0, 3));
  });
  it('succeeds if array size 6 created', async () => {
    const hook: MemoryHookInformation = {
      addrLo: 0, addrHi: 0, size: 6, valueLo: 0, valueHi: 123,
    };
    const expectedFirstByte: Byte = {
      content: '00',
      locationId: '0000',
    };
    const expectedLastBytes: Array<Byte> = [
      {
        content: '7B',
        locationId: '0004',
      },
      {
        content: '00',
        locationId: '0005',
      },
    ];
    expect(getMemoryLineFromWriteAccess(hook).dataBytes).to.eql([expectedFirstByte].concat(expectedBytes123.slice(1, 4), expectedLastBytes));
  });
});
describe('Memory Read Access', () => {
  const expectedMemLine = {
    address: { address: '0000' },
    dataBytes: [
      { content: '48', locationId: '0000' },
      { content: '8B', locationId: '0001' },
      { content: '04', locationId: '0002' },
      { content: '25', locationId: '0003' },
      { content: '00', locationId: '0004' },
      { content: '00', locationId: '0005' },
      { content: '00', locationId: '0006' },
      { content: '00', locationId: '0007' },
    ],
  };

  it('succeeds if memory read', async () => {
    const ucInstance = new Unicorn();
    const disassemblerInstance = new Disassembler();

    await startMemoryAccessTestProgram(ucInstance, disassemblerInstance).then(async (program) => {
      const testController = new StepController(program);
      await testController.nextStep();
      const accessedElements = testController.getState().currentAccessedElements;
      expect(accessedElements.memoryReadAccess).to.eql([expectedMemLine]);
      closeEmulator(program);
    });
  });
  it('succeeds if memory write', async () => {
    const ucInstance = new Unicorn();
    const disassemblerInstance = new Disassembler();

    await startMemoryAccessTestProgram(ucInstance, disassemblerInstance).then(async (program) => {
      const testController = new StepController(program);
      await stepOverOneInstruction(testController);
      await testController.nextStep();
      const accessedElements = testController.getState().currentAccessedElements;
      expect(accessedElements.memoryWriteAccess).to.eql([expectedMemLine]);
      expect(accessedElements.memoryReadAccess).to.eql([]);
      closeEmulator(program);
    });
  });
});

describe('Memory Read Access Short', () => {
  const expectedMemLine = {
    address: { address: '0000' },
    dataBytes: [
      { content: '66', locationId: '0000' },
      { content: '8B', locationId: '0001' },
    ],
  };

  it('succeeds if memory read', async () => {
    const ucInstance = new Unicorn();
    const disassemblerInstance = new Disassembler();

    await startMemoryAccessShortTestProgram(ucInstance, disassemblerInstance).then(async (program) => {
      const testController = new StepController(program);
      await testController.nextStep();
      const accessedElements = testController.getState().currentAccessedElements;
      expect(accessedElements.memoryReadAccess).to.eql([expectedMemLine]);
      closeEmulator(program);
    });
  });
  it('succeeds if memory write', async () => {
    const ucInstance = new Unicorn();
    const disassemblerInstance = new Disassembler();

    await startMemoryAccessShortTestProgram(ucInstance, disassemblerInstance).then(async (program) => {
      const testController = new StepController(program);
      await stepOverOneInstruction(testController);
      await testController.nextStep();
      const accessedElements = testController.getState().currentAccessedElements;
      expect(accessedElements.memoryWriteAccess).to.eql([expectedMemLine]);
      expect(accessedElements.memoryReadAccess).to.eql([]);
      closeEmulator(program);
    });
  });
});

describe('Memory Write Access with Overflow', () => {
  const expectedMemLineOverflow = {
    address: { address: '000A' },
    dataBytes: [
      { content: 'B8', locationId: '000A' },
      { content: '38', locationId: '000B' },
      { content: '3B', locationId: '000C' },
      { content: 'DF', locationId: '000D' },
      { content: '00', locationId: '000E' },
      { content: '00', locationId: '000F' },
      { content: '00', locationId: '0010' },
      { content: '00', locationId: '0011' },
    ],
  };
  it('succeeds if memory write with overflow', async () => {
    const ucInstance = new Unicorn();
    const disassemblerInstance = new Disassembler();

    await startMemoryWriteAccessWithSignedBytesTestProgram(ucInstance, disassemblerInstance).then(async (program) => {
      const testController = new StepController(program);
      await testController.nextStep();
      const accessedElements = testController.getState().currentAccessedElements;
      expect(accessedElements.memoryWriteAccess).to.eql([expectedMemLineOverflow]);
      expect(accessedElements.memoryReadAccess).to.eql([]);
      closeEmulator(program);
    });
  });
});

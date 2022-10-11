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
import { RegisterID } from '@/services/emulator/emulatorEnums';
import dataStringsToBytes from '@/services/dataServices/byteService';
import { FlagID } from '@/services/interfaces/Flag';
import { getFlagIdFromName, getRegisterIdFromName } from '@/services/dataServices/registerService';

describe('Create Bytes from register data string', () => {
  it('succeeds if bytes for register RAX created', () => {
    const testDataString = ['FF', '0A', '00', 'AB', '01', '23', '00', 'FF'];
    const expectedBytes: Array<Byte> = [
      { content: 'FF', locationId: 'RAX_0' },
      { content: '0A', locationId: 'RAX_1' },
      { content: '00', locationId: 'RAX_2' },
      { content: 'AB', locationId: 'RAX_3' },
      { content: '01', locationId: 'RAX_4' },
      { content: '23', locationId: 'RAX_5' },
      { content: '00', locationId: 'RAX_6' },
      { content: 'FF', locationId: 'RAX_7' },
    ];
    const result = dataStringsToBytes(testDataString, 0, RegisterID[RegisterID.RAX]);
    expect(result).to.eql(expectedBytes);
  });
  it('succeeds if bytes for register AL created', () => {
    const testDataString = ['FF', '0A'];
    const expectedBytes: Array<Byte> = [
      { content: 'FF', locationId: 'AL_0' },
      { content: '0A', locationId: 'AL_1' },
    ];
    const result = dataStringsToBytes(testDataString, 0, RegisterID[RegisterID.AL]);
    expect(result).to.eql(expectedBytes);
  });
});

describe('Get Register/Flag ID from name', () => {
  it('succeeds if Flag ID found', () => {
    expect(getFlagIdFromName('CF')).to.eql(FlagID.CF);
  });
  it('succeeds if Register ID found', () => {
    expect(getRegisterIdFromName('RAX')).to.eql(RegisterID.RAX);
  });
  it('does not throw if Flag ID not found', () => {
    expect(getFlagIdFromName('XY')).to.eql(undefined);
  });
  it('does not throw if Register ID not found', () => {
    expect(getRegisterIdFromName('XY')).to.eql(undefined);
  });
});

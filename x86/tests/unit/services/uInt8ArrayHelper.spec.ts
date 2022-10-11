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
import uInt8ArrayToHexStringArray from '@/services/helper/uInt8ArrayHelper';

describe('create string array from Uint8Array', () => {
  it('succeeds if string array created with 2 digits hex values', () => {
    const testUInt8Array = Uint8Array.from([0, 10, 3, 52, 171, 255, 58]);
    const expectedHexString = ['00', '0A', '03', '34', 'AB', 'FF', '3A'];
    const result = uInt8ArrayToHexStringArray(testUInt8Array);
    expect(result).to.eql(expectedHexString);
  });
  it('succeeds if throws invalid elements error', () => {
    expect(() => uInt8ArrayToHexStringArray(Uint8Array.from([]))).to.throw('Uint8Array is empty.');
  });
});
